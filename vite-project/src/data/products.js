const products = [
  // =========================
  // FASHION
  // =========================

  {
    id: 1,
    name: "Premium Cotton Dress",
    category: "Fashion",
    price: 1999,
    oldPrice: 2999,
    rating: 4.7,
    reviews: 213,
    color: "Pink",

    colors: [
      "Pink",
      "Black",
      "Blue",
      "White",
    ],

    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80",
  },

  {
    id: 2,
    name: "Classic Casual Shirt",
    category: "Fashion",
    price: 1499,
    oldPrice: 2199,
    rating: 4.6,
    reviews: 184,
    color: "White",

    colors: [
      "White",
      "Black",
      "Blue",
      "Beige",
    ],

    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80",
  },

  {
    id: 3,
    name: "Slim Fit Jeans",
    category: "Fashion",
    price: 1799,
    oldPrice: 2499,
    rating: 4.5,
    reviews: 167,
    color: "Blue",

    colors: [
      "Blue",
      "Black",
      "Grey",
    ],

    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80",
  },

  {
    id: 4,
    name: "Oversized Hoodie",
    category: "Fashion",
    price: 1899,
    oldPrice: 2799,
    rating: 4.8,
    reviews: 298,
    color: "Black",

    colors: [
      "Black",
      "White",
      "Grey",
      "Pink",
      "Blue",
    ],

    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80",
  },

  {
    id: 5,
    name: "Linen Casual Shirt",
    category: "Fashion",
    price: 1599,
    oldPrice: 2299,
    rating: 4.6,
    reviews: 142,
    color: "Beige",

    colors: [
      "Beige",
      "White",
      "Blue",
      "Brown",
    ],

    image:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80",
  },

  {
    id: 6,
    name: "Women's Casual Top",
    category: "Fashion",
    price: 999,
    oldPrice: 1599,
    rating: 4.5,
    reviews: 121,
    color: "Pink",

    colors: [
      "Pink",
      "White",
      "Black",
      "Purple",
    ],

    image:
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=600&q=80",
  },


  // =========================
  // ELECTRONICS
  // =========================

  {
    id: 101,
    name: "Wireless Headphones",
    category: "Electronics",
    price: 2899,
    oldPrice: 4999,
    rating: 4.7,
    reviews: 532,
    color: "Black",

    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
  },

  {
    id: 102,
    name: "Smart Watch",
    category: "Electronics",
    price: 3499,
    oldPrice: 5999,
    rating: 4.6,
    reviews: 421,
    color: "Black",

    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
  },

  {
    id: 103,
    name: "Bluetooth Speaker",
    category: "Electronics",
    price: 1999,
    oldPrice: 3299,
    rating: 4.5,
    reviews: 286,
    color: "Black",

    image:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80",
  },

  {
    id: 104,
    name: "Wireless Keyboard",
    category: "Electronics",
    price: 1599,
    oldPrice: 2499,
    rating: 4.4,
    reviews: 198,
    color: "White",

    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
  },

  {
    id: 105,
    name: "Gaming Mouse",
    category: "Electronics",
    price: 1299,
    oldPrice: 1999,
    rating: 4.6,
    reviews: 245,
    color: "Black",

    image:
      "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=600&q=80",
  },


  // =========================
  // BEAUTY
  // =========================

  {
    id: 201,
    name: "Hydrating Face Serum",
    category: "Beauty",
    price: 799,
    oldPrice: 1199,
    rating: 4.7,
    reviews: 312,
    color: "Clear",

    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80",
  },

  {
    id: 202,
    name: "Matte Lipstick",
    category: "Beauty",
    price: 599,
    oldPrice: 899,
    rating: 4.5,
    reviews: 267,
    color: "Red",

    image:
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80",
  },

  {
    id: 203,
    name: "Face Moisturizer",
    category: "Beauty",
    price: 699,
    oldPrice: 999,
    rating: 4.6,
    reviews: 198,
    color: "White",

    image:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=600&q=80",
  },

  {
    id: 204,
    name: "Perfume",
    category: "Beauty",
    price: 1499,
    oldPrice: 2199,
    rating: 4.7,
    reviews: 351,
    color: "Gold",

    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80",
  },


  // =========================
  // HOME
  // =========================

  {
    id: 301,
    name: "Decorative Table Lamp",
    category: "Home",
    price: 1299,
    oldPrice: 1999,
    rating: 4.5,
    reviews: 156,
    color: "White",

    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
  },

  {
    id: 302,
    name: "Modern Wall Clock",
    category: "Home",
    price: 899,
    oldPrice: 1399,
    rating: 4.4,
    reviews: 124,
    color: "Black",

    image:
      "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=600&q=80",
  },

  {
    id: 303,
    name: "Ceramic Flower Vase",
    category: "Home",
    price: 699,
    oldPrice: 999,
    rating: 4.6,
    reviews: 178,
    color: "White",

    image:
      "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=600&q=80",
  },


  // =========================
  // ACCESSORIES
  // =========================

  {
    id: 401,
    name: "Classic Leather Wallet",
    category: "Accessories",
    price: 899,
    oldPrice: 1399,
    rating: 4.6,
    reviews: 231,
    color: "Brown",

    image:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80",
  },

  {
    id: 402,
    name: "Classic Sunglasses",
    category: "Accessories",
    price: 1199,
    oldPrice: 1799,
    rating: 4.5,
    reviews: 194,
    color: "Black",

    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80",
  },

  {
    id: 403,
    name: "Leather Handbag",
    category: "Accessories",
    price: 2299,
    oldPrice: 3499,
    rating: 4.7,
    reviews: 287,
    color: "Brown",

    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
  },

  {
    id: 404,
    name: "Minimalist Backpack",
    category: "Accessories",
    price: 1799,
    oldPrice: 2699,
    rating: 4.6,
    reviews: 213,
    color: "Black",

    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
  },
];


// =========================
// CATEGORIES
// =========================

const categories = [
  {
    name: "Fashion",
    slug: "fashion",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80",
  },

  {
    name: "Electronics",
    slug: "electronics",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80",
  },

  {
    name: "Beauty",
    slug: "beauty",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80",
  },

  {
    name: "Home",
    slug: "home",
    image:
      "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=600&q=80",
  },

  {
    name: "Accessories",
    slug: "accessories",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80",
  },
];


export {
  products,
  categories,
};

export default products;