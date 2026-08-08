"use client";

import { Header } from "@/components/layout/Header/Header";

import { Footer } from "@/components/layout/Footer/Footer";
import { ShoppingCart, Filter, Search, HeartPulse, Plus, Apple, Droplets, Baby, ShieldCheck, Pill, X, Check, ArrowLeft, Star, Minus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProducts, Product } from "@/lib/api/productsApi";

export default function ShopPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        const fetchedProducts = response.data || response;
        if (Array.isArray(fetchedProducts)) {
          // Map backend structure to frontend structure if necessary, or use directly
          const mapped = fetchedProducts.map((p: Product) => ({
            id: p._id,
            name: p.name,
            oldPrice: p.discountedPrice && p.discountedPrice < p.price ? `₹${p.price}` : "",
            price: `₹${p.discountedPrice || p.price}`,
            discount: p.discountedPrice && p.discountedPrice < p.price ? `${Math.round(((p.price - p.discountedPrice) / p.price) * 100)}% OFF` : "",
            tag: p.isFeatured ? "Featured" : "",
            img: p.imageUrl || "/images/product_bottle.png",
            category: p.category || "General",
            ageGroup: p.ageGroup || "All Ages",
            brand: p.brand || "",
            stockQuantity: p.stockQuantity || 0,
            rating: 4.5, // Dummy rating as per requirement
            reviews: Math.floor(Math.random() * 200) + 10,
          }));
          setProducts(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = ["All Products", "Nutrition", "Skincare", "Feeding", "Supplements"];
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [cartItems, setCartItems] = useState<{ [key: string]: number }>({});
  
  const handleAddToCart = (id: string) => {
    setCartItems(prev => ({ ...prev, [id]: 1 }));
  };

  const handleIncrement = (id: string) => {
    setCartItems(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleDecrement = (id: string) => {
    setCartItems(prev => {
      const newQty = (prev[id] || 0) - 1;
      if (newQty <= 0) {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      }
      return { ...prev, [id]: newQty };
    });
  };

  // Filter States
  const [sortBy, setSortBy] = useState("Popularity");
  const [ageGroup, setAgeGroup] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<string[]>([]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isFilterOpen]);

  // Apply Filters
  let filteredProducts = activeCategory === "All Products" 
    ? [...products] 
    : products.filter(p => p.category === activeCategory);
    
  if (ageGroup) {
    filteredProducts = filteredProducts.filter(p => p.ageGroup === ageGroup);
  }
  
  if (priceRange) {
    filteredProducts = filteredProducts.filter(p => {
      const pVal = parseInt(p.price.replace('₹', ''));
      if (priceRange === "Under ₹500") return pVal < 500;
      if (priceRange === "₹500 - ₹1000") return pVal >= 500 && pVal <= 1000;
      if (priceRange === "Over ₹1000") return pVal > 1000;
      return true;
    });
  }
  
  if (preferences.length > 0) {
    filteredProducts = filteredProducts.filter(p => 
      preferences.every(pref => p.preferences.includes(pref))
    );
  }
  
  if (sortBy === "Price: Low to High") {
    filteredProducts.sort((a, b) => parseInt(a.price.replace('₹', '')) - parseInt(b.price.replace('₹', '')));
  } else if (sortBy === "Price: High to Low") {
    filteredProducts.sort((a, b) => parseInt(b.price.replace('₹', '')) - parseInt(a.price.replace('₹', '')));
  } else if (sortBy === "Newest Arrivals") {
    filteredProducts = filteredProducts.filter(p => p.tag === "New").concat(filteredProducts.filter(p => p.tag !== "New"));
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const filterContent = (
    <>
      {/* Modal Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
          <Filter className="w-5 h-5 text-[var(--color-primary)]" />
          Filter & Sort
        </h2>
        <button 
          onClick={() => setIsFilterOpen(false)}
          className="p-2 rounded-full bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Filters */}
      <div className="flex-1 overflow-y-auto p-5 space-y-8 no-scrollbar">
        
        {/* Sort By */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3">Sort By</h3>
          <div className="flex flex-col gap-2">
            {["Popularity", "Price: Low to High", "Price: High to Low", "Newest Arrivals"].map((sort, i) => (
              <label 
                key={i} 
                onClick={() => setSortBy(sort)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-100"
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${sortBy === sort ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' : 'border-gray-300'}`}>
                  {sortBy === sort && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <span className={`text-sm font-semibold ${sortBy === sort ? 'text-gray-900' : 'text-gray-600'}`}>{sort}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Age Group */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3">Age Group</h3>
          <div className="flex flex-wrap gap-2">
            {["0-6 months", "6-12 months", "1-2 years", "2+ years"].map((age, i) => (
              <button 
                key={i} 
                onClick={() => setAgeGroup(age === ageGroup ? null : age)}
                className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${ageGroup === age ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)]' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                {age}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3">Price Range</h3>
          <div className="flex flex-wrap gap-2">
            {["Under ₹500", "₹500 - ₹1000", "Over ₹1000"].map((price, i) => (
              <button 
                key={i} 
                onClick={() => setPriceRange(price === priceRange ? null : price)}
                className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${priceRange === price ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)]' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                {price}
              </button>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3">Dietary & Preferences</h3>
          <div className="flex flex-col gap-2">
            {["Organic Certified", "No Added Sugar", "Dairy-Free", "Hypoallergenic"].map((pref, i) => {
              const isSelected = preferences.includes(pref);
              return (
                <label 
                  key={i} 
                  onClick={() => {
                    if (isSelected) setPreferences(preferences.filter(p => p !== pref));
                    else setPreferences([...preferences, pref]);
                  }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isSelected ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'bg-white border-gray-300 group-hover:border-gray-400'}`}>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className={`text-sm font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>{pref}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-5 border-t border-gray-100 bg-white grid grid-cols-2 gap-3">
        <button 
          onClick={() => {
            setSortBy("Popularity");
            setAgeGroup(null);
            setPriceRange(null);
            setPreferences([]);
          }}
          className="py-3 rounded-xl font-bold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          Clear All
        </button>
        <button 
          onClick={() => setIsFilterOpen(false)}
          className="py-3 rounded-xl font-bold text-sm text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] shadow-md shadow-[var(--color-primary)]/20 transition-all active:scale-95"
        >
          Apply Filters
        </button>
      </div>
    </>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
          <p className="text-gray-500 font-semibold animate-pulse">Loading amazing products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans">
      <Header />

      {/* Mobile Back Header */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 sticky top-0 z-40 bg-[var(--color-background)]/90 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-90 transition-all">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 ml-2">Shop</h1>
        </div>

        {/* Mobile Cart Button */}
        <button onClick={() => router.push('/shop/cart')} className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-gray-200 text-[#122B54] active:scale-95 transition-all">
          <ShoppingCart className="w-5 h-5" />
        </button>
      </div>

      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 pb-24 md:py-10 space-y-10">

        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-black">MONCRADEL Shop</h1>
              <p className="text-sm font-medium text-gray-500 mt-1">Premium nutrition and essentials for your baby.</p>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-start gap-6"
        >

          <div className="flex items-center gap-3">
            <div className="relative flex-1 lg:w-64">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 h-11 bg-white border border-gray-200 rounded-full text-sm font-medium outline-none focus:border-[var(--color-primary)] transition-colors w-full"
              />
            </div>
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="bg-white border border-gray-200 w-11 h-11 rounded-full text-gray-600 hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/30 transition-colors flex items-center justify-center flex-shrink-0"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Product Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          key={activeCategory} // Forces re-render animation on category change
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
        >
          <AnimatePresence>
            {filteredProducts.map((product) => (
            <motion.div 
              key={product.id} 
              variants={itemVariants}
              onClick={() => router.push(`/shop/${product.id}`)}
              className="bg-white rounded-lg border border-gray-200 flex flex-col group cursor-pointer overflow-hidden hover:border-[var(--color-primary)] transition-colors duration-300 relative"
            >
              {product.tag && (
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[9px] font-bold text-[var(--color-primary)] shadow-sm z-10 uppercase tracking-wide">
                  {product.tag}
                </span>
              )}
              
              {/* Image Container - Fill & Soft Zoom */}
              <div className="w-full h-40 md:h-36 relative bg-[#F8FAFC] border-b border-gray-100 overflow-hidden flex-shrink-0">
                <Image src={product.img} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col p-3 md:p-4">
                {/* Title & Qty */}
                <div className="min-h-[2.5rem] mb-0.5">
                  <h4 className="text-sm font-bold text-black leading-tight line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">{product.name}</h4>
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

                  {cartItems[product.id] ? (
                    <div className="w-full bg-[var(--color-primary)] text-white text-[11px] md:text-xs font-semibold py-1.5 md:py-2 rounded-lg shadow-sm flex items-center justify-between px-2 transition-all duration-300">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDecrement(product.id); }}
                        className="p-0.5 bg-white text-[var(--color-primary)] rounded-full shadow-sm active:scale-95 transition-all hover:bg-gray-50"
                      >
                        <Minus className="w-3 h-3 md:w-4 md:h-4" strokeWidth={3} />
                      </button>
                      <span className="tracking-wide font-bold">{cartItems[product.id]} item{cartItems[product.id] > 1 ? 's' : ''} added</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleIncrement(product.id); }}
                        className="p-0.5 bg-white text-[var(--color-primary)] rounded-full shadow-sm active:scale-95 transition-all hover:bg-gray-50"
                      >
                        <Plus className="w-3 h-3 md:w-4 md:h-4" strokeWidth={3} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(product.id); }}
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
          </AnimatePresence>
        </motion.div>

      </main>

      <Footer />
      

      {/* Filter Modal */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            
            {/* Slide-over Panel (Desktop) */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="hidden md:flex fixed top-0 right-0 h-full w-full max-w-sm bg-white z-[70] shadow-2xl flex-col border-l border-gray-200"
            >
              {filterContent}
            </motion.div>

            {/* Bottom Sheet (Mobile) */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed bottom-0 left-0 w-full h-[85vh] bg-white z-[70] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col rounded-t-3xl overflow-hidden"
            >
              {/* Drag Handle Indicator */}
              <div className="w-full flex justify-center pt-3 pb-1 bg-white absolute top-0 z-10">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
              </div>
              <div className="mt-4 flex-1 flex flex-col overflow-hidden">
                {filterContent}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
