import { sendMailNotif } from "../../mailing/sendMailNotif.js";
import { genEventnotif } from "../../mailing/mailtemplate/eventNotifTemplate.js";

export const emailInfo = async (event) => {
    try {
        const htmlContent = await genEventnotif(event);
        const mailResponse = await sendMailNotif(event, htmlContent);
        return { message: `✅ Mail Notification Sent successfully.`, response: mailResponse };
    } catch (error) {
        console.error(error?.message)
    }
}

export const defineEventMailJob = (agenda) => {
    try {
        agenda.define("send event notification", async job => {
            // console.log("Sending event notification", job.attrs.data);
            const { event } = job.attrs.data;
            console.log(`Event schedule date: ${event?.scheduleDate}`);
            await emailInfo(event);
            console.log(`✅ Reminder sent to All Recipients for event ${event?.activity?.activityName}`);
        });
    } catch (error) {
        console.error(error)
    }
}
