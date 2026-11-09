import React from 'react';
import { X, Shield, Globe2, Radio, FileText, Megaphone, CheckCircle2, Tv, MapPin } from 'lucide-react';

export interface InfoModalContent {
  title: string;
  badge: string;
  type: 'bureau' | 'standards' | 'advertising' | 'satellite' | 'policy';
  subtitle?: string;
  body: React.ReactNode;
}

interface InfoModalProps {
  info: InfoModalContent;
  onClose: () => void;
  onOpenCMS?: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ info, onClose, onOpenCMS }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex justify-center items-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-slate-800 flex flex-col max-h-[88vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-black text-sm">
              ARN
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base tracking-wide text-white font-sans">
                  {info.title}
                </h3>
                <span className="bg-red-600/30 text-red-400 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-red-500/30 uppercase">
                  {info.badge}
                </span>
              </div>
              {info.subtitle && (
                <p className="text-[11px] text-slate-400">{info.subtitle}</p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {info.body}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 dark:bg-slate-950 px-6 py-3 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono text-[11px]">
            Air Real News &bull; Verified Documentation
          </span>

          <div className="flex items-center space-x-3">
            {info.type === 'advertising' && onOpenCMS && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCMS();
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1"
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Launch Ad Campaign</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 font-bold"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

