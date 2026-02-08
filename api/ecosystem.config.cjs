const dotenv = require("dotenv");
dotenv.config();

const apienv = process.env.NODE_ENV || "live";
const appenv = process.env.APP_ENV || "production";

const apiName = {
  quality: process.env.API_NAME_QAS,
  production: process.env.API_NAME_PRD,
};

const portDetails = {
  quality: process.env.PORT_QAS,
  production: process.env.PORT_PRD,
};

module.exports = {
  apps: [
    {
      name: apiName[appenv] || "notify-qas-api",

      // ✅ Use local tsx binary
      script: "./node_modules/.bin/tsx",
      args: "index.js",

      env: {
        PORT: portDetails[appenv] || 3042,
        NODE_ENV: apienv,
        APP_ENV: appenv,
      },
    },
  ],
};
