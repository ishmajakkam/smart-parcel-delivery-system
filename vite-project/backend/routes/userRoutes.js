const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// REGISTER
// ==========================================

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone.replace(/\D/g, "");

    const existingEmail = await User.findOne({
      email: cleanEmail,
    });

    if (existingEmail) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const existingPhone = await User.findOne({
      phone: cleanPhone,
    });

    if (existingPhone) {
      return res.status(400).json({
        message: "Phone number already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });

  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Server error during registration",
    });
  }
});


// ==========================================
// CHECK USER
// ==========================================

router.post("/check-user", async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({
        message: "Email or mobile number is required",
      });
    }

    const value = identifier.trim();

    let user;

    if (value.includes("@")) {
      user = await User.findOne({
        email: value.toLowerCase(),
      });
    } else {
      const phone = value.replace(/\D/g, "");

      user = await User.findOne({
        phone,
      });
    }

    if (!user) {
      return res.status(404).json({
        message:
          "No account found with this email or mobile number.",
      });
    }

    res.status(200).json({
      message: "User found",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });

  } catch (error) {
    console.error("Check user error:", error);

    res.status(500).json({
      message: "Server error while checking user",
    });
  }
});


// ==========================================
// PASSWORD LOGIN + JWT
// ==========================================

router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message:
          "Email/mobile number and password are required",
      });
    }

    const value = identifier.trim();

    let user;

    if (value.includes("@")) {
      user = await User.findOne({
        email: value.toLowerCase(),
      });
    } else {
      const phone = value.replace(/\D/g, "");

      user = await User.findOne({
        phone,
      });
    }

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email/mobile number or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message:
          "Invalid email/mobile number or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Server error during login",
    });
  }
});


// ==========================================
// OTP LOGIN + JWT
// ==========================================

router.post("/otp-login", async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({
        message: "Email or mobile number is required",
      });
    }

    const value = identifier.trim();

    let user;

    if (value.includes("@")) {
      user = await User.findOne({
        email: value.toLowerCase(),
      });
    } else {
      const phone = value.replace(/\D/g, "");

      user = await User.findOne({
        phone,
      });
    }

    if (!user) {
      return res.status(404).json({
        message:
          "No account found with this email or mobile number.",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "OTP login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });

  } catch (error) {
    console.error("OTP login error:", error);

    res.status(500).json({
      message: "Server error during OTP login",
    });
  }
});

// ==========================================
// GET CURRENT USER
// PROTECTED ROUTE
// ==========================================

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Authenticated user",
      user,
    });

  } catch (error) {
    console.error("Get user error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;