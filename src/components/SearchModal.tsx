import React, { useState, useMemo } from 'react';
import { Search, X, Clock, ArrowRight, Tag } from 'lucide-react';
import { Article } from '../types/news';

interface SearchModalProps {
  onClose: () => void;
  articles: Article[];
  onOpenArticle: (article: Article) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  onClose,
  articles,
  onOpenArticle,
}) => {
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');

  const popularTags = [
    'All', 
    'National',
    'Air & Aerospace', 
    'Defense & Security', 
    'World', 
    'Geopolitics', 
    'Climate & Tech', 
    'Economy', 
    'Investigation'
  ];

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesTag = selectedTag === 'All' || 
        article.category.toLowerCase() === selectedTag.toLowerCase() || 
        article.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase());

      if (!query.trim()) return matchesTag;

      const q = query.toLowerCase();
      const inTitle = article.title.toLowerCase().includes(q);
      const inSubtitle = article.subtitle?.toLowerCase().includes(q) ?? false;
      const inAuthor = article.author.name.toLowerCase().includes(q);
      const inContent = article.content.some(p => p.toLowerCase().includes(q));

      return matchesTag && (inTitle || inSubtitle || inAuthor || inContent);
    });
  }, [articles, query, selectedTag]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex justify-center items-start p-3 sm:p-6 pt-12 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-slate-800 flex flex-col max-h-[85vh]">
        
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-slate-800 flex items-center space-x-3 bg-gray-50 dark:bg-slate-950">
          <Search className="w-5 h-5 text-red-600 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search Air Real News dispatches, aviation telemetry, defense, topics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm sm:text-base text-gray-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white shrink-0 ml-2"
          >
            <span className="text-xs bg-gray-200 dark:bg-slate-800 px-2 py-1 rounded font-mono">ESC</span>
          </button>
        </div>

        {/* Filter Chips */}
        <div className="px-5 py-3 border-b border-gray-100 dark:border-slate-800 flex items-center space-x-2 overflow-x-auto no-scrollbar bg-white dark:bg-slate-900">
          <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          {popularTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                selectedTag === tag
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
            Dispatches Found: {filteredArticles.length}
          </div>

          {filteredArticles.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30 text-red-600" />
              <p className="font-semibold text-sm">No stories found matching &ldquo;{query}&rdquo;</p>
              <p className="text-xs mt-1">Try another keyword or select a broader category beat.</p>
            </div>
          ) : (
            filteredArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => {
                  onOpenArticle(article);
                  onClose();
                }}
                className="flex items-start space-x-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors border border-transparent hover:border-gray-200 dark:hover:border-slate-700 group"
              >
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover shrink-0 bg-slate-800"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 mb-1 font-mono">
                    <span className="font-extrabold uppercase text-red-600">{article.category}</span>
                    <span>&bull;</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{article.publishedAt}</span>
                    </span>
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h4>
                  {article.subtitle && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                      {article.subtitle}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>By {article.author.name}</span>
                    <span className="text-red-600 font-bold flex items-center group-hover:translate-x-1 transition-transform">
                      Read dispatch <ArrowRight className="w-3 h-3 ml-1" />
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
