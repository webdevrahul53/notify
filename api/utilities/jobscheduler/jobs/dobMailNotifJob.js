import { sendMailNotif } from "../../mailing/sendMailNotif.js";
import { genDobnotif } from "../../mailing/mailtemplate/dobNotifTemplate.jsx";
import { getGridFSFileForMail } from "../../gridfsFile.js";

export const emailInfo = async (dob) => {
    try {
        // 🔹 Get inline image
        const imageFile = dob.contentImage ? await getGridFSFileForMail(dob.contentImage._id) : null;
        // 🔹 Generate HTML WITH CID
        const htmlContent = await genDobnotif(dob, imageFile?.cid);
        const mailResponse = await sendMailNotif(dob, htmlContent, imageFile ? [imageFile] : []);

        if (mailResponse.res) return { message: `✅ Mail Notification Sent successfully.`, success: true };
        else return { message: `✅ Mail Notification Sent successfully.`, success: false };
    } catch (error) {
        console.error(error?.message)
    }
}

export const defineDobMailJob = (agenda) => {
    try {
        agenda.define("send dob notification", async job => {
            // console.log("Sending dob notification", job.attrs.data);
            const { dob } = job.attrs.data;
            const mailResponse = await emailInfo(dob);
            if (mailResponse.success) console.log(`✅ Reminder successfully sent to All Recipients for dob ${dob?.subject}`);
            else console.log(`✅ DOB Reminder sending Failed for ${dob?.subject}`);
        });
    } catch (error) {
        console.error(error)
    }
}