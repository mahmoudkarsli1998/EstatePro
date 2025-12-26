import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const LiquidBackground = () => {
  const containerRef = useRef(null);
  const blob1Ref = useRef(null);
  const blob2Ref = useRef(null);
  const blob3Ref = useRef(null);

  useGSAP(() => {
    // Animate blobs moving around
    const animateBlob = (ref, duration, scale) => {
      // Use force3D: true to ensure GPU usage
      gsap.to(ref.current, {
        x: "random(-50, 50, 10)", // Reduced movement range
        y: "random(-50, 50, 10)",
        scale: `random(${scale * 0.9}, ${scale * 1.1})`, // Reduced scale variance
        rotation: "random(-90, 90)", // Reduced rotation
        duration: duration,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        force3D: true, // Force GPU acceleration
      });
    };

    // Slower, smoother animations
    animateBlob(blob1Ref, 15, 1);
    animateBlob(blob2Ref, 20, 1.2);
    animateBlob(blob3Ref, 18, 0.8);

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10 overflow-hidden bg-background transition-colors duration-500">
      <div className="absolute inset-0 opacity-40 filter blur-[50px] transform-gpu">
        <div 
          ref={blob1Ref}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 dark:bg-primary/20 rounded-full mix-blend-multiply dark:mix-blend-screen will-change-transform"
        />
        <div 
          ref={blob2Ref}
          className="absolute top-3/4 right-1/4 w-[500px] h-[500px] bg-accent/10 dark:bg-accent/20 rounded-full mix-blend-multiply dark:mix-blend-screen will-change-transform"
        />
        <div 
          ref={blob3Ref}
          className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-section/30 dark:bg-primary/10 rounded-full mix-blend-multiply dark:mix-blend-screen will-change-transform"
        />
      </div>
      <div className="absolute inset-0 bg-white/40 dark:bg-[#0F1418]/60 backdrop-blur-[2px]"></div>
    </div>
  );
};

export default LiquidBackground;
