import { initAgenda } from "../../config/agendaConfig.js";
import Account from "../../model/account.js";
import Birthday from "../../model/birthday.js";
import Event from "../../model/event.js";
import moment from "moment";
import { defineEventMailJob } from "./jobs/eventMailNotifJob.js";
import { defineDobMailJob } from "./jobs/dobMailNotifJob.js";

const DEFAULT_REFRESH_MS = process.env.REMINDER_REFRESH_INTERVAL_MS
  ? parseInt(process.env.REMINDER_REFRESH_INTERVAL_MS, 10)
  : 60 * 1000; // 10 seconds

// DOB Schedule Time Configs
const DOB_HOUR = process.env.DOB_SCHEDULE_HOUR
  ? parseInt(process.env.DOB_SCHEDULE_HOUR, 10)
  : 9;
const DOB_MINUTE = process.env.DOB_SCHEDULE_MINUTE
  ? parseInt(process.env.DOB_SCHEDULE_MINUTE, 10)
  : 0;

// Event Schedule Time Configs
const EVENT_HOUR = process.env.EVENT_SCHEDULE_HOUR
  ? parseInt(process.env.EVENT_SCHEDULE_HOUR, 10)
  : 9; // 9 AM
const EVENT_MINUTE = process.env.EVENT_SCHEDULE_MINUTE
  ? parseInt(process.env.EVENT_SCHEDULE_MINUTE, 10)
  : 0; // 00 Minutes


// define all job details --------------------------------------------------------------------------------
export const getDobDetails = async (req, res) => {
  try {
    const today = moment();
    // console.log(today);
    const accounts = await Account.find({ status: true }).lean();
    const dobAccounts = accounts.filter(acc => {
      if (!acc.dateOfBirth) return false;
      const dobMoment = moment(acc.dateOfBirth, "DD-MM-YYYY");
      return dobMoment.isValid() && dobMoment.format("DD-MM") === today.format("DD-MM");
    }).map(acc => ({
      _id: acc._id,
      name: acc.accountName,
      email: acc.accountEmail,
      dateOfBirth: moment(acc.dateOfBirth, "DD-MM-YYYY").format("DD-MM-YYYY"),
    }));

    const dobPipeline = [
      { $match: { isLatest: true, status: true } },
      { $lookup: { from: "uploads.files", localField: "contentImage", foreignField: "_id", as: "contentImage" } },
      { $unwind: { path: "$contentImage", preserveNullAndEmptyArrays: true } },
      { $project: { __v: 0, createdAt: 0, updatedAt: 0 } }
    ];
    const dobContent = await Birthday.aggregate(dobPipeline);

    const dobInfo = Array.of({ ...dobContent[0], scheduleDate: today.format("DD-MM-YYYY"), accounts: dobAccounts })
    // res.status(200).json({ data: dobInfo })
    return dobInfo;
  } catch (error) {
    console.error(error.message)
  }
}
export const getEventDetails = async (req, res) => {
  try {
    const now = new Date();
    // console.log(now);
    // const startOfDay = new Date(now);
    // startOfDay.setHours(0, 0, 0, 0);

    // const endOfDay = new Date(now);
    // endOfDay.setHours(23, 59, 59, 999);
    const pipeline = [
      { $match: { scheduleDate: { $gte: now }, status: true } },
      { $lookup: { from: "activities", localField: "activityId", foreignField: "_id", as: "activity" } },
      { $unwind: { path: "$activity", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          activity: { _id: "$activity._id", activityName: "$activity.activityName", status: "$activity.status" }
        }
      },
      { $lookup: { from: "accounts", localField: "accountId", foreignField: "_id", as: "accounts" } },
      {
        $addFields: {
          accounts: {
            $map: {
              input: "$accounts",
              as: "acc",
              in: { _id: "$$acc._id", name: "$$acc.accountName", email: "$$acc.accountEmail", status: "$$acc.status" }
            }
          }
        }
      },
      { $lookup: { from: "uploads.files", localField: "contentImage", foreignField: "_id", as: "contentImage" } },
      { $unwind: { path: "$contentImage", preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: 1 } },
      {
        $project: {
          activityId: 0,
          "activity.createdAt": 0,
          "activity.updatedAt": 0,
          "activity.__v": 0,
          accountId: 0,
          __v: 0
        }
      }
    ]
    const events = await Event.aggregate(pipeline);
    // res.status(200).json({ data: events })
    return events;
  } catch (error) {
    console.error(error.message)
  }
}

// scheduling all events ---------------------------------------------------------------------------------
const scheduleDobRecords = async (agenda, dobRecords) => {
  if (!dobRecords || !dobRecords.length) return;
  const now = moment.tz("Asia/Kolkata");

  for (const dob of dobRecords) {
    if (!dob?.scheduleDate) continue;

    // 🔹 Define scheduled time (customizable)
    const hour = DOB_HOUR || 0;   // default 00
    const minute = DOB_MINUTE || 0; // default 00

    // 🔹 Build DOB for current year
    let scheduleAt = moment
      .tz(dob.scheduleDate, "DD-MM-YYYY", "Asia/Kolkata")
      .year(now.year())
      .set({ hour, minute, second: 0, millisecond: 0 });

    // const eventDate = moment(event.scheduleDate);
    if (!scheduleAt.isValid()) continue;

    // 🔹 If DOB time already passed → move to next year
    if (scheduleAt.isSameOrBefore(now)) {
      scheduleAt.add(1, "year");
    }

    // 🔹 Schedule safely
    await agenda.schedule(
      scheduleAt.toDate(),
      "send dob notification",
      { dob },
      { unique: { "data.dob._id": dob._id } }
    );
    console.log('Scheduler scheduled for dob:', dob.subject);
    console.log(`🎂 DOB Scheduled at ${scheduleAt.format("DD-MM-YYYY HH:mm:ss")}`);
  }
};
const scheduleEventRecords = async (agenda, eventRecords) => {
  if (!eventRecords || !eventRecords.length) return;
  const now = moment.tz("Asia/Kolkata");

  for (const event of eventRecords) {
    if (!event?.scheduleDate) continue;

    // 🔹 Define scheduled time (customizable)
    const hour = EVENT_HOUR || 0;   // default 00
    const minute = EVENT_MINUTE || 0; // default 00

    // 🔹 Build scheduled datetime
    const scheduleAt = moment.tz(event.scheduleDate, "Asia/Kolkata").set({ hour, minute, second: 0, millisecond: 0 });

    // const eventDate = moment(event.scheduleDate);
    if (!scheduleAt.isValid()) continue;

    // 🔹 Schedule only if time is in future
    if (scheduleAt.isAfter(now)) {
      await agenda.schedule(
        scheduleAt.toDate(),
        "send event notification",
        { event },
        { unique: { "data.event._id": event._id } }
      );
      console.log('Scheduler scheduled for event:', event.subject);
      console.log(`🕓 EVENT Scheduled at ${scheduleAt.format("DD-MM-YYYY HH:mm:ss")}`);
    }
  }
};


// map jobs with scheduler -------------------------------------------------------------------------------
export const setupJobs = async () => {
  const agenda = await initAgenda();
  defineDobMailJob(agenda);
  defineEventMailJob(agenda);

  try {
    // dob notification
    // await agenda.cancel({ name: "send dob notification" });
    const dobRecords = await getDobDetails();
    await scheduleDobRecords(agenda, dobRecords);

    // event notification
    // await agenda.cancel({ name: "send event notification" });
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

      // dob notification
      // await agenda.cancel({ name: "send dob notification" });
      const dobRecords = await getDobDetails();
      await scheduleDobRecords(agenda, dobRecords);

      // event notification
      // await agenda.cancel({ name: "send event notification" });
      const eventRecords = await getEventDetails();
      await scheduleEventRecords(agenda, eventRecords);

      console.log('Scheduler running...');

      console.log("✅ Reminder jobs refreshed successfully");
    } catch (err) {
      console.error("Error refreshing reminder jobs:", err);
    }
  }, DEFAULT_REFRESH_MS);
};
