require("dns").setServers(["8.8.8.8", "8.8.4.4"]);
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const DeliveryBoy = require("./models/DeliveryBoy");

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const hashedPassword = await bcrypt.hash(
      "delivery123",
      10
    );

    const deliveryBoy =
      await DeliveryBoy.findOneAndUpdate(
        {
          email: "delivery@smartparcel.com",
        },
        {
          password: hashedPassword,
        },
        {
          new: true,
        }
      );

    if (!deliveryBoy) {
      console.log(
        "❌ Delivery boy account not found"
      );
      process.exit(1);
    }

    console.log(
      "✅ Password reset successfully"
    );

    console.log(
      "Email: delivery@smartparcel.com"
    );

    console.log(
      "Password: delivery123"
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "❌ Error:",
      error.message
    );

    process.exit(1);
  }
}

resetPassword();