import React, { useRef, useMemo } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const Particles = () => {
  const containerRef = useRef(null);
  
  const particles = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 1,
      left: Math.random() * 100,
      top: Math.random() * 100
    }));
  }, []);

  useGSAP(() => {
    const container = containerRef.current;
    if (!container) return;

    const particleElements = container.querySelectorAll('.particle');
    
    particleElements.forEach(particle => {
      gsap.to(particle, {
        x: "random(-100, 100)",
        y: "random(-100, 100)",
        opacity: "random(0.1, 0.6)",
        scale: "random(0.5, 1.5)",
        duration: "random(3, 8)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <div 
          key={p.id}
          className="particle absolute rounded-full bg-primary/30"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            top: `${p.top}%`
          }}
        />
      ))}
    </div>
  );
};

export default Particles;
