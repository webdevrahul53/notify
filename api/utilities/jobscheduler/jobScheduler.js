import { initAgenda } from "../../config/agendaConfig.js";
import Account from "../../model/account.js";
import Birthday from "../../model/birthday.js";
import Event from "../../model/event.js";
import moment from "moment-timezone";
import { defineEventMailJob } from "./jobs/eventMailNotifJob.js";
import { defineDobMailJob } from "./jobs/dobMailNotifJob.js";

/* ------------------------------------------------------------------ */
/* CONFIG */
/* ------------------------------------------------------------------ */

const TIMEZONE = "Asia/Kolkata";

const DEFAULT_REFRESH_MS = process.env.REMINDER_REFRESH_INTERVAL_MS
  ? parseInt(process.env.REMINDER_REFRESH_INTERVAL_MS, 10)
  : 60 * 1000;

const DOB_HOUR = Number(process.env.DOB_SCHEDULE_HOUR ?? 9);
const DOB_MINUTE = Number(process.env.DOB_SCHEDULE_MINUTE ?? 0);

const EVENT_HOUR = Number(process.env.EVENT_SCHEDULE_HOUR ?? 9);
const EVENT_MINUTE = Number(process.env.EVENT_SCHEDULE_MINUTE ?? 0);

/* ------------------------------------------------------------------ */
/* DATA FETCHERS */
/* ------------------------------------------------------------------ */

export const getDobDetails = async (req, res) => {
  try {
    const today = moment();

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

    if (!dobAccounts || dobAccounts?.length === 0) return []

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
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    
    const pipeline = [
      { $match: { scheduleDate: { $gte: startOfDay, $lte: endOfDay }, status: true } },
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
      {
        $project: {
          activityId: 0,
          "activity.createdAt": 0,
          "activity.updatedAt": 0,
          "activity.__v": 0,
          accountId: 0,
          __v: 0
        }
      },
      { $sort: { scheduleDate: 1 } }
    ]
    const events = await Event.aggregate(pipeline);
    // res.status(200).json({ data: events })
    return events;
  } catch (error) {
    console.error(error.message)
  }
}

/* ------------------------------------------------------------------ */
/* DOB SCHEDULER (ONE-TIME PER DAY) */
/* ------------------------------------------------------------------ */

const scheduleDobRecords = async (agenda, dobRecords) => {
  const now = moment.tz(TIMEZONE);

  for (const dob of dobRecords) {
    const jobKey = `DOB-${now.format("YYYY-MM-DD")}`;

    let scheduleAt = moment
      .tz(dob.scheduleDate, "DD-MM-YYYY", TIMEZONE)
      .set({ hour: DOB_HOUR, minute: DOB_MINUTE, second: 0, millisecond: 0 });

    if (scheduleAt.isBefore(now)) {
      // Missed time → run in 1 minute
      scheduleAt = now.clone().add(1, "minute");
    }

    console.log(`🎂 DOB scheduled at ${scheduleAt.format("DD-MM-YYYY HH:mm:ss")}`);
    if (scheduleAt.isAfter(now)) {
      await agenda.schedule(
        scheduleAt.toDate(),
        "send dob notification",
        { dob, jobKey },
        { unique: { "data.jobKey": jobKey } }
      );
    }
  }
};

/* ------------------------------------------------------------------ */
/* EVENT SCHEDULER (REFRESHABLE) */
/* ------------------------------------------------------------------ */

const scheduleEventRecords = async (agenda, eventRecords) => {
  const now = moment.tz(TIMEZONE);

  for (const event of eventRecords) {
    const scheduleAt = moment(event.scheduleDate)
      .tz(TIMEZONE)
      .set({ hour: EVENT_HOUR, minute: EVENT_MINUTE, second: 0, millisecond: 0 });

    if (!scheduleAt.isAfter(now)) continue;

    const jobKey = `EVENT-${event._id}-${scheduleAt.format("YYYY-MM-DD")}`;

    const job = agenda.create(
      "send event notification",
      { event, jobKey }
    );

    job.unique(
      { "data.jobKey": jobKey },
      { insertOnly: true } // 🚨 THIS is the fix
    );

    job.schedule(scheduleAt.toDate());

    await job.save();

    console.log(`🕓 Event scheduled at ${scheduleAt.format("DD-MM-YYYY HH:mm:ss")}`);
  }
};

/* ------------------------------------------------------------------ */
/* MAIN BOOTSTRAP */
/* ------------------------------------------------------------------ */

export const setupJobs = async () => {
  const agenda = await initAgenda();

  // console.log(agenda);

  defineDobMailJob(agenda);
  defineEventMailJob(agenda);

  // await agenda.start();

  // 🔹 Initial run
  await scheduleDobRecords(agenda, await getDobDetails());
  await scheduleEventRecords(agenda, await getEventDetails());

  console.log("✅ Agenda initialized");

  // 🔁 Event refresh ONLY
  setInterval(async () => {
    try {
      await scheduleEventRecords(agenda, await getEventDetails());
      console.log("🔁 Event scheduler refreshed");
    } catch (err) {
      console.error("Scheduler refresh error:", err);
    }
  }, DEFAULT_REFRESH_MS);
};
