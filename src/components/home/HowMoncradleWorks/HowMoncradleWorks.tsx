"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface CarePillar {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  actionText: string;
  link: string;
}

const CARE_PILLARS: CarePillar[] = [
  {
    id: "growth",
    image: "/images/growth_hero_baby.png",
    title: "Growth & Milestones",
    subtitle: "WHO Percentile Curves",
    actionText: "Track Growth",
    link: "/growth"
  },
  {
    id: "kitchen",
    image: "/images/kitchen_hero.jpg",
    title: "Daily Fresh Meals",
    subtitle: "100% Organic Food",
    actionText: "Explore Meals",
    link: "/nutrition"
  },
  {
    id: "doctor",
    image: "/images/doctor_hero.jpg",
    title: "Pediatric Doctor Care",
    subtitle: "Clinic Checkups & Care",
    actionText: "Book Visit",
    link: "/doctor"
  },
  {
    id: "store",
    image: "/images/shop_hero.jpg",
    title: "Certified Essentials",
    subtitle: "100% BPA Free Silicone",
    actionText: "Shop Store",
    link: "/shop"
  }
];

export function HowMoncradleWorks() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] }
    }
  };

  return (
    <section className="w-full relative">
      <div className="bg-white rounded-2xl md:rounded-3xl p-3.5 sm:p-5 md:p-8 border border-slate-100 shadow-xs">
        
        {/* Clean Header */}
        <div className="flex items-center justify-between gap-3 mb-3.5 sm:mb-5 md:mb-6 px-0.5">
          <h2 className="text-base sm:text-xl md:text-2xl font-medium text-slate-900 tracking-tight">
            How Moncradle Cares for Your Baby
          </h2>
        </div>

        {/* 4 Full-Image Bleed Cards (2x2 Grid on Mobile, 4-Col on Desktop) */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5"
        >
          {CARE_PILLARS.map((pillar) => (
            <motion.div key={pillar.id} variants={itemVariants} className="w-full">
              <Link
                href={pillar.link}
                className="group relative flex flex-col justify-end h-56 sm:h-64 md:h-76 lg:h-84 w-full rounded-2xl md:rounded-3xl overflow-hidden isolate [transform:translateZ(0)] [mask-image:-webkit-radial-gradient(white,black)] shadow-2xs hover:shadow-2xl transition-all duration-500 p-3 sm:p-4 md:p-5 hover:-translate-y-1.5 cursor-pointer"
              >
                {/* Full-Card Background Image */}
                <Image
                  src={pillar.image}
                  alt={pillar.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover rounded-2xl md:rounded-3xl group-hover:scale-108 transition-transform duration-700 ease-out [transform:translateZ(0)]"
                  priority
                />

                {/* Smooth Dark Gradient Overlay for High Readability */}
                <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-t from-black/90 via-black/30 to-transparent group-hover:from-black/95 group-hover:via-black/40 transition-all duration-300 pointer-events-none" />

                {/* Bottom Content: Title, Subtitle & Modern Glass Pill Button */}
                <div className="relative z-10">
                  <h3 className="text-xs sm:text-base md:text-lg font-semibold text-white leading-tight drop-shadow-xs group-hover:text-purple-200 transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-[9px] sm:text-xs text-white/90 font-light mt-0.5 sm:mt-1 truncate drop-shadow-xs leading-normal">
                    {pillar.subtitle}
                  </p>

                  {/* Modern Glassmorphic Pill Action Button */}
                  <div className="mt-2 sm:mt-3 inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-[10px] sm:text-xs font-semibold shadow-sm border border-white/80 group-hover:bg-white group-hover:shadow-md group-hover:translate-x-0.5 transition-all">
                    <span>{pillar.actionText}</span>
                    <ChevronRight className="w-3 h-3 text-slate-700 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}

export default HowMoncradleWorks;
