import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertTriangle, Info, Bell } from 'lucide-react';

const toastVariants = {
  initial: { 
    opacity: 0, 
    y: -50, 
    scale: 0.5, 
    rotateX: 90,
    z: -100
  },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    rotateX: 0,
    z: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
      mass: 0.8
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.5, 
    rotateX: -90,
    z: -100,
    transition: { duration: 0.3 }
  },
  hover: {
    scale: 1.05,
    rotateX: 5,
    transition: { duration: 0.2 }
  }
};

const icons = {
  success: Check,
  error: X,
  warning: AlertTriangle,
  info: Info,
  default: Bell
};

const colors = {
  success: 'bg-green-500/20 text-green-400 border-green-500/50',
  error: 'bg-red-500/20 text-red-400 border-red-500/50',
  warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  default: 'bg-gray-500/20 text-gray-400 border-gray-500/50'
};

const gradients = {
  success: 'from-green-500/10 to-transparent',
  error: 'from-red-500/10 to-transparent',
  warning: 'from-yellow-500/10 to-transparent',
  info: 'from-blue-500/10 to-transparent',
  default: 'from-gray-500/10 to-transparent'
};

const ToastItem = ({ id, type = 'default', message, duration = 4000, onClose }) => {
  const Icon = icons[type] || icons.default;
  const colorClass = colors[type] || colors.default;
  const gradientClass = gradients[type] || gradients.default;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <motion.div
      layout
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      className="pointer-events-auto w-full max-w-sm"
      style={{ perspective: '1000px' }}
    >
      <div className={`
        relative overflow-hidden
        backdrop-blur-xl border-l-4 shadow-2xl rounded-lg p-4
        flex items-start gap-3 transform-gpu
        bg-gray-900/90 border-white/10
        ${colorClass.split(' ')[2]} 
      `}>
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-r ${gradientClass} opacity-50 z-0`} />
        
        {/* Icon */}
        <div className={`
          relative z-10 shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${colorClass.split(' ').slice(0, 2).join(' ')}
          shadow-[0_0_15px_rgba(0,0,0,0.3)]
        `}>
          <Icon size={18} strokeWidth={3} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 min-w-0">
          <h4 className="font-bold text-white text-sm capitalize mb-0.5">{type}</h4>
          <p className="text-sm text-gray-300 leading-tight">{message}</p>
        </div>

        {/* Close Button */}
        <button 
          onClick={() => onClose(id)}
          className="relative z-10 p-1 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
};

export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-24 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none perspective-[1200px]">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} {...toast} onClose={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};
