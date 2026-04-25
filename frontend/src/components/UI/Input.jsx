import React, { forwardRef } from 'react';

const Input = forwardRef(({ 
  label, 
  error, 
  icon: Icon, 
  className = '', 
  wrapperClassName = '',
  id,
  ...props 
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex flex-col space-y-1.5 w-full ${wrapperClassName}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
            <Icon size={18} />
          </div>
        )}
        
        <input
          id={inputId}
          ref={ref}
          className={`
            w-full bg-[rgba(0,0,0,0.2)] border 
            ${error ? 'border-[var(--status-danger)]' : 'border-[var(--border-light)]'} 
            text-[var(--text-primary)] rounded-lg
            ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2 
            focus:outline-none focus:ring-1 
            ${error ? 'focus:ring-[var(--status-danger)] focus:border-[var(--status-danger)]' : 'focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]'}
            transition-all duration-200
            ${className}
          `}
          style={{
            backdropFilter: 'blur(4px)'
          }}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-xs text-[var(--status-danger)] mt-1 animate-fade-in">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
