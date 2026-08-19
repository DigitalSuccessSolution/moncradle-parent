"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Calendar, ChevronRight, ChevronLeft, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';

export default function ArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const limit = 9;
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(val);
      setPage(1);
      setArticles([]);
    }, 500);
  };

  const fetchArticles = useCallback(async () => {
    try {
      if (page === 1) setLoading(true);
      else setIsFetchingMore(true);

      const queryParams = new URLSearchParams();
      // Only append search if it exists, otherwise activeCategory if not 'All'
      const query = searchQuery || (activeCategory !== 'All' ? activeCategory : '');
      if (query) queryParams.append('search', query);
      
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());

      const res = await apiClient.get(`/articles?${queryParams.toString()}`);
      
      if (res.data.success) {
        if (page === 1) {
          setArticles(res.data.data);
        } else {
          setArticles(prev => [...prev, ...res.data.data]);
        }
        
        if (res.data.data.length < limit) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  }, [searchQuery, activeCategory, page]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setPage(1);
    setArticles([]);
  };

  const observer = useRef<IntersectionObserver | null>(null);
  const lastArticleElementRef = useCallback((node: HTMLAnchorElement | null) => {
    if (loading || isFetchingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, isFetchingMore, hasMore]);

  const categories = ['All', 'Nutrition', 'Health & Wellness', 'Parenting Tips', 'Milestones'];

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-24 md:pb-0 relative">
      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 md:py-8 space-y-6">
        {/* Mobile Back Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 -mx-4 -mt-4 sticky top-0 z-40 bg-[var(--color-background)]">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
              <ChevronLeft className="w-6 h-6 text-gray-800" strokeWidth={2} />
            </button>
            <h1 className="text-[17px] font-medium text-gray-900 ml-1">Articles</h1>
          </div>
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
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Articles</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Expert advice and parenting tips.</p>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-start gap-6"
        >
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64 lg:w-80">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                onChange={handleSearchChange}
                className="pl-10 pr-4 h-11 bg-white border border-gray-200 rounded-full text-sm font-medium outline-none focus:border-[var(--color-primary)] transition-colors w-full shadow-sm"
              />
            </div>
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-20 mt-2"
        >
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeCategory === category
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Article List */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center items-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
              <p className="text-gray-500 font-semibold animate-pulse">Loading articles...</p>
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400 font-medium text-lg">
            No articles found in this category.
          </div>
        ) : (
          <>
            {articles.map((article, index) => {
              const isLast = index === articles.length - 1;
              return (
                <Link 
                  ref={isLast ? lastArticleElementRef : null}
                  key={article._id} 
                  href={`/articles/${article.slug}`}
                  className="block h-full"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (index % limit) * 0.05 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full cursor-pointer group"
                  >
                <div className="w-full h-48 bg-gray-200 relative overflow-hidden shrink-0">
                  {article.coverImage ? (
                    <img 
                      src={article.coverImage} 
                      alt={article.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[var(--color-primary)] text-xs font-semibold rounded-full shadow-sm">
                      {article.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  
                  {/* Extract text snippet from HTML content */}
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4" 
                    dangerouslySetInnerHTML={{ __html: article.content.substring(0, 150) + '...' }}>
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center text-xs text-gray-500 gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(article.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    
                    <span className="text-[var(--color-secondary)] text-sm font-medium flex items-center">
                      Read more <ChevronRight className="w-4 h-4 ml-1" />
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
              );
            })}
          </>
        )}
        </div>

        {/* Infinite Scroll Loading Indicator */}
        {isFetchingMore && (
          <div className="py-6 flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
          </div>
        )}
      </main>
    </div>
  );
}
