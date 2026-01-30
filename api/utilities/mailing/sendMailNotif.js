import Event from "../../model/event.js";
import { mailConfig } from "../../config/mailConfig.js";
import { getGridFSFileForMail } from "../gridfsFile.js";

const TESTMAILID = process.env.TEST_EMAIL || "legend.mshs64@gmail.com"

export const sendMailNotif = async (notificationDetails) => {
    try {
        // const notificationDetails = await Event.findById(event._id).lean();
        if (!notificationDetails) {
            return { message: "Event not found" };
        }

        // map all recipients
        const allToMailIds = notificationDetails?.accounts && notificationDetails?.accounts?.length > 0
            ? notificationDetails.accounts.map(acc => acc.email).filter(email => !!email).join(", ")
            : null;

        console.log(allToMailIds);
        // console.log(TESTMAILID);
        // 🔹 Prepare attachment from GridFS
        const attachment = await getGridFSFileForMail(notificationDetails.contentImage?._id);
        // console.log(attachment);

        // 🔹 Call your existing mailConfig
        await mailConfig(
            [allToMailIds],                         // to
            [],                                     // cc
            [],                                     // bcc
            notificationDetails.subject,                   // subject
            `<p>${notificationDetails.title}</p>`,         // mail detail
            attachment
        );

        return { message: `✅ Mail Notification Sent successfully.` }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to send mail" });
    }
};