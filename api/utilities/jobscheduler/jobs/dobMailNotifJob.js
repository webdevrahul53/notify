import { sendMailNotif } from "../../mailing/sendMailNotif.js";

export const defineDobMailJob = (agenda) => {
    try {
        agenda.define("send dob notification", async job => {
            // console.log("Sending dob notification", job.attrs.data);
            const { dob } = job.attrs.data;
            console.log(`Dob schedule date: ${dob?.scheduleDate}`);
            await sendMailNotif(dob);
            console.log(`✅ Reminder sent to All Recipients for dob ${dob?.subject}`);
        });
    } catch (error) {
        console.error(error)
    }
}