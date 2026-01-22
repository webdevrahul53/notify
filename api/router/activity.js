import express from "express";
import { activityList, createActivity, updateActivity, } from "../controller/activity.js";

const activityRouter = express.Router();

activityRouter.get("/", activityList);
activityRouter.post("/", createActivity);
activityRouter.patch("/:id", updateActivity);

export default activityRouter;
