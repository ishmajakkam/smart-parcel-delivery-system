import { Link } from "react-router-dom";
import { Package } from "lucide-react";

function Home() {
  return (
    <div className="simple-home">

      <div className="simple-home-content">

        {/* LOGO ICON */}

        <div className="simple-logo-icon">
          <Package size={42} />
        </div>


        {/* BRAND NAME */}

        <h1>
          SmartParcel Delivery
        </h1>


        {/* LOGIN / REGISTER */}

        <div className="simple-auth">

          <Link
            to="/login"
            className="simple-login"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="simple-register"
          >
            Register
          </Link>

        </div>


        {/* TAGLINE */}

        <p className="simple-tagline">
          Everything You Love, Delivered.
        </p>

      </div>

    </div>
  );
}

export default Home;