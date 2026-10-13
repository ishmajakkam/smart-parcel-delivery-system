import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  User,
  Package,
  Truck,
  CheckCircle,
  Heart,
  ShoppingCart,
  LogOut,
} from "lucide-react";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlistCount, setWishlistCount] =
    useState(0);

  const [loadingOrders, setLoadingOrders] =
    useState(true);

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch (error) {
      console.error(
        "User data error:",
        error
      );
      navigate("/login");
      return;
    }

    loadProfileData();
  }, [navigate]);


  // =====================================================
  // LOAD PROFILE DATA
  // =====================================================

  const loadProfileData = async () => {
    // -------------------------
    // WISHLIST
    // -------------------------

    try {
      const storedWishlist =
        JSON.parse(
          localStorage.getItem(
            "wishlist"
          ) || "[]"
        );

      setWishlistCount(
        storedWishlist.length
      );
    } catch {
      setWishlistCount(0);
    }


    // -------------------------
    // ORDERS FROM MONGODB
    // -------------------------

    try {
      setLoadingOrders(true);

      const token =
        localStorage.getItem("token");

      if (!token) {
        setOrders([]);
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/orders",
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
        if (
          response.status === 401
        ) {
          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "isLoggedIn"
          );

          localStorage.removeItem(
            "user"
          );

          navigate("/login");

          return;
        }

        throw new Error(
          data.message ||
            "Failed to load orders"
        );
      }

      // Backend returns an array directly.
      const backendOrders =
        Array.isArray(data)
          ? data
          : data.orders || [];

      setOrders(
        backendOrders
      );

    } catch (error) {
      console.error(
        "Profile orders error:",
        error
      );

      setOrders([]);

    } finally {
      setLoadingOrders(false);
    }
  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    localStorage.removeItem(
      "user"
    );

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "isLoggedIn"
    );

    navigate("/login");
  };


  // =====================================================
  // LOADING USER
  // =====================================================

  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading...
      </div>
    );
  }


  // =====================================================
  // ORDER STATS
  // =====================================================

  const totalOrders =
    orders.length;

  const activeOrders =
    orders.filter(
      (order) =>
        order.status !==
        "Delivered"
    ).length;

  const deliveredOrders =
    orders.filter(
      (order) =>
        order.status ===
        "Delivered"
    ).length;


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
          color: #171717;
        }

        .profile-page {
          min-height: 100vh;
          background: #fafafa;
        }

        /* =========================
           HEADER
        ========================= */

        .profile-header {
          height: 92px;
          background: white;
          border-bottom: 1px solid #eeeeee;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 6%;
        }

        .profile-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-icon {
          width: 48px;
          height: 48px;
          border-radius: 13px;
          background: #fff0f6;
          color: #ff2468;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-name {
          font-size: 25px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .brand-name span {
          color: #e91e63;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .header-icon {
          position: relative;
          color: #222;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .wishlist-badge {
          position: absolute;
          top: -10px;
          right: -12px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #e91e63;
          color: white;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile-header-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #f7f7f7;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* =========================
           MAIN
        ========================= */

        .profile-container {
          width: 90%;
          max-width: 1450px;
          margin: 0 auto;
          padding: 28px 0 60px;
        }

        /* =========================
           USER CARD
        ========================= */

        .user-card {
          background: white;
          border: 1px solid #e9e9e9;
          border-radius: 16px;
          min-height: 145px;
          padding: 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
        }

        .user-left {
          display: flex;
          align-items: center;
          gap: 22px;
        }

        .user-avatar {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: #fff0f6;
          color: #e91e63;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-details h1 {
          margin: 0 0 8px;
          font-size: 31px;
          font-weight: 800;
        }

        .user-details p {
          margin: 5px 0;
          color: #777;
          font-size: 15px;
        }

        .edit-profile {
          border: 1px solid #ff2468;
          background: white;
          color: #e91e63;
          border-radius: 8px;
          padding: 13px 25px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .edit-profile:hover {
          background: #fff0f6;
        }

        /* =========================
           STATS
        ========================= */

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 28px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e9e9e9;
          border-radius: 15px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 17px;
        }

        .stat-icon {
          color: #e91e63;
        }

        .stat-number {
          font-size: 25px;
          font-weight: 800;
          margin-bottom: 5px;
        }

        .stat-label {
          color: #888;
          font-size: 14px;
        }

        /* =========================
           LOWER SECTION
        ========================= */

        .lower-grid {
          display: grid;
          grid-template-columns: 1fr 335px;
          gap: 25px;
        }

        .orders-card,
        .quick-links {
          background: white;
          border: 1px solid #e9e9e9;
          border-radius: 15px;
        }

        .orders-card {
          padding: 28px;
        }

        .section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 7px;
        }

        .section-heading h2 {
          margin: 0;
          font-size: 23px;
        }

        .view-all {
          text-decoration: none;
          color: #e91e63;
          font-size: 14px;
          font-weight: 700;
        }

        .section-subtitle {
          color: #888;
          font-size: 14px;
          margin: 0 0 25px;
        }

        /* =========================
           ORDER
        ========================= */

        .order-card {
          border: 1px solid #eeeeee;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 15px;
        }

        .order-top {
          background: #fff;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #eeeeee;
        }

        .order-number {
          font-size: 15px;
          font-weight: 700;
        }

        .order-date {
          color: #888;
          font-size: 13px;
          margin-top: 5px;
        }

        .order-status {
          color: #e91e63;
          background: #fff0f6;
          border-radius: 20px;
          padding: 8px 14px;
          font-size: 12px;
          font-weight: 700;
        }

        .order-product {
          padding: 18px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .product-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .product-image {
          width: 84px;
          height: 84px;
          object-fit: cover;
          border-radius: 9px;
          background: #f5f5f5;
        }

        .product-name {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .product-info {
          color: #777;
          font-size: 13px;
          line-height: 1.7;
        }

        .delivery {
          color: #e91e63;
        }

        .product-price {
          font-size: 16px;
          font-weight: 800;
        }

        /* =========================
           QUICK LINKS
        ========================= */

        .quick-links {
          padding: 27px 25px;
        }

        .quick-links h2 {
          margin: 0 0 20px;
          font-size: 21px;
        }

        .quick-link {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 17px 7px;
          border-bottom: 1px solid #eeeeee;
          text-decoration: none;
          color: #333;
          font-size: 14px;
        }

        .quick-link:last-child {
          border-bottom: none;
        }

        .quick-link svg {
          color: #e91e63;
        }

        .quick-link:hover {
          color: #e91e63;
        }

        .logout-link {
          cursor: pointer;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          font-family: inherit;
        }

        /* =========================
           EMPTY ORDERS
        ========================= */

        .empty-orders {
          padding: 45px 20px;
          text-align: center;
          color: #888;
        }

        .empty-orders svg {
          color: #e91e63;
          margin-bottom: 10px;
        }

        /* =========================
           LOADING
        ========================= */

        .loading-orders {
          padding: 35px;
          text-align: center;
          color: #888;
        }

        .loading-orders svg {
          color: #e91e63;
          margin-bottom: 10px;
        }

        /* =========================
           RESPONSIVE
        ========================= */

        @media (max-width: 1000px) {

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .lower-grid {
            grid-template-columns: 1fr;
          }

        }

        @media (max-width: 650px) {

          .profile-header {
            padding: 0 4%;
          }

          .brand-name {
            font-size: 18px;
          }

          .header-actions {
            gap: 15px;
          }

          .profile-container {
            width: 92%;
          }

          .user-card {
            padding: 20px;
            align-items: flex-start;
          }

          .user-left {
            gap: 14px;
          }

          .user-avatar {
            width: 65px;
            height: 65px;
          }

          .user-details h1 {
            font-size: 23px;
          }

          .edit-profile {
            display: none;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .stat-card {
            padding: 15px;
          }

          .stat-number {
            font-size: 21px;
          }

          .orders-card {
            padding: 18px;
          }

          .order-product {
            align-items: flex-start;
          }

          .product-left {
            align-items: flex-start;
          }

          .product-image {
            width: 65px;
            height: 65px;
          }

          .product-price {
            font-size: 14px;
          }

        }

      `}</style>


      <div className="profile-page">

        {/* =========================
            HEADER
        ========================= */}

        <header className="profile-header">

          <Link
            to="/"
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >

            <div className="profile-brand">

              <div className="brand-icon">
                <Package size={27} />
              </div>

              <div className="brand-name">
                SmartParcel{" "}
                <span>Delivery</span>
              </div>

            </div>

          </Link>


          <div className="header-actions">

            <Link
              to="/wishlist"
              className="header-icon"
            >

              <Heart
                size={26}
                fill="#222"
              />

              {wishlistCount > 0 && (
                <span className="wishlist-badge">
                  {wishlistCount}
                </span>
              )}

            </Link>


            <Link
              to="/cart"
              className="header-icon"
            >
              <ShoppingCart size={27} />
            </Link>


            <div className="profile-header-icon">
              <User size={23} />
            </div>

          </div>

        </header>


        {/* =========================
            MAIN
        ========================= */}

        <main className="profile-container">

          {/* USER CARD */}

          <section className="user-card">

            <div className="user-left">

              <div className="user-avatar">
                <User size={45} />
              </div>

              <div className="user-details">

                <h1>
                  {user.name || "User"}
                </h1>

                <p>
                  {user.email || ""}
                </p>

                <p>
                  {user.phone || ""}
                </p>

              </div>

            </div>


            <button
              className="edit-profile"
              onClick={() => {
                alert(
                  "Edit Profile coming soon"
                );
              }}
            >
              Edit Profile
            </button>

          </section>


          {/* STATS */}

          <section className="stats-grid">

            <div className="stat-card">

              <Package
                className="stat-icon"
                size={30}
              />

              <div>

                <div className="stat-number">
                  {totalOrders}
                </div>

                <div className="stat-label">
                  Total Orders
                </div>

              </div>

            </div>


            <div className="stat-card">

              <Truck
                className="stat-icon"
                size={30}
              />

              <div>

                <div className="stat-number">
                  {activeOrders}
                </div>

                <div className="stat-label">
                  Active Orders
                </div>

              </div>

            </div>


            <div className="stat-card">

              <CheckCircle
                className="stat-icon"
                size={30}
              />

              <div>

                <div className="stat-number">
                  {deliveredOrders}
                </div>

                <div className="stat-label">
                  Delivered
                </div>

              </div>

            </div>


            <div className="stat-card">

              <Heart
                className="stat-icon"
                size={30}
              />

              <div>

                <div className="stat-number">
                  {wishlistCount}
                </div>

                <div className="stat-label">
                  Wishlist
                </div>

              </div>

            </div>

          </section>


          {/* LOWER CONTENT */}

          <section className="lower-grid">

            {/* ORDERS */}

            <div className="orders-card">

              <div className="section-heading">

                <h2>
                  My Orders
                </h2>

                <Link
                  to="/orders"
                  className="view-all"
                >
                  View All →
                </Link>

              </div>

              <p className="section-subtitle">
                Your recently ordered products
              </p>


              {loadingOrders ? (

                <div className="loading-orders">

                  <Package size={40} />

                  <p>
                    Loading your orders...
                  </p>

                </div>

              ) : orders.length === 0 ? (

                <div className="empty-orders">

                  <Package size={40} />

                  <p>
                    You haven't placed any orders yet.
                  </p>

                  <Link
                    to="/shop"
                    className="view-all"
                  >
                    Start Shopping →
                  </Link>

                </div>

              ) : (

                orders
                  .slice(0, 3)
                  .map(
                    (
                      order,
                      orderIndex
                    ) => {

                      const firstItem =
                        order.items?.[0] ||
                        {};

                      const productName =
                        firstItem.name ||
                        "Product";

                      const productImage =
                        firstItem.image ||
                        "";

                      const quantity =
                        firstItem.quantity ||
                        1;

                      const price =
                        Number(
                          firstItem.price ||
                            0
                        );

                      return (
                        <div
                          className="order-card"
                          key={
                            order._id ||
                            orderIndex
                          }
                        >

                          <div className="order-top">

                            <div>

                              <div className="order-number">

                                Order #

                                {String(
                                  order._id ||
                                    orderIndex +
                                      1
                                ).slice(-8)}

                              </div>

                              <div className="order-date">

                                {order.createdAt
                                  ? new Date(
                                      order.createdAt
                                    ).toLocaleDateString(
                                      "en-IN",
                                      {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      }
                                    )
                                  : "Recently"}

                              </div>

                            </div>


                            <div className="order-status">

                              {order.status ||
                                "Order Placed"}

                            </div>

                          </div>


                          <div className="order-product">

                            <div className="product-left">

                              {productImage ? (

                                <img
                                  src={
                                    productImage
                                  }
                                  alt={
                                    productName
                                  }
                                  className="product-image"
                                />

                              ) : (

                                <div className="product-image" />

                              )}


                              <div>

                                <div className="product-name">
                                  {productName}
                                </div>

                                <div className="product-info">

                                  {firstItem.color && (
                                    <>
                                      Colour:{" "}
                                      {
                                        firstItem.color
                                      }
                                      <br />
                                    </>
                                  )}

                                  Quantity:{" "}
                                  {quantity}

                                  <br />

                                  <span className="delivery">
                                    🚚 Delivery:{" "}
                                    {firstItem.deliveryDate ||
                                      "Not selected"}
                                  </span>

                                </div>

                              </div>

                            </div>


                            <div className="product-price">

                              ₹
                              {price.toLocaleString(
                                "en-IN"
                              )}

                            </div>

                          </div>

                        </div>
                      );
                    }
                  )

              )}

            </div>


            {/* QUICK LINKS */}

            <div className="quick-links">

              <h2>
                Quick Links
              </h2>

              <Link
                to="/orders"
                className="quick-link"
              >
                <Package size={21} />
                My Orders
              </Link>

              <Link
                to="/wishlist"
                className="quick-link"
              >
                <Heart size={21} />
                Wishlist
              </Link>

              <Link
                to="/cart"
                className="quick-link"
              >
                <ShoppingCart size={21} />
                My Cart
              </Link>

              <Link
                to="/track"
                className="quick-link"
              >
                <Truck size={21} />
                Track Order
              </Link>

              <button
                className="quick-link logout-link"
                onClick={logout}
              >
                <LogOut size={21} />
                Logout
              </button>

            </div>

          </section>

        </main>

      </div>
    </>
  );
}

export default Profile;