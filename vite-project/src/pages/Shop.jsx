import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Search,
  ShoppingCart,
  Heart,
  Package,
  User,
  Star,
} from "lucide-react";

import {
  products,
  categories,
} from "../data/products";


function Shop() {

  const navigate = useNavigate();

  const [search, setSearch] = useState("");


  // =========================
  // WISHLIST
  // =========================

  const [wishlist, setWishlist] = useState(() => {

    return JSON.parse(
      localStorage.getItem("wishlist") || "[]"
    );

  });


  // =========================
  // CART
  // =========================

  const [cart, setCart] = useState(() => {

    return JSON.parse(
      localStorage.getItem("cart") || "[]"
    );

  });


  // =========================
  // WISHLIST
  // =========================

  const toggleWishlist = (product) => {

    setWishlist((current) => {

      const alreadyLiked =
        current.some(
          (item) =>
            item.id === product.id
        );


      const updated = alreadyLiked
        ? current.filter(
            (item) =>
              item.id !== product.id
          )
        : [...current, product];


      localStorage.setItem(
        "wishlist",
        JSON.stringify(updated)
      );


      return updated;

    });

  };


  // =========================
  // ADD TO CART
  // =========================

  const addToCart = (product) => {

    setCart((current) => {

      const existing =
        current.find(
          (item) =>
            item.id === product.id
        );


      let updated;


      if (existing) {

        updated = current.map(
          (item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity:
                    item.quantity + 1,
                }
              : item
        );

      } else {

        updated = [
          ...current,
          {
            ...product,
            quantity: 1,
            deliveryDate: "",
          },
        ];

      }


      localStorage.setItem(
        "cart",
        JSON.stringify(updated)
      );


      return updated;

    });

  };


  // =========================
  // SEARCH
  // =========================

  const searchProducts =
    products.filter((product) =>
      product.name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );


  // =========================
  // PAGE
  // =========================

  return (

    <div className="market-page">


      {/* =========================
          HEADER
      ========================= */}

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


        {/* SEARCH */}

        <div className="market-search">

          <Search size={18} />


          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>


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
                wishlist.length > 0
                  ? "currentColor"
                  : "none"
              }
            />


            {wishlist.length > 0 && (

              <span className="market-badge">

                {wishlist.length}

              </span>

            )}

          </Link>


          {/* CART */}

          <Link
            to="/cart"
            className="market-action"
          >

            <ShoppingCart size={20} />


            {cart.length > 0 && (

              <span className="market-badge">

                {cart.reduce(
                  (total, item) =>
                    total + item.quantity,
                  0
                )}

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


      {/* =========================
          MAIN
      ========================= */}

      <main className="market-container">


        {/* HEADING */}

        <section className="market-heading">

          <h1>
            Categories
          </h1>


          <p>
            Explore our collections
          </p>

        </section>


        {/* =========================
            CATEGORY NAVIGATION
        ========================= */}

        <section className="shop-categories">


          <div className="categories-heading">

            <h2>
              Shop by Category
            </h2>


            <p>
              Find exactly what you're looking for
            </p>

          </div>


          <div className="category-container">

            {categories.map(
              (category) => (

                <button
                  key={category.slug}
                  type="button"
                  className="category"
                  onClick={() =>
                    navigate(
                      `/shop/${category.slug}`
                    )
                  }
                >

                  {category.name}

                </button>

              )
            )}

          </div>

        </section>


        {/* =========================
            SEARCH RESULTS
        ========================= */}

        {search ? (

          <section className="market-category-section">


            <div className="market-section-title">

              <h2>
                Search Results
              </h2>


              <span>
                {searchProducts.length} Products
              </span>

            </div>


            {searchProducts.length > 0 ? (

              <div className="market-product-grid">

                {searchProducts.map(
                  (product) => (

                    <ProductCard
                      key={product.id}
                      product={product}
                      wishlist={wishlist}
                      toggleWishlist={
                        toggleWishlist
                      }
                      addToCart={
                        addToCart
                      }
                    />

                  )
                )}

              </div>

            ) : (

              <div
                style={{
                  textAlign: "center",
                  padding: "70px 20px",
                }}
              >

                <Package
                  size={50}
                  color="#e91e63"
                />


                <h2>
                  No products found
                </h2>

              </div>

            )}

          </section>

        ) : (

          /* =========================
             ALL CATEGORIES
          ========================= */

          categories.map(
            (category) => {

              const categoryProducts =
                products.filter(
                  (product) =>
                    product.category.toLowerCase() ===
                    category.name.toLowerCase()
                );


              return (

                <section
                  className="market-category-section"
                  key={category.slug}
                >


                  <div className="market-section-title">

                    <h2>
                      {category.name}
                    </h2>


                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/shop/${category.slug}`
                        )
                      }
                      style={{
                        border: "none",
                        background:
                          "transparent",
                        color:
                          "#e91e63",
                        fontWeight:
                          "700",
                        cursor:
                          "pointer",
                      }}
                    >

                      View All →

                    </button>

                  </div>


                  <div className="market-product-grid">

                    {categoryProducts.map(
                      (product) => (

                        <ProductCard
                          key={product.id}
                          product={product}
                          wishlist={wishlist}
                          toggleWishlist={
                            toggleWishlist
                          }
                          addToCart={
                            addToCart
                          }
                        />

                      )
                    )}

                  </div>

                </section>

              );

            }

          )

        )}

      </main>

    </div>

  );
}


/* =====================================================
   PRODUCT CARD
===================================================== */

function ProductCard({
  product,
  wishlist,
  toggleWishlist,
  addToCart,
}) {


  // =========================
  // DISCOUNT
  // =========================

  const discount =
    product.oldPrice > product.price
      ? Math.round(
          (
            (product.oldPrice -
              product.price) /
            product.oldPrice
          ) * 100
        )
      : 0;


  // =========================
  // WISHLIST
  // =========================

  const liked =
    wishlist.some(
      (item) =>
        item.id === product.id
    );


  return (

    <div className="market-product-card">


      {/* =========================
          IMAGE
      ========================= */}

      <div className="market-product-image">


        {discount > 0 && (

          <span className="market-discount">

            {discount}% OFF

          </span>

        )}


        {/* WISHLIST */}

        <button
          type="button"
          className={
            liked
              ? "market-wishlist active"
              : "market-wishlist"
          }
          onClick={() =>
            toggleWishlist(product)
          }
          aria-label={
            liked
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
        >

          <Heart
            size={18}
            fill={
              liked
                ? "currentColor"
                : "none"
            }
          />

        </button>


        {/* IMAGE */}

        <img
          src={product.image}
          alt={product.name}
        />

      </div>


      {/* =========================
          DETAILS
      ========================= */}

      <div className="market-product-info">


        <span className="market-category">

          {product.category}

        </span>


        <h3>

          {product.name}

        </h3>


        {/* RATING */}

        <div className="market-rating">

          <span>

            <Star
              size={12}
              fill="currentColor"
            />

            {product.rating}

          </span>


          <small>

            ({product.reviews})

          </small>

        </div>


        {/* PRICE */}

        <div className="market-price">

          <strong>

            ₹
            {product.price.toLocaleString()}

          </strong>


          {product.oldPrice >
            product.price && (

            <del>

              ₹
              {product.oldPrice.toLocaleString()}

            </del>

          )}

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

            {product.color ||
              "Default"}

          </strong>

        </div>


        {/* ADD TO CART */}

        <button
          type="button"
          className="market-add-cart"
          onClick={() =>
            addToCart(product)
          }
        >

          Add to Cart

        </button>

      </div>

    </div>

  );
}


export default Shop;