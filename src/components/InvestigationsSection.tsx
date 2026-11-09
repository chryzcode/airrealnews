import React from 'react';
import { ShieldCheck, ArrowRight, Clock } from 'lucide-react';
import { Article } from '../types/news';

interface InvestigationsSectionProps {
  articles: Article[];
  onOpenArticle: (article: Article) => void;
}

export const InvestigationsSection: React.FC<InvestigationsSectionProps> = ({
  articles,
  onOpenArticle,
}) => {
  if (articles.length === 0) return null;

  const mainInvestigation = articles[0];

  return (
    <section className="mb-14">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-red-600 pb-2 mb-6">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-red-600" />
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white font-sans">
            Special Investigations & Intelligence Bureau
          </h3>
        </div>
        <span className="text-xs font-mono font-bold text-red-600 uppercase tracking-wider hidden sm:inline">
          Forensic Data Journalism
        </span>
      </div>

      {/* Main Feature Container */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          
          {/* Investigative Imagery - 7 cols */}
          <div
            className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto lg:h-[420px] bg-black cursor-pointer overflow-hidden group"
            onClick={() => onOpenArticle(mainInvestigation)}
          >
            <img
              src={mainInvestigation.imageUrl}
              alt={mainInvestigation.title}
              className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            
            <div className="absolute top-4 left-4">
              <span className="bg-red-600 text-white text-xs font-black uppercase px-3 py-1 rounded shadow-md tracking-wider">
                ARN VERIFIED INVESTIGATION
              </span>
            </div>

            {mainInvestigation.imageCaption && (
              <div className="absolute bottom-3 left-4 right-4 text-xs text-gray-300 italic">
                {mainInvestigation.imageCaption}
              </div>
            )}
          </div>

          {/* Editorial Findings & Story - 5 cols */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-2 font-mono">
                <Clock className="w-3.5 h-3.5 text-red-600" />
                <span>{mainInvestigation.publishedAt}</span>
                <span>&bull;</span>
                <span className="font-semibold text-red-600">{mainInvestigation.readTime}</span>
              </div>

              <h4
                onClick={() => onOpenArticle(mainInvestigation)}
                className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight cursor-pointer hover:text-red-600 transition-colors mb-3 font-sans"
              >
                {mainInvestigation.title}
              </h4>

              {mainInvestigation.subtitle && (
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  {mainInvestigation.subtitle}
                </p>
              )}

              {/* Forensic Key Findings */}
              {mainInvestigation.keyTakeaways && (
                <div className="bg-white dark:bg-slate-800/80 p-3.5 rounded-lg border border-gray-200 dark:border-slate-700 space-y-2 mb-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-600">
                    Forensic Disclosures:
                  </span>
                  {mainInvestigation.keyTakeaways.slice(0, 2).map((takeaway, idx) => (
                    <div key={idx} className="flex items-start text-xs text-gray-700 dark:text-gray-300">
                      <span className="text-red-600 font-bold mr-1.5">&bull;</span>
                      <span>{takeaway}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                By {mainInvestigation.author.name} ({mainInvestigation.author.bureau})
              </span>
              <button
                onClick={() => onOpenArticle(mainInvestigation)}
                className="flex items-center space-x-1.5 text-xs font-bold text-red-600 hover:underline"
              >
                <span>Read Full Investigation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
