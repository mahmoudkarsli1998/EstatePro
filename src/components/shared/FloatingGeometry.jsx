import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const FloatingGeometry = ({ className }) => {
  const containerRef = useRef(null);
  const shape1Ref = useRef(null);
  const shape2Ref = useRef(null);

  useGSAP(() => {
    // Animate Shape 1 (Torus-like)
    gsap.to(shape1Ref.current, {
      rotation: 360,
      y: 20,
      duration: 15,
      ease: "none",
      repeat: -1,
      yoyo: true
    });

    // Animate Shape 2 (Icosahedron-like)
    gsap.to(shape2Ref.current, {
      rotation: -360,
      y: -30,
      duration: 20,
      ease: "none",
      repeat: -1,
      yoyo: true
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Shape 1 - Torus representation */}
      <div 
        ref={shape1Ref}
        className="absolute top-1/4 left-10 w-32 h-32 border-4 border-primary/20 rounded-full blur-[2px]"
        style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
      >
        <div className="absolute inset-0 border-4 border-secondary/20 rounded-full transform rotate-45"></div>
      </div>

      {/* Shape 2 - Icosahedron representation */}
      <div 
        ref={shape2Ref}
        className="absolute bottom-1/4 right-10 w-40 h-40 border border-white/10 bg-white/5 backdrop-blur-sm rotate-12"
        style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
      ></div>
    </div>
  );
};

export default FloatingGeometry;
