import express from "express";
import { usersList, loginUser, registerUser, deleteUser, getUserById, refreshToken, } from "../controller/users.js";

const usersRouter = express.Router();

usersRouter.get("/", usersList);
usersRouter.get("/:id", getUserById);
usersRouter.post("/login", loginUser);
usersRouter.post("/register", registerUser);
usersRouter.post("/refresh-token", refreshToken);
usersRouter.delete("/:id", deleteUser);

export default usersRouter;
