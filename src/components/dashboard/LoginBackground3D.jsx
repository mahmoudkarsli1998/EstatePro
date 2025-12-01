import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const BackgroundPlane = () => {
  const mesh = useRef();
  const texture = useLoader(TextureLoader, '/assets/3d-graph-computer-illustration.jpg');
  const { viewport } = useThree();
  
  useFrame((state) => {
    const { mouse } = state;
    // Subtle parallax based on mouse
    if (mesh.current) {
      mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, -mouse.y * 0.02, 0.05);
      mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, mouse.x * 0.02, 0.05);
    }
  });

  // Scale to cover the viewport (like background-size: cover)
  const scale = Math.max(viewport.width, viewport.height) * 1.2; // Add some bleed for parallax

  return (
    <mesh ref={mesh} scale={[scale, scale, 1]}>
      <planeGeometry args={[1.6, 0.9]} /> {/* 16:9 aspect ratio */}
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
};

const LoginBackground3D = () => {
  return (
    <div className="absolute inset-0 z-0 bg-gray-900">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <color attach="background" args={['#0f172a']} />
        <fog attach="fog" args={['#0f172a', 5, 20]} />
        
        <Suspense fallback={null}>
          <BackgroundPlane />
        </Suspense>
        
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        <Sparkles count={100} scale={10} size={2} speed={0.4} opacity={0.5} color="#00F0FF" />
      </Canvas>
      {/* Overlay gradient to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/90 via-[#0f172a]/40 to-[#0f172a]/80 pointer-events-none" />
    </div>
  );
};

export default LoginBackground3D;
