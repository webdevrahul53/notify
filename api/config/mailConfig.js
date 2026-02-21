// import nodemailer from "nodemailer";

// export const mailConfig = async (
//   toemls = [],
//   ccemls = [],
//   bccemls = [],
//   subjct,
//   maildtl,
//   mailContent = []
// ) => {
//   const from_name = `Shyam Metalics`;
//   const from_email = process.env.EMAIL_USR;

//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     service: "outlook",
//     secure: false,
//     auth: {
//       user: process.env.EMAIL_USR,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   if (typeof maildtl !== "string") {
//     throw new Error("Email HTML must be a string");
//   }

//   const mailOptions = {
//     from: `${from_name} <${from_email}>`,
//     to: toemls,
//     cc: ccemls,
//     bcc: bccemls,
//     subject: subjct,
//     html: maildtl,

//     attachments: Array.isArray(mailContent) ? mailContent.map(img => ({
//       filename: img.filename,
//       content: img.content,
//       contentType: img.contentType,
//       cid: img.cid,
//       disposition: "inline",
//     })) : []
//   };

//   const info = await transporter.sendMail(mailOptions);
//   console.log("📨 Mail sent:", info.response);
//   return info.response;
// };


import { Client } from "@microsoft/microsoft-graph-client";
import { ClientSecretCredential } from "@azure/identity";
import "isomorphic-fetch";

const credential = new ClientSecretCredential(
    process.env.AZURE_TENANT_ID,
    process.env.AZURE_CLIENT_ID,
    process.env.AZURE_CLIENT_SECRET
);
const serviceMail = process.env.SERVICE_MAIL;


// 🔹 config
export const graphClient = Client.initWithMiddleware({
    authProvider: {
        getAccessToken: async () => {
            const token = await credential.getToken("https://graph.microsoft.com/.default");
            return token.token;
        },
    },
});
// 🔹 Helper: format recipients
const formatRecipients = (emails = []) => {
  if (!emails) return [];

  // allow string or array
  const list = Array.isArray(emails) ? emails : [emails];

  return list
    .filter((email) => email && email.trim())
    .map((email) => ({
      emailAddress: {
        address: email.trim(),
      },
    }));
};

// 🔹 Helper: format attachments
const formatAttachments = (attachments = []) => {
  return attachments.map((file) => ({
    "@odata.type": "#microsoft.graph.fileAttachment",
    name: file.filename,
    contentType: file.contentType,
    contentBytes: file.content.toString("base64"), // 🔥 important
  }));
};


// Mail sending function
export const mailConfig = async ({
  to,
  cc,
  bcc,
  subject,
  html,
  attachments = [],
}) => {
  try {
    // ✅ Validation
    if (!to || (Array.isArray(to) && to.length === 0)) {
      throw new Error("At least one TO recipient is required");
    }

    await graphClient.api(`/users/${serviceMail}/sendMail`).post({
      message: {
        subject,
        body: {
          contentType: "HTML",
          content: html,
        },
        toRecipients: formatRecipients(to),
        ccRecipients: formatRecipients(cc),
        bccRecipients: formatRecipients(bcc),
        attachments: attachments.length
          ? formatAttachments(attachments)
          : [],
      },
    });

    return true;
  } catch (error) {
    console.error("Graph Mail Error:", error?.body || error);
    throw new Error("Mail sending failed");
  }
};