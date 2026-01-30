import nodemailer from "nodemailer";

export const mailConfig = async (
  toemls = [],
  ccemls = [],
  bccemls = [],
  subjct,
  maildtl,
  mailContent
) => {
  const from_name = `Shyam Metalics`;
  const from_email = process.env.EMAIL_USR;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    service: "outlook",
    secure: false,
    auth: {
      user: process.env.EMAIL_USR,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `${from_name} <${from_email}>`,
    to: toemls,
    cc: ccemls,
    bcc: bccemls,
    subject: subjct,

    html: `
      <html>
        <body>
          <div><strong>${maildtl?.title || ""}</strong></div>

          ${
            mailContent
              ? `<img 
                   src="cid:${mailContent.cid}" 
                   alt="Content Image"
                   style="width:100%;height:auto;"
                 />`
              : ""
          }
        </body>
      </html>
    `,

    attachments: mailContent
      ? [
          {
            filename: mailContent.filename,
            content: mailContent.content,
            contentType: mailContent.contentType,
            cid: mailContent.cid, // ✅ STRING
            disposition: "inline" // ✅ force inline
          }
        ]
      : [],
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("📨 Mail sent:", info.response);
  return info;
};
