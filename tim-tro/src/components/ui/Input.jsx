import { forwardRef } from 'react';
import clsx from 'clsx';

const Input = forwardRef(({
  className,
  type = 'text',
  size = 'md',
  variant = 'default',
  error = false,
  helperText,
  label,
  leftIcon,
  rightIcon,
  ...props
}, ref) => {
  const baseStyles = "w-full rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-secondary-400";
  
  const variants = {
    default: "border-secondary-200 focus:border-primary-500 focus:ring-primary-500/20",
    filled: "bg-secondary-50 border-secondary-200 focus:bg-white focus:border-primary-500 focus:ring-primary-500/20",
    outlined: "border-2 border-secondary-200 focus:border-primary-500 focus:ring-primary-500/20",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm h-9",
    md: "px-4 py-3 text-sm h-11",
    lg: "px-5 py-4 text-base h-12",
  };

  const errorStyles = error 
    ? "border-error-500 focus:border-error-500 focus:ring-error-500/20" 
    : "";

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const paddingWithIcon = {
    sm: leftIcon ? "pl-9" : rightIcon ? "pr-9" : "",
    md: leftIcon ? "pl-11" : rightIcon ? "pr-11" : "",
    lg: leftIcon ? "pl-12" : rightIcon ? "pr-12" : "",
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className={clsx(
          "block text-sm font-medium",
          error ? "text-error-700" : "text-secondary-700"
        )}>
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className={clsx(
            "absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none",
            error ? "text-error-500" : "text-secondary-400",
            iconSizes[size]
          )}>
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          className={clsx(
            baseStyles,
            variants[variant],
            sizes[size],
            paddingWithIcon[size],
            errorStyles,
            className
          )}
          {...props}
        />
        
        {rightIcon && (
          <div className={clsx(
            "absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none",
            error ? "text-error-500" : "text-secondary-400",
            iconSizes[size]
          )}>
            {rightIcon}
          </div>
        )}
      </div>
      
      {(helperText || error) && (
        <p className={clsx(
          "text-sm",
          error ? "text-error-600" : "text-secondary-500"
        )}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
