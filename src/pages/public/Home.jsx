import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Hero3D from '../../components/public/Hero3D';
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
      <section className="relative h-screen flex items-center pt-20">
        <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="inline-block mb-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm tracking-wide uppercase">
              The Future of Real Estate
            </motion.div>
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold font-heading mb-6 leading-tight text-white drop-shadow-lg">
              Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Dream Space</span> in the Metaverse
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-xl text-gray-300 mb-8 max-w-lg leading-relaxed">
              Experience properties like never before with our immersive 3D tours and liquid-smooth interface.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
              <Link to="/projects">
                <Button size="lg" className="shadow-[0_0_30px_rgba(0,240,255,0.4)]">Explore Projects</Button>
              </Link>
              <Button variant="outline" size="lg" onClick={handleDemo}>View Demo</Button>
              <Button variant="ghost" size="lg" onClick={handleLearnMore}>Learn More</Button>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="mt-12 flex items-center gap-8">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-dark-bg bg-gray-800 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                  </div>
                ))}
              </div>
              <div>
                <p className="font-bold text-white text-lg">12k+ Happy Users</p>
                <div className="flex text-yellow-400 text-sm">★★★★★</div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="h-[500px] lg:h-[700px] w-full relative"
          >
            <Hero3D />
            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 right-10 glass-panel p-4 z-20 max-w-xs"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                  <Zap size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Market Status</p>
                  <p className="font-bold text-white">Trending Up</p>
                </div>
              </div>
              <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[75%]"></div>
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
