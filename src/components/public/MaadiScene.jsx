import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Stars } from '@react-three/drei';
import { useTheme } from '../../context/ThemeContext';
import * as THREE from 'three';

const Building = ({ position, height, color }) => {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.8, height, 0.8]} />
      <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
    </mesh>
  );
};

const NileRiver = () => {
  const curve = useMemo(() => {
    const points = [];
    for (let i = -10; i <= 10; i++) {
      points.push(new THREE.Vector3(i, -0.4, Math.sin(i * 0.5) * 2));
    }
    return new THREE.CatmullRomCurve3(points);
  }, []);

  return (
    <mesh position={[0, 0, 0]}>
      <tubeGeometry args={[curve, 64, 0.5, 8, false]} />
      <meshStandardMaterial color="#00F0FF" transparent opacity={0.6} emissive="#00F0FF" emissiveIntensity={0.2} />
    </mesh>
  );
};

const ProjectMarker = ({ position, name }) => {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={position}>
        <mesh position={[0, 1, 0]}>
          <octahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial color="#FF0055" emissive="#FF0055" emissiveIntensity={0.5} />
        </mesh>
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {name}
        </Text>
      </group>
    </Float>
  );
};

const CityGrid = () => {
  const { theme } = useTheme();
  const buildingColor = theme === 'dark' ? '#1a1a2e' : '#e2e8f0';

  const buildings = useMemo(() => {
    const items = [];
    for (let i = 0; i < 50; i++) {
      const x = (Math.random() - 0.5) * 15;
      const z = (Math.random() - 0.5) * 15;
      // Avoid river area roughly
      if (Math.abs(z - Math.sin(x * 0.5) * 2) > 1.5) {
        items.push(
          <Building 
            key={i} 
            position={[x, Math.random() * 1, z]} 
            height={Math.random() * 2 + 0.5} 
            color={buildingColor} 
          />
        );
      }
    }
    return items;
  }, [buildingColor]);

  return <group>{buildings}</group>;
};

const MaadiScene = () => {
  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden glass-panel relative">
      <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md p-3 rounded-lg border border-white/10">
        <h3 className="text-white font-bold">Maadi, Cairo</h3>
        <p className="text-xs text-primary">Live Project Map</p>
      </div>
      
      <Canvas camera={{ position: [8, 8, 8], fov: 45 }}>
        <color attach="background" args={['#050510']} />
        <fog attach="fog" args={['#050510', 5, 30]} />
        
        <OrbitControls 
          autoRotate 
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2.5}
        />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <group position={[0, -1, 0]}>
          <CityGrid />
          <NileRiver />
          
          {/* EstatePro Projects */}
          <ProjectMarker position={[2, 1, 2]} name="Sunset Towers" />
          <ProjectMarker position={[-3, 1, -2]} name="Nile View" />
          <ProjectMarker position={[4, 1, -3]} name="Maadi Heights" />
          
          {/* Ground Plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
            <planeGeometry args={[30, 30]} />
            <meshStandardMaterial color="#0a0a16" roughness={0.8} metalness={0.2} />
          </mesh>
          <gridHelper args={[30, 30, 0x333333, 0x111111]} position={[0, -0.49, 0]} />
        </group>
      </Canvas>
    </div>
  );
};

export default MaadiScene;
