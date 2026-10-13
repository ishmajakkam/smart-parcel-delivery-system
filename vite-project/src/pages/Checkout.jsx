import { Link, useNavigate } from "react-router-dom";

import {
  Package,
  ShoppingCart,
  Heart,
  User,
  MapPin,
  CalendarDays,
  CheckCircle,
} from "lucide-react";

import {
  useState,
  useEffect,
} from "react";


function Checkout() {
  const navigate = useNavigate();


  // =====================================================
  // LOAD CART
  // =====================================================

  const [cart] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("cart") || "[]"
      );
    } catch {
      return [];
    }
  });


  // =====================================================
  // ADDRESS
  // =====================================================

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    house: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });


  // =====================================================
  // CUSTOMER CURRENT GPS
  // =====================================================

  const [customerLocation, setCustomerLocation] =
    useState(null);

  const [gpsStatus, setGpsStatus] =
    useState("Getting your location...");


  // =====================================================
  // LOADING
  // =====================================================

  const [placingOrder, setPlacingOrder] =
    useState(false);


  // =====================================================
  // GET CUSTOMER CURRENT GPS
  // =====================================================

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus(
        "GPS is not supported by this browser"
      );

      return;
    }


    setGpsStatus(
      "Requesting location permission..."
    );


    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;


        const location = {
          latitude,
          longitude,
        };


        console.log(
          "===================================="
        );

        console.log(
          "📍 CUSTOMER CURRENT GPS DETECTED"
        );

        console.log(
          "Latitude:",
          latitude
        );

        console.log(
          "Longitude:",
          longitude
        );

        console.log(
          "===================================="
        );


        setCustomerLocation(
          location
        );


        setGpsStatus(
          "Location detected"
        );
      },


      (error) => {
        console.error(
          "❌ Customer GPS error:",
          error
        );


        setGpsStatus(
          "Location permission denied"
        );
      },


      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );

  }, []);


  // =====================================================
  // CALCULATIONS
  // =====================================================

  const subtotal =
    cart.reduce(
      (total, item) =>
        total +
        Number(item.price) *
          Number(item.quantity),
      0
    );


  const deliveryFee =
    cart.length > 0
      ? 99
      : 0;


  const total =
    subtotal + deliveryFee;


  // =====================================================
  // ADDRESS CHANGE
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;


    setAddress(
      (current) => ({
        ...current,
        [name]: value,
      })
    );
  };


  // =====================================================
  // CHECK DELIVERY DATES
  // =====================================================

  const missingDeliveryDate =
    cart.some(
      (item) =>
        !item.deliveryDate
    );


  // =====================================================
  // PLACE ORDER
  // =====================================================

  const placeOrder = async () => {

    // ---------------------------------------------------
    // CART CHECK
    // ---------------------------------------------------

    if (cart.length === 0) {
      alert(
        "Your cart is empty."
      );

      return;
    }


    // ---------------------------------------------------
    // DELIVERY DATE CHECK
    // ---------------------------------------------------

    if (missingDeliveryDate) {
      alert(
        "Please select a delivery date for every product."
      );

      return;
    }


    // ---------------------------------------------------
    // ADDRESS CHECK
    // ---------------------------------------------------

    if (
      !address.name.trim() ||
      !address.phone.trim() ||
      !address.house.trim() ||
      !address.street.trim() ||
      !address.city.trim() ||
      !address.state.trim() ||
      !address.pincode.trim()
    ) {
      alert(
        "Please fill in all delivery address details."
      );

      return;
    }


    // ---------------------------------------------------
    // PINCODE CHECK
    // ---------------------------------------------------

    if (
      address.pincode.trim().length !== 6
    ) {
      alert(
        "Please enter a valid 6 digit pincode."
      );

      return;
    }


    // ---------------------------------------------------
    // GET JWT
    // ---------------------------------------------------

    const token =
      localStorage.getItem(
        "token"
      );


    if (!token) {
      alert(
        "Please login before placing an order."
      );

      navigate(
        "/login"
      );

      return;
    }


    setPlacingOrder(true);


    // ===================================================
    // CREATE ORDER DATA
    // ===================================================

    const orderData = {

      // -----------------------------------------------
      // PRODUCTS
      // -----------------------------------------------

      items:
        cart.map(
          (item) => ({
            productId:
              String(
                item.id
              ),

            name:
              item.name,

            price:
              Number(
                item.price
              ),

            quantity:
              Number(
                item.quantity
              ),

            image:
              item.image || "",

            color:
              item.color || "",

            category:
              item.category || "",

            deliveryDate:
              item.deliveryDate || "",
          })
        ),


      // -----------------------------------------------
      // PRICE
      // -----------------------------------------------

      subtotal:
        subtotal,

      deliveryFee:
        deliveryFee,

      total:
        total,


      // -----------------------------------------------
      // DELIVERY ADDRESS
      // -----------------------------------------------

      address: {
        name:
          address.name.trim(),

        phone:
          address.phone.trim(),

        house:
          address.house.trim(),

        street:
          address.street.trim(),

        city:
          address.city.trim(),

        state:
          address.state.trim(),

        pincode:
          address.pincode.trim(),
      },


      // -----------------------------------------------
      // CUSTOMER CURRENT GPS
      // -----------------------------------------------
      //
      // IMPORTANT:
      // This is NOT the delivery destination.
      //
      // It represents where the customer is
      // physically located when placing the order.
      //

      customerLocation:
        customerLocation || {
          latitude: null,
          longitude: null,
        },
    };


    // ===================================================
    // SHOW ORDER DATA
    // ===================================================

    console.log(
      "===================================="
    );

    console.log(
      "📦 ORDER DATA"
    );

    console.log(
      "Customer:",
      address.name
    );

    console.log(
      "Delivery Address:",
      address.house,
      address.street,
      address.city,
      address.state,
      address.pincode
    );

    console.log(
      "📍 Customer Current GPS:",
      customerLocation
    );

    console.log(
      "🏠 Delivery Location:",
      "Backend will calculate from address"
    );

    console.log(
      "===================================="
    );


    // ===================================================
    // SEND TO BACKEND
    // ===================================================

    try {

      const response =
        await fetch(
          "http://localhost:5000/api/orders",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                "Bearer " +
                token,
            },

            body:
              JSON.stringify(
                orderData
              ),
          }
        );


      const data =
        await response.json();


      // =================================================
      // BACKEND ERROR
      // =================================================

      if (!response.ok) {

        console.error(
          "Order API error:",
          data
        );


        // JWT expired
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


          alert(
            "Your login session has expired. Please login again."
          );


          navigate(
            "/login"
          );

          return;
        }


        alert(
          data.message ||
          "Could not place order."
        );

        return;
      }


      // =================================================
      // SAVE LATEST ORDER
      // =================================================

      localStorage.setItem(
        "lastOrder",
        JSON.stringify(
          data.order
        )
      );


      // =================================================
      // CLEAR CART
      // =================================================

      localStorage.removeItem(
        "cart"
      );


      // =================================================
      // SUCCESS
      // =================================================

      alert(
        "Order placed successfully!"
      );


      navigate(
        "/order-confirmation"
      );


    } catch (error) {

      console.error(
        "❌ Order connection error:",
        error
      );


      alert(
        "Unable to connect to the server. Please make sure the backend is running."
      );


    } finally {

      setPlacingOrder(
        false
      );

    }
  };


  // =====================================================
  // EMPTY CART
  // =====================================================

  if (cart.length === 0) {

    return (
      <div className="market-page">

        <header className="market-header">

          <Link
            to="/"
            className="market-logo"
          >

            <div className="market-logo-icon">

              <Package
                size={21}
              />

            </div>


            <span>
              SmartParcel{" "}
              <b>
                Delivery
              </b>
            </span>

          </Link>

        </header>


        <main className="checkout-empty">

          <ShoppingCart
            size={55}
          />


          <h1>
            Your cart is empty
          </h1>


          <p>
            Add products before checking out.
          </p>


          <Link
            to="/shop"
            className="cart-shop-button"
          >
            Continue Shopping
          </Link>

        </main>

      </div>
    );
  }


  // =====================================================
  // CHECKOUT PAGE
  // =====================================================

  return (

    <div className="market-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="market-header">

        <Link
          to="/"
          className="market-logo"
        >

          <div className="market-logo-icon">

            <Package
              size={21}
            />

          </div>


          <span>
            SmartParcel{" "}
            <b>
              Delivery
            </b>
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
            />

          </Link>


          {/* CART */}

          <Link
            to="/cart"
            className="market-action"
          >

            <ShoppingCart
              size={20}
            />


            <span
              className="market-badge"
            >

              {cart.reduce(
                (total, item) =>
                  total +
                  Number(
                    item.quantity
                  ),
                0
              )}

            </span>

          </Link>


          {/* PROFILE */}

          <Link
            to="/profile"
            className="market-profile"
          >

            <User
              size={18}
            />

          </Link>

        </div>

      </header>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="market-container">

        <div className="checkout-heading">

          <h1>
            Checkout
          </h1>


          <p>
            Confirm your delivery details
            before placing your order.
          </p>

        </div>


        <div className="checkout-layout">


          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div className="checkout-left">


            {/* =================================================
                DELIVERY ADDRESS
            ================================================= */}

            <div className="checkout-card">

              <div
                className="checkout-card-heading"
              >

                <MapPin
                  size={20}
                />


                <div>

                  <h2>
                    Delivery Address
                  </h2>


                  <p>
                    Where should we deliver
                    your order?
                  </p>

                </div>

              </div>


              <div
                className="checkout-form"
              >


                {/* NAME */}

                <div
                  className="checkout-field"
                >

                  <label>
                    Full Name
                  </label>


                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={
                      address.name
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>


                {/* PHONE */}

                <div
                  className="checkout-field"
                >

                  <label>
                    Phone Number
                  </label>


                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter 10 digit phone number"
                    value={
                      address.phone
                    }
                    maxLength="10"

                    onChange={(e) => {

                      const value =
                        e.target.value.replace(
                          /\D/g,
                          ""
                        );


                      setAddress(
                        (current) => ({
                          ...current,

                          phone:
                            value,
                        })
                      );

                    }}

                  />

                </div>


                {/* HOUSE */}

                <div
                  className="checkout-field full"
                >

                  <label>
                    House / Flat / Building
                  </label>


                  <input
                    type="text"
                    name="house"
                    placeholder="House number, flat number, etc."
                    value={
                      address.house
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>


                {/* STREET */}

                <div
                  className="checkout-field full"
                >

                  <label>
                    Street / Area
                  </label>


                  <input
                    type="text"
                    name="street"
                    placeholder="Street, locality or area"
                    value={
                      address.street
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>


                {/* CITY */}

                <div
                  className="checkout-field"
                >

                  <label>
                    City
                  </label>


                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={
                      address.city
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>


                {/* STATE */}

                <div
                  className="checkout-field"
                >

                  <label>
                    State
                  </label>


                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={
                      address.state
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>


                {/* PINCODE */}

                <div
                  className="checkout-field"
                >

                  <label>
                    Pincode
                  </label>


                  <input
                    type="text"
                    name="pincode"
                    placeholder="6 digit pincode"
                    value={
                      address.pincode
                    }
                    maxLength="6"

                    onChange={(e) => {

                      const value =
                        e.target.value.replace(
                          /\D/g,
                          ""
                        );


                      setAddress(
                        (current) => ({
                          ...current,

                          pincode:
                            value,
                        })
                      );

                    }}

                  />

                </div>


              </div>


              {/* =================================================
                  CUSTOMER CURRENT GPS
              ================================================= */}

              <div
                style={{
                  marginTop: "18px",
                  padding: "14px",
                  borderRadius: "8px",
                  background: "#f8f8f8",
                  border: "1px solid #eeeeee",
                  fontSize: "14px",
                }}
              >

                <div>

                  📍{" "}

                  <strong>
                    Customer Current Location:
                  </strong>{" "}

                  {gpsStatus}

                </div>


                {customerLocation && (

                  <div
                    style={{
                      marginTop: "7px",
                      fontSize: "12px",
                      lineHeight: "1.6",
                    }}
                  >

                    Latitude:{" "}

                    {customerLocation.latitude.toFixed(
                      6
                    )}

                    <br />

                    Longitude:{" "}

                    {customerLocation.longitude.toFixed(
                      6
                    )}

                  </div>

                )}


                {!customerLocation && (

                  <div
                    style={{
                      marginTop: "7px",
                      fontSize: "12px",
                    }}
                  >

                    Current device location
                    is unavailable.

                  </div>

                )}


                <div
                  style={{
                    marginTop: "10px",
                    fontSize: "12px",
                    color: "#666",
                  }}
                >

                  🏠 The delivery destination
                  will be calculated from the
                  address entered above.

                </div>

              </div>


            </div>


            {/* =================================================
                PRODUCTS
            ================================================= */}

            <div
              className="checkout-card"
            >

              <div
                className="checkout-card-heading"
              >

                <Package
                  size={20}
                />


                <div>

                  <h2>
                    Your Products
                  </h2>


                  <p>
                    Check your products and
                    delivery dates.
                  </p>

                </div>

              </div>


              <div
                className="checkout-products"
              >

                {cart.map(
                  (item, index) => (

                    <div
                      className="checkout-product"
                      key={`${item.id}-${item.color}-${index}`}
                    >


                      {/* IMAGE */}

                      <div
                        className="checkout-product-image"
                      >

                        <img
                          src={
                            item.image
                          }
                          alt={
                            item.name
                          }
                        />

                      </div>


                      {/* DETAILS */}

                      <div
                        className="checkout-product-details"
                      >

                        <span
                          className="market-category"
                        >
                          {item.category}
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


                        {/* DELIVERY DATE */}

                        <div
                          className="checkout-delivery-date"
                        >

                          <CalendarDays
                            size={15}
                          />


                          <span>
                            Delivery:
                          </span>


                          <strong>
                            {formatDate(
                              item.deliveryDate
                            )}
                          </strong>

                        </div>

                      </div>


                      {/* PRICE */}

                      <div
                        className="checkout-product-price"
                      >

                        ₹

                        {(
                          Number(
                            item.price
                          ) *
                          Number(
                            item.quantity
                          )
                        ).toLocaleString()}

                      </div>


                    </div>

                  )
                )}

              </div>

            </div>


          </div>


          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div
            className="checkout-summary"
          >

            <h2>
              Order Summary
            </h2>


            {/* PRODUCTS */}

            <div
              className="summary-row"
            >

              <span>
                Products
              </span>


              <strong>

                {cart.reduce(
                  (total, item) =>
                    total +
                    Number(
                      item.quantity
                    ),
                  0
                )}

              </strong>

            </div>


            {/* SUBTOTAL */}

            <div
              className="summary-row"
            >

              <span>
                Subtotal
              </span>


              <strong>

                ₹
                {subtotal.toLocaleString()}

              </strong>

            </div>


            {/* DELIVERY */}

            <div
              className="summary-row"
            >

              <span>
                Delivery Fee
              </span>


              <strong>
                ₹{deliveryFee}
              </strong>

            </div>


            <div
              className="summary-divider"
            />


            {/* TOTAL */}

            <div
              className="summary-total"
            >

              <span>
                Total
              </span>


              <strong>

                ₹
                {total.toLocaleString()}

              </strong>

            </div>


            {/* PLACE ORDER */}

            <button
              type="button"
              className="checkout-place-order"
              onClick={
                placeOrder
              }
              disabled={
                placingOrder
              }
            >

              <CheckCircle
                size={18}
              />


              {placingOrder
                ? "Placing Order..."
                : "Place Order"}

            </button>


            {/* BACK */}

            <Link
              to="/cart"
              className="checkout-back"
            >
              ← Back to Cart
            </Link>


          </div>


        </div>

      </main>

    </div>
  );
}


// =====================================================
// FORMAT DELIVERY DATE
// =====================================================

function formatDate(date) {

  if (!date) {
    return "Not selected";
  }


  const parts =
    date.split("-");


  if (
    parts.length !== 3
  ) {
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


export default Checkout;