import { Package, Truck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function DeliveryCard() {
  return (
    <div className="delivery-card">

      <div className="delivery-top">
        <div className="delivery-icon">
          <Package size={25} />
        </div>

        <div className="delivery-info">
          <small>TRACKING ID</small>
          <h3>SP20260817001</h3>
          <p>Hyderabad → Bengaluru</p>
        </div>

        <span className="status">In Transit</span>
      </div>

      <div className="route">

        <div className="route-item">
          <div className="point pickup"></div>

          <div>
            <small>Picked Up</small>
            <strong>Hyderabad</strong>
          </div>
        </div>

        <div className="route-line"></div>

        <div className="route-item">
          <div className="point destination"></div>

          <div>
            <small>Estimated Delivery</small>
            <strong>Bengaluru</strong>
          </div>
        </div>

      </div>

      <div className="delivery-footer">

        <div className="eta">
          <Truck size={20} />

          <div>
            <small>Estimated arrival</small>
            <strong>Today, 6:30 PM</strong>
          </div>
        </div>

        <Link to="/track" className="track-btn">
          Track Live
          <ArrowRight size={17} />
        </Link>

      </div>

    </div>
  );
}

export default DeliveryCard;