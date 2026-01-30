import React from "react";
import { render } from "@react-email/render";
import { getGridFSFileForMail } from "../../gridfsFile.js";

const env = process.env.NODE_ENV;
const appenv = process.env.APP_ENV;

const url = {
    dev: {
        quality: "http://localhost:3042",
        production: "http://localhost:3041",
    },
    live: {
        quality: "https://notify-qas.shyamgroup.com/email-assets",
        production: "https://notify.shyamgroup.com/email-assets",
    },
};

const appurl = url[env]?.[appenv] || "http://localhost:3042";

const EmailTemplate = async ({ dob }) => {
    const imageFile = await getGridFSFileForMail(dob.contentImage?._id);
    // let daysLeft = dob?.daysLeft;
    // let daysLftHdr = ''
    // if (daysLeft === 0) daysLftHdr += `now.`;
    // else if (daysLeft === 1) daysLftHdr += `after ${daysLeft} day.`;
    // else if (daysLeft > 1) daysLftHdr += `after ${daysLeft} days.`;
    // else daysLftHdr += `now.`
    
    const styles = `
        .container {
            font-family: Arial, sans-serif;
            border-radius: 15px;
            max-width: 800px;
            margin: auto;
        }
        th, td { padding: 40px; }
        .heading {
            background-image: linear-gradient(to right, #ffdb79, #f1e6c7);
            width: 100%;
            padding: 40px;
            color: crimson;
            margin-bottom: 1px;
        }
        .tphdr { padding: 5px 40px; text-align: left; }
        .salutn { font-size: 15px; font-weight: 700; }
        .rcpt { font-size: 13.5px; font-weight: 400; }
        .logosec { max-width: 40px; padding: 2px 40px; }
        .lgo { width: 100%; height: 100%; }
        .main { background-image: linear-gradient(to bottom, #fcfcfc, #f0f0f0); }
        .paragraph {
            padding: 20px 40px;
            color: #076601;
            font-size: 13px;
            line-height: 1.6;
        }
        .dtlsec { padding: 1px 40px; font-size: 12px; }
        .dtlhdr {
            padding: 20px 0px;
            color: #000;
            font-weight: 600;
            font-size: 16px;
        }
        .dtlhds { color: #840716; font-weight: 200; }
        .dtlinf { color: black; font-weight: 700; }
        .btnsec { padding: 20px 40px; }
        .btn {
            display: inline-block;
            background-color: #442800;
            padding: 5px 10px;
            font-size: 11px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 500px;
            color: #fff !important;
        }
        .btn:hover { background-color: #ff6a22; color: black !important; }
        .image-content { width: 100%; height: 100%; border-radius: 10px; }
        .footer { width: 100%; height: auto; }
    `;

    return React.createElement(
        "html",
        null,
        React.createElement("head", null, 
            React.createElement("style", { dangerouslySetInnerHTML: { __html: styles } })
        ),
        React.createElement(
            "body",
            null,
            React.createElement(
                "table",
                { className: "container", cellSpacing: "0px" },
                [
                    React.createElement("thead", { key: "thead" },
                        React.createElement("tr", { className: "heading" }, [
                            React.createElement("th", { key: "tphdr", className: "tphdr" }, [
                                React.createElement("span", { key: "salutn", className: "salutn" }, "Hi, "),
                            ]),
                            React.createElement("th", { key: "logo", className: "logosec", align: "center", valign: "middle" },
                                React.createElement("img", {
                                    src: `${appurl}/shyamlogo.png`,
                                    alt: "Logo",
                                    className: "lgo",
                                })
                            ),
                        ])
                    ),
                    React.createElement("tbody", { key: "tbody", className: "main" }, [
                        React.createElement("tr", { key: "row1" },
                            React.createElement("td", { className: "paragraph", colSpan: 2 },
                                React.createElement("span", { className: "parahd" }, `Wishing you a Happy Birthday ${dob?.title} !`)
                            )
                        ),
                        React.createElement("tr", { key: "row2" },
                            React.createElement("img", {
                                src: `cid:${imageFile?.fileId}`,
                                alt: "embedded_image",
                                className: "image-content",
                            })
                        ),
                        React.createElement("tr", { key: "row3" },
                            React.createElement("td", {
                                className: "footer",
                                colSpan: 2,
                                align: "center",
                                style: {
                                    backgroundImage: `url(${appurl}/footr.png)`,
                                    backgroundRepeat: "no-repeat",
                                    backgroundPosition: "center",
                                    backgroundSize: "contain",
                                },
                            })
                        ),
                    ]),
                ]
            )
        )
    );
};

export const genDobnotif = async (dob) => {
    return await render(React.createElement(EmailTemplate, { dob }));
};
