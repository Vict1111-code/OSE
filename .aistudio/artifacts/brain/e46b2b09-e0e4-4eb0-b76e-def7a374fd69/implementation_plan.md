# Open-Subsurface-Engine (OSE): Multi-Sensory Planetary Diagnostic & Exploration Engine

The Open-Subsurface-Engine (OSE) is a high-performance 3D planetary exploration and geophysical diagnostic platform designed to eliminate "subsurface blindness." It couples real-time global seismic feeds and deep-crust geological models with interactive 3D cross-sectional depth grids and native browser Web Audio sonification.

### User Review & Critical Decisions

> [!IMPORTANT]
> The foundational system directives and user preferences from Phase 1 have been synthesized into this blueprint:

- **Confirmed Domain Scope (Dual Mode)**: The engine provides seamless switching between **Disaster & Public Safety** (live USGS earthquake hypocenters, volcanic magma inflation vectors, InSAR ground subsidence zones, and fault lines) and **Clean Energy & Critical Minerals** (3D geothermal heat clouds, hydrothermal mineral deposit vectors, and white hydrogen reservoir traps).
- **Confirmed 3D Spatial Canvas**: A fully interactive Three.js 3D Earth Globe with spherical-to-depth Cartesian coordinates, cross-sectional mantle/crust peel-back, volumetric negative-Z depth columns, and tectonic plate boundaries.
- **Confirmed Sonification Engine**: Native browser Web Audio API oscillator and harmonic synthesis architecture that maps hypocenter focal depth (0 km to 700 km) to audio frequency pitch (40 Hz deep mantle hum to 450 Hz shallow crust fracturing) and seismic magnitude / energy release to harmonic gain, sub-bass pulse, and filter resonance.

---

### 1. Overview & Core Concept

- **What It Does**: OSE transforms raw planetary data (seismic hypocenters, geothermal gradient estimates, tectonic boundary data, and satellite radar subsidence points) into an intuitive, multi-sensory 3D spatial experience. Users can inspect global and regional subterranean structures, slice into crustal layers, scrub across focal depths, and hear the acoustic signatures of active tectonic stresses.
- **Target Audience / Persona**: Geophysical researchers, clean energy exploration teams (geothermal and hydrogen), civil engineers monitoring urban ground stability, and public disaster mitigation analysts.
- **Key Value**: Replaces disconnected 2D GIS map layers and dense numerical catalogs with a unified 4D spatial canvas and auditory translation engine, enabling instant spatial comprehension of subsurface hazards and clean energy opportunities without expensive proprietary software.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Planetary Initialization & Global Telemetry**: The application boots with an illuminated 3D Earth globe against a cosmic starfield, rendering real-time earthquake hypocenters streaming directly from the USGS Global Earthquake Feed alongside tectonic fault arcs.
2. **Dual-Mode Matrix Switch**:
   - *Safety View*: Highlights seismically active subduction zones, volcanic magma inflation columns (e.g. Campi Flegrei, Kilauea, Iceland), and urban InSAR ground subsidence danger blocks.
   - *Resource View*: Switches shader parameters and point clouds to reveal high-enthalpy geothermal reservoirs, deep hydrothermal lithium brine flow vectors, and catalytic white hydrogen traps.
3. **Subsurface Depth Slicing & Crustal Peel**: Users adjust the Subsurface Depth Slider (0 km down to 700 km) or engage the Crustal Cutaway tool to expose inner mantle layers, hypocenter clusters, and subterranean heat clouds.
4. **Interactive Acoustic Probing & Playback**: Hovering or clicking any subsurface node triggers the Web Audio synthesis engine, generating an authentic acoustic tone calibrated to that exact event's focal depth and energy magnitude. A "Seismic Playback" sequence audits temporal activity across the globe with polyphonic harmonic resonance.
5. **Node Inspection & Telemetry Flyover**: Clicking any seismic event or exploration target smoothly pivots the camera to that planetary coordinate, opening a precision telemetry drawer with focal depth, moment magnitude, tectonic plate context, and geological hazard/resource scores.

#### Visual Identity & Theme
- **Aesthetic Direction**: Clinical Scientific & Aerospace Precision (strictly governed by anti-slop principles: no neon cyberpunk glow, no cartoon pills, no code-comment titles, no decorative pulse dots).
- **Color Palette & Discipline (60-30-10)**:
  - *60% Dominant Base*: Deep obsidian slate canvas (`#07090E` / `#0B0F19`) with subtle atmospheric rim lighting.
  - *30% Structural Panels*: Dark graphite toolbars (`#111827`), hairline borders (`#1F2937`), and crisp tabular data containers.
  - *10% Precision Accents*: Calibrated telemetry amber (`#F59E0B`) for seismic hazard hypocenters, laser cyan (`#06B6D4`) for geothermal/hydrogen energy matrices, and emerald (`#10B981`) for nominal baseline readings.
- **Typography & Hierarchy**:
  - *Brand & Section Headers*: Clean neo-grotesque display (`Plus Jakarta Sans` / `Inter`, SemiBold 600, balanced tracking).
  - *Telemetry & Measurements*: Monospace tabular numerals (`font-mono tabular-nums`, JetBrains Mono / Space Mono) for all coordinates, depths in km, magnitudes, and timestamps.
- **Component Styling & Layout**:
  - *Top Bar*: Strict 3-zone contract (Single wordmark "Open-Subsurface-Engine", 4 clean navigation anchors, 1 primary action "Audio Telemetry: Active/Muted").
  - *Collapsible Bottom Dock*: Pinned to bottom-center with zero viewport occlusion, housing mode toggles, depth sliders, layer filters, and sonification controls in an ergonomic layout.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Direct USGS Real-Time GeoJSON Feed with Local Fallback**
  - *Chosen Approach*: Direct browser fetch of the live USGS M2.5+ earthquake feed (updated every 5 minutes), parsed into spherical 3D points. Includes pre-calibrated baseline geological datasets (major volcanic magma conduits, key geothermal systems, and tectonic boundary vectors) for offline resilience.
  - *Why*: Provides instant real-world planetary utility with zero API key barriers, complying with the "Maximize Free Resources First" directive.
  - *Alternatives Considered*: Serverless Python FastAPI scraper pipeline. While viable for long-term archiving, a client-side direct fetch with reactive state is zero-latency, zero-cost, and immediately functional in the sandbox.

- **Decision 2: Three.js Spherical-to-Subsurface Coordinate Transform (Structural Z-Axis Enforcement)**
  - *Chosen Approach*: Map geographic coordinates (Latitude, Longitude) onto a base sphere ($R = 100$), then map subsurface focal depth ($0\text{ km} \le d \le 700\text{ km}$) inward as a scaled radial offset ($R - \Delta R(d)$) with optional vertical exaggeration toggles ($1\times$ to $5\times$) so deep mantle events (Benioff zones) are visually legible.
  - *Why*: Respects the structural Z-axis enforcement rule while correctly preserving spherical planetary geometry.
  - *Alternatives Considered*: Flat 2.5D planar map. Rejected because the OSE specification mandates a planetary 3D spatial canvas.

- **Decision 3: Zero-Dependency Native Web Audio API Soundscape Engine**
  - *Chosen Approach*: Custom audio synthesizer utilizing standard `AudioContext`, dual `OscillatorNode` (Sine + Triangle for organic earth rumble), a `BiquadFilterNode` (low-pass frequency mapped to depth), and a `GainNode` with exponential decay envelope.
  - *Why*: Zero external bundle weight, ultra-low latency, and guaranteed cross-browser compatibility without third-party audio library bloat.
  - *Alternatives Considered*: Pre-recorded audio files. Rejected because depth-to-pitch mapping requires continuous dynamic frequency calculation per seismic coordinate.

---

### 4. Technical Architecture & Data Strategy

#### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                     TOP TELEMETRY & APP BAR                            │
│  [ Brand: Open-Subsurface-Engine ] ── [ View Presets ] ── [ Audio Mute ]│
└────────────────────────────────────────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│                       THREE.JS 3D CANVAS STAGE                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  • Textured Earth Sphere (Atmosphere, Landmasses, Tectonic Arcs)  │  │
│  │  • Crustal Cutaway Plane & Semi-Transparent Mantle Shell         │  │
│  │  • InstancedMesh Hypocenters (Depth-Colored, Magnitude-Scaled)   │  │
│  │  • Volumetric Heat Columns & Magma Inflation Particle Vectors    │  │
│  │  • Interactive Raycast Pointer with Spatial Coordinate Probe      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│                 EVENT BUS & STATE ORCHESTRATION                        │
│  ┌───────────────────────┐  ┌─────────────────┐  ┌──────────────────┐  │
│  │  USGS Live Feed Fetch │  │ Subsurface Depth│  │ Web Audio Synth  │  │
│  │  & GeoJSON Parser     │  │ & Mode Filters  │  │ Harmonic Engine  │  │
│  └───────────────────────┘  └─────────────────┘  └──────────────────┘  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│                   COLLAPSIBLE BOTTOM CONTROL DOCK                      │
│  ┌───────────────────────┬─────────────────────┬────────────────────┐  │
│  │ Mode: Safety / Energy │ Depth Filter Slider │ Soundscape Engine  │  │
│  │ [Earthquakes/Magma]   │ [0 km ──── 700 km]  │ [Depth Freq Probe] │  │
│  └───────────────────────┴─────────────────────┴────────────────────┘  │
│  [ ▾ Collapse Dock / Full Viewport Cinema Mode ]                       │
└────────────────────────────────────────────────────────────────────────┘
```

#### Core Data Models & State Schema
- **`SeismicEvent`**: `{ id, title, latitude, longitude, depthKm, magnitude, timestamp, url, alertLevel, domainType }`
- **`GeothermalSite`**: `{ id, name, latitude, longitude, depthKm, estimatedTempC, enthalpyMWe, reservoirType }`
- **`VolcanicConduit`**: `{ id, volcanoName, latitude, longitude, conduitDepthKm, inflationRateMmYr, status }`
- **`EngineState`**:
  - `activeMode`: `'safety'` | `'resource'`
  - `depthRange`: `[minKm, maxKm]` (e.g. `[0, 700]`)
  - `minMagnitude`: `number` (e.g. `2.5`)
  - `verticalExaggeration`: `number` (e.g. `1.0` to `4.0`)
  - `selectedEntity`: `SeismicEvent | GeothermalSite | VolcanicConduit | null`
  - `audioEnabled`: `boolean`
  - `cutawayActive`: `boolean`
  - `cutawayAngle`: `number` (cross-section quadrant slice)

#### Interactive Component & State Mapping
- **Mode Switcher**: Toggles between Safety (earthquakes, magma inflation, fault boundaries) and Resources (geothermal thermal anomalies, lithium brines, white hydrogen traps). Updates Three.js instanced mesh visibilities and particle shaders smoothly.
- **Subsurface Depth Scrubber**: Filters points rendered along the radial vector ($R - \Delta R$). Excludes nodes outside the selected depth window with instant WebGL buffer filtering.
- **Interactive Raycasting Probe**: Hovering any point calculates distance, renders a high-precision HUD tooltip with coordinates and depth, and plays a synthesized acoustic pulse corresponding to that depth.
- **Audio Synthesis Engine**:
  - Frequency calculation: $f(d) = 450 - \left(\frac{d}{700}\right) \times 400\text{ Hz}$ (450 Hz at surface fracturing down to 50 Hz deep mantle sub-bass).
  - Magnitude volume scaling: $G(M) = \min(0.8, 0.15 + (M - 2.5) \times 0.12)$ with smooth exponential ramp.
