// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "./Schema/User.js"; // your User schema

const authMiddleware = async (req, res, next) => {
  try {
    // Expecting token in header: "Authorization: Bearer <token>"
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1]; // get the token part
    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.SECRET_ACCESS_KEY);
    if (!decoded?.id) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Fetch user from DB to make sure it exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach user info to request object
    req.user = { id: user._id };
    next(); // move to the next middleware/route
  } catch (err) {
    console.error("AuthMiddleware Error:", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default authMiddleware;