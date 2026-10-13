const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // Customer who placed the order
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Products in the order
    items: [
      {
        productId: {
          type: String,
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        price: {
          type: Number,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          default: 1,
        },

        image: {
          type: String,
          default: "",
        },

        color: {
          type: String,
          default: "",
        },

        category: {
          type: String,
          default: "",
        },

        deliveryDate: {
          type: String,
          default: "",
        },
      },
    ],

    // Order price details
    subtotal: {
      type: Number,
      required: true,
    },

    deliveryFee: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
      required: true,
    },

    // ==========================================
    // CUSTOMER DELIVERY ADDRESS
    // ==========================================

    address: {
      name: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        required: true,
      },

      house: {
        type: String,
        required: true,
      },

      street: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      state: {
        type: String,
        required: true,
      },

      pincode: {
        type: String,
        required: true,
      },
    },

    // ==========================================
    // CUSTOMER CURRENT GPS LOCATION
    // ==========================================
    // This is the actual location of the customer's
    // phone/browser when the order is placed.
    //
    // Example:
    // latitude: 17.577102
    // longitude: 78.423905

    customerLocation: {
      latitude: {
        type: Number,
        default: null,
      },

      longitude: {
        type: Number,
        default: null,
      },
    },

    // ==========================================
    // DELIVERY ADDRESS GPS LOCATION
    // ==========================================
    // This is the GPS location of the address
    // entered by the customer.
    //
    // THIS LOCATION IS USED BY THE DELIVERY
    // PARTNER FOR ROUTE CALCULATION.

    deliveryLocation: {
      latitude: {
        type: Number,
        default: null,
      },

      longitude: {
        type: Number,
        default: null,
      },
    },

    // ==========================================
    // ORDER STATUS
    // ==========================================

    status: {
      type: String,

      default: "Order Placed",

      enum: [
        "Order Placed",
        "Order Confirmed",
        "Shipped",
        "Out for Delivery",
        "Delivered",
      ],
    },
  },

  {
    timestamps: true,
  }
);

const Order = mongoose.model(
  "Order",
  orderSchema
);

module.exports = Order;