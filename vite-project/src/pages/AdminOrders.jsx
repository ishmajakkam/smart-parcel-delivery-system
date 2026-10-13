import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  Users,
  IndianRupee,
  LogOut,
  RefreshCw,
  MapPin,
  Phone,
  User,
} from "lucide-react";

function AdminOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState("");

  const adminToken = localStorage.getItem("adminToken");
  const admin = JSON.parse(
    localStorage.getItem("admin") || "null"
  );

  const statuses = [
    "Order Placed",
    "Order Confirmed",
    "Shipped",
    "Out for Delivery",
    "Delivered",
  ];

  useEffect(() => {
    if (!adminToken) {
      navigate("/admin/login");
      return;
    }

    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        "http://localhost:5000/api/admin/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");
        navigate("/admin/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load orders"
        );
      }

      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Unable to load orders"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      setUpdating(orderId);

      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `http://localhost:5000/api/admin/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");
        navigate("/admin/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update status"
        );
      }

      setOrders((oldOrders) =>
        oldOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                status: data.order.status,
              }
            : order
        )
      );
    } catch (err) {
      alert(
        err.message || "Unable to update order status"
      );
    } finally {
      setUpdating(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    navigate("/admin/login");
  };

  /* =========================
     DASHBOARD CALCULATIONS
  ========================= */

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) =>
      order.status === "Order Placed" ||
      order.status === "Order Confirmed"
  ).length;

  const shippedOrders = orders.filter(
    (order) =>
      order.status === "Shipped" ||
      order.status === "Out for Delivery"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  const totalRevenue = orders.reduce(
    (total, order) =>
      total + Number(order.total || 0),
    0
  );

  return (
    <>
      <style>{`

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Arial, Helvetica, sans-serif;
          background: #fafafa;
          color: #222;
        }

        .admin-page {
          min-height: 100vh;
          background: #fafafa;
        }

        /* =========================
           HEADER
        ========================= */

        .admin-header {
          height: 72px;
          background: white;
          border-bottom: 1px solid #eeeeee;
          padding: 0 6%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .admin-brand {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .admin-logo {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #fff0f6;
          color: #e91e63;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 20px;
        }

        .admin-brand-name {
          font-size: 21px;
          font-weight: 800;
        }

        .admin-brand-name span {
          color: #e91e63;
        }

        .admin-tag {
          color: #888;
          font-size: 12px;
          margin-left: 7px;
        }

        .admin-header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .admin-user {
          font-size: 14px;
          color: #555;
        }

        .logout-button {
          border: 1px solid #ddd;
          background: white;
          border-radius: 8px;
          padding: 9px 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
        }

        .logout-button:hover {
          background: #f7f7f7;
        }

        /* =========================
           MAIN
        ========================= */

        .admin-container {
          width: 90%;
          max-width: 1400px;
          margin: auto;
          padding: 38px 0 70px;
        }

        .welcome-section {
          margin-bottom: 28px;
        }

        .welcome-section h1 {
          margin: 0;
          font-size: 30px;
          font-weight: 800;
        }

        .welcome-section p {
          margin: 8px 0 0;
          color: #888;
          font-size: 14px;
        }

        /* =========================
           STATS
        ========================= */

        .stats-grid {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 17px;
          margin-bottom: 18px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e9e9e9;
          border-radius: 15px;
          padding: 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stat-label {
          color: #888;
          font-size: 13px;
          margin-bottom: 7px;
        }

        .stat-number {
          font-size: 27px;
          font-weight: 800;
        }

        .stat-icon {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          background: #fff0f6;
          color: #e91e63;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* =========================
           REVENUE
        ========================= */

        .revenue-card {
          background: white;
          border: 1px solid #e9e9e9;
          border-radius: 15px;
          padding: 20px 24px;
          margin-bottom: 32px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .revenue-icon {
          width: 42px;
          height: 42px;
          border-radius: 11px;
          background: #fff0f6;
          color: #e91e63;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .revenue-label {
          color: #888;
          font-size: 12px;
        }

        .revenue-value {
          font-size: 20px;
          font-weight: 800;
          margin-top: 3px;
        }

        /* =========================
           ORDERS HEADER
        ========================= */

        .orders-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 17px;
        }

        .orders-title h2 {
          margin: 0;
          font-size: 23px;
        }

        .orders-title p {
          margin: 5px 0 0;
          color: #888;
          font-size: 13px;
        }

        .refresh-button {
          border: 1px solid #ddd;
          background: white;
          border-radius: 8px;
          padding: 10px 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
        }

        .refresh-button:hover {
          background: #f7f7f7;
        }

        /* =========================
           ORDER CARD
        ========================= */

        .order-card {
          background: white;
          border: 1px solid #e7e7e7;
          border-radius: 15px;
          overflow: hidden;
          margin-bottom: 18px;
        }

        .order-header {
          padding: 17px 20px;
          border-bottom: 1px solid #eeeeee;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
        }

        .order-id {
          font-size: 14px;
          font-weight: 800;
        }

        .order-date {
          color: #999;
          font-size: 12px;
          margin-top: 5px;
        }

        .status-badge {
          padding: 8px 13px;
          border-radius: 20px;
          background: #fff0f6;
          color: #e91e63;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .order-content {
          padding: 20px;
          display: grid;
          grid-template-columns:
            1fr 1.4fr 1fr;
          gap: 28px;
        }

        .column-title {
          font-size: 11px;
          color: #999;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .6px;
          margin-bottom: 13px;
        }

        /* CUSTOMER */

        .customer-row {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin-bottom: 11px;
          color: #555;
          font-size: 13px;
          line-height: 1.5;
        }

        .customer-row svg {
          flex-shrink: 0;
          color: #e91e63;
        }

        /* PRODUCTS */

        .product-row {
          display: flex;
          gap: 12px;
          margin-bottom: 14px;
        }

        .product-image {
          width: 60px;
          height: 60px;
          border-radius: 9px;
          object-fit: cover;
          background: #f4f4f4;
          flex-shrink: 0;
        }

        .product-name {
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 5px;
        }

        .product-meta {
          color: #888;
          font-size: 12px;
          line-height: 1.6;
        }

        /* ADDRESS */

        .address {
          color: #555;
          font-size: 13px;
          line-height: 1.7;
        }

        /* =========================
           ORDER FOOTER
        ========================= */

        .order-footer {
          padding: 17px 20px;
          border-top: 1px solid #eeeeee;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .total {
          font-size: 19px;
          font-weight: 800;
        }

        .total span {
          color: #888;
          font-size: 12px;
          font-weight: 400;
          margin-right: 7px;
        }

        .status-actions {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .status-button {
          border: 1px solid #ddd;
          background: white;
          border-radius: 7px;
          padding: 8px 10px;
          cursor: pointer;
          font-size: 11px;
        }

        .status-button:hover {
          background: #f8f8f8;
        }

        .status-button.active {
          background: #e91e63;
          border-color: #e91e63;
          color: white;
        }

        .status-button:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        /* =========================
           STATES
        ========================= */

        .loading,
        .empty,
        .error {
          background: white;
          border: 1px solid #e9e9e9;
          border-radius: 15px;
          padding: 60px 20px;
          text-align: center;
          color: #888;
        }

        .error {
          color: #555;
        }

        .retry-button {
          margin-top: 15px;
          border: none;
          background: #e91e63;
          color: white;
          border-radius: 8px;
          padding: 10px 18px;
          cursor: pointer;
        }

        /* =========================
           MOBILE
        ========================= */

        @media (max-width: 1050px) {

          .stats-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .order-content {
            grid-template-columns:
              1fr 1fr;
          }

        }

        @media (max-width: 700px) {

          .admin-header {
            padding: 0 4%;
          }

          .admin-user,
          .admin-tag {
            display: none;
          }

          .admin-container {
            width: 92%;
            padding-top: 25px;
          }

          .welcome-section h1 {
            font-size: 25px;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .stat-card {
            padding: 16px;
          }

          .stat-number {
            font-size: 21px;
          }

          .stat-icon {
            width: 38px;
            height: 38px;
          }

          .order-content {
            grid-template-columns: 1fr;
          }

          .order-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .order-footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .status-actions {
            justify-content: flex-start;
          }

        }

      `}</style>

      <div className="admin-page">

        {/* =========================
            HEADER
        ========================= */}

        <header className="admin-header">

          <div className="admin-brand">

            <div className="admin-logo">
              S
            </div>

            <div>
              <span className="admin-brand-name">
                SmartParcel{" "}
                <span>Delivery</span>
              </span>

              <span className="admin-tag">
                Admin Portal
              </span>
            </div>

          </div>

          <div className="admin-header-right">

            {admin?.name && (
              <span className="admin-user">
                Welcome, {admin.name}
              </span>
            )}

            <button
              className="logout-button"
              onClick={logout}
            >
              <LogOut size={15} />
              Logout
            </button>

          </div>

        </header>

        {/* =========================
            MAIN
        ========================= */}

        <main className="admin-container">

          <div className="welcome-section">

            <h1>
              Admin Dashboard
            </h1>

            <p>
              Manage SmartParcel orders and parcel
              delivery status.
            </p>

          </div>

          {/* =========================
              STATS
          ========================= */}

          <div className="stats-grid">

            <div className="stat-card">

              <div>
                <div className="stat-label">
                  Total Orders
                </div>

                <div className="stat-number">
                  {totalOrders}
                </div>
              </div>

              <div className="stat-icon">
                <Package size={22} />
              </div>

            </div>

            <div className="stat-card">

              <div>
                <div className="stat-label">
                  Pending Orders
                </div>

                <div className="stat-number">
                  {pendingOrders}
                </div>
              </div>

              <div className="stat-icon">
                <Clock size={22} />
              </div>

            </div>

            <div className="stat-card">

              <div>
                <div className="stat-label">
                  In Delivery
                </div>

                <div className="stat-number">
                  {shippedOrders}
                </div>
              </div>

              <div className="stat-icon">
                <Truck size={22} />
              </div>

            </div>

            <div className="stat-card">

              <div>
                <div className="stat-label">
                  Delivered
                </div>

                <div className="stat-number">
                  {deliveredOrders}
                </div>
              </div>

              <div className="stat-icon">
                <CheckCircle size={22} />
              </div>

            </div>

          </div>

          {/* =========================
              REVENUE
          ========================= */}

          <div className="revenue-card">

            <div className="revenue-icon">
              <IndianRupee size={21} />
            </div>

            <div>
              <div className="revenue-label">
                Total Order Revenue
              </div>

              <div className="revenue-value">
                ₹
                {totalRevenue.toLocaleString(
                  "en-IN"
                )}
              </div>
            </div>

          </div>

          {/* =========================
              ORDERS HEADER
          ========================= */}

          <div className="orders-header">

            <div className="orders-title">

              <h2>
                Customer Orders
              </h2>

              <p>
                View and manage all customer
                orders.
              </p>

            </div>

            <button
              className="refresh-button"
              onClick={fetchOrders}
            >
              <RefreshCw size={15} />
              Refresh
            </button>

          </div>

          {/* =========================
              LOADING
          ========================= */}

          {loading && (
            <div className="loading">
              Loading customer orders...
            </div>
          )}

          {/* =========================
              ERROR
          ========================= */}

          {!loading && error && (
            <div className="error">

              <p>{error}</p>

              <button
                className="retry-button"
                onClick={fetchOrders}
              >
                Try Again
              </button>

            </div>
          )}

          {/* =========================
              EMPTY
          ========================= */}

          {!loading &&
            !error &&
            orders.length === 0 && (
              <div className="empty">

                <Package
                  size={45}
                  strokeWidth={1.5}
                />

                <p>
                  No customer orders found.
                </p>

              </div>
            )}

          {/* =========================
              ORDERS
          ========================= */}

          {!loading &&
            !error &&
            orders.map((order) => (

              <div
                className="order-card"
                key={order._id}
              >

                {/* ORDER HEADER */}

                <div className="order-header">

                  <div>

                    <div className="order-id">
                      Order #{order._id}
                    </div>

                    <div className="order-date">
                      {order.createdAt
                        ? new Date(
                            order.createdAt
                          ).toLocaleString("en-IN")
                        : "Date unavailable"}
                    </div>

                  </div>

                  <div className="status-badge">
                    {order.status ||
                      "Order Placed"}
                  </div>

                </div>

                {/* ORDER CONTENT */}

                <div className="order-content">

                  {/* CUSTOMER */}

                  <div>

                    <div className="column-title">
                      Customer
                    </div>

                    <div className="customer-row">
                      <User size={16} />

                      <span>
                        {order.address?.name ||
                          "Customer"}
                      </span>
                    </div>

                    <div className="customer-row">
                      <Phone size={16} />

                      <span>
                        {order.address?.phone ||
                          "No phone"}
                      </span>
                    </div>

                  </div>

                  {/* PRODUCTS */}

                  <div>

                    <div className="column-title">
                      Products
                    </div>

                    {order.items?.map(
                      (item, index) => (

                        <div
                          className="product-row"
                          key={
                            item.productId ||
                            index
                          }
                        >

                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="product-image"
                            />
                          ) : (
                            <div className="product-image" />
                          )}

                          <div>

                            <div className="product-name">
                              {item.name}
                            </div>

                            <div className="product-meta">
                              Quantity:{" "}
                              {item.quantity || 1}
                              <br />

                              Price: ₹
                              {Number(
                                item.price || 0
                              ).toLocaleString(
                                "en-IN"
                              )}

                              {item.color && (
                                <>
                                  <br />
                                  Colour:{" "}
                                  {item.color}
                                </>
                              )}

                              {item.deliveryDate && (
                                <>
                                  <br />
                                  Delivery:{" "}
                                  {
                                    item.deliveryDate
                                  }
                                </>
                              )}
                            </div>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                  {/* ADDRESS */}

                  <div>

                    <div className="column-title">
                      Delivery Address
                    </div>

                    <div className="customer-row">
                      <MapPin size={16} />

                      <div className="address">

                        {order.address?.house}
                        <br />

                        {order.address?.street}
                        <br />

                        {order.address?.city},{" "}
                        {order.address?.state}
                        <br />

                        {order.address?.pincode}

                      </div>

                    </div>

                  </div>

                </div>

                {/* ORDER FOOTER */}

                <div className="order-footer">

                  <div className="total">

                    <span>
                      Total
                    </span>

                    ₹
                    {Number(
                      order.total || 0
                    ).toLocaleString(
                      "en-IN"
                    )}

                  </div>

                  <div className="status-actions">

                    {statuses.map(
                      (status) => (

                        <button
                          key={status}
                          className={
                            "status-button " +
                            (
                              order.status ===
                              status
                                ? "active"
                                : ""
                            )
                          }
                          disabled={
                            updating ===
                              order._id ||
                            order.status ===
                              status
                          }
                          onClick={() =>
                            updateStatus(
                              order._id,
                              status
                            )
                          }
                        >
                          {updating ===
                            order._id &&
                          order.status !==
                            status
                            ? "Updating..."
                            : status}
                        </button>

                      )
                    )}

                  </div>

                </div>

              </div>

            ))}

        </main>

      </div>
    </>
  );
}

export default AdminOrders;