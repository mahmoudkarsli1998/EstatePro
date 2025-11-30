import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, Float, Box, Cylinder } from '@react-three/drei';
import { useTheme } from '../../context/ThemeContext';

const HolographicBuilding = () => {
  const group = useRef();
  const { theme } = useTheme();
  
  const primaryColor = theme === 'dark' ? '#00F0FF' : '#00C0CC';
  const secondaryColor = theme === 'dark' ? '#7000FF' : '#5a00cc';

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t / 4) / 4;
    group.current.position.y = Math.sin(t / 2) / 8;
  });

  return (
    <group ref={group}>
      {/* Main Tower */}
      <Box args={[1, 3, 1]} position={[0, 1.5, 0]}>
        <meshStandardMaterial 
          color={primaryColor} 
          transparent 
          opacity={0.6} 
          roughness={0.1} 
          metalness={0.8} 
          wireframe={false}
        />
      </Box>
      <Box args={[1.05, 3.05, 1.05]} position={[0, 1.5, 0]}>
        <meshBasicMaterial color={primaryColor} wireframe opacity={0.3} transparent />
      </Box>

      {/* Side Wing */}
      <Box args={[0.8, 2, 0.8]} position={[0.8, 1, 0.2]}>
        <meshStandardMaterial 
          color={secondaryColor} 
          transparent 
          opacity={0.5} 
          roughness={0.1} 
          metalness={0.8} 
        />
      </Box>
      <Box args={[0.85, 2.05, 0.85]} position={[0.8, 1, 0.2]}>
        <meshBasicMaterial color={secondaryColor} wireframe opacity={0.3} transparent />
      </Box>

      {/* Base */}
      <Cylinder args={[1.5, 1.5, 0.2, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.5} />
      </Cylinder>

      {/* Floating Rings */}
      <group position={[0, 2, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.2, 0.02, 16, 100]} />
          <meshBasicMaterial color={primaryColor} transparent opacity={0.8} />
        </mesh>
      </group>
    </group>
  );
};

const InteractiveScene = () => {
  return (
    <Canvas shadows camera={{ position: [0, 2, 6], fov: 50 }}>
      <color attach="background" args={['#050510']} />
      <fog attach="fog" args={['#050510', 5, 20]} />
      
      <OrbitControls 
        autoRotate 
        autoRotateSpeed={0.5} 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 2}
      />
      
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <spotLight position={[-10, 10, -10]} intensity={0.5} />
      
      <Stage environment="city" intensity={0.5} contactShadow={false}>
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <HolographicBuilding />
        </Float>
      </Stage>
      
      <gridHelper args={[20, 20, 0x222222, 0x111111]} position={[0, -0.1, 0]} />
    </Canvas>
  );
};

export default InteractiveScene;
