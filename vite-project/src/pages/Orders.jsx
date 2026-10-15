import { Link } from "react-router-dom";

import {
  Package,
  ShoppingCart,
  Heart,
  User,
  Truck,
  CalendarDays,
  CheckCircle,
} from "lucide-react";

import { useEffect, useState } from "react";

function Orders() {
  // =========================
  // ORDERS FROM BACKEND
  // =========================

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // WISHLIST
  // =========================

  const [wishlist] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("wishlist") || "[]"
      );
    } catch {
      return [];
    }
  });

  // =========================
  // CART
  // =========================

  const [cart] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("cart") || "[]"
      );
    } catch {
      return [];
    }
  });

  // =========================
  // FETCH ORDERS
  // =========================

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("token");

        if (!token) {
          setError(
            "Please login to view your orders."
          );
          setLoading(false);
          return;
        }

        const response = await fetch(
          "https://smartparcel-backend.onrender.com/api/orders",
          {
            method: "GET",
            headers: {
              Authorization:
                "Bearer " + token,
            },
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem(
              "isLoggedIn"
            );
            localStorage.removeItem("user");
          }

          throw new Error(
            data.message ||
              "Failed to load orders"
          );
        }

        // Backend returns the array directly:
        // [order1, order2, order3]
        setOrders(
          Array.isArray(data)
            ? data
            : data.orders || []
        );

      } catch (error) {
        console.error(
          "Fetch orders error:",
          error
        );

        setError(
          error.message ||
            "Unable to load your orders."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // =========================
  // RENDER
  // =========================

  return (
    <div className="orders-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="market-header">

        {/* LOGO */}

        <Link
          to="/"
          className="market-logo"
        >

          <div className="market-logo-icon">
            <Package size={21} />
          </div>

          <span>
            SmartParcel{" "}
            <b>Delivery</b>
          </span>

        </Link>


        {/* ACTIONS */}

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
                    total +
                    Number(
                      item.quantity
                    ),
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

      <main className="orders-container">

        {/* HEADING */}

        <div className="orders-heading">

          <h1>
            My Orders
          </h1>

          <p>
            Your parcel orders and delivery
            details
          </p>

        </div>


        {/* =========================
            LOADING
        ========================= */}

        {loading && (

          <div className="orders-empty">

            <Package size={55} />

            <h2>
              Loading your orders...
            </h2>

            <p>
              Please wait while we fetch
              your orders.
            </p>

          </div>

        )}


        {/* =========================
            ERROR
        ========================= */}

        {!loading && error && (

          <div className="orders-empty">

            <Package size={55} />

            <h2>
              Unable to load orders
            </h2>

            <p>
              {error}
            </p>

            <Link
              to="/login"
              className="orders-shop-button"
            >
              Login
            </Link>

          </div>

        )}


        {/* =========================
            NO ORDERS
        ========================= */}

        {!loading &&
          !error &&
          orders.length === 0 && (

            <div className="orders-empty">

              <Package size={55} />

              <h2>
                No orders yet
              </h2>

              <p>
                Your ordered products will
                appear here.
              </p>

              <Link
                to="/shop"
                className="orders-shop-button"
              >
                Start Shopping
              </Link>

            </div>

          )}


        {/* =========================
            ORDERS
        ========================= */}

        {!loading &&
          !error &&
          orders.length > 0 && (

            <div className="orders-list">

              {orders.map((order) => (

                <div
                  className="order-card"
                  key={order._id}
                >

                  {/* =========================
                      ORDER HEADER
                  ========================= */}

                  <div className="order-header">

                    <div>

                      <span className="order-label">
                        ORDER ID
                      </span>

                      <strong>
                        #
                        {String(
                          order._id
                        ).slice(-8)}
                      </strong>

                    </div>


                    <div className="order-date">

                      <span className="order-label">
                        ORDERED ON
                      </span>

                      <strong>
                        {formatOrderDate(
                          order.createdAt
                        )}
                      </strong>

                    </div>


                    <div className="order-status">

                      <CheckCircle size={15} />

                      {order.status ||
                        "Order Placed"}

                    </div>

                  </div>


                  {/* =========================
                      PRODUCTS
                  ========================= */}

                  <div className="order-products">

                    {order.items &&
                      order.items.map(
                        (item, index) => (

                          <div
                            className="order-product"
                            key={`${item.productId}-${item.color}-${index}`}
                          >

                            {/* IMAGE */}

                            <div className="order-product-image">

                              {item.image ? (
                                <img
                                  src={
                                    item.image
                                  }
                                  alt={
                                    item.name
                                  }
                                />
                              ) : (
                                <Package
                                  size={35}
                                />
                              )}

                            </div>


                            {/* DETAILS */}

                            <div className="order-product-info">

                              <span className="order-category">
                                {item.category ||
                                  "Product"}
                              </span>

                              <h3>
                                {item.name}
                              </h3>


                              <p>
                                Colour:{" "}

                                <strong>
                                  {item.color ||
                                    "Default"}
                                </strong>
                              </p>


                              <p>
                                Quantity:{" "}

                                <strong>
                                  {item.quantity}
                                </strong>
                              </p>


                              {/* DELIVERY */}

                              <div className="order-delivery">

                                <CalendarDays
                                  size={15}
                                />

                                <span>
                                  Delivery:
                                </span>

                                <strong>
                                  {formatDeliveryDate(
                                    item.deliveryDate
                                  )}
                                </strong>

                              </div>

                            </div>


                            {/* PRICE */}

                            <div className="order-product-price">

                              ₹
                              {(
                                Number(
                                  item.price
                                ) *
                                Number(
                                  item.quantity
                                )
                              ).toLocaleString(
                                "en-IN"
                              )}

                            </div>

                          </div>

                        )
                      )}

                  </div>


                  {/* =========================
                      ORDER FOOTER
                  ========================= */}

                  <div className="order-footer">

                    <div className="order-total">

                      <span>
                        Order Total
                      </span>

                      <strong>
                        ₹
                        {Number(
                          order.total || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                    </div>


                    <Link
                      to={`/track/${order._id}`}
                      className="track-order-button"
                    >

                      <Truck size={16} />

                      Track Order

                    </Link>

                  </div>

                </div>

              ))}

            </div>

          )}

      </main>

    </div>
  );
}


// =====================================================
// ORDER DATE
// =====================================================

function formatOrderDate(date) {
  if (!date) {
    return "Unknown";
  }

  const formatted =
    new Date(date);

  return formatted.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}


// =====================================================
// DELIVERY DATE
// =====================================================

function formatDeliveryDate(date) {
  if (!date) {
    return "Not selected";
  }

  const parts =
    date.split("-");

  if (parts.length !== 3) {
    return date;
  }

  const year =
    Number(parts[0]);

  const month =
    Number(parts[1]) - 1;

  const day =
    Number(parts[2]);

  return new Date(
    year,
    month,
    day
  ).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

export default Orders;