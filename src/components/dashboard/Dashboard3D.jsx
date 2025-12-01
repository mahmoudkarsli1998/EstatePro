import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Text, Center, Environment, MeshTransmissionMaterial, Sparkles } from '@react-three/drei';
import BarChart3D from './widgets/BarChart3D';
import PieChart3D from './widgets/PieChart3D';

const GlassPlatform = ({ position, args = [5, 0.2, 5] }) => (
  <mesh position={position}>
    <cylinderGeometry args={[args[0], args[0], args[1], 64]} />
    <meshStandardMaterial 
      color="#ffffff"
      opacity={0.2}
      transparent
      roughness={0.1}
      metalness={0.8}
    />
  </mesh>
);

const Dashboard3D = ({ salesData, leadsData }) => {
  // Transform leads data for pie chart
  const pieData = [
    { name: 'Social', value: 35, color: '#8b5cf6' }, // Violet
    { name: 'Direct', value: 25, color: '#d946ef' }, // Fuchsia
    { name: 'Referral', value: 20, color: '#ec4899' }, // Pink
    { name: 'Organic', value: 20, color: '#6366f1' }, // Indigo
  ];

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden glass-panel relative bg-[#050510]">
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h2 className="text-2xl font-bold text-white drop-shadow-lg">Immersive Analytics</h2>
        <p className="text-primary text-sm">Interactive 3D Data Visualization</p>
      </div>

      <Canvas camera={{ position: [0, 6, 14], fov: 45 }}>
        {/* Deep Blue Background matching the reference */}
        <color attach="background" args={['#0f172a']} />
        <fog attach="fog" args={['#0f172a', 10, 40]} />
        
        <OrbitControls 
          maxPolarAngle={Math.PI / 2.2} 
          minPolarAngle={Math.PI / 6}
          enablePan={false}
          maxDistance={25}
          minDistance={5}
          autoRotate
          autoRotateSpeed={0.5}
        />
        
        {/* Soft Neon Lighting */}
        <ambientLight intensity={0.4} />
        {/* Cyan Light from top-left */}
        <pointLight position={[-10, 10, 10]} intensity={1} color="#00F0FF" distance={50} />
        {/* Pink/Purple Light from top-right */}
        <pointLight position={[10, 10, 10]} intensity={1} color="#FF0055" distance={50} />
        
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />

        {/* Sales Bar Chart Section - Orange Theme */}
        <group position={[-5, 0, 0]}>
          <Float speed={2} rotationIntensity={0.05} floatIntensity={0.1}>
            <BarChart3D data={salesData} />
            {/* Dark Card Base */}
            <mesh position={[0, -0.2, 0]}>
              <boxGeometry args={[6, 0.2, 4]} />
              <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.5} />
            </mesh>
          </Float>
          <Center position={[0, 4.5, 0]}>
             <Text fontSize={0.4} color="#94a3b8" anchorX="center" anchorY="middle">
               Sales Performance
             </Text>
          </Center>
        </group>

        {/* Leads Pie Chart Section - Purple Theme */}
        <group position={[5, 0.5, 0]}>
          <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.1}>
            <PieChart3D data={pieData} />
            {/* Dark Card Base */}
            <mesh position={[0, -1.2, 0]}>
              <cylinderGeometry args={[3, 3, 0.2, 32]} />
              <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.5} />
            </mesh>
          </Float>
           <Center position={[0, 3.5, 0]}>
             <Text fontSize={0.4} color="#94a3b8" anchorX="center" anchorY="middle">
               Traffic Sources
             </Text>
          </Center>
        </group>

        {/* Debug Cube at Center to verify rendering */}
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="white" wireframe />
        </mesh>

        {/* Grid Floor */}
        <gridHelper args={[50, 50, 0x334155, 0x0f172a]} position={[0, -2, 0]} />
      </Canvas>
      
      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur px-4 py-2 rounded-lg text-xs text-gray-400 border border-white/10 pointer-events-none">
        <span className="text-white font-bold">Controls:</span> Left Click to Rotate • Scroll to Zoom
      </div>
    </div>
  );
};

export default Dashboard3D;
