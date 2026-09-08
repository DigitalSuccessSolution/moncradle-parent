import React, { forwardRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, BookOpen } from 'lucide-react';

export interface ArticleItem {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  coverImage?: string;
  content?: string;
  createdAt?: string | Date;
  tags?: string[];
}

export interface ArticleCardProps {
  article: ArticleItem;
  index?: number;
  delay?: number;
  compact?: boolean;
  className?: string;
}

const stripHtml = (html?: string, maxLength = 120): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '').substring(0, maxLength) + '...';
};

export const ArticleCard = forwardRef<HTMLAnchorElement, ArticleCardProps>(
  ({ article, index = 0, delay, compact = false, className = '' }, ref) => {
    const animDelay = delay !== undefined ? delay : (index % 9) * 0.05;

    return (
      <Link
        ref={ref}
        href={`/articles/${article.slug}`}
        className={`block h-full group ${className}`}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: animDelay }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-300 flex flex-col h-full cursor-pointer"
        >
          {/* Cover Image */}
          <div className={`w-full ${compact ? 'h-40' : 'h-48'} bg-gray-100 relative overflow-hidden shrink-0`}>
            {article.coverImage ? (
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50">
                <BookOpen className="w-8 h-8 mb-1 opacity-50" />
                <span className="text-[11px] font-semibold text-gray-400">Article</span>
              </div>
            )}
            {article.category && (
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 bg-white/95 backdrop-blur-sm text-[var(--color-primary)] text-xs font-semibold rounded-full shadow-sm">
                  {article.category}
                </span>
              </div>
            )}
          </div>

          {/* Content Body */}
          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
            <div>
              <h3 className={`${compact ? 'text-sm sm:text-[15px]' : 'text-base sm:text-lg'} font-medium text-gray-900 leading-snug mb-2 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2`}>
                {article.title}
              </h3>

              {article.content && (
                <p className="text-xs sm:text-sm text-gray-500 font-light line-clamp-2 mb-3 leading-relaxed">
                  {stripHtml(article.content, compact ? 90 : 130)}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50 text-xs">
              <div className="flex items-center text-gray-400 font-light gap-1">
                <Calendar className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                <span>
                  {new Date(article.createdAt || Date.now()).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <span className="text-[var(--color-primary)] text-xs font-semibold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                Read more <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }
);

ArticleCard.displayName = 'ArticleCard';
export default ArticleCard;
