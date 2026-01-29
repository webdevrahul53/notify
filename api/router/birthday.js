import express from "express";
import { createBirthday, deleteBirthday, getBirthdayById, getBirthdayImage, listBirthdays, updateBirthday } from "../controller/birthday.js";
import { upload } from "../config/storage.js";
import authMiddleware from "../middleware/auth.js";
import { setLatestBirthday } from "../controller/birthday.js";
const birthdayRouter = express.Router();

birthdayRouter.get("/image/:id", getBirthdayImage);
birthdayRouter.post("/", authMiddleware, upload.single("contentImage"), createBirthday);
birthdayRouter.patch("/:id/set-latest", authMiddleware, setLatestBirthday);
birthdayRouter.put("/:id", authMiddleware, upload.single("contentImage"), updateBirthday);
birthdayRouter.get("/", authMiddleware, listBirthdays);
birthdayRouter.get("/:id", authMiddleware, getBirthdayById);
birthdayRouter.delete("/:id", authMiddleware, deleteBirthday);




export default birthdayRouter;
