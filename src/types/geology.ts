export type DomainType = 'safety' | 'resource';

export interface SeismicEvent {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  depthKm: number;
  magnitude: number;
  timestamp: number;
  place: string;
  url: string;
  significance: number;
  alertLevel?: 'green' | 'yellow' | 'orange' | 'red';
  tsunamiWarning?: boolean;
}

export interface GeothermalSite {
  id: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  depthKm: number;
  estimatedTempC: number;
  enthalpyMWe: number;
  reservoirType: 'Volcanic-Hydrothermal' | 'Enhanced Geothermal (EGS)' | 'Sedimentary Basin' | 'Supercritical Mantle';
  status: 'Producing' | 'Exploratory' | 'Target Discovery';
  description: string;
}

export interface VolcanicConduit {
  id: string;
  volcanoName: string;
  country: string;
  latitude: number;
  longitude: number;
  conduitDepthKm: number;
  inflationRateMmYr: number;
  magmaType: 'Basaltic' | 'Andesitic' | 'Rhyolitic' | 'Dacitic' | 'Trachybasaltic';
  status: 'Restless Inflation' | 'Eruptive Warning' | 'Hydrothermal Unrest' | 'Baseline Monitoring';
  description: string;
}

export interface MineralDeposit {
  id: string;
  name: string;
  commodity: 'Lithium (Brine)' | 'Lithium (Pegmatite)' | 'Copper-Porphyry' | 'Cobalt-Nickel' | 'Rare Earth (REE)';
  latitude: number;
  longitude: number;
  depthKm: number;
  oreGrade: string;
  geologicModel: 'Ancient Hydrothermal Plume' | 'Continental Rift Salt Basin' | 'Subduction Arc Magmatism' | 'Deep Ultramafic Complex';
  description: string;
}

export interface WhiteHydrogenTrap {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  depthKm: number;
  hostRock: 'Serpentinized Peridotite' | 'Banded Iron Formation' | 'Precambrian Craton';
  capRockIntegrity: 'High Impermeable Halite' | 'Dense Mudstone' | 'Structural Fault Trap';
  estimatedPurityPercent: number;
  description: string;
}

export interface GroundSubsidenceZone {
  id: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  subsidenceRateMmYr: number;
  depthKm: number;
  driver: 'Groundwater Aquifer Depletion' | 'Sediment Compaction' | 'Mining Cavity Collapse' | 'Tectonic Downwarping';
  riskClassification: 'Severe Collapse Threat' | 'High Structural Hazard' | 'Moderate Progressive';
  description: string;
}

export interface LayerVisibility {
  earthquakes: boolean;
  volcanoes: boolean;
  insarSubsidence: boolean;
  geothermal: boolean;
  minerals: boolean;
  whiteHydrogen: boolean;
  tectonicPlates: boolean;
}

export type EarthSurfaceMode = 'satellite' | 'dayNight' | 'xray';

export interface SubsurfaceFilterState {
  domain: DomainType;
  depthRange: [number, number]; // [minKm, maxKm] e.g. [0, 700]
  minMagnitude: number; // e.g. 2.5
  verticalExaggeration: number; // 1.0 to 4.0
  cutawayActive: boolean;
  cutawayAngleDeg: number; // 0 to 180 degrees
  earthSurfaceMode: EarthSurfaceMode;
  showClouds: boolean;
  showAtmosphere: boolean;
  showGraticule: boolean;
  layers: LayerVisibility;
  audioEnabled: boolean;
  audioVolume: number;
  sonificationMode: 'realtime' | 'drone' | 'probe';
}

export type SubsurfaceFeature = 
  | ({ kind: 'earthquake' } & SeismicEvent)
  | ({ kind: 'geothermal' } & GeothermalSite)
  | ({ kind: 'volcano' } & VolcanicConduit)
  | ({ kind: 'mineral' } & MineralDeposit)
  | ({ kind: 'hydrogen' } & WhiteHydrogenTrap)
  | ({ kind: 'subsidence' } & GroundSubsidenceZone);
