import "../../styles/InspectionEntryForm.css";
import React, { useEffect } from "react";
import { Button, TextField, Typography } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import axiosInstance from "../../utilities/axiosInstance";
// import { SettingsAccessibility } from "@mui/icons-material";
import SettingsIcon from '@mui/icons-material/Settings';

const Settings = () => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      birthdayTime: "",
      eventTime: ""
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axiosInstance.get("/settings");
      if (res.data?.data) {
        reset({
          birthdayTime: res.data.data.birthdayTime || "",
          eventTime: res.data.data.eventTime || ""
        });
      }
    } catch (err) {
      console.error("Fetch settings error", err);
    }
  };

  const onSubmit = async (data) => {
    try {
      await axiosInstance.post("/settings", data);
      alert("Settings saved successfully");
    } catch (err) {
      console.error("Save settings error", err);
    }
  };

  return (
    <section className="inspection-entry-form">
        
        
        <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem"}}>
                <Typography className="title" color="primary">
                    <SettingsIcon color="primary" style={{ fontSize: "3rem", margin: "-10px 0" }} />
                    Settings
                </Typography>
                <Button variant="contained" size="large" type="submit">SAVE</Button>
            </div>

            {/* {JSON.stringify(control._formValues)} */}

            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "20px"}}>

                <Controller name="birthdayTime" control={control} 
                    rules={{ required: "Birthday time is required" }}
                    render={({ field }) => (
                        <TextField {...field} type="time" label="Birthday Time" fullWidth
                            InputLabelProps={{ shrink: true }} error={!!errors.birthdayTime} 
                            helperText={errors.birthdayTime?.message}
                        />
                    )}
                />
                <Controller name="eventTime" control={control}
                    rules={{ required: "Event time is required" }}
                    render={({ field }) => (
                        <TextField {...field} type="time" label="Event Time" fullWidth
                            InputLabelProps={{ shrink: true }} error={!!errors.eventTime}
                            helperText={errors.eventTime?.message}
                        />
                    )}
                />
            </div>



        </form>

    </section>
  );
};

export default Settings;
