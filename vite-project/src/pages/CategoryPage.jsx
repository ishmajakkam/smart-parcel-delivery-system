import { Link, useParams } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Heart,
  Package,
  User,
  Star,
} from "lucide-react";
import { useState } from "react";

import { products } from "../data/products";

function CategoryPage() {
  const { category } = useParams();

  const [wishlist, setWishlist] = useState(() => {
    return JSON.parse(
      localStorage.getItem("wishlist") || "[]"
    );
  });

  const [cart, setCart] = useState(() => {
    return JSON.parse(
      localStorage.getItem("cart") || "[]"
    );
  });

  const [selectedColors, setSelectedColors] =
    useState({});


  // =========================
  // ADD TO CART
  // =========================

  const addToCart = (product) => {

    const isFashion =
      product.category.toLowerCase() === "fashion";

    if (
      isFashion &&
      !selectedColors[product.id]
    ) {
      alert("Please select a colour first.");
      return;
    }

    const selectedColor = isFashion
      ? selectedColors[product.id]
      : product.color || "Default";


    setCart((current) => {

      const existing = current.find(
        (item) =>
          item.id === product.id &&
          item.color === selectedColor
      );


      let updated;


      if (existing) {

        updated = current.map((item) =>
          item.id === product.id &&
          item.color === selectedColor
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
            color: selectedColor,
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

    alert("Product added to cart!");
  };


  // =========================
  // SELECT COLOUR
  // =========================

  const selectColor = (
    productId,
    color
  ) => {

    setSelectedColors((current) => ({
      ...current,
      [productId]: color,
    }));

  };


  // =========================
  // WISHLIST
  // =========================

  const toggleWishlist = (product) => {

    setWishlist((current) => {

      const alreadyLiked = current.some(
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
  // CATEGORY
  // =========================

  const categoryName =
    category.charAt(0).toUpperCase() +
    category.slice(1);


  const categoryProducts =
    products.filter(
      (product) =>
        product.category.toLowerCase() ===
        category.toLowerCase()
    );


  // =========================
  // PAGE
  // =========================

  return (
    <div className="market-page">


      {/* HEADER */}

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


        {/* SEARCH */}

        <div className="market-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search products..."
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


      {/* MAIN */}

      <main className="market-container">


        {/* CATEGORY HEADING */}

        <div
          style={{
            paddingTop: "35px",
            paddingBottom: "30px",
          }}
        >

          <Link
            to="/shop"
            style={{
              color: "#e91e63",
              fontSize: "13px",
              fontWeight: "700",
              textDecoration: "none",
            }}
          >
            ← Back to Categories
          </Link>


          <h1
            style={{
              marginTop: "20px",
              fontSize: "34px",
              fontWeight: "800",
            }}
          >
            {categoryName}
          </h1>


          <p
            style={{
              marginTop: "7px",
              color: "#888",
              fontSize: "13px",
            }}
          >
            Explore our{" "}
            {categoryName.toLowerCase()} collection
          </p>

        </div>


        {/* PRODUCTS */}

        {categoryProducts.length > 0 ? (

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
                  addToCart={addToCart}
                  selectedColor={
                    selectedColors[
                      product.id
                    ]
                  }
                  selectColor={
                    selectColor
                  }
                />

              )
            )}

          </div>

        ) : (

          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
            }}
          >

            <Package
              size={50}
              color="#e91e63"
            />

            <h2
              style={{
                marginTop: "15px",
              }}
            >
              Category not found
            </h2>


            <p
              style={{
                marginTop: "8px",
                color: "#888",
              }}
            >
              This category doesn't exist.
            </p>


            <Link
              to="/shop"
              style={{
                display: "inline-block",
                marginTop: "20px",
                color: "#e91e63",
                fontWeight: "700",
                textDecoration: "none",
              }}
            >
              Back to Shop
            </Link>

          </div>

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
  selectedColor,
  selectColor,
}) {

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


  const liked = wishlist.some(
    (item) =>
      item.id === product.id
  );


  const isFashion =
    product.category.toLowerCase() ===
    "fashion";


  const availableColors =
    isFashion
      ? product.colors &&
        product.colors.length > 0
        ? product.colors
        : product.color
        ? [product.color]
        : []
      : [];


  return (
    <div className="market-product-card">


      {/* PRODUCT IMAGE */}

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


      {/* PRODUCT DETAILS */}

      <div className="market-product-info">


        {/* CATEGORY */}

        <span className="market-category">
          {product.category}
        </span>


        {/* NAME */}

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
            ₹{product.price.toLocaleString()}
          </strong>


          {product.oldPrice >
            product.price && (

            <del>
              ₹
              {product.oldPrice.toLocaleString()}
            </del>

          )}

        </div>


        {/* =========================
            FASHION COLOURS
        ========================= */}

        {isFashion && (

          <div className="product-color-section">

            <div className="product-color-title">
              Select Colour:
            </div>


            {availableColors.length > 0 ? (

              <div className="product-color-options">

                {availableColors.map(
                  (color) => (

                    <button
                      key={color}
                      type="button"
                      className={
                        selectedColor ===
                        color
                          ? "color-option selected"
                          : "color-option"
                      }
                      onClick={() =>
                        selectColor(
                          product.id,
                          color
                        )
                      }
                    >

                      <span
                        className="color-dot"
                        style={{
                          backgroundColor:
                            getColorCode(
                              color
                            ),
                        }}
                      />

                      {color}

                    </button>

                  )
                )}

              </div>

            ) : (

              <p
                style={{
                  fontSize: "11px",
                  color: "#888",
                }}
              >
                No colours available
              </p>

            )}


            {selectedColor && (

              <div
                style={{
                  marginTop: "7px",
                  fontSize: "11px",
                  color: "#555",
                }}
              >
                Selected:{" "}
                <strong>
                  {selectedColor}
                </strong>
              </div>

            )}

          </div>

        )}


        {/* NON-FASHION COLOUR */}

        {!isFashion && (

          <div
            style={{
              marginTop: "8px",
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

        )}


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


/* =====================================================
   COLOUR HELPER
===================================================== */

function getColorCode(color) {

  const colors = {
    Black: "#111111",
    White: "#ffffff",
    Blue: "#2874f0",
    Navy: "#172554",
    Red: "#dc2626",
    Pink: "#ec4899",
    Green: "#16a34a",
    Yellow: "#eab308",
    Orange: "#f97316",
    Purple: "#9333ea",
    Brown: "#92400e",
    Grey: "#9ca3af",
    Gray: "#9ca3af",
    Beige: "#d6c6a5",
  };


  return (
    colors[color] ||
    "#cccccc"
  );
}


export default CategoryPage;