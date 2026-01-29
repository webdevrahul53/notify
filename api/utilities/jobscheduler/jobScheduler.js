import { initAgenda } from "../../config/agendaConfig.js";
import Account from "../../model/account.js";
import Event from "../../model/event.js";
import { defineEventMailJob } from "./jobs/eventMailNotifJob.js";
import moment from "moment";

const DEFAULT_REFRESH_MS = process.env.REMINDER_REFRESH_INTERVAL_MS
  ? parseInt(process.env.REMINDER_REFRESH_INTERVAL_MS, 10)
  : 60 * 1000; // 10 seconds

const SCHEDULE_HOUR = process.env.REMINDER_SCHEDULE_HOUR
  ? parseInt(process.env.REMINDER_SCHEDULE_HOUR, 10)
  : 9; // 9 AM

const SCHEDULE_MINUTE = process.env.REMINDER_SCHEDULE_MINUTE
  ? parseInt(process.env.REMINDER_SCHEDULE_MINUTE, 10)
  : 0; // 00 Minutes


// define all job details --------------------------------------------------------------------------------
export const getDobDetails = async (req, res) => {
  try {
    const today = moment().format("DD-MM");
    // console.log(today);
    const accounts = await Account.find().lean();
    const dobAccounts = accounts.filter(acc => {
      if(!acc.dateOfBirth) return false;
      const dobMoment = moment(acc.dateOfBirth, "DD-MM-YYYY");
      return dobMoment.isValid() && dobMoment.format("DD-MM") === today;
    }).map(acc => ({
      _id: acc._id,
      name: acc.accountName,
      email: acc.accountEmail,
      dateOfBirth: moment(acc.dateOfBirth, "DD-MM-YYYY").format("DD-MM-YYYY"),
    }));
    // res.status(200).json({ data: dobAccounts })
    return accounts;
  } catch (error) {
    console.error(error.message)
  }
}
export const getEventDetails = async (req, res) => {
  try {
    const today = new Date();
    // console.log(today);
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    const pipeline = [
      { $match: { scheduleDate: { $gte: startOfDay, $lt: endOfDay } }},
      { $lookup: { from: "activities", localField: "activityId", foreignField: "_id", as: "activity" } },
      { $unwind: { path: "$activity", preserveNullAndEmptyArrays: true } },
      { $addFields: {
        activity: { _id: "$activity._id", activityName: "$activity.activityName", status: "$activity.status" }
      } },
      { $lookup: { from: "accounts", localField: "accountId", foreignField: "_id", as: "accounts" } },
      { $addFields: {
        accounts: {
          $map: {
            input: "$accounts",
            as: "acc",
            in: { _id: "$$acc._id", name: "$$acc.accountName", email: "$$acc.accountEmail", status: "$$acc.status" }
          }
        }
      } },
      { $lookup: { from: "uploads.files", localField: "contentImage", foreignField: "_id", as: "contentImage"  } },
      { $unwind: { path: "$contentImage", preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: 1 } },
      { $project: {
        activityId: 0, 
        "activity.createdAt": 0,
        "activity.updatedAt": 0,
        "activity.__v": 0,
        accountId: 0,
        __v: 0
      } }
    ]
    const events = await Event.aggregate(pipeline);
    // res.status(200).json({ data: events })
    return events;
  } catch (error) {
    console.error(error.message)
  }
}

// scheduling all events ---------------------------------------------------------------------------------
const scheduleEventRecords = async (agenda, eventRecords) => {
  if (!eventRecords || !eventRecords.length) return;
  const now = moment.tz("Asia/Kolkata");

  for (const event of eventRecords) {
    if (!event?.scheduleDate) continue;
    
    // 🔹 Define scheduled time (customizable)
    const hour = SCHEDULE_HOUR || 0;   // default 00
    const minute = SCHEDULE_MINUTE || 0; // default 00

    // 🔹 Build scheduled datetime
    const scheduleAt = moment.tz(event.scheduleDate, "Asia/Kolkata").set({ hour, minute, second: 0, millisecond: 0 });

    // const eventDate = moment(event.scheduleDate);
    if (!scheduleAt.isValid()) continue;

    // 🔹 Schedule only if time is in future
    if (scheduleAt.isAfter(now)) {
      await agenda.schedule(scheduleAt.toDate(), "send notification", { eventId: event._id });
      console.log(`🕓 Scheduled event mail at ${scheduleAt.format("DD-MM-YYYY HH:mm:ss")}`);
    }
  }
};


// map jobs with scheduler -------------------------------------------------------------------------------
export const setupJobs = async () => {
  const agenda = await initAgenda();
  defineEventMailJob(agenda);

  try {
    // event notification
    await agenda.cancel({ name: "send event notification" }); // clear existing jobs
    const eventRecords = await getEventDetails();
    await scheduleEventRecords(agenda, eventRecords);

    console.log("✅ Initial Agenda jobs scheduled");
  } catch (err) {
    console.error("Error scheduling initial jobs:", err);
  }

  // Periodic refresh — will cancel and re-schedule updated expiry jobs
  setInterval(async () => {
    try {
      console.log("🔁 Refreshing scheduled jobs...");

      // event notification
      await agenda.cancel({ name: "send event notification" });
      const eventRecords = await getEventDetails();
      await scheduleEventRecords(agenda, eventRecords);

      console.log("✅ Reminder jobs refreshed successfully");
    } catch (err) {
      console.error("Error refreshing reminder jobs:", err);
    }
  }, DEFAULT_REFRESH_MS);
};
