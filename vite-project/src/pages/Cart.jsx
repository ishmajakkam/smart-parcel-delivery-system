import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  Heart,
  ShoppingCart,
  User,
  CalendarDays,
  Clock,
  Trash2,
  Minus,
  Plus,
} from "lucide-react";

import { useState } from "react";

function Cart() {
  const navigate = useNavigate();

  // =========================
  // CART
  // =========================

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("cart") || "[]"
      );
    } catch {
      return [];
    }
  });


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
  // TIME SLOTS
  // =========================

  const timeSlots = [
    "9:00 AM - 12:00 PM",
    "12:00 PM - 3:00 PM",
    "3:00 PM - 6:00 PM",
    "6:00 PM - 9:00 PM",
  ];


  // =========================
  // TOMORROW
  // =========================

  const getTomorrowDate = () => {
    const date = new Date();

    date.setDate(
      date.getDate() + 1
    );

    return date
      .toISOString()
      .split("T")[0];
  };


  // =========================
  // UPDATE CART
  // =========================

  const saveCart = (updatedCart) => {
    setCart(updatedCart);

    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );
  };


  // =========================
  // QUANTITY +
  // =========================

  const increaseQuantity = (id, color) => {
    const updated = cart.map((item) => {
      if (
        item.id === id &&
        item.color === color
      ) {
        return {
          ...item,
          quantity:
            Number(item.quantity || 1) + 1,
        };
      }

      return item;
    });

    saveCart(updated);
  };


  // =========================
  // QUANTITY -
  // =========================

  const decreaseQuantity = (id, color) => {
    const updated = cart
      .map((item) => {
        if (
          item.id === id &&
          item.color === color
        ) {
          return {
            ...item,
            quantity:
              Number(item.quantity || 1) - 1,
          };
        }

        return item;
      })
      .filter(
        (item) =>
          Number(item.quantity || 0) > 0
      );

    saveCart(updated);
  };


  // =========================
  // REMOVE
  // =========================

  const removeItem = (id, color) => {
    const updated = cart.filter(
      (item) =>
        !(
          item.id === id &&
          item.color === color
        )
    );

    saveCart(updated);
  };


  // =========================
  // DELIVERY DATE
  // =========================

  const updateDeliveryDate = (
    id,
    color,
    date
  ) => {
    const updated = cart.map((item) => {
      if (
        item.id === id &&
        item.color === color
      ) {
        return {
          ...item,
          deliveryDate: date,
        };
      }

      return item;
    });

    saveCart(updated);
  };


  // =========================
  // TIME SLOT
  // =========================

  const updateTimeSlot = (
    id,
    color,
    timeSlot
  ) => {
    const updated = cart.map((item) => {
      if (
        item.id === id &&
        item.color === color
      ) {
        return {
          ...item,
          timeSlot: timeSlot,
        };
      }

      return item;
    });

    saveCart(updated);
  };


  // =========================
  // TOTALS
  // =========================

  const subtotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  const deliveryFee =
    cart.length > 0 ? 99 : 0;

  const total =
    subtotal + deliveryFee;


  // =========================
  // CHECKOUT
  // =========================

  const handleCheckout = () => {
    if (cart.length === 0) {
      return;
    }


    // Make sure every product
    // has a delivery date

    const missingDate = cart.some(
      (item) =>
        !item.deliveryDate
    );


    if (missingDate) {
      alert(
        "Please select a delivery date for every product."
      );

      return;
    }


    // Make sure every product
    // has a time slot

    const missingTimeSlot = cart.some(
      (item) =>
        !item.timeSlot
    );


    if (missingTimeSlot) {
      alert(
        "Please select a delivery time slot for every product."
      );

      return;
    }


    navigate("/checkout");
  };


  // =========================
  // EMPTY CART
  // =========================

  if (cart.length === 0) {
    return (
      <div className="market-page">

        <CartHeader
          wishlistCount={wishlist.length}
          cartCount={0}
        />


        <main className="cart-empty">

          <ShoppingCart size={55} />

          <h1>
            Your cart is empty
          </h1>

          <p>
            Add some products to your
            cart to continue.
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


  return (
    <div className="market-page">


      {/* =========================
          HEADER
      ========================= */}

      <CartHeader
        wishlistCount={wishlist.length}
        cartCount={cart.reduce(
          (total, item) =>
            total +
            Number(item.quantity || 0),
          0
        )}
      />


      {/* =========================
          MAIN
      ========================= */}

      <main className="cart-container">


        {/* =========================
            LEFT
        ========================= */}

        <section className="cart-items">

          <div className="cart-heading">

            <h1>
              My Cart
            </h1>

            <span>
              {cart.reduce(
                (total, item) =>
                  total +
                  Number(
                    item.quantity || 0
                  ),
                0
              )}{" "}
              items
            </span>

          </div>


          {/* ITEMS */}

          {cart.map((item) => (

            <div
              className="cart-item"
              key={`${item.id}-${item.color || ""}`}
            >


              {/* IMAGE */}

              <div className="cart-product-image">

                <img
                  src={item.image}
                  alt={item.name}
                />

              </div>


              {/* DETAILS */}

              <div className="cart-product-details">


                {/* CATEGORY */}

                <span className="cart-category">

                  {item.category}

                </span>


                {/* NAME */}

                <h2>

                  {item.name}

                </h2>


                {/* COLOR */}

                {item.color && (

                  <p className="cart-color">

                    Colour:{" "}

                    <strong>
                      {item.color}
                    </strong>

                  </p>

                )}


                {/* PRICE */}

                <div className="cart-price">

                  ₹
                  {Number(
                    item.price || 0
                  ).toLocaleString()}

                </div>


                {/* QUANTITY */}

                <div className="quantity-control">

                  <button
                    type="button"
                    onClick={() =>
                      decreaseQuantity(
                        item.id,
                        item.color
                      )
                    }
                  >

                    <Minus size={16} />

                  </button>


                  <span>

                    {item.quantity}

                  </span>


                  <button
                    type="button"
                    onClick={() =>
                      increaseQuantity(
                        item.id,
                        item.color
                      )
                    }
                  >

                    <Plus size={16} />

                  </button>

                </div>


                {/* =========================
                    DELIVERY DATE
                ========================= */}

                <div className="delivery-section">

                  <div className="delivery-label">

                    <CalendarDays
                      size={17}
                    />

                    <strong>
                      Delivery Date
                    </strong>

                  </div>


                  <input
                    type="date"
                    className="delivery-date-input-cart"
                    min={getTomorrowDate()}
                    value={
                      item.deliveryDate || ""
                    }
                    onChange={(e) =>
                      updateDeliveryDate(
                        item.id,
                        item.color,
                        e.target.value
                      )
                    }
                  />


                  {!item.deliveryDate && (

                    <small className="delivery-error">

                      Please select a delivery
                      date

                    </small>

                  )}

                </div>


                {/* =========================
                    TIME SLOT
                ========================= */}

                <div className="delivery-section">

                  <div className="delivery-label">

                    <Clock
                      size={17}
                    />

                    <strong>
                      Time Slot
                    </strong>

                  </div>


                  <select
                    className="delivery-time-select"
                    value={
                      item.timeSlot || ""
                    }
                    onChange={(e) =>
                      updateTimeSlot(
                        item.id,
                        item.color,
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      Select a time slot
                    </option>

                    {timeSlots.map(
                      (slot) => (

                        <option
                          key={slot}
                          value={slot}
                        >

                          {slot}

                        </option>

                      )
                    )}

                  </select>


                  {!item.timeSlot && (

                    <small className="delivery-error">

                      Please select a delivery
                      time slot

                    </small>

                  )}

                </div>


              </div>


              {/* ITEM TOTAL + DELETE */}

              <div className="cart-item-right">

                <strong>

                  ₹
                  {(
                    Number(
                      item.price || 0
                    ) *
                    Number(
                      item.quantity || 0
                    )
                  ).toLocaleString()}

                </strong>


                <button
                  type="button"
                  className="cart-delete"
                  onClick={() =>
                    removeItem(
                      item.id,
                      item.color
                    )
                  }
                >

                  <Trash2 size={18} />

                </button>

              </div>

            </div>

          ))}

        </section>


        {/* =========================
            ORDER SUMMARY
        ========================= */}

        <aside className="cart-summary">

          <h2>
            Order Summary
          </h2>


          <div className="summary-row">

            <span>
              Subtotal
            </span>

            <strong>
              ₹
              {subtotal.toLocaleString()}
            </strong>

          </div>


          <div className="summary-row">

            <span>
              Delivery Fee
            </span>

            <strong>
              ₹
              {deliveryFee.toLocaleString()}
            </strong>

          </div>


          <div className="summary-divider" />


          <div className="summary-total">

            <span>
              Total
            </span>

            <strong>
              ₹
              {total.toLocaleString()}
            </strong>

          </div>


          {/* CHECKOUT */}

          <button
            type="button"
            className="checkout-button"
            onClick={handleCheckout}
          >

            Checkout

          </button>


          {/* CONTINUE SHOPPING */}

          <Link
            to="/shop"
            className="continue-shopping"
          >

            Continue Shopping

          </Link>

        </aside>

      </main>

    </div>
  );
}


/* =====================================================
   CART HEADER
===================================================== */

function CartHeader({
  wishlistCount,
  cartCount,
}) {
  return (
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

          <b>
            Delivery
          </b>

        </span>

      </Link>


      {/* SPACER */}

      <div
        className="market-search"
        style={{
          visibility: "hidden",
        }}
      />



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
              wishlistCount > 0
                ? "currentColor"
                : "none"
            }
          />


          {wishlistCount > 0 && (

            <span className="market-badge">

              {wishlistCount}

            </span>

          )}

        </Link>


        {/* CART */}

        <Link
          to="/cart"
          className="market-action"
        >

          <ShoppingCart size={20} />


          {cartCount > 0 && (

            <span className="market-badge">

              {cartCount}

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
  );
}


export default Cart;