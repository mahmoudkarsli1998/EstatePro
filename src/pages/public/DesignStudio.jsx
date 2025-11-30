import React from 'react';
import { motion } from 'framer-motion';
import LiquidBackground from '../../components/shared/LiquidBackground';
import HouseDesigner from '../../components/public/HouseDesigner';
import { PenTool, Layers, Palette } from 'lucide-react';

const DesignStudio = () => {
  return (
    <div className="min-h-screen relative pt-24 pb-12 overflow-hidden">
      <LiquidBackground />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold font-heading text-white mb-6 drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            Design <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Studio</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Customize your future home in real-time. Experiment with layouts, finishes, and features.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <HouseDesigner />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {[
            { icon: Layers, title: "Modular Layouts", desc: "Add floors and expand your living space effortlessly." },
            { icon: Palette, title: "Custom Finishes", desc: "Choose from a curated palette of premium materials." },
            { icon: PenTool, title: "Instant Pricing", desc: "Get real-time cost estimates as you design." }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="glass-panel p-6 text-center"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <item.icon size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DesignStudio;
