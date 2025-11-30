import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';

const AnimatedSphere = () => {
  const sphereRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (sphereRef.current) {
      sphereRef.current.rotation.x = t * 0.1;
      sphereRef.current.rotation.y = t * 0.15;
    }
  });

  return (
    <Sphere ref={sphereRef} args={[1, 100, 100]} scale={2}>
      <MeshDistortMaterial
        color="#7000FF"
        attach="material"
        distort={0.5}
        speed={1.5}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
};

import FloatingShapes from '../public/FloatingShapes';

const LiquidBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 opacity-30 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#00F0FF" />
        <pointLight position={[-10, -10, -5]} intensity={1} color="#FF0055" />
        <AnimatedSphere />
        <FloatingShapes />
      </Canvas>
      <div className="absolute inset-0 bg-[#050510]/80 backdrop-blur-[2px]"></div>
    </div>
  );
};

export default LiquidBackground;
