import React from "react";

/**
 * UIContainer - Single Responsibility: Provide consistent glassmorphism styling
 * SOLID: Reusable design system component
 */
interface UIContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const UIContainer: React.FC<UIContainerProps> = ({ children, className = "" }) => (
  <div className={`backdrop-blur-md bg-white/20 border border-white/30 shadow-lg rounded-xl ${className}`}>
    {children}
  </div>
);