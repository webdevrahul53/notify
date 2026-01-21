import "../../styles/Drawer.css";
import { AccountTree, Add, Close, Save } from '@mui/icons-material'
import { Button, Checkbox, FormControlLabel, IconButton, TextField, Typography } from '@mui/material'
import React from 'react'
import { RippleEffect } from "../../utilities/ripple";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { showSnackbar } from "../../redux/slices/snackbar";
import axiosInstance from "../../utilities/axiosInstance";

const AddEditUsers = (props) => {

    const user = useSelector((state) => state.auth.user)
    const dispatch = useDispatch();

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            fullName: "",
        },
        mode: "onBlur",
        reValidateMode: "onChange",
    });

    React.useEffect(() => {
        if(props.user) reset(props.user)
    }, [props.user])

    const onSubmit = async (data) => {
        // console.log(user)
        // console.log(data);
        data.createdby = user?._id;
        data.status = "Active";
        
        try {
            let id = props?.user?._id
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
        reset(props.user);
    };

    return (
        <section className="drawer-container">
            <div className="drawer-header">
                <Typography className="title" color="primary">
                    <AccountTree color="primary" style={{ fontSize: "2rem", margin: "-10px 0" }} /> {props.user != null ? 'EDIT USER' : 'ADD USER'}
                </Typography>
                <IconButton onClick={() => props.onClose()}> <Close color="error" width={300} /> </IconButton>
            </div>
            <form className="drawer-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="input-container"> 
                    <TextField label="Full Name" variant="filled" fullWidth 
                        {...register("fullName", { required: "Full Name is required" })}
                        error={!!errors.fullName} helperText={errors.fullName?.message}
                    /> 
                </div>
                <div className="input-container"> 
                    <TextField label="Email" variant="filled" fullWidth 
                        {...register("email", { required: "Email is required" })}
                        error={!!errors.email} helperText={errors.email?.message}
                    /> 
                </div>
                {!props?.user && <div className="input-container"> 
                    <TextField label="Password" variant="filled" fullWidth 
                        {...register("password", { required: "Password is required" })}
                        error={!!errors.password} helperText={errors.password?.message}
                    /> 
                </div>}
                

                <div className="action-buttons">
                    <div style={{padding: "1rem 2rem", display: "flex", alignItems: "center", gap: "1rem"}}>
                        <Button type="submit" variant="contained" size="large">
                            {props.user != null ? "UPDATE":<> ADD <Add style={{ margin: "-3px 0 0 4px" }} /></>} 
                        </Button>
                        
                        <div className="reset-button" onClick={handleReset}> Reset </div>
                    </div>
                </div>
            </form>
        </section>
    )
}

export default AddEditUsers