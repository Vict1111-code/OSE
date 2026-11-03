import React from 'react';
import { Volume2, VolumeX, RefreshCw, BookOpen, Layers } from 'lucide-react';
import { DomainType } from '../types/geology';

interface TopBarProps {
  activeDomain: DomainType;
  onSelectDomain: (domain: DomainType) => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  isFeedLive: boolean;
  onRefreshFeed: () => void;
  isRefreshing: boolean;
  onOpenDocs: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeDomain,
  onSelectDomain,
  audioEnabled,
  onToggleAudio,
  isFeedLive,
  onRefreshFeed,
  isRefreshing,
  onOpenDocs,
}) => {
  return (
    <header className="relative z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md">
      {/* Zone 1: Single text element brand wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a href="/" className="text-lg font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
          <span>Open-Subsurface-Engine</span>
        </a>
        <span className="text-xs font-mono text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded">
          v1.0-4D
        </span>
      </div>

      {/* Zone 2: Clean single-line navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => onSelectDomain('safety')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeDomain === 'safety' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          Safety & Disasters
        </button>
        <button
          onClick={() => onSelectDomain('resource')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeDomain === 'resource' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Clean Energy & Minerals
        </button>
        <button
          onClick={onOpenDocs}
          className="flex items-center gap-1.5 hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span>Physical Blueprint</span>
        </button>
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 border-l border-slate-800 pl-4">
          <span className="text-slate-400">USGS FEED:</span>
          <span className={isFeedLive ? 'text-emerald-400' : 'text-amber-400'}>
            {isFeedLive ? 'LIVE' : 'STANDALONE'}
          </span>
        </div>
      </nav>

      {/* Zone 3: 1 primary action & sonification control */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onRefreshFeed}
          disabled={isRefreshing}
          title="Refresh USGS Live Earthquake Feed"
          className="p-2 text-slate-300 hover:text-slate-100 hover:bg-slate-800/80 rounded-lg transition-colors border border-slate-800 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>

        <button
          onClick={onToggleAudio}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors border cursor-pointer whitespace-nowrap shrink-0 ${
            audioEnabled
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span>{audioEnabled ? 'Sonification: Active' : 'Sonification: Muted'}</span>
        </button>
      </div>
    </header>
  );
};
