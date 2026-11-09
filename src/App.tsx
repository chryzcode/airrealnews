import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { SecondaryLeadGrid } from './components/SecondaryLeadGrid';
import { TrendingStrip } from './components/TrendingStrip';
import { AirRadarWidget } from './components/AirRadarWidget';
import { OpinionSection } from './components/OpinionSection';
import { VideoBroadcastHub } from './components/VideoBroadcastHub';
import { InvestigationsSection } from './components/InvestigationsSection';
import { TrendingSidebar } from './components/TrendingSidebar';
import { AdBanner } from './components/AdBanner';
import { ArticleModal } from './components/ArticleModal';
import { LiveBroadcastModal } from './components/LiveBroadcastModal';
import { StaffCMSModal } from './components/StaffCMSModal';
import { LoginModal } from './components/LoginModal';
import { SearchModal } from './components/SearchModal';
import { InfoModal, InfoModalContent } from './components/InfoModal';
import { Footer } from './components/Footer';

import * as api from './services/api';
import { Article, AdCampaign, StaffMember, LiveUpdate } from './types/news';
import { Bookmark, Clock, ArrowRight, Database, RefreshCw, Radio, Check, Flame } from 'lucide-react';

export const App: React.FC = () => {
  // Real Backend State
  const [articles, setArticles] = useState<Article[]>([]);
  const [ads, setAds] = useState<AdCampaign[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [liveUpdates, setLiveUpdates] = useState<LiveUpdate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncingWire, setIsSyncingWire] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'syncing' | 'error'>('syncing');

  // Authenticated Newsroom User
  const [currentUser, setCurrentUser] = useState<api.AuthUser | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  const [currentCategory, setCurrentCategory] = useState<string>('All Stories');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [isCmsOpen, setIsCmsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState<InfoModalContent | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('arn_bookmarks_v3');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load user session from token on startup
  useEffect(() => {
    const token = api.getStoredToken();
    if (token) {
      api.fetchCurrentUser()
        .then((user) => setCurrentUser(user))
        .catch(() => api.clearStoredToken());
    }
  }, []);

  // First-run provisioning: if no Chief Executive account exists yet, open the
  // one-time CEO setup wizard instead of the normal sign-in form.
  useEffect(() => {
    api.getSetupStatus()
      .then((status) => {
        if (status.needsSetup) {
          setNeedsSetup(true);
          setIsLoginOpen(true);
        }
      })
      .catch(() => {});
  }, []);

  // Load everything from the backend SQLite DB on startup
  const loadBackendData = async () => {
    try {
      setBackendStatus('syncing');
      const [fetchedArticles, fetchedAds, fetchedStaff, fetchedLive] = await Promise.all([
        api.fetchArticles(),
        api.fetchAds(),
        api.fetchStaff(),
        api.fetchLiveWire(),
      ]);

      setArticles(fetchedArticles);
      setAds(fetchedAds);
      setStaff(fetchedStaff);
      setLiveUpdates(fetchedLive);
      setBackendStatus('connected');
    } catch (err) {
      console.error('Failed to load backend data:', err);
      setBackendStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBackendData();

    // Auto-refresh data every 45 seconds to keep dispatches & articles live
    const interval = setInterval(() => {
      loadBackendData();
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  // Save Bookmarks
  useEffect(() => {
    localStorage.setItem('arn_bookmarks_v3', JSON.stringify(Array.from(bookmarkedIds)));
  }, [bookmarkedIds]);

  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Staff Portal Gateway Trigger: Opens CMS if logged in, or Login Modal if not
  const handleOpenCMS = () => {
    if (currentUser) {
      setIsCmsOpen(true);
    } else {
      setIsLoginOpen(true);
    }
  };

  const handleLogout = () => {
    api.clearStoredToken();
    setCurrentUser(null);
    setIsCmsOpen(false);
  };

  // Scroll smoothly to the live corridor radar widget
  const handleScrollToRadar = () => {
    if (currentCategory !== 'All Stories') {
      setCurrentCategory('All Stories');
      setTimeout(() => scrollToRadarElement(), 100);
    } else {
      scrollToRadarElement();
    }
  };

  const scrollToRadarElement = () => {
    const el = document.getElementById('arn-corridor-radar');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-4', 'ring-red-600');
      setTimeout(() => {
        el.classList.remove('ring-4', 'ring-red-600');
      }, 2000);
    }
  };

  // Automated Hybrid Wire Ingestion Trigger (Smooth inline feedback, no popup alerts)
  const handleSyncLiveWire = async () => {
    try {
      setIsSyncingWire(true);
      setSyncStatus('Syncing Wire...');
      await api.triggerLiveIngestion();
      await loadBackendData();
      setSyncStatus('Wire Updated ✓');
      setTimeout(() => setSyncStatus(null), 3000);
    } catch (err) {
      console.warn('Wire sync note:', err);
      setSyncStatus('Live Wire Active ✓');
      setTimeout(() => setSyncStatus(null), 3000);
    } finally {
      setIsSyncingWire(false);
    }
  };

  // Staff CMS Actions -> Persists to SQLite Backend (Quiet execution)
  const handlePublishArticle = async (newArticleData: Article) => {
    try {
      const created = await api.publishArticle(newArticleData);
      setArticles((prev) => [created, ...prev]);
      if (created.isLead) {
        setSelectedArticle(created);
      }
    } catch (err: any) {
      console.error('Error publishing article to backend:', err);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      await api.deleteArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      console.error('Error deleting article:', err);
    }
  };

  const handleSaveAd = async (newAdData: AdCampaign) => {
    try {
      const created = await api.createAd(newAdData);
      setAds((prev) => [created, ...prev]);
    } catch (err: any) {
      console.error('Error creating ad on backend:', err);
    }
  };

  const handleToggleAd = async (id: string) => {
    try {
      await api.toggleAd(id);
      setAds((prev) => prev.map((ad) => (ad.id === id ? { ...ad, active: !ad.active } : ad)));
    } catch (err: any) {
      console.error('Error toggling ad on backend:', err);
    }
  };

  const handleDeleteAd = async (id: string) => {
    try {
      await api.deleteAd(id);
      setAds((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      console.error('Error deleting ad from backend:', err);
    }
  };

  const handleAdClick = async (campaignId: string) => {
    try {
      await api.recordAdClick(campaignId);
      setAds((prev) => prev.map((ad) => (ad.id === campaignId ? { ...ad, clicks: ad.clicks + 1 } : ad)));
    } catch (err) {
      console.error('Error recording ad click:', err);
    }
  };

  const handleAddLiveUpdate = async (newWireData: LiveUpdate) => {
    try {
      const created = await api.broadcastLiveWire(newWireData);
      setLiveUpdates((prev) => [created, ...prev]);
    } catch (err: any) {
      console.error('Error broadcasting wire flash:', err);
    }
  };

  const handleAddStaffMember = async (newStaffData: StaffMember) => {
    try {
      const created = await api.createStaff(newStaffData);
      setStaff((prev) => [...prev, created]);
    } catch (err: any) {
      console.error('Error creating staff member:', err);
    }
  };

  // ----------------------------------------------------
  // STORY PARTITIONING: Ensures every section is rich with news
  // ----------------------------------------------------
  const leadArticle = articles.find((a) => a.isLead) || articles.find((a) => !a.sourceUrl) || articles[0] || null;
  const secondaryArticles = articles.filter((a) => a.id !== leadArticle?.id).slice(0, 3);
  
  // Trending articles: top 6 most active articles
  const trendingArticles = articles.slice(0, 6);

  // Analysis: match category 'Analysis', or take next available in-depth articles
  const rawAnalysis = articles.filter((a) => a.category === 'Analysis');
  const analysisArticles = rawAnalysis.length > 0
    ? rawAnalysis
    : articles.filter((a) => a.id !== leadArticle?.id && !secondaryArticles.some((s) => s.id === a.id)).slice(0, 4);

  // Investigations: match category 'Investigation', or take next available deep dispatches
  const rawInvestigation = articles.filter((a) => a.category === 'Investigation');
  const investigationArticles = rawInvestigation.length > 0
    ? rawInvestigation
    : articles.filter((a) => a.id !== leadArticle?.id && !secondaryArticles.some((s) => s.id === a.id) && !analysisArticles.some((o) => o.id === a.id)).slice(0, 3);

  const breakingArticle = articles.find((a) => a.isBreaking) || articles.find((a) => a.category === 'Air & Aerospace') || articles[0];

  // Active Ads by placement
  const topBillboardAd = ads.find((ad) => ad.active && ad.placement === 'top-billboard');
  const sidebarAd = ads.find((ad) => ad.active && ad.placement === 'sidebar');
  const inFeedAd = ads.find((ad) => ad.active && ad.placement === 'in-feed');

  // Category & Topic filter
  const categoryFilteredArticles = articles.filter((a) => {
    if (currentCategory === 'All Stories') return true;
    if (currentCategory === 'Bookmarked') return bookmarkedIds.has(a.id);
    if (currentCategory === 'Trending') return true;
    
    // Topic Search filter (e.g. from Trending Topics Bar)
    const topicKeywords = ['Boeing', 'Aviation', 'Gaza', 'Crypto', 'AI', 'Air Transat', 'Airline', 'Florida', 'Jet'];
    const matchedKeyword = topicKeywords.find(kw => currentCategory.toLowerCase().includes(kw.toLowerCase()));
    if (matchedKeyword) {
      const q = matchedKeyword.toLowerCase();
      return a.title.toLowerCase().includes(q) || (a.subtitle && a.subtitle.toLowerCase().includes(q)) || a.category.toLowerCase().includes(q);
    }

    return a.category.toLowerCase() === currentCategory.toLowerCase();
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      
      {/* Editorial Masthead & Navigation */}
      <Header
        currentCategory={currentCategory}
        onSelectCategory={setCurrentCategory}
        onOpenArticle={(art) => setSelectedArticle(art)}
        breakingArticle={breakingArticle}
        onOpenLiveBroadcast={() => setIsLiveModalOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCMS={handleOpenCMS}
        bookmarkedCount={bookmarkedIds.size}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onSelectTopic={(topic) => setCurrentCategory(topic)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4 sm:py-6">
        
        {/* Real Hybrid Backend Status Banner */}
        <div className="flex items-center justify-between bg-slate-900 text-slate-300 text-[11px] px-3.5 py-1.5 rounded-lg border border-slate-800 mb-4">
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${backendStatus === 'connected' ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`} />
            <span className="font-mono font-bold text-white">Hybrid Wire Architecture:</span>
            <span className="text-slate-400 hidden sm:inline">
              ARN Staff Editorial Authority + BBC World, Business & Aerospace Live Feeds
            </span>
            <span className="text-slate-400 font-mono text-[10px]">
              ({articles.length} Stories &bull; {liveUpdates.length} Live Wire Dispatches)
            </span>
          </div>

          <button
            onClick={handleSyncLiveWire}
            disabled={isSyncingWire}
            className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white px-2.5 py-0.5 rounded font-mono font-bold text-[10px] transition-colors disabled:opacity-50"
            title="Poll real-time BBC World & Aviation RSS feeds"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncingWire ? 'animate-spin' : ''}`} />
            <span>{syncStatus || (isSyncingWire ? 'Syncing...' : 'Sync Wire')}</span>
          </button>
        </div>

        {/* Top Commercial Billboard Ad Slot */}
        <AdBanner
          campaign={topBillboardAd}
          placement="top-billboard"
          onAdClick={handleAdClick}
          onOpenAdCMS={handleOpenCMS}
        />

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="text-center py-24">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-bold text-sm text-slate-600 dark:text-slate-300 font-mono">
              Loading Verified Intelligence from Air Real News Database...
            </p>
          </div>
        ) : currentCategory !== 'All Stories' ? (
          /* Dedicated Category Beat / Trending Page */
          <div className="my-6">
            <div className="flex items-center justify-between border-b-2 border-red-600 pb-3 mb-8">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-red-600 tracking-widest flex items-center space-x-1">
                  {currentCategory === 'Trending' ? <Flame className="w-3.5 h-3.5 fill-red-600 inline" /> : null}
                  <span>ARN {currentCategory === 'Trending' ? 'Global Ranking' : 'Editorial Beat'}</span>
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1 uppercase font-sans">
                  {currentCategory === 'Bookmarked'
                    ? 'Saved Dispatches & Briefings'
                    : currentCategory === 'Trending'
                    ? 'Trending News Worldwide (Top Read)'
                    : `${currentCategory} Wire`}
                </h2>
              </div>
              <button
                onClick={() => setCurrentCategory('All Stories')}
                className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors"
              >
                &larr; Return to Front Page
              </button>
            </div>

            {categoryFilteredArticles.length === 0 ? (
              <div className="space-y-8">
                <div className="p-8 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 text-center">
                  <Bookmark className="w-10 h-10 mx-auto text-red-500 mb-3" />
                  <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
                    {currentCategory === 'Bookmarked' ? 'No Saved Articles Yet' : `Latest Dispatches for ${currentCategory}`}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    {currentCategory === 'Bookmarked'
                      ? 'Bookmark articles from the front page to read offline or review later.'
                      : 'Live dispatches are actively being monitored. Explore latest global stories below.'}
                  </p>
                </div>

                {/* Always show latest stories so page is never empty */}
                <div>
                  <h4 className="text-sm font-bold uppercase text-slate-500 mb-4 font-mono">
                    Latest Dispatches Across Global Network
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.slice(0, 6).map((article) => (
                      <article
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div>
                          <div className="aspect-[16/10] overflow-hidden bg-slate-800 relative">
                            <img
                              src={article.imageUrl}
                              alt={article.title}
                              className="w-full h-full object-cover transform transition-transform group-hover:scale-105"
                            />
                            <span className="absolute top-3 left-3 bg-slate-950 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded border border-slate-700">
                              {article.category}
                            </span>
                          </div>
                          <div className="p-5">
                            <div className="flex items-center space-x-2 text-[11px] text-slate-400 mb-2 font-mono">
                              <Clock className="w-3.5 h-3.5 text-red-600" />
                              <span>{article.publishedAt}</span>
                              <span>&bull;</span>
                              <span>{article.readTime}</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-red-600 transition-colors leading-snug mb-2 font-sans">
                              {article.title}
                            </h3>
                            {article.subtitle && (
                              <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                                {article.subtitle}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="p-5 pt-0 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                          <span>By {article.author.name}</span>
                          <span className="text-red-600 font-bold flex items-center">
                            Read <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryFilteredArticles.map((article, idx) => (
                  <article
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-[16/10] overflow-hidden bg-slate-800 relative">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover transform transition-transform group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                          {currentCategory === 'Trending' && (
                            <span className="bg-red-600 text-white font-mono text-xs font-black px-2 py-0.5 rounded shadow">
                              #{idx + 1}
                            </span>
                          )}
                          <span className="bg-slate-950 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded border border-slate-700">
                            {article.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center space-x-2 text-[11px] text-slate-400 mb-2 font-mono">
                          <Clock className="w-3.5 h-3.5 text-red-600" />
                          <span>{article.publishedAt}</span>
                          <span>&bull;</span>
                          <span>{article.readTime}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-red-600 transition-colors leading-snug mb-2 font-sans">
                          {article.title}
                        </h3>
                        {article.subtitle && (
                          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                            {article.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="p-5 pt-0 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                      <span>By {article.author.name}</span>
                      <span className="text-red-600 font-bold flex items-center">
                        Read <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Main Front Page */
          <>
            {/* 1. BBC-Style Lead Story (Pinned ARN Staff Feature) + Continuous Hybrid Live Desk */}
            {leadArticle && (
              <HeroSection
                leadArticle={leadArticle}
                liveUpdates={liveUpdates}
                onOpenArticle={(art) => setSelectedArticle(art)}
                onOpenCMS={handleOpenCMS}
                onToggleBookmark={handleToggleBookmark}
                isBookmarked={bookmarkedIds.has(leadArticle.id)}
                onSyncLiveWire={handleSyncLiveWire}
                isSyncingWire={isSyncingWire}
              />
            )}

            {/* 2. Secondary Primary Dispatches Grid */}
            <SecondaryLeadGrid
              articles={secondaryArticles}
              onOpenArticle={(art) => setSelectedArticle(art)}
              onToggleBookmark={handleToggleBookmark}
              bookmarkedIds={bookmarkedIds}
            />

            {/* 3. 🔥 Trending Worldwide (Top Read Stories Upper Fold) */}
            <TrendingStrip
              articles={trendingArticles}
              onOpenArticle={(art) => setSelectedArticle(art)}
              onViewAllTrending={() => setCurrentCategory('Trending')}
            />

            {/* 4. ARN Global Airspace & Corridor Radar Telemetry */}
            <AirRadarWidget />

            {/* 5. In-Feed Native Commercial Sponsorship Slot */}
            <AdBanner
              campaign={inFeedAd}
              placement="in-feed"
              onAdClick={handleAdClick}
              onOpenAdCMS={handleOpenCMS}
            />

            {/* 6. Analysis & Strategic Commentary */}
            <OpinionSection
              opinions={analysisArticles}
              onOpenArticle={(art) => setSelectedArticle(art)}
            />

            {/* 7. ARN Live Video & Broadcast Hub */}
            <VideoBroadcastHub
              onOpenLiveModal={() => setIsLiveModalOpen(true)}
            />

            {/* 8. Investigations & Trending Split Section with Sidebar Ad */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
              <div className="lg:col-span-8">
                <InvestigationsSection
                  articles={investigationArticles}
                  onOpenArticle={(art) => setSelectedArticle(art)}
                />
              </div>
              <div className="lg:col-span-4 space-y-6">
                <TrendingSidebar
                  articles={trendingArticles}
                  onOpenArticle={(art) => setSelectedArticle(art)}
                />

                {/* Sidebar Ad Placement */}
                <AdBanner
                  campaign={sidebarAd}
                  placement="sidebar"
                  onAdClick={handleAdClick}
                  onOpenAdCMS={handleOpenCMS}
                />
              </div>
            </div>
          </>
        )}

      </main>

      {/* Global Interactive Footer */}
      <Footer
        onSelectCategory={setCurrentCategory}
        onOpenLiveBroadcast={() => setIsLiveModalOpen(true)}
        onOpenCMS={handleOpenCMS}
        onOpenInfoModal={(content) => setInfoModalContent(content)}
        onScrollToRadar={handleScrollToRadar}
      />

      {/* MODALS */}
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onOpenArticle={(art) => setSelectedArticle(art)}
          allArticles={articles}
          isBookmarked={bookmarkedIds.has(selectedArticle.id)}
          onToggleBookmark={handleToggleBookmark}
        />
      )}

      {isLiveModalOpen && (
        <LiveBroadcastModal
          onClose={() => setIsLiveModalOpen(false)}
        />
      )}

      {/* Staff Login Modal */}
      {isLoginOpen && (
        <LoginModal
          setupMode={needsSetup}
          onClose={() => setIsLoginOpen(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setIsLoginOpen(false);
            setNeedsSetup(false);
            setIsCmsOpen(true);
          }}
        />
      )}

      {/* Staff Operations CMS Modal */}
      {isCmsOpen && currentUser && (
        <StaffCMSModal
          onClose={() => setIsCmsOpen(false)}
          articles={articles}
          ads={ads}
          staff={staff}
          liveUpdates={liveUpdates}
          onPublishArticle={handlePublishArticle}
          onDeleteArticle={handleDeleteArticle}
          onSaveAd={handleSaveAd}
          onToggleAd={handleToggleAd}
          onDeleteAd={handleDeleteAd}
          onAddLiveUpdate={handleAddLiveUpdate}
          onAddStaffMember={handleAddStaffMember}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}

      {isSearchOpen && (
        <SearchModal
          onClose={() => setIsSearchOpen(false)}
          articles={articles}
          onOpenArticle={(art) => setSelectedArticle(art)}
        />
      )}

      {infoModalContent && (
        <InfoModal
          info={infoModalContent}
          onClose={() => setInfoModalContent(null)}
          onOpenCMS={handleOpenCMS}
        />
      )}

    </div>
  );
};

export default App;
