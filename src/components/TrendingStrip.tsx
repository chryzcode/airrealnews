import React from 'react';
import { Flame, TrendingUp, Clock, MessageSquare, ArrowRight } from 'lucide-react';
import { Article } from '../types/news';

interface TrendingStripProps {
  articles: Article[];
  onOpenArticle: (article: Article) => void;
  onViewAllTrending?: () => void;
}

export const TrendingStrip: React.FC<TrendingStripProps> = ({
  articles,
  onOpenArticle,
  onViewAllTrending,
}) => {
  if (!articles || articles.length === 0) return null;

  const topTrending = articles.slice(0, 5);

  return (
    <section className="mb-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3 mb-5">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-sm">
            <Flame className="w-4 h-4 fill-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white font-sans">
                Trending Worldwide
              </h3>
              <span className="bg-red-500/10 text-red-600 border border-red-500/20 text-[10px] font-black uppercase px-2 py-0.5 rounded font-mono">
                TOP STORIES TODAY
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans hidden sm:block">
              Most read news and dispatches across Air Real News global audience
            </p>
          </div>
        </div>

        {onViewAllTrending && (
          <button
            onClick={onViewAllTrending}
            className="text-xs font-bold font-mono text-red-600 hover:text-red-700 flex items-center space-x-1"
          >
            <span>See All Rankings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 5-Column Responsive Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {topTrending.map((art, idx) => {
          const rank = `0${idx + 1}`;
          return (
            <div
              key={art.id}
              onClick={() => onOpenArticle(art)}
              className="group cursor-pointer flex flex-col justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-red-50/40 dark:hover:bg-slate-800 border border-transparent hover:border-red-200 dark:hover:border-red-900/40 transition-all duration-200"
            >
              <div>
                {/* Ranking & Category */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xl sm:text-2xl font-black text-slate-300 dark:text-slate-700 group-hover:text-red-600 transition-colors leading-none">
                    {rank}
                  </span>
                  <span className="text-[9px] font-black uppercase text-red-600 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-1.5 py-0.5 rounded">
                    {art.category}
                  </span>
                </div>

                {/* Thumbnail */}
                <div className="aspect-[16/10] rounded-lg overflow-hidden mb-2.5 bg-slate-800">
                  <img
                    src={art.imageUrl}
                    alt={art.title}
                    className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Title */}
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-red-600 transition-colors line-clamp-2 leading-snug font-sans">
                  {art.title}
                </h4>
              </div>

              {/* Meta */}
              <div className="mt-3 pt-2 border-t border-gray-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-red-600" />
                  <span>{art.readTime}</span>
                </span>
                <span className="text-slate-500 font-sans font-medium truncate max-w-[80px]">
                  {art.author?.name || 'ARN Desk'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

