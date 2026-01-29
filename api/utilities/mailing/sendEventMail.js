import { mailConfig } from "../../config/mailConfig.js";
import { getGridFSFileForMail } from "../gridfsFile.js";

export const sendEventMail = async (eventId) => {
    try {
        const event = await Event.findById(eventId).lean();
        if (!event) {
            return { message: "Event not found" };
        }

        console.log('events found');
        // map all recipients
        const allToMailIds = event.accounts && event.accounts.length > 0
            ? event.accounts.map(acc => acc.email).filter(email => !!email)
            : null;

        // 🔹 Prepare attachment from GridFS
        const attachment = await getGridFSFileForMail(event.contentImage);

        // 🔹 Call your existing mailConfig
        await mailConfig(
            allToMailIds,    // to
            [],                      // cc
            [],                      // bcc
            event.title,             // subject
            `<p>${event.subject}</p>`, // html body
            attachment               // attachment
        );

        return { message: `✅ Mail Notification Sent successfully.` }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to send mail" });
    }
};