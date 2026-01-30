import express from "express";
import { accountList, bulkCreateAccount, createAccount, deleteAccount, updateAccount, } from "../controller/account.js";
import authMiddleware from "../middleware/auth.js";
import { getDobDetails } from "../utilities/jobscheduler/jobScheduler.js";

const accountRouter = express.Router();

accountRouter.get("/", authMiddleware, accountList);
accountRouter.post("/", authMiddleware, createAccount);
accountRouter.post("/bulk", authMiddleware, bulkCreateAccount);
accountRouter.patch("/:id", authMiddleware, updateAccount);
accountRouter.put("/delete", authMiddleware, deleteAccount);
accountRouter.get("/dob/today", getDobDetails);


export default accountRouter;
