require("dns").setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const DeliveryBoy = require("./models/DeliveryBoy");

async function createDeliveryBoy() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const existing = await DeliveryBoy.findOne({
      email: "delivery@smartparcel.com",
    });

    if (existing) {
      console.log("Delivery boy already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      "delivery123",
      10
    );

    await DeliveryBoy.create({
      name: "SmartParcel Delivery",
      email: "delivery@smartparcel.com",
      phone: "9876543211",
      password: hashedPassword,
      isAvailable: true,
    });

    console.log("✅ Delivery boy created");
    console.log("Email: delivery@smartparcel.com");
    console.log("Password: delivery123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createDeliveryBoy();