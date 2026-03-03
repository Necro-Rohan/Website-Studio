import dotenv from "dotenv";
dotenv.config()

export const verifyAdmin = (req, res, next) => {
  const userKey = req.headers["x-admin-secret"];
  if (userKey !== process.env.ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: "Unauthorized: Invalid Admin Key" });
  }
  next(); 
};


