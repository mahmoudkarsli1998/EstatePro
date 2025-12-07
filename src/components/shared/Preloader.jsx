import React, { useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const Preloader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const progressRef = useRef(null);
  const leftDoorRef = useRef(null);
  const rightDoorRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });

    // Simulate loading progress
    const progressObj = { value: 0 };
    tl.to(progressObj, {
      value: 100,
      duration: 3,
      ease: "power1.inOut",
      onUpdate: () => {
        setProgress(Math.round(progressObj.value));
      }
    });

    // Animate text "Estate Pro"
    const letters = textRef.current.querySelectorAll('.letter');
    tl.from(letters, {
      y: 100,
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: "back.out(1.7)",
    }, 0); // Start at the beginning

    // Bounce effect loop for text while loading
    tl.to(letters, {
      y: -20,
      duration: 0.5,
      stagger: {
        each: 0.1,
        yoyo: true,
        repeat: 5
      },
      ease: "sine.inOut"
    }, 0.5);

    // Progress bar animation
    tl.from(progressRef.current, {
      scaleX: 0,
      duration: 3,
      ease: "power1.inOut"
    }, 0);

    // Exit animation
    tl.to([textRef.current, progressRef.current, '.loading-text'], {
      opacity: 0,
      scale: 0.8,
      duration: 0.5,
      ease: "power2.in"
    });

    // Door opening
    tl.to(leftDoorRef.current, {
      xPercent: -100,
      duration: 1.5,
      ease: "power4.inOut"
    }, ">-0.2");

    tl.to(rightDoorRef.current, {
      xPercent: 100,
      duration: 1.5,
      ease: "power4.inOut"
    }, "<");

    // Container cleanup (optional, but good for z-index)
    tl.set(containerRef.current, {
      display: 'none'
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-transparent pointer-events-none">
      {/* Left Door */}
      <div
        ref={leftDoorRef}
        className="absolute left-0 top-0 w-1/2 h-full bg-[#050510] z-20"
      />
      
      {/* Right Door */}
      <div
        ref={rightDoorRef}
        className="absolute right-0 top-0 w-1/2 h-full bg-[#050510] z-20"
      />

      {/* Content */}
      <div className="relative z-30 flex flex-col items-center justify-center w-full h-full">
        <div ref={textRef} className="flex space-x-4 mb-8 overflow-hidden">
          <div className="flex">
            {'Estate'.split('').map((char, i) => (
              <span key={i} className="letter text-6xl font-bold text-white inline-block">
                {char}
              </span>
            ))}
          </div>
          <div className="flex">
            {'Pro'.split('').map((char, i) => (
              <span key={i} className="letter text-6xl font-bold text-[#00F0FF] inline-block">
                {char}
              </span>
            ))}
          </div>
        </div>

        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
          <div 
            ref={progressRef}
            className="h-full bg-gradient-to-r from-primary to-secondary origin-left w-full"
          />
        </div>
        
        <p className="loading-text text-gray-400 text-sm mt-4 font-mono">
          {progress < 100 ? `LOADING ASSETS... ${progress}%` : 'READY'}
        </p>
      </div>
    </div>
  );
};

export default Preloader;
