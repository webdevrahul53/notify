import express from "express";
import { createEvent, deleteEvent, getEventById, getEventImage, listEvents, updateEvent } from "../controller/event.js";
import { upload } from "../config/storage.js";
import authMiddleware from "../middleware/auth.js";
import { getEventDetails } from "../utilities/jobscheduler/jobScheduler.js";

const eventRouter = express.Router();

eventRouter.get("/image/:id", getEventImage);
eventRouter.post("/", authMiddleware, upload.single("contentImage"), createEvent);
eventRouter.put("/:id", authMiddleware, upload.single("contentImage"), updateEvent);
eventRouter.get("/", authMiddleware, listEvents);
eventRouter.get("/:id", authMiddleware, getEventById);
eventRouter.delete("/:id", authMiddleware, deleteEvent);
eventRouter.get("/schedule/today", getEventDetails);



export default eventRouter;
