"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { ChevronRight, ShoppingCart, Star, Plus, Minus } from "lucide-react";

export function ProductRecommendations() {
  const products = [
    { title: "Baby Organic Moisturizing Lotion", qty: "200ml", price: "₹499", oldPrice: "₹599", discount: "16% OFF", img: "/images/product_bottle.png", rating: 4.8, reviews: 124 },
    { title: "Premium Soft Diapers", qty: "(M, 54 pcs)", price: "₹999", oldPrice: "₹1,299", discount: "23% OFF", img: "/images/meal_food.png", rating: 4.9, reviews: 312 },
    { title: "Vitamin D3 Drops", qty: "(15ml)", price: "₹299", oldPrice: "₹349", discount: "14% OFF", img: "/images/product_bottle.png", rating: 4.7, reviews: 89 },
    { title: "Baby Sipper Cup", qty: "(6m+)", price: "₹399", oldPrice: "₹499", discount: "20% OFF", img: "/images/product_bottle.png", rating: 4.5, reviews: 56 },
    { title: "Baby Care Gift Set", qty: "Essentials", price: "₹1,199", oldPrice: "₹1,499", discount: "20% OFF", img: "/images/meal_food.png", rating: 5.0, reviews: 42 },
  ];

  const [cartItems, setCartItems] = useState<{ [key: number]: number }>({});

  const handleAddToCart = (index: number) => {
    setCartItems(prev => ({ ...prev, [index]: 1 }));
  };

  const handleIncrement = (index: number) => {
    setCartItems(prev => ({ ...prev, [index]: (prev[index] || 0) + 1 }));
  };

  const handleDecrement = (index: number) => {
    setCartItems(prev => {
      const newQty = (prev[index] || 0) - 1;
      if (newQty <= 0) {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      }
      return { ...prev, [index]: newQty };
    });
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] } }
  };

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8 gap-2">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-black leading-tight">Recommended for You</h2>
          <p className="text-sm text-gray-500 mt-2 hidden md:block font-light">Handpicked essentials for your baby's current stage.</p>
        </div>
        <Link href="/shop" className="text-[11px] md:text-sm font-bold md:font-medium text-[var(--color-primary)] flex items-center gap-1 group shrink-0 whitespace-nowrap">
          <span className="relative pb-0.5">
            View All
            <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[var(--color-primary)] origin-left scale-x-0 group-hover:scale-x-100 group-active:scale-x-0 transition-transform duration-300 ease-out rounded-full"></span>
          </span>
          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Product Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="flex overflow-x-auto items-stretch snap-x snap-mandatory gap-4 pb-4 px-4 -mx-4 md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-3 xl:grid-cols-5 md:gap-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {products.map((product, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className="w-[60vw] min-w-[60vw] snap-center sm:w-full sm:min-w-full md:w-auto md:min-w-0 shrink-0 bg-white rounded-lg border border-gray-200 flex flex-col group cursor-pointer overflow-hidden hover:border-[var(--color-primary)] transition-colors duration-300"
          >
            {/* Image Container - Fill & Soft Zoom */}
            <div className="w-full h-48 md:h-40 relative bg-[#F8FAFC] border-b border-gray-100 overflow-hidden">
              <Image src={product.img} alt={product.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col p-3 md:p-4">
              {/* Title & Qty */}
              <div className="min-h-[2.5rem] mb-0.5">
                <h4 className="text-sm font-bold text-black leading-tight line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">{product.title}</h4>
              </div>
              <div className="flex items-center gap-1 mb-2 mt-1">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, starIdx) => (
                    <Star
                      key={starIdx}
                      className={`w-2.5 h-2.5 md:w-3 md:h-3 ${starIdx < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] md:text-xs font-bold text-gray-700 ml-0.5">{product.rating}</span>
                <span className="text-[9px] md:text-[10px] text-gray-400">({product.reviews})</span>
              </div>

              {/* Price & Action */}
              <div className="mt-auto flex flex-col gap-2.5 pt-1">
                <div className="flex items-center flex-wrap gap-1.5 md:gap-2 mb-1">
                  <p className="text-sm md:text-base font-bold text-[#122B54] tracking-tight">{product.price}</p>
                  <p className="text-sm md:text-base font-medium text-gray-400 line-through">{product.oldPrice}</p>
                  {product.discount && (
                    <div className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md text-xs md:text-sm font-bold tracking-wide">
                      {product.discount}
                    </div>
                  )}
                </div>

                {cartItems[i] ? (
                  <div className="w-full bg-[var(--color-primary)] text-white text-[11px] md:text-xs font-semibold py-1.5 md:py-2 rounded-lg shadow-sm flex items-center justify-between px-2 transition-all duration-300">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDecrement(i); }}
                      className="p-0.5 bg-white text-[var(--color-primary)] rounded-full shadow-sm active:scale-95 transition-all hover:bg-gray-50"
                    >
                      <Minus className="w-3 h-3 md:w-4 md:h-4" strokeWidth={3} />
                    </button>
                    <span className="tracking-wide font-bold">{cartItems[i]} item{cartItems[i] > 1 ? 's' : ''} added</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleIncrement(i); }}
                      className="p-0.5 bg-white text-[var(--color-primary)] rounded-full shadow-sm active:scale-95 transition-all hover:bg-gray-50"
                    >
                      <Plus className="w-3 h-3 md:w-4 md:h-4" strokeWidth={3} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAddToCart(i); }}
                    className="w-full bg-[var(--color-primary)] text-white text-[11px] md:text-xs font-bold py-2 rounded-lg hover:bg-[#527d89] hover:shadow-md transition-all duration-300 flex items-center justify-center gap-1.5 group/btn shadow-sm"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
