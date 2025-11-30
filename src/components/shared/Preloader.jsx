import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Float, Stars, Sphere, MeshDistortMaterial } from '@react-three/drei';

const LiquidLogo = () => {
  return (
    <Float speed={4} rotationIntensity={1} floatIntensity={2}>
      <Sphere args={[1, 100, 100]} scale={1.5}>
        <MeshDistortMaterial
          color="#00F0FF"
          attach="material"
          distort={0.6}
          speed={2}
          roughness={0.2}
          metalness={0.9}
          emissive="#00F0FF"
          emissiveIntensity={0.2}
        />
      </Sphere>
    </Float>
  );
};

const Preloader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 800);
          return 100;
        }
        return prev + 1;
      });
    }, 25);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-[#050510] flex flex-col items-center justify-center overflow-hidden"
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#00F0FF" />
          <pointLight position={[-10, -10, -10]} intensity={1} color="#FF0055" />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <LiquidLogo />
        </Canvas>
      </div>
      
      <div className="relative z-10 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold font-heading text-white mb-6 tracking-wider drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]"
        >
          ESTATE<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">PRO</span>
        </motion.h1>
        
        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mx-auto relative">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary to-secondary shadow-[0_0_10px_rgba(0,240,255,0.8)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
        
        <motion.p 
          key={progress}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-primary/80 text-sm mt-4 font-mono"
        >
          {progress < 100 ? `INITIALIZING SYSTEM... ${progress}%` : 'WELCOME TO THE FUTURE'}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default Preloader;
