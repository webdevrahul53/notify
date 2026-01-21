import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ status: 401, message: "Unauthorized Access" });
  }

  try {
    const response = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    if (!response) {
      return res.status(401).json({ status: 401, message: "Unauthorized Access" });
    }
    next();
  } catch (error) {
    return res.status(401).json({ status: 401, message: "Session Expired", error });
  }
};

export default authMiddleware;
