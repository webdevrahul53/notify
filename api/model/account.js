import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
    {
        accountName: { type: String, required: true, trim: true },
        accountEmail: { type: String, required: true, unique: true, lowercase: true, trim: true },
        dateOfBirth: { type: Date, required: true },
        phoneNumber: { type: String, trim: true },
        employeeCode: { type: String, trim: true },
        location: { type: String, trim: true },
        anniversaryDate: { type: Date },
        status: { type: Boolean,  default: true }
    },
    { timestamps: true  }
);

const Account = mongoose.model("Account", accountSchema);

export default Account;