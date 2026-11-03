import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Flame,
  Layers,
  Play,
  Square,
  Scissors,
  Globe,
  Cloud,
} from 'lucide-react';
import { SubsurfaceFilterState, DomainType, SeismicEvent, EarthSurfaceMode } from '../types/geology';
import { sonification } from '../services/audioSonification';

interface BottomControlDockProps {
  filters: SubsurfaceFilterState;
  onChangeFilters: (next: SubsurfaceFilterState) => void;
  earthquakes: SeismicEvent[];
  onHighlightEvent: (event: SeismicEvent) => void;
}

export const BottomControlDock: React.FC<BottomControlDockProps> = ({
  filters,
  onChangeFilters,
  earthquakes,
  onHighlightEvent,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [sequenceIndex, setSequenceIndex] = useState(0);

  const playbackTimerRef = React.useRef<number | null>(null);

  const handleDomainChange = (domain: DomainType) => {
    onChangeFilters({
      ...filters,
      domain,
    });
  };

  const handleSurfaceModeChange = (earthSurfaceMode: EarthSurfaceMode) => {
    onChangeFilters({
      ...filters,
      earthSurfaceMode,
    });
  };

  const handleDepthMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maxVal = parseFloat(e.target.value);
    onChangeFilters({
      ...filters,
      depthRange: [filters.depthRange[0], maxVal],
    });
  };

  const handleVerticalExaggerationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeFilters({
      ...filters,
      verticalExaggeration: parseFloat(e.target.value),
    });
  };

  const handleToggleCutaway = () => {
    onChangeFilters({
      ...filters,
      cutawayActive: !filters.cutawayActive,
    });
  };

  const handleToggleLayer = (layerKey: keyof typeof filters.layers) => {
    onChangeFilters({
      ...filters,
      layers: {
        ...filters.layers,
        [layerKey]: !filters.layers[layerKey],
      },
    });
  };

  const handleTogglePlayback = () => {
    if (isPlayingSequence) {
      if (playbackTimerRef.current) window.clearInterval(playbackTimerRef.current);
      setIsPlayingSequence(false);
      return;
    }

    if (earthquakes.length === 0) return;
    setIsPlayingSequence(true);
    let idx = 0;

    playbackTimerRef.current = window.setInterval(() => {
      if (idx >= earthquakes.length) {
        if (playbackTimerRef.current) window.clearInterval(playbackTimerRef.current);
        setIsPlayingSequence(false);
        return;
      }

      const eq = earthquakes[idx];
      setSequenceIndex(idx);
      onHighlightEvent(eq);

      if (filters.audioEnabled) {
        sonification.triggerSeismicEvent(eq.depthKm, eq.magnitude, 1.2);
      }

      idx++;
    }, 1200);
  };

  React.useEffect(() => {
    return () => {
      if (playbackTimerRef.current) window.clearInterval(playbackTimerRef.current);
    };
  }, []);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-[980px] px-4 pointer-events-auto">
      {/* Collapse / Expand Toggle Button */}
      <div className="flex justify-center mb-1">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium text-slate-400 bg-slate-900/90 border border-slate-800 rounded-t-md hover:text-slate-200 transition-colors cursor-pointer shadow-lg"
        >
          {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span>{isCollapsed ? 'Show Subsurface Controls' : 'Hide Controls (Zen Mode)'}</span>
        </button>
      </div>

      {/* Main Unified Control Dock Card */}
      {!isCollapsed && (
        <div className="p-4 bg-slate-950/95 border border-slate-800/90 rounded-xl shadow-2xl">
          <div className="flex flex-col gap-3">
            {/* Row 1: Primary Domain Matrix Selector + Earth Surface Mode + Cutaway + Seismic Audit */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800/70">
              {/* Segmented Domain Toggle */}
              <div className="flex items-center p-1 bg-slate-900/90 rounded-lg border border-slate-800">
                <button
                  onClick={() => handleDomainChange('safety')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    filters.domain === 'safety'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>Safety Matrix</span>
                </button>
                <button
                  onClick={() => handleDomainChange('resource')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    filters.domain === 'resource'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Resource Matrix</span>
                </button>
              </div>

              {/* Earth Digital Twin Surface Optics Selector */}
              <div className="flex items-center p-1 bg-slate-900/90 rounded-lg border border-slate-800">
                <span className="text-[11px] font-medium text-slate-400 px-2 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden sm:inline">Earth Optics:</span>
                </span>
                <button
                  onClick={() => handleSurfaceModeChange('satellite')}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                    filters.earthSurfaceMode === 'satellite'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Blue Marble
                </button>
                <button
                  onClick={() => handleSurfaceModeChange('dayNight')}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                    filters.earthSurfaceMode === 'dayNight'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Night Lights
                </button>
                <button
                  onClick={() => handleSurfaceModeChange('xray')}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                    filters.earthSurfaceMode === 'xray'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Crust X-Ray
                </button>
              </div>

              {/* Crustal Cutaway & Playback Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleCutaway}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border cursor-pointer whitespace-nowrap ${
                    filters.cutawayActive
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>{filters.cutawayActive ? 'Interior Cutaway: On' : 'Interior Cutaway'}</span>
                </button>

                <button
                  onClick={handleTogglePlayback}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border cursor-pointer whitespace-nowrap ${
                    isPlayingSequence
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {isPlayingSequence ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>
                    {isPlayingSequence
                      ? `Auditing (${sequenceIndex + 1}/${earthquakes.length})`
                      : 'Play Seismic Audit'}
                  </span>
                </button>
              </div>
            </div>

            {/* Row 2: Sliders (Subsurface Depth Filter & Vertical Exaggeration) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              {/* Depth Filter Scrubber */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Subsurface Depth Ceiling</span>
                  <span className="font-mono tabular-nums text-amber-400 font-semibold">
                    {filters.depthRange[1]} km
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="700"
                  step="10"
                  value={filters.depthRange[1]}
                  onChange={handleDepthMaxChange}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0 km (Crust)</span>
                  <span>410 km (Transition)</span>
                  <span>700 km (Lower Mantle)</span>
                </div>
              </div>

              {/* Vertical Depth Exaggeration */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Subsurface Radial Scale</span>
                  <span className="font-mono tabular-nums text-cyan-400 font-semibold">
                    {filters.verticalExaggeration.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="4.0"
                  step="0.2"
                  value={filters.verticalExaggeration}
                  onChange={handleVerticalExaggerationChange}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>1.0x (1:1 Geodetic)</span>
                  <span>2.5x (Balanced)</span>
                  <span>4.0x (Deep Mantle View)</span>
                </div>
              </div>
            </div>

            {/* Row 3: Layer & Atmospheric Toggles */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60">
              <span className="text-[11px] font-medium text-slate-400 mr-1 flex items-center gap-1">
                <Layers className="w-3 h-3 text-slate-400" />
                <span>Layers:</span>
              </span>

              {filters.domain === 'safety' ? (
                <>
                  <button
                    onClick={() => handleToggleLayer('earthquakes')}
                    className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer border whitespace-nowrap ${
                      filters.layers.earthquakes
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800'
                    }`}
                  >
                    Hypocenters (USGS)
                  </button>
                  <button
                    onClick={() => handleToggleLayer('volcanoes')}
                    className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer border whitespace-nowrap ${
                      filters.layers.volcanoes
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800'
                    }`}
                  >
                    Magma Conduits
                  </button>
                  <button
                    onClick={() => handleToggleLayer('insarSubsidence')}
                    className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer border whitespace-nowrap ${
                      filters.layers.insarSubsidence
                        ? 'bg-amber-600/20 text-amber-300 border-amber-600/40'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800'
                    }`}
                  >
                    InSAR Subsidence
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleToggleLayer('geothermal')}
                    className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer border whitespace-nowrap ${
                      filters.layers.geothermal
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800'
                    }`}
                  >
                    Geothermal Plumes
                  </button>
                  <button
                    onClick={() => handleToggleLayer('minerals')}
                    className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer border whitespace-nowrap ${
                      filters.layers.minerals
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800'
                    }`}
                  >
                    Lithium & Minerals
                  </button>
                  <button
                    onClick={() => handleToggleLayer('whiteHydrogen')}
                    className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer border whitespace-nowrap ${
                      filters.layers.whiteHydrogen
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800'
                    }`}
                  >
                    White Hydrogen
                  </button>
                </>
              )}

              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  onClick={() =>
                    onChangeFilters({ ...filters, showClouds: !filters.showClouds })
                  }
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer border whitespace-nowrap ${
                    filters.showClouds
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800'
                  }`}
                >
                  <Cloud className="w-3 h-3" />
                  <span>Clouds</span>
                </button>

                <button
                  onClick={() =>
                    onChangeFilters({ ...filters, showGraticule: !filters.showGraticule })
                  }
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer border whitespace-nowrap ${
                    filters.showGraticule
                      ? 'bg-slate-800 text-slate-200 border-slate-600'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800'
                  }`}
                >
                  Lat/Lon Grid
                </button>

                <button
                  onClick={() => handleToggleLayer('tectonicPlates')}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer border whitespace-nowrap ${
                    filters.layers.tectonicPlates
                      ? 'bg-slate-800 text-slate-200 border-slate-600'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800'
                  }`}
                >
                  Tectonic Plates
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
