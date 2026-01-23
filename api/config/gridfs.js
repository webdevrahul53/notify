import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

let bucket;

mongoose.connection.once("open", () => {
  bucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: "uploads",
  });
  console.log("✅ GridFSBucket initialized");
});

export const getBucket = () => {
  if (!bucket) throw new Error("GridFS not ready");
  return bucket;
};

export const uploadToGridFS = (bucket, file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(
      `${Date.now()}-${file.originalname}`,
      { contentType: file.mimetype }
    );

    uploadStream.end(file.buffer);
    uploadStream.on("finish", () => resolve(uploadStream.id)).on("error", reject);
  });
};


export const deleteFromGridFS = async (bucket, fileId) => {
  if (!fileId) return;
  try {
    await bucket.delete(fileId);
  } catch (err) {
    console.warn("Old image not found, skipping delete");
  }
};