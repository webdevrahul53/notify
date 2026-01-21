import express from "express";
import { taskList, createTask, deleteTask, } from "../controller/tasks.js";
import authMiddleware from "../middleware/auth.js";

const tasksRouter = express.Router();

tasksRouter.get("/", authMiddleware, taskList);
tasksRouter.post("/create", authMiddleware, createTask);
tasksRouter.delete("/delete/:id", authMiddleware, deleteTask);

export default tasksRouter;
