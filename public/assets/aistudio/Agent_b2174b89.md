# Agent Instructions: Open-Subsurface-Engine (OSE)
## System Persona, Project Objectives, & Data Integrity Standards

Welcome, AI Agent. This document acts as your comprehensive behavioral protocol, core context base, and technical instruction guide for contributing to the **Open-Subsurface-Engine (OSE)** project. 

---

## 1. Project Vision & Objective
The Open-Subsurface-Engine is an open-source, multi-sensory planetary visualization and diagnostic engine. It aims to eliminate "subsurface blindness" by converting raw global geological data (seismic, thermal, InSAR, geochemical) into intuitive 3D visualizations and audio soundscapes.

### Core Goals:
1.  **Democratize Exploration:** Lower exploration costs for Clean Energy (Geothermal, White Hydrogen) and Critical Minerals (Lithium).
2.  **Mitigate Disasters:** Provide actionable public safety dashboards for Volcano, Earthquake, and Landslide prediction.
3.  **Secure Urban Infrastructure:** Prevent city ground collapse, sinkholes, and structural foundation failures.

---

## 2. Technical Stack Context

As an AI contributor, when generating code, system documentation, or structural suggestions for this project, you must align precisely with this technical framework:

*   **Backend & Pipelines:** Python 3.11+, FastAPI (for high-speed async APIs), Pandas/NumPy (data vectorization), GeoPandas/Shapely (spatial geometries).
*   **Frontend Rendering:** WebGL-based engines—specifically **CesiumJS** (for global geospatial context) or **Three.js** (for dense custom 3D voxel environments).
*   **Sensory Processing:** **Web Audio API** natively in the browser for data sonification. Avoid external audio frameworks.
*   **Data Standards:** GeoJSON for real-time events, WKT (Well-Known Text) for spatial regions, NetCDF/HDF5 for dense 3D atmospheric/subsurface datasets.

---

## 3. Code Generation Guidelines

When generating code or refactoring systems within this project, you must enforce the following architectural rules:

### A. Separation of Processing and Rendering
Never couple data fetching logic directly inside your WebGL visual components. Always construct clean API contracts:
1.  **The Backend** pulls, cleans, scales, and formats structural numbers into flat, compressed arrays or GeoJSON.
2.  **The Frontend** ingests these clean streams and maps them directly to vertices, fragment shaders, or audio nodes.

### B. Structural Z-Axis Enforcement
Earth coordinates are traditionally handled via Latitude and Longitude (2D). This project is fundamentally **3D and 4D**. Always explicitly process the `depth` or `elevation` metric as a negative or positive Z-coordinate. Ensure proper conversions from spatial depth (kilometers underground) to WebGL coordinate models.

### C. Data Sonification Implementation
When writing JavaScript code for audio feedback, always use native browser audio oscillators mapping parameters programmatically:
*   Map **Depth** to frequency pitch (e.g., lower depth = deeper audio hum).
*   Map **Magnitude / Displacement Velocity** to gain nodes (volume and distortion).

---

## 4. Problem-Solving Protocols

When a user asks you to expand features, diagnose errors, or outline specialized modules for the OSE platform, follow this exact workflow:

1.  **Identify the Planetary Domain:** Determine if the task sits under Energy/Minerals, Safety/Disaster, or Infrastructure/Cities.
2.  **Maximize Free Resources First:** Prioritize utilizing free APIs (USGS, NASA Earthdata, ESA Copernicus, PostGIS) before recommending paid or capital-intensive components.
3.  **Provide High Sensory Value:** Always explain how the data should be displayed or felt. Do not settle for simple text readouts; explain how to render vectors, heat maps, or custom audio frequencies to make the planetary behavior human-scale.
