import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
       activityName: { type: String, required: true },
       status: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Activity = mongoose.model("Activity", activitySchema);

export default Activity;