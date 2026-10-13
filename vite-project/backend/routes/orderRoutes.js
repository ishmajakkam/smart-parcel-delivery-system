const express = require("express");

const Order = require("../models/Order");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// GEOCODE DELIVERY ADDRESS
// =====================================================
// Converts customer's entered delivery address
// into latitude + longitude.
//
// IMPORTANT:
//
// customerLocation = where customer's phone is
//
// deliveryLocation = where parcel must be delivered
//
// These are intentionally kept separate.
// =====================================================

async function geocodeAddress(address) {
  try {

    // ===================================================
    // CREATE MULTIPLE SEARCH QUERIES
    // ===================================================

    const queries = [

      // -----------------------------------------------
      // 1. Full address
      // -----------------------------------------------

      [
        address.house,
        address.street,
        address.city,
        address.state,
        address.pincode,
        "India",
      ],

      // -----------------------------------------------
      // 2. Street + city + state + pincode
      // -----------------------------------------------

      [
        address.street,
        address.city,
        address.state,
        address.pincode,
        "India",
      ],

      // -----------------------------------------------
      // 3. City + state + pincode
      // -----------------------------------------------

      [
        address.city,
        address.state,
        address.pincode,
        "India",
      ],

      // -----------------------------------------------
      // 4. Pincode only
      // -----------------------------------------------

      [
        address.pincode,
        "India",
      ],

      // -----------------------------------------------
      // 5. City + state
      // -----------------------------------------------

      [
        address.city,
        address.state,
        "India",
      ],
    ];


    // ===================================================
    // CLEAN SEARCH QUERIES
    // ===================================================

    const searchQueries =
      queries.map((parts) =>
        parts
          .filter(Boolean)
          .map((value) =>
            String(value).trim()
          )
          .filter(Boolean)
          .join(", ")
      );


    console.log(
      "===================================="
    );

    console.log(
      "📍 STARTING DELIVERY ADDRESS GEOCODING"
    );

    console.log(
      "====================================");


    // ===================================================
    // TRY EACH QUERY
    // ===================================================

    for (const query of searchQueries) {

      try {

        console.log(
          "🔎 Trying:",
          query
        );


        // ---------------------------------------------
        // Nominatim URL
        // ---------------------------------------------

        const url =
          "https://nominatim.openstreetmap.org/search?" +
          new URLSearchParams({

            q: query,

            format: "json",

            limit: "1",

            countrycodes: "in",

            addressdetails: "1",

          });


        // ---------------------------------------------
        // REQUEST
        // ---------------------------------------------

        const response =
          await fetch(
            url,
            {
              headers: {

                "User-Agent":
                  "SmartParcel-Delivery/1.0",

                "Accept":
                  "application/json",

              },
            }
          );


        // ---------------------------------------------
        // HTTP ERROR
        // ---------------------------------------------

        if (!response.ok) {

          console.log(
            "⚠️ Nominatim error:",
            response.status
          );

          continue;
        }


        // ---------------------------------------------
        // READ RESULT
        // ---------------------------------------------

        const results =
          await response.json();


        // ---------------------------------------------
        // NO RESULT
        // ---------------------------------------------

        if (
          !results ||
          results.length === 0
        ) {

          console.log(
            "❌ No result for:",
            query
          );


          // Wait before next Nominatim request
          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                1000
              )
          );


          continue;
        }


        // ---------------------------------------------
        // GET COORDINATES
        // ---------------------------------------------

        const latitude =
          Number(
            results[0].lat
          );

        const longitude =
          Number(
            results[0].lon
          );


        // ---------------------------------------------
        // VALIDATE COORDINATES
        // ---------------------------------------------

        if (
          !Number.isFinite(
            latitude
          ) ||
          !Number.isFinite(
            longitude
          )
        ) {

          console.log(
            "⚠️ Invalid coordinates:",
            query
          );

          continue;
        }


        // ---------------------------------------------
        // SUCCESS
        // ---------------------------------------------

        console.log(
          "===================================="
        );

        console.log(
          "✅ DELIVERY LOCATION FOUND"
        );

        console.log(
          "Query:",
          query
        );

        console.log(
          "Latitude:",
          latitude
        );

        console.log(
          "Longitude:",
          longitude
        );

        console.log(
          "Display name:",
          results[0].display_name
        );

        console.log(
          "===================================="
        );


        return {
          latitude,
          longitude,
        };

      } catch (error) {

        console.log(
          "⚠️ Geocoding attempt failed:",
          error.message
        );

        continue;
      }
    }


    // ===================================================
    // ALL SEARCHES FAILED
    // ===================================================

    console.log(
      "❌ Could not find delivery address."
    );


    return null;

  } catch (error) {

    console.error(
      "❌ Geocoding failed:",
      error.message
    );


    return null;
  }
}


// =====================================================
// CREATE ORDER
// POST /api/orders
// =====================================================

router.post(
  "/",
  authMiddleware,

  async (req, res) => {

    try {

      // =================================================
      // GET DATA FROM CHECKOUT
      // =================================================

      const {
        items,
        subtotal,
        deliveryFee,
        total,
        address,

        // Customer's actual current GPS
        customerLocation,

      } = req.body;


      // =================================================
      // VALIDATE ITEMS
      // =================================================

      if (
        !items ||
        !Array.isArray(items) ||
        items.length === 0
      ) {

        return res.status(400).json({
          message:
            "Order must contain at least one item",
        });
      }


      // =================================================
      // VALIDATE ADDRESS
      // =================================================

      if (!address) {

        return res.status(400).json({
          message:
            "Delivery address is required",
        });
      }


      // =================================================
      // REQUIRED ADDRESS FIELDS
      // =================================================

      const requiredFields = [
        "name",
        "phone",
        "house",
        "street",
        "city",
        "state",
        "pincode",
      ];


      for (
        const field of requiredFields
      ) {

        if (
          !address[field] ||
          String(
            address[field]
          ).trim() === ""
        ) {

          return res.status(400).json({
            message:
              `${field} is required`,
          });
        }
      }


      // =================================================
      // VALIDATE PINCODE
      // =================================================

      const cleanPincode =
        String(
          address.pincode
        ).replace(
          /\D/g,
          ""
        );


      if (
        cleanPincode.length !== 6
      ) {

        return res.status(400).json({
          message:
            "Valid 6 digit pincode is required",
        });
      }


      // =================================================
      // CLEAN ORDER ITEMS
      // =================================================

      const cleanItems =
        items.map(
          (item) => ({

            productId:
              String(
                item.productId || ""
              ),

            name:
              String(
                item.name || ""
              ),

            price:
              Number(
                item.price || 0
              ),

            quantity:
              Number(
                item.quantity || 1
              ),

            image:
              item.image || "",

            color:
              item.color || "",

            category:
              item.category || "",

            deliveryDate:
              item.deliveryDate || "",
          })
        );


      // =================================================
      // CUSTOMER CURRENT GPS
      // =================================================
      //
      // This is the GPS of the customer's browser/device.
      //
      // It is NOT the delivery destination.
      //
      // =================================================

      let cleanCustomerLocation = {
        latitude: null,
        longitude: null,
      };


      if (
        customerLocation &&
        typeof customerLocation.latitude ===
          "number" &&
        typeof customerLocation.longitude ===
          "number"
      ) {

        cleanCustomerLocation = {

          latitude:
            customerLocation.latitude,

          longitude:
            customerLocation.longitude,

        };
      }


      console.log(
        "===================================="
      );

      console.log(
        "📍 CUSTOMER CURRENT GPS"
      );

      console.log(
        cleanCustomerLocation
      );

      console.log(
        "===================================="
      );


      // =================================================
      // GEOCODE DELIVERY ADDRESS
      // =================================================
      //
      // This is the location where the parcel should
      // actually be delivered.
      //
      // =================================================

      console.log(
        "🏠 Delivery Address:"
      );

      console.log(
        address.house
      );

      console.log(
        address.street
      );

      console.log(
        address.city
      );

      console.log(
        address.state
      );

      console.log(
        cleanPincode
      );


      const deliveryLocation =
        await geocodeAddress({

          house:
            String(
              address.house
            ).trim(),

          street:
            String(
              address.street
            ).trim(),

          city:
            String(
              address.city
            ).trim(),

          state:
            String(
              address.state
            ).trim(),

          pincode:
            cleanPincode,

        });


      // =================================================
      // CHECK DELIVERY LOCATION
      // =================================================

      if (!deliveryLocation) {

        return res.status(400).json({

          message:
            "Could not find the delivery address on the map. Please check the house, street, city, state and pincode.",

        });
      }


      // =================================================
      // CREATE ORDER
      // =================================================

      const order =
        await Order.create({

          // ---------------------------------------------
          // CUSTOMER
          // ---------------------------------------------

          userId:
            req.user.userId,


          // ---------------------------------------------
          // PRODUCTS
          // ---------------------------------------------

          items:
            cleanItems,


          // ---------------------------------------------
          // PRICE
          // ---------------------------------------------

          subtotal:
            Number(
              subtotal || 0
            ),

          deliveryFee:
            Number(
              deliveryFee || 0
            ),

          total:
            Number(
              total || 0
            ),


          // ---------------------------------------------
          // DELIVERY ADDRESS
          // ---------------------------------------------

          address: {

            name:
              String(
                address.name
              ).trim(),

            phone:
              String(
                address.phone
              ).trim(),

            house:
              String(
                address.house
              ).trim(),

            street:
              String(
                address.street
              ).trim(),

            city:
              String(
                address.city
              ).trim(),

            state:
              String(
                address.state
              ).trim(),

            pincode:
              cleanPincode,

          },


          // ---------------------------------------------
          // CUSTOMER CURRENT GPS
          // ---------------------------------------------

          customerLocation:
            cleanCustomerLocation,


          // ---------------------------------------------
          // DELIVERY DESTINATION GPS
          // ---------------------------------------------

          deliveryLocation:
            deliveryLocation,


          // ---------------------------------------------
          // INITIAL STATUS
          // ---------------------------------------------

          status:
            "Order Placed",

        });


      // =================================================
      // SUCCESS LOG
      // =================================================

      console.log(
        "===================================="
      );

      console.log(
        "✅ ORDER CREATED"
      );

      console.log(
        "Order ID:",
        order._id.toString()
      );

      console.log(
        "Customer:",
        order.address.name
      );

      console.log(
        "City:",
        order.address.city
      );

      console.log(
        "State:",
        order.address.state
      );

      console.log(
        "Pincode:",
        order.address.pincode
      );

      console.log(
        "📍 Customer Current GPS:",
        order.customerLocation
      );

      console.log(
        "🏠 Delivery Destination GPS:",
        order.deliveryLocation
      );

      console.log(
        "===================================="
      );


      // =================================================
      // RESPONSE
      // =================================================

      return res.status(201).json({

        message:
          "Order placed successfully",

        order,

      });


    } catch (error) {

      console.error(
        "❌ Create order error:"
      );

      console.error(
        error
      );


      return res.status(500).json({

        message:
          "Failed to create order",

        error:
          error.message,

      });
    }
  }
);


// =====================================================
// GET CUSTOMER ORDERS
// GET /api/orders
// =====================================================

router.get(
  "/",
  authMiddleware,

  async (req, res) => {

    try {

      const orders =
        await Order.find({

          userId:
            req.user.userId,

        }).sort({

          createdAt: -1,

        });


      // Backend returns array directly

      return res.json(
        orders
      );


    } catch (error) {

      console.error(
        "❌ Get orders error:",
        error
      );


      return res.status(500).json({

        message:
          "Failed to fetch orders",

        error:
          error.message,

      });
    }
  }
);


// =====================================================
// GET SINGLE CUSTOMER ORDER
// GET /api/orders/:id
// =====================================================

router.get(
  "/:id",
  authMiddleware,

  async (req, res) => {

    try {

      const order =
        await Order.findOne({

          _id:
            req.params.id,

          userId:
            req.user.userId,

        });


      if (!order) {

        return res.status(404).json({

          message:
            "Order not found",

        });
      }


      return res.json({

        order,

      });


    } catch (error) {

      console.error(
        "❌ Get single order error:",
        error
      );


      return res.status(500).json({

        message:
          "Failed to fetch order",

        error:
          error.message,

      });
    }
  }
);


// =====================================================
// UPDATE ORDER STATUS
// PATCH /api/orders/:id/status
// =====================================================

router.patch(
  "/:id/status",
  authMiddleware,

  async (req, res) => {

    try {

      const {
        status,
      } = req.body;


      // =================================================
      // ALLOWED STATUSES
      // =================================================

      const allowedStatuses = [

        "Order Placed",

        "Order Confirmed",

        "Shipped",

        "Out for Delivery",

        "Delivered",

      ];


      if (
        !allowedStatuses.includes(
          status
        )
      ) {

        return res.status(400).json({

          message:
            "Invalid order status",

        });
      }


      // =================================================
      // FIND CUSTOMER ORDER
      // =================================================

      const order =
        await Order.findOne({

          _id:
            req.params.id,

          userId:
            req.user.userId,

        });


      if (!order) {

        return res.status(404).json({

          message:
            "Order not found",

        });
      }


      // =================================================
      // UPDATE STATUS
      // =================================================

      order.status =
        status;


      await order.save();


      // =================================================
      // RESPONSE
      // =================================================

      return res.json({

        message:
          "Order status updated",

        order,

      });


    } catch (error) {

      console.error(
        "❌ Update status error:",
        error
      );


      return res.status(500).json({

        message:
          "Failed to update order status",

        error:
          error.message,

      });
    }
  }
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;