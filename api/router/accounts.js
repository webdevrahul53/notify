import express from "express";
import { accountList, createAccount, updateAccount, } from "../controller/account.js";

const accountRouter = express.Router();

accountRouter.get("/", accountList);
accountRouter.post("/", createAccount);
accountRouter.patch("/:id", updateAccount);

export default accountRouter;
