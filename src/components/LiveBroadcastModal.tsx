import React, { useState } from 'react';
import { 
  X, 
  Users, 
  MessageCircle, 
  Send
} from 'lucide-react';

interface LiveBroadcastModalProps {
  onClose: () => void;
}

export const LiveBroadcastModal: React.FC<LiveBroadcastModalProps> = ({ onClose }) => {
  const [activeBureau, setActiveBureau] = useState('London Master Desk');
  const [chatMessages, setChatMessages] = useState([
    { user: 'Capt. Davies, Singapore', text: 'Standardizing FL360 deconfliction is huge for commercial long-haul.', time: '15:10' },
    { user: 'Dr. Katherine Miller, London', text: 'Remarkable that the humanitarian corridor draft passed with zero abstentions.', time: '15:11' },
    { user: 'Henrik V., Zurich', text: 'Live satellite telemetry shows NAT tracks already adjusting altitude profiles.', time: '15:12' }
  ]);
  const [newChatText, setNewChatText] = useState('');

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim()) return;
    setChatMessages([
      ...chatMessages,
      { user: 'Viewer (You)', text: newChatText.trim(), time: 'Just now' }
    ]);
    setNewChatText('');
  };

  const bureaus = [
    'London Master Desk',
    'Geneva Bureau',
    'Washington Studio',
    'Singapore Hub'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex justify-center items-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-slate-950 w-full max-w-6xl rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 px-5 py-3 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1.5 bg-red-600 text-white text-[11px] font-black uppercase px-2.5 py-0.5 rounded tracking-wider">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>LIVE TRANSMISSION</span>
            </span>
            <span className="font-extrabold text-sm sm:text-base text-gray-100 hidden sm:inline">
              Air Real News Global Network &bull; Channel 1 HD
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Bureau Switcher */}
            <div className="hidden md:flex items-center space-x-1 bg-slate-800 p-1 rounded-lg text-xs">
              {bureaus.map((b) => (
                <button
                  key={b}
                  onClick={() => setActiveBureau(b)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                    activeBureau === b ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {b.split(' ')[0]}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Main Broadcast Screen */}
          <div className="lg:col-span-8 bg-black flex flex-col justify-between relative overflow-hidden">
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <video
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                poster="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80"
                className="w-full h-full object-cover"
                autoPlay
                controls
                loop
                playsInline
              />

              <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-white flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-mono text-white font-bold">{activeBureau}</span>
                <span className="text-slate-400">| 1080p Ultra HD</span>
              </div>
            </div>

            {/* Lower third banner */}
            <div className="bg-slate-900 border-t border-slate-800 p-3 text-white flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3 overflow-hidden">
                <span className="bg-red-600 text-white font-black px-2 py-0.5 rounded text-[10px] tracking-wider uppercase shrink-0">
                  SPECIAL REPORT
                </span>
                <span className="font-bold truncate text-gray-200">
                  Global Airspace Accord Signed: Full Live Analysis from ARN London Bureau
                </span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400 shrink-0 ml-3">
                <Users className="w-3.5 h-3.5 text-red-500" />
                <span className="font-mono text-[11px] font-bold">28,940 watching</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Chat & Schedule Tabs */}
          <div className="lg:col-span-4 bg-slate-900 border-l border-slate-800 flex flex-col justify-between h-full">
            
            <div className="p-3 border-b border-slate-800 flex items-center justify-between text-xs text-white">
              <div className="flex items-center space-x-2 font-bold">
                <MessageCircle className="w-4 h-4 text-red-500" />
                <span>Global Viewer Room</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">MODERATED LIVE</span>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-bold text-red-400">{msg.user}</span>
                    <span className="font-mono">{msg.time}</span>
                  </div>
                  <p className="text-gray-200 leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="p-3 border-t border-slate-800 bg-slate-950 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Share your analysis..."
                value={newChatText}
                onChange={(e) => setNewChatText(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-600"
              />
              <button
                type="submit"
                className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors font-bold"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>

        </div>

      </div>
    </div>
  );
};
