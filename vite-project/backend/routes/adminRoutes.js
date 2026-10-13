const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");
const Order = require("../models/Order");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();


// =====================================================
// ADMIN LOGIN
// POST /api/admin/login
// =====================================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const admin = await Admin.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!admin) {
      return res.status(401).json({
        message: "Invalid admin credentials",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      admin.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid admin credentials",
      });
    }

    const token = jwt.sign(
      {
        adminId: admin._id,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Admin login successful",

      token,

      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });

  } catch (error) {
    console.error("Admin login error:", error);

    res.status(500).json({
      message: "Server error during admin login",
    });
  }
});


// =====================================================
// GET ALL ORDERS
// GET /api/admin/orders
// ADMIN ONLY
// =====================================================

router.get(
  "/orders",
  adminMiddleware,
  async (req, res) => {
    try {

      const orders = await Order.find()
        .sort({
          createdAt: -1,
        });

      res.status(200).json({
        message: "Admin orders fetched successfully",
        orders,
      });

    } catch (error) {

      console.error(
        "Admin get orders error:",
        error
      );

      res.status(500).json({
        message:
          "Server error while fetching admin orders",
      });
    }
  }
);


// =====================================================
// UPDATE ORDER STATUS
// PATCH /api/admin/orders/:id/status
// ADMIN ONLY
// =====================================================

router.patch(
  "/orders/:id/status",
  adminMiddleware,
  async (req, res) => {
    try {

      const { status } = req.body;

      const allowedStatuses = [
        "Order Placed",
        "Order Confirmed",
        "Shipped",
        "Out for Delivery",
        "Delivered",
      ];

      if (!status) {
        return res.status(400).json({
          message: "Status is required",
        });
      }

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid order status",
        });
      }

      const order = await Order.findById(
        req.params.id
      );

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      order.status = status;

      await order.save();

      res.status(200).json({
        message:
          "Order status updated successfully",
        order,
      });

    } catch (error) {

      console.error(
        "Admin update status error:",
        error
      );

      res.status(500).json({
        message:
          "Server error while updating order status",
      });
    }
  }
);


module.exports = router;