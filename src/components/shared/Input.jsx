import React from 'react';

const Input = ({ 
  label, 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-textLight dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {props.prefix && (
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-gray-500">
            {props.prefix}
          </div>
        )}
        <input
          className={`w-full py-2 rounded-lg border bg-background dark:bg-white/5 text-textDark dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 
            ${props.prefix ? 'ps-10' : 'px-4'} 
            ${props.suffix ? 'pe-10' : 'px-4'}
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-border dark:border-white/10'}
          `}
          {...props}
        />
        {props.suffix && (
          <div className="absolute inset-y-0 end-0 flex items-center pe-3 pointer-events-none text-gray-500">
            {props.suffix}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Input;
