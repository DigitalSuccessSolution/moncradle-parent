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
      <div className="flex items-center justify-between mb-6 md:mb-8 gap-2">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-black leading-tight">Parenting Tips & Articles</h2>
          <p className="text-sm text-gray-500 mt-2 hidden md:block font-light">Expert advice and insights for your parenting journey.</p>
        </div>
        <Link href="/articles" className="text-[11px] md:text-sm font-semibold md:font-medium text-[var(--color-primary)] flex items-center gap-1 group shrink-0 whitespace-nowrap">
          <span className="relative pb-0.5">
            View All
            <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[var(--color-primary)] origin-left scale-x-0 group-hover:scale-x-100 group-active:scale-x-0 transition-transform duration-300 ease-out rounded-full"></span>
          </span>
          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="flex overflow-x-auto items-stretch snap-x snap-mandatory gap-4 pb-4 px-4 -mx-4 md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-2 xl:grid-cols-4 md:gap-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {displayArticles.map((article, i) => {
          const readTime = Math.max(2, Math.ceil((article.content?.length || 0) / 800));
          const date = new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          
          return (
            <Link key={article._id || i} href={`/articles/${article.slug}`} className="group cursor-pointer w-[60vw] min-w-[60vw] snap-center sm:w-full sm:min-w-full md:w-auto md:min-w-0 shrink-0 bg-white rounded-lg border border-gray-200 flex flex-col overflow-hidden hover:border-[var(--color-primary)] transition-colors duration-300">
              {/* Image Container */}
              <div className="w-full h-[160px] md:h-[180px] bg-[#F8FAFC] relative border-b border-gray-100 overflow-hidden">
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 text-[10px] font-semibold text-black z-10 uppercase tracking-widest shadow-sm rounded-md">
                  {article.category || "General"}
                </span>
                {article.coverImage ? (
                  <img src={article.coverImage} alt={article.title} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out" />
                ) : (
                  <Image src="/images/hero_baby.png" alt="Fallback" fill className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                )}
              </div>

              {/* Content Container */}
              <div className="p-3 md:p-4 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2 mt-1">
                  <p className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{date}</p>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <p className="text-[10px] md:text-[11px] font-semibold text-[var(--color-primary)] uppercase tracking-wide">{readTime} MIN READ</p>
                </div>
                <h4 className="text-sm md:text-base font-semibold text-black leading-snug group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                  {article.title}
                </h4>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
