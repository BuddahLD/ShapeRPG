import React from "react";

/**
 * UIContainer - Single Responsibility: Provide consistent glassmorphism styling
 * SOLID: Extensible design system component that accepts any additional props
 */
interface UIContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'minimal' | 'enhanced';
}

export const UIContainer: React.FC<UIContainerProps> = ({ 
  children, 
  className = "", 
  variant = 'default',
  ...props 
}) => {
  const baseStyles = "backdrop-blur-md border border-white/30 shadow-lg rounded-xl";
  const variantStyles = {
    default: "bg-white/20",
    minimal: "bg-white/10",
    enhanced: "bg-white/25 shadow-xl"
  };
  
  return (
    <div 
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};