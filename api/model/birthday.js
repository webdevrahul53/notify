import mongoose from "mongoose";

const birthdaySchema = new mongoose.Schema(
    {
        subject: { type: String, required: true },
        title: { type: String, required: true },
        contentImage: { type: mongoose.Types.ObjectId, ref: "uploads.files", required: true, },
        isLatest: { type: Boolean,  default: true },
        status: { type: Boolean,  default: true }
    },
    { timestamps: true  }
);

const Birthday = mongoose.model("Birthday", birthdaySchema);

export default Birthday;