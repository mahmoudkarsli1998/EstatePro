import React from 'react';
import { motion } from 'framer-motion';

const StatItem = ({ number, label, suffix = '' }) => {
  return (
    <div className="text-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-4xl md:text-5xl font-bold text-primary mb-2"
      >
        {number}{suffix}
      </motion.div>
      <div className="text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wider text-sm">
        {label}
      </div>
    </div>
  );
};

const StatsCounter = () => {
  return (
    <section className="py-16 bg-dark-card/30 border-y border-white/5">
      <div className="container mx-auto px-4 md:px-6">
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
