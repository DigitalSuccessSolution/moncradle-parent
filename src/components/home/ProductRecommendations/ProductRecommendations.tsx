"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { getProducts, Product } from "@/lib/api/productsApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCartAsync, updateCartQuantityAsync, removeFromCartAsync } from "@/store/slices/cartSlice";
import { ProductCard } from "@/components/shop/ProductCard";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

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

export function ProductRecommendations() {
  const [products, setProducts] = useState<any[]>([]);
  const dispatch = useAppDispatch();
  const cartMap = useAppSelector(state => state.cart.cartMap);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    getProducts({ limit: 5 }).then(res => {
      const data = res.data || res;
      if (Array.isArray(data)) {
        setProducts(data.map(mapProduct));
      }
    }).catch(console.error);
  }, []);

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
      toast.error("Failed to add to cart");
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
    } catch {}
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
    } catch {}
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] } }
  };

  if (products.length === 0) return null;

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8 gap-2">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-black leading-tight">Recommended for You</h2>
          <p className="text-sm text-gray-500 mt-2 hidden md:block font-light">Handpicked essentials for your baby's current stage.</p>
        </div>
        <Link href="/shop" className="text-[11px] md:text-sm font-semibold md:font-medium text-[var(--color-primary)] flex items-center gap-1 group shrink-0 whitespace-nowrap">
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
        className="flex overflow-x-auto items-stretch snap-x snap-mandatory gap-2 md:gap-3 pb-4 px-4 -mx-4 md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {products.map((product) => (
          <motion.div
            key={product.id}
            variants={itemVariants}
            className="w-[45vw] min-w-[45vw] snap-center sm:w-full sm:min-w-full md:w-auto md:min-w-0 shrink-0"
          >
            <ProductCard 
              product={product} 
              cartQuantity={cartMap[product.id]?.qty || 0}
              onAddToCart={(e) => { e.stopPropagation(); handleAddToCart(product.id, product.name); }}
              onIncrement={(e) => { e.stopPropagation(); handleIncrement(product.id, product.name); }}
              onDecrement={(e) => { e.stopPropagation(); handleDecrement(product.id); }}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
