import React from 'react';

const Badge = ({ children, variant = 'primary', className = '' }) => {
  const variants = {
    primary: "bg-primary/10 text-primary border border-primary/20",
    success: "bg-green-500/10 text-green-400 border border-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    danger: "bg-red-500/10 text-red-400 border border-red-500/20",
    neutral: "bg-white/5 text-gray-300 border border-white/10",
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
