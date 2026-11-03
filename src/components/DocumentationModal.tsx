import React from 'react';
import { X, Globe2, Radio, Zap, Shield, Cpu, ExternalLink } from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="text-xs font-mono text-amber-400 font-semibold tracking-wider uppercase">
              OPEN-SUBSURFACE-ENGINE (OSE)
            </div>
            <h2 className="text-lg font-bold text-slate-100 mt-0.5">
              Planetary Diagnostic & Exploration Architecture
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 mt-5 text-sm text-slate-300">
          {/* Section 1: Core Mission */}
          <div>
            <h3 className="text-xs font-mono uppercase text-slate-400 font-semibold mb-2 flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-amber-400" />
              <span>01. Subsurface Blindness Elimination</span>
            </h3>
            <p className="text-xs leading-relaxed text-slate-300">
              Traditional planetary visualization tools map the Earth in 2D coordinates (Latitude and Longitude), leaving 99% of geological activity invisible beneath the crust. Open-Subsurface-Engine strictly enforces a 4D spatial canvas, projecting focal depths (0 km to 700 km) as true inward negative Z-offsets alongside real-time temporal events.
            </p>
          </div>

          {/* Section 2: Mathematical Sonification Model */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2.5">
            <h3 className="text-xs font-mono uppercase text-cyan-400 font-semibold flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>02. Web Audio Frequency & Energy Calibration</span>
            </h3>
            <p className="text-xs text-slate-300">
              The engine utilizes browser-native Web Audio API oscillators to translate physical subsurface events into acoustic signatures without external sound assets:
            </p>
            <div className="font-mono text-xs bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-1">
              <div className="text-amber-300">
                f(depth) = 460 - (depth / 700)^0.8 * (460 - 42) Hz
              </div>
              <div className="text-slate-400 text-[11px]">
                · Shallow crust fracturing (0–35 km) → High-frequency transient (380–460 Hz)
              </div>
              <div className="text-slate-400 text-[11px]">
                · Deep mantle subduction (350–700 km) → Sub-harmonic resonance (42–90 Hz)
              </div>
              <div className="text-emerald-400 text-[11px] mt-1">
                · Energy Gain: G(M) = min(0.9, 0.15 + (M - 2.5) * 0.12)
              </div>
            </div>
          </div>

          {/* Section 3: Dual Domain Problem Matrix */}
          <div>
            <h3 className="text-xs font-mono uppercase text-slate-400 font-semibold mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-400" />
              <span>03. Dual-Domain Diagnostic Coverage</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900/40 border border-slate-800/80 rounded-lg">
                <div className="font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Public Safety & Hazards</span>
                </div>
                <ul className="space-y-1 text-slate-400 text-[11px]">
                  <li>• USGS live earthquake hypocenters & Benioff slabs</li>
                  <li>• Volcanic magma conduit inflation tracking</li>
                  <li>• Satellite InSAR millimeter-level urban subsidence</li>
                  <li>• Major tectonic plate subduction & rift arcs</li>
                </ul>
              </div>

              <div className="p-3 bg-slate-900/40 border border-slate-800/80 rounded-lg">
                <div className="font-semibold text-cyan-300 mb-1 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Clean Energy & Minerals</span>
                </div>
                <ul className="space-y-1 text-slate-400 text-[11px]">
                  <li>• Supercritical volcanic & EGS geothermal plumes</li>
                  <li>• Direct Lithium Extraction (DLE) geothermal brines</li>
                  <li>• Deep mantle serpentinized White Hydrogen traps</li>
                  <li>• Subduction arc hydrothermal copper & cobalt</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 4: Data Sources */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Data Feeds: USGS Earthquake API · InSAR Sentinel-1 · Global Volcanism Program</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
