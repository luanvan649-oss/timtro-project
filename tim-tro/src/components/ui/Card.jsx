import { forwardRef } from 'react';
import clsx from 'clsx';

const Card = forwardRef(({
  className,
  variant = 'default',
  size = 'md',
  hover = false,
  children,
  ...props
}, ref) => {
  const baseStyles = "bg-white rounded-2xl transition-all duration-200";
  
  const variants = {
    default: "shadow-card border border-secondary-100",
    elevated: "shadow-hover border border-secondary-100",
    outlined: "border-2 border-secondary-200 shadow-none",
    ghost: "shadow-none border-none bg-transparent",
    glass: "glass border border-white/20 backdrop-blur-lg",
  };

  const sizes = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
    xl: "p-10",
  };

  const hoverStyles = hover 
    ? "hover:shadow-hover hover:-translate-y-1 cursor-pointer" 
    : "";

  return (
    <div
      ref={ref}
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        hoverStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

// Sub-components
const CardHeader = forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  >
    {children}
  </div>
));
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={clsx("text-lg font-semibold leading-none tracking-tight text-secondary-900", className)}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={clsx("text-sm text-secondary-600 line-clamp-2", className)}
    {...props}
  >
    {children}
  </p>
));
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx("pt-0", className)}
    {...props}
  >
    {children}
  </div>
));
CardContent.displayName = "CardContent";

const CardFooter = forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx("flex items-center pt-4", className)}
    {...props}
  >
    {children}
  </div>
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
