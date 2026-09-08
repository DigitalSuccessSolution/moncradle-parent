"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      num: 1,
      title: "Choose Baby's Plan",
      description: "Pick an age-tailored plan & custom organic baby meals.",
    },
    {
      num: 2,
      title: "Freshly Cooked & Delivered",
      description: "Prepared daily in our pediatric kitchen & delivered to your door.",
    },
    {
      num: 3,
      title: "They Enjoy, You Relax",
      description: "Edit meals, skip dates, or pause shipments anytime from the app.",
    },
  ];

  return (
    <section className="w-full relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-7 items-stretch">
        
        {/* Left Column: Delivery Box Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="lg:col-span-7 relative min-h-[260px] sm:min-h-[360px] lg:min-h-[440px] rounded-3xl overflow-hidden shadow-sm border border-slate-100/60 bg-gray-50"
        >
          <Image
            src="/images/how_it_works_box.jpg"
            alt="Moncradle Subscription Delivery Box on Doorstep"
            fill
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-cover"
            priority
          />
        </motion.div>

        {/* Right Column: How it Works Steps Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="lg:col-span-5 bg-[#FAF7F0] rounded-3xl p-6 sm:p-8 lg:p-10 flex flex-col justify-between border border-[#EFEADF] shadow-xs"
        >
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-6 sm:mb-8">
              How it Works
            </h2>

            <div className="space-y-6 sm:space-y-7">
              {steps.map((step) => (
                <div key={step.num} className="flex items-start gap-4 sm:gap-5 group">
                  {/* Vibrant Turquoise Stylized Number */}
                  <div className="relative shrink-0 flex items-center justify-center">
                    <span 
                      className="text-3xl sm:text-4xl font-black text-[#00D2D3] tracking-tighter select-none font-sans"
                      style={{
                        WebkitTextStroke: "1.5px #00B4B6",
                        filter: "drop-shadow(0 1px 2px rgba(0, 210, 211, 0.25))"
                      }}
                    >
                      {step.num}
                    </span>
                  </div>

                  {/* Step Content */}
                  <div className="pt-0.5">
                    <h3 className="text-base sm:text-[17px] font-bold text-[#0F172A] leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Footer */}
          <div className="mt-8 flex items-center justify-between gap-4 flex-wrap">
            <Link
              href="/subscriptions/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--color-primary)] text-white text-xs sm:text-sm font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <span className="text-[11px] sm:text-xs text-gray-500 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Skip or pause shipments anytime
            </span>
          </div>

        </motion.div>

      </div>
    </section>
  );
}

export default HowItWorks;
