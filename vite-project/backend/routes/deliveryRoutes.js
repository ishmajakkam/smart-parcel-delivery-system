
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const DeliveryBoy = require("../models/DeliveryBoy");
const Order = require("../models/Order");
const deliveryMiddleware = require("../middleware/deliveryMiddleware");

const router = express.Router();

const OSRM_BASE = "https://router.project-osrm.org";
const OSRM_TIMEOUT_MS = 8000;

// ------------------------------------------------------
// HELPERS
// ------------------------------------------------------

function isValidCoordinate(value, min, max) {
  const number = Number(value);

  return (
    value !== null &&
    value !== undefined &&
    value !== "" &&
    Number.isFinite(number) &&
    number >= min &&
    number <= max
  );
}

function isValidLocation(location) {
  return (
    location &&
    isValidCoordinate(location.latitude, -90, 90) &&
    isValidCoordinate(location.longitude, -180, 180)
  );
}

function distanceKm(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return (
    earthRadius *
    2 *
    Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  );
}

async function fetchOSRM(url) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    OSRM_TIMEOUT_MS
  );

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "SmartParcelDelivery/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`OSRM returned HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== "Ok") {
      throw new Error(data.message || "OSRM could not find a route");
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
}

// GPS fallback: estimates straight-line distance.
// This does not calculate actual roads or live traffic.
function optimizeWithDistance(currentLocation, orders) {
  let current = {
    latitude: Number(currentLocation.latitude),
    longitude: Number(currentLocation.longitude),
  };

  const remaining = orders.map((order) => ({ ...order }));
  const optimizedRoute = [];
  const geometry = [
    [current.longitude, current.latitude],
  ];

  let totalDistance = 0;

  while (remaining.length > 0) {
    let nearestIndex = -1;
    let nearestDistance = Infinity;

    remaining.forEach((order, index) => {
      const distance = distanceKm(
        current.latitude,
        current.longitude,
        Number(order.latitude),
        Number(order.longitude)
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    if (nearestIndex < 0 || !Number.isFinite(nearestDistance)) {
      throw new Error("Could not calculate GPS distance");
    }

    const nextOrder = remaining.splice(nearestIndex, 1)[0];

    optimizedRoute.push({
      ...nextOrder,
      distanceFromPrevious: Number(nearestDistance.toFixed(2)),
    });

    totalDistance += nearestDistance;

    current = {
      latitude: Number(nextOrder.latitude),
      longitude: Number(nextOrder.longitude),
    };

    geometry.push([current.longitude, current.latitude]);
  }

  // Approximation using 30 km/h average speed.
  const estimatedTime = Math.max(
    1,
    Math.round((totalDistance / 30) * 60)
  );

  return {
    optimizedRoute,
    totalDistance: Number(totalDistance.toFixed(2)),
    estimatedTime,
    geometry,
  };
}

// Try to get an actual road route from OSRM.
// If OSRM fails, the endpoint below uses the GPS fallback.
async function getRoadRoute(currentLocation, orders) {
  const allLocations = [
    {
      latitude: Number(currentLocation.latitude),
      longitude: Number(currentLocation.longitude),
    },
    ...orders.map((order) => ({
      latitude: Number(order.latitude),
      longitude: Number(order.longitude),
    })),
  ];

  const coordinates = allLocations
    .map((location) => `${location.longitude},${location.latitude}`)
    .join(";");

  const url =
  `${OSRM_BASE}/route/v1/driving/${coordinates}` +
  "?overview=full&geometries=geojson&steps=false&alternatives=true";

  const data = await fetchOSRM(url);

  if (!Array.isArray(data.routes) || !data.routes.length) {
    throw new Error("OSRM returned no road route");
  }

  const bestRoute = data.routes.reduce((shortest, route) =>
  route.distance < shortest.distance ? route : shortest
);
  const geometry = bestRoute.geometry?.coordinates;

  if (!Array.isArray(geometry) || geometry.length < 2) {
    throw new Error("OSRM returned no route geometry");
  }

  const optimizedRoute = orders.map((order, index) => ({
    ...order,
    distanceFromPrevious:
      index === 0
        ? Number(
            (
              distanceKm(
                currentLocation.latitude,
                currentLocation.longitude,
                order.latitude,
                order.longitude
              )
            ).toFixed(2)
          )
        : undefined,
  }));

  return {
    optimizedRoute,
    totalDistance: Number((bestRoute.distance / 1000).toFixed(2)),
    estimatedTime: Math.max(1, Math.round(bestRoute.duration / 60)),
    geometry,
  };
}

// ------------------------------------------------------
// DELIVERY BOY LOGIN
// ------------------------------------------------------

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const deliveryBoy = await DeliveryBoy.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!deliveryBoy) {
      return res.status(401).json({
        message: "Invalid delivery credentials",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      deliveryBoy.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid delivery credentials",
      });
    }

    const token = jwt.sign(
      {
        deliveryBoyId: deliveryBoy._id,
        role: "delivery",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Delivery login successful",
      token,
      deliveryBoy: {
        id: deliveryBoy._id,
        name: deliveryBoy.name,
        email: deliveryBoy.email,
        phone: deliveryBoy.phone,
      },
    });
  } catch (error) {
    console.error("Delivery login error:", error);

    return res.status(500).json({
      message: "Server error during delivery login",
    });
  }
});

// ------------------------------------------------------
// GET DELIVERY ORDERS
// ------------------------------------------------------

router.get("/orders", deliveryMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({
      status: {
        $in: [
          "Order Placed",
          "Order Confirmed",
          "Shipped",
          "Out for Delivery",
        ],
      },
    }).sort({ createdAt: -1 });

    return res.json({
      message: "Delivery orders fetched",
      orders,
    });
  } catch (error) {
    console.error("Fetch orders error:", error);

    return res.status(500).json({
      message: "Failed to fetch delivery orders",
    });
  }
});

// ------------------------------------------------------
// SAVE DELIVERY BOY GPS
// ------------------------------------------------------

router.post("/location", deliveryMiddleware, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (
      !isValidCoordinate(latitude, -90, 90) ||
      !isValidCoordinate(longitude, -180, 180)
    ) {
      return res.status(400).json({
        message: "Valid latitude and longitude required",
      });
    }

    const deliveryBoy = await DeliveryBoy.findById(
      req.deliveryBoy.deliveryBoyId
    );

    if (!deliveryBoy) {
      return res.status(404).json({
        message: "Delivery boy not found",
      });
    }

    deliveryBoy.currentLocation = {
      latitude: Number(latitude),
      longitude: Number(longitude),
    };

    await deliveryBoy.save();

    return res.json({
      message: "GPS location updated",
      location: deliveryBoy.currentLocation,
    });
  } catch (error) {
    console.error("Save GPS error:", error);

    return res.status(500).json({
      message: "Failed to update GPS location",
    });
  }
});

// ------------------------------------------------------
// GET DELIVERY BOY GPS
// ------------------------------------------------------

router.get("/location", deliveryMiddleware, async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findById(
      req.deliveryBoy.deliveryBoyId
    );

    if (!deliveryBoy) {
      return res.status(404).json({
        message: "Delivery boy not found",
      });
    }

    return res.json({
      location: deliveryBoy.currentLocation,
    });
  } catch (error) {
    console.error("Get GPS error:", error);

    return res.status(500).json({
      message: "Failed to fetch GPS location",
    });
  }
});

// ------------------------------------------------------
// OPTIMIZE SELECTED CUSTOMER / DELIVERY ROUTE
// ------------------------------------------------------

router.post(
  "/optimize-route",
  deliveryMiddleware,
  async (req, res) => {
    try {
      const { currentLocation, orders } = req.body;

      if (!isValidLocation(currentLocation)) {
        return res.status(400).json({
          message: "A valid current GPS location is required",
        });
      }

      if (!Array.isArray(orders) || orders.length === 0) {
        return res.status(400).json({
          message: "Select at least one customer with a delivery location",
        });
      }

      const validOrders = orders.filter((order) => {
        return (
          isValidCoordinate(order.latitude, -90, 90) &&
          isValidCoordinate(order.longitude, -180, 180)
        );
      }).map((order) => ({
        ...order,
        latitude: Number(order.latitude),
        longitude: Number(order.longitude),
      }));

      if (validOrders.length === 0) {
        return res.status(400).json({
          message: "No selected customer has valid GPS coordinates",
        });
      }

      console.log(
        `Calculating route for ${validOrders.length} stop(s)`
      );

      let result;
      let routingEngine = "OSRM";
      let isRoadRoute = true;
      let message = "Road route calculated successfully";

      try {
        result = await getRoadRoute(currentLocation, validOrders);
      } catch (roadError) {
        console.error(
          "OSRM unavailable; using GPS fallback:",
          roadError.message
        );

        result = optimizeWithDistance(currentLocation, validOrders);
        routingEngine = "GPS fallback";
        isRoadRoute = false;
        message =
          "Estimated route calculated using GPS coordinates. Road routing is temporarily unavailable.";
      }

      if (
        !result ||
        !Array.isArray(result.optimizedRoute) ||
        !Array.isArray(result.geometry) ||
        result.geometry.length < 2
      ) {
        throw new Error("Could not produce a usable route");
      }

      return res.json({
        message,
        route: result.optimizedRoute,
        optimizedRoute: result.optimizedRoute,
        totalDistance: Number(result.totalDistance),
        estimatedTime: Number(result.estimatedTime),
        geometry: result.geometry,
        routingEngine,
        isRoadRoute,
      });
    } catch (error) {
      console.error("Route optimization error:", error);

      return res.status(500).json({
        message: "Route optimization failed",
        error: error.message,
      });
    }
  }
);

// ------------------------------------------------------
// UPDATE ORDER STATUS
// ------------------------------------------------------

router.patch(
  "/orders/:id/status",
  deliveryMiddleware,
  async (req, res) => {
    try {
      const { status } = req.body;

      const allowedStatuses = [
        "Shipped",
        "Out for Delivery",
        "Delivered",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid delivery status",
        });
      }

      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      order.status = status;
      await order.save();

      return res.json({
        message: "Order status updated",
        order,
      });
    } catch (error) {
      console.error("Update order status error:", error);

      return res.status(500).json({
        message: "Failed to update order status",
      });
    }
  }
);

module.exports = router;
