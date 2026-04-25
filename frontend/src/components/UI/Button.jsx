import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  fullWidth = false,
  isLoading = false,
  ...props 
}) => {
  
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white shadow-glow border border-transparent",
    secondary: "bg-[var(--bg-glass)] hover:bg-opacity-80 text-white border border-[var(--border-light)] backdrop-blur-md",
    danger: "bg-[var(--status-danger)] hover:bg-red-600 text-white border border-transparent",
    ghost: "bg-transparent hover:bg-[var(--bg-glass)] text-[var(--text-secondary)] hover:text-white border border-transparent",
  };
  
  const sizes = {
    sm: "py-1.5 px-3 text-sm",
    md: "py-2 px-4 text-base",
    lg: "py-3 px-6 text-lg",
  };
  
  const classes = `
    ${baseStyles} 
    ${variants[variant] || variants.primary} 
    ${sizes[size] || sizes.md} 
    ${fullWidth ? 'w-full' : ''} 
    ${className}
  `;

  return (
    <button className={classes} disabled={isLoading} {...props}>
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Procesando...
        </>
      ) : children}
    </button>
  );
};

export default Button;
