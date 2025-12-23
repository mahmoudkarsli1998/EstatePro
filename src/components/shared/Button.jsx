import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading = false, 
  disabled = false, 
  ...props 
}) => {
  const baseStyles = "glass-button inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none";
  
  const variants = {
    primary: "text-primary border-primary/30 hover:bg-primary/10",
    secondary: "text-secondary border-secondary/30 hover:bg-secondary/10",
    outline: "border-border/20 dark:border-white/20 text-textDark dark:text-white hover:bg-black/5 dark:hover:bg-white/5",
    ghost: "border-transparent hover:bg-black/5 dark:hover:bg-white/5 text-textLight dark:text-gray-300",
    danger: "text-red-500 border-red-500/30 hover:bg-red-500/10",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};

export default Button;
