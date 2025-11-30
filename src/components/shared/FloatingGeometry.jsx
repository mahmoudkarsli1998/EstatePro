import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import { useTheme } from '../../context/ThemeContext';

const Geometry = ({ position, color, shape = 'torus' }) => {
  const mesh = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.x = t * 0.2;
    mesh.current.rotation.y = t * 0.3;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={mesh} position={position}>
        {shape === 'torus' && <torusGeometry args={[1, 0.3, 16, 32]} />}
        {shape === 'icosahedron' && <icosahedronGeometry args={[1, 0]} />}
        {shape === 'octahedron' && <octahedronGeometry args={[1, 0]} />}
        <MeshDistortMaterial
          color={color}
          speed={2}
          distort={0.4}
          radius={1}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
};

const FloatingGeometry = ({ className }) => {
  const { theme } = useTheme();
  const primaryColor = theme === 'dark' ? '#00F0FF' : '#00C0CC';
  const secondaryColor = theme === 'dark' ? '#7000FF' : '#5a00cc';

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Geometry position={[-2, 1, 0]} color={primaryColor} shape="torus" />
        <Geometry position={[2, -1, -1]} color={secondaryColor} shape="icosahedron" />
      </Canvas>
    </div>
  );
};

export default FloatingGeometry;
