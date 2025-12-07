import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const LoginBackground3D = () => {
  const containerRef = useRef(null);
  const bgRef = useRef(null);

  useGSAP(() => {
    const onMouseMove = (e) => {
      if (!bgRef.current) return;
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 30;
      const y = (clientY / window.innerHeight - 0.5) * 30;

      gsap.to(bgRef.current, {
        x: x,
        y: y,
        duration: 1.5,
        ease: "power2.out"
      });
    };

    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 bg-gray-900 overflow-hidden">
      <div 
        ref={bgRef}
        className="absolute inset-[-5%] w-[110%] h-[110%] bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/3d-graph-computer-illustration.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      {/* Animated Particles/Stars (CSS only for performance) */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/3 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Overlay gradient to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/90 via-[#0f172a]/40 to-[#0f172a]/80 pointer-events-none" />
    </div>
  );
};

export default LoginBackground3D;
