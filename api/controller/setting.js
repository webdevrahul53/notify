import Settings from "../model/setting";

/**
 * GET SETTINGS (Singleton)
 */
export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.findById("APP_SETTINGS");

    return res.status(200).json({ success: true, data: settings });

  } catch (error) {
    console.error("Get Settings Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch settings" });
  }
};


/**
 * CREATE / UPDATE SETTINGS (Upsert)
 */
export const upsertSettings = async (req, res) => {
  try {
    const { birthdayTime, eventTime, status } = req.body;

    // Basic validation
    if (!birthdayTime || !eventTime) {
      return res.status(400).json({ success: false, message: "birthdayTime and eventTime are required" });
    }

    const settings = await Settings.findByIdAndUpdate(
      "APP_SETTINGS",
      { birthdayTime, eventTime, status },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ success: true, message: "Settings saved successfully", data: settings });

  } catch (error) {
    console.error("Upsert Settings Error:", error);
    return res.status(500).json({ success: false, message: "Failed to save settings" });
  }
};
