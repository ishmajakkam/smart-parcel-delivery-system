const mongoose = require("mongoose");
require("dotenv").config();

const Order = require("./models/Order");

async function backfillLocations() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected");

    const result = await Order.updateMany(
      {
        $or: [
          { "deliveryLocation.latitude": { $exists: false } },
          { "deliveryLocation.latitude": null },
          { "deliveryLocation.longitude": { $exists: false } },
          { "deliveryLocation.longitude": null },
        ],
      },
      {
        $set: {
          deliveryLocation: {
            latitude: 17.5801,
            longitude: 78.4239,
          },
        },
      }
    );

    console.log(`📍 Updated ${result.modifiedCount} orders`);
    console.log("✅ Customer GPS coordinates added");

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

backfillLocations();