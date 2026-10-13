const mongoose = require("mongoose");
require("dotenv").config();

const Order = require("./models/Order");


// =====================================================
// GEOCODE ADDRESS
// =====================================================

async function geocodeAddress(address) {
  try {
    const fullAddress = [
      address.house,
      address.street,
      address.city,
      address.state,
      address.pincode,
      "India",
    ]
      .filter(Boolean)
      .join(", ");

    console.log("\n🔎 Searching:");
    console.log(fullAddress);

    const url =
      "https://nominatim.openstreetmap.org/search" +
      `?format=json&limit=1&q=${encodeURIComponent(
        fullAddress
      )}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "SmartParcelDelivery/1.0",
      },
    });

    if (!response.ok) {
      console.log(
        "❌ Geocoding failed:",
        response.status
      );

      return null;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      console.log(
        "⚠️ No GPS coordinates found"
      );

      return null;
    }

    const latitude = Number(data[0].lat);
    const longitude = Number(data[0].lon);

    console.log(
      `📍 Found: ${latitude}, ${longitude}`
    );

    return {
      latitude,
      longitude,
    };

  } catch (error) {
    console.log(
      "❌ Geocoding error:",
      error.message
    );

    return null;
  }
}


// =====================================================
// MAIN
// =====================================================

async function backfillLocations() {
  try {

    console.log(
      "🔌 Connecting to MongoDB..."
    );

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "✅ MongoDB connected"
    );


    // Find orders that don't have GPS
    const orders = await Order.find({
      $or: [
        {
          "deliveryLocation.latitude":
            null,
        },
        {
          "deliveryLocation.longitude":
            null,
        },
      ],
    });


    console.log(
      `📦 Orders needing GPS: ${orders.length}`
    );


    if (orders.length === 0) {
      console.log(
        "✅ All orders already have GPS coordinates."
      );

      await mongoose.disconnect();

      process.exit(0);
    }


    for (const order of orders) {

      console.log(
        "\n================================="
      );

      console.log(
        `Order: ${order._id}`
      );

      console.log(
        `Customer: ${order.address.name}`
      );


      const location =
        await geocodeAddress(
          order.address
        );


      if (location) {

        order.deliveryLocation = {
          latitude:
            location.latitude,

          longitude:
            location.longitude,
        };

        await order.save();

        console.log(
          "✅ GPS saved successfully"
        );

      } else {

        console.log(
          "⚠️ Could not find GPS for this order"
        );
      }


      // Nominatim asks clients to
      // keep requests at about 1 request/sec.
      await new Promise(
        (resolve) =>
          setTimeout(resolve, 1200)
      );
    }


    console.log(
      "\n================================="
    );

    console.log(
      "🎉 GPS backfill completed!"
    );


    await mongoose.disconnect();

    process.exit(0);

  } catch (error) {

    console.error(
      "❌ Error:",
      error.message
    );

    await mongoose.disconnect();

    process.exit(1);
  }
}


backfillLocations();