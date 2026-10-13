import { Link } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Package,
  User,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const saved =
      JSON.parse(
        localStorage.getItem("wishlist") || "[]"
      );

    setWishlist(saved);
  }, []);

  const removeFromWishlist = (id) => {
    const updated = wishlist.filter(
      (product) => product.id !== id
    );

    setWishlist(updated);

    localStorage.setItem(
      "wishlist",
      JSON.stringify(updated)
    );
  };

  return (
    <div className="market-page">

      {/* ================= HEADER ================= */}

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
            SmartParcel <b>Delivery</b>
          </span>
        </Link>


        {/* RIGHT ACTIONS */}

        <div className="market-actions">

          <Link
            to="/wishlist"
            className="market-action"
          >
            <Heart
              size={20}
              fill="currentColor"
            />

            {wishlist.length > 0 && (
              <span className="market-badge">
                {wishlist.length}
              </span>
            )}
          </Link>


          <Link
            to="/cart"
            className="market-action"
          >
            <ShoppingCart size={20} />
          </Link>


          <Link
            to="/profile"
            className="market-profile"
          >
            <User size={18} />
          </Link>

        </div>

      </header>


      {/* ================= MAIN ================= */}

      <main className="market-container">

        {/* PAGE HEADING */}

        <div className="wishlist-heading">

          <h1>
            My Wishlist
          </h1>

          <p>
            Products you love
          </p>

        </div>


        {/* ================= EMPTY WISHLIST ================= */}

        {wishlist.length === 0 ? (

          <div className="empty-wishlist">

            <Heart size={55} />

            <h2>
              Your wishlist is empty
            </h2>

            <p>
              Save products you love by clicking
              the heart icon.
            </p>

            <Link
              to="/shop"
              className="wishlist-shop-button"
            >
              Continue Shopping
            </Link>

          </div>

        ) : (

          /* ================= PRODUCTS ================= */

          <div className="market-product-grid">

            {wishlist.map((product) => {

              const discount = Math.round(
                ((product.oldPrice -
                  product.price) /
                  product.oldPrice) *
                  100
              );

              return (

                <div
                  className="market-product-card"
                  key={product.id}
                >

                  {/* IMAGE */}

                  <div className="market-product-image">

                    <span className="market-discount">
                      {discount}% OFF
                    </span>


                    {/* REMOVE */}

                    <button
                      type="button"
                      className="market-wishlist active"
                      onClick={() =>
                        removeFromWishlist(
                          product.id
                        )
                      }
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={17} />
                    </button>


                    <img
                      src={product.image}
                      alt={product.name}
                    />

                  </div>


                  {/* INFORMATION */}

                  <div className="market-product-info">

                    <span className="market-category">
                      {product.category}
                    </span>


                    <h3>
                      {product.name}
                    </h3>


                    {/* PRICE */}

                    <div className="market-price">

                      <strong>
                        ₹{product.price.toLocaleString()}
                      </strong>

                      <del>
                        ₹{product.oldPrice.toLocaleString()}
                      </del>

                    </div>


                    {/* COLOUR */}

                    <div
                      style={{
                        marginTop: "7px",
                        color: "#888",
                        fontSize: "10px",
                      }}
                    >
                      Colour:{" "}

                      <strong
                        style={{
                          color: "#333",
                        }}
                      >
                        {product.color}
                      </strong>

                    </div>


                    {/* CART */}

                    <button
                      type="button"
                      className="market-add-cart"
                    >
                      Add to Cart
                    </button>

                  </div>

                </div>

              );
            })}

          </div>

        )}

      </main>

    </div>
  );
}

export default Wishlist;