import { sendEventMail } from "../../mailing/sendEventMail.js";

export const defineEventMailJob = (agenda) => {
    try {
        agenda.define("send event notification", async job => {
            console.log("Sending event notification", job.attrs.data);
            const { event } = job.attrs.data;
            await sendEventMail(event);
            console.log(`✅ Reminder sent to All Recipients for event ${event?.activity?.activityName}`);
        });
    } catch (error) {
        console.error(error)
    }
}
