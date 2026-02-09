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
    subject: "",
    title: "",
    contentImage: "",
}


export default function AddEditBirthday() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const { register, control, handleSubmit, reset, formState: {errors} } = useForm({
        defaultValues: DEFAULTVALUES
    });

    const contentImage = useWatch({ control, name: "contentImage" })

    const [searchParams] = useSearchParams();
    const _id = searchParams.get("_id");
    React.useEffect(() => {
        _id && getBirthdayById(_id);
    }, [_id]);


    const getBirthdayById = async (id) => {
        try {
            const result = await axiosInstance.get(`/birthday/${id}`).then(res => res.data);
            // console.log(result.data)
            if (result.status === 200) {
                reset(result.data)
                setImage({...result.data.contentImage, isExisting: true})
            } else {
                console.error("Error fetching Deed by ID:", result.message);
            }
        } catch (error) {
            console.error("Error fetching Deed by ID:", error);
        }
    };

    
    const onSubmit = async (data) => {
        if(isLoading) return;
        try {
            setLoading(true)
            if(image?.file) data.contentImage = image?.file;
            else delete data.contentImage
            console.log(image)
            const formData = new FormData();
            for (const key in data) formData.append(key, data[key]);
            const url = _id ? `/birthday/${_id}` : "/birthday"
            const response = await axiosInstance[_id ? "put":"post"](url, formData).then(res => res.data)
            console.log(response)
            if (response.status === 200) {
                navigate('/birthday');
                dispatch(showSnackbar({ message: response.message, severity: 'success', duration: 2000 }));
                setLoading(false)
            }
            else {
                console.error("Error creating Deed record:", response.message);
                setLoading(false)
            }

        }catch (error) {
            dispatch(showSnackbar({ message: error.message, severity: 'error', duration: 2000 }));
            setLoading(false)
        }
    };
    
  
  return (
    <section className="inspection-entry-form">
        
        

        <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem"}}>
                <div>
                    
                    <Typography className="title" color="primary">
                        <Link to={"/birthday"}><ArrowBack color="primary" style={{ fontSize: "3rem", margin: "-10px 0" }} /> </Link>
                        {_id ? "Edit Birthday":"Add New Birthday"}
                    </Typography>

                </div>
                <div style={{display: "flex", gap: "1rem"}}>
                    <Button variant="contained" size="large" type="submit" disabled={isLoading}>{_id ? "UPDATE":"SAVE"}</Button>
                    {!_id && <Button variant="outlined" size="large" color="warning" type="button" onClick={() => {
                        reset(DEFAULTVALUES)
                    }}>Reset</Button>}
                </div>
    
            </div>

            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginTop: "20px"}}>

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