import React, { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';

const Counter = ({ value, suffix = '' }) => {
  const ref = useRef(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 50, stiffness: 100 });
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.floor(latest) + suffix;
      }
    });
  }, [springValue, suffix]);

  return <span ref={ref} />;
};

const StatItem = ({ number, label, suffix = '' }) => {
  return (
    <div className="text-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-4xl md:text-5xl font-bold text-primary mb-2 font-heading"
      >
        <Counter value={parseInt(number)} suffix={suffix} />
      </motion.div>
      <div className="text-textLight dark:text-gray-400 font-medium uppercase tracking-wider text-sm">
        {label}
      </div>
    </div>
  );
};

const StatsCounter = () => {
  return (
    <section className="py-16 bg-section dark:bg-dark-card/30 border-y border-border/10 dark:border-white/5 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatItem number="50" suffix="+" label="Projects Completed" />
          <StatItem number="1200" suffix="+" label="Happy Families" />
          <StatItem number="15" suffix="" label="Awards Won" />
          <StatItem number="100" suffix="%" label="Satisfaction" />
        </div>
      </div>
    </section>
  );
};

export default StatsCounter;
