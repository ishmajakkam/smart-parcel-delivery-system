import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// =====================================================
// MAP MARKERS
// =====================================================

const deliveryIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const customerIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// =====================================================
// FIT MAP TO ROUTE
// =====================================================


function RouteFitBounds({ geometry }) {
  const map = useMap();

  useEffect(() => {
    if (!geometry || geometry.length < 2) return;

    // roadGeometry is already [latitude, longitude].
    const points = geometry.map(([latitude, longitude]) => [
      Number(latitude),
      Number(longitude),
    ]);

    map.fitBounds(L.latLngBounds(points), {
      padding: [40, 40],
    });
  }, [geometry, map]);

  return null;
}


// =====================================================
// DELIVERY DASHBOARD
// =====================================================

export default function DeliveryDashboard() {
  const navigate = useNavigate();

  const [deliveryBoy, setDeliveryBoy] = useState(null);
  const [orders, setOrders] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [gpsStatus, setGpsStatus] = useState("Starting GPS...");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [roadGeometry, setRoadGeometry] = useState([]);
  const [routeDistance, setRouteDistance] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);

  const [optimizing, setOptimizing] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [error, setError] = useState("");

  // Prevent an older request from replacing a newly selected route.
  const [routeRequestId, setRouteRequestId] = useState(0);

  // ===================================================
  // AUTHENTICATION
  // ===================================================

  useEffect(() => {
    const token = localStorage.getItem("deliveryToken");
    const savedDeliveryBoy = localStorage.getItem("deliveryBoy");

    if (!token) {
      navigate("/delivery/login");
      return;
    }

    if (savedDeliveryBoy) {
      try {
        setDeliveryBoy(JSON.parse(savedDeliveryBoy));
      } catch {
        console.error("Could not read delivery boy data.");
      }
    }

    loadOrders();

    if (!navigator.geolocation) {
      setGpsStatus("GPS is not supported by this browser");
      return;
    }

    setGpsStatus("Requesting GPS...");

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setCurrentLocation(location);
        setGpsStatus("GPS Active");

        try {
          await fetch("https://smartparcel-backend.onrender.com/api/delivery/location", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(location),
          });
        } catch (err) {
          console.error("Could not update delivery GPS:", err);
        }
      },
      (gpsError) => {
        console.error("GPS error:", gpsError);
        setGpsStatus("GPS permission denied or unavailable");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [navigate]);

  // ===================================================
  // LOAD DELIVERY ORDERS
  // ===================================================

  const loadOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
      setError("");

      const token = localStorage.getItem("deliveryToken");

      const response = await fetch(
        "https://smartparcel-backend.onrender.com/api/delivery/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load orders");
      }

      const fetchedOrders = Array.isArray(data)
        ? data
        : data.orders || [];

      setOrders(fetchedOrders);

      // Clear selection if the selected order is no longer available.
      setSelectedCustomer((previous) => {
        if (!previous) return null;

        return (
          fetchedOrders.find(
            (order) => order._id === previous._id
          ) || null
        );
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not load delivery orders");
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  // ===================================================
  // VALIDATE COORDINATES
  // ===================================================

  const hasValidCoordinates = (location) => {
    if (!location) return false;

    const latitude = Number(location.latitude);
    const longitude = Number(location.longitude);

    return (
      location.latitude !== null &&
      location.latitude !== undefined &&
      location.longitude !== null &&
      location.longitude !== undefined &&
      String(location.latitude).trim() !== "" &&
      String(location.longitude).trim() !== "" &&
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  };

  // ===================================================
  // CALCULATE ROUTE FOR ONE SELECTED CUSTOMER
  // ===================================================

  
const calculateCustomerRoute = async (order) => {
  setSelectedCustomer(order);
  setRoadGeometry([]);
  setRouteDistance(0);
  setEstimatedTime(0);
  setError("");

  if (!currentLocation) {
    setError("Waiting for your current GPS location.");
    return;
  }

  const customerLocation = order.deliveryLocation;

  if (!hasValidCoordinates(customerLocation)) {
    setError("This customer's GPS coordinates are missing or invalid.");
    return;
  }

  const startLat = Number(currentLocation.latitude);
  const startLng = Number(currentLocation.longitude);
  const endLat = Number(customerLocation.latitude);
  const endLng = Number(customerLocation.longitude);

  // Leaflet route coordinates are [latitude, longitude].
  const fallbackGeometry = [
    [startLat, startLng],
    [endLat, endLng],
  ];

  const token = localStorage.getItem("deliveryToken");

  if (!token) {
    navigate("/delivery/login");
    return;
  }

  setOptimizing(true);

  try {
    const response = await fetch(
      "https://smartparcel-backend.onrender.com/api/delivery/optimize-route",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentLocation: {
            latitude: startLat,
            longitude: startLng,
          },
          orders: [
            {
              _id: order._id,
              latitude: endLat,
              longitude: endLng,
              address: order.address,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Could not calculate this customer's route."
      );
    }
    const rawGeometry = data.geometry || [];

if (rawGeometry.length < 2) {
  throw new Error("The routing service returned an invalid route.");
}

const geometry = rawGeometry.map(([longitude, latitude]) => [
  Number(latitude),
  Number(longitude),
]);
      setRoadGeometry(geometry);
    setRouteDistance(Number(data.totalDistance) || 0);
    setEstimatedTime(Number(data.estimatedTime) || 0);
    console.log("Selected customer:", order._id);
    console.log("Route response:", data);
  } catch (err) {
    console.error("Route calculation error:", err);
    setError(err.message || "Could not calculate the route.");
  } finally {
    setOptimizing(false);
  }
};

  // ===================================================
  // RE-CALCULATE SELECTED CUSTOMER ROUTE
  // ===================================================

  const optimizeSelectedCustomer = () => {
    if (!selectedCustomer) {
      setError("Please select a customer first.");
      return;
    }

    calculateCustomerRoute(selectedCustomer);
  };

  // ===================================================
  // CLEAR CUSTOMER SELECTION
  // ===================================================

  const clearSelectedCustomer = () => {
    setSelectedCustomer(null);
    setRoadGeometry([]);
    setRouteDistance(0);
    setEstimatedTime(0);
    setError("");
  };

  // ===================================================
  // UPDATE ORDER STATUS
  // ===================================================

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId);
      setError("");

      const token = localStorage.getItem("deliveryToken");

      const response = await fetch(
        `https://smartparcel-backend.onrender.com/api/delivery/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update order status");
      }

      await loadOrders();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update order status");
    } finally {
      setUpdatingOrder(null);
    }
  };

  // ===================================================
  // LOGOUT
  // ===================================================

  const logout = () => {
    localStorage.removeItem("deliveryToken");
    localStorage.removeItem("deliveryBoy");
    navigate("/delivery/login");
  };

  // ===================================================
  // RENDER DASHBOARD
  // ===================================================

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>🚚 SmartParcel Delivery</h1>
          <p style={styles.subtitle}>
            Welcome{deliveryBoy?.name ? `, ${deliveryBoy.name}` : ""}
          </p>
        </div>

        <button style={styles.logoutButton} onClick={logout}>
          Logout
        </button>
      </header>

      <main style={styles.main}>
        {/* GPS STATUS */}
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>📍 Delivery Location</h2>

          <p
            style={{
              ...styles.gpsStatus,
              color: currentLocation ? "#168a42" : "#b45309",
            }}
          >
            {currentLocation ? "● " : "● "}
            {gpsStatus}
          </p>

          {currentLocation && (
            <p style={styles.mutedText}>
              Latitude: {currentLocation.latitude.toFixed(6)} · Longitude:{" "}
              {currentLocation.longitude.toFixed(6)}
            </p>
          )}
        </section>

        {/* ERROR MESSAGE */}
        {error && (
          <div style={styles.error}>
            <span>{error}</span>
            <button
              style={styles.dismissButton}
              onClick={() => setError("")}
            >
              ✕
            </button>
          </div>
        )}

        {/* MAP */}
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>🗺️ Delivery Map</h2>

          <p style={styles.mutedText}>
            Select a customer marker on the map or use a customer's order card
            below to calculate their individual route.
          </p>

          <div style={styles.mapContainer}>
            <MapContainer
              center={
                currentLocation
                  ? [
                      currentLocation.latitude,
                      currentLocation.longitude,
                    ]
                  : [17.385, 78.4867]
              }
              zoom={12}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* DELIVERY PERSON */}
              {currentLocation && (
                <Marker
                  position={[
                    currentLocation.latitude,
                    currentLocation.longitude,
                  ]}
                  icon={deliveryIcon}
                >
                  <Popup>
                    <strong>🚚 Your current location</strong>
                  </Popup>
                </Marker>
              )}

              {/* CUSTOMER MARKERS */}
              {orders.map((order) => {
                const location = order.deliveryLocation;

                if (!hasValidCoordinates(location)) return null;

                const isSelected =
                  selectedCustomer?._id === order._id;

                return (
                  <Marker
                    key={order._id}
                    position={[
                      Number(location.latitude),
                      Number(location.longitude),
                    ]}
                    icon={isSelected ? customerIcon : deliveryIcon}
                  >
                    <Popup>
                      <div style={{ minWidth: "210px" }}>
                        <strong>
                          📦 Order #{String(order._id).slice(-8)}
                        </strong>

                        <p style={{ margin: "8px 0" }}>
                          <strong>Customer:</strong>{" "}
                          {order.address?.name || "Customer"}
                          <br />
                          <strong>City:</strong>{" "}
                          {order.address?.city || "N/A"}
                          <br />
                          <strong>Status:</strong> {order.status}
                        </p>

                        <button
                          style={styles.popupButton}
                          disabled={optimizing}
                          onClick={() => calculateCustomerRoute(order)}
                        >
                          {isSelected
                            ? "✓ Calculate This Customer's Route"
                            : "📍 Select Customer & Route"}
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

             {/* ROAD ROUTE FOR SELECTED CUSTOMER */}
{roadGeometry.length > 1 && (
  <Polyline
    positions={roadGeometry}
    pathOptions={{
      color: "blue",
      weight: 5,
      opacity: 0.9,
    }}
  />
)}

              <RouteFitBounds geometry={roadGeometry} />
            </MapContainer>
          </div>
        </section>

        {/* SELECTED CUSTOMER ROUTE CONTROLS */}
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>🛣️ Selected Customer Route</h2>

          {selectedCustomer ? (
            <>
              <p style={styles.selectedName}>
                {selectedCustomer.address?.name || "Selected customer"}
              </p>

              <p style={styles.mutedText}>
                Order #{String(selectedCustomer._id).slice(-8)}
                <br />
                {selectedCustomer.address?.house},{" "}
                {selectedCustomer.address?.street}
                <br />
                {selectedCustomer.address?.city},{" "}
                {selectedCustomer.address?.state}{" "}
                {selectedCustomer.address?.pincode}
              </p>

              <div style={styles.metrics}>
                <div style={styles.metric}>
                  <span style={styles.metricLabel}>Stops</span>
                  <strong style={styles.metricValue}>
                    {roadGeometry.length > 1 ? 1 : 0}
                  </strong>
                </div>

                <div style={styles.metric}>
                  <span style={styles.metricLabel}>Distance</span>
                  <strong style={styles.metricValue}>
                    {routeDistance.toFixed(2)} km
                  </strong>
                </div>

                <div style={styles.metric}>
                  <span style={styles.metricLabel}>Estimated time</span>
                  <strong style={styles.metricValue}>
                    {estimatedTime} min
                  </strong>
                </div>
              </div>

              <div style={styles.buttonRow}>
                <button
                  style={styles.primaryButton}
                  onClick={optimizeSelectedCustomer}
                  disabled={optimizing || !currentLocation}
                >
                  {optimizing
                    ? "⚙️ Calculating Route..."
                    : "🛣️ Optimize Selected Customer Route"}
                </button>

                <button
                  style={styles.secondaryButton}
                  onClick={clearSelectedCustomer}
                  disabled={optimizing}
                >
                  Clear Selection
                </button>
              </div>
            </>
          ) : (
            <p style={styles.mutedText}>
              No customer selected. Choose a customer from the map or order
              list to calculate their route.
            </p>
          )}
        </section>

        {/* DELIVERY ORDERS */}
        <section style={styles.card}>
          <div style={styles.ordersHeading}>
            <h2 style={styles.cardTitle}>📦 Delivery Orders</h2>

            <button
              style={styles.refreshButton}
              onClick={loadOrders}
              disabled={loadingOrders}
            >
              {loadingOrders ? "Loading..." : "↻ Refresh"}
            </button>
          </div>

          {loadingOrders ? (
            <p style={styles.mutedText}>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p style={styles.mutedText}>No delivery orders available.</p>
          ) : (
            <div style={styles.orderGrid}>
              {orders.map((order) => {
                const isSelected =
                  selectedCustomer?._id === order._id;

                const hasGPS = hasValidCoordinates(
                  order.deliveryLocation
                );

                return (
                  <article
                    key={order._id}
                    style={{
                      ...styles.orderCard,
                      border: isSelected
                        ? "2px solid #1677ff"
                        : "1px solid #e5e7eb",
                    }}
                  >
                    <div style={styles.orderHeader}>
                      <strong>
                        Order #{String(order._id).slice(-8)}
                      </strong>

                      <span style={styles.statusBadge}>
                        {order.status}
                      </span>
                    </div>

                    <h3 style={styles.customerName}>
                      {order.address?.name || "Customer"}
                    </h3>

                    <p style={styles.orderAddress}>
                      📞 {order.address?.phone || "N/A"}
                      <br />
                      📍 {order.address?.house},{" "}
                      {order.address?.street}
                      <br />
                      {order.address?.city},{" "}
                      {order.address?.state}
                      <br />
                      PIN: {order.address?.pincode || "N/A"}
                    </p>

                    <p
                      style={{
                        ...styles.gpsLabel,
                        color: hasGPS ? "#168a42" : "#b45309",
                      }}
                    >
                      {hasGPS
                        ? "✓ Customer GPS available"
                        : "⚠ Customer GPS unavailable"}
                    </p>

                    <button
                      style={{
                        ...styles.primaryButton,
                        width: "100%",
                        background: isSelected ? "#168a42" : "#1677ff",
                      }}
                      disabled={optimizing || !hasGPS}
                      onClick={() => calculateCustomerRoute(order)}
                    >
                      {isSelected
                        ? "✓ Selected Customer"
                        : "📍 Select Customer & Route"}
                    </button>

                    {order.status === "Order Confirmed" && (
                      <button
                        style={styles.statusButton}
                        disabled={updatingOrder === order._id}
                        onClick={() =>
                          updateOrderStatus(order._id, "Shipped")
                        }
                      >
                        {updatingOrder === order._id
                          ? "Updating..."
                          : "Mark Shipped"}
                      </button>
                    )}

                    {order.status === "Shipped" && (
                      <button
                        style={styles.statusButton}
                        disabled={updatingOrder === order._id}
                        onClick={() =>
                          updateOrderStatus(
                            order._id,
                            "Out for Delivery"
                          )
                        }
                      >
                        {updatingOrder === order._id
                          ? "Updating..."
                          : "Start Delivery"}
                      </button>
                    )}

                    {order.status === "Out for Delivery" && (
                      <button
                        style={styles.statusButton}
                        disabled={updatingOrder === order._id}
                        onClick={() =>
                          updateOrderStatus(order._id, "Delivered")
                        }
                      >
                        {updatingOrder === order._id
                          ? "Updating..."
                          : "Mark Delivered"}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    color: "#222",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    background: "#ffffff",
    padding: "18px 5%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },
  title: {
    margin: 0,
    fontSize: "24px",
    color: "#1677ff",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#666",
    fontSize: "14px",
  },
  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "24px 16px",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
  },
  cardTitle: {
    fontSize: "20px",
    margin: "0 0 16px",
  },
  gpsStatus: {
    margin: "0 0 8px",
    fontWeight: "600",
  },
  mutedText: {
    color: "#666",
    fontSize: "14px",
    lineHeight: 1.7,
  },
  mapContainer: {
    height: "450px",
    width: "100%",
    borderRadius: "10px",
    overflow: "hidden",
    marginTop: "14px",
    border: "1px solid #e5e7eb",
  },
  error: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "8px",
    background: "#ffe8e8",
    color: "#a40000",
    marginBottom: "18px",
  },
  dismissButton: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "18px",
  },
  logoutButton: {
    border: "none",
    background: "#ffe8e8",
    color: "#b00020",
    borderRadius: "8px",
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: "600",
  },
  primaryButton: {
    border: "none",
    background: "#1677ff",
    color: "#fff",
    padding: "12px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    marginTop: "8px",
  },
  secondaryButton: {
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#333",
    padding: "12px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  popupButton: {
    border: "none",
    background: "#1677ff",
    color: "#fff",
    padding: "10px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    width: "100%",
  },
  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "12px",
    margin: "18px 0",
  },
  metric: {
    background: "#f5f7fb",
    border: "1px solid #e5e7eb",
    padding: "16px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  metricLabel: {
    fontSize: "13px",
    color: "#666",
  },
  metricValue: {
    fontSize: "20px",
    color: "#1677ff",
  },
  buttonRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "12px",
  },
  selectedName: {
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "8px",
  },
  ordersHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },
  refreshButton: {
    border: "1px solid #d1d5db",
    background: "#fff",
    padding: "8px 12px",
    borderRadius: "7px",
    cursor: "pointer",
  },
  orderGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
    gap: "16px",
  },
  orderCard: {
    padding: "16px",
    borderRadius: "10px",
    background: "#fff",
    transition: "border 0.2s",
  },
  orderHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
  },
  statusBadge: {
    display: "inline-block",
    background: "#eef4ff",
    color: "#245db5",
    borderRadius: "20px",
    padding: "5px 9px",
    fontSize: "11px",
    fontWeight: "700",
  },
  customerName: {
    margin: "8px 0",
    fontSize: "17px",
  },
  orderAddress: {
    color: "#555",
    fontSize: "13px",
    lineHeight: 1.8,
  },
  gpsLabel: {
    fontSize: "13px",
    fontWeight: "600",
  },
  statusButton: {
    display: "block",
    width: "100%",
    marginTop: "10px",
    border: "none",
    background: "#168a42",
    color: "#fff",
    padding: "11px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },
};