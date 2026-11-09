import React from 'react';
import { Flame, MessageSquare } from 'lucide-react';
import { Article } from '../types/news';

interface TrendingSidebarProps {
  articles: Article[];
  onOpenArticle: (article: Article) => void;
}

export const TrendingSidebar: React.FC<TrendingSidebarProps> = ({
  articles,
  onOpenArticle,
}) => {
  if (articles.length === 0) return null;
  return (
    <aside className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 shadow-sm">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3 mb-4">
        <h4 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center space-x-2 font-sans">
          <Flame className="w-4 h-4 text-red-600 fill-red-600" />
          <span>Most Read Worldwide</span>
        </h4>
        <span className="text-[10px] font-mono font-bold text-red-600 uppercase tracking-wider bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded">
          LIVE METRICS
        </span>
      </div>

      {/* Numbered List */}
      <div className="divide-y divide-gray-100 dark:divide-slate-800">
        {articles.map((item, idx) => {
          const rank = idx + 1;
          const formattedRank = rank < 10 ? `0${rank}` : `${rank}`;
          return (
            <div
              key={item.id}
              onClick={() => onOpenArticle(item)}
              className="py-3.5 first:pt-0 last:pb-0 flex items-start space-x-3.5 group cursor-pointer"
            >
              {/* BBC-style bold ranking number */}
              <span className="font-mono font-black text-2xl sm:text-3xl text-slate-300 dark:text-slate-700 group-hover:text-red-600 transition-colors leading-none shrink-0 w-8">
                {formattedRank}
              </span>

              {/* Title & Info */}
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-black uppercase text-red-600 tracking-wider">
                  {item.category}
                </span>
                <h5 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100 group-hover:text-red-600 transition-colors leading-snug line-clamp-2 mt-0.5 font-sans">
                  {item.title}
                </h5>
                <div className="flex items-center space-x-3 text-[10px] text-slate-400 mt-1.5 font-mono">
                  <span>{item.readTime}</span>
                  <span>&bull;</span>
                  <span className="flex items-center space-x-1">
                    <MessageSquare className="w-3 h-3 text-slate-400" />
                    <span>{item.commentsCount}</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
