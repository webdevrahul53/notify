import { sendMailNotif } from "../../mailing/sendMailNotif.js";
import { genEventnotif } from "../../mailing/mailtemplate/eventNotifTemplate.jsx";
import { getGridFSFileForMail } from "../../gridfsFile.js";

export const emailInfo = async (event) => {
    try {
        // 🔹 Get inline image
        const imageFile = event.contentImage ? await getGridFSFileForMail(event.contentImage._id) : null;
        // 🔹 Generate HTML WITH CID
        const htmlContent = await genEventnotif(event, imageFile?.cid);
        const mailResponse = await sendMailNotif(event, htmlContent, imageFile ? [imageFile] : []);

        if (mailResponse.res) return { message: `✅ Mail Notification Sent successfully.`, success: true };
        else return { message: `✅ Mail Notification Sent successfully.`, success: false };
    } catch (error) {
        console.error(error?.message)
    }
}

export const defineEventMailJob = (agenda) => {
    try {
        agenda.define("send event notification", {
            concurrency: 1,              // 🔒 only one at a time
            lockLifetime: 10 * 60 * 1000  // 🔒 prevent duplicate locks
        }, async job => {
            // console.log("Sending event notification", job.attrs.data);
            const { event } = job.attrs.data;
            const mailResponse = await emailInfo(event);
            if (mailResponse.success) {
                console.log(`✅ Reminder successfully sent to All Recipients for event ${event?.activity?.activityName}`)
                // 🔥 THIS LINE FIXES EVERYTHING
                await job.remove();   // ❗❗❗ REQUIRED
            }
            else console.log(`✅ Event Reminder sending Failed for ${event?.activity?.activityName}`);
        });
    } catch (error) {
        console.error(error)
    }
}
