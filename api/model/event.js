import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
    {
        scheduleDate: { type: Date, required: true },
        activityId: { type: mongoose.Types.ObjectId, required: true, ref: "Activity" },
        accountId: [{ type: mongoose.Types.ObjectId, ref: "Account" }],
        subject: { type: String, required: true },
        title: { type: String, required: true },
        contentImage: { type: mongoose.Types.ObjectId, ref: "uploads.files", required: true, },
        status: { type: Boolean,  default: true }
    },
    { timestamps: true  }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;