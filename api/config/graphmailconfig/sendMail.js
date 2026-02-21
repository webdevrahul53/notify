import { graphClient } from "./graphClient.js";

const serviceMail = process.env.SERVICE_MAIL;

export const sendMail = async ({ to, subject, html }) => {
    try {
        await graphClient.api(`/users/${serviceMail}/sendMail`).post({
            message: {
                subject,
                body: {
                    contentType: "HTML",
                    content: html,
                },
                toRecipients: [
                    {
                        emailAddress: {
                            address: to,
                        },
                    },
                ],
            },
        });

        return true;
    } catch (error) {
        console.error("Graph Mail Error:", error?.body || error);
        throw new Error("Mail sending failed");
    }
};