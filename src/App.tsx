/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { EarthGlobeCanvas } from './components/EarthGlobeCanvas';
import { TopBar } from './components/TopBar';
import { BottomControlDock } from './components/BottomControlDock';
import { TelemetryDrawer } from './components/TelemetryDrawer';
import { DocumentationModal } from './components/DocumentationModal';
import {
  SubsurfaceFilterState,
  DomainType,
  SeismicEvent,
  SubsurfaceFeature,
} from './types/geology';
import { fetchUSGSSeismicFeed } from './services/usgsService';
import {
  GEOTHERMAL_SITES,
  VOLCANIC_CONDUITS,
  MINERAL_DEPOSITS,
  WHITE_HYDROGEN_TRAPS,
  SUBSIDENCE_ZONES,
} from './services/subsurfaceData';
import { sonification } from './services/audioSonification';

export default function App() {
  const [filters, setFilters] = useState<SubsurfaceFilterState>({
    domain: 'safety',
    depthRange: [0, 700],
    minMagnitude: 2.5,
    verticalExaggeration: 2.0,
    cutawayActive: false,
    cutawayAngleDeg: 90,
    earthSurfaceMode: 'satellite',
    showClouds: true,
    showAtmosphere: true,
    showGraticule: true,
    layers: {
      earthquakes: true,
      volcanoes: true,
      insarSubsidence: true,
      geothermal: true,
      minerals: true,
      whiteHydrogen: true,
      tectonicPlates: true,
    },
    audioEnabled: true,
    audioVolume: 0.65,
    sonificationMode: 'realtime',
  });

  const [earthquakes, setEarthquakes] = useState<SeismicEvent[]>([]);
  const [isFeedLive, setIsFeedLive] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedFeature, setSelectedFeature] = useState<SubsurfaceFeature | null>(null);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);

  // Fetch USGS Seismic Data on Mount
  const loadSeismicFeed = useCallback(async () => {
    setIsRefreshing(true);
    const result = await fetchUSGSSeismicFeed();
    setEarthquakes(result.events);
    setIsFeedLive(result.isLive);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    loadSeismicFeed();
  }, [loadSeismicFeed]);

  // Audio mute sync
  useEffect(() => {
    sonification.setMute(!filters.audioEnabled);
  }, [filters.audioEnabled]);

  const handleToggleAudio = () => {
    const nextState = !filters.audioEnabled;
    setFilters((prev) => ({ ...prev, audioEnabled: nextState }));
    sonification.setMute(!nextState);
    if (nextState) {
      // Trigger a gentle calibration ping to verify audio activation
      sonification.triggerProbeHover(50);
    }
  };

  const handleDomainSelect = (domain: DomainType) => {
    setFilters((prev) => ({ ...prev, domain }));
    setSelectedFeature(null);
  };

  const handleHighlightEvent = (event: SeismicEvent) => {
    setSelectedFeature({ kind: 'earthquake', ...event });
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none flex flex-col">
      {/* Top Telemetry & Navigation Bar */}
      <TopBar
        activeDomain={filters.domain}
        onSelectDomain={handleDomainSelect}
        audioEnabled={filters.audioEnabled}
        onToggleAudio={handleToggleAudio}
        isFeedLive={isFeedLive}
        onRefreshFeed={loadSeismicFeed}
        isRefreshing={isRefreshing}
        onOpenDocs={() => setIsDocsOpen(true)}
      />

      {/* Main 3D WebGL Planetary Viewport */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <EarthGlobeCanvas
          filters={filters}
          earthquakes={earthquakes}
          geothermalSites={GEOTHERMAL_SITES}
          volcanoes={VOLCANIC_CONDUITS}
          minerals={MINERAL_DEPOSITS}
          hydrogenTraps={WHITE_HYDROGEN_TRAPS}
          subsidenceZones={SUBSIDENCE_ZONES}
          selectedFeature={selectedFeature}
          onSelectFeature={setSelectedFeature}
        />

        {/* Selected Node Telemetry Drawer */}
        <TelemetryDrawer
          feature={selectedFeature}
          onClose={() => setSelectedFeature(null)}
          audioEnabled={filters.audioEnabled}
        />
      </main>

      {/* Collapsible Bottom Control Dock */}
      <BottomControlDock
        filters={filters}
        onChangeFilters={setFilters}
        earthquakes={earthquakes}
        onHighlightEvent={handleHighlightEvent}
      />

      {/* Scientific Architecture & Documentation Modal */}
      <DocumentationModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />
    </div>
  );
}
