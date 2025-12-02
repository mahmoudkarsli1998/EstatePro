import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Icosahedron, Torus, Octahedron } from '@react-three/drei';
import * as THREE from 'three';

const FloatingShapes = () => {
  const group = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = t * 0.05;
    group.current.rotation.x = t * 0.02;
  });

  return (
    <group ref={group}>
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <Icosahedron args={[1, 0]} position={[-8, 4, -5]}>
          <meshStandardMaterial color="#00F0FF" wireframe transparent opacity={0.3} />
        </Icosahedron>
      </Float>

      <Float speed={2} rotationIntensity={1.5} floatIntensity={1.5}>
        <Octahedron args={[1.5, 0]} position={[9, -3, -8]}>
          <meshStandardMaterial color="#FF0055" wireframe transparent opacity={0.2} />
        </Octahedron>
      </Float>

      <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
        <Torus args={[5, 0.02, 16, 100]} position={[0, 0, -10]} rotation={[Math.PI / 3, 0, 0]}>
          <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
        </Torus>
      </Float>
      
      {/* Random small particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Float key={i} speed={1 + Math.random()} rotationIntensity={2} floatIntensity={2}>
          <mesh position={[
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
          ]}>
            <boxGeometry args={[0.05, 0.05, 0.05]} />
            <meshBasicMaterial color={Math.random() > 0.5 ? "#00F0FF" : "#FF0055"} transparent opacity={0.6} />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

const Hero3DOverlay = () => {
  return (
    <div className="absolute inset-0 z-1 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00F0FF" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#FF0055" />
        <Stars radius={100} depth={50} count={2000} factor={3} saturation={0} fade speed={1} />
        <FloatingShapes />
      </Canvas>
    </div>
  );
};

export default Hero3DOverlay;
