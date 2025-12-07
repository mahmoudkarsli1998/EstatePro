import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Github, Linkedin, Mail, Twitter, Code, Database, Layout, Server, ExternalLink } from 'lucide-react';
import LiquidBackground from '../../components/shared/LiquidBackground';
import Button from '../../components/shared/Button';
import { useTranslation } from 'react-i18next';
import { Box } from 'lucide-react';

const DeveloperCard = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [20, -20]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-20, 20]), { stiffness: 150, damping: 20 });

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-80 h-[450px] md:w-96 md:h-[550px] group cursor-pointer perspective-1000"
    >
      {/* The Back Card (Glass Base) */}
      <div 
        className="absolute inset-0 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden"
        style={{ transform: "translateZ(0px)" }}
      >
        {/* Abstract Background Decoration inside card */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 opacity-50" />
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent" />
        
        {/* Code Pattern Background */}
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
        />
      </div>

      {/* The "Pop Out" Image Layer */}
      {/* We use a mask-image or just a cleanly framed photo that translates Z */}
      <div 
        className="absolute inset-x-4 bottom-24 top-4 rounded-2xl overflow-hidden border-2 border-white/10 shadow-lg group-hover:shadow-[0_20px_50px_rgba(0,240,255,0.3)] transition-all duration-500"
        style={{ transformStyle: "preserve-3d", transform: "translateZ(40px)" }}
      >
        <motion.div
           className="w-full h-full relative"
           whileHover={{ scale: 1.1, y: -10 }}
           transition={{ duration: 0.4 }}
        >
             {/* Using a professional portrait placeholder */}
             <img 
               src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
               alt="Ahmed Hassan" 
               className="w-full h-full object-cover"
             />
             
             {/* Overlay Gradient for text readability at bottom */}
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        </motion.div>
      </div>

      {/* Floating Badge (Stacked Effect) */}
      <motion.div 
        className="absolute top-8 right-8 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-xs font-bold text-white flex items-center gap-2"
        style={{ transform: "translateZ(80px)" }}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        Available
      </motion.div>

      {/* Info Content (Floating in front) */}
      <div 
        className="absolute bottom-6 left-0 right-0 px-8 text-center"
        style={{ transform: "translateZ(60px)" }}
      >
        <h2 className="text-3xl font-bold font-heading text-white mb-1 group-hover:text-primary transition-colors">Ahmed Hassan</h2>
        <p className="text-primary font-medium tracking-wider uppercase text-xs mb-4">Senior Full Stack Architect</p>
        
        {/* Social Icons Row */}
        <div className="flex justify-center gap-3">
           {[Github, Linkedin, Twitter, Mail].map((Icon, i) => (
             <div key={i} className="p-2 rounded-lg bg-white/5 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/10">
               <Icon size={16} />
             </div>
           ))}
        </div>
      </div>
      
      {/* Border Glow on Hover */}
      <div 
        className="absolute inset-0 rounded-3xl border-2 border-primary/0 group-hover:border-primary/50 transition-colors duration-500 pointer-events-none" 
        style={{ transform: "translateZ(20px)" }}
      />

    </motion.div>
  );
};

const SkillBar = ({ icon: Icon, name, level, color }) => (
  <div className="mb-6">
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center gap-2 text-slate-800 dark:text-white font-medium">
        <Icon size={18} className={color} />
        {name}
      </div>
      <span className="text-slate-500 dark:text-gray-400 text-sm">{level}%</span>
    </div>
    <div className="h-2 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        whileInView={{ width: `${level}%` }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className={`h-full bg-gradient-to-r ${color === 'text-primary' ? 'from-cyan-500 to-blue-500' : 'from-purple-500 to-pink-500'}`}
      />
    </div>
  </div>
);

const Developer = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pt-24 pb-20 relative overflow-hidden bg-[var(--bg-primary)] dark:bg-dark-bg transition-colors duration-500">
      <LiquidBackground />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-24 min-h-[80vh]">
          
          {/* Left Side - The 3D Card Stack */}
          <div className="perspective-1000 pl-4">
             <DeveloperCard />
          </div>

          {/* Right Side - Info */}
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-6">
                {t('developerProfile') || "DEVELOPER PROFILE"}
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold font-heading text-slate-900 dark:text-white mb-6">
                Building the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Future Web</span>
              </h1>
              
              <p className="text-xl text-slate-600 dark:text-gray-300 leading-relaxed mb-10">
                Hi, I'm Ahmed. A passionate developer who loves blending art with engineering. 
                This platform showcases the power of Modern React, 3D interactions, and Glassmorphism.
              </p>

              <div className="glass-panel p-8 mb-10">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-white/10 pb-4">Tech Stack</h3>
                <SkillBar icon={Layout} name="Frontend (React/Tailwind)" level={98} color="text-primary" />
                <SkillBar icon={Box} name="3D & Animation (Framer/Three)" level={90} color="text-secondary" />
                <SkillBar icon={Server} name="Backend Architecture" level={85} color="text-primary" />
                <SkillBar icon={Database} name="Data Engineering" level={80} color="text-secondary" />
              </div>

              <div className="flex gap-4">
                <Button size="lg" className="shadow-[0_0_30px_rgba(0,240,255,0.3)]">
                  {t('contactMe') || "Contact Me"}
                </Button>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold border border-slate-300 dark:border-white/20 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                >
                  <Github size={20} />
                  <span>GitHub</span>
                  <ExternalLink size={16} className="opacity-50" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Developer;
