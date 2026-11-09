import React from 'react';
import { 
  Bookmark, 
  Share2, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  FileText
} from 'lucide-react';
import { Article, LiveUpdate } from '../types/news';
import { LiveUpdatesWidget } from './LiveUpdatesWidget';

interface HeroSectionProps {
  leadArticle: Article;
  liveUpdates: LiveUpdate[];
  onOpenArticle: (article: Article) => void;
  onOpenCMS: () => void;
  onToggleBookmark: (articleId: string) => void;
  isBookmarked: boolean;
  onSyncLiveWire?: () => void;
  isSyncingWire?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  leadArticle,
  liveUpdates,
  onOpenArticle,
  onOpenCMS,
  onToggleBookmark,
  isBookmarked,
  onSyncLiveWire,
  isSyncingWire,
}) => {
  return (
    <section className="mb-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Main Lead Feature (BBC-Style Clean News Feature) - 8 cols */}
        <div className="lg:col-span-8 group">
          <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            
            {/* Lead Image & Category Banner */}
            <div 
              className="relative aspect-[16/9] w-full overflow-hidden bg-slate-800 cursor-pointer"
              onClick={() => onOpenArticle(leadArticle)}
            >
              <img
                src={leadArticle.imageUrl}
                alt={leadArticle.title}
                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

              {/* Badges on image */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2 items-center">
                <span className="bg-red-600 text-white font-black uppercase text-xs px-3 py-1 rounded shadow-md tracking-wider">
                  {leadArticle.category}
                </span>
                <span className="bg-slate-950/90 text-white font-extrabold uppercase text-xs px-3 py-1 rounded shadow-md tracking-wider flex items-center space-x-1.5 border border-slate-700">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  <span>ARN STAFF LEAD</span>
                </span>
              </div>

              {/* Photo Caption Overlay */}
              {leadArticle.imageCaption && (
                <div className="absolute bottom-3 left-4 right-4 text-gray-300 text-[11px] italic bg-black/60 backdrop-blur-sm p-1.5 rounded line-clamp-1">
                  Photo: {leadArticle.imageCaption}
                </div>
              )}
            </div>

            {/* Article Editorial Details */}
            <div className="p-5 sm:p-7">
              {/* Author & Read Time Meta */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
                <div className="flex items-center space-x-2.5">
                  {leadArticle.author.avatar && (
                    <img
                      src={leadArticle.author.avatar}
                      alt={leadArticle.author.name}
                      className="w-7 h-7 rounded-full object-cover border border-red-600"
                    />
                  )}
                  <div>
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      {leadArticle.author.name}
                    </span>
                    {leadArticle.author.bureau && (
                      <span className="text-slate-400 font-medium"> &bull; {leadArticle.author.bureau}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-[11px]">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{leadArticle.publishedAt}</span>
                  </span>
                  <span>&bull;</span>
                  <span className="font-semibold text-slate-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">
                    {leadArticle.readTime}
                  </span>
                </div>
              </div>

              {/* Headline */}
              <h2
                onClick={() => onOpenArticle(leadArticle)}
                className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white leading-[1.18] cursor-pointer hover:text-red-600 transition-colors tracking-tight mb-3 font-sans"
              >
                {leadArticle.title}
              </h2>

              {/* Subhead */}
              {leadArticle.subtitle && (
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-5 font-normal">
                  {leadArticle.subtitle}
                </p>
              )}

              {/* Key Developments Box */}
              {leadArticle.keyTakeaways && leadArticle.keyTakeaways.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800/60 border-l-4 border-red-600 p-4 rounded-r-lg mb-6">
                  <h4 className="text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400 mb-2.5 flex items-center space-x-1.5 font-mono">
                    <CheckCircle2 className="w-4 h-4 text-red-600" />
                    <span>Key Developments Verified by ARN</span>
                  </h4>
                  <ul className="space-y-2">
                    {leadArticle.keyTakeaways.map((point, index) => (
                      <li key={index} className="flex items-start text-xs sm:text-sm text-gray-700 dark:text-gray-200">
                        <span className="text-red-600 font-bold mr-2 text-base leading-none">&bull;</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  onClick={() => onOpenArticle(leadArticle)}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
                >
                  <FileText className="w-4 h-4" />
                  <span>Read Full In-Depth Coverage</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onToggleBookmark(leadArticle.id)}
                    className={`p-2 rounded-lg border transition-colors ${
                      isBookmarked
                        ? 'bg-red-50 dark:bg-red-950/60 border-red-600 text-red-600'
                        : 'border-gray-200 dark:border-slate-700 text-gray-500 hover:text-red-600 hover:border-red-600'
                    }`}
                    title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Article'}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-red-600' : ''}`} />
                  </button>

                  <button
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.href);
                      }
                    }}
                    className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-500 hover:text-red-600 hover:border-red-600 transition-colors"
                    title="Share Article (Link copied)"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Continuous Live Desk - 4 cols */}
        <div className="lg:col-span-4 h-full">
          <LiveUpdatesWidget
            updates={liveUpdates}
            onOpenCMS={onOpenCMS}
            onSyncLiveWire={onSyncLiveWire}
            isSyncingWire={isSyncingWire}
          />
        </div>

      </div>
    </section>
  );
};
