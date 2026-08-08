"use client";

import { Header } from "@/components/layout/Header/Header";
import { Footer } from "@/components/layout/Footer/Footer";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ShoppingCart, CheckCircle2, Star, Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { getProductById } from "@/lib/api/productsApi";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const productId = typeof params.productId === "string" ? params.productId : "";
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await getProductById(productId);
        const data = response.data || response;
        setProduct({
          name: data.name,
          oldPrice: data.discountedPrice && data.discountedPrice < data.price ? `₹${data.price}` : "",
          price: `₹${data.discountedPrice || data.price}`,
          discount: data.discountedPrice && data.discountedPrice < data.price ? `${Math.round(((data.price - data.discountedPrice) / data.price) * 100)}% OFF` : "",
          tag: data.isFeatured ? "Featured" : "",
          img: data.imageUrl || "/images/meal_food.png",
          desc: data.description || "Premium quality product for your baby.",
          brand: data.brand || "",
          category: data.category || "",
          ageGroup: data.ageGroup || "",
          stockQuantity: data.stockQuantity || 0,
          rating: 4.9, // Hardcoded rating as per requirement
        });
      } catch (err) {
        console.error("Failed to load product", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (productId) {
      fetchProduct();
    }
  }, [productId]);
  
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const images = product ? [product.img] : [];

  const carouselRef = useRef<HTMLDivElement>(null);

  const handleThumbnailClick = (idx: number) => {
    setActiveImgIdx(idx);
    if (carouselRef.current) {
      const width = carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({ left: width * idx, behavior: 'smooth' });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.offsetWidth;
    const index = Math.round(scrollLeft / width);
    if (index !== activeImgIdx && index >= 0 && index < images.length) {
      setActiveImgIdx(index);
    }
  };

  if (isLoading || !product) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
          <p className="text-gray-500 font-semibold animate-pulse">Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans">
      <Header />

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 pt-2 pb-36 md:pt-4 md:pb-10">
        
        {/* Navigation (Mobile Only) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:hidden flex items-center justify-between mb-6 -ml-3 mt-2 -mr-3"
        >
          <button 
            onClick={() => router.back()} 
            className="w-10 h-10 flex items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 hover:text-[var(--color-primary)] transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <button 
            onClick={() => router.push('/shop/cart')} 
            className="md:hidden w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-gray-200 text-[#122B54] active:scale-95 transition-all mr-3"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          
          {/* Left Column - Product Image */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-4"
          >
            {/* Mobile Carousel (Native Smooth Scroll) */}
            <style>{`
              .hide-scroll::-webkit-scrollbar {
                display: none;
              }
              .hide-scroll {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>
            <div 
              ref={carouselRef}
              className="md:hidden -mx-4 aspect-square flex overflow-x-auto snap-x snap-mandatory hide-scroll"
              onScroll={handleScroll}
            >
              {images.map((src, idx) => (
                <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative bg-[#F8FAFC]">
                  <Image 
                    src={src} 
                    alt={product.name} 
                    fill 
                    className="object-cover" 
                  />
                </div>
              ))}
            </div>

            {/* Desktop Single Image View */}
            <div className="hidden md:flex h-auto aspect-[4/3] lg:aspect-square bg-[#F8FAFC] rounded-lg relative items-center justify-center overflow-hidden shadow-sm group">
              <Image 
                src={images[activeImgIdx]} 
                alt={product.name} 
                fill 
                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
              />
            </div>
            
            {/* Mobile Carousel Dots */}
            <div className="md:hidden flex justify-center gap-1.5 mt-2 mb-1">
              {images.map((_, idx) => (
                <div key={idx} className={`w-2 h-2 rounded-full transition-colors ${activeImgIdx === idx ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`} />
              ))}
            </div>
            
            {/* Thumbnail Placeholders (Visible on mobile too) */}
            <div className="flex gap-3 md:gap-4 overflow-x-auto hide-scroll pb-1">
               {images.map((imgSrc, idx) => (
                 <div 
                   key={idx} 
                   onClick={() => handleThumbnailClick(idx)}
                   className={`w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all relative overflow-hidden bg-[#F8FAFC] ${activeImgIdx === idx ? 'border-[var(--color-primary)] shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                 >
                   <Image src={imgSrc} alt="thumbnail" fill className="object-cover" />
                 </div>
               ))}
            </div>
          </motion.div>

          {/* Right Column - Product Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col relative"
          >
            {/* Title & Reviews */}
            <div className="mb-4">
              <h1 className="text-[17px] md:text-4xl font-bold text-gray-900 leading-[1.3]">
                {product.name}
              </h1>
            </div>

            {/* Ratings & Ask Nutritionist */}
            <div className="flex justify-between items-end mb-4 relative">
              <div className="flex items-center gap-2">
                <div className="flex items-center text-yellow-400">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current opacity-50" />
                </div>
                <span className="text-base font-extrabold text-gray-800">{product.rating}</span>
              </div>
              
            </div>

            {/* Price */}
            <div className="mb-6 flex items-end gap-2.5">
              <span className="text-sm font-semibold text-gray-500 line-through mb-0.5">{product.oldPrice}</span>
              <span className="text-2xl font-semibold text-gray-900">{product.price}</span>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 mb-1">{product.discount}</span>
            </div>

            <div className="w-full h-px bg-gray-200 mb-8" />

            {/* Additional Info (Replaced Size and Benefits) */}
            <div className="mb-8 grid grid-cols-2 gap-4">
              {product.brand && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Brand</p>
                  <p className="font-bold text-gray-900">{product.brand}</p>
                </div>
              )}
              {product.ageGroup && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Age Group</p>
                  <p className="font-bold text-gray-900">{product.ageGroup}</p>
                </div>
              )}
              {product.category && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Category</p>
                  <p className="font-bold text-gray-900 capitalize">{product.category}</p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="font-bold text-gray-900 mb-3">Product Description</h3>
              <p className="text-gray-600 leading-relaxed font-medium">
                {product.desc}
              </p>
            </div>

            {/* Action Bar (Sticky on Mobile, standard on Desktop) */}
            <div className="mt-auto bg-white p-3 lg:p-0 border-t border-gray-100 lg:border-none fixed bottom-0 left-0 w-full lg:relative lg:bottom-0 z-40 flex shadow-[0_-10px_30px_rgba(0,0,0,0.05)] lg:shadow-none pb-safe">
              
              {product.stockQuantity > 0 ? (
                quantity > 0 ? (
                  <div className="w-full h-12 md:h-14 bg-[var(--color-primary)] text-white font-semibold rounded-lg shadow-sm flex items-center justify-between px-3 transition-all duration-300">
                    <button
                      onClick={(e) => { e.stopPropagation(); setQuantity(quantity - 1); }}
                      className="p-1.5 md:p-2 bg-white text-[var(--color-primary)] rounded-md shadow-sm active:scale-95 transition-all hover:bg-gray-50"
                    >
                      <Minus className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
                    </button>
                    <span className="tracking-wide font-bold text-base md:text-lg">{quantity} item{quantity > 1 ? 's' : ''} added</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setQuantity(quantity + 1); }}
                      className="p-1.5 md:p-2 bg-white text-[var(--color-primary)] rounded-md shadow-sm active:scale-95 transition-all hover:bg-gray-50"
                    >
                      <Plus className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); setQuantity(1); }}
                    className="w-full h-12 md:h-14 bg-[var(--color-primary)] text-white font-bold text-base md:text-lg rounded-lg hover:bg-[#527d89] hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-sm"
                  >
                    <ShoppingCart className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                    Add to Cart
                  </button>
                )
              ) : (
                <button
                  disabled
                  className="w-full h-12 md:h-14 bg-gray-300 text-gray-500 font-bold text-base md:text-lg rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  Out of Stock
                </button>
              )}
            </div>

          </motion.div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
