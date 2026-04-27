import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(({ 
  label, 
  error, 
  icon: Icon, 
  className = '', 
  wrapperClassName = '',
  id,
  type,
  ...props 
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const isPasswordType = type === 'password';
  const [showPassword, setShowPassword] = useState(false);

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
          type={isPasswordType && showPassword ? 'text' : type}
          className={`
            w-full bg-[rgba(0,0,0,0.2)] border 
            ${error ? 'border-[var(--status-danger)]' : 'border-[var(--border-light)]'} 
            text-[var(--text-primary)] rounded-lg
            ${Icon ? 'pl-10' : 'pl-3'} ${isPasswordType ? 'pr-11' : 'pr-3'} py-2 
            focus:outline-none focus:ring-1 
            ${error ? 'focus:ring-[var(--status-danger)] focus:border-[var(--status-danger)]' : 'focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]'}
            transition-all duration-200
            ${showPassword ? 'shadow-[0_0_12px_rgba(139,92,246,0.3)] border-[rgba(139,92,246,0.4)]' : ''}
            ${className}
          `}
          style={{
            backdropFilter: 'blur(4px)'
          }}
          {...props}
        />

        {/* Eye toggle for password fields */}
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-all duration-300 ${
              showPassword 
                ? 'text-[var(--accent-tertiary)] drop-shadow-[0_0_6px_rgba(139,92,246,0.8)]' 
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
            tabIndex={-1}
          >
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        )}
      </div>
      
      {error && (
        <p className="text-xs text-[var(--status-danger)] mt-1 animate-fade-in">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
