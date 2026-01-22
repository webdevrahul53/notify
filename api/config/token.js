import jwt from "jsonwebtoken"


const generateAccessToken = (user) => {
    return jwt.sign({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
    }, process.env.JWT_ACCESS_SECRET, { expiresIn: "10m" })

}


const generateRefreshToken = (user) => {
    return jwt.sign({ _id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "2h" })
}


export { generateAccessToken, generateRefreshToken }