import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
    {
        scheduleDate: { type: Date, required: true },
        activityId: { type: mongoose.Types.ObjectId, ref: "Activity", required: true },
        accountId: [{ type: mongoose.Types.ObjectId, ref: "Account" }],
        subject: { type: String, required: true },
        title: { type: String, required: true },
        contentImage: { type: mongoose.Types.ObjectId, ref: "uploads.files", required: true, },
        status: { type: Boolean,  default: true }
    },
    { timestamps: true  }
);

eventSchema.index({ scheduleDate: 1 });
eventSchema.index({ accountId: 1 });

const Event = mongoose.model("Event", eventSchema);

export default Event;