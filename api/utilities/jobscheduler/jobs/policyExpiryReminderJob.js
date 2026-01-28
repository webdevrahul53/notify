import { mailConfig } from "../../../configs/mailConfig.js";
import { genPolicyExpiryMailnotif } from "../../mailing/policyExpiryNotifTemplate.js";

export const sendPolicyExpiryMail = async (policy, daysLeft, subject) => {
    if (!policy.recp_dtl) return;

    try {
        const htmlContent = await genPolicyExpiryMailnotif(policy, daysLeft);
        const mailResponse = await mailConfig([policy.recp_dtl.email], [], [], subject, htmlContent);
        if (mailResponse) {
            console.log(`📧 Mail sent to ${policy.recp_dtl.email} for policy ${policy.policyNo}`);
            return { message: `✅ Mail Notification Sent successfully.`, response: mailResponse };
        }
    } catch (err) {
        console.error(`Failed to send mail to ${policy.recp_dtl.email} for policy ${policy.policyNo}:`, err);
    }
};

export const definePolicyExpiryReminderJob = (agenda) => {
  agenda.define("send policy expiry reminder", async (job) => {
    const { policy, daysLeft } = job.attrs.data;
    console.log(`📧 Sending reminder to ${policy.recp_dtl.email}`);
    try {
      await sendPolicyExpiryMail(policy, daysLeft, `Policy Expiry Notification`);
      console.log(`✅ Reminder sent to ${policy.recp_dtl.email}`);
    } catch (err) {
      console.error(`Error sending reminder to ${policy.recp_dtl.email}:`, err);
    }
  });
};
