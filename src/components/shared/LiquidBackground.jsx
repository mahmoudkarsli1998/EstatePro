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
      gsap.to(ref.current, {
        x: "random(-100, 100, 5)",
        y: "random(-100, 100, 5)",
        scale: `random(${scale * 0.8}, ${scale * 1.2})`,
        rotation: "random(-180, 180)",
        duration: duration,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    };

    animateBlob(blob1Ref, 10, 1);
    animateBlob(blob2Ref, 15, 1.2);
    animateBlob(blob3Ref, 12, 0.8);

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10 overflow-hidden bg-slate-50 dark:bg-[#050510] transition-colors duration-500">
      <div className="absolute inset-0 opacity-40 filter blur-[80px]">
        <div 
          ref={blob1Ref}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 dark:bg-primary/30 rounded-full mix-blend-multiply dark:mix-blend-screen"
        />
        <div 
          ref={blob2Ref}
          className="absolute top-3/4 right-1/4 w-[500px] h-[500px] bg-secondary/20 dark:bg-secondary/30 rounded-full mix-blend-multiply dark:mix-blend-screen"
        />
        <div 
          ref={blob3Ref}
          className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-purple-500/20 dark:bg-purple-500/30 rounded-full mix-blend-multiply dark:mix-blend-screen"
        />
      </div>
      <div className="absolute inset-0 bg-white/40 dark:bg-[#050510]/60 backdrop-blur-[2px]"></div>
    </div>
  );
};

export default LiquidBackground;
