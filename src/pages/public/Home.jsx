import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Globe, ArrowRight } from 'lucide-react';
import Hero3DOverlay from '../../components/public/Hero3DOverlay';
import FeaturedProjects from '../../components/public/FeaturedProjects';
import StatsCounter from '../../components/public/StatsCounter';
import LiquidBackground from '../../components/shared/LiquidBackground';
import Button from '../../components/shared/Button';
import DemoModal from '../../components/public/DemoModal';
import HeroSearch from '../../components/public/HeroSearch';
import CategoryGrid from '../../components/public/CategoryGrid';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useFadeIn, useStaggerList } from '../../hooks/useGSAPAnimations';

const Home = () => {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const containerRef = useRef(null);
  
  // Animation hooks
  const heroContentRef = useStaggerList({ delay: 0.5, stagger: 0.2 });
  const featuresRef = useStaggerList({ selector: '.feature-card', threshold: 0.2 });
  const ctaRef = useFadeIn({ threshold: 0.3 });

  const handleDemo = () => {
    setIsDemoOpen(true);
  };

  return (
    <div ref={containerRef} className="min-h-screen relative overflow-hidden">
      <LiquidBackground />
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-20">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/3D-bg.png" 
            alt="Modern Architecture" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-dark-bg"></div>
        </div>

        {/* 3D Animation Overlay */}
        <Hero3DOverlay />

        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <div ref={heroContentRef} className="max-w-5xl mx-auto">
            <div className="stagger-item opacity-0 inline-block mb-6 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium tracking-wide uppercase shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              The Future of Living
            </div>
            
            <h1 className="stagger-item opacity-0 text-5xl md:text-7xl font-bold font-heading mb-8 leading-tight text-white drop-shadow-2xl">
              Discover Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-secondary">Perfect Sanctuary</span>
            </h1>
            
            <p className="stagger-item opacity-0 text-xl text-gray-200 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              Search and Compare Among 15000+ Properties And 800+ Prime Compounds
            </p>

            {/* New Hero Search Component */}
            <div className="stagger-item opacity-0 mb-16">
              <HeroSearch />
            </div>

            <div className="stagger-item opacity-0 flex justify-center items-center gap-12 text-gray-400">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-white">150+</span>
                <span className="text-sm uppercase tracking-wider">Projects</span>
              </div>
              <div className="w-px h-12 bg-white/10"></div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-white">12k+</span>
                <span className="text-sm uppercase tracking-wider">Happy Users</span>
              </div>
              <div className="w-px h-12 bg-white/10"></div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-white">50+</span>
                <span className="text-sm uppercase tracking-wider">Awards</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Category Grid Section */}
      <CategoryGrid />

      <StatsCounter />

      <FeaturedProjects />

      {/* Why Choose Us */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4 text-white">Why Choose Us</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              We combine cutting-edge technology with premium real estate to deliver an unmatched experience.
            </p>
          </div>

          <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Secure Transactions", desc: "Blockchain-backed security for all your property dealings." },
              { icon: Globe, title: "Global Access", desc: "Browse and buy properties from anywhere in the world." },
              { icon: Zap, title: "Instant Valuation", desc: "AI-powered algorithms to give you the best market rates." }
            ].map((item, index) => (
              <div
                key={index}
                className="feature-card opacity-0 glass-panel p-8 text-center group hover:bg-white/5 transition-colors duration-300"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                  <item.icon size={32} />
                </div>
                <h3 className="text-xl font-bold mb-4 text-white group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-4 md:px-6">
          <div 
            ref={ctaRef}
            className="opacity-0 glass-panel p-12 md:p-20 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 z-0"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold font-heading mb-6 text-white">Ready to Find Your Home?</h2>
              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                Join thousands of satisfied users who have found their dream properties through our platform.
              </p>
              <Link to="/projects">
                <Button size="lg" className="text-lg px-10 py-4 shadow-[0_0_40px_rgba(0,240,255,0.3)] hover:shadow-[0_0_60px_rgba(0,240,255,0.5)]">
                  Get Started Now <ArrowRight className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
