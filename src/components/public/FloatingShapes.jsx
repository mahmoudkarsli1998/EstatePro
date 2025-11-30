import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Icosahedron, Torus, Octahedron } from '@react-three/drei';

const FloatingShape = ({ position, color, speed, rotationIntensity, floatIntensity, scale, geometry: Geometry }) => {
  const meshRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.cos(t / 4) * Math.PI / 8;
    meshRef.current.rotation.y = Math.sin(t / 4) * Math.PI / 8;
    meshRef.current.rotation.z = (1 + Math.sin(t / 1.5)) / 20;
  });

  return (
    <Float 
      speed={speed} 
      rotationIntensity={rotationIntensity} 
      floatIntensity={floatIntensity} 
      position={position}
    >
      <Geometry args={[1, 0]} ref={meshRef} scale={scale}>
        <meshStandardMaterial 
          color={color} 
          roughness={0.1} 
          metalness={0.8} 
          transparent 
          opacity={0.6} 
          emissive={color}
          emissiveIntensity={0.2}
        />
      </Geometry>
    </Float>
  );
};

const FloatingShapes = () => {
  return (
    <>
      <FloatingShape 
        geometry={Icosahedron}
        position={[-15, 5, -10]} 
        color="#00F0FF" 
        speed={2} 
        rotationIntensity={2} 
        floatIntensity={2} 
        scale={2}
      />
      <FloatingShape 
        geometry={Torus}
        position={[18, -5, -15]} 
        color="#FF0055" 
        speed={3} 
        rotationIntensity={3} 
        floatIntensity={1.5} 
        scale={1.5}
      />
      <FloatingShape 
        geometry={Octahedron}
        position={[-10, -10, -5]} 
        color="#7000FF" 
        speed={1.5} 
        rotationIntensity={1.5} 
        floatIntensity={2.5} 
        scale={2.5}
      />
      <FloatingShape 
        geometry={Icosahedron}
        position={[12, 10, -20]} 
        color="#00D18B" 
        speed={2.5} 
        rotationIntensity={2} 
        floatIntensity={2} 
        scale={1.8}
      />
    </>
  );
};

export default FloatingShapes;
