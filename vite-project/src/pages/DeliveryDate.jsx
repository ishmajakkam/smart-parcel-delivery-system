import { Link, useNavigate } from "react-router-dom";
import { Package, CalendarDays } from "lucide-react";
import { useState } from "react";

function DeliveryDate() {
  const navigate = useNavigate();

  const [deliveryDate, setDeliveryDate] =
    useState("");

  const today = new Date();

  const minimumDate =
    today.toISOString().split("T")[0];


  const handleContinue = () => {
    if (!deliveryDate) {
      alert("Please select a delivery date.");
      return;
    }

    localStorage.setItem(
      "deliveryDate",
      deliveryDate
    );

    navigate("/checkout");
  };


  return (
    <div className="market-page">

      {/* HEADER */}

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


      {/* DELIVERY DATE */}

      <main className="delivery-date-page">

        <div className="delivery-date-card">

          <CalendarDays
            size={45}
            className="delivery-date-icon"
          />

          <h1>
            Choose Delivery Date
          </h1>

          <p>
            Select when you would like your
            order to be delivered.
          </p>


          <label>
            Delivery Date
          </label>


          <input
            type="date"
            min={minimumDate}
            value={deliveryDate}
            onChange={(e) =>
              setDeliveryDate(
                e.target.value
              )
            }
          />


          <button
            type="button"
            className="checkout-button"
            onClick={handleContinue}
          >
            Continue
          </button>


          <Link
            to="/cart"
            className="continue-shopping"
          >
            ← Back to Cart
          </Link>

        </div>

      </main>

    </div>
  );
}

export default DeliveryDate;