import React from 'react';
import { Quote, ArrowRight } from 'lucide-react';
import { Article } from '../types/news';

interface OpinionSectionProps {
  opinions: Article[];
  onOpenArticle: (article: Article) => void;
}

export const OpinionSection: React.FC<OpinionSectionProps> = ({
  opinions,
  onOpenArticle,
}) => {
  if (opinions.length === 0) return null;

  return (
    <section className="mb-14 bg-slate-950 text-white rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl border border-slate-800">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-red-500 text-xs font-black uppercase tracking-widest mb-1">
            <Quote className="w-4 h-4" />
            <span>ARN Strategic Analysis</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight font-sans">
            Independent Aerospace & Geopolitical Perspectives
          </h3>
        </div>
        <p className="text-xs text-slate-400 max-w-sm hidden md:block">
          Rigorous analysis by Air Real News senior correspondents, defense fellows, and aviation legal analysts.
        </p>
      </div>

      {/* Grid of Opinions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {opinions.map((op) => (
          <div
            key={op.id}
            onClick={() => onOpenArticle(op)}
            className="flex flex-col justify-between group cursor-pointer bg-slate-900/60 hover:bg-slate-900 p-6 rounded-xl border border-slate-800 transition-all duration-300"
          >
            <div>
              {/* Author Row */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative">
                  <img
                    src={op.author.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
                    alt={op.author.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-red-600 p-0.5 shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-red-600 text-white p-1 rounded-full">
                    <Quote className="w-2.5 h-2.5" />
                  </div>
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-base group-hover:text-red-400 transition-colors">
                    {op.author.name}
                  </h4>
                  <p className="text-xs text-red-400 font-medium line-clamp-1">
                    {op.author.role}
                  </p>
                  {op.author.bureau && (
                    <p className="text-[11px] text-slate-400">{op.author.bureau}</p>
                  )}
                </div>
              </div>

              {/* Headline */}
              <h4 className="text-lg sm:text-xl font-bold leading-snug text-gray-100 group-hover:text-white mb-3 font-sans">
                {op.title}
              </h4>

              {/* Pull quote if available */}
              {op.pullQuote ? (
                <div className="border-l-2 border-red-600 pl-3 py-1 my-3 bg-slate-950/80 rounded-r text-xs sm:text-sm italic text-gray-300 leading-relaxed font-serif">
                  &ldquo;{op.pullQuote.text}&rdquo;
                </div>
              ) : (
                <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed mb-4">
                  {op.content[0]}
                </p>
              )}
            </div>

            {/* Read Article Trigger */}
            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-red-400 group-hover:text-red-300">
              <span className="font-semibold font-mono">{op.readTime}</span>
              <span className="flex items-center space-x-1 font-bold group-hover:translate-x-1 transition-transform">
                <span>Read Full Analysis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
