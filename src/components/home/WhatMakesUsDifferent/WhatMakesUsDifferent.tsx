"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  Check, 
  Heart, 
  Flame, 
  Trophy, 
  Ban, 
  Utensils,
  Stethoscope 
} from "lucide-react";

// Signature Little Spoon Scalloped Turquoise Starburst Badge (#00D2D3 with crisp black border)
function LittleSpoonStarburst({ children, className = "w-13 h-13 sm:w-14 sm:h-14 md:w-15 md:h-15" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full drop-shadow-2xs">
        <path
          d="M24 2C25.4 2 26.6 3.4 28 3.9C29.4 4.4 31 3.9 32.2 4.7C33.4 5.5 34.1 7.1 35.2 8.1C36.3 9.1 37.9 9.8 38.8 11C39.7 12.2 39.6 14 40.2 15.3C40.8 16.6 42.2 17.7 42.5 19.2C42.8 20.7 41.9 22.3 41.9 23.9C41.9 25.5 42.8 27.1 42.5 28.6C42.2 30.1 40.8 31.2 40.2 32.5C39.6 33.8 39.7 35.6 38.8 36.8C37.9 38 36.3 38.7 35.2 39.7C34.1 40.7 33.4 42.3 32.2 43.1C31 43.9 29.4 43.4 28 43.9C26.6 44.4 25.4 45.8 24 45.8C22.6 45.8 21.4 44.4 20 43.9C18.6 43.4 17 43.9 15.8 43.1C14.6 42.3 13.9 40.7 12.8 39.7C11.7 38.7 10.1 38 9.2 36.8C8.3 35.6 8.4 33.8 7.8 32.5C7.2 31.2 5.8 30.1 5.5 28.6C5.2 27.1 6.1 25.5 6.1 23.9C6.1 22.3 5.2 20.7 5.5 19.2C5.8 17.7 7.2 16.6 7.8 15.3C8.4 14 8.3 12.2 9.2 11C10.1 9.8 11.7 9.1 12.8 8.1C13.9 7.1 14.6 5.5 15.8 4.7C17 3.9 18.6 4.4 20 3.9C21.4 3.4 22.6 2 24 2Z"
          fill="#00D2D3"
          stroke="#000000"
          strokeWidth="1.5"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center p-1 text-black font-black text-center select-none">
        {children}
      </div>
    </div>
  );
}

// Authentic Circular FSSAI Seal
function FssaiSeal() {
  return (
    <div className="w-13 h-13 sm:w-14 sm:h-14 md:w-15 md:h-15 rounded-full border-[2.2px] border-black flex flex-col items-center justify-center bg-white shrink-0 p-1 shadow-2xs">
      <span className="text-[11px] sm:text-[12px] font-black tracking-tighter leading-none italic text-black">fssai</span>
      <div className="w-8 sm:w-9 h-[1.5px] bg-black my-0.5" />
      <span className="text-[6.5px] sm:text-[7.5px] font-black tracking-tightest leading-none text-black uppercase">CERTIFIED</span>
    </div>
  );
}

// Authentic Circular Jaivik Bharat (India Organic) Seal
function JaivikSeal() {
  return (
    <div className="w-13 h-13 sm:w-14 sm:h-14 md:w-15 md:h-15 rounded-full border-[2.2px] border-black flex flex-col items-center justify-center bg-white shrink-0 p-1 shadow-2xs">
      <span className="text-[8.5px] sm:text-[9.5px] font-black tracking-tight leading-none text-black">JAIVIK</span>
      <div className="w-8 sm:w-9 h-[1.5px] bg-black my-0.5" />
      <span className="text-[7.5px] sm:text-[8.5px] font-black tracking-tight leading-none text-black">BHARAT</span>
    </div>
  );
}

// Authentic Circular Doctor / Pediatrician Approved Seal
function DoctorSeal() {
  return (
    <div className="w-13 h-13 sm:w-14 sm:h-14 md:w-15 md:h-15 rounded-full border-[2.2px] border-black flex flex-col items-center justify-center bg-white shrink-0 p-1 shadow-2xs">
      <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 text-black stroke-[2.5] mb-0.5" />
      <span className="text-[6.5px] sm:text-[7.5px] font-black tracking-tightest leading-none uppercase text-center text-black">DOCTOR<br/>APPROVED</span>
    </div>
  );
}

// Authentic Laurel Wreath Clean Label / Purity Award Seal
function LaurelAwardSeal() {
  return (
    <div className="w-13 h-13 sm:w-14 sm:h-14 md:w-15 md:h-15 flex flex-col items-center justify-center shrink-0">
      <div className="relative flex flex-col items-center justify-center">
        <svg viewBox="0 0 60 48" className="w-13 h-11 sm:w-14 sm:h-12" fill="none">
          {/* Left Laurel Branch */}
          <path d="M16 38C13 32 12 24 16 16C18 12 21 9 24 6" stroke="#000000" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M12 30C10 26 10 21 13 17" stroke="#000000" strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M18 24C16 20 17 16 21 13" stroke="#000000" strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M21 16C20 12 22 9 26 7" stroke="#000000" strokeWidth="1.4" strokeLinecap="round"/>
          {/* Right Laurel Branch */}
          <path d="M44 38C47 32 48 24 44 16C42 12 39 9 36 6" stroke="#000000" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M48 30C50 26 50 21 47 17" stroke="#000000" strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M42 24C44 20 43 16 39 13" stroke="#000000" strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M39 16C40 12 38 9 34 7" stroke="#000000" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[7.5px] sm:text-[8px] font-bold leading-tight uppercase text-black tracking-tighter">clean</span>
          <span className="text-[7.5px] sm:text-[8px] font-black leading-tight uppercase text-black tracking-tighter">label</span>
          <span className="text-[5.5px] sm:text-[6px] font-bold text-gray-600 uppercase leading-none">PURITY</span>
        </div>
      </div>
    </div>
  );
}

interface ProductItem {
  image: string;
  alt: string;
}

interface BenefitItem {
  badgeType: "starburst" | "fssai" | "jaivik" | "doctor" | "award";
  badgeContent?: React.ReactNode;
  title: string;
  subtitle?: string;
}

interface StackCardData {
  id: string;
  title: string;
  trademark?: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  bgColor: string;
  products: ProductItem[];
  benefits: BenefitItem[];
}

const STACK_CARDS: StackCardData[] = [
  {
    id: "formula",
    title: "Our Infant Formula",
    description: "Dual-certified FSSAI & Jaivik Bharat Infant Formula, made with 100% pure A2 Desi Cow Milk. Every batch is tested for 500+ toxins and contaminants — with defined safety limits and radical transparency for your baby.",
    buttonText: "EXPLORE INFANT FORMULA",
    buttonLink: "/shop",
    bgColor: "bg-[#5FE3E8]", // Little Spoon Aqua Cyan
    products: [
      {
        image: "/images/different/formula_v2.jpg",
        alt: "Organic A2 Whole Milk Infant Formula with bottle and scoop",
      }
    ],
    benefits: [
      {
        badgeType: "fssai",
        title: "FSSAI CERTIFIED",
        subtitle: "100% FOOD SAFE"
      },
      {
        badgeType: "starburst",
        badgeContent: (
          <div className="flex flex-col items-center">
            <span className="text-[7.5px] sm:text-[8.5px] font-black leading-none uppercase">ALWAYS</span>
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[4] my-0.5" />
            <span className="text-[7.5px] sm:text-[8.5px] font-black leading-none uppercase">TESTED</span>
          </div>
        ),
        title: "TESTED FOR 500+ CONTAMINANTS"
      },
      {
        badgeType: "jaivik",
        title: "JAIVIK BHARAT",
        subtitle: "ORGANIC INDIA"
      },
      {
        badgeType: "starburst",
        badgeContent: (
          <div className="flex flex-col items-center">
            <span className="text-[7px] sm:text-[8px] font-black leading-none uppercase">INSPIRED</span>
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-black stroke-none my-0.5" />
            <span className="text-[7px] sm:text-[8px] font-black leading-none uppercase">BY MAA</span>
          </div>
        ),
        title: "MODELED AFTER BREASTMILK"
      },
      {
        badgeType: "award",
        title: "AWARD-WINNING",
        subtitle: "CLEAN FORMULA"
      }
    ]
  },
  {
    id: "cereal",
    title: "Our Baby Cereal",
    description: "Certified clean, traditional Indian superfood baby cereal (6+ mos). Made with 100% Sprouted Ragi, Foxtail Millets, and Ancient Oats — packed with natural iron, calcium, and zero added sugar or salt.",
    buttonText: "EXPLORE BABY CEREAL",
    buttonLink: "/shop",
    bgColor: "bg-[#B4F080]", // Little Spoon Lime Green
    products: [
      {
        image: "/images/different/cereal_v2.jpg",
        alt: "Organic Sprouted Ragi & Oatmeal Baby Cereal pouch",
      }
    ],
    benefits: [
      {
        badgeType: "starburst",
        badgeContent: (
          <div className="flex flex-col items-center">
            <span className="text-[7.5px] sm:text-[8.5px] font-black leading-none uppercase">ALWAYS</span>
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[4] my-0.5" />
            <span className="text-[7.5px] sm:text-[8.5px] font-black leading-none uppercase">TESTED</span>
          </div>
        ),
        title: "TESTED FOR 500+ CONTAMINANTS"
      },
      {
        badgeType: "starburst",
        badgeContent: (
          <div className="flex flex-col items-center">
            <span className="text-[8.5px] sm:text-[9.5px] font-black leading-tight uppercase">SPROUTED</span>
            <span className="text-[8.5px] sm:text-[9.5px] font-black leading-tight uppercase">RAGI</span>
          </div>
        ),
        title: "100% SPROUTED MILLETS"
      },
      {
        badgeType: "jaivik",
        title: "JAIVIK BHARAT",
        subtitle: "ORGANIC INDIA"
      },
      {
        badgeType: "starburst",
        badgeContent: (
          <div className="flex flex-col items-center">
            <Ban className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
            <span className="text-[6.5px] sm:text-[7.5px] font-black leading-none uppercase mt-0.5">SUGAR</span>
          </div>
        ),
        title: "0G ADDED SUGAR",
        subtitle: "PER SERVING"
      },
      {
        badgeType: "award",
        title: "AWARD-WINNING",
        subtitle: "CLEAN FORMULA"
      }
    ]
  },
  {
    id: "babyblends",
    title: "Our Babyblends",
    trademark: "TM",
    description: "Your baby’s food shouldn’t be older than your baby.™ Award-winning fresh purees prepared daily with Ratnagiri Alphonso mango, sweet potato, spinach, and apples. Nutrient-locked with steam and 0 chemicals.",
    buttonText: "EXPLORE BABYBLENDS",
    buttonLink: "/nutrition/meal-plans",
    bgColor: "bg-[#FFCF6B]", // Little Spoon Warm Mango Yellow
    products: [
      {
        image: "/images/different/babyblends_v2.jpg",
        alt: "Organic Fresh Spinach Apple Puree Babyblend with spoon",
      }
    ],
    benefits: [
      {
        badgeType: "starburst",
        badgeContent: (
          <div className="flex flex-col items-center">
            <span className="text-[6.5px] sm:text-[7.5px] font-black leading-none uppercase">ARTIFICIAL</span>
            <span className="text-[11px] sm:text-[13px] font-black leading-none text-red-700">NO</span>
            <span className="text-[6.5px] sm:text-[7.5px] font-black leading-none uppercase">FLAVORS</span>
          </div>
        ),
        title: "NO ARTIFICIAL",
        subtitle: "FLAVORS + COLORS"
      },
      {
        badgeType: "starburst",
        badgeContent: (
          <div className="flex flex-col items-center">
            <span className="text-[7.5px] sm:text-[8.5px] font-black leading-none uppercase">ALWAYS</span>
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[4] my-0.5" />
            <span className="text-[7.5px] sm:text-[8.5px] font-black leading-none uppercase">TESTED</span>
          </div>
        ),
        title: "TESTED FOR 500+ CONTAMINANTS"
      },
      {
        badgeType: "starburst",
        badgeContent: (
          <div className="flex flex-col items-center">
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-orange-500 text-orange-500" />
            <span className="text-[6px] sm:text-[7px] font-black leading-none uppercase">STEAM</span>
          </div>
        ),
        title: "STEAM-NUTRIENT PROTECTED"
      },
      {
        badgeType: "jaivik",
        title: "JAIVIK BHARAT",
        subtitle: "ORGANIC INDIA"
      },
      {
        badgeType: "starburst",
        badgeContent: (
          <Utensils className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
        ),
        title: "AWARD WINNING FLAVORS"
      }
    ]
  },
  {
    id: "puffs",
    title: "Our Rice-Free Puffs",
    description: "Made with 7 ingredients or less, our organic meltable roasted makhana & ragi puffs are expert-developed to support fine motor + oral development without maida or rice.",
    buttonText: "EXPLORE PUFFS",
    buttonLink: "/shop",
    bgColor: "bg-[#A7F37E]", // Little Spoon Mint Green
    products: [
      {
        image: "/images/different/puffs_v2.jpg",
        alt: "Organic Roasted Makhana & Ragi meltable snacks canister",
      }
    ],
    benefits: [
      {
        badgeType: "jaivik",
        title: "JAIVIK BHARAT",
        subtitle: "ORGANIC CERTIFIED"
      },
      {
        badgeType: "starburst",
        badgeContent: (
          <div className="flex flex-col items-center">
            <span className="text-[8.5px] sm:text-[9.5px] font-black leading-tight uppercase">ROASTED</span>
            <span className="text-[8.5px] sm:text-[9.5px] font-black leading-tight uppercase">MAKHANA</span>
          </div>
        ),
        title: "100% ROASTED MAKHANA"
      },
      {
        badgeType: "starburst",
        badgeContent: (
          <div className="flex flex-col items-center">
            <span className="text-[7.5px] sm:text-[8.5px] font-black leading-none uppercase">ALWAYS</span>
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[4] my-0.5" />
            <span className="text-[7.5px] sm:text-[8.5px] font-black leading-none uppercase">TESTED</span>
          </div>
        ),
        title: "TESTED FOR 500+ CONTAMINANTS"
      },
      {
        badgeType: "starburst",
        badgeContent: (
          <div className="flex flex-col items-center">
            <Ban className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
            <span className="text-[6.5px] sm:text-[7.5px] font-black leading-none uppercase mt-0.5">MAIDA</span>
          </div>
        ),
        title: "NO MAIDA / NO RICE",
        subtitle: "100% GLUTEN-FREE"
      },
      {
        badgeType: "award",
        title: "AWARD-WINNING",
        subtitle: "CLEAN FORMULA"
      }
    ]
  },
  {
    id: "biteables",
    title: "Our Biteables",
    trademark: "TM",
    description: "The line that sold out 5x times. Cut-to-size early finger food meals built for your babe to transition to table foods with ease. Featuring tender Moong Dal Khichdi and Veggie Pasta in pure Gir Cow A2 Desi Ghee.",
    buttonText: "EXPLORE BITEABLES",
    buttonLink: "/nutrition/meal-plans",
    bgColor: "bg-[#C4A3ED]", // Little Spoon Lavender Lilac
    products: [
      {
        image: "/images/different/biteables_v2.jpg",
        alt: "Clean partitioned Biteables toddler meal tray with macaroni pasta, diced carrots and peas",
      }
    ],
    benefits: [
      {
        badgeType: "starburst",
        badgeContent: (
          <div className="flex flex-col items-center">
            <span className="text-[13px] sm:text-[15px] leading-none mb-0.5">🥦</span>
            <span className="text-[5.5px] sm:text-[6.5px] font-black leading-none uppercase">VEGGIES</span>
          </div>
        ),
        title: "HIDDEN VEGGIES",
        subtitle: "+ SUPERFOODS"
      },
      {
        badgeType: "starburst",
        badgeContent: (
          <div className="flex flex-col items-center">
            <span className="text-[7.5px] sm:text-[8.5px] font-black leading-none uppercase">ALWAYS</span>
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[4] my-0.5" />
            <span className="text-[7.5px] sm:text-[8.5px] font-black leading-none uppercase">TESTED</span>
          </div>
        ),
        title: "TESTED FOR 500+ CONTAMINANTS"
      },
      {
        badgeType: "starburst",
        badgeContent: (
          <div className="flex flex-col items-center">
            <span className="text-[6.5px] sm:text-[7.5px] font-black leading-none uppercase">ARTIFICIAL</span>
            <span className="text-[11px] sm:text-[13px] font-black leading-none text-red-700">NO</span>
          </div>
        ),
        title: "NO ARTIFICIAL",
        subtitle: "JUNK"
      },
      {
        badgeType: "starburst",
        badgeContent: (
          <div className="flex flex-col items-center">
            <span className="text-[8.5px] sm:text-[9.5px] font-black leading-none uppercase">HEAT</span>
            <span className="text-[7.5px] sm:text-[8.5px] font-black leading-none uppercase">+ EAT</span>
          </div>
        ),
        title: "READY IN",
        subtitle: "SECONDS"
      },
      {
        badgeType: "doctor",
        title: "PEDIATRICIAN",
        subtitle: "APPROVED"
      }
    ]
  }
];

export function WhatMakesUsDifferent() {
  const [productSlideIdxs, setProductSlideIdxs] = useState<{ [cardId: string]: number }>({});

  const nextProduct = (cardId: string, max: number) => {
    setProductSlideIdxs((prev) => ({
      ...prev,
      [cardId]: ((prev[cardId] || 0) + 1) % max,
    }));
  };

  return (
    <section className="w-full relative space-y-6">
      {/* Section Header - Clean Centered Headline */}
      <div className="w-full text-center py-4 sm:py-6 md:py-8">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-black tracking-tight leading-tight">
          What Makes Moncradle Different?
        </h2>
      </div>

      {/* ─── STICKY STACKING CARDS ON SCROLL (Little Spoon Deck of Cards Effect) ─── */}
      <div className="relative space-y-12 sm:space-y-20 pb-24">
        {STACK_CARDS.map((card, idx) => {
          const activeSlide = productSlideIdxs[card.id] || 0;
          const currentProduct = card.products[activeSlide] || card.products[0];
          const hasMultipleProducts = card.products.length > 1;
          
          // Progressive Sticky Top Offset
          const stickyTop = 20 + idx * 14;

          return (
            <div
              key={card.id}
              style={{ 
                top: `${stickyTop}px`,
                zIndex: idx + 10,
              }}
              className={`sticky w-full rounded-[28px] sm:rounded-[36px] ${card.bgColor} p-6 sm:p-10 md:p-12 shadow-[0_-8px_30px_rgba(0,0,0,0.08),0_20px_40px_rgba(0,0,0,0.08)] border border-black/10 overflow-hidden transition-all duration-300`}
            >
              {/* Top Row: Left Product Image + Right Content */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center mb-8 md:mb-10">
                
                {/* Left: Floating High-End Product Cutout */}
                <div className="lg:col-span-6 relative flex items-center justify-center min-h-[220px] sm:min-h-[280px] md:min-h-[340px]">
                  <div className="relative w-full h-64 sm:h-80 md:h-96 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeSlide}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.25 }}
                        className="relative w-full h-full flex items-center justify-center"
                      >
                        <Image
                          src={currentProduct.image}
                          alt={currentProduct.alt}
                          fill
                          sizes="(max-width: 1024px) 90vw, 45vw"
                          className="object-contain select-none pointer-events-none drop-shadow-md"
                          priority={idx === 0}
                        />
                      </motion.div>
                    </AnimatePresence>

                    {/* Right Arrow next to product image if multiple */}
                    {hasMultipleProducts && (
                      <button
                        onClick={() => nextProduct(card.id, card.products.length)}
                        className="absolute -right-2 sm:right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-black shadow-md flex items-center justify-center active:scale-90 transition-all z-20 cursor-pointer"
                        aria-label="Next product"
                      >
                        <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Right: Title, Subtitle and Solid Black CTA Button */}
                <div className="lg:col-span-6 flex flex-col justify-center items-start space-y-4 md:space-y-6">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-black tracking-tight leading-tight">
                        {card.title}
                      </h3>
                      {card.trademark && (
                        <span className="text-xs font-black text-black -mt-4">
                          {card.trademark}
                        </span>
                      )}
                    </div>

                    <p className="text-base sm:text-lg md:text-[19px] text-black font-medium leading-relaxed mt-3 max-w-xl">
                      {card.description}
                    </p>
                  </div>

                  <Link
                    href={card.buttonLink}
                    className="bg-black hover:bg-neutral-900 text-white px-8 sm:px-10 py-4 sm:py-4.5 rounded-lg text-xs sm:text-sm font-black uppercase tracking-wider shadow-sm hover:shadow-md active:scale-95 transition-all inline-block select-none"
                  >
                    {card.buttonText}
                  </Link>
                </div>

              </div>

              {/* Bottom Row: Full-Width Clean White Badges Strip (Little Spoon Style) */}
              <div className="w-full bg-white rounded-2xl md:rounded-[24px] py-6 sm:py-7 md:py-8 px-4 sm:px-6 md:px-8 shadow-xs border border-white/90">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-y-5 gap-x-2 sm:gap-x-4 md:gap-x-6 items-start justify-items-center">
                  {card.benefits.map((benefit, bIdx) => (
                    <div key={bIdx} className="flex flex-col items-center text-center group w-full max-w-[160px]">
                      {benefit.badgeType === "starburst" && (
                        <LittleSpoonStarburst>
                          {benefit.badgeContent}
                        </LittleSpoonStarburst>
                      )}
                      {benefit.badgeType === "fssai" && <FssaiSeal />}
                      {benefit.badgeType === "jaivik" && <JaivikSeal />}
                      {benefit.badgeType === "doctor" && <DoctorSeal />}
                      {benefit.badgeType === "award" && <LaurelAwardSeal />}

                      <div className="mt-2.5 text-center">
                        <p className="text-[10.5px] sm:text-[11.5px] md:text-[12px] font-black uppercase tracking-tight text-black leading-tight">
                          {benefit.title}
                        </p>
                        {benefit.subtitle && (
                          <p className="text-[10.5px] sm:text-[11.5px] md:text-[12px] font-black uppercase tracking-tight text-black leading-tight mt-0.5">
                            {benefit.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
}

export default WhatMakesUsDifferent;
