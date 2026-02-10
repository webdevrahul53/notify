import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import usersRouter from './router/users.js';
import connectDB from './config/db.js';
import activityRouter from './router/activity.js';
import accountRouter from './router/account.js';
import eventRouter from './router/event.js';
import birthdayRouter from './router/birthday.js';
import { setupJobs } from './utilities/jobscheduler/jobScheduler.js';
import settingRouter from './router/setting.js';
dotenv.config();

dotenv.config();
await connectDB();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const apienv = process.env.NODE_ENV || 'dev';
const appenv = process.env.APP_ENV || 'quality';
const origins = allowedOrigins[apienv][appenv] || allowedOrigins.dev.quality;
const port = portDetails[appenv] || 5042;
const host = process.env.HOST || 'localhost';

const app = express();

// Trust Apache proxy
app.set("trust proxy", "loopback");
// Debug route to verify IP + UA
app.get("/api/debug/ip", (req, res) => {
    res.json({
        ip: req.ip,
        ips: req.ips,
        xff: req.headers["x-forwarded-for"],
        ua: req.get("user-agent"),
        proto: req.protocol
    });
});

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
app.use("/api/settings", settingRouter)

// static frontend delivery
if (apienv === 'live') {
    // static frontend
    const distPath = path.join(__dirname, '..', 'frontend', 'dist');
    console.log("Serving frontend from:", distPath);
    app.use(express.static(distPath));

    // frontend routes
    app.get(/^\/(?!api).*/, (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

// Agenda Scheduler setup
// start agenda AFTER job is defined
await setupJobs();
process.on("SIGTERM", async () => {
    if (agenda) await agenda.stop();
    process.exit(0);
});



// No host param → cluster shares the TCP handle
app.listen(port, host, () => {
    console.log(`Server is running on ${host}:${port}`)
})
