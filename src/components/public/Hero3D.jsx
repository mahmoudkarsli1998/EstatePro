import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import Button from '../shared/Button';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useFadeIn } from '../../hooks/useGSAPAnimations';

const Hero3D = () => {
  const containerRef = useRef(null);
  const bgRef = useRef(null);
  
  // Use custom hooks for content animation
  const titleRef = useFadeIn({ delay: 0.2, distance: 30 });
  const textRef = useFadeIn({ delay: 0.4, distance: 30 });
  const buttonsRef = useFadeIn({ delay: 0.6, distance: 30 });

  useGSAP(() => {
    // Parallax background effect on mouse move
    const onMouseMove = (e) => {
      if (!bgRef.current) return;
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 20;
      const y = (clientY / window.innerHeight - 0.5) * 20;

      gsap.to(bgRef.current, {
        x: x,
        y: y,
        duration: 1,
        ease: "power2.out"
      });
    };

    window.addEventListener('mousemove', onMouseMove);

    // Initial background animation
    gsap.fromTo(bgRef.current, 
      { scale: 1.1, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.5, ease: "power2.out" }
    );

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full h-[600px] overflow-hidden bg-[#050510] flex items-center">
      {/* Animated Background */}
      <div ref={bgRef} className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,240,255,0.1),transparent_70%)]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-2xl">
          <div ref={titleRef} className="opacity-0">
            <h1 className="text-5xl md:text-7xl font-bold font-heading text-white mb-6 leading-tight drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              Discover Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Dream Space
              </span>
            </h1>
          </div>
          
          <div ref={textRef} className="opacity-0">
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Experience the future of real estate with our immersive platform. 
              Find premium properties that match your lifestyle with our next-gen tools.
            </p>
          </div>
          
          <div ref={buttonsRef} className="flex gap-4 opacity-0">
            <Link to="/projects">
              <Button size="lg" className="shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] transition-shadow duration-300">
                Browse Projects
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/5 hover:border-primary/50 transition-colors duration-300">
              Learn More
            </Button>
          </div>
        </div>
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050510] to-transparent z-10 pointer-events-none"></div>
    </div>
  );
};

export default Hero3D;
