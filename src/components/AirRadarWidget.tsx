import React, { useState, useEffect } from 'react';
import { Plane, Radio, Navigation, RefreshCw } from 'lucide-react';
import * as api from '../services/api';

interface FlightTelemetry {
  flight: string;
  airline: string;
  route: string;
  aircraft: string;
  altitude: string;
  speed: string;
  corridor: string;
  squawk: string;
  status: 'Protected Corridor' | 'Standard Transit' | 'Monitoring';
}

export const AirRadarWidget: React.FC = () => {
  const [flights, setFlights] = useState<FlightTelemetry[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<FlightTelemetry | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadTelemetry = async () => {
    try {
      setIsRefreshing(true);
      const data = await api.fetchTelemetry();
      setFlights(data);
      if (data.length > 0 && !selectedFlight) {
        setSelectedFlight(data[0]);
      }
      setLastRefreshed('Updated just now');
    } catch (err) {
      console.error('Error fetching telemetry:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTelemetry();
  }, []);

  if (flights.length === 0) return null;

  const activeFlight = selectedFlight || flights[0];

  return (
    <section id="arn-corridor-radar" className="mb-12 bg-slate-950 text-white rounded-2xl overflow-hidden border border-slate-800 shadow-xl transition-all duration-500">
      {/* Top Bar */}
      <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
            <Plane className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-base tracking-wide text-white font-sans uppercase">
                ARN Global Airspace & Corridor Radar
              </h3>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase px-2 py-0.5 rounded font-mono">
                LIVE TELEMETRY
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Civilian Flight Deconfliction & Satellite Transponder Surveillance Desk
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="text-slate-400 font-mono hidden sm:inline">{lastRefreshed}</span>
          <button
            onClick={loadTelemetry}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-red-500' : ''}`} />
            <span>Poll Backend</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Flight Selector (Left 5 cols) & Radar Telemetry Briefing (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 p-6 gap-6 items-stretch">
        
        {/* Flight List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between font-mono">
            <span>Tracked High-Altitude Flights:</span>
            <span className="text-red-500 font-bold">{flights.length} ACTIVE CHANNELS</span>
          </div>

          {flights.map((flight) => {
            const isSelected = activeFlight.flight === flight.flight;
            return (
              <div
                key={flight.flight}
                onClick={() => setSelectedFlight(flight)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-red-600 shadow-md ring-1 ring-red-600/30'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1 font-mono">
                  <span className="font-bold text-white flex items-center space-x-1.5">
                    <Plane className="w-3.5 h-3.5 text-red-500" />
                    <span>{flight.flight}</span>
                  </span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    flight.status === 'Protected Corridor'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-blue-950 text-blue-400 border border-blue-800'
                  }`}>
                    {flight.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="text-slate-300 font-semibold">{flight.airline}</span>
                  <span className="font-mono font-bold text-slate-200">{flight.route}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Telemetry Console */}
        <div className="lg:col-span-7 bg-slate-900/80 rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Navigation className="w-4 h-4 text-red-500" />
                <span className="font-mono text-xs font-black text-white">
                  TRANSPONDER DOSSIER: {activeFlight.flight}
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>ICAO VERIFIED</span>
              </span>
            </div>

            <h4 className="text-xl font-black text-white mb-1">
              {activeFlight.airline} &bull; {activeFlight.aircraft}
            </h4>
            <p className="text-xs text-red-400 font-mono mb-4">
              Routing: {activeFlight.route} &bull; Corridor: {activeFlight.corridor}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Altitude</div>
                <div className="text-xs sm:text-sm font-mono font-bold text-white mt-0.5">
                  {activeFlight.altitude}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Cruising Speed</div>
                <div className="text-xs sm:text-sm font-mono font-bold text-white mt-0.5">
                  {activeFlight.speed}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Squawk Code</div>
                <div className="text-xs sm:text-sm font-mono font-bold text-emerald-400 mt-0.5">
                  {activeFlight.squawk}
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <span className="text-red-500 font-bold uppercase text-[10px] tracking-wider block mb-1">
                Airspace Corridor Directive:
              </span>
              Aircraft cleared for demilitarized commercial transit with synchronized real-time radar pinging to Vienna and Eurocontrol safety nodes. Immunity verified under the Geneva Protocols.
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center space-x-1.5 font-mono text-[11px]">
              <Radio className="w-3.5 h-3.5 text-red-500" />
              <span>Direct Link: Air Real News Telemetry Node</span>
            </span>
            <span className="text-slate-300 font-bold text-[11px]">Zero Incidents Reported</span>
          </div>
        </div>

      </div>
    </section>
  );
};
