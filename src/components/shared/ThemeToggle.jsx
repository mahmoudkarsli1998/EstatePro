import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors relative overflow-hidden group"
      aria-label="Toggle Theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 0 : 180 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        {theme === 'dark' ? (
          <Moon size={20} className="text-primary" />
        ) : (
          <Sun size={20} className="text-yellow-500" />
        )}
      </motion.div>
    </button>
  );
};

export default ThemeToggle;
