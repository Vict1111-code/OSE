import React from 'react';
import { X, Volume2, ExternalLink, MapPin, Activity, Flame, ShieldAlert, Sparkles } from 'lucide-react';
import { SubsurfaceFeature } from '../types/geology';
import { depthToFrequency } from '../utils/coordinateTransform';
import { sonification } from '../services/audioSonification';

interface TelemetryDrawerProps {
  feature: SubsurfaceFeature | null;
  onClose: () => void;
  audioEnabled: boolean;
}

export const TelemetryDrawer: React.FC<TelemetryDrawerProps> = ({
  feature,
  onClose,
  audioEnabled,
}) => {
  if (!feature) return null;

  const handleSonify = () => {
    if (!audioEnabled) {
      sonification.setMute(false);
    }
    const depth =
      feature.kind === 'earthquake'
        ? feature.depthKm
        : feature.kind === 'volcano'
        ? feature.conduitDepthKm
        : feature.depthKm;
    const mag = feature.kind === 'earthquake' ? feature.magnitude : 5.0;
    sonification.triggerSeismicEvent(depth, mag, 2.0);
  };

  const depth =
    feature.kind === 'earthquake'
      ? feature.depthKm
      : feature.kind === 'volcano'
      ? feature.conduitDepthKm
      : feature.depthKm;
  const acousticFreq = depthToFrequency(depth);

  return (
    <aside className="fixed top-20 left-6 z-30 w-full max-w-sm p-4 bg-slate-950/95 border border-slate-800 rounded-xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-left-4 duration-200">
      {/* Header with Title and Close Button */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-slate-400">
            {feature.kind === 'earthquake' && <Activity className="w-3.5 h-3.5 text-amber-400" />}
            {feature.kind === 'volcano' && <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />}
            {feature.kind === 'geothermal' && <Flame className="w-3.5 h-3.5 text-cyan-400" />}
            {feature.kind === 'mineral' && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
            {feature.kind === 'hydrogen' && <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
            {feature.kind === 'subsidence' && <MapPin className="w-3.5 h-3.5 text-amber-500" />}
            <span>{feature.kind.toUpperCase()} TELEMETRY</span>
          </div>
          <h2 className="text-sm font-bold text-slate-100 mt-1 leading-snug">
            {feature.kind === 'earthquake'
              ? feature.title
              : feature.kind === 'volcano'
              ? `${feature.volcanoName} Magma Conduit`
              : feature.kind === 'subsidence'
              ? `${feature.city} Subsidence Zone`
              : feature.name}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Numerical Metrics Matrix */}
      <div className="grid grid-cols-2 gap-2.5 my-3">
        <div className="p-2.5 bg-slate-900/80 border border-slate-800/80 rounded-lg">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">FOCAL DEPTH</div>
          <div className="text-xl font-mono font-bold tabular-nums text-amber-400 mt-0.5">
            {depth.toFixed(1)} <span className="text-xs font-normal text-slate-400">KM</span>
          </div>
        </div>

        <div className="p-2.5 bg-slate-900/80 border border-slate-800/80 rounded-lg">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">ACOUSTIC PITCH</div>
          <div className="text-xl font-mono font-bold tabular-nums text-cyan-400 mt-0.5">
            {Math.round(acousticFreq)} <span className="text-xs font-normal text-slate-400">HZ</span>
          </div>
        </div>
      </div>

      {/* Domain-Specific Metric Details */}
      <div className="space-y-2 text-xs text-slate-300">
        {feature.kind === 'earthquake' && (
          <div className="p-2.5 bg-slate-900/40 rounded border border-slate-800/60 space-y-1 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Magnitude:</span>
              <span className="font-bold text-amber-300 tabular-nums">M {feature.magnitude.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Epicenter:</span>
              <span className="text-slate-200">{feature.place}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Coordinates:</span>
              <span className="tabular-nums text-slate-300">
                {feature.latitude.toFixed(2)}°, {feature.longitude.toFixed(2)}°
              </span>
            </div>
            {feature.alertLevel && (
              <div className="flex justify-between">
                <span className="text-slate-400">Alert Level:</span>
                <span className="uppercase text-amber-400 font-semibold">{feature.alertLevel}</span>
              </div>
            )}
          </div>
        )}

        {feature.kind === 'volcano' && (
          <div className="p-2.5 bg-slate-900/40 rounded border border-slate-800/60 space-y-1 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Inflation Rate:</span>
              <span className="font-bold text-rose-400 tabular-nums">+{feature.inflationRateMmYr} mm/yr</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Magma Type:</span>
              <span className="text-slate-200">{feature.magmaType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Volcanic Status:</span>
              <span className="text-amber-400">{feature.status}</span>
            </div>
          </div>
        )}

        {feature.kind === 'geothermal' && (
          <div className="p-2.5 bg-slate-900/40 rounded border border-slate-800/60 space-y-1 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Reservoir Temp:</span>
              <span className="font-bold text-cyan-400 tabular-nums">{feature.estimatedTempC}°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Power Potential:</span>
              <span className="font-bold text-emerald-400 tabular-nums">{feature.enthalpyMWe} MWe</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Reservoir Class:</span>
              <span className="text-slate-200">{feature.reservoirType}</span>
            </div>
          </div>
        )}

        {feature.kind === 'mineral' && (
          <div className="p-2.5 bg-slate-900/40 rounded border border-slate-800/60 space-y-1 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Target Commodity:</span>
              <span className="font-bold text-amber-300">{feature.commodity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Estimated Grade:</span>
              <span className="text-slate-200">{feature.oreGrade}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Plume Model:</span>
              <span className="text-slate-300">{feature.geologicModel}</span>
            </div>
          </div>
        )}

        {feature.kind === 'hydrogen' && (
          <div className="p-2.5 bg-slate-900/40 rounded border border-slate-800/60 space-y-1 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">H2 Gas Purity:</span>
              <span className="font-bold text-emerald-400 tabular-nums">{feature.estimatedPurityPercent}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Basement Rock:</span>
              <span className="text-slate-200">{feature.hostRock}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cap Rock Trap:</span>
              <span className="text-slate-300">{feature.capRockIntegrity}</span>
            </div>
          </div>
        )}

        {feature.kind === 'subsidence' && (
          <div className="p-2.5 bg-slate-900/40 rounded border border-slate-800/60 space-y-1 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Subsidence Rate:</span>
              <span className="font-bold text-amber-400 tabular-nums">-{feature.subsidenceRateMmYr} mm/yr</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Risk Severity:</span>
              <span className="text-rose-400 font-bold">{feature.riskClassification}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Primary Driver:</span>
              <span className="text-slate-200">{feature.driver}</span>
            </div>
          </div>
        )}

        {/* Narrative Description */}
        <p className="text-xs text-slate-400 mt-2 leading-relaxed font-sans">
          {feature.kind === 'earthquake'
            ? `Magnitude ${feature.magnitude.toFixed(1)} seismic rupture recorded near ${feature.place}. Focal depth of ${feature.depthKm.toFixed(1)} km mapped into 3D Cartesian coordinates.`
            : feature.description}
        </p>
      </div>

      {/* Action Footer */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
        <button
          onClick={handleSonify}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Sonify Acoustic Signature</span>
        </button>

        {feature.kind === 'earthquake' && feature.url && (
          <a
            href={feature.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
            title="Inspect on USGS Earthquake Catalog"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </aside>
  );
};
