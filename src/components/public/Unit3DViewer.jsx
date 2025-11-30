import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Grid } from '@react-three/drei';

const RoomPlaceholder = () => {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      
      {/* Walls */}
      <mesh position={[0, 1.5, -5]}>
        <boxGeometry args={[10, 3, 0.2]} />
        <meshStandardMaterial color="#f3f4f6" />
      </mesh>
      <mesh position={[-5, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[10, 3, 0.2]} />
        <meshStandardMaterial color="#f3f4f6" />
      </mesh>

      {/* Furniture Placeholders */}
      {/* Bed */}
      <mesh position={[-3, 0.5, -3]}>
        <boxGeometry args={[2, 1, 3]} />
        <meshStandardMaterial color="#3B82F6" />
      </mesh>
      
      {/* Table */}
      <mesh position={[2, 0.75, 2]}>
        <cylinderGeometry args={[1, 1, 0.1]} />
        <meshStandardMaterial color="#8B5CF6" />
      </mesh>
      <mesh position={[2, 0.35, 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.7]} />
        <meshStandardMaterial color="#4B5563" />
      </mesh>
    </group>
  );
};

const Unit3DViewer = ({ unit }) => {
  return (
    <div className="w-full h-[500px] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur px-3 py-1 rounded-full text-sm font-medium">
        3D View - Drag to Rotate, Scroll to Zoom
      </div>
      
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }} shadows>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.5}>
            <RoomPlaceholder />
          </Stage>
          <Grid renderOrder={-1} position={[0, 0, 0]} infiniteGrid fadeDistance={50} sectionColor="#3B82F6" cellColor="#93C5FD" />
          <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Unit3DViewer;
