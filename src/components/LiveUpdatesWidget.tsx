import React, { useState } from 'react';
import { Clock, Filter, ChevronRight, PlusCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { LiveUpdate } from '../types/news';

interface LiveUpdatesWidgetProps {
  updates: LiveUpdate[];
  onOpenCMS: () => void;
  onSelectUpdate?: (update: LiveUpdate) => void;
  onSyncLiveWire?: () => void;
  isSyncingWire?: boolean;
}

export const LiveUpdatesWidget: React.FC<LiveUpdatesWidgetProps> = ({
  updates,
  onOpenCMS,
  onSelectUpdate,
  onSyncLiveWire,
  isSyncingWire = false,
}) => {
  const [filterFlashOnly, setFilterFlashOnly] = useState(false);

  const displayedUpdates = filterFlashOnly
    ? updates.filter((u) => u.isFlash)
    : updates;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Widget Header (BBC News Live Style) */}
      <div className="bg-slate-950 text-white p-3.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
          </span>
          <span className="font-black uppercase tracking-wider text-xs text-white font-mono">
            LIVE WIRE DESK
          </span>
          <span className="text-[9px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded">
            HYBRID WIRE
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {onSyncLiveWire && (
            <button
              onClick={onSyncLiveWire}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors"
              title="Sync Live Global Wire Feeds"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingWire ? 'animate-spin text-red-500' : ''}`} />
            </button>
          )}

          <button
            onClick={() => setFilterFlashOnly(!filterFlashOnly)}
            className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors flex items-center space-x-1 ${
              filterFlashOnly
                ? 'bg-red-600 text-white'
                : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
            title="Filter Priority Flash alerts"
          >
            <Filter className="w-2.5 h-2.5" />
            <span>{filterFlashOnly ? 'Flash' : 'All'}</span>
          </button>

          <button
            onClick={onOpenCMS}
            title="Post Wire Flash as ARN Staff"
            className="text-red-400 hover:text-white transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stream List */}
      <div className="p-3 space-y-3 overflow-y-auto max-h-[500px] lg:max-h-[580px] divide-y divide-gray-100 dark:divide-slate-800">
        {displayedUpdates.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectUpdate && onSelectUpdate(item)}
            className="pt-3 first:pt-0 cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-800/40 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
          >
            {/* Timestamp & Tag */}
            <div className="flex items-center justify-between text-[11px] mb-1">
              <div className="flex items-center space-x-1.5 font-mono">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="font-bold text-slate-900 dark:text-slate-200">
                  {item.timestamp}
                </span>
                <span className="text-slate-400">&bull;</span>
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">
                  {item.timeAgo}
                </span>
              </div>

              {item.isFlash ? (
                <span className="bg-red-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider">
                  FLASH
                </span>
              ) : item.sourceName ? (
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  {item.sourceName.split(' ')[0]} WIRE
                </span>
              ) : null}
            </div>

            {/* Title */}
            <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white group-hover:text-red-600 transition-colors leading-snug">
              {item.title}
            </h4>

            {/* Snippet */}
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-3 leading-relaxed">
              {item.content}
            </p>

            {/* Author Byline & Source Link */}
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-medium italic">
                {item.sourceName ? `Syndicated via ${item.sourceName}` : item.author}
              </span>
              
              {item.sourceUrl ? (
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-red-600 font-bold flex items-center hover:underline"
                >
                  <span>Source wire</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              ) : (
                <span className="text-red-600 font-bold flex items-center group-hover:translate-x-0.5 transition-transform">
                  Full wire <ChevronRight className="w-3 h-3 ml-0.5" />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Widget Footer */}
      <div className="bg-gray-50 dark:bg-slate-950 p-2.5 border-t border-gray-100 dark:border-slate-800 text-center">
        <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-center space-x-1 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Automated Global Wire: BBC &bull; Al Jazeera &bull; Guardian &bull; Bloomberg &bull; Defense &amp; Aerospace &bull; ARN Staff</span>
        </p>
      </div>
    </div>
  );
};
