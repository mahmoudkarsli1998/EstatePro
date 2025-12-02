import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, PerspectiveCamera, Environment, Box, Torus } from '@react-three/drei';
import { motion } from 'framer-motion';
import Button from '../shared/Button';
import { Link } from 'react-router-dom';
import * as THREE from 'three';

const HolographicHouse = () => {
  const group = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t / 4) * 0.2;
    group.current.position.y = Math.sin(t / 2) * 0.1;
  });

  return (
    <group ref={group} rotation={[0, -Math.PI / 4, 0]} scale={1.5}>
      {/* Base / Floor */}
      <Box args={[4, 0.2, 4]} position={[0, -1, 0]}>
        <meshStandardMaterial color="#00F0FF" transparent opacity={0.3} wireframe />
      </Box>
      
      {/* Main Structure */}
      <Box args={[3, 2, 3]} position={[0, 0.1, 0]}>
        <meshStandardMaterial color="#7000FF" transparent opacity={0.1} />
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(3, 2, 3)]} />
          <lineBasicMaterial color="#00F0FF" transparent opacity={0.5} />
        </lineSegments>
      </Box>

      {/* Roof */}
      <mesh position={[0, 1.6, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[2.5, 1.5, 4]} />
        <meshStandardMaterial color="#FF0055" transparent opacity={0.2} wireframe />
      </mesh>

      {/* Floating Elements / Scanning Effect */}
      <Torus args={[3.5, 0.05, 16, 100]} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.8, 0]}>
        <meshBasicMaterial color="#00F0FF" transparent opacity={0.5} />
      </Torus>
      
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Box args={[0.5, 0.5, 0.5]} position={[2, 1, 2]}>
          <meshStandardMaterial color="#FF0055" wireframe />
        </Box>
      </Float>
    </group>
  );
};

const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00F0FF" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#FF0055" />
      <Stars radius={100} depth={50} count={7000} factor={4} saturation={0} fade speed={1} />
      <Environment preset="city" />
      <HolographicHouse />
    </>
  );
};

const Hero3D = () => {
  return (
    <div className="relative w-full h-[600px] bg-transparent overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 2, 12], fov: 45 }}>
          <Scene />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} maxPolarAngle={Math.PI / 2} />
        </Canvas>
      </div>

      <div className="absolute inset-0 z-10 flex items-center pointer-events-none">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl pointer-events-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold font-heading text-white mb-6 leading-tight drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]"
            >
              Discover Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Dream Space
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-gray-300 mb-8 leading-relaxed"
            >
              Experience the future of real estate with our immersive 3D platform. 
              Find premium properties that match your lifestyle.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex gap-4"
            >
              <Link to="/projects">
                <Button size="lg" className="shadow-[0_0_20px_rgba(0,240,255,0.4)]">
                  Browse Projects
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/5">
                Learn More
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050510] to-transparent z-0 pointer-events-none"></div>
    </div>
  );
};

export default Hero3D;
