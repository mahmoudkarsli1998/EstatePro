import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import InteractiveScene from './InteractiveScene';

const DemoModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-5xl h-[80vh] bg-background dark:bg-dark-card border border-border/20 rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-white/80 dark:from-black/50 to-transparent pointer-events-none">
              <div className="pointer-events-auto">
                <h2 className="text-2xl font-bold font-heading text-textDark dark:text-white drop-shadow-md">
                  Interactive <span className="text-primary dark:text-primary">Demo</span>
                </h2>
                <p className="text-textLight dark:text-gray-300 text-sm">Drag to rotate • Scroll to zoom</p>
              </div>
              <button 
                onClick={onClose}
                className="pointer-events-auto p-2 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-textDark dark:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* 3D Scene */}
            <div className="w-full h-full">
              <InteractiveScene />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DemoModal;
