"use client";




import { ShoppingCart, Filter, Search, HeartPulse, Plus, Apple, Droplets, Baby, ShieldCheck, Pill, X, Check, ChevronLeft, Star, Minus, Shirt } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { getProducts, getProductFilters, Product } from "@/lib/api/productsApi";
import { ProductCard } from "@/components/shop/ProductCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCartAsync, updateCartQuantityAsync, removeFromCartAsync } from "@/store/slices/cartSlice";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

const PAGE_LIMIT = 12;

function mapProduct(p: Product) {
  return {
    id: p._id,
    name: p.name,
    oldPrice: p.discountedPrice && p.discountedPrice < p.price ? `₹${p.price}` : "",
    price: `₹${p.discountedPrice || p.price}`,
    discount: p.discountedPrice && p.discountedPrice < p.price ? `${Math.round(((p.price - p.discountedPrice) / p.price) * 100)}% OFF` : "",
    tag: p.isFeatured ? "Featured" : "",
    img: p.imageUrl || (p.images && p.images.length > 0 ? p.images[0] : ""),
    category: p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : "General",
    ageGroup: p.ageGroup || "All Ages",
    brand: p.brand || "",
    stockQuantity: p.stockQuantity || 0,
    rating: p.rating || 0,
    reviews: p.reviewsCount || 0,
    preferences: p.preferences || [],
  };
}

let shopCache = {
  products: [] as any[],
  hasMore: true,
  searchQuery: "",
  activeCategory: "All Products",
  sortBy: "Popularity",
  ageGroup: null as string | null,
  priceRange: null as string | null,
  page: 1,
  isInitialized: false,
};

export default function ShopPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>(shopCache.products);
  const [isLoading, setIsLoading] = useState(!shopCache.isInitialized);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(shopCache.hasMore);
  const [searchQuery, setSearchQuery] = useState(shopCache.searchQuery);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Filter States
  const [categories, setCategories] = useState<string[]>(["All Products"]);
  const [ageGroups, setAgeGroups] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState(shopCache.activeCategory);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState(shopCache.sortBy);
  const [ageGroup, setAgeGroup] = useState<string | null>(shopCache.ageGroup);
  const [priceRange, setPriceRange] = useState<string | null>(shopCache.priceRange);

  // Use refs to avoid stale closures in IntersectionObserver
  const pageRef = useRef(shopCache.page);
  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const currentFetchIdRef = useRef(0);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(val);
    }, 500);
  };

  const fetchPage = async (page: number, replace = false) => {
    if (isFetchingRef.current && !replace) return;
    const fetchId = ++currentFetchIdRef.current;
    isFetchingRef.current = true;
    if (replace) {
      setIsLoading(true);
      setIsFetchingMore(false);
    } else {
      setIsFetchingMore(true);
    }
    try {
      const queryParams: Record<string, string | number> = {
        page,
        limit: PAGE_LIMIT,
      };

      if (searchQuery) queryParams.search = searchQuery;
      if (activeCategory && activeCategory !== "All Products") queryParams.category = activeCategory.toLowerCase();
      if (ageGroup) queryParams.ageGroup = ageGroup;

      if (priceRange) {
        if (priceRange === "Under ₹500") queryParams["price[lt]"] = 500;
        else if (priceRange === "₹500 - ₹1000") {
          queryParams["price[gte]"] = 500;
          queryParams["price[lte]"] = 1000;
        }
        else if (priceRange === "Over ₹1000") queryParams["price[gt]"] = 1000;
      }

      if (sortBy === "Price: Low to High") queryParams.sort = "price";
      else if (sortBy === "Price: High to Low") queryParams.sort = "-price";
      else if (sortBy === "Newest Arrivals") queryParams.sort = "-createdAt";
      // Popularity can default to empty or -createdAt depending on backend

      const response = await getProducts(queryParams);
      if (fetchId !== currentFetchIdRef.current) return; // Stale fetch, ignore
      const fetchedProducts = response.data || response;
      const count = response.count ?? 0;
      if (Array.isArray(fetchedProducts)) {
        const mapped = fetchedProducts.map(mapProduct);
        setProducts(prev => {
          const newProducts = replace ? mapped : (() => {
            const existingIds = new Set(prev.map((p: any) => p.id));
            const newOnes = mapped.filter((p: any) => !existingIds.has(p.id));
            return [...prev, ...newOnes];
          })();
          shopCache.products = newProducts;
          return newProducts;
        });
        const loaded = replace ? fetchedProducts.length : (pageRef.current - 1) * PAGE_LIMIT + fetchedProducts.length;
        const more = fetchedProducts.length === PAGE_LIMIT && loaded < count;
        hasMoreRef.current = more;
        setHasMore(more);

        shopCache.hasMore = more;
        shopCache.page = pageRef.current;
        shopCache.isInitialized = true;
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  const isInitialMount = useRef(true);

  // Fetch when search or filters change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (shopCache.isInitialized) return;
    }

    shopCache.searchQuery = searchQuery;
    shopCache.activeCategory = activeCategory;
    shopCache.sortBy = sortBy;
    shopCache.ageGroup = ageGroup;
    shopCache.priceRange = priceRange;

    pageRef.current = 1;
    hasMoreRef.current = true;
    setHasMore(true);
    fetchPage(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, activeCategory, ageGroup, priceRange, sortBy]);

  // Fetch dynamic filters once on mount
  useEffect(() => {
    getProductFilters().then(res => {
      if (res.data) {
        const capitalizedCategories = res.data.categories.map((c: string) => c.charAt(0).toUpperCase() + c.slice(1));
        setCategories(["All Products", ...capitalizedCategories]);
        setAgeGroups(res.data.ageGroups);
      }
    }).catch(console.error);
  }, []);

  // Infinite scroll — attach observer AFTER loading so sentinel is in DOM
  useEffect(() => {
    if (isLoading || !sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !isFetchingRef.current) {
          pageRef.current += 1;
          fetchPage(pageRef.current);
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  // ── Cart (Redux-backed) ──
  const dispatch = useAppDispatch();
  const cartMap = useAppSelector(state => state.cart.cartMap);
  const cartTotalCount = useAppSelector(state => state.cart.totalCount);

  const { isAuthenticated } = useAuth();

  const handleAddToCart = async (productId: string, productName: string) => {
    if (!isAuthenticated) {
      toast("Please login to add items to cart", { icon: "🔒" });
      router.push("/login");
      return;
    }
    try {
      await dispatch(addToCartAsync({ itemId: productId, itemType: "product" })).unwrap();
      toast.success(`${productName} added to cart!`);
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  const handleIncrement = async (productId: string, productName: string) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    const entry = cartMap[productId];
    if (!entry) { handleAddToCart(productId, productName); return; }
    try {
      await dispatch(updateCartQuantityAsync({ cartItemId: entry.cartItemId, quantity: entry.qty + 1 })).unwrap();
    } catch { }
  };

  const handleDecrement = async (productId: string) => {
    const entry = cartMap[productId];
    if (!entry) return;
    try {
      if (entry.qty <= 1) {
        await dispatch(removeFromCartAsync(entry.cartItemId)).unwrap();
      } else {
        await dispatch(updateCartQuantityAsync({ cartItemId: entry.cartItemId, quantity: entry.qty - 1 })).unwrap();
      }
    } catch { }
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isFilterOpen]);

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
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Sort By</h3>
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

        {/* Category */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Category</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors ${activeCategory === cat ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)]' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Age Group */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Age Group</h3>
          <div className="flex flex-wrap gap-2">
            {ageGroups.map((age, i) => (
              <button
                key={i}
                onClick={() => setAgeGroup(age === ageGroup ? null : age)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors ${ageGroup === age ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)]' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                {age}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h3>
          <div className="flex flex-wrap gap-2">
            {["Under ₹500", "₹500 - ₹1000", "Over ₹1000"].map((price, i) => (
              <button
                key={i}
                onClick={() => setPriceRange(price === priceRange ? null : price)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors ${priceRange === price ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)]' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                {price}
              </button>
            ))}
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
            setActiveCategory("All Products");
            setIsFilterOpen(false);
          }}
          className="py-3 rounded-xl font-semibold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          Clear All
        </button>
        <button
          onClick={() => setIsFilterOpen(false)}
          className="py-3 rounded-xl font-semibold text-sm text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] shadow-md shadow-[var(--color-primary)]/20 transition-all active:scale-95"
        >
          Apply Filters
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-24 md:pb-0 relative">


      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 md:py-8 space-y-6">

        {/* Mobile Back Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 -mx-4 -mt-4 sticky top-0 z-40 bg-white">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
              <ChevronLeft className="w-6 h-6" strokeWidth={2} />
            </button>
            <h1 className="text-[17px] font-medium text-[#0F172A] ml-1">Shop</h1>
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
        <div className="hidden md:flex items-center mb-2 -ml-3 md:ml-0">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 px-3 py-2 rounded-full text-gray-700 hover:bg-gray-100 hover:text-[var(--color-primary)] transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="font-semibold text-[15px]">Back</span>
          </button>
        </div>

        {/* Desktop Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 px-1"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Shop</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Premium nutrition and essentials for your baby.</p>
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
                onChange={handleSearchChange}
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

        {/* Product Grid — plain div, no heavy animations to prevent scroll lag */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
          {isLoading && products.length === 0 ? (
            <div className="col-span-full py-20 flex justify-center items-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
                <p className="text-gray-500 font-semibold animate-pulse">Loading amazing products...</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-400 font-medium text-lg">No products found.</div>
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                cartQuantity={cartMap[product.id]?.qty || 0}
                onAddToCart={(e) => { e.stopPropagation(); handleAddToCart(product.id, product.name); }}
                onIncrement={(e) => { e.stopPropagation(); handleIncrement(product.id, product.name); }}
                onDecrement={(e) => { e.stopPropagation(); handleDecrement(product.id); }}
              />
            ))
          )}
        </div>

        {/* ── Infinite Scroll Sentinel ── */}
        <div ref={sentinelRef} className="h-8" />

        {/* Loading more spinner */}
        {
          isFetchingMore && (
            <div className="flex justify-center items-center py-6 gap-3">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin" />
              <span className="text-sm text-gray-400 font-medium">Loading more products...</span>
            </div>
          )
        }

        {/* All loaded message */}
        {
          !hasMore && products.length > 0 && (
            <p className="text-center text-xs text-gray-400 py-4">
              Showing all {products.length} products
            </p>
          )
        }

      </main >




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
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]"
            />

            {/* Slide-over Panel (Desktop) */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="hidden md:flex fixed top-0 right-0 h-full w-full max-w-md bg-white z-[120] shadow-2xl flex-col border-l border-gray-200"
            >
              {filterContent}
            </motion.div>

            {/* Bottom Sheet (Mobile) */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed bottom-0 left-0 w-full h-[85vh] bg-white z-[120] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col rounded-t-3xl overflow-hidden"
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
