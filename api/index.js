import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import bodyParser from 'body-parser';
import usersRouter from './router/users.js';
import connectDB from './config/db.js';
import activityRouter from './router/activity.js';
import accountRouter from './router/account.js';
import eventRouter from './router/event.js';
import birthdayRouter from './router/birthday.js';
import { setupJobs } from './utilities/jobscheduler/jobScheduler.js';
dotenv.config();

await connectDB();

const allowedOrigins = {
    dev: {
        quality: ['http://localhost:3042'],
        production: ['http://localhost:3041']
    },
    live: {
        quality: ['https://notify-qas.shyamgroup.com'],
        production: ['https://notify.shyamgroup.com']
    }
};
const portDetails = {
    quality: process.env.PORT_QAS,
    production: process.env.PORT_PRD
}

const env = process.env.NODE_ENV || 'dev';
const appenv = process.env.APP_ENV || 'quality';
const origins = allowedOrigins[env][appenv] || allowedOrigins.dev.quality;
const port = portDetails[appenv] || 5042;
const host = process.env.HOST || 'localhost';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: origins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'X-Requested-With', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
}));
app.use(bodyParser.json({ limit: '10000mb' }));
app.use(bodyParser.urlencoded({ limit: '10000mb', extended: true }));
// app.use(express.static('uploads'));

app.use("/api/users", usersRouter)
app.use("/api/activity", activityRouter)
app.use("/api/account", accountRouter)
app.use("/api/event", eventRouter)
app.use("/api/birthday", birthdayRouter)


// Agenda Scheduler setup
await setupJobs(); // start agenda AFTER job is defined
// process.on("SIGINT", async () => {
//     console.log("System Gracefully shutting down...");
//     await agenda.stop();
//     process.exit(0);
// });
process.on("SIGTERM", async () => {
    if (agenda) await agenda.stop();
    if (mongoClient) await mongoClient.close();
    process.exit(0);
});



// No host param → cluster shares the TCP handle
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
