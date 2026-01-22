import express from "express";
import { activityList, createActivity, deleteActivity, updateActivity, } from "../controller/activity.js";
import authMiddleware from "../middleware/auth.js";

const activityRouter = express.Router();

activityRouter.get("/", authMiddleware, activityList);
activityRouter.post("/", authMiddleware, createActivity);
activityRouter.patch("/:id", authMiddleware, updateActivity);
activityRouter.put("/delete", authMiddleware, deleteActivity);

export default activityRouter;
