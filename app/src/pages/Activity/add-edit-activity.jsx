import "../../styles/Drawer.css";
import { AccountTree, Add, Close, PlaylistAdd, Save } from '@mui/icons-material'
import { Button, Checkbox, FormControlLabel, IconButton, TextField, Typography } from '@mui/material'
import React from 'react'
import { RippleEffect } from "../../utilities/ripple";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { showSnackbar } from "../../redux/slices/snackbar";
import axiosInstance from "../../utilities/axiosInstance";

const AddEditActivity = (props) => {

    const user = useSelector((state) => state.auth.user)
    const dispatch = useDispatch();

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            activityName: "",
        },
        mode: "onBlur",
        reValidateMode: "onChange",
    });

    React.useEffect(() => {
        if(props.activity) reset(props.activity)
    }, [props.activity])

    const onSubmit = async (data) => {
        // console.log(user)
        // console.log(data);
        data.createdby = user?._id;
        data.status = "Active";
        
        try {
            let id = props?.activity?._id
            let url = id ? `/activity/${id}` : `/activity`
            const result = await axiosInstance[id ? "patch":"post"](url, data).then(res => res.data)
            
            if(result.status === 200){
                props.onClose(); // Close the drawer
                dispatch(showSnackbar({ message: result.message, severity: 'success', }));
            }

        } catch (error) {
            const message = error.response ? error.response.data.message : error.message;
            dispatch(showSnackbar({ message, severity: 'error', }));
        }
    };

    const handleReset = (e) => {
        RippleEffect(e)
        reset(props.activity);
    };

    return (
        <section className="drawer-container">
            <div className="drawer-header">
                <Typography className="title" color="primary">
                    <PlaylistAdd color="primary" style={{ fontSize: "2rem", margin: "-10px 0" }} /> {props.activity != null ? 'EDIT ACTIVITY' : 'ADD ACTIVITY'}
                </Typography>
                <IconButton onClick={() => props.onClose()}> <Close color="error" width={300} /> </IconButton>
            </div>
            <form className="drawer-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="input-container"> 
                    <TextField label="Activity Name" variant="filled" fullWidth 
                        {...register("activityName", { required: "Activity Name is required" })}
                        error={!!errors.activityName} helperText={errors.activityName?.message}
                    /> 
                </div>
                

                <div className="action-buttons">
                    <div style={{padding: "1rem 2rem", display: "flex", alignItems: "center", gap: "1rem"}}>
                        <Button type="submit" variant="contained" size="large">
                            {props.activity != null ? "UPDATE":<> ADD <Add style={{ margin: "-3px 0 0 4px" }} /></>} 
                        </Button>
                        
                        <div className="reset-button" onClick={handleReset}> Reset </div>
                    </div>
                </div>
            </form>
        </section>
    )
}

export default AddEditActivity