import '../styles/Login.css'
import { Button, Checkbox, FormControlLabel, TextField } from '@mui/material'
import { useState } from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utilities/axiosInstance';
import { showSnackbar } from '../redux/slices/snackbar';
import { useForm } from "react-hook-form";
import { setCredentials } from '../redux/slices/auth';



const Login = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await axiosInstance.post("/users/login", data);
      console.log(response)

      if (response.status === 200) {
        dispatch(setCredentials(response.data))
        dispatch(showSnackbar({ message: "Logged In Successfully", severity: 'success', }));
        navigate("/");
        
      }

      
    } catch (error) {
      console.error(error)
    }
  }


  return (
    <section className="login-container">
      <div className="wrapper"></div>
      <div></div>
      <div className="image-container">
        {/* <img src="https://thumbs.dreamstime.com/b/multi-factor-authentication-illustration-mfa-vector-editable-297401593.jpg" width={"100%"} alt=""/> */}
        <img src="/logo.png" width={"100%"} alt="" />
        <img src="/login.gif" width={"100%"} alt="" />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="login-form">
        <img src="./shyamlogo.png" width={100} alt=""/>
        <h1 className="login-title">Authentication</h1>
        <TextField label="Email Id / Username" variant="filled" fullWidth
          {...register("email", { required: "Email is required" })}
        />

        <TextField className="text-field" label="Password" variant="filled" fullWidth
          type={showPassword ? 'text' : 'password'}
          {...register("password", {
            required: "Password is required",
            minLength: { value: 6, message: "Minimum 6 characters" },
          })}
          InputProps={{
            endAdornment: (
              <div onClick={handleTogglePasswordVisibility} style={{marginBottom: "-10px", cursor: "pointer"}}>
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </div>
            ),
          }}
        />


        <FormControlLabel checked control={<Checkbox />} label="Remember Me" />

        <div>
          <a className="forgot-password" href="">Forgot Password ?</a>
        </div>

        <Button type="submit" size="large" variant="contained" disabled={loading}>Login</Button>
        
      </form>
    </section>
    
  )
}

export default Login