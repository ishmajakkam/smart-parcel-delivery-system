import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// =========================
// CUSTOMER PAGES
// =========================
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import CategoryPage from "./pages/CategoryPage";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import DeliveryDate from "./pages/DeliveryDate";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BookParcel from "./pages/BookParcel";
import TrackParcel from "./pages/TrackParcel";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";

// =========================
// ADMIN PAGES
// =========================
import AdminLogin from "./pages/AdminLogin";
import AdminOrders from "./pages/AdminOrders";

// =========================
// DELIVERY BOY PAGES
// =========================
import DeliveryLogin from "./pages/DeliveryLogin";
import DeliveryDashboard from "./pages/DeliveryDashboard";

// =========================
// APP
// =========================
function App() {
  const [isLoggedIn, setIsLoggedIn] =
    useState(
      localStorage.getItem("isLoggedIn") === "true"
    );

  useEffect(() => {
    const handleStorage = () => {
      setIsLoggedIn(
        localStorage.getItem("isLoggedIn") === "true"
      );
    };

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            CUSTOMER
        ========================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/shop"
          element={<Shop />}
        />

        <Route
          path="/shop/:category"
          element={<CategoryPage />}
        />

        <Route
          path="/wishlist"
          element={<Wishlist />}
        />

        <Route
          path="/cart"
          element={<Cart />}
        />

        <Route
          path="/delivery-date"
          element={<DeliveryDate />}
        />

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        <Route
          path="/order-confirmation"
          element={<OrderConfirmation />}
        />

        <Route
          path="/login"
          element={
            <Login
              setIsLoggedIn={setIsLoggedIn}
            />
          }
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/book"
          element={<BookParcel />}
        />

        <Route
          path="/track"
          element={<TrackParcel />}
        />

        <Route
          path="/track/:orderId"
          element={<TrackParcel />}
        />

        <Route
          path="/orders"
          element={<Orders />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* =========================
            ADMIN
        ========================= */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        <Route
          path="/admin/orders"
          element={<AdminOrders />}
        />

        {/* =========================
            DELIVERY BOY
        ========================= */}

        <Route
          path="/delivery/login"
          element={<DeliveryLogin />}
        />

        <Route
          path="/delivery"
          element={<DeliveryDashboard />}
        />

        {/* =========================
            FALLBACK
        ========================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;