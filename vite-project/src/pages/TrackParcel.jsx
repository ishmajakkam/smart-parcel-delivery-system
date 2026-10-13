import { Link, useParams } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  Heart,
  User,
  Search,
  CheckCircle,
  Truck,
  MapPin,
  Clock,
} from "lucide-react";
import { useEffect, useState } from "react";

function TrackParcel() {
  const { orderId } = useParams();

  // =========================
  // ORDERS
  // =========================

  const [orders, setOrders] = useState([]);
  const [searchId, setSearchId] = useState(orderId || "");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [loading, setLoading] = useState(true);
  const [trackingLoading, setTrackingLoading] =
    useState(false);

  // =========================
  // WISHLIST
  // =========================

  const wishlist = JSON.parse(
    localStorage.getItem("wishlist") || "[]"
  );

  // =========================
  // CART
  // =========================

  const cart = JSON.parse(
    localStorage.getItem("cart") || "[]"
  );

  // =========================
  // FETCH ORDERS
  // =========================

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/orders",
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load orders"
          );
        }

        // Backend returns the orders array directly.
        // Also supports { orders: [...] } just in case.
        const fetchedOrders = Array.isArray(data)
          ? data
          : data.orders || [];

        setOrders(fetchedOrders);

        // If URL contains an order ID,
        // automatically open that order.
        if (orderId) {
          const found = fetchedOrders.find(
            (order) =>
              String(order._id).toLowerCase() ===
              String(orderId).toLowerCase()
          );

          if (found) {
            setSelectedOrder(found);
            setSearchId(String(found._id));
          }
        }
      } catch (error) {
        console.error(
          "Fetch tracking orders error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [orderId]);

  // =========================
  // TRACK ORDER
  // =========================

  const trackOrder = async () => {
    const value = searchId.trim().toLowerCase();

    if (!value) {
      alert("Please enter an order ID.");
      return;
    }

    setTrackingLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login to track your order.");
        return;
      }

      // =========================
      // EXACT ORDER ID
      // =========================

      const exactOrder = orders.find(
        (order) =>
          String(order._id).toLowerCase() === value
      );

      if (exactOrder) {
        setSelectedOrder(exactOrder);
        return;
      }

      // =========================
      // LAST 8 CHARACTERS
      // =========================

      const shortOrder = orders.find(
        (order) =>
          String(order._id)
            .slice(-8)
            .toLowerCase() === value
      );

      if (shortOrder) {
        setSelectedOrder(shortOrder);
        setSearchId(String(shortOrder._id));
        return;
      }

      // =========================
      // BACKEND DIRECT SEARCH
      // =========================

      if (value.length === 24) {
        const response = await fetch(
          `http://localhost:5000/api/orders/${value}`,
          {
            method: "GET",
            headers: {
              Authorization:
                "Bearer " + token,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          // Backend may return:
          // { order: {...} }
          // OR the order directly.
          const foundOrder =
            data.order || data;

          if (
            foundOrder &&
            foundOrder._id
          ) {
            setSelectedOrder(foundOrder);
            setSearchId(
              String(foundOrder._id)
            );
            return;
          }
        }
      }

      setSelectedOrder(null);

      alert(
        "Order not found. Please check your order ID."
      );
    } catch (error) {
      console.error(
        "Track order error:",
        error
      );

      alert(
        "Unable to track order. Please try again."
      );
    } finally {
      setTrackingLoading(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="tracking-page">
        <header className="market-header">
          <Link
            to="/"
            className="market-logo"
          >
            <div className="market-logo-icon">
              <Package size={21} />
            </div>

            <span>
              SmartParcel <b>Delivery</b>
            </span>
          </Link>
        </header>

        <main className="tracking-container">
          <div className="tracking-empty">
            <Package size={50} />

            <h2>
              Loading your orders...
            </h2>

            <p>
              Please wait while we fetch
              your tracking information.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="tracking-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="market-header">

        <Link
          to="/"
          className="market-logo"
        >
          <div className="market-logo-icon">
            <Package size={21} />
          </div>

          <span>
            SmartParcel <b>Delivery</b>
          </span>
        </Link>

        <div className="market-actions">

          {/* WISHLIST */}

          <Link
            to="/wishlist"
            className="market-action"
          >
            <Heart
              size={20}
              fill={
                wishlist.length > 0
                  ? "currentColor"
                  : "none"
              }
            />

            {wishlist.length > 0 && (
              <span className="market-badge">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* CART */}

          <Link
            to="/cart"
            className="market-action"
          >
            <ShoppingCart size={20} />

            {cart.length > 0 && (
              <span className="market-badge">
                {cart.reduce(
                  (total, item) =>
                    total + item.quantity,
                  0
                )}
              </span>
            )}
          </Link>

          {/* PROFILE */}

          <Link
            to="/profile"
            className="market-profile"
          >
            <User size={18} />
          </Link>

        </div>
      </header>

      {/* =========================
          MAIN
      ========================= */}

      <main className="tracking-container">

        {/* HEADING */}

        <div className="tracking-heading">
          <h1>
            Track Your Order
          </h1>

          <p>
            Enter your order ID to check
            your delivery status.
          </p>
        </div>

        {/* =========================
            SEARCH
        ========================= */}

        <div className="tracking-search-card">

          <label>
            Order ID
          </label>

          <div className="tracking-search">

            <input
              type="text"
              placeholder="Enter your order ID"
              value={searchId}
              onChange={(e) =>
                setSearchId(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  trackOrder();
                }
              }}
            />

            <button
              type="button"
              onClick={trackOrder}
              disabled={trackingLoading}
            >
              <Search size={17} />

              {trackingLoading
                ? "Tracking..."
                : "Track Order"}
            </button>

          </div>

          <p className="tracking-hint">
            You can find your order ID in
            My Orders.
          </p>

        </div>

        {/* =========================
            QUICK ORDERS
        ========================= */}

        {orders.length > 0 &&
          !selectedOrder && (

            <div className="tracking-recent">

              <h2>
                Your Orders
              </h2>

              <p>
                Select an order to track it.
              </p>

              <div className="tracking-order-list">

                {orders.map((order) => (

                  <button
                    type="button"
                    className="tracking-order-item"
                    key={order._id}
                    onClick={() => {
                      setSelectedOrder(order);

                      setSearchId(
                        String(order._id)
                      );
                    }}
                  >

                    <Package size={19} />

                    <div>

                      <strong>
                        Order #
                        {String(
                          order._id
                        ).slice(-8)}
                      </strong>

                      <span>
                        {formatDate(
                          order.createdAt
                        )}
                      </span>

                    </div>

                    <span className="tracking-status">
                      {order.status ||
                        "Order Placed"}
                    </span>

                  </button>

                ))}

              </div>

            </div>

          )}

        {/* =========================
            TRACKING RESULT
        ========================= */}

        {selectedOrder && (
          <TrackingResult
            order={selectedOrder}
          />
        )}

        {/* =========================
            NO ORDERS
        ========================= */}

        {orders.length === 0 && (

          <div className="tracking-empty">

            <Package size={50} />

            <h2>
              No orders to track
            </h2>

            <p>
              Place an order first and
              you can track it here.
            </p>

            <Link
              to="/shop"
              className="tracking-shop-button"
            >
              Start Shopping
            </Link>

          </div>

        )}

      </main>

    </div>
  );
}

/* =====================================================
   TRACKING RESULT
===================================================== */

function TrackingResult({ order }) {

  const status =
    order.status || "Order Placed";

  return (
    <div className="tracking-result">

      {/* ORDER HEADER */}

      <div className="tracking-result-header">

        <div>

          <span>
            ORDER ID
          </span>

          <h2>
            #
            {String(order._id).slice(-8)}
          </h2>

        </div>

        <div className="tracking-current-status">

          <CheckCircle size={17} />

          {status}

        </div>

      </div>

      {/* TIMELINE */}

      <div className="tracking-timeline">

        {/* PLACED */}

        <TrackingStep
          icon={<CheckCircle size={19} />}
          title="Order Placed"
          description="Your order has been successfully placed."
          date={formatDate(
            order.createdAt
          )}
          completed={true}
        />

        {/* CONFIRMED */}

        <TrackingStep
          icon={<Package size={19} />}
          title="Order Confirmed"
          description="Your order has been confirmed and is being prepared."
          completed={
            statusIndex(status) >= 1
          }
        />

        {/* SHIPPED */}

        <TrackingStep
          icon={<Truck size={19} />}
          title="Shipped"
          description="Your parcel has been handed over for delivery."
          completed={
            statusIndex(status) >= 2
          }
        />

        {/* OUT FOR DELIVERY */}

        <TrackingStep
          icon={<MapPin size={19} />}
          title="Out for Delivery"
          description="Your parcel is on the way to your address."
          completed={
            statusIndex(status) >= 3
          }
        />

        {/* DELIVERED */}

        <TrackingStep
          icon={<CheckCircle size={19} />}
          title="Delivered"
          description="Your parcel has been delivered."
          completed={
            statusIndex(status) >= 4
          }
          last={true}
        />

      </div>

      {/* =========================
          DELIVERY INFORMATION
      ========================= */}

      <div className="tracking-delivery-card">

        <div>

          <CalendarIcon />

          <div>

            <span>
              Expected Delivery
            </span>

            <strong>
              {getExpectedDelivery(
                order
              )}
            </strong>

          </div>

        </div>

        <div>

          <MapPin size={18} />

          <div>

            <span>
              Delivery Address
            </span>

            <strong>
              {order.address?.city ||
                "Address unavailable"}
            </strong>

          </div>

        </div>

      </div>

      {/* PRODUCTS */}

      <div className="tracking-products">

        <h3>
          Ordered Products
        </h3>

        {order.items?.map(
          (item, index) => (

            <div
              className="tracking-product"
              key={`${item.productId}-${index}`}
            >

              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                />
              ) : (
                <Package size={35} />
              )}

              <div>

                <strong>
                  {item.name}
                </strong>

                <span>
                  Colour:{" "}
                  {item.color ||
                    "Default"}
                </span>

                <span>
                  Quantity:{" "}
                  {item.quantity}
                </span>

              </div>

              <strong>
                ₹
                {(
                  Number(item.price) *
                  Number(item.quantity)
                ).toLocaleString("en-IN")}
              </strong>

            </div>

          )
        )}

      </div>

      {/* TOTAL */}

      <div className="tracking-total">

        <span>
          Order Total
        </span>

        <strong>
          ₹
          {Number(
            order.total || 0
          ).toLocaleString("en-IN")}
        </strong>

      </div>

    </div>
  );
}

/* =====================================================
   TRACKING STEP
===================================================== */

function TrackingStep({
  icon,
  title,
  description,
  date,
  completed,
  last,
}) {
  return (
    <div
      className={
        completed
          ? "tracking-step completed"
          : "tracking-step"
      }
    >

      <div className="tracking-step-icon">
        {icon}
      </div>

      {!last && (
        <div className="tracking-line" />
      )}

      <div className="tracking-step-content">

        <h3>
          {title}
        </h3>

        <p>
          {description}
        </p>

        {date && (
          <span>
            {date}
          </span>
        )}

      </div>

    </div>
  );
}

/* =====================================================
   STATUS INDEX
===================================================== */

function statusIndex(status) {

  const statuses = [
    "Order Placed",
    "Order Confirmed",
    "Shipped",
    "Out for Delivery",
    "Delivered",
  ];

  const index =
    statuses.findIndex(
      (item) =>
        item.toLowerCase() ===
        String(status)
          .toLowerCase()
    );

  return index === -1 ? 0 : index;
}

/* =====================================================
   CALENDAR ICON
===================================================== */

function CalendarIcon() {
  return <Clock size={18} />;
}

/* =====================================================
   DATE
===================================================== */

function formatDate(date) {

  if (!date) {
    return "Not available";
  }

  return new Date(
    date
  ).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

/* =====================================================
   EXPECTED DELIVERY
===================================================== */

function getExpectedDelivery(order) {

  const dates =
    order.items
      ?.map(
        (item) =>
          item.deliveryDate
      )
      .filter(Boolean);

  if (
    !dates ||
    dates.length === 0
  ) {
    return "Not selected";
  }

  const latest =
    [...dates].sort().at(-1);

  const parts =
    latest.split("-");

  if (parts.length !== 3) {
    return latest;
  }

  return new Date(
    Number(parts[0]),
    Number(parts[1]) - 1,
    Number(parts[2])
  ).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

export default TrackParcel;