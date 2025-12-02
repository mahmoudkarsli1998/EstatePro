import React, { Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Grid, Float, Text } from '@react-three/drei';
import * as THREE from 'three';

// --- Procedural Assets ---

const Furniture = {
  Bed: ({ position, rotation, color = "#3B82F6" }) => (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[1.8, 0.5, 2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.6, -0.9]} castShadow>
        <boxGeometry args={[1.8, 0.3, 0.2]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, 0.55, 0.4]} castShadow>
        <boxGeometry args={[1.6, 0.1, 1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  ),
  Sofa: ({ position, rotation, color = "#4B5563" }) => (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[2.2, 0.5, 0.8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.6, -0.3]} castShadow>
        <boxGeometry args={[2.2, 0.6, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-1, 0.4, 0.2]} castShadow>
        <boxGeometry args={[0.2, 0.4, 0.6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[1, 0.4, 0.2]} castShadow>
        <boxGeometry args={[0.2, 0.4, 0.6]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  ),
  Table: ({ position, size = [1.2, 0.8], color = "#8B5CF6" }) => (
    <group position={position}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[size[0], 0.05, size[1]]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-size[0]/2 + 0.1, 0.2, -size[1]/2 + 0.1]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.4]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[size[0]/2 - 0.1, 0.2, -size[1]/2 + 0.1]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.4]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[-size[0]/2 + 0.1, 0.2, size[1]/2 - 0.1]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.4]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[size[0]/2 - 0.1, 0.2, size[1]/2 - 0.1]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.4]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  ),
  Cabinet: ({ position, rotation }) => (
    <mesh position={position} rotation={rotation} castShadow>
      <boxGeometry args={[1, 2, 0.6]} />
      <meshStandardMaterial color="#9ca3af" />
    </mesh>
  )
};

// --- Room Generators ---

const generateLayout = (unitId, type, features) => {
  // Simple deterministic random based on unit ID
  const seed = unitId * 123.45;
  const rand = () => {
    const x = Math.sin(seed + Math.random()) * 10000;
    return x - Math.floor(x);
  };

  const wallColor = ["#f3f4f6", "#e5e7eb", "#d1d5db", "#fef3c7", "#e0f2fe"][unitId % 5];
  const floorColor = ["#475569", "#334155", "#1e293b", "#57534e", "#4b5563"][unitId % 5];
  
  // Base room dimensions
  let width = 6 + (features.bedrooms * 2);
  let depth = 6 + (features.bathrooms * 1.5);
  
  if (type === 'studio') { width = 6; depth = 5; }
  if (type === 'villa') { width = 12; depth = 10; }

  const items = [];

  // Add Bed(s)
  const bedCount = Math.max(1, features.bedrooms);
  for (let i = 0; i < bedCount; i++) {
    items.push({
      type: 'Bed',
      position: [-width/2 + 2 + (i * 2.5), 0, -depth/2 + 2],
      rotation: [0, 0, 0],
      color: `hsl(${(unitId * 50 + i * 30) % 360}, 70%, 60%)`
    });
  }

  // Add Living Area
  items.push({
    type: 'Sofa',
    position: [width/2 - 2, 0, depth/2 - 2],
    rotation: [0, -Math.PI/2, 0],
    color: `hsl(${(unitId * 30) % 360}, 40%, 40%)`
  });

  items.push({
    type: 'Table',
    position: [width/2 - 2, 0, depth/2 - 2],
    size: [1, 1]
  });

  // Add Storage
  items.push({
    type: 'Cabinet',
    position: [-width/2 + 1, 1, depth/2 - 1],
    rotation: [0, 0, 0]
  });

  return { width, depth, wallColor, floorColor, items };
};

const ProceduralRoom = ({ unit }) => {
  const layout = useMemo(() => generateLayout(unit.id, unit.type, unit.features), [unit]);

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[layout.width, layout.depth, 0.2]} />
        <meshStandardMaterial color={layout.floorColor} />
      </mesh>

      {/* Walls */}
      {/* Back */}
      <mesh position={[0, 1.5, -layout.depth/2]} receiveShadow>
        <boxGeometry args={[layout.width, 3, 0.2]} />
        <meshStandardMaterial color={layout.wallColor} />
      </mesh>
      {/* Left */}
      <mesh position={[-layout.width/2, 1.5, 0]} rotation={[0, Math.PI/2, 0]} receiveShadow>
        <boxGeometry args={[layout.depth, 3, 0.2]} />
        <meshStandardMaterial color={layout.wallColor} />
      </mesh>
      {/* Right (Partial for view) */}
      <mesh position={[layout.width/2, 0.5, 0]} rotation={[0, Math.PI/2, 0]} receiveShadow>
        <boxGeometry args={[layout.depth, 1, 0.2]} />
        <meshStandardMaterial color={layout.wallColor} transparent opacity={0.5} />
      </mesh>

      {/* Items */}
      {layout.items.map((item, idx) => {
        const Component = Furniture[item.type];
        return <Component key={idx} {...item} />;
      })}

      {/* Unit Label Floating */}
      <Float speed={2} rotationIntensity={0} floatIntensity={0.5}>
        <group position={[0, 3, 0]}>
          <Text
            fontSize={0.5}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {unit.type.toUpperCase()}
          </Text>
          <Text
            position={[0, -0.6, 0]}
            fontSize={0.3}
            color="#3B82F6"
            anchorX="center"
            anchorY="middle"
          >
            {unit.area_m2} m²
          </Text>
        </group>
      </Float>
    </group>
  );
};

const Unit3DViewer = ({ unit }) => {
  const [viewMode, setViewMode] = useState('isometric'); // isometric, top, firstPerson

  const cameraSettings = {
    isometric: { position: [10, 10, 10], fov: 45 },
    top: { position: [0, 15, 0], fov: 45 },
    detail: { position: [5, 2, 5], fov: 60 }
  };

  return (
    <div className="w-full h-[600px] bg-gray-900 rounded-xl overflow-hidden relative group">
      {/* Controls Overlay */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button 
          onClick={() => setViewMode('isometric')}
          className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur border transition-all ${viewMode === 'isometric' ? 'bg-primary text-white border-primary' : 'bg-black/50 text-gray-300 border-white/10'}`}
        >
          Isometric
        </button>
        <button 
          onClick={() => setViewMode('top')}
          className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur border transition-all ${viewMode === 'top' ? 'bg-primary text-white border-primary' : 'bg-black/50 text-gray-300 border-white/10'}`}
        >
          Top View
        </button>
        <button 
          onClick={() => setViewMode('detail')}
          className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur border transition-all ${viewMode === 'detail' ? 'bg-primary text-white border-primary' : 'bg-black/50 text-gray-300 border-white/10'}`}
        >
          Deep Dive
        </button>
      </div>

      <div className="absolute bottom-4 right-4 z-10 bg-black/60 backdrop-blur px-4 py-2 rounded-lg border border-white/10 text-right">
        <p className="text-xs text-gray-400 uppercase tracking-wider">Generated Layout</p>
        <p className="text-white font-bold">{unit.features.bedrooms} Bed • {unit.features.bathrooms} Bath</p>
      </div>

      <Canvas shadows camera={cameraSettings[viewMode]}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6} adjustCamera={false}>
            <ProceduralRoom unit={unit} />
          </Stage>
          <Grid 
            renderOrder={-1} 
            position={[0, -0.15, 0]} 
            infiniteGrid 
            fadeDistance={50} 
            sectionColor="#3B82F6" 
            cellColor="#1e293b" 
          />
          <OrbitControls 
            makeDefault 
            autoRotate={viewMode === 'isometric'}
            autoRotateSpeed={0.5}
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Unit3DViewer;
