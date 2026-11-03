# Open-Subsurface-Engine (OSE)

**Multi-Sensory 4D Planetary Diagnostic, Subsurface Exploration & Geophysical Sonification Engine**

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-amber.svg)](https://opensource.org/licenses/Apache-2.0)
[![Engine: Three.js WebGL](https://img.shields.io/badge/3D%20Engine-Three.js%20%2F%20WebGL2-06b6d4.svg)](https://threejs.org/)
[![Audio: Web Audio API](https://img.shields.io/badge/Sonification-Web%20Audio%20API-10b981.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Feed: USGS Live GeoJSON](https://img.shields.io/badge/Data-USGS%20Live%20Feed-f97316.svg)](https://earthquake.usgs.gov/)

---

## 1. Overview & Vision

Traditional geographic information systems (GIS) treat the Earth as a flat or 2D spherical surface (Latitude and Longitude), leaving 99% of planetary dynamics invisible beneath the crust. **Open-Subsurface-Engine (OSE)** is an open-source, multi-sensory planetary diagnostic and exploration platform built to eliminate **"subsurface blindness."**

By fusing real-time global seismic feeds, volcanic magma conduit models, satellite InSAR ground subsidence radar, and deep clean-energy reservoirs into a **1:1 geodetic 3D Digital Twin of the Earth**—paired with native browser **Web Audio API sonification**—OSE translates subterranean structures into intuitive visual and acoustic signatures.

### Core Objectives
- **Democratize Clean Energy & Critical Mineral Exploration**: Lower exploratory drilling risk for high-enthalpy Geothermal reservoirs, natural White Hydrogen traps, and hydrothermal Lithium brines.
- **Mitigate Natural Disasters**: Provide actionable 4D situational awareness for subduction megathrust earthquakes, Benioff deep-mantle tremors, and volcanic magma inflation.
- **Protect Urban Infrastructure**: Track millimeter-level ground subsidence across vulnerable coastal and delta megacities using Interferometric Synthetic Aperture Radar (InSAR) metrics.

---

## 2. Key Capabilities

### 🌍 1:1 Photorealistic Earth Digital Twin
- **Blue Marble Surface & Biomes**: High-resolution ($2048 \times 1024$) Earth surface albedo map with accurate continental coastlines, shallow turquoise coral shelves, deep sapphire abyssal plains, tropical rainforests, arid desert belts, alpine mountain chains, and polar ice caps, with automatic NASA/Three.js satellite texture upgrading.
- **Topographic Relief & Specular Oceans**: Normal/bump heightmaps cast realistic solar relief shadows across mountain ranges (Himalayas, Andes, Rockies, Alps), while ocean masks render low-roughness ($0.18$) specular solar glint against matte terrestrial surfaces ($0.84$).
- **Rayleigh Scattering Atmosphere & Dynamic Clouds**: Custom GLSL Fresnel shader for orbital horizon limb glow, paired with an independent rotating tropospheric cloud layer and a **Night Lights** civilization mode.
- **True-Scale Concentric Interior Structure ($R = 6,371.0\text{ km}$)**:
  - **Lithosphere & Crust** ($0\text{ – }65\text{ km}$)
  - **Upper Mantle / Asthenosphere** ($65\text{ – }410\text{ km}$)
  - **Mantle Transition Zone** ($410\text{ – }660\text{ km}$)
  - **Lower Mantle / Mesosphere** ($660\text{ – }2,890\text{ km}$)
  - **Outer Liquid Core** ($2,890\text{ – }5,150\text{ km}$)
  - **Inner Solid Crystalline Core** ($5,150\text{ – }6,371\text{ km}$)
- **Precision Deep Zoom & Geodetic HUD**: Smooth orbital zoom from $30,000\text{ km}$ deep space down to $120\text{ km}$ regional low-Earth orbit with altitude-adaptive rotation sensitivity, regional jump presets, and live cursor Latitude/Longitude telemetry.

### 🔀 Dual-Domain Diagnostic Matrix
1. **Safety & Disaster Matrix**:
   - **Live USGS Seismic Hypocenters**: Real-time polling of the USGS GeoJSON Earthquake Feed (`M2.5+`), rendering surface epicenter rings connected to 3D subterranean hypocenters across shallow faults and deep Benioff subduction zones.
   - **Volcanic Magma Conduits**: 3D vertical magma plumbing columns and ground uplift rates ($\text{mm/yr}$) for restless calderas and rift dykes (Campi Flegrei, Kīlauea, Fagradalsfjall/Sundhnúkur, Merapi, Sakurajima, Popocatépetl).
   - **InSAR Urban Subsidence Zones**: Millimeter-per-year ground sinking telemetry across major metropolitan basins (Jakarta, Mexico City, Venice, San Francisco Bay, Tehran).
2. **Clean Energy & Critical Minerals Matrix**:
   - **Geothermal Heat Plumes**: Volumetric thermal columns mapping supercritical and Enhanced Geothermal Systems (The Geysers, Hellisheiði, Salton Sea, Wairakei-Tauhara, Olkaria, Larderello).
   - **Critical Mineral Pathways**: Hydrothermal lithium clays, direct lithium extraction (DLE) geothermal brines, and subduction porphyry copper-cobalt deposits.
   - **White Hydrogen Traps**: Naturally generating $\text{H}_2$ reservoirs hosted in serpentinized peridotite ophiolites, banded iron formations, and Precambrian cratons (Bourakébougou, Lorraine Basin, Gawler Craton, Midcontinent Rift).

### 🔊 Native Web Audio API Data Sonification
Zero external audio files or third-party sound libraries are used. Every subsurface node is synthesized in real time using native browser `AudioContext`, dual `OscillatorNode` (`sine` fundamental + `triangle` harmonic overtone), `BiquadFilterNode`, and ADSR `GainNode` envelopes:
- **Depth-to-Pitch Calibration**:
  $$f(d) = 460 - \left(\frac{d}{700}\right)^{0.8} \times (460 - 42)\text{ Hz}$$
  - *Shallow Crustal Fracturing ($0\text{ – }35\text{ km}$)*: High-frequency acoustic transients ($380\text{ – }460\text{ Hz}$).
  - *Intermediate Asthenosphere ($70\text{ – }300\text{ km}$)*: Mid-range resonant tones ($140\text{ – }280\text{ Hz}$).
  - *Deep Mantle Subduction Slabs ($350\text{ – }700\text{ km}$)*: Sub-harmonic bass rumble ($42\text{ – }90\text{ Hz}$).
- **Magnitude-to-Energy Gain**:
  $$G(M) = \min\left(0.9,\; 0.15 + \max(0, M - 2.5) \times 0.12\right)$$
- **Chronological Seismic Audit**: Automated sequential playback across active global earthquakes to hear planetary tectonic stress patterns over time.

---

## 3. System Architecture & Coordinate Math

```
┌────────────────────────────────────────────────────────────────────────┐
│                     TOP TELEMETRY & APP BAR                            │
│  [ Open-Subsurface-Engine ] ── [ Safety / Energy ] ── [ Audio Synth ]  │
└────────────────────────────────────────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│                 THREE.JS 1:1 DIGITAL EARTH VIEWPORT                    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  • Surface Sphere (Blue Marble Albedo, Bump, Specular, Lights)   │  │
│  │  • Rayleigh Scattering Shader Halo & Dynamic Cloud Sphere        │  │
│  │  • Concentric Interior Shells (Upper/Lower Mantle, Outer/Inner)  │  │
│  │  • 3D Hypocenters, Magma Conduits, Geothermal & H2 Reservoirs    │  │
│  │  • Geodetic Raycast Cursor Probe & Regional Flight Controller    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│                 COLLAPSIBLE ERGONOMIC CONTROL DOCK                     │
│  ┌───────────────────────┬─────────────────────┬────────────────────┐  │
│  │ Matrix & Earth Optics │ Depth Ceiling &     │ Layer Filters &    │  │
│  │ [Blue Marble/X-Ray]   │ Radial Scale [1-4x] │ Seismic Audit Play │  │
│  └───────────────────────┴─────────────────────┴────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Spherical-to-Subsurface Coordinate Transformation
To enforce true 3D/4D structural depth (`src/utils/coordinateTransform.ts`), geographic coordinates $(\text{lat}, \text{lon})$ and focal depth $d \in [0, 700]\text{ km}$ are projected inward along the planetary radial vector:

$$R_{\text{eff}}(d) = R_{\text{Earth}} - \left(\frac{\min(d, 700)}{700}\right) \times \Delta R_{\max} \times E_v$$

where $R_{\text{Earth}} = 100$ WebGL units ($6,371.0\text{ km}$), $\Delta R_{\max} = 28$ units, and $E_v \in [1.0, 4.0]$ is the user-configurable radial depth exaggeration factor.

---

## 4. Repository Structure

```text
├── index.html                           # App entry point & typography imports
├── metadata.json                        # Application metadata & capabilities
├── package.json                         # Dependencies & build scripts
├── vite.config.ts                       # Vite bundler configuration
└── src/
    ├── main.tsx                         # React DOM root mount
    ├── App.tsx                          # Top-level state orchestration & feed lifecycle
    ├── index.css                        # Tailwind CSS v4 & dark scientific theme
    ├── types/
    │   └── geology.ts                   # TypeScript interfaces for seismic & resource entities
    ├── utils/
    │   ├── coordinateTransform.ts       # Geodetic (Lat, Lon, Depth) -> 3D Cartesian & Hz math
    │   └── proceduralGlobeTextures.ts   # 2048x1024 Blue Marble, bump, specular, cloud & core maps
    ├── services/
    │   ├── usgsService.ts               # Live USGS GeoJSON seismic polling + offline fallback
    │   ├── subsurfaceData.ts            # Curated geothermal, volcanic, mineral, H2 & InSAR catalogs
    │   └── audioSonification.ts         # Native Web Audio API synthesizer & harmonic drone engine
    └── components/
        ├── EarthGlobeCanvas.tsx         # Interactive Three.js 3D Earth Digital Twin & HUD
        ├── TopBar.tsx                   # 3-zone header with live feed status & audio toggle
        ├── BottomControlDock.tsx        # Collapsible control dock (optics, depth sliders, layers)
        ├── TelemetryDrawer.tsx          # Node inspection drawer with acoustic signature trigger
        └── DocumentationModal.tsx       # In-app physical blueprint & mathematical reference
```

---

## 5. Getting Started

### Prerequisites
- **Node.js** `>= 18.x` (or **Bun** `>= 1.0`)
- A modern browser with **WebGL2** and **Web Audio API** support

### Installation & Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server (Port 3000):**
   ```bash
   npm run dev
   ```

3. **Type-check and build for production:**
   ```bash
   npm run lint
   npm run build
   ```

---

## 6. Phased Implementation Roadmap

- [x] **Phase 1: Bootstrapped Software Foundation (Zero-Cost Setup)**
  - Live USGS GeoJSON polling, 3D spherical-to-subsurface Cartesian projection, photorealistic Earth digital twin, and native Web Audio API depth-to-pitch sonification.
- [ ] **Phase 2: Open-Source Scaling & PostGIS / Sentinel-1 Pipelines**
  - Automated ingestion of ESA Copernicus Sentinel-1 InSAR interferograms and persistent PostGIS spatial indexing for regional fault networks.
- [ ] **Phase 3: Volumetric Voxel Twins & Borehole Ingestion**
  - Automated PDF borehole log extraction and 3D kriging interpolation for civil engineering and geothermal well targeting.
- [ ] **Phase 4: Edge IoT Telemetry & WebXR Spatial Immersion**
  - Real-time micro-seismometer and soil-moisture sensor mesh streaming with WebXR headset and haptic transducer floor support.

---

## 7. License

Licensed under the **Apache License, Version 2.0**. See header notices in source files for details.
