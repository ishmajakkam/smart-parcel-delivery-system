import { Search, User, Package } from "lucide-react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="navbar">

      {/* LOGO */}
      <Link to="/" className="logo">

        <div className="logo-icon">
          <Package size={21} />
        </div>

        <span>
          Smart<span>Parcel</span>
        </span>

      </Link>


      {/* DESKTOP MENU */}
      <nav className="desktop-nav">

        <Link to="/">
          Home
        </Link>

        <Link to="/book">
          Book Parcel
        </Link>

        <Link to="/track">
          Track
        </Link>

        <Link to="/orders">
          Orders
        </Link>

      </nav>


      {/* RIGHT SIDE */}
      <div className="nav-actions">

        <button className="icon-btn">
          <Search size={20} />
        </button>

        <Link to="/profile" className="profile-btn">
          <User size={19} />
          <span>Profile</span>
        </Link>

      </div>

    </header>
  );
}

export default Navbar;