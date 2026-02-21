import mongoose from "mongoose";

const settingSchema = new mongoose.Schema({
  _id: { type: String, default: "APP_SETTINGS" }, // fixed id
  birthdayTime: {  type: String, match: /^([01]\d|2[0-3]):([0-5]\d)$/  },
  eventTime: {  type: String, match: /^([01]\d|2[0-3]):([0-5]\d)$/  },
  status: { type: Boolean, default: true }
}, { timestamps: true });

const Settings = mongoose.model("Settings", settingSchema);
export default Settings;
