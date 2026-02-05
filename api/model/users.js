import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    passwordBackup: { type: String, required: true },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Users = mongoose.model("Users", userSchema);

export default Users;
