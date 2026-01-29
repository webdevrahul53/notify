import mongoose from "mongoose";
import Event from "../model/event.js";
import { deleteFromGridFS, getBucket, uploadToGridFS } from "../config/gridfs.js";


const listEvents = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const searchText = req.query.search?.trim();
    const activity = req.query.activity;

    const matchStage = {};

    // 🔍 Search (adjust fields as per your schema)
    if (searchText) {
      matchStage.$or = [
        { title: { $regex: searchText, $options: "i" } },
        { subject: { $regex: searchText, $options: "i" } },
      ];
    }

    // 🎯 Activity filter
    if (activity && mongoose.Types.ObjectId.isValid(activity)) {
      matchStage.activityId = new mongoose.Types.ObjectId(activity);
    }

    const pipeline = [
      { $match: matchStage },
      { $lookup: { from: "activities", localField: "activityId", foreignField: "_id", as: "activity" } },
      { $unwind: { path: "$activity", preserveNullAndEmptyArrays: true } },
      { $addFields: { activityName: "$activity.activityName" } },
      { $sort: { updatedAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      { $project: { _v: 0 } }
    ]

    const [events, total] = await Promise.all([
      Event.aggregate(pipeline),
      Event.countDocuments(),
    ]);

    res.json({
      data: events,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit), },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch events",
      error: error.message,
    });
  }
};

const getEventById = async (req, res) => {
    try {
        const id = req.params.id
        if(!id) return res.status(404).json({ status: 404, message: "Invalid Request"})

        const result = await Event.aggregate([
            { $match: {_id: new mongoose.Types.ObjectId(id)} },
            { $lookup: { from: "uploads.files", localField: "contentImage", foreignField: "_id", as: "contentImage"  } },
            { $unwind: { path: "$contentImage", preserveNullAndEmptyArrays: true } },
            { $project: { _v: 0 } }
        ])
        return res.status(200).json({ status: 200, data: result[0] })
    }catch (error) {
        return res.status(500).json({ status: 500, message: error.message })
    }
}


const createEvent = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image required" });

    const { scheduleDate, activityId, subject, title, accountId } = req.body;

    const bucket = getBucket();
    const imageId = await uploadToGridFS(bucket, req.file);

    const event = await Event.create({
      scheduleDate, activityId, subject, title,
      accountId: accountId?.split(","),
      contentImage: imageId,
    });

    res.status(200).json({ status: 200, data: event, message: "Event Created Successfully", });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const bucket = getBucket();

    // ✅ normalize accountId
    let { accountId } = req.body;
    if (typeof accountId === "string") accountId = accountId.split(",");

    // -------- IMAGE UPDATE --------
    if (req.file) {
      const newImageId = await uploadToGridFS(bucket, req.file);
      await deleteFromGridFS(bucket, event.contentImage);
      event.contentImage = newImageId;
    }

    // -------- UPDATE OTHER FIELDS --------
    Object.assign(event, { ...req.body, accountId });
    await event.save();

    res.status(200).json({ status: 200, data: event, message: "Event Updated Successfully", });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.contentImage) await gfs.files.delete(new mongoose.Types.ObjectId(event.contentImage));

    await event.deleteOne();
    res.json({ message: "Event deleted successfully" });

  } catch (error) {
    res.status(500).json({
      message: "Failed to delete event",
      error: error.message,
    });
  }
};


const getEventImage = (req, res) => {
  try {
    const bucket = getBucket();
    const fileId = new mongoose.Types.ObjectId(req.params.id);

    res.set("Content-Type", "image/jpeg"); // or auto-detect later
    bucket.openDownloadStream(fileId).pipe(res);
  } catch (error) {
    res.status(404).json({ message: "Image not found" });
  }
};


export { getEventImage, getEventById, createEvent, updateEvent, listEvents, deleteEvent }