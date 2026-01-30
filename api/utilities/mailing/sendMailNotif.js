import Event from "../../model/event.js";
import { mailConfig } from "../../config/mailConfig.js";
import { getGridFSFileForMail } from "../gridfsFile.js";

export const sendMailNotif = async (notificationDetails) => {
    try {
        if (!notificationDetails) {
            return { message: "Event not found" };
        }

        // map all recipients
        const allToMailIds = notificationDetails?.accounts && notificationDetails?.accounts?.length > 0
            ? notificationDetails.accounts.map(acc => acc.email).filter(email => !!email).join(", ")
            : null;

        // 🔹 Prepare attachment from GridFS
        const attachment = await getGridFSFileForMail(notificationDetails.contentImage?._id);
        // console.log(attachment);

        // 🔹 Call your existing mailConfig
        await mailConfig(
            [allToMailIds],
            [],
            [],
            notificationDetails.subject,
            notificationDetails,
            attachment,
        );

        return { message: `✅ Mail Notification Sent successfully.` }
    } catch (error) {
        console.error(error);
        throw new Error(`Failed to send mail: ${error.message}`);
    }
};