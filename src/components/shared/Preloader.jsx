import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, ContactShadows, Stars } from '@react-three/drei';
import * as THREE from 'three';

const BouncingLetter = ({ char, index, total, color, progress }) => {
  const mesh = useRef();
  const [landed, setLanded] = useState(false);
  
  // Stagger the bounce based on index
  const delay = index * 0.1;
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (mesh.current) {
      if (progress < 100) {
        // Bouncing Phase
        const speed = 3;
        const height = 1.5;
        // Offset time by delay so letters bounce in a wave
        const time = t * speed + delay;
        
        // Absolute sine for bouncing (always positive y)
        const y = Math.abs(Math.sin(time)) * height;
        
        // Squash and Stretch
        const velocity = Math.cos(time);
        const stretch = 1 + Math.abs(velocity) * 0.3;
        const squash = 1 / Math.sqrt(stretch);
        
        mesh.current.position.y = y;
        mesh.current.scale.y = stretch;
        mesh.current.scale.x = squash;
        mesh.current.scale.z = squash;
        
      } else {
        // Landing Phase
        mesh.current.position.y = THREE.MathUtils.lerp(mesh.current.position.y, 0, 0.1);
        mesh.current.scale.y = THREE.MathUtils.lerp(mesh.current.scale.y, 1, 0.1);
        mesh.current.scale.x = THREE.MathUtils.lerp(mesh.current.scale.x, 1, 0.1);
        mesh.current.scale.z = THREE.MathUtils.lerp(mesh.current.scale.z, 1, 0.1);
        
        if (!landed && Math.abs(mesh.current.position.y) < 0.01) {
           setLanded(true);
        }
        
        if (landed) {
           mesh.current.position.y = Math.sin(t * 2 + index) * 0.1;
        }
      }
    }
  });

  // Calculate position to center the word
  const spacing = 0.9;
  const totalWidth = total * spacing;
  const startX = -totalWidth / 2 + spacing / 2;
  const x = startX + index * spacing;

  return (
    <group position={[x, 0, 0]}>
      <Text
        ref={mesh}
        fontSize={1.5}
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
        anchorX="center"
        anchorY="bottom"
        color={color}
      >
        {char}
      </Text>
    </group>
  );
};

const BouncingWord = ({ text, position, colorStart, colorEnd, progress }) => {
  const chars = text.split('');
  return (
    <group position={position}>
      {chars.map((char, i) => (
        <BouncingLetter 
          key={i} 
          char={char} 
          index={i} 
          total={chars.length} 
          color={i % 2 === 0 ? colorStart : colorEnd} 
          progress={progress}
        />
      ))}
    </group>
  );
};

const Preloader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsFinished(true);
          setTimeout(onComplete, 1500); // Wait for door animation
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden pointer-events-none">
      {/* Left Door */}
      <motion.div
        className="absolute left-0 top-0 w-1/2 h-full bg-[#050510] z-0"
        initial={{ x: 0 }}
        animate={{ x: isFinished ? '-100%' : 0 }}
        transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
      />
      
      {/* Right Door */}
      <motion.div
        className="absolute right-0 top-0 w-1/2 h-full bg-[#050510] z-0"
        initial={{ x: 0 }}
        animate={{ x: isFinished ? '100%' : 0 }}
        transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
      />

      {/* Content Container - Fades out before doors open */}
      <motion.div 
        className="relative z-10 w-full h-full"
        animate={{ opacity: isFinished ? 0 : 1, scale: isFinished ? 1.1 : 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="absolute inset-0">
          <Canvas camera={{ position: [0, 1, 10], fov: 45 }} shadows>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={1} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00F0FF" />
            <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
            
            <group position={[0, -0.5, 0]}>
              {/* Estate - White */}
              <BouncingWord 
                text="Estate" 
                position={[-1.2, 0, 0]} 
                colorStart="#FFFFFF" 
                colorEnd="#F0F0F0" 
                progress={progress} 
              />
              
              {/* Pro - Cyan */}
              <BouncingWord 
                text="Pro" 
                position={[2.8, 0, 0]} 
                colorStart="#00F0FF" 
                colorEnd="#00C0FF" 
                progress={progress} 
              />
              
              {/* Floor Shadows */}
              <ContactShadows 
                resolution={1024} 
                scale={20} 
                blur={2} 
                opacity={0.5} 
                far={10} 
                color="#000000" 
              />
            </group>
          </Canvas>
        </div>
        
        <div className="absolute bottom-32 left-0 right-0 text-center">
          <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mx-auto">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary to-secondary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-gray-400 text-sm mt-4 font-mono">
            {progress < 100 ? `LOADING ASSETS... ${progress}%` : 'READY'}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Preloader;
