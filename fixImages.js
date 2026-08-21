const fs = require('fs');
const path = require('path');

const productPagePath = 'f:/Dss-Project/moncradel/frontend/parent-pwa/src/app/shop/[productId]/page.tsx';
let productContent = fs.readFileSync(productPagePath, 'utf8');

const productReplacement1 = `              {images.map((src: string, idx: number) => (
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
            
            {/* Mobile Carousel Dots */}`;

// In shop/[productId]/page.tsx
const pStart = productContent.indexOf('              {images.map((src: string, idx: number) => (');
const pEnd = productContent.indexOf('            {/* Mobile Carousel Dots */}');
if (pStart !== -1 && pEnd !== -1) {
    productContent = productContent.substring(0, pStart) + productReplacement1 + productContent.substring(pEnd);
}

// Add ShoppingCart import if not present
if (!productContent.includes('ShoppingCart')) {
    productContent = productContent.replace('import { ChevronLeft, Star, Heart, Share2, Plus, Minus, ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";', 
    'import { ChevronLeft, Star, Heart, Share2, Plus, Minus, ArrowRight, CheckCircle2, ShieldCheck, Zap, ShoppingCart } from "lucide-react";');
}

fs.writeFileSync(productPagePath, productContent);


const mealPagePath = 'f:/Dss-Project/moncradel/frontend/parent-pwa/src/app/nutrition/meal-plans/[id]/page.tsx';
let mealContent = fs.readFileSync(mealPagePath, 'utf8');

const mealReplacement1 = `              {images.map((src: string, idx: number) => (
                <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative bg-[#F8FAFC]">
                  {src ? (
                    <Image src={src} alt={meal.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <ShoppingCart className="w-10 h-10 mb-2 opacity-50" />
                      <span className="font-semibold text-xs">No Image</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Single Image View */}
            <div className="hidden md:flex h-auto aspect-[4/3] lg:aspect-square bg-[#F8FAFC] rounded-lg relative items-center justify-center overflow-hidden shadow-sm group">
              {images[activeImgIdx] ? (
                <Image src={images[activeImgIdx]} alt={meal.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <ShoppingCart className="w-12 h-12 mb-2 opacity-50" />
                  <span className="font-semibold text-sm">No Image</span>
                </div>
              )}
            </div>
            
            {/* Mobile Carousel Dots */}`;

const mStart = mealContent.indexOf('              {images.length > 0 ? images.map((src: string, idx: number) => (');
const mEnd = mealContent.indexOf('            {/* Mobile Carousel Dots */}');
if (mStart !== -1 && mEnd !== -1) {
    mealContent = mealContent.substring(0, mStart) + mealReplacement1 + mealContent.substring(mEnd);
}

if (!mealContent.includes('ShoppingCart')) {
    mealContent = mealContent.replace('import { ChevronLeft, Heart, Share2, Clock, Users, ArrowRight, Target, Flame, Leaf, CheckCircle2 } from "lucide-react";',
    'import { ChevronLeft, Heart, Share2, Clock, Users, ArrowRight, Target, Flame, Leaf, CheckCircle2, ShoppingCart } from "lucide-react";');
}

fs.writeFileSync(mealPagePath, mealContent);

console.log('Fixed image placeholders on detail pages.');
