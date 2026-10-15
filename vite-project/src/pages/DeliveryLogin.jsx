import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DeliveryLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://smartparcel-backend.onrender.com/api/delivery/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Login failed"
        );
      }

      localStorage.setItem(
        "deliveryToken",
        data.token
      );

      localStorage.setItem(
        "deliveryBoy",
        JSON.stringify(data.deliveryBoy)
      );

      navigate("/delivery");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.brand}>
        <div style={styles.logo}>SP</div>

        <div>
          <h1 style={styles.brandTitle}>
            SmartParcel Delivery
          </h1>

          <p style={styles.brandSubtitle}>
            Delivery Partner Portal
          </p>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.icon}>🚚</div>

        <h2 style={styles.heading}>
          Delivery Partner Login
        </h2>

        <p style={styles.subtitle}>
          Login to manage your deliveries and
          optimize your delivery routes.
        </p>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <label style={styles.label}>
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
            style={styles.input}
          />

          <label style={styles.label}>
            Password
          </label>

          <div style={styles.passwordBox}>
            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
              style={styles.passwordInput}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              style={styles.showButton}
            >
              {showPassword
                ? "Hide"
                : "Show"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={styles.loginButton}
          >
            {loading
              ? "Signing in..."
              : "Login to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #fff5f8, #ffffff)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "45px 20px",
    fontFamily: "Arial, sans-serif",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "35px",
  },

  logo: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    background: "#ff2f70",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "19px",
  },

  brandTitle: {
    margin: 0,
    fontSize: "24px",
  },

  brandSubtitle: {
    margin: "5px 0 0",
    color: "#777",
  },

  card: {
    width: "100%",
    maxWidth: "430px",
    background: "white",
    padding: "35px",
    borderRadius: "20px",
    boxShadow:
      "0 12px 40px rgba(0,0,0,0.08)",
    boxSizing: "border-box",
  },

  icon: {
    fontSize: "45px",
    textAlign: "center",
    marginBottom: "10px",
  },

  heading: {
    textAlign: "center",
    margin: "10px 0",
  },

  subtitle: {
    textAlign: "center",
    color: "#777",
    lineHeight: 1.5,
    marginBottom: "28px",
  },

  error: {
    background: "#ffe5eb",
    color: "#d7194d",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "18px",
    fontSize: "14px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    marginTop: "16px",
    fontWeight: "600",
    fontSize: "14px",
  },

  input: {
    width: "100%",
    padding: "13px",
    border: "1px solid #ddd",
    borderRadius: "9px",
    boxSizing: "border-box",
    fontSize: "15px",
    outline: "none",
  },

  passwordBox: {
    position: "relative",
  },

  passwordInput: {
    width: "100%",
    padding: "13px 65px 13px 13px",
    border: "1px solid #ddd",
    borderRadius: "9px",
    boxSizing: "border-box",
    fontSize: "15px",
    outline: "none",
  },

  showButton: {
    position: "absolute",
    right: "10px",
    top: "9px",
    border: "none",
    background: "transparent",
    color: "#ff2f70",
    cursor: "pointer",
    fontWeight: "600",
  },

  loginButton: {
    width: "100%",
    padding: "14px",
    marginTop: "25px",
    border: "none",
    borderRadius: "10px",
    background: "#ff2f70",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};