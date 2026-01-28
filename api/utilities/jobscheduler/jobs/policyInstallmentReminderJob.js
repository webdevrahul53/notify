import { mailConfig } from "../../../configs/mailConfig.js";
import { genPolicyInstallmentMailnotif } from "../../mailing/policyInstallmentNotifTemplate.js";

export const sendPolicyInstallmentMail = async (policy, daysLeft, subject) => {
    if (!policy.recp_dtl) return;

    try {
        const htmlContent = await genPolicyInstallmentMailnotif(policy, daysLeft);
        const mailResponse = await mailConfig([policy.recp_dtl.email], [], [], subject, htmlContent);
        if (mailResponse) {
            console.log(`📧 Mail sent to ${policy.recp_dtl.email} for policy ${policy.policyNo}`);
            return { message: `✅ Mail Notification Sent successfully.`, response: mailResponse };
        }
    } catch (err) {
        console.error(`Failed to send mail to ${policy.recp_dtl.email} for policy ${policy.policyNo}:`, err);
    }
};

export const definePolicyInstallmentReminderJob = (agenda) => {
  agenda.define("send policy installment reminder", async (job) => {
    const { policy, daysLeft } = job.attrs.data;
    console.log(`📧 Sending reminder to ${policy.recp_dtl.email}`);
    try {
      await sendPolicyInstallmentMail(policy, daysLeft, `Policy Installment Notification`);
      console.log(`✅ Reminder sent to ${policy.recp_dtl.email}`);
    } catch (err) {
      console.error(`Error sending reminder to ${policy.recp_dtl.email}:`, err);
    }
  });
};
