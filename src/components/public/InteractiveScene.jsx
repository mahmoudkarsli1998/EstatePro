import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Building2 } from 'lucide-react';

const InteractiveScene = () => {
  const containerRef = useRef(null);
  const iconRef = useRef(null);
  const ringRef = useRef(null);

  useGSAP(() => {
    // Float animation
    gsap.to(iconRef.current, {
      y: -20,
      duration: 2,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1
    });

    // Rotate ring
    gsap.to(ringRef.current, {
      rotation: 360,
      duration: 10,
      ease: "none",
      repeat: -1
    });

    // Glow pulse
    gsap.to(iconRef.current, {
      filter: "drop-shadow(0 0 30px rgba(0, 240, 255, 0.8))",
      duration: 1.5,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="w-full h-[400px] flex items-center justify-center bg-[#050510] relative overflow-hidden rounded-xl border border-white/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.1),transparent_70%)]"></div>
      
      {/* Rotating Ring */}
      <div 
        ref={ringRef}
        className="absolute w-64 h-64 border-2 border-dashed border-primary/30 rounded-full"
      ></div>

      {/* Holographic Icon */}
      <div ref={iconRef} className="relative z-10 text-primary">
        <Building2 size={80} strokeWidth={1} />
      </div>

      <div className="absolute bottom-8 text-center">
        <p className="text-primary/80 font-mono text-sm tracking-widest uppercase">Interactive Model</p>
      </div>
    </div>
  );
};

export default InteractiveScene;
