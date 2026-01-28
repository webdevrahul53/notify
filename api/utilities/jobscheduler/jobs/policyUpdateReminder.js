import { mailConfig } from "../../../configs/mailConfig.js";
import { genPolicyUpdateMailnotif } from "../../mailing/policyUpdateNotifTemplate.js";

export const sendPolicyUpdateMail = async (policy, subject) => {
    if (!policy.createdby) return;

    try {
        const htmlContent = await genPolicyUpdateMailnotif(policy);
        const mailResponse = await mailConfig([policy.createdby?.acc_eml], [], [], subject, htmlContent);
        if (mailResponse) {
            console.log(`📧 Mail sent to ${policy.createdby?.acc_eml} for policy ${policy.policyNo}`);
            return { message: `✅ Mail Notification Sent successfully.`, response: mailResponse };
        }
    } catch (err) {
        console.error(`Failed to send mail to ${policy.createdby?.acc_eml} for policy ${policy.policyNo}:`, err);
    }
};

// export const definePolicyExpiryReminderJob = (agenda) => {
//   agenda.define("send policy expiry reminder", async (job) => {
//     const { policy, daysLeft } = job.attrs.data;
//     console.log(`📧 Sending reminder to ${policy.recp_dtl.email}`);
//     try {
//       await sendMail(policy, `Policy Update Notification`);
//       console.log(`✅ Reminder sent to ${policy.recp_dtl.email}`);
//     } catch (err) {
//       console.error(`Error sending reminder to ${policy.recp_dtl.email}:`, err);
//     }
//   });
// };
