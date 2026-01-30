import { sendMailNotif } from "../../mailing/sendMailNotif.js";
import { genDobnotif } from "../../mailing/mailtemplate/dobNotifTemplate.js";

export const emailInfo = async (dob) => {
    try {
        const htmlContent = genDobnotif(dob);
        const mailResponse = await sendMailNotif(dob, htmlContent);
        return { message: `✅ Mail Notification Sent successfully.`, response: mailResponse };
    } catch (error) {
        console.error(error?.message)
    }
}

export const defineDobMailJob = (agenda) => {
    try {
        agenda.define("send dob notification", async job => {
            // console.log("Sending dob notification", job.attrs.data);
            const { dob } = job.attrs.data;
            console.log(`Dob schedule date: ${dob?.scheduleDate}`);
            await emailInfo(dob);
            console.log(`✅ Reminder sent to All Recipients for dob ${dob?.subject}`);
        });
    } catch (error) {
        console.error(error)
    }
}