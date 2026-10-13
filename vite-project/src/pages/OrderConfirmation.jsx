import { Link } from "react-router-dom";
import {
  Package,
  CheckCircle,
  Truck,
  ShoppingBag,
} from "lucide-react";
import { useState } from "react";

function OrderConfirmation() {
  const [order] = useState(() => {
    try {
      const saved = localStorage.getItem("lastOrder");

      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });


  // =========================
  // NO ORDER
  // =========================

  if (!order) {
    return (
      <div className="market-page">

        <header className="market-header">

          <Link
            to="/"
            className="market-logo"
          >
            <div className="market-logo-icon">
              <Package size={21} />
            </div>

            <span>
              SmartParcel <b>Delivery</b>
            </span>
          </Link>

        </header>


        <main className="confirmation-empty">

          <Package size={55} />

          <h1>
            No Recent Order
          </h1>

          <p>
            We couldn't find a recent order.
          </p>

          <Link
            to="/shop"
            className="confirmation-button"
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

      <header className="market-header">

        <Link
          to="/"
          className="market-logo"
        >

          <div className="market-logo-icon">
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

      <main className="confirmation-container">


        {/* SUCCESS */}

        <div className="confirmation-success">

          <div className="confirmation-icon">

            <CheckCircle size={50} />

          </div>


          <h1>
            Order Placed Successfully!
          </h1>


          <p>
            Thank you for shopping with
            SmartParcel Delivery.
          </p>

        </div>


        {/* =========================
            ORDER CARD
        ========================= */}

        <div className="confirmation-card">


          {/* ORDER DETAILS */}

          <div className="confirmation-order-header">

            <div>

              <span>
                ORDER ID
              </span>

              <strong>
                #
                {String(order.id).slice(-8)}
              </strong>

            </div>


            <div>

              <span>
                STATUS
              </span>

              <strong className="confirmation-status">
                <CheckCircle size={14} />
                {order.status || "Order Placed"}
              </strong>

            </div>

          </div>


          {/* PRODUCTS */}

          <div className="confirmation-products">

            <h2>
              Your Order
            </h2>


            {order.items?.map(
              (item, index) => (

                <div
                  className="confirmation-product"
                  key={`${item.id}-${item.color}-${index}`}
                >

                  <div className="confirmation-product-image">

                    <img
                      src={item.image}
                      alt={item.name}
                    />

                  </div>


                  <div className="confirmation-product-info">

                    <span>
                      {item.category}
                    </span>

                    <h3>
                      {item.name}
                    </h3>

                    <p>
                      Colour:{" "}
                      <strong>
                        {item.color || "Default"}
                      </strong>
                    </p>

                    <p>
                      Quantity:{" "}
                      <strong>
                        {item.quantity}
                      </strong>
                    </p>

                    <div className="confirmation-delivery">

                      <Truck size={14} />

                      Delivery:

                      <strong>
                        {formatDeliveryDate(
                          item.deliveryDate
                        )}
                      </strong>

                    </div>

                  </div>


                  <strong className="confirmation-price">

                    ₹
                    {(
                      Number(item.price) *
                      Number(item.quantity)
                    ).toLocaleString()}

                  </strong>

                </div>

              )
            )}

          </div>


          {/* =========================
              SUMMARY
          ========================= */}

          <div className="confirmation-summary">

            <div>

              <span>
                Subtotal
              </span>

              <strong>
                ₹
                {Number(
                  order.subtotal || 0
                ).toLocaleString()}
              </strong>

            </div>


            <div>

              <span>
                Delivery Fee
              </span>

              <strong>
                ₹
                {Number(
                  order.deliveryFee || 0
                ).toLocaleString()}
              </strong>

            </div>


            <div className="confirmation-total">

              <span>
                Total
              </span>

              <strong>
                ₹
                {Number(
                  order.total || 0
                ).toLocaleString()}
              </strong>

            </div>

          </div>


          {/* =========================
              ADDRESS
          ========================= */}

          <div className="confirmation-address">

            <div className="confirmation-address-icon">

              <ShoppingBag size={19} />

            </div>


            <div>

              <h3>
                Delivery Address
              </h3>

              <p>
                {order.address?.name}
              </p>

              <p>
                {order.address?.house},{" "}
                {order.address?.street}
              </p>

              <p>
                {order.address?.city},{" "}
                {order.address?.state} -{" "}
                {order.address?.pincode}
              </p>

              <p>
                Phone:{" "}
                {order.address?.phone}
              </p>

            </div>

          </div>


          {/* =========================
              BUTTONS
          ========================= */}

          <div className="confirmation-actions">

            <Link
              to="/track"
              className="confirmation-track-button"
            >

              <Truck size={17} />

              Track Order

            </Link>


            <Link
              to="/orders"
              className="confirmation-orders-button"
            >

              <Package size={17} />

              My Orders

            </Link>

          </div>

        </div>

      </main>

    </div>
  );
}


/* =====================================================
   DELIVERY DATE
===================================================== */

function formatDeliveryDate(date) {

  if (!date) {
    return "Not selected";
  }


  const parts = date.split("-");


  if (parts.length !== 3) {
    return date;
  }


  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);


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


export default OrderConfirmation;