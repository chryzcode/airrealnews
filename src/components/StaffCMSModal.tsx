import React, { useState, useEffect } from 'react';
import { 
  X, 
  PenTool, 
  Megaphone, 
  Users, 
  Radio, 
  Plus, 
  Trash2, 
  CheckCircle, 
  ExternalLink, 
  BarChart3, 
  Eye, 
  MousePointer, 
  Flame, 
  Layers,
  Shield,
  FileText,
  UserCheck,
  KeyRound,
  LogOut,
  AlertTriangle,
  Lock,
  RefreshCw
} from 'lucide-react';
import { Article, AdCampaign, StaffMember, LiveUpdate } from '../types/news';
import * as api from '../services/api';

interface StaffCMSModalProps {
  onClose: () => void;
  articles: Article[];
  ads: AdCampaign[];
  staff: StaffMember[];
  liveUpdates: LiveUpdate[];
  onPublishArticle: (article: Article) => void;
  onDeleteArticle: (id: string) => void;
  onSaveAd: (ad: AdCampaign) => void;
  onToggleAd: (id: string) => void;
  onDeleteAd: (id: string) => void;
  onAddLiveUpdate: (update: LiveUpdate) => void;
  onAddStaffMember: (member: StaffMember) => void;
  currentUser: api.AuthUser;
  onLogout: () => void;
}

export const StaffCMSModal: React.FC<StaffCMSModalProps> = ({
  onClose,
  articles,
  ads,
  staff,
  liveUpdates,
  onPublishArticle,
  onDeleteArticle,
  onSaveAd,
  onToggleAd,
  onDeleteAd,
  onAddLiveUpdate,
  onAddStaffMember,
  currentUser,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'articles' | 'ads' | 'live' | 'staff' | 'security'>('articles');

  // ARTICLE FORM
  const [artTitle, setArtTitle] = useState('');
  const [artSubtitle, setArtSubtitle] = useState('');
  const [artCategory, setArtCategory] = useState<Article['category']>('Air & Aerospace');
  const [artAuthorId, setArtAuthorId] = useState<string>(currentUser.staffId || staff[0]?.id || '');
  const [artImageUrl, setArtImageUrl] = useState('https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80');
  const [artCaption, setArtCaption] = useState('');
  const [artContent, setArtContent] = useState('');
  const [artKeyTakeaway, setArtKeyTakeaway] = useState('');
  const [artIsBreaking, setArtIsBreaking] = useState(false);

  // AD FORM
  const [adClient, setAdClient] = useState('');
  const [adTitle, setAdTitle] = useState('');
  const [adTagline, setAdTagline] = useState('');
  const [adTargetUrl, setAdTargetUrl] = useState('https://');
  const [adImageUrl, setAdImageUrl] = useState('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80');
  const [adPlacement, setAdPlacement] = useState<AdCampaign['placement']>('top-billboard');
  const [adBadge, setAdBadge] = useState('SPONSORED PARTNER');

  // LIVE WIRE FORM
  const [wireTitle, setWireTitle] = useState('');
  const [wireContent, setWireContent] = useState('');
  const [wireCategory, setWireCategory] = useState('Airspace Wire');
  const [wireAuthor, setWireAuthor] = useState(currentUser.name || 'ARN Newsroom Wire');
  const [wireIsFlash, setWireIsFlash] = useState(true);

  // STAFF FORM
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('');
  const [staffBureau, setStaffBureau] = useState('London Bureau');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffBio, setStaffBio] = useState('');

  // USER & SECURITY ACCOUNTS STATE
  const [usersList, setUsersList] = useState<api.AuthUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'journalist' | 'editor'>('journalist');
  const [userMsg, setUserMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // PASSWORD CHANGE
  const [currPassword, setCurrPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [statusNotice, setStatusNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const triggerNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusNotice({ text, type });
    setTimeout(() => setStatusNotice(null), 3500);
  };

  const isCeo = currentUser.role === 'ceo';
  const isEditor = currentUser.role === 'editor';
  const canManageAds = isCeo || isEditor;

  // Load team users when security tab opens
  const loadUsers = async () => {
    if (!canManageAds) return;
    try {
      setIsLoadingUsers(true);
      const list = await api.fetchAllUsers();
      setUsersList(list);
    } catch (err: any) {
      console.error('Failed to load team users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'security') {
      loadUsers();
    }
  }, [activeTab]);

  // Handle Publish Article
  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artTitle.trim() || !artContent.trim()) return;

    const selectedStaff = staff.find(s => s.id === artAuthorId) || staff[0];

    const newArticle: Article = {
      id: `arn-art-${Date.now()}`,
      title: artTitle.trim(),
      subtitle: artSubtitle.trim() || undefined,
      category: artCategory,
      imageUrl: artImageUrl.trim() || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
      imageCaption: artCaption.trim() || undefined,
      publishedAt: new Date().toISOString(),
      readTime: '4 min read',
      authorId: selectedStaff?.id || currentUser.staffId,
      author: {
        name: selectedStaff?.name || currentUser.name,
        role: selectedStaff?.role || 'Correspondent',
        avatar: selectedStaff?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        bureau: selectedStaff?.bureau || 'Global Bureau'
      },
      isBreaking: artIsBreaking,
      isLead: artIsBreaking,
      keyTakeaways: artKeyTakeaway ? [artKeyTakeaway.trim()] : ['Verified by Air Real News newsroom telemetry.'],
      content: artContent.split('\n\n').filter(p => p.trim().length > 0),
      commentsCount: 0,
      tags: [artCategory, 'ARN News', 'Staff Desk']
    };

    onPublishArticle(newArticle);
    setArtTitle('');
    setArtSubtitle('');
    setArtContent('');
    setArtKeyTakeaway('');
    triggerNotice('Article successfully published and live on the front page.');
  };

  // Handle Create Ad
  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageAds) {
      triggerNotice('Only CEO and Senior Editors are authorized to publish commercial ad inventory.', 'error');
      return;
    }
    if (!adClient.trim() || !adTitle.trim()) return;

    const newAd: AdCampaign = {
      id: `ad-${Date.now()}`,
      clientName: adClient.trim(),
      title: adTitle.trim(),
      tagline: adTagline.trim() || 'Official Partner of Air Real News Media Network',
      targetUrl: adTargetUrl.trim() || 'https://airrealnews.org',
      imageUrl: adImageUrl.trim() || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      placement: adPlacement,
      active: true,
      impressions: 1,
      clicks: 0,
      badgeText: adBadge.trim() || 'SPONSORED'
    };

    onSaveAd(newAd);
    setAdClient('');
    setAdTitle('');
    setAdTagline('');
    triggerNotice('New commercial campaign activated across Air Real News inventory.');
  };

  // Handle Create Wire
  const handleCreateWire = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wireTitle.trim() || !wireContent.trim()) return;

    const now = new Date();
    const gmt = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')} GMT`;

    const newWire: LiveUpdate = {
      id: `wire-${Date.now()}`,
      timestamp: gmt,
      timeAgo: 'Just now',
      title: wireTitle.trim(),
      content: wireContent.trim(),
      author: wireAuthor.trim() || currentUser.name,
      isFlash: wireIsFlash,
      category: wireCategory.trim()
    };

    onAddLiveUpdate(newWire);
    setWireTitle('');
    setWireContent('');
    triggerNotice('Flash dispatch broadcast to live desk.');
  };

  // Handle Create Staff
  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageAds) {
      triggerNotice('Only CEO and Senior Editors can accredit new journalists.', 'error');
      return;
    }
    if (!staffName.trim() || !staffRole.trim()) return;

    const newStaff: StaffMember = {
      id: `staff-${Date.now()}`,
      name: staffName.trim(),
      role: staffRole.trim(),
      bureau: staffBureau,
      email: staffEmail.trim() || `${staffName.toLowerCase().replace(/\s+/g, '.')}@airrealnews.org`,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      bio: staffBio.trim() || 'Journalist at Air Real News reporting on global aviation and geopolitics.',
      articlesCount: 1
    };

    onAddStaffMember(newStaff);
    setStaffName('');
    setStaffRole('');
    setStaffBio('');
    triggerNotice('New staff member added to newsroom directory.');
  };

  // Handle Create New User Account
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newEmail.trim() || !newPassword.trim() || !newName.trim()) {
      setUserMsg({ type: 'error', text: 'All fields are required.' });
      return;
    }

    try {
      setUserMsg(null);
      await api.createUser({
        username: newUsername.trim(),
        email: newEmail.trim(),
        password: newPassword,
        role: newRole,
        name: newName.trim()
      });
      setUserMsg({ type: 'success', text: `Account created for ${newName} (${newRole.toUpperCase()})` });
      setNewUsername('');
      setNewEmail('');
      setNewPassword('');
      setNewName('');
      loadUsers();
    } catch (err: any) {
      setUserMsg({ type: 'error', text: err.message || 'Failed to create user account' });
    }
  };

  // Handle Delete User Account (CEO only)
  const handleDeleteUserAccount = async (userId: string, username: string) => {
    if (!isCeo) return;
    if (userId === currentUser.id) {
      triggerNotice('Cannot delete your own active CEO account.', 'error');
      return;
    }
    if (!confirm(`Are you sure you want to remove staff account "${username}"?`)) return;

    try {
      await api.deleteUser(userId);
      triggerNotice(`Staff account "${username}" deleted.`);
      loadUsers();
    } catch (err: any) {
      triggerNotice(err.message || 'Error deleting account', 'error');
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currPassword || !nextPassword) return;
    if (nextPassword.length < 6) {
      setPwMsg({ type: 'error', text: 'New passphrase must be at least 6 characters.' });
      return;
    }

    try {
      setPwMsg(null);
      await api.changePassword(currPassword, nextPassword);
      setPwMsg({ type: 'success', text: 'Passphrase changed successfully. Remember your new credentials.' });
      setCurrPassword('');
      setNextPassword('');
    } catch (err: any) {
      setPwMsg({ type: 'error', text: err.message || 'Passphrase change failed.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex justify-center items-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-slate-800 flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-black text-sm">
              ARN
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide flex items-center space-x-2">
                <span>Air Real News Newsroom Operations</span>
                <span className="bg-red-600/30 text-red-400 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-red-500/30">
                  {currentUser.role.toUpperCase()} CONSOLE
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Editorial Control, Live Telemetry Flash, Commercial Ads & Staff Management
              </p>
            </div>
          </div>

          {/* User Session pill */}
          <div className="flex items-center space-x-3 text-xs font-mono">
            <div className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-300 font-bold">{currentUser.name}</span>
              <span className="text-slate-500 text-[10px]">({currentUser.username})</span>
            </div>
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="flex items-center space-x-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-2.5 py-1 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Inline Status Notice */}
        {statusNotice && (
          <div className={`px-6 py-2.5 text-xs font-mono font-bold flex items-center justify-between transition-all ${
            statusNotice.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}>
            <span>{statusNotice.text}</span>
            <button onClick={() => setStatusNotice(null)} className="opacity-70 hover:opacity-100 font-bold ml-2">✕</button>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 px-6 pt-2 space-x-6 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('articles')}
            className={`pb-3 font-bold uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-colors ${
              activeTab === 'articles'
                ? 'border-red-600 text-red-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>Articles Desk ({articles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ads')}
            className={`pb-3 font-bold uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-colors ${
              activeTab === 'ads'
                ? 'border-red-600 text-red-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Ad Operations ({ads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('live')}
            className={`pb-3 font-bold uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-colors ${
              activeTab === 'live'
                ? 'border-red-600 text-red-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Live Wire Desk ({liveUpdates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`pb-3 font-bold uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-colors ${
              activeTab === 'staff'
                ? 'border-red-600 text-red-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Staff Directory ({staff.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 font-bold uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-colors ${
              activeTab === 'security'
                ? 'border-red-600 text-red-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security & Accounts {canManageAds && `(${usersList.length || '•'})`}</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* TAB 1: ARTICLES */}
          {activeTab === 'articles' && (
            <div className="space-y-8">
              <div className="bg-gray-50 dark:bg-slate-800/40 p-5 rounded-xl border border-gray-200 dark:border-slate-700">
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                  <PenTool className="w-4 h-4 text-red-600" />
                  <span>Draft & Publish Article as ARN Staff</span>
                </h4>

                <form onSubmit={handleCreateArticle} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-200 mb-1">
                      Article Headline *
                    </label>
                    <input
                      type="text"
                      value={artTitle}
                      onChange={(e) => setArtTitle(e.target.value)}
                      placeholder="e.g. NATO Scrambles Eurofighters as Unidentified Telemetry Crosses Baltic Corridor"
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-200 mb-1">
                      Subhead / Strategic Summary
                    </label>
                    <input
                      type="text"
                      value={artSubtitle}
                      onChange={(e) => setArtSubtitle(e.target.value)}
                      placeholder="e.g. Civil corridors rerouted through Warsaw Sector as transponders drop off automated radar."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-gray-700 dark:text-gray-200 mb-1">
                        Editorial Beat
                      </label>
                      <select
                        value={artCategory}
                        onChange={(e) => setArtCategory(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                      >
                        <option value="National">National</option>
                        <option value="Air & Aerospace">Air & Aerospace</option>
                        <option value="Defense & Security">Defense & Security</option>
                        <option value="World">World</option>
                        <option value="Geopolitics">Geopolitics</option>
                        <option value="Economy">Economy</option>
                        <option value="Climate & Tech">Climate & Tech</option>
                        <option value="Analysis">Analysis</option>
                        <option value="Investigation">Investigation</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 dark:text-gray-200 mb-1">
                        Accredited Author Bylines
                      </label>
                      <select
                        value={artAuthorId}
                        onChange={(e) => setArtAuthorId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                      >
                        {staff.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.role} - {s.bureau})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-gray-700 dark:text-gray-200 mb-1">
                        Featured Imagery (URL)
                      </label>
                      <input
                        type="url"
                        value={artImageUrl}
                        onChange={(e) => setArtImageUrl(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 dark:text-gray-200 mb-1">
                        Image Caption & Wire Attribution
                      </label>
                      <input
                        type="text"
                        value={artCaption}
                        onChange={(e) => setArtCaption(e.target.value)}
                        placeholder="e.g. Eurofighter Typhoon patrolling Baltic airspace / Reuters Pool"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-200 mb-1">
                      Key Takeaway / Verification Bullet
                    </label>
                    <input
                      type="text"
                      value={artKeyTakeaway}
                      onChange={(e) => setArtKeyTakeaway(e.target.value)}
                      placeholder="e.g. Polish Civil Aviation Authority confirms reroutes for 14 civilian corridors."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-200 mb-1">
                      Full Article Body (Separate paragraphs with double Enter) *
                    </label>
                    <textarea
                      rows={5}
                      value={artContent}
                      onChange={(e) => setArtContent(e.target.value)}
                      placeholder="Write comprehensive investigative dispatch..."
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div className="flex items-center space-x-3 pt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={artIsBreaking}
                        onChange={(e) => setArtIsBreaking(e.target.checked)}
                        className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                      />
                      <span className="font-bold text-red-600">
                        Designate as BREAKING NEWS & Lead Story Banner
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold font-mono uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center justify-center space-x-2"
                  >
                    <PenTool className="w-4 h-4" />
                    <span>Publish Story to Database & Front Page</span>
                  </button>
                </form>
              </div>

              {/* Published Articles Roster */}
              <div>
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-gray-900 dark:text-white mb-3">
                  Database Stories Archive ({articles.length})
                </h4>
                <div className="space-y-2">
                  {articles.map((art) => (
                    <div
                      key={art.id}
                      className="p-3 bg-white dark:bg-slate-800/60 rounded-lg border border-gray-200 dark:border-slate-700 flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <img
                          src={art.imageUrl}
                          alt={art.title}
                          className="w-12 h-10 object-cover rounded shrink-0"
                        />
                        <div className="truncate">
                          <div className="font-bold text-gray-900 dark:text-white truncate">
                            {art.title}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {art.category} &bull; {art.author.name} &bull; {art.publishedAt}
                            {art.isBreaking && <span className="text-red-500 ml-2 font-black">[BREAKING]</span>}
                            {art.isLead && <span className="text-blue-500 ml-2 font-black">[LEAD]</span>}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteArticle(art.id)}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors shrink-0"
                        title="Delete Article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ADS */}
          {activeTab === 'ads' && (
            <div className="space-y-8">
              {!canManageAds && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-300 text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Your account role ({currentUser.role.toUpperCase()}) has read-only access to commercial ad inventory. Managing Editor or CEO credentials required to deploy campaigns.</span>
                </div>
              )}

              {canManageAds && (
                <div className="bg-gray-50 dark:bg-slate-800/40 p-5 rounded-xl border border-gray-200 dark:border-slate-700">
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                    <Megaphone className="w-4 h-4 text-red-600" />
                    <span>Create & Schedule Commercial Sponsorship</span>
                  </h4>

                  <form onSubmit={handleCreateAd} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-gray-700 dark:text-gray-200 mb-1">
                          Client / Sponsor Name *
                        </label>
                        <input
                          type="text"
                          value={adClient}
                          onChange={(e) => setAdClient(e.target.value)}
                          placeholder="e.g. Rolls-Royce Aerospace"
                          required
                          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 dark:text-gray-200 mb-1">
                          Placement Position
                        </label>
                        <select
                          value={adPlacement}
                          onChange={(e) => setAdPlacement(e.target.value as any)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                        >
                          <option value="top-billboard">Top Billboard (Above Fold)</option>
                          <option value="sidebar">Sidebar Spotlight (Investigations)</option>
                          <option value="in-feed">In-Feed Native Story</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 dark:text-gray-200 mb-1">
                        Campaign Headline *
                      </label>
                      <input
                        type="text"
                        value={adTitle}
                        onChange={(e) => setAdTitle(e.target.value)}
                        placeholder="e.g. Sustainable Aviation Fuel Solutions: Powering the Transatlantic Future"
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 dark:text-gray-200 mb-1">
                        Tagline / Value Proposition
                      </label>
                      <input
                        type="text"
                        value={adTagline}
                        onChange={(e) => setAdTagline(e.target.value)}
                        placeholder="e.g. Explore our Next-Gen Turbofan Technologies delivering 25% lower lifecycle emissions."
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-gray-700 dark:text-gray-200 mb-1">
                          Target Destination URL
                        </label>
                        <input
                          type="url"
                          value={adTargetUrl}
                          onChange={(e) => setAdTargetUrl(e.target.value)}
                          required
                          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 dark:text-gray-200 mb-1">
                          Banner Image URL
                        </label>
                        <input
                          type="url"
                          value={adImageUrl}
                          onChange={(e) => setAdImageUrl(e.target.value)}
                          required
                          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold font-mono uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center justify-center space-x-2"
                    >
                      <Megaphone className="w-4 h-4" />
                      <span>Deploy Commercial Campaign</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Active Campaigns List */}
              <div>
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-gray-900 dark:text-white mb-3">
                  Active Commercial Inventory & Metrics ({ads.length})
                </h4>
                <div className="space-y-3">
                  {ads.map((ad) => {
                    const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0.00';
                    return (
                      <div
                        key={ad.id}
                        className="p-4 bg-white dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4 text-xs"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={ad.imageUrl}
                            alt={ad.title}
                            className="w-16 h-12 object-cover rounded-lg shrink-0"
                          />
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white text-sm">
                              {ad.title}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              Sponsor: <span className="text-red-600 font-bold">{ad.clientName}</span> &bull; Placement: {ad.placement}
                            </div>
                            <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-mono mt-1">
                              <span>Impressions: <strong className="text-slate-700 dark:text-slate-200">{ad.impressions}</strong></span>
                              <span>Clicks: <strong className="text-slate-700 dark:text-slate-200">{ad.clicks}</strong></span>
                              <span>CTR: <strong className="text-emerald-500">{ctr}%</strong></span>
                            </div>
                          </div>
                        </div>

                        {canManageAds && (
                          <div className="flex items-center space-x-2 ml-auto">
                            <button
                              onClick={() => onToggleAd(ad.id)}
                              className={`px-3 py-1.5 rounded-lg font-bold font-mono text-[10px] uppercase transition-colors ${
                                ad.active
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {ad.active ? 'Active' : 'Paused'}
                            </button>
                            <button
                              onClick={() => onDeleteAd(ad.id)}
                              className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                              title="Delete Ad"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE WIRE */}
          {activeTab === 'live' && (
            <div className="space-y-8">
              <div className="bg-gray-50 dark:bg-slate-800/40 p-5 rounded-xl border border-gray-200 dark:border-slate-700">
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                  <Radio className="w-4 h-4 text-red-600" />
                  <span>Broadcast Real-Time Wire Flash</span>
                </h4>

                <form onSubmit={handleCreateWire} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-200 mb-1">
                      Flash Dispatch Title *
                    </label>
                    <input
                      type="text"
                      value={wireTitle}
                      onChange={(e) => setWireTitle(e.target.value)}
                      placeholder="e.g. Heathrow Runway 27L Temporarily Suspends Operations for Runway Inspection"
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-gray-700 dark:text-gray-200 mb-1">
                        Category Beat
                      </label>
                      <input
                        type="text"
                        value={wireCategory}
                        onChange={(e) => setWireCategory(e.target.value)}
                        placeholder="e.g. Airspace Alert, Defense, Airport Ops"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 dark:text-gray-200 mb-1">
                        Dispatched By
                      </label>
                      <input
                        type="text"
                        value={wireAuthor}
                        onChange={(e) => setWireAuthor(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-200 mb-1">
                      Dispatch Telemetry & Description *
                    </label>
                    <textarea
                      rows={3}
                      value={wireContent}
                      onChange={(e) => setWireContent(e.target.value)}
                      placeholder="Full details of the real-time development..."
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={wireIsFlash}
                        onChange={(e) => setWireIsFlash(e.target.checked)}
                        className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                      />
                      <span className="font-bold text-red-600">
                        Mark as Urgent Red Flash (Pushes to top of live wire feed)
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold font-mono uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center justify-center space-x-2"
                  >
                    <Radio className="w-4 h-4" />
                    <span>Broadcast Wire Flash to Live Desk</span>
                  </button>
                </form>
              </div>

              {/* Wire Feed History */}
              <div>
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-gray-900 dark:text-white mb-3">
                  Recent Dispatches ({liveUpdates.length})
                </h4>
                <div className="space-y-2">
                  {liveUpdates.slice(0, 15).map((up) => (
                    <div
                      key={up.id}
                      className="p-3 bg-white dark:bg-slate-800/60 rounded-lg border border-gray-200 dark:border-slate-700 text-xs"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                        <span className="text-red-600 font-bold">{up.timestamp}</span>
                        <span>{up.category} &bull; {up.author}</span>
                      </div>
                      <div className="font-bold text-gray-900 dark:text-white">
                        {up.title}
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                        {up.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STAFF DIRECTORY */}
          {activeTab === 'staff' && (
            <div className="space-y-8">
              {canManageAds && (
                <div className="bg-gray-50 dark:bg-slate-800/40 p-5 rounded-xl border border-gray-200 dark:border-slate-700">
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                    <Users className="w-4 h-4 text-red-600" />
                    <span>Accredit New Staff Correspondent</span>
                  </h4>

                  <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-gray-700 dark:text-gray-200 mb-1">
                          Full Legal Journalist Name *
                        </label>
                        <input
                          type="text"
                          value={staffName}
                          onChange={(e) => setStaffName(e.target.value)}
                          placeholder="e.g. Sarah Jenkins"
                          required
                          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 dark:text-gray-200 mb-1">
                          Editorial Role & Beat *
                        </label>
                        <input
                          type="text"
                          value={staffRole}
                          onChange={(e) => setStaffRole(e.target.value)}
                          placeholder="e.g. Chief Aerospace Safety Correspondent"
                          required
                          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-gray-700 dark:text-gray-200 mb-1">
                          Assigned Bureau Desk
                        </label>
                        <select
                          value={staffBureau}
                          onChange={(e) => setStaffBureau(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                        >
                          <option value="London (Westminster Bureau)">London (Westminster Bureau)</option>
                          <option value="Geneva (Palais des Nations)">Geneva (Palais des Nations)</option>
                          <option value="Washington, D.C. (National Press)">Washington, D.C. (National Press)</option>
                          <option value="Brussels (EU Transport Bureau)">Brussels (EU Transport Bureau)</option>
                          <option value="Singapore (Changi Hub)">Singapore (Changi Hub)</option>
                          <option value="Nairobi (East Africa Desk)">Nairobi (East Africa Desk)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 dark:text-gray-200 mb-1">
                          Newsroom Wire Email
                        </label>
                        <input
                          type="email"
                          value={staffEmail}
                          onChange={(e) => setStaffEmail(e.target.value)}
                          placeholder="e.g. s.jenkins@airrealnews.org"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 dark:text-gray-200 mb-1">
                        Professional Bio & Accreditation
                      </label>
                      <textarea
                        rows={2}
                        value={staffBio}
                        onChange={(e) => setStaffBio(e.target.value)}
                        placeholder="Summary of journalistic credentials and background..."
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold font-mono uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center justify-center space-x-2"
                    >
                      <Users className="w-4 h-4" />
                      <span>Accredit Journalist to Newsroom</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Roster of Accredited Staff */}
              <div>
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-gray-900 dark:text-white mb-3">
                  Current ARN Editorial Newsroom Team ({staff.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {staff.map((member) => (
                    <div
                      key={member.id}
                      className="p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 flex items-start space-x-3.5 text-xs"
                    >
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-red-600 shrink-0"
                      />
                      <div>
                        <h5 className="font-extrabold text-gray-900 dark:text-white text-sm">
                          {member.name}
                        </h5>
                        <p className="font-bold text-red-600 text-[11px]">{member.role}</p>
                        <p className="text-slate-400 text-[10px]">{member.bureau} &bull; {member.email}</p>
                        <p className="text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{member.bio}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY & USER ACCOUNTS */}
          {activeTab === 'security' && (
            <div className="space-y-8">
              
              {/* Change Password Card (Available to all logged in users) */}
              <div className="bg-gray-50 dark:bg-slate-800/40 p-5 rounded-xl border border-gray-200 dark:border-slate-700">
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                  <KeyRound className="w-4 h-4 text-red-600" />
                  <span>Update Your Newsroom Passphrase</span>
                </h4>

                {pwMsg && (
                  <div className={`p-3 rounded-lg text-xs mb-3 ${
                    pwMsg.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                      : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200'
                  }`}>
                    {pwMsg.text}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4 text-xs max-w-lg">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-200 mb-1">
                      Current Passphrase
                    </label>
                    <input
                      type="password"
                      value={currPassword}
                      onChange={(e) => setCurrPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-200 mb-1">
                      New Passphrase (min 6 chars)
                    </label>
                    <input
                      type="password"
                      value={nextPassword}
                      onChange={(e) => setNextPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white font-bold font-mono text-xs uppercase tracking-wider rounded-lg transition"
                  >
                    Save New Passphrase
                  </button>
                </form>
              </div>

              {/* CEO & Editor Section: User Accounts Roster & Account Provisioning */}
              {canManageAds ? (
                <>
                  {/* Create New Newsroom Account */}
                  <div className="bg-gray-50 dark:bg-slate-800/40 p-5 rounded-xl border border-gray-200 dark:border-slate-700">
                    <h4 className="font-extrabold text-sm uppercase tracking-wider text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                      <UserCheck className="w-4 h-4 text-red-600" />
                      <span>Provision New Staff Login Account</span>
                    </h4>

                    {userMsg && (
                      <div className={`p-3 rounded-lg text-xs mb-3 ${
                        userMsg.type === 'success'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                          : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200'
                      }`}>
                        {userMsg.text}
                      </div>
                    )}

                    <form onSubmit={handleCreateAccount} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-gray-700 dark:text-gray-200 mb-1">
                            Staff Full Name *
                          </label>
                          <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="e.g. David Althaus"
                            required
                            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-gray-700 dark:text-gray-200 mb-1">
                            Username / Staff Handle *
                          </label>
                          <input
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="e.g. d.althaus"
                            required
                            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block font-bold text-gray-700 dark:text-gray-200 mb-1">
                            Newsroom Email *
                          </label>
                          <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="e.g. d.althaus@airrealnews.org"
                            required
                            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-gray-700 dark:text-gray-200 mb-1">
                            Initial Passphrase *
                          </label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••••••"
                            required
                            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-gray-700 dark:text-gray-200 mb-1">
                            Access Role
                          </label>
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value as any)}
                            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          >
                            <option value="journalist">Journalist (Articles & Wire)</option>
                            <option value="editor">Managing Editor (Publishing, Ads, Staff)</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="py-2.5 px-6 bg-red-600 hover:bg-red-700 text-white font-bold font-mono text-xs uppercase tracking-wider rounded-lg transition"
                      >
                        Create Newsroom Account
                      </button>
                    </form>
                  </div>

                  {/* Registered Users Table */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-extrabold text-sm uppercase tracking-wider text-gray-900 dark:text-white">
                        Authenticated Newsroom Roster ({usersList.length})
                      </h4>
                      <button
                        onClick={loadUsers}
                        className="flex items-center space-x-1 text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-mono"
                      >
                        <RefreshCw className={`w-3 h-3 ${isLoadingUsers ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase">
                          <tr>
                            <th className="p-3">Staff Name</th>
                            <th className="p-3">Username</th>
                            <th className="p-3">Role</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Last Active</th>
                            {isCeo && <th className="p-3 text-right">Action</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                          {usersList.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                              <td className="p-3 font-sans font-bold text-slate-900 dark:text-white">
                                {u.name}
                                {u.id === currentUser.id && (
                                  <span className="ml-2 text-[10px] text-red-500 font-mono">(You)</span>
                                )}
                              </td>
                              <td className="p-3 text-slate-600 dark:text-slate-300">{u.username}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  u.role === 'ceo'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300'
                                    : u.role === 'editor'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300'
                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                                }`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="p-3 text-slate-500">{u.email}</td>
                              <td className="p-3 text-slate-400 text-[11px]">
                                {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}
                              </td>
                              {isCeo && (
                                <td className="p-3 text-right">
                                  {u.id !== currentUser.id && (
                                    <button
                                      onClick={() => handleDeleteUserAccount(u.id, u.username)}
                                      className="text-red-500 hover:text-red-700 p-1"
                                      title="Remove staff account"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl text-xs text-slate-500">
                  User accounts and newsroom team credentials are administered by the Chief Executive and Senior Editors.
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
