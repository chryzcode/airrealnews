import React, { useState } from 'react';
import { 
  Mail, 
  Tv, 
  ArrowUp, 
  Send, 
  CheckCircle2, 
  Shield, 
  Radio, 
  Megaphone,
  MapPin,
  ExternalLink,
  Satellite,
  Lock,
  FileText,
  AlertTriangle,
  Play
} from 'lucide-react';
import { InfoModalContent } from './InfoModal';

interface FooterProps {
  onSelectCategory: (category: string) => void;
  onOpenLiveBroadcast: () => void;
  onOpenCMS: () => void;
  onOpenInfoModal: (content: InfoModalContent) => void;
  onScrollToRadar: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenLiveBroadcast,
  onOpenCMS,
  onOpenInfoModal,
  onScrollToRadar,
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // BUREAU MODAL TRIGGER
  const handleOpenBureau = (bureauName: string, location: string, chief: string, focus: string, contact: string) => {
    onOpenInfoModal({
      title: `${bureauName} Bureau Dossier`,
      badge: 'OFFICIAL ARN BUREAU',
      type: 'bureau',
      subtitle: `Direct reporting presence in ${location}`,
      body: (
        <div className="space-y-4">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-sm text-slate-900 dark:text-white">Headquarters & Bureau Location</h5>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{location}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400">Bureau Chief</span>
              <p className="font-bold text-slate-900 dark:text-white mt-1">{chief}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400">Secure Dispatch Wire</span>
              <p className="font-mono text-red-600 font-bold mt-1">{contact}</p>
            </div>
          </div>

          <div>
            <h6 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-1">Operational Mandate & Beats</h6>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">{focus}</p>
          </div>

          <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300">
            <strong>24/7 Verified Ingestion:</strong> All dispatches from this bureau undergo cryptographic transponder and document verification prior to wire publication.
          </div>
        </div>
      )
    });
  };

  // STANDARDS MODAL TRIGGER
  const handleOpenCharter = () => {
    onOpenInfoModal({
      title: 'ARN Editorial Independence Charter',
      badge: 'STANDARDS & ETHICS',
      type: 'standards',
      subtitle: 'Guiding principles governing Air Real News global operations',
      body: (
        <div className="space-y-3.5 text-xs">
          <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
            Air Real News operates under a strict charter of non-aligned independence, insulated from sovereign pressures, commercial interference, and regional geopolitical blocs.
          </p>
          <div className="space-y-2 border-l-2 border-red-600 pl-3">
            <div>
              <strong className="text-slate-900 dark:text-white block font-bold">1. Factual Verification:</strong>
              <span className="text-slate-600 dark:text-slate-300">Airspace telemetry, satellite tracking data, and diplomatic drafts must be cross-verified against primary flight logs and independent radar nodes.</span>
            </div>
            <div>
              <strong className="text-slate-900 dark:text-white block font-bold">2. Protection of Civil Aviation:</strong>
              <span className="text-slate-600 dark:text-slate-300">The platform holds that the world’s skies are a shared human sanctuary; reporting prioritizes passenger safety, de-escalation, and humanitarian transit corridors.</span>
            </div>
            <div>
              <strong className="text-slate-900 dark:text-white block font-bold">3. Separation of Editorial and Commercial:</strong>
              <span className="text-slate-600 dark:text-slate-300">Commercial sponsors and advertisers have zero influence over newsroom investigations, headlines, or staff commentary.</span>
            </div>
          </div>
        </div>
      )
    });
  };

  // ADVERTISING GUIDELINES TRIGGER
  const handleOpenAdGuidelines = () => {
    onOpenInfoModal({
      title: 'Commercial Advertising Guidelines & Media Kit',
      badge: 'COMMERCIAL PARTNERSHIPS',
      type: 'advertising',
      subtitle: 'Reach 2.4M high-level decision makers in civil aviation, defense, and policy',
      body: (
        <div className="space-y-4 text-xs">
          <p className="leading-relaxed">
            Air Real News partners with certified aerospace manufacturers, sovereign airlines, air traffic management providers, and clean fuel innovators.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-900 dark:text-white block">Top Billboard</span>
              <span className="text-slate-400 text-[11px] block mt-0.5">1200 &times; 180 px</span>
              <span className="text-red-600 font-mono font-bold text-xs mt-2 block">Premium Hero Position</span>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-900 dark:text-white block">Sidebar Spotlight</span>
              <span className="text-slate-400 text-[11px] block mt-0.5">400 &times; 300 px</span>
              <span className="text-red-600 font-mono font-bold text-xs mt-2 block">High Engagement Beat</span>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-900 dark:text-white block">In-Feed Native</span>
              <span className="text-slate-400 text-[11px] block mt-0.5">Full Width Responsive</span>
              <span className="text-red-600 font-mono font-bold text-xs mt-2 block">Sponsored Briefing</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <h6 className="font-bold text-slate-900 dark:text-white mb-1">Direct Campaign Activation</h6>
            <p className="text-slate-600 dark:text-slate-300">
              ARN Staff and authorized commercial reps can deploy ad banners and review live click-through analytics instantly through the internal <strong>Staff Portal & Ads</strong> desk.
            </p>
          </div>
        </div>
      )
    });
  };

  // SOURCE ANONYMITY TRIGGER
  const handleOpenSourceProtection = () => {
    onOpenInfoModal({
      title: 'Source Anonymity & Whistleblower Protocol',
      badge: 'SECURE COMMUNICATIONS',
      type: 'standards',
      subtitle: 'End-to-end encrypted drop for aviation safety engineers and civil servants',
      body: (
        <div className="space-y-4 text-xs">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold">
            <Lock className="w-4 h-4" />
            <span>Zero-Knowledge Cryptographic Ingestion Active</span>
          </div>
          <p className="leading-relaxed">
            If you are a commercial airline pilot, air traffic controller, aerospace safety inspector, or sovereign transit official with evidence of airspace violations, transponder manipulation, or safety breaches:
          </p>
          <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono space-y-2 border border-slate-800 text-[11px]">
            <div>PGP Key Fingerprint: 4E91 B288 9102 AC44 8701 5490 2811 E09A</div>
            <div>Tor SecureDrop: airrealnewsdropradartransit772.onion</div>
            <div>Signal Wire Desk: +41 22 917 8820 (Geneva Desk)</div>
          </div>
          <p className="text-slate-500 italic">
            ARN journalists will never disclose the identity of verified whistleblowers under any jurisdiction.
          </p>
        </div>
      )
    });
  };

  // CORRECTIONS POLICY TRIGGER
  const handleOpenCorrections = () => {
    onOpenInfoModal({
      title: 'Corrections & Retractions Policy',
      badge: 'ACCOUNTABILITY',
      type: 'standards',
      subtitle: 'Transparency log and factual dispute resolution',
      body: (
        <div className="space-y-3.5 text-xs">
          <p className="leading-relaxed">
            Air Real News maintains an open, public accountability policy. When factual errors in flight telemetry, aircraft models, or diplomatic attribution occur, they are corrected immediately and noted at the top of the article.
          </p>
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">To Submit a Factual Clarification:</span>
            <p className="text-slate-600 dark:text-slate-300">
              Email: <strong className="text-red-600 font-mono">corrections@airrealnews.org</strong> with article ID, flight callsign, and verifiable primary source documentation.
            </p>
          </div>
        </div>
      )
    });
  };

  // SATELLITE TRANSPONDER GUIDE TRIGGER
  const handleOpenTransponders = (satelliteName: string, orbital: string, freq: string, pol: string, fec: string) => {
    onOpenInfoModal({
      title: `${satelliteName} Broadcast Transponder`,
      badge: 'DOWNLINK SPECIFICATION',
      type: 'satellite',
      subtitle: `Direct satellite transmission parameters across ${orbital}`,
      body: (
        <div className="space-y-4 text-xs font-mono">
          <div className="p-4 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-400">Orbital Slot</span>
              <span className="font-bold text-red-400">{orbital}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-400">Downlink Frequency</span>
              <span className="font-bold text-white">{freq}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-400">Polarization / Symbol Rate</span>
              <span className="font-bold text-white">{pol} / 27500 kSym/s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Modulation / FEC</span>
              <span className="font-bold text-emerald-400">DVB-S2 / 8PSK ({fec})</span>
            </div>
          </div>
          <p className="text-slate-500 font-sans text-xs">
            Free-To-Air (FTA) unencrypted high-definition transmission available to commercial flight decks, ATC operations rooms, and home satellite receivers worldwide.
          </p>
        </div>
      )
    });
  };

  // DIGITAL / OTT APPS TRIGGER
  const handleOpenOTTApps = () => {
    onOpenInfoModal({
      title: 'ARN Digital & Connected TV Applications',
      badge: 'OTT STREAMING',
      type: 'satellite',
      subtitle: 'Stream Air Real News Live 24/7 on any screen',
      body: (
        <div className="space-y-3.5 text-xs">
          <p className="leading-relaxed">
            Air Real News broadcasts uninterrupted 24/7 coverage and continuous corridor radar displays across all major connected television and mobile platforms.
          </p>
          <div className="grid grid-cols-2 gap-3 font-sans">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-900 dark:text-white block">Apple TV</span>
              <span className="text-slate-400 text-[11px]">tvOS App Store &bull; 4K UHD</span>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-900 dark:text-white block">Google TV / Android</span>
              <span className="text-slate-400 text-[11px]">Play Store &bull; Live Telemetry</span>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-900 dark:text-white block">Roku TV</span>
              <span className="text-slate-400 text-[11px]">Roku Channel Store</span>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-900 dark:text-white block">Amazon Fire TV</span>
              <span className="text-slate-400 text-[11px]">Amazon Appstore</span>
            </div>
          </div>
        </div>
      )
    });
  };

  // LEGAL POLICIES TRIGGER
  const handleOpenLegal = (type: 'privacy' | 'terms' | 'adTerms') => {
    if (type === 'privacy') {
      onOpenInfoModal({
        title: 'Privacy Policy & Zero-Tracking Protocol',
        badge: 'LEGAL CHARTER',
        type: 'policy',
        subtitle: 'Our absolute commitment to reader and source data privacy',
        body: (
          <div className="space-y-3 text-xs leading-relaxed">
            <p>
              Air Real News does not sell, broker, or monetize reader telemetry, IP addresses, or reading behavior. We believe independent journalism cannot exist under surveillance capitalism.
            </p>
            <p>
              Local preferences such as bookmarks, dark mode preferences, and verified comments are stored strictly on your local browser device.
            </p>
          </div>
        )
      });
    } else if (type === 'terms') {
      onOpenInfoModal({
        title: 'Terms of Use & Content Syndication',
        badge: 'LEGAL AGREEMENT',
        type: 'policy',
        subtitle: 'Rules governing fair use and telemetry data quotation',
        body: (
          <div className="space-y-3 text-xs leading-relaxed">
            <p>
              All original investigative reporting, airspace corridor graphics, and telemetry analyses published by Air Real News are protected under international copyright law.
            </p>
            <p>
              News organizations and researchers may quote up to 150 words with direct attribution to <strong>Air Real News (ARN)</strong> and a live link to the original dispatch.
            </p>
          </div>
        )
      });
    } else {
      onOpenInfoModal({
        title: 'Commercial Advertising Terms',
        badge: 'LEGAL AGREEMENT',
        type: 'policy',
        subtitle: 'Terms governing sponsor campaigns and disclosures',
        body: (
          <div className="space-y-3 text-xs leading-relaxed">
            <p>
              All sponsor banners on Air Real News must clearly display the <strong>SPONSORED</strong> or <strong>PARTNER</strong> badge.
            </p>
            <p>
              Advertisers are solely responsible for compliance with international civil aviation regulations and trade laws. ARN reserves the right to reject any campaign violating passenger safety standards.
            </p>
          </div>
        )
      });
    }
  };

  return (
    <footer className="bg-slate-950 text-gray-300 border-t border-slate-800 pt-14 pb-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Top Newsletter & Network Mission Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b border-slate-800 items-center">
          
          <div className="lg:col-span-7">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center text-white font-black">
                ARN
              </div>
              <span className="text-2xl font-black text-white tracking-wider uppercase font-sans">
                AIR REAL NEWS
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Air Real News (ARN) is an independent international broadcast and digital news organization. We provide verified reporting on civil aviation, international airspace corridors, planetary science, sovereign defense, and frontline global developments.
            </p>
          </div>

          {/* Newsletter Box */}
          <div className="lg:col-span-5 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-black uppercase tracking-wider text-red-500 mb-1 flex items-center space-x-1.5">
              <Mail className="w-4 h-4 text-red-500" />
              <span>Subscribe to The Air Real Dispatch</span>
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Morning intelligence briefing on global airspace, defense corridors, and verified world wire dispatches.
            </p>

            {subscribed ? (
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold py-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Thank you. You are subscribed to Air Real News morning dispatches.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your work email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-black flex items-center space-x-1 transition-colors"
                >
                  <span>Subscribe</span>
                  <Send className="w-3 h-3 ml-1" />
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Bureau Locations & Interactive Navigation Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 py-10 border-b border-slate-800 text-xs">
          
          {/* 1. NEWSROOM BUREAUS (Interactive Dossiers) */}
          <div>
            <h5 className="font-black uppercase tracking-wider text-white mb-3 text-[11px] text-red-500 flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-red-500" />
              <span>Newsroom Bureaus</span>
            </h5>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  onClick={() => handleOpenBureau('London', 'Farnborough Aerospace Park & Westminster Press Gallery', 'Marcus Sterling', 'Aviation security, defense acquisitions, and transatlantic flight corridors.', 'london-desk@airrealnews.org')}
                  className="hover:text-white hover:underline text-left transition-colors"
                >
                  London (Farnborough / Westminster)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleOpenBureau('Geneva', 'Palais des Nations & ICAO Transit Liaison Centre', 'Elena Vance', 'Multilateral airspace treaties, demilitarized humanitarian flight paths, and UN transit law.', 'geneva-desk@airrealnews.org')}
                  className="hover:text-white hover:underline text-left transition-colors"
                >
                  Geneva (Palais des Nations)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleOpenBureau('Washington, D.C.', 'National Press Building & FAA Briefing Desk', 'David Thorne', 'North American civil airspace safety, aerospace industrial policy, and regulatory accords.', 'dc-desk@airrealnews.org')}
                  className="hover:text-white hover:underline text-left transition-colors"
                >
                  Washington, D.C. (National Press)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleOpenBureau('Brussels', 'European Transport Bureau & Eurocontrol Liaison', 'Julian Croft', 'Cross-border radar verification, transponder cryptography, and illicit cargo sanctions.', 'brussels-desk@airrealnews.org')}
                  className="hover:text-white hover:underline text-left transition-colors"
                >
                  Brussels (EU Transport Bureau)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleOpenBureau('Singapore', 'Changi Aviation Hub & Asia-Pacific Radar Node', 'Priya Nair', 'Pacific flight corridors, sustainable aviation fuels (SAF), and high-altitude jet streams.', 'singapore-desk@airrealnews.org')}
                  className="hover:text-white hover:underline text-left transition-colors"
                >
                  Singapore (Changi Aviation Hub)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleOpenBureau('Nairobi', 'East Africa Aviation Safety Hub', 'Amara Diop', 'Central and East African civilian airspace corridors and humanitarian relief logistics.', 'nairobi-desk@airrealnews.org')}
                  className="hover:text-white hover:underline text-left transition-colors"
                >
                  Nairobi (East Africa Desk)
                </button>
              </li>
            </ul>
          </div>

          {/* 2. EDITORIAL BEATS (Instant Category Filtering) */}
          <div>
            <h5 className="font-black uppercase tracking-wider text-white mb-3 text-[11px] text-red-500">
              Editorial Beats
            </h5>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  onClick={() => onSelectCategory('National')}
                  className="hover:text-red-400 hover:underline text-left transition-colors"
                >
                  Nigeria National Desk
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Air & Aerospace')}
                  className="hover:text-red-400 hover:underline text-left transition-colors"
                >
                  Air & Aerospace Corridors
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Defense & Security')}
                  className="hover:text-red-400 hover:underline text-left transition-colors"
                >
                  Defense & Satellite Sovereignty
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Climate & Tech')}
                  className="hover:text-red-400 hover:underline text-left transition-colors"
                >
                  Climate & Atmospheric Dynamics
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Geopolitics')}
                  className="hover:text-red-400 hover:underline text-left transition-colors"
                >
                  Global Geopolitics
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Economy')}
                  className="hover:text-red-400 hover:underline text-left transition-colors"
                >
                  Aviation Economy & Markets
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Investigation')}
                  className="hover:text-red-400 hover:underline text-left transition-colors"
                >
                  Forensic Investigations
                </button>
              </li>
            </ul>
          </div>

          {/* 3. BROADCASTING CHANNELS (Active View Triggers) */}
          <div>
            <h5 className="font-black uppercase tracking-wider text-white mb-3 text-[11px] text-red-500 flex items-center space-x-1">
              <Tv className="w-3 h-3 text-red-500" />
              <span>Broadcasting Channels</span>
            </h5>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  onClick={onOpenLiveBroadcast}
                  className="text-white hover:text-red-400 font-bold flex items-center space-x-1 transition-colors"
                >
                  <Tv className="w-3 h-3 text-red-500" />
                  <span>ARN Live 24/7 TV Stream</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenLiveBroadcast}
                  className="hover:text-white flex items-center space-x-1 transition-colors"
                >
                  <Radio className="w-3 h-3 text-slate-400" />
                  <span>Air Real Podcasts & Audio</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onScrollToRadar}
                  className="hover:text-red-400 text-left transition-colors flex items-center space-x-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                  <span>Corridor Telemetry Monitor</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenLiveBroadcast}
                  className="hover:text-white text-left transition-colors"
                >
                  The Strategic Stream
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Investigation')}
                  className="hover:text-white text-left transition-colors"
                >
                  Fault Lines Aerospace Docs
                </button>
              </li>
            </ul>
          </div>

          {/* 4. STANDARDS & ADVERTISING (Interactive Policies & CMS) */}
          <div>
            <h5 className="font-black uppercase tracking-wider text-white mb-3 text-[11px] text-red-500 flex items-center space-x-1">
              <Shield className="w-3 h-3 text-red-500" />
              <span>Standards & Advertising</span>
            </h5>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  onClick={handleOpenCharter}
                  className="hover:text-white hover:underline text-left transition-colors"
                >
                  ARN Editorial Independence Charter
                </button>
              </li>
              <li>
                <button
                  onClick={handleOpenAdGuidelines}
                  className="hover:text-white hover:underline text-left transition-colors"
                >
                  Commercial Advertising Guidelines
                </button>
              </li>
              <li>
                <button
                  onClick={handleOpenSourceProtection}
                  className="hover:text-white hover:underline text-left transition-colors"
                >
                  Source Anonymity Protocol
                </button>
              </li>
              <li>
                <button
                  onClick={handleOpenCorrections}
                  className="hover:text-white hover:underline text-left transition-colors"
                >
                  Corrections & Retractions Policy
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenCMS}
                  className="text-red-400 hover:text-red-300 font-bold hover:underline flex items-center space-x-1 transition-colors"
                >
                  <Megaphone className="w-3 h-3" />
                  <span>Staff News & Ad Console</span>
                </button>
              </li>
            </ul>
          </div>

          {/* 5. BROADCAST TRANSPONDERS & APPS (Interactive Downlink Guides) */}
          <div>
            <h5 className="font-black uppercase tracking-wider text-white mb-3 text-[11px] text-red-500 flex items-center space-x-1">
              <Satellite className="w-3 h-3 text-red-500" />
              <span>Broadcast Transponders</span>
            </h5>
            <div className="text-[11px] text-slate-400 space-y-2 font-mono">
              <div>
                <button
                  onClick={() => handleOpenTransponders('ASTRA 2E', '28.2° East', '11.914 GHz', 'Horizontal', '3/4')}
                  className="text-white hover:text-red-400 font-bold hover:underline text-left block"
                >
                  ASTRA 2E / 28.2E &bull; DVB-S2
                </button>
                <p className="text-[10px] text-slate-500">11.914 H / 27500</p>
              </div>

              <div>
                <button
                  onClick={() => handleOpenTransponders('EUTELSAT 10B', '10.0° East', '11.222 GHz', 'Vertical', '5/6')}
                  className="text-white hover:text-red-400 font-bold hover:underline text-left block mt-2"
                >
                  EUTELSAT 10B &bull; Aviation Feeds
                </button>
                <p className="text-[10px] text-slate-500">11.222 V / 27500</p>
              </div>

              <div>
                <button
                  onClick={handleOpenOTTApps}
                  className="text-red-400 hover:text-red-300 font-bold hover:underline text-left block mt-2"
                >
                  DIGITAL / OTT APPS
                </button>
                <p className="text-[10px] text-slate-500">Apple TV, Google TV, Roku</p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Interactive Legal Links */}
        <div className="pt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center space-x-4">
            <p>&copy; {new Date().getFullYear()} Air Real News (ARN) Media Network. All global rights reserved.</p>
            <span className="hidden sm:inline">&bull;</span>
            <button
              onClick={() => handleOpenLegal('privacy')}
              className="hover:text-red-400 hover:underline transition-colors"
            >
              Privacy Policy
            </button>
            <span>&bull;</span>
            <button
              onClick={() => handleOpenLegal('terms')}
              className="hover:text-red-400 hover:underline transition-colors"
            >
              Terms of Use
            </button>
            <span>&bull;</span>
            <button
              onClick={() => handleOpenLegal('adTerms')}
              className="hover:text-red-400 hover:underline transition-colors"
            >
              Advertising Terms
            </button>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center space-x-1.5 text-slate-400 hover:text-white transition-colors bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
