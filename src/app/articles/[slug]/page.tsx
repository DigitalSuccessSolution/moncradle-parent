"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, Calendar, Tag, Share2 } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import Link from 'next/link';

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await apiClient.get(`/articles/slug/${params.slug}`);
        if (res.data.success) {
          setArticle(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch article:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchArticle();
    }
  }, [params.slug]);

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title || 'Moncradle Article',
          text: 'Check out this article on Moncradle!',
          url: window.location.href,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      } finally {
        setIsSharing(false);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy link:', err);
      } finally {
        setIsSharing(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-semibold animate-pulse">Loading article...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Article Not Found</h2>
        <p className="text-gray-500 mb-6 text-center">The article you are looking for might have been removed or is temporarily unavailable.</p>
        <button 
          onClick={() => router.push('/articles')}
          className="px-6 py-3 bg-primary text-white rounded-full font-medium shadow-sm hover:bg-primary-light transition-colors"
        >
          Back to Blog
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-24 md:pb-0 relative">
      <main className="max-w-[1200px] mx-auto px-0 md:px-8 py-0 md:py-8 space-y-6">
        
        {/* Mobile Back Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-40 bg-[var(--color-background)] shadow-sm">
          <div className="flex items-center gap-2">
            <button onClick={() => router.push('/articles')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
              <ChevronLeft className="w-6 h-6 text-gray-800" strokeWidth={2} />
            </button>
            <h1 className="text-[17px] font-medium text-gray-900 ml-1 truncate max-w-[200px]">{article.title}</h1>
          </div>
          <button onClick={handleShare} className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        <div className="pb-8 max-w-4xl mx-auto w-full">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-between mb-4 mt-2">
            <button
              onClick={() => router.push('/articles')}
              className="flex items-center gap-1 px-3 py-2 rounded-full text-gray-700 hover:bg-gray-100 hover:text-[var(--color-primary)] transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
              <span className="font-semibold text-[15px]">Back to Articles</span>
            </button>
            <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>

          {/* Hero Image */}
          {article.coverImage && (
        <div className="w-full h-64 md:h-96 relative bg-gray-100 md:rounded-3xl overflow-hidden">
          <img 
            src={article.coverImage} 
            alt={article.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          <div className="absolute bottom-6 left-6 md:left-10">
            <span className="px-4 py-1.5 bg-[#A594F9] text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-sm">
              {article.category}
            </span>
          </div>
        </div>
      )}

      {/* Content Container */}
      <div className="px-4 md:px-0 py-8">
        {!article.coverImage && (
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full mb-4 inline-block">
            {article.category}
          </span>
        )}
        
        <h1 className="text-3xl md:text-4xl font-bold text-[#0F172A] leading-tight mb-4">
          {article.title}
        </h1>

        {/* Meta Info */}
        <div className="flex items-center text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100/60">
          <div className="flex items-center gap-1.5 border-l-2 border-gray-200 pl-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="font-medium">
              {new Date(article.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Prose Content using Tailwind Typography */}
        <article 
          className="prose prose-blue max-w-none text-gray-700
                     prose-headings:text-[#0F172A] prose-headings:font-bold
                     prose-h1:mb-4 prose-h2:mt-8 prose-h2:mb-3 prose-h3:mt-6 prose-h3:mb-2
                     prose-p:mt-0 prose-p:mb-5 prose-p:leading-relaxed
                     prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                     prose-img:rounded-xl prose-img:shadow-sm"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-100">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
        </div>
        </div>
      </main>
    </div>
  );
}
