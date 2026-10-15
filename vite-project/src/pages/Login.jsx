import { Link, useNavigate } from "react-router-dom";

import {
  Package,
  Mail,
  Phone,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

import { useState } from "react";

function Login() {
  const navigate = useNavigate();

  // =========================
  // STATE
  // =========================

  const [identifier, setIdentifier] = useState("");

  const [otp, setOtp] = useState("");

  const [generatedOtp, setGeneratedOtp] = useState("");

  const [step, setStep] = useState("login");

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);


  // =========================
  // EMAIL OR PHONE
  // =========================

  const isEmail = identifier.includes("@");


  // =========================
  // VALIDATE
  // =========================

  const validateIdentifier = () => {
    const value = identifier.trim();

    if (!value) {
      setError(
        "Please enter your email or mobile number."
      );

      return false;
    }

    if (value.includes("@")) {
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(value)) {
        setError(
          "Please enter a valid email address."
        );

        return false;
      }
    } else {
      const phone =
        value.replace(/\D/g, "");

      if (phone.length !== 10) {
        setError(
          "Please enter a valid 10-digit mobile number."
        );

        return false;
      }
    }

    return true;
  };


  // =========================
  // GENERATE OTP
  // =========================

  const generateOtp = async () => {
    setError("");
    setMessage("");

    if (!validateIdentifier()) {
      return;
    }

    setLoading(true);

    try {
      // Check MongoDB user
      const response = await fetch(
        "https://smartparcel-backend.onrender.com/api/users/check-user",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            identifier: identifier.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Account not found."
        );

        return;
      }

      // Generate development OTP
      const newOtp =
        Math.floor(
          100000 +
            Math.random() * 900000
        ).toString();

      setGeneratedOtp(newOtp);

      // Save OTP
      sessionStorage.setItem(
        "loginOtp",
        newOtp
      );

      sessionStorage.setItem(
        "loginIdentifier",
        identifier.trim()
      );

      sessionStorage.setItem(
        "loginUser",
        JSON.stringify(data.user)
      );

      console.log(
        "Development OTP:",
        newOtp
      );

      setMessage(
        "OTP generated successfully."
      );

      setStep("otp");

    } catch (error) {
      console.error(
        "Login connection error:",
        error
      );

      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );

    } finally {
      setLoading(false);
    }
  };


  // =========================
  // VERIFY OTP + GET JWT
  // =========================

  const verifyOtp = async () => {
    setError("");
    setMessage("");

    const savedOtp =
      sessionStorage.getItem(
        "loginOtp"
      );

    if (!otp.trim()) {
      setError(
        "Please enter the OTP."
      );

      return;
    }

    if (otp.trim() !== savedOtp) {
      setError(
        "Incorrect OTP. Please try again."
      );

      return;
    }

    setLoading(true);

    try {
      // ==================================
      // ASK BACKEND TO CREATE JWT
      // ==================================

      const response = await fetch(
        "https://smartparcel-backend.onrender.com/api/users/otp-login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            identifier:
              identifier.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Login failed."
        );

        return;
      }

      // ==================================
      // SAVE JWT
      // ==================================

      localStorage.setItem(
        "token",
        data.token
      );

      // ==================================
      // SAVE USER
      // ==================================

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // ==================================
      // LOGIN STATUS
      // ==================================

      localStorage.setItem(
        "isLoggedIn",
        "true"
      );

      // ==================================
      // REMOVE TEMP OTP
      // ==================================

      sessionStorage.removeItem(
        "loginOtp"
      );

      sessionStorage.removeItem(
        "loginIdentifier"
      );

      sessionStorage.removeItem(
        "loginUser"
      );

      setMessage(
        "Login successful!"
      );

      // ==================================
      // GO TO SHOP
      // ==================================

      setTimeout(() => {
        navigate("/shop");
      }, 500);

    } catch (error) {
      console.error(
        "OTP login error:",
        error
      );

      setError(
        "Unable to connect to the server."
      );

    } finally {
      setLoading(false);
    }
  };


  // =========================
  // RESEND OTP
  // =========================

  const resendOtp = () => {
    setOtp("");
    setError("");
    setMessage("");

    generateOtp();
  };


  // =========================
  // BACK
  // =========================

  const goBack = () => {
    setStep("login");
    setOtp("");
    setError("");
    setMessage("");
    setGeneratedOtp("");
  };


  // =========================
  // UI
  // =========================

  return (
    <div className="login-page">

      {/* HEADER */}

      <header className="login-header">

        <Link
          to="/"
          className="login-logo"
        >

          <div className="login-logo-icon">
            <Package size={21} />
          </div>

          <span>
            SmartParcel{" "}
            <b>Delivery</b>
          </span>

        </Link>

      </header>


      {/* CENTER */}

      <main className="login-container">

        <div className="login-card">

          {/* =========================
              LOGIN STEP
          ========================= */}

          {step === "login" && (
            <>

              <div className="login-icon">

                {isEmail ? (
                  <Mail size={25} />
                ) : (
                  <Phone size={25} />
                )}

              </div>


              <h1>
                Welcome Back
              </h1>


              <p className="login-subtitle">
                Login with your email
                or mobile number.
              </p>


              {/* INPUT */}

              <div className="login-field">

                <label>
                  Email or Mobile Number
                </label>

                <div className="login-input-wrapper">

                  {isEmail ? (
                    <Mail size={17} />
                  ) : (
                    <Phone size={17} />
                  )}

                  <input
                    type="text"
                    placeholder="Enter email or mobile number"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(
                        e.target.value
                      );

                      setError("");
                      setMessage("");
                    }}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter"
                      ) {
                        generateOtp();
                      }
                    }}
                  />

                </div>

              </div>


              {/* ERROR */}

              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}


              {/* MESSAGE */}

              {message && (
                <div className="login-message">
                  {message}
                </div>
              )}


              {/* BUTTON */}

              <button
                type="button"
                className="login-button"
                onClick={generateOtp}
                disabled={loading}
              >

                {loading
                  ? "Checking account..."
                  : "Generate OTP"}

              </button>


              {/* REGISTER */}

              <p className="login-register">

                Don't have an account?{" "}

                <Link to="/register">
                  Register
                </Link>

              </p>

            </>
          )}


          {/* =========================
              OTP STEP
          ========================= */}

          {step === "otp" && (
            <>

              <div className="login-icon">

                <ShieldCheck
                  size={27}
                />

              </div>


              <h1>
                Verify OTP
              </h1>


              <p className="login-subtitle">

                Enter the 6-digit OTP sent
                to{" "}

                <strong>
                  {identifier}
                </strong>

              </p>


              {/* OTP INPUT */}

              <div className="login-field">

                <label>
                  One-Time Password
                </label>

                <input
                  className="otp-input"
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => {

                    const value =
                      e.target.value.replace(
                        /\D/g,
                        ""
                      );

                    setOtp(value);
                    setError("");

                  }}
                  onKeyDown={(e) => {

                    if (
                      e.key === "Enter"
                    ) {
                      verifyOtp();
                    }

                  }}
                />

              </div>


              {/* DEVELOPMENT OTP */}

              <div className="dev-otp">

                <strong>
                  Development OTP:
                </strong>

                <span>
                  {generatedOtp}
                </span>

              </div>


              {/* ERROR */}

              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}


              {/* MESSAGE */}

              {message && (
                <div className="login-message">
                  {message}
                </div>
              )}


              {/* VERIFY */}

              <button
                type="button"
                className="login-button"
                onClick={verifyOtp}
                disabled={loading}
              >

                {loading
                  ? "Logging in..."
                  : "Verify & Login"}

              </button>


              {/* RESEND */}

              <button
                type="button"
                className="login-resend"
                onClick={resendOtp}
                disabled={loading}
              >

                Resend OTP

              </button>


              {/* BACK */}

              <button
                type="button"
                className="login-back"
                onClick={goBack}
              >

                <ArrowLeft size={15} />

                Change email / mobile

              </button>

            </>
          )}

        </div>

      </main>

    </div>
  );
}

export default Login;