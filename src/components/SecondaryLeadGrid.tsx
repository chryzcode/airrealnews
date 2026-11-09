import React from 'react';
import { Clock, Bookmark, ArrowUpRight } from 'lucide-react';
import { Article } from '../types/news';

interface SecondaryLeadGridProps {
  articles: Article[];
  onOpenArticle: (article: Article) => void;
  onToggleBookmark: (articleId: string) => void;
  bookmarkedIds: Set<string>;
}

export const SecondaryLeadGrid: React.FC<SecondaryLeadGridProps> = ({
  articles,
  onOpenArticle,
  onToggleBookmark,
  bookmarkedIds,
}) => {
  if (articles.length === 0) return null;

  return (
    <section className="mb-12">
      {/* BBC-style Section Header */}
      <div className="flex items-center justify-between border-b-2 border-red-600 pb-2 mb-6">
        <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
          <span className="w-2.5 h-6 bg-red-600 inline-block mr-1"></span>
          <span>Primary Global Dispatches</span>
        </h3>
        <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
          ARN Newsroom Verified
        </span>
      </div>

      {/* Grid of 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => {
          const isSaved = bookmarkedIds.has(article.id);
          return (
            <article
              key={article.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
            >
              {/* Thumbnail */}
              <div
                className="relative aspect-[16/10] overflow-hidden bg-slate-800 cursor-pointer"
                onClick={() => onOpenArticle(article)}
              >
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-slate-950/90 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow border border-slate-700">
                    {article.category}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Meta */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                    <span className="flex items-center space-x-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{article.publishedAt}</span>
                    </span>
                    <span className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">
                      {article.readTime}
                    </span>
                  </div>

                  {/* Headline */}
                  <h4
                    onClick={() => onOpenArticle(article)}
                    className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-snug group-hover:text-red-600 transition-colors cursor-pointer mb-2.5 font-sans"
                  >
                    {article.title}
                  </h4>

                  {/* Subtitle / Snippet */}
                  {article.subtitle && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed mb-4">
                      {article.subtitle}
                    </p>
                  )}
                </div>

                {/* Footer with author & bookmark */}
                <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs mt-2">
                  <div className="flex items-center space-x-2">
                    {article.author.avatar && (
                      <img
                        src={article.author.avatar}
                        alt={article.author.name}
                        className="w-6 h-6 rounded-full object-cover border border-red-600"
                      />
                    )}
                    <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] line-clamp-1">
                      {article.author.name}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onToggleBookmark(article.id)}
                      className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${
                        isSaved ? 'text-red-600' : 'text-slate-400 hover:text-slate-600'
                      }`}
                      title={isSaved ? 'Remove Bookmark' : 'Save Article'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-red-600' : ''}`} />
                    </button>
                    <button
                      onClick={() => onOpenArticle(article)}
                      className="text-red-600 hover:translate-x-0.5 transition-transform p-1"
                      title="Read article"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
