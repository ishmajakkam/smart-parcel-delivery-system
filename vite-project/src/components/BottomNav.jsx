import {
  Home,
  Package,
  MapPin,
  ClipboardList,
  User,
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";

function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav">

      <Link
        to="/"
        className={location.pathname === "/" ? "active" : ""}
      >
        <Home size={20} />
        <span>Home</span>
      </Link>

      <Link
        to="/book"
        className={location.pathname === "/book" ? "active" : ""}
      >
        <Package size={20} />
        <span>Book</span>
      </Link>

      <Link
        to="/track"
        className={location.pathname === "/track" ? "active" : ""}
      >
        <MapPin size={20} />
        <span>Track</span>
      </Link>

      <Link
        to="/orders"
        className={location.pathname === "/orders" ? "active" : ""}
      >
        <ClipboardList size={20} />
        <span>Orders</span>
      </Link>

      <Link
        to="/profile"
        className={location.pathname === "/profile" ? "active" : ""}
      >
        <User size={20} />
        <span>Profile</span>
      </Link>

    </nav>
  );
}

export default BottomNav;