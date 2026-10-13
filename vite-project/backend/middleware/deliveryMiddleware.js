const jwt = require("jsonwebtoken");

const deliveryMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Delivery authentication required",
      });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({
        message: "Invalid delivery token",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "delivery") {
      return res.status(403).json({
        message: "Delivery access required",
      });
    }

    req.deliveryBoy = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired delivery token",
    });
  }
};

module.exports = deliveryMiddleware;