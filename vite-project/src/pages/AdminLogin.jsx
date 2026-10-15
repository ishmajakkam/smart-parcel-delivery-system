import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Truck,
} from "lucide-react";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://smartparcel-backend.onrender.com/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid admin credentials.");
        return;
      }

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("admin", JSON.stringify(data.admin));

      navigate("/admin/orders");
    } catch (err) {
      console.error(err);
      setError(
        "Unable to connect to the server. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">

      {/* TOP BRAND BAR */}
      <header className="admin-login-header">
        <div
          className="admin-brand"
          onClick={() => navigate("/")}
        >
          <div className="admin-brand-icon">
            <Truck size={22} />
          </div>

          <div>
            <div className="admin-brand-name">
              SmartParcel
            </div>
            <div className="admin-brand-subtitle">
              Delivery Management
            </div>
          </div>
        </div>

        <button
          className="back-website-btn"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={16} />
          Back to Website
        </button>
      </header>


      {/* MAIN */}
      <main className="admin-login-main">

        <div className="admin-login-container">

          {/* LEFT INFORMATION */}
          <div className="admin-intro">

            <div className="intro-badge">
              <ShieldCheck size={17} />
              Secure Admin Portal
            </div>

            <h1>
              Manage your
              <br />
              <span>SmartParcel</span>
              <br />
              operations.
            </h1>

            <p>
              Manage orders, monitor deliveries and keep
              your customers updated from one central
              administration panel.
            </p>

            <div className="intro-features">
              <div>
                <span>01</span>
                Order Management
              </div>

              <div>
                <span>02</span>
                Delivery Tracking
              </div>

              <div>
                <span>03</span>
                Customer Orders
              </div>
            </div>

          </div>


          {/* LOGIN CARD */}
          <div className="admin-login-card">

            <div className="login-card-icon">
              <ShieldCheck size={28} />
            </div>

            <h2>Admin Login</h2>

            <p className="login-description">
              Sign in to access your administration panel.
            </p>

            <form onSubmit={handleLogin}>

              {/* EMAIL */}
              <div className="admin-field">

                <label>Email Address</label>

                <div className="admin-input-wrapper">

                  <Mail size={18} />

                  <input
                    type="email"
                    placeholder="admin@smartparcel.com"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    autoComplete="username"
                  />

                </div>

              </div>


              {/* PASSWORD */}
              <div className="admin-field">

                <label>Password</label>

                <div className="admin-input-wrapper">

                  <Lock size={18} />

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
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>


              {/* ERROR */}
              {error && (
                <div className="admin-error">
                  {error}
                </div>
              )}


              {/* BUTTON */}
              <button
                type="submit"
                className="admin-login-button"
                disabled={loading}
              >
                {loading
                  ? "Signing in..."
                  : "Sign In"}
              </button>

            </form>


            <div className="admin-security">
              <ShieldCheck size={16} />
              <span>Protected administrator access</span>
            </div>

          </div>

        </div>

      </main>


      {/* FOOTER */}
      <footer className="admin-login-footer">
        © 2026 SmartParcel · Administration Portal
      </footer>


      {/* PAGE-ONLY CSS */}
      <style>{`

        * {
          box-sizing: border-box;
        }

        .admin-login-page {
          min-height: 100vh;
          background: #fafafa;
          color: #171717;
          font-family: Arial, Helvetica, sans-serif;
          display: flex;
          flex-direction: column;
        }

        .admin-login-header {
          height: 76px;
          padding: 0 6%;
          background: #ffffff;
          border-bottom: 1px solid #eeeeee;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .admin-brand {
          display: flex;
          align-items: center;
          gap: 11px;
          cursor: pointer;
        }

        .admin-brand-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: #111111;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .admin-brand-name {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.4px;
        }

        .admin-brand-subtitle {
          color: #888888;
          font-size: 11px;
          margin-top: 2px;
        }

        .back-website-btn {
          border: none;
          background: transparent;
          color: #555555;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          font-size: 13px;
        }

        .back-website-btn:hover {
          color: #111111;
        }

        .admin-login-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 55px 6%;
        }

        .admin-login-container {
          width: 100%;
          max-width: 1050px;
          display: grid;
          grid-template-columns: 1fr 430px;
          gap: 90px;
          align-items: center;
        }

        .admin-intro {
          padding-left: 20px;
        }

        .intro-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 13px;
          border-radius: 30px;
          background: #f0f0f0;
          color: #333333;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 24px;
        }

        .admin-intro h1 {
          margin: 0;
          font-size: 48px;
          line-height: 1.08;
          letter-spacing: -1.8px;
          font-weight: 700;
        }

        .admin-intro h1 span {
          color: #666666;
        }

        .admin-intro > p {
          max-width: 520px;
          margin: 25px 0 30px;
          color: #777777;
          font-size: 15px;
          line-height: 1.7;
        }

        .intro-features {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .intro-features div {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #444444;
          font-size: 13px;
        }

        .intro-features span {
          width: 30px;
          height: 30px;
          border: 1px solid #dddddd;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: #777777;
        }

        .admin-login-card {
          background: #ffffff;
          border: 1px solid #e7e7e7;
          border-radius: 16px;
          padding: 38px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.06);
        }

        .login-card-icon {
          width: 54px;
          height: 54px;
          border-radius: 12px;
          background: #f3f3f3;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #222222;
          margin-bottom: 20px;
        }

        .admin-login-card h2 {
          margin: 0;
          font-size: 28px;
          letter-spacing: -0.7px;
        }

        .login-description {
          margin: 8px 0 28px;
          color: #888888;
          font-size: 13px;
          line-height: 1.5;
        }

        .admin-field {
          margin-bottom: 19px;
        }

        .admin-field label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #333333;
        }

        .admin-input-wrapper {
          height: 49px;
          border: 1px solid #dddddd;
          border-radius: 8px;
          display: flex;
          align-items: center;
          padding: 0 13px;
          gap: 10px;
          transition: border-color 0.2s;
        }

        .admin-input-wrapper:focus-within {
          border-color: #555555;
        }

        .admin-input-wrapper > svg {
          color: #888888;
          flex-shrink: 0;
        }

        .admin-input-wrapper input {
          border: none;
          outline: none;
          width: 100%;
          height: 100%;
          font-size: 14px;
          background: transparent;
          color: #222222;
        }

        .admin-input-wrapper input::placeholder {
          color: #aaaaaa;
        }

        .password-toggle {
          border: none;
          background: transparent;
          color: #777777;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 3px;
        }

        .admin-error {
          background: #fff1f1;
          border: 1px solid #ffd7d7;
          color: #c62828;
          border-radius: 7px;
          padding: 11px 12px;
          font-size: 12px;
          margin-bottom: 17px;
        }

        .admin-login-button {
          width: 100%;
          height: 50px;
          border: none;
          border-radius: 8px;
          background: #111111;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }

        .admin-login-button:hover {
          background: #2b2b2b;
        }

        .admin-login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .admin-security {
          margin-top: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #777777;
          font-size: 11px;
        }

        .admin-security svg {
          color: #16803c;
        }

        .admin-login-footer {
          text-align: center;
          padding: 18px;
          color: #999999;
          font-size: 11px;
          border-top: 1px solid #eeeeee;
          background: white;
        }

        @media (max-width: 850px) {

          .admin-login-container {
            grid-template-columns: 1fr;
            max-width: 500px;
            gap: 35px;
          }

          .admin-intro {
            padding-left: 0;
            text-align: center;
          }

          .intro-badge {
            margin-bottom: 18px;
          }

          .admin-intro h1 {
            font-size: 36px;
          }

          .admin-intro > p {
            margin-left: auto;
            margin-right: auto;
          }

          .intro-features {
            display: none;
          }

        }

        @media (max-width: 550px) {

          .admin-login-header {
            padding: 0 20px;
          }

          .back-website-btn {
            font-size: 0;
          }

          .back-website-btn svg {
            width: 19px;
            height: 19px;
          }

          .admin-login-main {
            padding: 30px 18px;
          }

          .admin-intro h1 {
            font-size: 32px;
          }

          .admin-login-card {
            padding: 27px 22px;
          }

        }

      `}</style>
    </div>
  );
}

export default AdminLogin;