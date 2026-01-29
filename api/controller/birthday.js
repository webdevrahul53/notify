import mongoose from "mongoose";
import Birthday from "../model/birthday.js";
import { deleteFromGridFS, getBucket, uploadToGridFS } from "../config/gridfs.js";


const listBirthdays = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const pipeline = [
        { $sort: { updatedAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        { $project: { _v: 0 } }
    ]

    const [birthdays, total] = await Promise.all([
      Birthday.aggregate(pipeline),
      Birthday.countDocuments(),
    ]);

    res.json({
      data: birthdays,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch birthdays",
      error: error.message,
    });
  }
};

const getBirthdayById = async (req, res) => {
    try {
        const id = req.params.id
        if(!id) return res.status(404).json({ status: 404, message: "Invalid Request"})

        const result = await Birthday.aggregate([
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

const createBirthday = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image required" });

    const { subject, title } = req.body;

    const bucket = getBucket();
    const imageId = await uploadToGridFS(bucket, req.file);

    await Birthday.updateMany({ isLatest: true }, { $set: { isLatest: false } });
    const birthday = await Birthday.create({subject, title, contentImage: imageId, isLatest: true});

    res.status(200).json({ status: 200, data: birthday, message: "Birthday Created Successfully", });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




const updateBirthday = async (req, res) => {
  try {
    const birthday = await Birthday.findById(req.params.id);
    if (!birthday) return res.status(404).json({ message: "Birthday not found" });

    const bucket = getBucket();


    // -------- IMAGE UPDATE --------
    if (req.file) {
      const newImageId = await uploadToGridFS(bucket, req.file);
      await deleteFromGridFS(bucket, birthday.contentImage);
      birthday.contentImage = newImageId;
    }

    // -------- UPDATE OTHER FIELDS --------
    Object.assign(birthday, { ...req.body });
    await birthday.save();

    res.status(200).json({ status: 200, data: birthday, message: "Birthday Updated Successfully", });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const setLatestBirthday = async (req, res) => {
  try {
    const { id } = req.params;
    await Birthday.updateMany({ isLatest: true }, { $set: { isLatest: false } } );
    const updatedBirthday = await Birthday.findByIdAndUpdate(id, { $set: { isLatest: true } }, { new: true });

    if (!updatedBirthday) return res.status(404).json({ message: "Birthday not found" });

    res.status(200).json({ status: 200, data: updatedBirthday, message: "Latest birthday updated successfully", });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const deleteBirthday = async (req, res) => {
  try {
    const birthday = await Birthday.findById(req.params.id);
    if (!birthday) return res.status(404).json({ message: "Birthday not found" });

    if (birthday.contentImage) await gfs.files.delete(new mongoose.Types.ObjectId(birthday.contentImage));

    await birthday.deleteOne();
    res.json({ message: "Birthday deleted successfully" });

  } catch (error) {
    res.status(500).json({
      message: "Failed to delete birthday",
      error: error.message,
    });
  }
};


const getBirthdayImage = (req, res) => {
  try {
    const bucket = getBucket();
    const fileId = new mongoose.Types.ObjectId(req.params.id);

    res.set("Content-Type", "image/jpeg"); // or auto-detect later
    bucket.openDownloadStream(fileId).pipe(res);
    
  } catch (error) {
    res.status(404).json({ message: "Image not found" });
  }
};


export { getBirthdayImage, getBirthdayById, createBirthday, setLatestBirthday, updateBirthday, listBirthdays, deleteBirthday }