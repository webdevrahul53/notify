import "../../styles/InspectionEntryForm.css";

import React, { useState } from 'react';
import { ArrowBack } from "@mui/icons-material";
import { Button, Checkbox, FormControl, FormHelperText, InputLabel, ListItemText, MenuItem, Select, TextField, Typography } from "@mui/material";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { showSnackbar } from "../../redux/slices/snackbar";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import FileUploader from "../../components/FileUploader";
import axiosInstance from "../../utilities/axiosInstance";
// import POGPForm from "../../components/pogpform";

const DEFAULTVALUES = {
    scheduleDate: "",
    activityId: "",
    accountId: "",
    subject: "",
    title: "",
    contentImage: "",
}


export default function AddEditEvent() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [activityList, setActivityList] = useState([]);
    const [accountList, setAccountList] = useState([]);
    const [image, setImage] = useState(null);
    const [search, setSearch] = React.useState("");
    const { register, control, handleSubmit, reset, formState: {errors} } = useForm({
        defaultValues: DEFAULTVALUES
    });

    const contentImage = useWatch({ control, name: "contentImage" })

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
                axiosInstance.get(`/account?status=true`).then(res => res.data),
            ]);
        
            const [activityRes, accountsRes] = results;
            console.log(activityRes, accountsRes)

            setActivityList(activityRes.status === "fulfilled" ? activityRes.value.data : []);
            setAccountList(accountsRes.status === "fulfilled" ? accountsRes.value.data : []);
            
        
        } catch (error) {
            console.error("Unexpected error fetching lists:", error);
            dispatch(showSnackbar({ message: "Failed to fetch lists", severity: 'error', duration: 2000 }));
        }
    };

    const getEventById = async (id) => {
        try {
            const result = await axiosInstance.get(`/event/${id}`).then(res => res.data);
            // console.log(result.data)
            if (result.status === 200) {
                const scheduleDate = result.data.scheduleDate.split("T")[0];
                reset({...result.data, scheduleDate})
                setImage({...result.data.contentImage, isExisting: true})
            } else {
                console.error("Error fetching Deed by ID:", result.message);
            }
        } catch (error) {
            console.error("Error fetching Deed by ID:", error);
        }
    };

    
    const onSubmit = async (data) => {
        if(image?.file) data.contentImage = image?.file;
        else delete data.contentImage
        console.log(image)
        const formData = new FormData();
        for (const key in data) formData.append(key, data[key]);

        try {
            const url = _id ? `/event/${_id}` : "/event"
            const response = await axiosInstance[_id ? "put":"post"](url, formData).then(res => res.data)
            console.log(response)
            if (response.status === 200) {
                navigate('/events');
                dispatch(showSnackbar({ message: response.message, severity: 'success', duration: 2000 }));
            }
            else {
                console.error("Error creating Deed record:", response.message);
            }

        }catch (error) {
            dispatch(showSnackbar({ message: error.message, severity: 'error', duration: 2000 }));

        }
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

            {/* {JSON.stringify(control._formValues)} */}

            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "20px"}}>

                <Controller name="scheduleDate" control={control} defaultValue={control._formValues.scheduleDate ?? ""} 
                    rules={{ required: "Schedule Date is required" }}
                    render={({ field, fieldState }) => (
                        <TextField type="date" {...field} value={field.value ?? ""} label="Schedule Date" 
                        variant="filled" fullWidth error={!!errors.scheduleDate} InputLabelProps={{ shrink: true }} />
                    )}
                />

                <Controller name="activityId" control={control} rules={{ required: "Activity is required" }}
                    render={({ field }) => (
                    <FormControl variant="filled" fullWidth error={!!errors?.activityId}>
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


                
                <Controller
                    name="accountId"
                    control={control}
                    rules={{ required: "Accounts are required" }}
                    render={({ field }) => {

                        const filteredAccounts = accountList.filter(acc =>
                        acc.accountName.toLowerCase().includes(search.toLowerCase()) ||
                        acc.accountEmail.toLowerCase().includes(search.toLowerCase())
                        );

                        const allFilteredIds = filteredAccounts.map(acc => acc._id);
                        const isAllSelected =
                        allFilteredIds.length > 0 &&
                        allFilteredIds.every(id => field.value?.includes(id));

                        const handleChange = (event) => {
                        const value = event.target.value;

                        if (value.includes("all")) {
                            field.onChange(
                            isAllSelected
                                ? field.value.filter(id => !allFilteredIds.includes(id))
                                : [...new Set([...(field.value || []), ...allFilteredIds])]
                            );
                        } else {
                            field.onChange(value);
                        }
                        };

                        return (
                        <FormControl fullWidth variant="filled" error={!!errors?.accountId}>
                            <InputLabel>Accounts</InputLabel>

                            <Select
                            multiple
                            value={field.value || []}
                            onChange={handleChange}
                            renderValue={(selected) =>
                                accountList
                                .filter(acc => selected.includes(acc._id))
                                .map(acc => acc.accountName)
                                .join(", ")
                            }
                            MenuProps={{ autoFocus: false }}
                            >

                            {/* 🔍 Search Box */}
                            <MenuItem disableRipple>
                                <TextField
                                autoFocus
                                size="small"
                                fullWidth
                                placeholder="Search by name or email"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.stopPropagation()}
                                />
                            </MenuItem>

                            {/* Select All (filtered) */}
                            <MenuItem value="all">
                                <Checkbox checked={isAllSelected} />
                                <ListItemText primary="Select All" />
                            </MenuItem>

                            {filteredAccounts.map(account => (
                                <MenuItem key={account._id} value={account._id}>
                                <Checkbox checked={field.value?.includes(account._id)} />
                                <ListItemText
                                    primary={
                                    <div style={{ padding: "0 8px" }}>
                                        <div>{account.accountName}</div>
                                        <small style={{ color: "gray" }}>
                                        {account.accountEmail}
                                        </small>
                                    </div>
                                    }
                                />
                                </MenuItem>
                            ))}

                            {filteredAccounts.length === 0 && (
                                <MenuItem disabled>
                                <ListItemText primary="No accounts found" />
                                </MenuItem>
                            )}
                            </Select>

                            {errors?.accountId && (
                            <FormHelperText>{errors.accountId.message}</FormHelperText>
                            )}
                        </FormControl>
                        );
                    }}
                />


                <Controller name="subject" control={control} defaultValue={control._formValues.subject ?? ""} 
                    rules={{ required: "Subject is required" }}
                    render={({ field, fieldState }) => (
                        <TextField {...field} value={field.value ?? ""} label="Subject" 
                        variant="filled" fullWidth error={!!errors.subject} />
                    )}
                />


            </div>

            <textarea id="title" cols={80} rows={5} style={{padding: "10px", marginTop: "1rem"}}
                placeholder="Enter Mail Text Here ..."
                {...register("title", {
                required: false,
                maxLength: {
                    value: 500,
                    message: "Maximum 500 characters allowed"
                }
                })}
            ></textarea>


            <FileUploader file={image} setFile={setImage}></FileUploader>

        </form>


    </section>
  );
}