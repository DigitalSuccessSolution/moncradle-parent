"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { apiClient } from "@/lib/apiClient";

export function Articles() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestArticles = async () => {
      try {
        // Fetch 4 latest articles
        const res = await apiClient.get('/articles?limit=4&sort=-createdAt');
        if (res.data.success) {
          setArticles(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch articles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestArticles();
  }, []);

  // Show a loading skeleton or nothing while fetching
  if (loading && articles.length === 0) {
    return (
      <section>
        <div className="flex items-center justify-between mb-6 md:mb-8 gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-black leading-tight">Parenting Tips & Articles</h2>
            <p className="text-sm text-gray-500 mt-2 hidden md:block font-light">Expert advice and insights for your parenting journey.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="w-full h-[240px] bg-gray-100 animate-pulse rounded-lg border border-gray-200"></div>
          ))}
        </div>
      </section>
    );
  }

  // Fallback to static if no articles returned
  const displayArticles = articles.length > 0 ? articles : [];

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-5 md:mb-6 gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-2xl md:text-3xl font-normal text-black tracking-tight leading-snug truncate sm:overflow-visible">
            Parenting <span className="text-[var(--color-primary)]">Tips &amp; Guides</span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-500 font-light mt-0.5 hidden md:block">
            Pediatrician-backed advice and insights for your parenting journey.
          </p>
        </div>
        <Link href="/articles" className="text-xs md:text-sm font-medium text-[var(--color-primary)] flex items-center gap-0.5 group shrink-0 whitespace-nowrap">
          <span className="relative pb-0.5">
            View All
            <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[var(--color-primary)] origin-left scale-x-0 group-hover:scale-x-100 group-active:scale-x-0 transition-transform duration-300 ease-out rounded-full"></span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="flex overflow-x-auto items-stretch snap-x snap-mandatory gap-4 pb-4 px-4 -mx-4 md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-2 xl:grid-cols-4 md:gap-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {displayArticles.map((article, i) => {
          const readTime = Math.max(2, Math.ceil((article.content?.length || 0) / 800));
          const date = new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

          return (
            <Link 
              key={article._id || i} 
              href={`/articles/${article.slug}`} 
              className="group cursor-pointer w-[65vw] min-w-[65vw] snap-center sm:w-full sm:min-w-full md:w-auto md:min-w-0 shrink-0 bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md flex flex-col overflow-hidden transition-all duration-300"
            >
              {/* Image Container */}
              <div className="w-full h-[150px] sm:h-[160px] md:h-[180px] bg-slate-50 relative overflow-hidden">
                <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-normal text-black z-10 uppercase tracking-wider shadow-2xs rounded-full border border-slate-100">
                  {article.category || "General"}
                </span>
                {article.coverImage ? (
                  <img src={article.coverImage} alt={article.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out" />
                ) : (
                  <Image src="/images/hero_baby.png" alt="Fallback" fill className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Content Container */}
              <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <p className="text-[10px] sm:text-[11px] font-light text-gray-400 uppercase tracking-wider">{date}</p>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <p className="text-[10px] sm:text-[11px] font-medium text-[var(--color-primary)] uppercase tracking-wider">{readTime} MIN READ</p>
                  </div>
                  <h4 className="text-xs sm:text-sm md:text-base font-normal text-black leading-snug group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                    {article.title}
                  </h4>
                </div>

                <div className="flex items-center text-xs font-semibold text-[var(--color-primary)] pt-1">
                  <span>Read Article</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
