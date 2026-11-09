import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Tv, 
  Search, 
  Sun, 
  Moon, 
  Bookmark, 
  TrendingUp, 
  Shield, 
  Menu, 
  X,
  ChevronRight,
  Plane,
  Megaphone,
  UserCheck,
  LogOut,
  User,
  Flame
} from 'lucide-react';
import { Article } from '../types/news';
import { AuthUser } from '../services/api';

interface HeaderProps {
  currentCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenArticle: (article: Article) => void;
  breakingArticle?: Article;
  onOpenLiveBroadcast: () => void;
  onOpenSearch: () => void;
  onOpenCMS: () => void;
  bookmarkedCount: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  onSelectTopic?: (topic: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCategory,
  onSelectCategory,
  onOpenArticle,
  breakingArticle,
  onOpenLiveBroadcast,
  onOpenSearch,
  onOpenCMS,
  bookmarkedCount,
  isDarkMode,
  onToggleDarkMode,
  currentUser,
  onLogout,
  onSelectTopic,
}) => {
  const [currentGmtTime, setCurrentGmtTime] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const gmtString = now.toUTCString().replace('GMT', 'UTC');
      setCurrentGmtTime(gmtString.split(' ').slice(0, 5).join(' ') + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navCategories = [
    'All Stories',
    'Trending',
    'National',
    'Air & Aerospace',
    'World',
    'Defense & Security',
    'Geopolitics',
    'Climate & Tech',
    'Economy',
    'Analysis',
    'Investigation'
  ];

  const marketQuotes = [
    { label: 'BRENT CRUDE', val: '$76.12', chg: '-0.8%' },
    { label: 'JET FUEL (GAL)', val: '$2.29', chg: '-1.4%' },
    { label: 'GOLD (OZ)', val: '$2,746.80', chg: '+0.5%' },
    { label: 'S&P 500', val: '5,862.10', chg: '+0.7%' },
    { label: 'GLOBAL AIR INDEX', val: '4,890.4', chg: '+1.9%' },
  ];

  const trendingKeywords = [
    'Boeing 737 MAX',
    'Aviation Corridors',
    'Gaza Airspace',
    'Crypto Hack',
    'AI Tech Stocks',
    'Air Transat',
    'Airline Fares',
    'Florida Jet Crash'
  ];

  const getRoleBadge = (role?: string) => {
    if (role === 'ceo') {
      return { label: 'CEO & Editor-in-Chief', bg: 'bg-red-600 text-white' };
    }
    if (role === 'editor') {
      return { label: 'Managing Editor', bg: 'bg-blue-600 text-white' };
    }
    return { label: 'Staff Correspondent', bg: 'bg-emerald-600 text-white' };
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      
      {/* BBC-Style Top Utility Bar */}
      <div className="bg-slate-950 text-gray-300 text-xs px-4 py-1.5 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Clock & Edition */}
          <div className="flex items-center space-x-3 text-[11px]">
            <div className="flex items-center space-x-1.5 font-bold text-white">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              <span className="uppercase tracking-widest font-mono text-red-500 font-black">ARN NETWORK</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="text-slate-400 font-mono hidden sm:inline">
              <span>{currentGmtTime || 'UTC 15:00:00'}</span>
            </div>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-400 font-medium hidden md:inline">Global Edition (London &bull; Geneva &bull; Washington)</span>
          </div>

          {/* Center: Live Financial & Aviation Ticker (Desktop) */}
          <div className="hidden lg:flex items-center space-x-4 overflow-hidden text-[11px]">
            <div className="flex items-center space-x-1 text-slate-400 font-bold uppercase">
              <TrendingUp className="w-3 h-3 text-red-500" />
              <span>MARKETS:</span>
            </div>
            <div className="flex items-center space-x-3">
              {marketQuotes.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-1.5 font-mono">
                  <span className="text-slate-400 font-medium">{item.label}</span>
                  <span className="text-white font-bold">{item.val}</span>
                  <span className={item.chg.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}>
                    {item.chg}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Broadcast, Staff User Profile, Dark Mode */}
          <div className="flex items-center space-x-2.5 ml-auto text-xs">
            {/* Live TV Button */}
            <button
              onClick={onOpenLiveBroadcast}
              className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white px-2.5 py-0.5 rounded font-black text-[10px] uppercase tracking-wider transition-all"
            >
              <Tv className="w-3 h-3" />
              <span>Watch Live</span>
            </button>

            {/* Staff CMS & User State */}
            {currentUser ? (
              <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-700 px-2.5 py-0.5 rounded font-mono text-[10px]">
                <button
                  onClick={onOpenCMS}
                  className="flex items-center space-x-1.5 hover:text-white transition-colors"
                  title="Open Staff CMS Portal"
                >
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${getRoleBadge(currentUser.role).bg}`}>
                    {currentUser.role.toUpperCase()}
                  </span>
                  <span className="font-bold text-slate-200 truncate max-w-[120px]">
                    {currentUser.name}
                  </span>
                </button>
                <span className="text-slate-600">|</span>
                <button
                  onClick={onLogout}
                  className="text-slate-400 hover:text-red-400 p-0.5 transition-colors"
                  title="Sign out of newsroom session"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenCMS}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-0.5 rounded font-bold text-[10px] tracking-wide border border-slate-700 transition-colors"
                title="Sign in as ARN Staff or CEO"
              >
                <UserCheck className="w-3 h-3 text-red-500" />
                <span>Staff Portal & Ads</span>
              </button>
            )}

            {/* Dark Mode */}
            <button
              onClick={onToggleDarkMode}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Main Masthead */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 dark:text-slate-200"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Unique Brand Logo: AIR REAL NEWS (ARN) */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => onSelectCategory('All Stories')}
          >
            {/* BBC-style bold red square block with modern aerospace radar motif */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-600 rounded-lg flex items-center justify-center text-white font-black shadow-md group-hover:bg-red-700 transition-colors">
              <div className="text-center leading-none">
                <span className="font-mono text-base sm:text-lg tracking-tighter font-black block">ARN</span>
                <span className="text-[8px] tracking-widest uppercase block text-red-200 font-bold">AIR</span>
              </div>
            </div>

            {/* Masthead Typography */}
            <div>
              <div className="flex items-baseline space-x-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase font-sans">
                  AIR REAL NEWS
                </h1>
                <span className="hidden sm:inline-block bg-slate-900 text-white dark:bg-slate-800 text-[10px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider font-mono">
                  GLOBAL WIRE
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">
                Aviation &bull; Global Corridors &bull; Uncompromised World Truth
              </p>
            </div>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Instant Search Button */}
            <button
              onClick={onOpenSearch}
              className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-red-600" />
              <span className="hidden md:inline">Search ARN news, aviation, topics...</span>
            </button>

            {/* Bookmarks Counter */}
            <button
              onClick={() => onSelectCategory('Bookmarked')}
              className={`p-2 rounded-full border transition-colors relative ${
                currentCategory === 'Bookmarked'
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-red-600'
              }`}
              title="Saved Articles"
            >
              <Bookmark className="w-4 h-4" />
              {bookmarkedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {bookmarkedCount}
                </span>
              )}
            </button>

            {/* Staff Post Ad Shortcut */}
            <button
              onClick={onOpenCMS}
              className="hidden lg:flex items-center space-x-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 text-red-600 px-3 py-2 rounded-full text-xs font-bold border border-red-200 dark:border-red-900/50 transition-colors"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>{currentUser ? 'Post News / Ad' : 'Staff Sign In'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Category Navigation Bar (BBC clean tab style) */}
      <nav className="border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:block">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-1">
            {navCategories.map((cat) => {
              const isActive = currentCategory === cat;
              return (
                <li key={cat}>
                  <button
                    onClick={() => onSelectCategory(cat)}
                    className={`whitespace-nowrap px-3.5 py-2 text-xs font-extrabold uppercase tracking-wide transition-all border-b-2 flex items-center ${
                      isActive
                        ? 'text-red-600 border-red-600 bg-red-50/50 dark:bg-red-950/20'
                        : 'text-slate-700 dark:text-slate-300 border-transparent hover:text-red-600 hover:border-red-300'
                    }`}
                  >
                    {cat === 'Trending' && <Flame className="w-3.5 h-3.5 mr-1 text-red-600 fill-red-600 inline" />}
                    <span>{cat}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Real-Time Trending Topics Bar */}
      <div className="bg-slate-50 dark:bg-slate-950/80 border-t border-b border-gray-200 dark:border-slate-800 py-1.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center space-x-2.5 overflow-x-auto no-scrollbar">
          <span className="flex items-center space-x-1 text-red-600 font-black text-[10px] tracking-wider uppercase font-mono shrink-0">
            <Flame className="w-3.5 h-3.5 fill-red-600 animate-pulse" />
            <span>TRENDING TOPICS:</span>
          </span>
          <div className="flex items-center space-x-2 text-[11px] font-medium whitespace-nowrap">
            {trendingKeywords.map((topic) => (
              <button
                key={topic}
                onClick={() => onSelectTopic ? onSelectTopic(topic) : onSelectCategory(topic)}
                className="px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-500 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs font-mono text-[10px]"
              >
                #{topic.replace(/\s+/g, '')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {navCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  onSelectCategory(cat);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2 rounded font-bold uppercase flex items-center ${
                  currentCategory === cat
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                {cat === 'Trending' && <Flame className="w-3.5 h-3.5 mr-1 fill-current inline" />}
                <span>{cat}</span>
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
            <button
              onClick={() => {
                onOpenLiveBroadcast();
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-1.5 text-red-600"
            >
              <Tv className="w-4 h-4" />
              <span>Watch Live TV</span>
            </button>
            <button
              onClick={() => {
                onOpenCMS();
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-1.5 text-slate-900 dark:text-white"
            >
              <UserCheck className="w-4 h-4 text-red-600" />
              <span>{currentUser ? `Portal (${currentUser.username})` : 'Staff Sign In'}</span>
            </button>
          </div>
        </div>
      )}

      {/* BBC-Style Breaking News Alert Ribbon */}
      {breakingArticle && (
        <div className="bg-red-600 text-white py-1.5 px-4 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <span className="flex items-center space-x-1 bg-white text-red-600 font-black px-2 py-0.5 rounded text-[10px] tracking-wider uppercase shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                <span>BREAKING</span>
              </span>
              <button
                onClick={() => onOpenArticle(breakingArticle)}
                className="font-bold hover:underline truncate text-left text-xs sm:text-sm tracking-tight text-white"
              >
                {breakingArticle.title}
              </button>
            </div>
            <button
              onClick={() => onOpenArticle(breakingArticle)}
              className="hidden sm:flex items-center space-x-1 text-white font-bold shrink-0 hover:translate-x-0.5 transition-transform"
            >
              <span>Full Report</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </header>
  );
};
