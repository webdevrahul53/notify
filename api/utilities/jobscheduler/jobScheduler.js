import { initAgenda } from "../../configs/agendaConfig.js";
import Account from "../../model/account.js";
import Event from "../../model/event.js";
// import { getAllPolicyDetails } from "../../controllers/insurancemodules/polcyopController.js";
// import { definePolicyExpiryReminderJob } from "./jobs/policyExpiryReminderJob.js";
// import { definePolicyInstallmentReminderJob } from "./jobs/policyInstallmentReminderJob.js";
import moment from "moment";

const DEFAULT_REFRESH_MS = process.env.REMINDER_REFRESH_INTERVAL_MS
  ? parseInt(process.env.REMINDER_REFRESH_INTERVAL_MS, 10)
  : 60 * 1000; // 10 seconds

// export const getPolicyExipryMailDetails = async () => {
//   try {
//     const polcyopRecords = await getAllPolicyDetails();

//     const expiryRecipientDtls = polcyopRecords
//       ?.map((elm) => {
//         if (elm.expiryDate && elm.createdby?.acc_eml)
//           return {
//             policyNo: elm.policyNo || "",
//             recp_dtl: {
//               username: elm.createdby?.acc_uname || "",
//               name: elm.createdby?.acc_fname || "",
//               email: elm.createdby?.acc_eml || "",
//             },
//             expiryDate: elm.expiryDate || "",
//           };
//       })
//       ?.filter((elm) => elm);

//     return expiryRecipientDtls;
//     // res.status(200).json({ data: expiryRecipientDtls })
//   } catch (error) {
//     console.error("Error retrieving Policy details:", error);
//     return [];
//   }
// };
export const getDobDetails = async () => {
  try {
    const today = moment().format("MM-DD-YYYY");
    const accounts = await Account.find({dateOfBirth: today}).lean();
    return accounts;
  } catch (error) {
    console.error(error.message)
  }
}
export const getEventDetails = async () => {
  try {
    const today = moment().format("MM-DD-YYYY");
    const pipeline = [
      ...(moment.isDate(today) ? [{ $match: { scheduleDate: today }}] : []),
      { $lookup: { from: "activities", localField: "activityId", foreignField: "_id", as: "activity" } },
      { $unwind: { path: "$activity", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "accounts", localField: "accountId", foreignField: "_id", as: "accounts" } },
      { $unwind: { path: "$accounts", preserveNullAndEmptyArrays: true } },
      { $addFields: { activityName: "$activity.activityName" } },
      { $sort: { createdAt: 1 } },
      { $project: { _v: 0 } }
    ]
    const events = await Event.aggregate(pipeline);
    return events;
  } catch (error) {
    console.error(error.message)
  }
}

// export const getPolicyInstallmentMailDetails = async () => {
//   try {
//     const polcyopRecords = await getAllPolicyDetails();
//     const installmentRecipientDtls = [];

//     polcyopRecords?.forEach((elm) => {
//       if (elm.installmentDetails?.length && elm.createdby?.acc_eml) {
//         installmentRecipientDtls.push(elm.installmentDetails?.map((inst) => ({
//           policyNo: elm.policyNo || "",
//           premiumType: elm.premiumType || "",
//           premiumAmount: elm.premiumAmount || "",
//           gstAmount: elm.gstAmount || "",
//           netPremiumAmount: elm.netPremiumAmount || "",
//           installmentFieldName: inst.installmentFieldName,
//           installmentAmount: inst.installmentAmount,
//           installmentGst: inst.installmentGst,
//           installmentDate: inst.installmentDate,
//           installmentNote: inst.installmentNote,
//           recp_dtl: {
//             username: elm.createdby?.acc_uname || "",
//             name: elm.createdby?.acc_fname || "",
//             email: elm.createdby?.acc_eml || "",
//           },
//         })))
//       }
//     })
//     const installmentRecipientData = installmentRecipientDtls?.flat()

//     return installmentRecipientData;
//     // res.status(200).json({ data: installmentRecipientData })
//   } catch (error) {
//     console.error("Error retrieving Policy details:", error);
//     return [];
//   }
// };


const scheduleExpiryRecords = async (agenda, policyRecords) => {
  if (!policyRecords || !policyRecords.length) return;

  const now = moment();

  for (const policy of policyRecords) {
    const expiryDate = moment(policy.expiryDate, "DD-MM-YYYY HH:mm:ss");
    if (!expiryDate.isValid()) continue;

    const daysBeforeArr = [3, 7, 15, 30, 45].sort((a, b) => (b-a)); // or [7, 3, 1] as needed as descending order
    for (const daysLeft of daysBeforeArr) {
      const reminderDt = expiryDate.clone().subtract(daysLeft, "days");
      if (reminderDt.isAfter(now)) {
        // Only schedule if reminder date is in the future
        await agenda.schedule(reminderDt.toDate(), "send policy expiry reminder", {
          policy,
          daysLeft,
        });
        console.log(`🕓 Scheduled Expiry related mail for ${policy.recp_dtl.email} at ${reminderDt.format("DD-MM-YYYY HH:mm:ss")}`);
      }
    }
  }
};

const scheduleInstallmentRecords = async (agenda, policyRecords) => {
  if (!policyRecords || !policyRecords.length) return;

  const now = moment();

  for (const policy of policyRecords) {
    const installmentDate = moment(policy.installmentDate, "DD-MM-YYYY HH:mm:ss");
    if (!installmentDate.isValid()) continue;

    const daysBeforeArr = [3, 7, 15, 30].sort((a, b) => (b-a)); // or [7, 1] as needed as descending order
    for (const daysLeft of daysBeforeArr) {
      const reminderDt = installmentDate.clone().subtract(daysLeft, "days");
      if (reminderDt.isAfter(now)) {
        // Only schedule if reminder date is in the future
        await agenda.schedule(reminderDt.toDate(), "send policy expiry reminder", {
          policy,
          daysLeft,
        });
        console.log(`🕓 Scheduled Installment related mail for ${policy.recp_dtl.email} at ${reminderDt.format("DD-MM-YYYY HH:mm:ss")}`);
      }
    }
  }
};


export const setupJobs = async () => {
  const agenda = await initAgenda();
  definePolicyExpiryReminderJob(agenda);
  definePolicyInstallmentReminderJob(agenda);

  try {
    // expiry notification
    await agenda.cancel({ name: "send policy expiry reminder" }); // clear existing jobs
    const policyExpiryRecords = await getPolicyExipryMailDetails();
    await scheduleExpiryRecords(agenda, policyExpiryRecords);

    // installment notification
    await agenda.cancel({ name: "send policy installment reminder" }); // clear existing jobs
    const policyInstallmentRecords = await getPolicyInstallmentMailDetails();
    await scheduleInstallmentRecords(agenda, policyInstallmentRecords);

    console.log("✅ Initial Agenda jobs scheduled");
  } catch (err) {
    console.error("Error scheduling initial jobs:", err);
  }

  // Periodic refresh — will cancel and re-schedule updated expiry jobs
  setInterval(async () => {
    try {
      console.log("🔁 Refreshing scheduled jobs...");

      // expiry notification
      await agenda.cancel({ name: "send policy expiry reminder" });
      const policyExpiryRecords = await getPolicyExipryMailDetails();
      await scheduleExpiryRecords(agenda, policyExpiryRecords);

      // installment notification
      await agenda.cancel({ name: "send policy installment reminder" });
      const policyInstallmentRecords = await getPolicyInstallmentMailDetails();
      await scheduleInstallmentRecords(agenda, policyInstallmentRecords);

      console.log("✅ Reminder jobs refreshed successfully");
    } catch (err) {
      console.error("Error refreshing reminder jobs:", err);
    }
  }, DEFAULT_REFRESH_MS);
};
