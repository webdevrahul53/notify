// import { sendMail } from "../services/mail/sendMail.js";
import { sendMail } from "../config/graphmailconfig/sendMail.js";

export const sendTestMail = async (req, res) => {
    try {
        const { to } = req.body;

        console.log("TO EMAIL:", to);
        await sendMail({
            to,
            subject: "Test Mail from MERN App",
            html: "<h2>✅ Microsoft Graph Mail Working!</h2>",
        });

        res.status(200).json({
            success: true,
            message: "Mail sent successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};