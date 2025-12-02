import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Hero3DOverlay from '../../components/public/Hero3DOverlay';
import FeaturedProjects from '../../components/public/FeaturedProjects';
import StatsCounter from '../../components/public/StatsCounter';
import LiquidBackground from '../../components/shared/LiquidBackground';
import { Shield, Zap, Globe, ArrowRight } from 'lucide-react';
import Button from '../../components/shared/Button';
import { Link } from 'react-router-dom';
import DemoModal from '../../components/public/DemoModal';

const Home = () => {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const handleDemo = () => {
    setIsDemoOpen(true);
  };

  const handleLearnMore = () => {
    alert("Redirecting to detailed documentation... (Mock Action)");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <LiquidBackground />
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
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
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="inline-block mb-6 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium tracking-wide uppercase shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              The Future of Living
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-6xl md:text-8xl font-bold font-heading mb-8 leading-tight text-white drop-shadow-2xl">
              Discover Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-secondary">Perfect Sanctuary</span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-gray-200 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              Experience the most immersive real estate platform. Find your dream home with our 3D tours and AI-powered insights.
            </motion.p>

            <motion.div variants={fadeInUp} className="max-w-2xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-2xl flex flex-col md:flex-row gap-2 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  placeholder="Search by location, project, or type..." 
                  className="w-full h-14 pl-6 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all"
                />
              </div>
              <Link to="/projects">
                <Button size="lg" className="w-full md:w-auto h-14 px-8 text-lg shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                  Search Properties
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-16 flex justify-center items-center gap-12 text-gray-400">
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
            </motion.div>
          </motion.div>
        </div>
      </section>

      <StatsCounter />

      <FeaturedProjects />

      {/* Why Choose Us */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4 text-white">Why Choose Us</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              We combine cutting-edge technology with premium real estate to deliver an unmatched experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Secure Transactions", desc: "Blockchain-backed security for all your property dealings." },
              { icon: Globe, title: "Global Access", desc: "Browse and buy properties from anywhere in the world." },
              { icon: Zap, title: "Instant Valuation", desc: "AI-powered algorithms to give you the best market rates." }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ y: -10 }}
                className="glass-panel p-8 text-center group hover:bg-white/5"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                  <item.icon size={32} />
                </div>
                <h3 className="text-xl font-bold mb-4 text-white group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="glass-panel p-12 md:p-20 text-center relative overflow-hidden"
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
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
