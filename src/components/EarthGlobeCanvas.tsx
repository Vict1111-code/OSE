import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ZoomIn, ZoomOut, Compass, Globe2 } from 'lucide-react';
import {
  EARTH_BASE_RADIUS,
  geoToCartesian,
  getDepthColor,
} from '../utils/coordinateTransform';
import {
  createRealisticEarthTextures,
  createProceduralMantleTexture,
  EarthTextureBundle,
} from '../utils/proceduralGlobeTextures';
import {
  SeismicEvent,
  GeothermalSite,
  VolcanicConduit,
  MineralDeposit,
  WhiteHydrogenTrap,
  GroundSubsidenceZone,
  SubsurfaceFilterState,
  SubsurfaceFeature,
} from '../types/geology';
import { TECTONIC_PLATES } from '../services/subsurfaceData';
import { sonification } from '../services/audioSonification';

interface EarthGlobeCanvasProps {
  filters: SubsurfaceFilterState;
  earthquakes: SeismicEvent[];
  geothermalSites: GeothermalSite[];
  volcanoes: VolcanicConduit[];
  minerals: MineralDeposit[];
  hydrogenTraps: WhiteHydrogenTrap[];
  subsidenceZones: GroundSubsidenceZone[];
  selectedFeature: SubsurfaceFeature | null;
  onSelectFeature: (feature: SubsurfaceFeature | null) => void;
}

interface RegionalPreset {
  id: string;
  label: string;
  lat: number;
  lon: number;
  altitudeRadius: number;
}

const REGIONAL_PRESETS: RegionalPreset[] = [
  { id: 'global', label: 'Global Orbit', lat: 20, lon: 0, altitudeRadius: 245 },
  { id: 'pacific', label: 'Pacific Ring of Fire', lat: 18, lon: 145, altitudeRadius: 175 },
  { id: 'iceland', label: 'Iceland Rift', lat: 64.0, lon: -21.5, altitudeRadius: 128 },
  { id: 'california', label: 'California Faults', lat: 35.5, lon: -118.5, altitudeRadius: 132 },
  { id: 'italy', label: 'Mediterranean / Italy', lat: 41.0, lon: 14.0, altitudeRadius: 130 },
  { id: 'ear', label: 'East African Rift', lat: -1.0, lon: 36.0, altitudeRadius: 142 },
];

export const EarthGlobeCanvas: React.FC<EarthGlobeCanvasProps> = ({
  filters,
  earthquakes,
  geothermalSites,
  volcanoes,
  minerals,
  hydrogenTraps,
  subsidenceZones,
  selectedFeature,
  onSelectFeature,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredInfo, setHoveredInfo] = useState<{
    title: string;
    depthKm: number;
    extra: string;
    x: number;
    y: number;
  } | null>(null);

  const [cursorGeoCoords, setCursorGeoCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);

  const [cameraAltitudeKm, setCameraAltitudeKm] = useState<number>(9238);

  // References to Three.js scene objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const planetSystemGroupRef = useRef<THREE.Group | null>(null);
  const outerCrustMeshRef = useRef<THREE.Mesh | null>(null);
  const cloudMeshRef = useRef<THREE.Mesh | null>(null);
  const atmosphereMeshRef = useRef<THREE.Mesh | null>(null);
  const graticuleGroupRef = useRef<THREE.Group | null>(null);
  const plateGroupRef = useRef<THREE.Group | null>(null);
  const interiorGroupRef = useRef<THREE.Group | null>(null);
  const dynamicMarkersGroupRef = useRef<THREE.Group | null>(null);
  const texturesRef = useRef<EarthTextureBundle | null>(null);

  const raycastTargetsRef = useRef<{ mesh: THREE.Object3D; data: SubsurfaceFeature }[]>([]);

  // Smooth camera transition state
  const cameraFlightRef = useRef<{
    active: boolean;
    targetPos: THREE.Vector3;
    targetLookAt: THREE.Vector3;
  }>({
    active: false,
    targetPos: new THREE.Vector3(0, 50, 245),
    targetLookAt: new THREE.Vector3(0, 0, 0),
  });

  // Convert 3D local sphere point back to geographic [lat, lon]
  const cartesianToGeo = (localPoint: THREE.Vector3): { lat: number; lon: number } => {
    const r = localPoint.length();
    if (r === 0) return { lat: 0, lon: 0 };
    const phi = Math.acos(Math.max(-1, Math.min(1, localPoint.y / r)));
    const lat = 90 - (phi * 180) / Math.PI;
    const theta = Math.atan2(localPoint.z, -localPoint.x);
    let lon = (theta * 180) / Math.PI - 180;
    if (lon < -180) lon += 360;
    if (lon > 180) lon -= 360;
    return { lat, lon };
  };

  // Rebuild dynamic subsurface & surface markers
  const rebuildMarkers = useCallback(() => {
    const group = dynamicMarkersGroupRef.current;
    if (!group) return;

    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
    }
    raycastTargetsRef.current = [];

    const { domain, depthRange, minMagnitude, verticalExaggeration, layers } = filters;
    const [minDepth, maxDepth] = depthRange;

    // 1. Earthquakes (Hypocenters + Epicenter Surface Rings + Radial Depth Columns)
    if (domain === 'safety' && layers.earthquakes && earthquakes.length > 0) {
      const activeQuakes = earthquakes.filter(
        (q) => q.depthKm >= minDepth && q.depthKm <= maxDepth && q.magnitude >= minMagnitude
      );

      const sphereGeo = new THREE.SphereGeometry(1, 14, 14);
      const surfaceRingGeo = new THREE.RingGeometry(0.6, 1.15, 20);

      activeQuakes.forEach((quake) => {
        const pos = geoToCartesian(quake.latitude, quake.longitude, quake.depthKm, verticalExaggeration);
        const surfacePos = geoToCartesian(quake.latitude, quake.longitude, 0, 1.0, EARTH_BASE_RADIUS + 0.18);
        const radius = Math.max(0.55, (quake.magnitude - 2.0) * 0.58);
        const color = getDepthColor(quake.depthKm);

        const mat = new THREE.MeshStandardMaterial({
          color: color,
          emissive: color,
          emissiveIntensity: 0.75,
          roughness: 0.25,
          metalness: 0.15,
        });

        const mesh = new THREE.Mesh(sphereGeo, mat);
        mesh.position.copy(pos);
        mesh.scale.setScalar(radius);
        group.add(mesh);

        // Surface epicenter ring marker on exact Earth crust coordinate
        const ringMat = new THREE.MeshBasicMaterial({
          color: color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.75,
        });
        const ringMesh = new THREE.Mesh(surfaceRingGeo, ringMat);
        ringMesh.position.copy(surfacePos);
        ringMesh.scale.setScalar(Math.max(0.7, (quake.magnitude - 2.2) * 0.65));
        ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
        group.add(ringMesh);

        // Radial focal depth stem connecting surface epicenter to subsurface hypocenter
        const lineGeo = new THREE.BufferGeometry().setFromPoints([pos, surfacePos]);
        const lineMat = new THREE.LineBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.45,
        });
        const line = new THREE.Line(lineGeo, lineMat);
        group.add(line);

        raycastTargetsRef.current.push({
          mesh,
          data: { kind: 'earthquake', ...quake },
        });
        raycastTargetsRef.current.push({
          mesh: ringMesh,
          data: { kind: 'earthquake', ...quake },
        });
      });
    }

    // 2. Volcanic Magma Conduits
    if (domain === 'safety' && layers.volcanoes) {
      const coneGeo = new THREE.ConeGeometry(1.3, 3.0, 14);
      const cylGeo = new THREE.CylinderGeometry(0.45, 1.1, 1, 10);

      volcanoes.forEach((volc) => {
        const surfPos = geoToCartesian(volc.latitude, volc.longitude, 0, 1.0, EARTH_BASE_RADIUS + 0.15);
        const basePos = geoToCartesian(volc.latitude, volc.longitude, volc.conduitDepthKm, verticalExaggeration);

        const coneMat = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0xdc2626,
          emissiveIntensity: 0.85,
          roughness: 0.25,
        });
        const cone = new THREE.Mesh(coneGeo, coneMat);
        cone.position.copy(surfPos);
        cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), surfPos.clone().normalize());
        group.add(cone);

        const conduitHeight = Math.max(2.0, surfPos.distanceTo(basePos));
        const conduitMesh = new THREE.Mesh(
          cylGeo,
          new THREE.MeshStandardMaterial({
            color: 0xf97316,
            emissive: 0xea580c,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.88,
          })
        );
        conduitMesh.position.copy(surfPos.clone().add(basePos).multiplyScalar(0.5));
        conduitMesh.scale.set(1, conduitHeight, 1);
        conduitMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), surfPos.clone().sub(basePos).normalize());
        group.add(conduitMesh);

        raycastTargetsRef.current.push({
          mesh: cone,
          data: { kind: 'volcano', ...volc },
        });
      });
    }

    // 3. InSAR Subsidence Zones
    if (domain === 'safety' && layers.insarSubsidence) {
      const ringGeo = new THREE.RingGeometry(1.0, 2.0, 24);
      subsidenceZones.forEach((sub) => {
        const pos = geoToCartesian(sub.latitude, sub.longitude, 0, 1.0, EARTH_BASE_RADIUS + 0.22);
        const mat = new THREE.MeshBasicMaterial({
          color: 0xf59e0b,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9,
        });
        const ring = new THREE.Mesh(ringGeo, mat);
        ring.position.copy(pos);
        ring.lookAt(new THREE.Vector3(0, 0, 0));
        group.add(ring);

        raycastTargetsRef.current.push({
          mesh: ring,
          data: { kind: 'subsidence', ...sub },
        });
      });
    }

    // 4. Geothermal Reservoirs
    if (domain === 'resource' && layers.geothermal) {
      const cylGeo = new THREE.CylinderGeometry(0.7, 1.6, 1, 12);
      geothermalSites.forEach((site) => {
        const surfPos = geoToCartesian(site.latitude, site.longitude, 0, 1.0, EARTH_BASE_RADIUS + 0.2);
        const reservoirPos = geoToCartesian(site.latitude, site.longitude, site.depthKm, verticalExaggeration);

        const height = Math.max(2.5, surfPos.distanceTo(reservoirPos));
        const mat = new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          emissive: 0x0891b2,
          emissiveIntensity: 0.9,
          transparent: true,
          opacity: 0.85,
        });
        const plume = new THREE.Mesh(cylGeo, mat);
        plume.position.copy(surfPos.clone().add(reservoirPos).multiplyScalar(0.5));
        plume.scale.set(1.3, height, 1.3);
        plume.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), surfPos.clone().sub(reservoirPos).normalize());
        group.add(plume);

        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(1.15, 14, 14),
          new THREE.MeshBasicMaterial({ color: 0x22d3ee })
        );
        sphere.position.copy(surfPos);
        group.add(sphere);

        raycastTargetsRef.current.push({
          mesh: sphere,
          data: { kind: 'geothermal', ...site },
        });
      });
    }

    // 5. Mineral Deposits
    if (domain === 'resource' && layers.minerals) {
      const octGeo = new THREE.OctahedronGeometry(1.35);
      minerals.forEach((min) => {
        const pos = geoToCartesian(min.latitude, min.longitude, min.depthKm, verticalExaggeration);
        const surfPos = geoToCartesian(min.latitude, min.longitude, 0, 1.0, EARTH_BASE_RADIUS + 0.2);
        const mat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          emissive: 0xd97706,
          emissiveIntensity: 0.75,
          metalness: 0.8,
          roughness: 0.2,
        });
        const mesh = new THREE.Mesh(octGeo, mat);
        mesh.position.copy(pos);
        group.add(mesh);

        const surfMarker = new THREE.Mesh(octGeo, mat);
        surfMarker.position.copy(surfPos);
        surfMarker.scale.setScalar(0.85);
        group.add(surfMarker);

        raycastTargetsRef.current.push({
          mesh,
          data: { kind: 'mineral', ...min },
        });
        raycastTargetsRef.current.push({
          mesh: surfMarker,
          data: { kind: 'mineral', ...min },
        });
      });
    }

    // 6. White Hydrogen Traps
    if (domain === 'resource' && layers.whiteHydrogen) {
      const boxGeo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
      hydrogenTraps.forEach((h2) => {
        const pos = geoToCartesian(h2.latitude, h2.longitude, h2.depthKm, verticalExaggeration);
        const surfPos = geoToCartesian(h2.latitude, h2.longitude, 0, 1.0, EARTH_BASE_RADIUS + 0.2);
        const mat = new THREE.MeshStandardMaterial({
          color: 0x10b981,
          emissive: 0x059669,
          emissiveIntensity: 0.8,
          roughness: 0.25,
        });
        const mesh = new THREE.Mesh(boxGeo, mat);
        mesh.position.copy(pos);
        group.add(mesh);

        const surfMesh = new THREE.Mesh(boxGeo, mat);
        surfMesh.position.copy(surfPos);
        surfMesh.scale.setScalar(0.8);
        group.add(surfMesh);

        raycastTargetsRef.current.push({
          mesh,
          data: { kind: 'hydrogen', ...h2 },
        });
        raycastTargetsRef.current.push({
          mesh: surfMesh,
          data: { kind: 'hydrogen', ...h2 },
        });
      });
    }
  }, [filters, earthquakes, geothermalSites, volcanoes, minerals, hydrogenTraps, subsidenceZones]);

  // Main Three.js Digital Earth Initialization
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Scene & Deep Space Environment
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x03060c);
    sceneRef.current = scene;

    // Perspective Camera with high precision near/far planes for deep surface zoom
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.5, 3000);
    camera.position.set(0, 50, 245);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // OrbitControls with wide zoom range (from 600 km low orbit to 30,000 km deep space)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed = 0.65;
    controls.zoomSpeed = 0.9;
    controls.enablePan = false;
    controls.minDistance = 104; // Zoom right down to ~250 km altitude above surface
    controls.maxDistance = 680;
    controlsRef.current = controls;

    // Solar & Orbital Illumination Rig
    const sunKeyLight = new THREE.DirectionalLight(0xffffff, 2.65);
    sunKeyLight.position.set(220, 110, 200);
    scene.add(sunKeyLight);

    const earthshineFillLight = new THREE.DirectionalLight(0x38bdf8, 0.85);
    earthshineFillLight.position.set(-200, -80, -160);
    scene.add(earthshineFillLight);

    const ambientHemi = new THREE.HemisphereLight(0xbae6fd, 0x0f172a, 0.65);
    scene.add(ambientHemi);

    // Deep Space Starfield (Multi-magnitude realistic stars)
    const starCount = 1400;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const radius = 850 + Math.random() * 600;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);

      const tint = 0.78 + Math.random() * 0.22;
      starColors[i * 3] = tint;
      starColors[i * 3 + 1] = tint;
      starColors[i * 3 + 2] = Math.min(1, tint + 0.08);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 1.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
    });
    scene.add(new THREE.Points(starGeo, starMat));

    // Root Planet System Group (rotates all Earth layers and markers in unison)
    const planetSystem = new THREE.Group();
    scene.add(planetSystem);
    planetSystemGroupRef.current = planetSystem;

    // Generate High-Resolution Photorealistic Blue Marble Textures (+ async satellite upgrade)
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const earthTextures = createRealisticEarthTextures(() => {
      earthTextures.albedoMap.anisotropy = maxAnisotropy;
      earthTextures.bumpMap.anisotropy = maxAnisotropy;
    });
    earthTextures.albedoMap.anisotropy = maxAnisotropy;
    earthTextures.bumpMap.anisotropy = maxAnisotropy;
    earthTextures.roughnessMap.anisotropy = maxAnisotropy;
    earthTextures.cloudsMap.anisotropy = maxAnisotropy;
    texturesRef.current = earthTextures;

    // 1. Outer Earth Crust & Surface Sphere (R = 100.0 = 6,371.0 km)
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTextures.albedoMap,
      bumpMap: earthTextures.bumpMap,
      bumpScale: 1.4,
      roughnessMap: earthTextures.roughnessMap,
      roughness: 1.0,
      metalness: 0.08,
      emissiveMap: earthTextures.nightLightsMap,
      emissive: new THREE.Color(0xffb74d),
      emissiveIntensity: 0.12,
      transparent: false,
      opacity: 1.0,
    });
    const earthGeo = new THREE.SphereGeometry(EARTH_BASE_RADIUS, 128, 96);
    const outerCrust = new THREE.Mesh(earthGeo, earthMat);
    planetSystem.add(outerCrust);
    outerCrustMeshRef.current = outerCrust;

    // 2. Dynamic Cloud Layer Sphere (R = 100.65)
    const cloudMat = new THREE.MeshStandardMaterial({
      map: earthTextures.cloudsMap,
      alphaMap: earthTextures.cloudsMap,
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
      roughness: 0.9,
      metalness: 0.0,
    });
    const cloudGeo = new THREE.SphereGeometry(EARTH_BASE_RADIUS + 0.65, 96, 72);
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    planetSystem.add(cloudMesh);
    cloudMeshRef.current = cloudMesh;

    // 3. Rayleigh Atmospheric Scattering Halo (R = 103.0)
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.66 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.8);
          vec3 atmosColor = mix(vec3(0.12, 0.55, 0.98), vec3(0.38, 0.78, 1.0), intensity);
          gl_FragColor = vec4(atmosColor, 1.0) * intensity * 0.95;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    const atmosphereMesh = new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_BASE_RADIUS + 3.0, 96, 72),
      atmosphereMat
    );
    scene.add(atmosphereMesh);
    atmosphereMeshRef.current = atmosphereMesh;

    // 4. Precision 3D Coordinate Graticule (Parallels & Meridians at R = 100.12)
    const graticuleGroup = new THREE.Group();
    planetSystem.add(graticuleGroup);
    graticuleGroupRef.current = graticuleGroup;

    const graticuleMat = new THREE.LineBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.16,
    });
    const equatorMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.38,
    });

    // Latitude parallels every 30°
    for (let lat = -60; lat <= 60; lat += 30) {
      const pts: THREE.Vector3[] = [];
      for (let lon = -180; lon <= 180; lon += 4) {
        pts.push(geoToCartesian(lat, lon, 0, 1.0, EARTH_BASE_RADIUS + 0.12));
      }
      graticuleGroup.add(
        new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lat === 0 ? equatorMat : graticuleMat)
      );
    }
    // Longitude meridians every 30°
    for (let lon = -180; lon < 180; lon += 30) {
      const pts: THREE.Vector3[] = [];
      for (let lat = -85; lat <= 85; lat += 4) {
        pts.push(geoToCartesian(lat, lon, 0, 1.0, EARTH_BASE_RADIUS + 0.12));
      }
      graticuleGroup.add(
        new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lon === 0 ? equatorMat : graticuleMat)
      );
    }

    // 5. True-Scale Concentric Internal Earth Structure (Crust -> Upper Mantle -> Lower Mantle -> Outer Core -> Inner Core)
    const interiorGroup = new THREE.Group();
    planetSystem.add(interiorGroup);
    interiorGroupRef.current = interiorGroup;

    const mantleTex = createProceduralMantleTexture();
    // Upper Mantle Asthenosphere Shell (R = 94.0, sliced to match cutaway)
    const upperMantleMat = new THREE.MeshStandardMaterial({
      map: mantleTex,
      emissive: new THREE.Color(0xc2410c),
      emissiveIntensity: 0.45,
      roughness: 0.65,
    });
    const upperMantleMesh = new THREE.Mesh(new THREE.SphereGeometry(94.0, 64, 48), upperMantleMat);
    interiorGroup.add(upperMantleMesh);

    // Lower Mantle Shell (R = 54.6 = Gutenberg Core-Mantle Boundary at 2,890 km depth)
    const lowerMantleMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      emissive: 0x991b1b,
      emissiveIntensity: 0.6,
      roughness: 0.5,
    });
    const lowerMantleMesh = new THREE.Mesh(new THREE.SphereGeometry(54.6, 48, 36), lowerMantleMat);
    interiorGroup.add(lowerMantleMesh);

    // Outer Liquid Iron-Nickel Core (R = 36.0)
    const outerCoreMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xea580c,
      emissiveIntensity: 0.85,
      metalness: 0.65,
      roughness: 0.3,
    });
    const outerCoreMesh = new THREE.Mesh(new THREE.SphereGeometry(36.0, 48, 36), outerCoreMat);
    interiorGroup.add(outerCoreMesh);

    // Inner Solid Crystalline Core (R = 19.1 = 1,220 km radius at 5,700°C)
    const innerCoreMat = new THREE.MeshStandardMaterial({
      color: 0xfef9c3,
      emissive: 0xfacc15,
      emissiveIntensity: 1.2,
      metalness: 0.9,
      roughness: 0.15,
    });
    const innerCoreMesh = new THREE.Mesh(new THREE.SphereGeometry(19.1, 36, 28), innerCoreMat);
    interiorGroup.add(innerCoreMesh);

    // 6. Tectonic Plate Boundary Arcs (R = 100.22)
    const plateGroup = new THREE.Group();
    planetSystem.add(plateGroup);
    plateGroupRef.current = plateGroup;

    TECTONIC_PLATES.forEach((plate) => {
      const points = plate.points.map(([lat, lon]) =>
        geoToCartesian(lat, lon, 0, 1.0, EARTH_BASE_RADIUS + 0.22)
      );
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: plate.type === 'Subduction' ? 0xf59e0b : 0x22d3ee,
        transparent: true,
        opacity: 0.72,
      });
      plateGroup.add(new THREE.Line(lineGeo, lineMat));
    });

    // 7. Dynamic Subsurface & Surface Markers Group
    const dynamicGroup = new THREE.Group();
    planetSystem.add(dynamicGroup);
    dynamicMarkersGroupRef.current = dynamicGroup;

    // Resize listener
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Track user drag / interaction and dynamically scale zoom/rotate speed by altitude
    let isUserInteracting = false;
    controls.addEventListener('start', () => {
      isUserInteracting = true;
      cameraFlightRef.current.active = false;
    });
    controls.addEventListener('end', () => {
      isUserInteracting = false;
    });

    controls.addEventListener('change', () => {
      const dist = camera.position.distanceTo(controls.target);
      // Scale rotation speed down when zoomed close to surface for precision handling
      const heightAboveSurface = Math.max(4, dist - EARTH_BASE_RADIUS);
      controls.rotateSpeed = Math.min(0.75, Math.max(0.12, (heightAboveSurface / 140) * 0.65));

      // Convert Three.js radius to real Earth altitude in km (100 units = 6,371 km)
      const realAltKm = Math.max(120, Math.round((dist - EARTH_BASE_RADIUS) * 63.71));
      setCameraAltitudeKm(realAltKm);
    });

    let animId = 0;
    const clock = new THREE.Clock();

    const tick = () => {
      const delta = Math.min(clock.getDelta(), 0.1);

      // Smooth camera flight interpolation when jumping to a region or feature
      if (cameraFlightRef.current.active) {
        const dampFactor = 1 - Math.exp(-5.5 * delta);
        camera.position.lerp(cameraFlightRef.current.targetPos, dampFactor);
        controls.target.lerp(cameraFlightRef.current.targetLookAt, dampFactor);
        if (camera.position.distanceTo(cameraFlightRef.current.targetPos) < 0.6) {
          cameraFlightRef.current.active = false;
        }
      }

      controls.update();

      // Gentle axial planetary rotation + independent atmospheric cloud drift
      if (!isUserInteracting && !cameraFlightRef.current.active) {
        planetSystem.rotation.y += delta * 0.012;
      }
      if (cloudMeshRef.current) {
        cloudMeshRef.current.rotation.y += delta * 0.004;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      earthTextures.dispose();
      mantleTex.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Sync Earth Surface Mode, Clouds, Atmosphere, Graticule, Tectonic Plates & Cutaway
  useEffect(() => {
    const outerMesh = outerCrustMeshRef.current;
    const cloudMesh = cloudMeshRef.current;
    const atmosMesh = atmosphereMeshRef.current;
    const graticuleGroup = graticuleGroupRef.current;
    const plateGroup = plateGroupRef.current;

    if (outerMesh && outerMesh.material instanceof THREE.MeshStandardMaterial) {
      const mat = outerMesh.material;

      if (filters.earthSurfaceMode === 'satellite') {
        mat.transparent = false;
        mat.opacity = 1.0;
        mat.emissiveIntensity = 0.08;
        mat.bumpScale = 1.4;
      } else if (filters.earthSurfaceMode === 'dayNight') {
        mat.transparent = false;
        mat.opacity = 1.0;
        mat.emissiveIntensity = 0.85;
        mat.bumpScale = 1.1;
      } else if (filters.earthSurfaceMode === 'xray') {
        mat.transparent = true;
        mat.opacity = 0.42;
        mat.emissiveIntensity = 0.25;
        mat.bumpScale = 0.6;
      }
      mat.needsUpdate = true;

      // Update Crustal Cutaway Wedge Geometry (270° visible = 90° open mantle cutaway)
      const thetaLen = filters.cutawayActive ? Math.PI * 1.5 : Math.PI * 2;
      outerMesh.geometry.dispose();
      outerMesh.geometry = new THREE.SphereGeometry(EARTH_BASE_RADIUS, 128, 96, 0, thetaLen);
      mat.side = filters.cutawayActive || filters.earthSurfaceMode === 'xray' ? THREE.DoubleSide : THREE.FrontSide;
    }

    if (cloudMesh) {
      cloudMesh.visible = filters.showClouds && filters.earthSurfaceMode !== 'xray';
      const thetaLen = filters.cutawayActive ? Math.PI * 1.5 : Math.PI * 2;
      cloudMesh.geometry.dispose();
      cloudMesh.geometry = new THREE.SphereGeometry(EARTH_BASE_RADIUS + 0.65, 96, 72, 0, thetaLen);
    }

    if (atmosMesh) {
      atmosMesh.visible = filters.showAtmosphere;
    }

    if (graticuleGroup) {
      graticuleGroup.visible = filters.showGraticule;
    }

    if (plateGroup) {
      plateGroup.visible = filters.layers.tectonicPlates;
    }
  }, [
    filters.earthSurfaceMode,
    filters.showClouds,
    filters.showAtmosphere,
    filters.showGraticule,
    filters.cutawayActive,
    filters.layers.tectonicPlates,
  ]);

  // Rebuild markers when data or filters change
  useEffect(() => {
    rebuildMarkers();
  }, [rebuildMarkers]);

  // Camera Zoom & Preset Helpers
  const handleZoomStep = (factor: number) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const dir = camera.position.clone().sub(controls.target);
    const currentDist = dir.length();
    const nextDist = Math.max(controls.minDistance, Math.min(controls.maxDistance, currentDist * factor));

    cameraFlightRef.current = {
      active: true,
      targetPos: controls.target.clone().add(dir.normalize().multiplyScalar(nextDist)),
      targetLookAt: controls.target.clone(),
    };
  };

  const handleFlyToPreset = (preset: RegionalPreset) => {
    const planetGroup = planetSystemGroupRef.current;
    if (!planetGroup) return;

    if (preset.id === 'global') {
      cameraFlightRef.current = {
        active: true,
        targetPos: new THREE.Vector3(0, 50, 245),
        targetLookAt: new THREE.Vector3(0, 0, 0),
      };
      return;
    }

    const localSurfacePos = geoToCartesian(preset.lat, preset.lon, 0, 1.0, preset.altitudeRadius);
    const worldTargetPos = localSurfacePos.clone().applyEuler(planetGroup.rotation);

    cameraFlightRef.current = {
      active: true,
      targetPos: worldTargetPos,
      targetLookAt: new THREE.Vector3(0, 0, 0),
    };
  };

  // Focus camera when a specific seismic/geologic feature is selected
  useEffect(() => {
    if (!selectedFeature || !planetSystemGroupRef.current) return;
    const localPos = geoToCartesian(
      selectedFeature.latitude,
      selectedFeature.longitude,
      0,
      1.0,
      EARTH_BASE_RADIUS + 58
    );
    const worldCamPos = localPos.clone().applyEuler(planetSystemGroupRef.current.rotation);

    cameraFlightRef.current = {
      active: true,
      targetPos: worldCamPos,
      targetLookAt: new THREE.Vector3(0, 0, 0),
    };
  }, [selectedFeature]);

  // Raycasting for Both Feature Markers AND Live Geodetic Lat/Lon Cursor Readout
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cameraRef.current || !mountRef.current) return;

    const rect = mountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    // 1. Update live cursor Latitude / Longitude on Earth globe surface
    if (outerCrustMeshRef.current && planetSystemGroupRef.current) {
      const globeHits = raycaster.intersectObject(outerCrustMeshRef.current, false);
      if (globeHits.length > 0) {
        const localPt = planetSystemGroupRef.current.worldToLocal(globeHits[0].point.clone());
        setCursorGeoCoords(cartesianToGeo(localPt));
      } else {
        setCursorGeoCoords(null);
      }
    }

    // 2. Check Subsurface / Surface Feature Markers
    if (raycastTargetsRef.current.length === 0) return;
    const targetObjects = raycastTargetsRef.current.map((t) => t.mesh);
    const intersects = raycaster.intersectObjects(targetObjects, false);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const match = raycastTargetsRef.current.find((t) => t.mesh === hit.object);
      if (match) {
        const item = match.data;
        let title = '';
        let depthKm = 0;
        let extra = '';

        if (item.kind === 'earthquake') {
          title = item.title;
          depthKm = item.depthKm;
          extra = `M ${item.magnitude.toFixed(1)} · ${item.place}`;
        } else if (item.kind === 'volcano') {
          title = `${item.volcanoName} Conduit`;
          depthKm = item.conduitDepthKm;
          extra = `Inflation: ${item.inflationRateMmYr} mm/yr · ${item.status}`;
        } else if (item.kind === 'geothermal') {
          title = item.name;
          depthKm = item.depthKm;
          extra = `${item.estimatedTempC}°C · ${item.enthalpyMWe} MWe Potential`;
        } else if (item.kind === 'mineral') {
          title = item.name;
          depthKm = item.depthKm;
          extra = `${item.commodity} · ${item.oreGrade}`;
        } else if (item.kind === 'hydrogen') {
          title = item.name;
          depthKm = item.depthKm;
          extra = `${item.estimatedPurityPercent}% H2 Purity · ${item.hostRock}`;
        } else if (item.kind === 'subsidence') {
          title = `${item.city} Subsidence`;
          depthKm = item.depthKm;
          extra = `-${item.subsidenceRateMmYr} mm/yr InSAR · ${item.riskClassification}`;
        }

        setHoveredInfo({
          title,
          depthKm,
          extra,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });

        if (filters.audioEnabled) {
          sonification.triggerProbeHover(depthKm);
        }
        return;
      }
    }

    setHoveredInfo(null);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cameraRef.current || !mountRef.current || raycastTargetsRef.current.length === 0) return;

    const rect = mountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const targetObjects = raycastTargetsRef.current.map((t) => t.mesh);
    const intersects = raycaster.intersectObjects(targetObjects, false);

    if (intersects.length > 0) {
      const match = raycastTargetsRef.current.find((t) => t.mesh === intersects[0].object);
      if (match) {
        onSelectFeature(match.data);

        if (filters.audioEnabled) {
          const depth =
            match.data.kind === 'earthquake'
              ? match.data.depthKm
              : match.data.kind === 'volcano'
              ? match.data.conduitDepthKm
              : match.data.depthKm;
          const mag = match.data.kind === 'earthquake' ? match.data.magnitude : 4.5;
          sonification.triggerSeismicEvent(depth, mag, 1.8);
        }
      }
    }
  };

  const formatCoord = (val: number, posChar: string, negChar: string) =>
    `${Math.abs(val).toFixed(2)}° ${val >= 0 ? posChar : negChar}`;

  return (
    <div
      ref={mountRef}
      className="relative w-full h-full cursor-crosshair overflow-hidden select-none"
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
    >
      {/* Precision Floating Hover Tooltip HUD */}
      {hoveredInfo && (
        <div
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-2 bg-slate-900/95 border border-slate-700/80 rounded-md shadow-xl text-left"
          style={{ left: hoveredInfo.x, top: hoveredInfo.y }}
        >
          <div className="text-xs font-semibold text-slate-100">{hoveredInfo.title}</div>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
            <span className="font-mono tabular-nums text-amber-400 font-medium">
              Depth: {hoveredInfo.depthKm.toFixed(1)} km
            </span>
            <span aria-hidden="true">·</span>
            <span>{hoveredInfo.extra}</span>
          </div>
        </div>
      )}

      {/* Top-Right Digital Twin Geodetic Telemetry & Zoom Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
        {/* Live Geodetic Readout Box */}
        <div className="pointer-events-none flex flex-col items-end gap-1 text-[11px] font-mono text-slate-300 bg-slate-950/85 border border-slate-800/90 rounded-lg px-3 py-2 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">EARTH RADIUS:</span>
            <span className="tabular-nums text-slate-100 font-semibold">6,371.0 KM</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">ORBIT ALTITUDE:</span>
            <span className="tabular-nums text-cyan-400 font-semibold">
              {cameraAltitudeKm.toLocaleString()} KM
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">CURSOR GEODETIC:</span>
            <span className="tabular-nums text-amber-400">
              {cursorGeoCoords
                ? `${formatCoord(cursorGeoCoords.lat, 'N', 'S')} · ${formatCoord(cursorGeoCoords.lon, 'E', 'W')}`
                : 'DEEP SPACE'}
            </span>
          </div>
        </div>

        {/* Zoom & Regional Jump Toolbar */}
        <div className="flex items-center gap-1.5 bg-slate-950/90 border border-slate-800/90 rounded-lg p-1.5 shadow-lg">
          <button
            onClick={() => handleZoomStep(0.76)}
            title="Zoom Closer to Earth Surface"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoomStep(1.32)}
            title="Zoom Out to Orbital View"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleFlyToPreset(REGIONAL_PRESETS[0])}
            title="Reset Full Planetary View"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer border-l border-slate-800 pl-2"
          >
            <Compass className="w-4 h-4" />
          </button>

          <select
            aria-label="Jump to Planetary Region"
            onChange={(e) => {
              const found = REGIONAL_PRESETS.find((p) => p.id === e.target.value);
              if (found) handleFlyToPreset(found);
            }}
            defaultValue="global"
            className="bg-slate-900 text-slate-200 text-xs font-medium px-2 py-1 rounded border border-slate-800 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {REGIONAL_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
