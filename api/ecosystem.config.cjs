const dotenv = require("dotenv");
dotenv.config();

const env = process.env.NODE_ENV || "production";
const appenv = process.env.APP_ENV || "quality";

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
        NODE_ENV: env,
        APP_ENV: appenv,
      },
    },
  ],
};
