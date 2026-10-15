import { Link, useNavigate } from "react-router-dom";

import {
  Package,
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { useState } from "react";

function Register() {
  const navigate = useNavigate();

  // =========================
  // FORM STATE
  // =========================

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // =========================
  // REGISTER
  // =========================

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    // =========================
    // NAME VALIDATION
    // =========================

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    // =========================
    // EMAIL VALIDATION
    // =========================

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    // =========================
    // PHONE VALIDATION
    // =========================

    const cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    // =========================
    // PASSWORD VALIDATION
    // =========================

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    // =========================
    // SEND DATA TO BACKEND
    // =========================

    try {
      const response = await fetch(
        "https://smartparcel-backend.onrender.com/api/users/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone: cleanPhone,
            password: password,
          }),
        }
      );

      const data = await response.json();

      // =========================
      // BACKEND ERROR
      // =========================

      if (!response.ok) {
        setError(data.message || "Registration failed.");
        return;
      }

      // =========================
      // SUCCESS
      // =========================

      setMessage("Account created successfully!");

      // Clear form
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");

      // Go to login after 1 second
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      console.error("Registration error:", error);

      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    }
  };

  return (
    <div className="register-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="register-header">
        <Link to="/" className="register-logo">

          <div className="register-logo-icon">
            <Package size={21} />
          </div>

          <span>
            SmartParcel <b>Delivery</b>
          </span>

        </Link>
      </header>

      {/* =========================
          MAIN
      ========================= */}

      <main className="register-container">

        {/* =========================
            LEFT SIDE
        ========================= */}

        <section className="register-brand">

          <div className="register-brand-icon">
            <Truck size={34} />
          </div>

          <p className="register-small-title">
            SMARTPARCEL DELIVERY
          </p>

          <h1>
            Your Parcel,
            <br />
            <span>Our Priority.</span>
          </h1>

          <p className="register-brand-text">
            Fast, safe and reliable delivery
            for everything you care about.
          </p>

          {/* FEATURES */}

          <div className="register-features">

            <div className="register-feature">

              <div className="register-feature-icon">
                <Truck size={18} />
              </div>

              <div>
                <strong>
                  Fast Delivery
                </strong>

                <span>
                  Get your orders delivered
                  on time.
                </span>
              </div>

            </div>

            <div className="register-feature">

              <div className="register-feature-icon">
                <ShieldCheck size={18} />
              </div>

              <div>
                <strong>
                  Safe & Secure
                </strong>

                <span>
                  Your parcels are handled
                  with care.
                </span>
              </div>

            </div>

          </div>
        </section>

        {/* =========================
            RIGHT SIDE
        ========================= */}

        <section className="register-form-wrapper">

          <div className="register-card">

            {/* HEADING */}

            <div className="register-card-heading">

              <h2>
                Create Account
              </h2>

              <p>
                Join SmartParcel Delivery
              </p>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleRegister}
              className="register-form"
            >

              {/* NAME */}

              <div className="register-field">

                <label>
                  Full Name
                </label>

                <div className="register-input">

                  <User size={17} />

                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError("");
                      setMessage("");
                    }}
                  />

                </div>
              </div>

              {/* EMAIL */}

              <div className="register-field">

                <label>
                  Email Address
                </label>

                <div className="register-input">

                  <Mail size={17} />

                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                      setMessage("");
                    }}
                  />

                </div>
              </div>

              {/* PHONE */}

              <div className="register-field">

                <label>
                  Mobile Number
                </label>

                <div className="register-input">

                  <Phone size={17} />

                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength="10"
                    placeholder="Enter 10-digit mobile number"
                    value={phone}
                    onChange={(e) => {
                      const value =
                        e.target.value.replace(/\D/g, "");

                      setPhone(value);
                      setError("");
                      setMessage("");
                    }}
                  />

                </div>
              </div>

              {/* PASSWORD */}

              <div className="register-field">

                <label>
                  Password
                </label>

                <div className="register-input">

                  <Lock size={17} />

                  <input
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                      setMessage("");
                    }}
                  />

                </div>
              </div>

              {/* ERROR */}

              {error && (
                <div className="register-error">
                  {error}
                </div>
              )}

              {/* SUCCESS */}

              {message && (
                <div className="register-message">
                  {message}
                </div>
              )}

              {/* CREATE ACCOUNT */}

              <button
                type="submit"
                className="register-button"
              >
                Create Account
                <ArrowRight size={16} />
              </button>

            </form>

            {/* LOGIN */}

            <p className="register-login">
              Already have an account?{" "}

              <Link to="/login">
                Login
              </Link>

            </p>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Register;