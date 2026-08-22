"use client";



import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ShoppingCart, CheckCircle2, Star, Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { getProductById, getProducts } from "@/lib/api/productsApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCartAsync } from "@/store/slices/cartSlice";
import { useAuth } from "@/context/AuthContext";
import { ProductCard } from "@/components/shop/ProductCard";
import ReviewSection from "@/components/common/ReviewSection";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const productId = typeof params.productId === "string" ? params.productId : "";
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
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
          img: data.imageUrl || (data.images && data.images.length > 0 ? data.images[0] : ""),
          images: data.images && data.images.length > 0 ? data.images : (data.imageUrl ? [data.imageUrl] : []),
          desc: data.description || "",
          brand: data.brand || "",
          category: data.category ? data.category.charAt(0).toUpperCase() + data.category.slice(1) : "",
          ageGroup: data.ageGroup || "",
          stockQuantity: data.stockQuantity || 0,
          sku: data.sku || "",
          rating: data.rating || null,
          reviewsCount: data.reviewsCount || 0,
        });

        // Fetch related
        const relatedRes = await getProducts({ category: data.category || '', limit: 5 });
        const relatedList = relatedRes.data || relatedRes;
        if (Array.isArray(relatedList)) {
          setRelatedProducts(relatedList.filter(p => p._id !== productId).slice(0, 4).map(p => ({
            id: p._id,
            name: p.name,
            oldPrice: p.discountedPrice && p.discountedPrice < p.price ? `₹${p.price}` : "",
            price: `₹${p.discountedPrice || p.price}`,
            discount: p.discountedPrice && p.discountedPrice < p.price ? `${Math.round(((p.price - p.discountedPrice) / p.price) * 100)}% OFF` : "",
            tag: p.isFeatured ? "Featured" : "",
            img: p.imageUrl || (p.images?.length > 0 ? p.images[0] : ""),
            rating: p.rating || null,
          })));
        }
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

  const dispatch = useAppDispatch();
  const cartMap = useAppSelector(state => state.cart.cartMap);
  const cartTotalCount = useAppSelector(state => state.cart.totalCount);
  const cartQuantity = cartMap[productId]?.qty || 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast("Please login to add items to cart", { icon: "🔒" });
      router.push("/login");
      return;
    }
    if (!product) return;
    try {
      await dispatch(addToCartAsync({ itemId: productId, itemType: "product" })).unwrap();
      toast.success(`${product ? product.name : 'Product'} added to cart!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to add to cart');
    }
  };

  const handleAddRelatedToCart = async (id: string, name: string) => {
    if (!isAuthenticated) {
      toast("Please login to add items to cart", { icon: "🔒" });
      router.push("/login");
      return;
    }
    try {
      await dispatch(addToCartAsync({ itemId: id, itemType: "product" })).unwrap();
      toast.success(`${name} added to cart!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to add to cart');
    }
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast("Please login to buy items", { icon: "🔒" });
      router.push("/login");
      return;
    }
    if (cartQuantity === 0) {
      try {
        await dispatch(addToCartAsync({ itemId: productId, itemType: "product" })).unwrap();
      } catch (err) {
        console.error(err);
        toast.error('Failed to add to cart');
        return;
      }
    }
    router.push('/shop/checkout');
  };

  const images: string[] = product ? (product.images || [product.img]) : [];

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
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-24 md:pb-0 relative">


      <main className="max-w-[1200px] mx-auto px-4 md:px-8 pt-4 pb-24 md:py-8">

        {/* Mobile Back Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 -mx-4 -mt-4 sticky top-0 z-40 bg-white">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
              <ChevronLeft className="w-6 h-6" strokeWidth={2} />
            </button>
            <h1 className="text-[17px] font-medium text-[#0F172A] ml-1">Back</h1>
          </div>
          <button onClick={() => router.push('/shop/cart')} className="relative text-[#0F172A] active:scale-95 transition-transform mr-1">
            <ShoppingCart className="w-6 h-6" strokeWidth={2} />
            {cartTotalCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#FF3B30] text-white text-[11px] font-black min-w-[20px] h-[20px] px-1 flex items-center justify-center rounded-full">
                {cartTotalCount}
              </span>
            )}
          </button>
        </div>

        {/* Desktop Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex items-center mb-2 -ml-3 md:ml-0"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 px-3 py-2 rounded-full text-gray-700 hover:bg-gray-100 hover:text-[var(--color-primary)] transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="font-semibold text-[15px]">Back</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mt-0 md:mt-6">

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
              {images.map((src: string, idx: number) => (
                <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative bg-[#F8FAFC]">
                  {src ? (
                    <Image src={src} alt={product.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 flex-col">
                      <ShoppingCart className="w-10 h-10 mb-2 opacity-50" />
                      <span className="text-xs font-semibold">No Image</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Single Image View */}
            <div className="hidden md:flex h-auto aspect-[4/3] lg:aspect-square bg-[#F8FAFC] rounded-lg relative items-center justify-center overflow-hidden shadow-sm group">
              {images[activeImgIdx] ? (
                <Image src={images[activeImgIdx]} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <ShoppingCart className="w-12 h-12 mb-2 opacity-50" />
                  <span className="text-sm font-semibold">No Image</span>
                </div>
              )}
            </div>

            {/* Mobile Carousel Dots */}            {/* Mobile Carousel Dots */}
            <div className="md:hidden flex justify-center gap-1.5 mt-2 mb-1">
              {images.map((_: any, idx: number) => (
                <div key={idx} className={`w-2 h-2 rounded-full transition-colors ${activeImgIdx === idx ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`} />
              ))}
            </div>

            {/* Thumbnail Placeholders (Visible on mobile too) */}
            <div className="flex gap-3 md:gap-4 overflow-x-auto hide-scroll pb-1">
              {images.map((imgSrc: string, idx: number) => (
                <div
                  key={idx}
                  onClick={() => handleThumbnailClick(idx)}
                  className={`w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all relative overflow-hidden bg-[#F8FAFC] ${activeImgIdx === idx ? 'border-[var(--color-primary)] shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
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
            className="flex flex-col relative pb-8"
          >
            {/* Title, Brand, & SKU */}
            <div className="mb-3 flex flex-col gap-1.5">
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                {product.brand && (
                  <>
                    <span className="text-[var(--color-primary)] font-semibold">{product.brand}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  </>
                )}
                {product.sku && <span>SKU: {product.sku}</span>}
              </div>
            </div>

            {/* Ratings */}
            {product.rating && (
              <div className="flex justify-between items-end mb-5 relative">
                <div className="flex items-center gap-1.5 bg-yellow-50 px-2.5 py-1 rounded-full border border-yellow-100">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-semibold text-yellow-700">{product.rating}</span>
                  {product.reviewsCount > 0 && (
                    <span className="text-xs font-medium text-yellow-600/70 ml-0.5">({product.reviewsCount})</span>
                  )}
                </div>
              </div>
            )}

            {/* Price & Stock */}
            <div className="mb-6 flex flex-col gap-1">
              <div className="flex items-end gap-2.5">
                <span className="text-sm font-semibold text-gray-500 line-through mb-0.5">{product.oldPrice}</span>
                <span className="text-2xl font-semibold text-gray-900">{product.price}</span>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 mb-1">{product.discount}</span>
              </div>
              {product.stockQuantity > 0 && product.stockQuantity <= 10 && (
                <span className="text-xs font-medium text-red-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  Only {product.stockQuantity} left in stock - order soon!
                </span>
              )}
            </div>

            {/* Additional Info */}
            <div className="mb-8 flex flex-wrap gap-2">
              {product.category && (
                <span className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {product.category}
                </span>
              )}
              {product.ageGroup && (
                <span className="bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {product.ageGroup}
                </span>
              )}
            </div>

            {/* Description (A+ Content) */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Product Description</h3>
              <div
                className="prose prose-sm md:prose-base max-w-none text-gray-600 font-medium break-words prose-p:break-words overflow-hidden prose-img:hidden prose-headings:font-semibold prose-headings:text-gray-900 prose-a:text-[var(--color-primary)]"
                dangerouslySetInnerHTML={{ __html: product.desc || '' }}
              />
            </div>

            {/* Reviews */}
            {productId && <ReviewSection targetId={productId} targetType="product" />}

            {/* Action Bar (Sticky on Mobile, sticky bottom on Desktop) */}
            <div className="mt-auto bg-white p-3 lg:py-4 fixed bottom-0 left-0 w-full lg:sticky lg:bottom-0 z-40 flex gap-3 pb-safe border-t lg:border-t-0 border-gray-100">

              {product.stockQuantity > 0 ? (
                <>
                  {cartQuantity > 0 ? (
                    <div
                      onClick={() => router.push('/shop/cart')}
                      className="flex-1 h-12 md:h-14 bg-white text-[var(--color-primary)] border-2 border-[var(--color-primary)] font-semibold rounded-2xl flex items-center justify-center cursor-pointer hover:bg-[var(--color-primary)]/5 transition-colors"
                    >
                      <span className="tracking-wide font-semibold text-sm md:text-base">{cartQuantity} in cart</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 h-12 md:h-14 bg-white text-[var(--color-primary)] border-2 border-[var(--color-primary)] font-semibold text-sm md:text-base rounded-2xl hover:bg-[var(--color-primary)]/5 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                    >
                      <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 group-hover/btn:scale-110 transition-transform" />
                      Add to Cart
                    </button>
                  )}
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 h-12 md:h-14 bg-[var(--color-primary)] text-white font-semibold text-sm md:text-base rounded-2xl hover:bg-[#527d89] transition-all duration-300 flex items-center justify-center shadow-sm"
                  >
                    Buy Now
                  </button>
                </>
              ) : (
                <button
                  disabled
                  className="w-full h-12 md:h-14 bg-gray-100 text-gray-400 font-semibold text-base md:text-lg rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed border border-gray-200"
                >
                  Out of Stock
                </button>
              )}
            </div>

          </motion.div>
        </div>

      </main>

      {/* Related Products - Separate Section */}
      {relatedProducts.length > 0 && (
        <div className="bg-white py-12 px-4 md:px-8 pb-28 lg:pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900 text-xl md:text-2xl">You might also like</h3>
              <button
                onClick={() => router.push('/shop')}
                className="text-[var(--color-primary)] font-semibold text-sm hover:underline"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map(rp => (
                <ProductCard
                  key={rp.id}
                  product={rp}
                  cartQuantity={cartMap[rp.id]?.qty || 0}
                  onAddToCart={(e) => { e.stopPropagation(); handleAddRelatedToCart(rp.id, rp.name); }}
                />
              ))}
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
