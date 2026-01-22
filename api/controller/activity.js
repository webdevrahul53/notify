import Activity from "../model/activity.js";

const createActivity = async (req, res) => {
    try {
        const { activityName } = req.body;

        if (!activityName) {
            return res.status(400).json({ status: 400, message: "Activity name is required" });
        }
        const result = await Activity.create({ activityName });
        res.status(200).json({ status: 200, message: "Activity created successfully", data: result });
    } catch (error) {
        res.status(500).json({ status: 500, message: "Error creating activity", error: error.message });
    }
};

const updateActivity = async (req, res) => {
    try {
        const { id } = req.params;
        const { activityName, status } = req.body;

        const updatedActivity = await Activity.findByIdAndUpdate(id, { activityName, status }, { new: true, runValidators: true });
        if (!updatedActivity) {
            return res.status(404).json({ status: 404, message: "Activity not found" });
        }
        res.json({ status: 200, message: "Activity updated successfully", data: updatedActivity });
    } catch (error) {
        res.status(500).json({ status: 500, message: "Error updating activity", error: error.message });
    }
};

const activityList = async (req, res) => {
    try {
         const activities = await Activity.find()
            .select("activityName status createdAt updatedAt")
            .sort({ createdAt: -1 });

           res.status(200).json({ status: 200, message: "Activity list fetched successfully", data: activities });
        } catch (error) {
            res.status(500).json({ status: 500, message: "Error fetching activity list", error: error.message });
        }
};

export { createActivity, updateActivity, activityList };