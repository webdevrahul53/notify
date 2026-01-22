import "../../styles/InspectionEntryForm.css";

import React, { useState } from 'react';
import { ArrowBack } from "@mui/icons-material";
import { Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { showSnackbar } from "../../redux/slices/snackbar";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import FileUploader from "../../components/FileUploader";
import axiosInstance from "../../utilities/axiosInstance";
// import POGPForm from "../../components/pogpform";

const DEFAULTVALUES = {
    scheduledOn: "",
    activityId: "",
    accountId: "",
    subject: "",
    title: "",
    content: "",
}


export default function AddEditEvent() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(state => state.auth.user);
    const [activityList, setActivityList] = useState([]);
    const [accountList, setAccountList] = useState([]);
    const [image, setImage] = useState(null);
    const { register, control, handleSubmit, reset, setValue, watch, formState: {errors} } = useForm({
        defaultValues: DEFAULTVALUES
    });


    const [searchParams] = useSearchParams();
    const _id = searchParams.get("_id");
    React.useEffect(() => {
        _id && getEventById(_id);
    }, [_id]);

    React.useEffect(() => {
        getAllLists();
    }, []);

    const getAllLists = async () => {

        try {
            const results = await Promise.allSettled([
                axiosInstance.get(`/activity`).then(res => res.data),
                axiosInstance.get(`/accounts`).then(res => res.data),
            ]);
        
            const [activityRes, accountsRes] = results;
            console.log(activityRes)

            setAccountList(activityRes.status === "fulfilled" ? activityRes.value.data : []);
            setAccountList(accountsRes.status === "fulfilled" ? accountsRes.value.data : []);
            
        
        } catch (error) {
            console.error("Unexpected error fetching lists:", error);
            dispatch(showSnackbar({ message: "Failed to fetch lists", severity: 'error', duration: 2000 }));
        }
    };

    const getEventById = async (id) => {
        try {
            const result = await axiosInstance.get(`/event/${id}`);
            console.log(result)
            if (result.status === 200) {
                // const deedData = result.data.data;
                // console.log(deedData)
                // setFiles(
                //     deedData?.deedDocs?.map((f) => ({
                //         id: f.filId,
                //         name: f.filName,
                //         size: Number(f.filContentSize),
                //         type: f.filContentType,
                //         isExisting: true,
                //     }))
                // );
                // if(deedData.approvalStatus === "Rejected") setApprovalRemarks(deedData.approvalDetails[deedData.approvalDetails.length - 1]);
                // reset(deedData)
            } else {
                console.error("Error fetching Deed by ID:", result.message);
            }
        } catch (error) {
            console.error("Error fetching Deed by ID:", error);
        }
    };

    
    const onSubmit = async (data) => {
        console.log(data)
    };
    
  
  return (
    <section className="inspection-entry-form">
        
        

        <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem"}}>
                <div>
                    
                    <Typography className="title" color="primary">
                        <Link to={"/events"}><ArrowBack color="primary" style={{ fontSize: "3rem", margin: "-10px 0" }} /> </Link>
                        {_id ? "Edit Event":"Add New Event"}
                    </Typography>

                </div>
                <div style={{display: "flex", gap: "1rem"}}>
                    <Button variant="contained" size="large" type="submit">{_id ? "UPDATE":"SAVE"}</Button>
                    {!_id && <Button variant="outlined" size="large" color="warning" type="button" onClick={() => {
                        reset(DEFAULTVALUES)
                    }}>Reset</Button>}
                </div>
    
            </div>


            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "20px"}}>

                <Controller name="scheduledOn" control={control} defaultValue={control._formValues.scheduledOn ?? ""} 
                    rules={{ required: "Scheduled On is required" }}
                    render={({ field, fieldState }) => (
                        <TextField type="date" {...field} value={field.value ?? ""} label="Scheduled On" 
                        variant="filled" fullWidth error={!!errors.scheduledOn} InputLabelProps={{ shrink: true }} />
                    )}
                />

                <Controller name="activityId" control={control} rules={{ required: "Activity is required" }}
                    render={({ field }) => (
                    <FormControl variant="filled" fullWidth error={!!errors?.activityId} disabled={_id}>
                        <InputLabel id="activity-select-label">Activity</InputLabel>
                        <Select labelId="activity-select-label" id="activity-select" {...field}>
                            <MenuItem value=""> <em>None</em> </MenuItem>
                            {activityList.map((activity) => (
                                <MenuItem key={activity._id} value={activity._id}>
                                    {activity.activityName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    )}
                />

                
                <Controller name="accountId" control={control} rules={{ required: "Accounts is required" }}
                    render={({ field }) => (
                    <FormControl variant="filled" fullWidth error={!!errors?.accountId} disabled={_id}>
                        <InputLabel id="activity-select-label">Accounts</InputLabel>
                        <Select labelId="activity-select-label" id="activity-select" {...field}>
                            <MenuItem value=""> <em>None</em> </MenuItem>
                            {accountList.map((account) => (
                                <MenuItem key={account._id} value={account._id}>
                                    {account.accountName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    )}
                />

            </div>

            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "20px", marginTop: "20px"}}>

                <Controller name="subject" control={control} defaultValue={control._formValues.subject ?? ""} 
                    rules={{ required: "Subject is required" }}
                    render={({ field, fieldState }) => (
                        <TextField {...field} value={field.value ?? ""} label="Subject" 
                        variant="filled" fullWidth error={!!errors.subject} />
                    )}
                />


                <Controller name="title" control={control} defaultValue={control._formValues.title ?? ""} 
                    rules={{ required: "Title is required" }}
                    render={({ field, fieldState }) => (
                        <TextField {...field} value={field.value ?? ""} label="Title" 
                        variant="filled" fullWidth error={!!errors.title} />
                    )}
                />
            

                
            </div>

            <FileUploader file={image} setFile={setImage}></FileUploader>


        </form>


    </section>
  );
}