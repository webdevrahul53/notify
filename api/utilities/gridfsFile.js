// utils/gridfsFile.js
import mongoose from "mongoose";
import { getBucket } from "../config/gridfs.js";

export const getGridFSFileForMail = async (fileId) => {
    const bucket = getBucket();
    const _id = new mongoose.Types.ObjectId(fileId);

    // fetch file metadata
    const fileDoc = await mongoose.connection.db
        .collection("uploads.files")
        .findOne({ _id });

    if (!fileDoc) {
        throw new Error("File not found in GridFS");
    }

    // create stream
    const stream = bucket.openDownloadStream(_id);

    return {
        filename: fileDoc.filename,
        contentType: fileDoc.contentType || "application/octet-stream",
        content: stream, // <-- THIS IS THE MAGIC
    };
};