import { sendMailNotif } from "../../mailing/sendMailNotif.js";
import { genEventnotif } from "../../mailing/mailtemplate/eventNotifTemplate.jsx";
import { getGridFSFileForMail } from "../../gridfsFile.js";
import moment from "moment";

export const emailInfo = async (event) => {
    try {
        // 🔹 Get inline image
        const imageFile = event.contentImage ? await getGridFSFileForMail(event.contentImage._id) : null;
        // 🔹 Generate HTML WITH CID
        const htmlContent = await genEventnotif(event, imageFile?.cid);
        const mailResponse = await sendMailNotif(event, htmlContent, imageFile ? [imageFile] : []);
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
            console.log(`Event schedule date: ${moment(event?.scheduleDate).format("DD-MM-YYYY HH:mm:ss")}`);
            await emailInfo(event);
            console.log(`✅ Reminder sent to All Recipients for event ${event?.activity?.activityName}`);
        });
    } catch (error) {
        console.error(error)
    }
}
