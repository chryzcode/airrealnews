import React, { useState, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Users, 
  ChevronRight
} from 'lucide-react';

interface VideoBroadcastHubProps {
  onOpenLiveModal: () => void;
}

export const VideoBroadcastHub: React.FC<VideoBroadcastHubProps> = ({
  onOpenLiveModal,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section className="mb-14">
      {/* BBC-style Header */}
      <div className="flex items-center justify-between border-b-2 border-red-600 pb-2 mb-6">
        <div className="flex items-center space-x-2.5">
          <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></span>
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center space-x-2 font-sans">
            <span>Air Real News Live &bull; 24/7 Global Transmission</span>
          </h3>
        </div>
        <button
          onClick={onOpenLiveModal}
          className="text-xs font-bold text-red-600 hover:underline flex items-center space-x-1"
        >
          <span>Open Full Studio</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Main Video Stream Container */}
        <div className="lg:col-span-12 bg-slate-950 rounded-2xl overflow-hidden shadow-xl border border-slate-800 relative flex flex-col justify-between">
          
          <div className="relative aspect-[16/9] w-full bg-black group overflow-hidden">
            <video
              ref={videoRef}
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              poster="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80"
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted={isMuted}
              playsInline
            />

            {/* Overlaid Badges */}
            <div className="absolute top-4 left-4 flex items-center space-x-2 z-10">
              <span className="bg-red-600 text-white text-xs font-black uppercase px-2.5 py-1 rounded shadow-lg flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>ON AIR</span>
              </span>
              <span className="bg-slate-900/80 backdrop-blur-sm text-gray-200 text-xs font-mono font-medium px-2 py-1 rounded border border-slate-700 flex items-center space-x-1.5">
                <Users className="w-3 h-3 text-red-400" />
                <span>19,420 watching</span>
              </span>
            </div>

            {/* Studio Watermark */}
            <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-sm border border-slate-700 text-white font-mono font-bold text-xs px-2.5 py-1 rounded tracking-wider shadow">
              ARN LONDON DESK
            </div>

            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-4 flex items-center justify-between z-10 opacity-90 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center space-x-3">
                <button
                  onClick={togglePlay}
                  className="bg-white hover:bg-slate-200 text-slate-950 p-2 rounded-full transition-transform active:scale-90"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950 ml-0.5" />}
                </button>
                <button
                  onClick={toggleMute}
                  className="bg-slate-800/80 hover:bg-slate-700 text-white p-2 rounded-full transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <div className="text-white text-xs font-bold font-mono tracking-wide">
                  <span className="text-red-500">LIVE:</span> Geneva Civil Airspace Protocols Special Broadcast
                </div>
              </div>

              <button
                onClick={onOpenLiveModal}
                className="bg-slate-800/80 hover:bg-slate-700 text-white p-2 rounded-full transition-colors"
                title="Theater Mode"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lower Third News Marquee Banner */}
          <div className="bg-slate-900 border-t border-slate-800 p-3 flex items-center space-x-3 text-xs">
            <span className="bg-red-600 text-white font-black px-2 py-0.5 rounded text-[10px] tracking-wider shrink-0 uppercase">
              WIRE TICKER
            </span>
            <div className="overflow-hidden whitespace-nowrap">
              <p className="text-gray-200 animate-ticker flex space-x-8 font-medium">
                <span>&bull; Ratified Geneva Air Protocols guarantee immediate immunity for commercial passenger airliners</span>
                <span>&bull; ICAO installs real-time satellite radar telemetry in neutral verification centers</span>
                <span>&bull; Brent Crude drops to $76.10 on easing global transit anxieties</span>
                <span>&bull; Next live briefing scheduled for 16:00 GMT from ARN London Bureau</span>
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
