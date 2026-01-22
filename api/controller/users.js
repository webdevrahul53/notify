import Users from "../model/users.js"
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../config/token.js";

const usersList = async (req, res) => {
    let data = await Users.find();
    res.json({ status: 200, message: "Users list route", data })
}

const getUserById = async (req, res) => {
    const { id } = req.params;
    let data = await Users.findById(id);
    res.json({ status: 200, message: `User data for id ${id}`, data })
}

const loginUser = async (req, res) => {
    
    const { email, password } = req.body;
    if(!email || !password)
    return res.status(400).json({ status: 400, message: "Email and Password are required" });

    
    try {
        const response = await Users.findOne({email})
        if(!response) res.status(500).json({ status:500, message: "Incorrect Email or Password." })
        
        const isMatch = await bcrypt.compare(password, response.password);
        if(isMatch) {
            const accessToken = generateAccessToken(response);
            const refreshToken = generateRefreshToken(response);
            
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.APP_ENV === "production",
                sameSite: process.env.APP_ENV === "production" ? "none" : "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                path: "/api/users/refresh-token",
            });
            res.status(200).json({ status: 200, user: {
                _id: response._id,
                fullName: response.fullName,
                email: response.email,   
            }, accessToken })
        }
        else res.status(500).json({ status: 500, message: "Incorrect Email or Password" })
    }catch (error) {
        res.status(500).json({ status: 500, err: error.message })
    }
}

const registerUser = async (req, res) => {
    const { fullName, email, password } = req.body;

    if(!fullName || !email || !password) 
    return res.status(400).json({ status: 400, message: "All fields are required" });

    const hashed = await bcrypt.hash(password, 10)
    
    try {
        const response = await Users.create({ fullName, email, password: hashed, passwordBackup: password })
        if(response) {
            const accessToken = generateAccessToken(response);
            const refreshToken = generateRefreshToken(response);
            res.json({ status: 200, message: "User registered successfully", _id: response._id, accessToken, refreshToken });
        }else {
            res.status(500).json({ status: 500, message: "Something went wrong" })
        }


    }catch (error) {
        res.status(500).json({ status: 500, message: "Error registering user", error: error.message })
    }
}


const deleteUser = async (req, res) => {
    const { id } = req.params;
    if(!id) return res.status(400).json({ status: 400, message: "User ID is required" });

    try {
        const response = await Users.findByIdAndDelete(id);
        res.json({ status: 200, message: `User with id ${id} deleted successfully`, data: response });
    }catch (error) {
        console.log(error)
    }
}

const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ status: 401, message: "Refresh token is required", });

    const user = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const accessToken = generateAccessToken(user)
    return res.status(200).json({ status: 200, accessToken, });

  } catch (error) {
    if (error.name === "TokenExpiredError")
    return res.status(403).json({ status: 403, message: "Refresh token expired", });

    return res.status(403).json({ status: 403, message: "Invalid refresh token", });
  }
};


const logoutUser = (req, res) => {
  res.clearCookie("refreshToken", { path: "/api/users/refresh-token", });
  return res.status(200).json({ status: 200, message: "Logged out" });
};


export { usersList, loginUser, registerUser, deleteUser, getUserById, refreshToken, logoutUser  };