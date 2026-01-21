import "../../styles/Drawer.css";
import { AccountTree, Add, Close, Save } from '@mui/icons-material'
import { Button, Checkbox, FormControlLabel, IconButton, TextField, Typography } from '@mui/material'
import React from 'react'
import { RippleEffect } from "../../utilities/ripple";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { showSnackbar } from "../../redux/slices/snackbar";
import axiosInstance from "../../utilities/axiosInstance";

const AddEditAccount = (props) => {

    const user = useSelector((state) => state.auth.user)
    const dispatch = useDispatch();

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            accountName: "",
            email: "",
            dateOfBirth: "",
            phoneNumber: "",
            location: "",
            employeeCode: "",
            anniversaryDate: ""
        },
        mode: "onBlur",
        reValidateMode: "onChange",
    });

    React.useEffect(() => {
        if(props.account) reset(props.account)
    }, [props.account])

    const onSubmit = async (data) => {
        // console.log(user)
        // console.log(data);
        data.createdby = user?._id;
        data.status = "Active";
        
        try {
            let id = props?.account?._id
            let url = id ? `/prcss/update?id=${id}` : `/prcss/create`
            const result = await axiosInstance[id ? "put":"post"](url, data).then(res => res.data)
            
            if(result.statuscode === 201){
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
        reset(props.account);
    };

    return (
        <section className="drawer-container">
            <div className="drawer-header">
                <Typography className="title" color="primary">
                    <AccountTree color="primary" style={{ fontSize: "2rem", margin: "-10px 0" }} /> {props.account != null ? 'EDIT ACCOUNT' : 'ADD ACCOUNT'}
                </Typography>
                <IconButton onClick={() => props.onClose()}> <Close color="error" width={300} /> </IconButton>
            </div>
            <form className="drawer-form" onSubmit={handleSubmit(onSubmit)} style={{ height: "calc(100vh - 200px)", overflow: "auto" }}>
                <div className="input-container"> 
                    <TextField label="Account Name" variant="filled" fullWidth 
                        {...register("accountName", { required: "Account Name is required" })}
                        error={!!errors.accountName} helperText={errors.accountName?.message}
                    /> 
                </div>
                <div className="input-container"> 
                    <TextField label="Email" variant="filled" fullWidth 
                        {...register("email", { required: "Email is required" })}
                        error={!!errors.email} helperText={errors.email?.message}
                    /> 
                </div>
                <div className="input-container"> 
                    <TextField label="Date Of Birth" variant="filled" fullWidth 
                        {...register("dateOfBirth", { required: "Date Of Birth is required" })}
                        error={!!errors.dateOfBirth} helperText={errors.dateOfBirth?.message}
                    /> 
                </div>
                <div className="input-container"> 
                    <TextField label="Phone Number" variant="filled" fullWidth {...register("phoneNumber")}
                        error={!!errors.phoneNumber} helperText={errors.phoneNumber?.message}
                    /> 
                </div>
                <div className="input-container"> 
                    <TextField label="Location" variant="filled" fullWidth {...register("location")}
                        error={!!errors.location} helperText={errors.location?.message}
                    /> 
                </div>
                <div className="input-container"> 
                    <TextField label="Employee Code" variant="filled" fullWidth {...register("employeeCode")}
                        error={!!errors.employeeCode} helperText={errors.employeeCode?.message}
                    /> 
                </div>
                <div className="input-container"> 
                    <TextField label="Anniversary Date" variant="filled" fullWidth {...register("anniversaryDate")}
                        error={!!errors.anniversaryDate} helperText={errors.anniversaryDate?.message}
                    /> 
                </div>

                

                <div className="action-buttons">
                    <div style={{padding: "1rem 2rem", display: "flex", alignItems: "center", gap: "1rem"}}>
                        <Button type="submit" variant="contained" size="large">
                            {props.account != null ? "UPDATE":<> ADD <Add style={{ margin: "-3px 0 0 4px" }} /></>} 
                        </Button>
                        
                        <div className="reset-button" onClick={handleReset}> Reset </div>
                    </div>
                </div>
            </form>
        </section>
    )
}

export default AddEditAccount