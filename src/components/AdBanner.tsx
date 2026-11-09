import React from 'react';
import { ExternalLink, Info, Sparkles, Megaphone } from 'lucide-react';
import { AdCampaign } from '../types/news';

interface AdBannerProps {
  campaign?: AdCampaign;
  placement: 'top-billboard' | 'sidebar' | 'in-feed';
  onAdClick?: (campaignId: string) => void;
  onOpenAdCMS?: () => void;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  campaign,
  placement,
  onAdClick,
  onOpenAdCMS,
}) => {
  const handleClick = () => {
    if (campaign) {
      if (onAdClick) onAdClick(campaign.id);
      window.open(campaign.targetUrl, '_blank', 'noopener,noreferrer');
    } else if (onOpenAdCMS) {
      onOpenAdCMS();
    }
  };

  // If no campaign is active, display professional ARN Corporate Advertising Slot
  if (!campaign || !campaign.active) {
    if (placement === 'top-billboard') {
      return (
        <div className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 my-3 text-center flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="bg-slate-200 dark:bg-slate-800 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
              ADVERTISEMENT
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Partner with Air Real News — Reach 2.4M Aerospace, Defense & Geopolitical Decision Makers
            </span>
          </div>
          {onOpenAdCMS && (
            <button
              onClick={onOpenAdCMS}
              className="font-bold text-arn-red hover:underline flex items-center space-x-1"
            >
              <span>Manage Ads</span>
              <Megaphone className="w-3 h-3 ml-1" />
            </button>
          )}
        </div>
      );
    }
    return null;
  }

  // Top Billboard Style
  if (placement === 'top-billboard') {
    return (
      <div className="w-full bg-slate-950 text-white rounded-xl overflow-hidden border border-slate-800 shadow-md my-4 relative group cursor-pointer" onClick={handleClick}>
        <div className="flex flex-col sm:flex-row items-center justify-between p-3 sm:p-4 gap-4">
          <div className="flex items-center space-x-3.5 flex-1">
            <img
              src={campaign.imageUrl}
              alt={campaign.clientName}
              className="w-16 h-12 sm:w-20 sm:h-14 rounded-lg object-cover border border-slate-700 shrink-0"
            />
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="bg-red-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider">
                  {campaign.badgeText || 'SPONSORED'}
                </span>
                <span className="text-xs text-slate-400 font-bold">{campaign.clientName}</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-100 group-hover:text-red-400 transition-colors line-clamp-1">
                {campaign.title}
              </h4>
              <p className="text-[11px] text-slate-400 line-clamp-1">
                {campaign.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <span className="hidden md:inline text-[11px] text-slate-400">Click to learn more</span>
            <div className="bg-red-600 group-hover:bg-red-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center space-x-1 transition-colors">
              <span>Visit Sponsor</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sidebar Ad Style
  if (placement === 'sidebar') {
    return (
      <div 
        onClick={handleClick}
        className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm group cursor-pointer my-4 p-4 text-white hover:border-red-600/50 transition-all"
      >
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2 font-mono">
          <span className="bg-slate-800 text-red-400 font-bold px-1.5 py-0.5 rounded">
            {campaign.badgeText || 'PARTNER PROMOTION'}
          </span>
          <span className="text-slate-500">ADVERTISEMENT</span>
        </div>

        <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-3">
          <img
            src={campaign.imageUrl}
            alt={campaign.clientName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        <h5 className="font-bold text-sm text-gray-100 group-hover:text-red-400 transition-colors leading-snug mb-1">
          {campaign.title}
        </h5>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
          {campaign.tagline}
        </p>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <span className="font-semibold text-slate-400 text-[11px]">{campaign.clientName}</span>
          <span className="text-red-400 font-bold flex items-center group-hover:translate-x-1 transition-transform">
            <span>Explore</span>
            <ExternalLink className="w-3 h-3 ml-1" />
          </span>
        </div>
      </div>
    );
  }

  // In-Feed Native Style
  return (
    <div
      onClick={handleClick}
      className="bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-xl border border-red-900/40 p-4 sm:p-5 my-6 flex flex-col sm:flex-row items-center gap-4 cursor-pointer group hover:border-red-600 transition-colors"
    >
      <img
        src={campaign.imageUrl}
        alt={campaign.clientName}
        className="w-full sm:w-36 h-28 object-cover rounded-lg shrink-0 border border-slate-800"
      />
      <div className="flex-1">
        <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 mb-1">
          <span className="bg-red-600 text-white px-1.5 py-0.5 rounded">SPONSORED INSIGHT</span>
          <span>&bull;</span>
          <span>{campaign.clientName}</span>
        </div>
        <h4 className="font-bold text-base text-gray-100 group-hover:text-red-400 transition-colors leading-snug mb-1">
          {campaign.title}
        </h4>
        <p className="text-xs text-slate-300 line-clamp-2">
          {campaign.tagline}
        </p>
      </div>
      <div className="shrink-0 w-full sm:w-auto text-right">
        <span className="inline-flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded-lg">
          <span>Read Briefing</span>
          <ExternalLink className="w-3 h-3 ml-1" />
        </span>
      </div>
    </div>
  );
};

