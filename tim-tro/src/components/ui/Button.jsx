import React from 'react';
import clsx from 'clsx';

const Button = React.forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  children, 
  ...props 
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const variantClasses = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
    secondary: "bg-secondary-200 text-secondary-900 hover:bg-secondary-300 focus:ring-secondary-500",
    success: "bg-success-600 text-white hover:bg-success-700 focus:ring-success-500",
    danger: "bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500",
    warning: "bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500",
    ghost: "hover:bg-secondary-100 hover:text-secondary-900",
    outline: "border border-secondary-300 bg-white hover:bg-secondary-50 hover:text-secondary-900",
    link: "text-primary-600 underline-offset-4 hover:underline"
  };

  const sizeClasses = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
    icon: "h-10 w-10"
  };

  return (
    <button
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      ref={ref}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;
