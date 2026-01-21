const dotenv = require("dotenv")
dotenv.config()

const env = process.env.NODE_ENV || 'dev';
const appenv = process.env.APP_ENV || 'quality';

const apiName = {
    quality: process.env.API_NAME_QAS,
    production: process.env.API_NAME_PRD
}
const portDetails = {
    quality: process.env.PORT_QAS,
    production: process.env.PORT_PRD
}

module.exports = {
    apps: [
        {
            name: apiName[appenv] || "notify-qas-api",
            script: "index.js",
            env: {
                PORT: portDetails[appenv] || 3042,
                NODE_ENV: env || "dev",
                APP_ENV: appenv || "quality"
            }
        }
    ]
};
