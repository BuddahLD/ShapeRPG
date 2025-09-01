import React from "react";

/**
 * UIContainerModifier - Single Responsibility: Apply content-wrapping modifications to any component
 * SOLID: Open for extension, closed for modification - composition pattern
 * Pattern: Standard TypeScript/React composition pattern
 */
interface UIContainerModifierProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  wrapContent?: boolean;
  maxWidth?: string;
  maxHeight?: string;
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: string;
  shadow?: string;
  backdropBlur?: boolean;
  glassmorphism?: boolean;
  floating?: boolean;
  animationDuration?: string;
}

export const UIContainerModifier: React.FC<UIContainerModifierProps> = ({
  children,
  wrapContent = true,
  maxWidth = 'auto',
  maxHeight = 'auto',
  padding = '0',
  margin = '0',
  backgroundColor = 'transparent',
  borderColor = 'transparent',
  borderRadius = '0',
  shadow = 'none',
  backdropBlur = false,
  glassmorphism = false,
  floating = false,
  animationDuration = '0.3s',
  className = "",
  style,
  ...props
}) => {
  // If not wrapping content, return children directly
  if (!wrapContent) {
    return <>{children}</>;
  }

  // Build dynamic styles based on props
  const dynamicStyles: React.CSSProperties = {
    maxWidth,
    maxHeight,
    width: 'fit-content',
    height: 'fit-content',
    padding,
    margin,
    backgroundColor,
    borderColor: borderColor !== 'transparent' ? borderColor : undefined,
    borderRadius,
    boxShadow: shadow !== 'none' ? shadow : undefined,
    backdropFilter: backdropBlur ? 'blur(8px)' : undefined,
    ...style
  };

  // Build dynamic classes
  const dynamicClasses = [
    'flex flex-col',
    glassmorphism && 'backdrop-blur-md bg-white/20 border border-white/30 shadow-lg',
    floating && 'animate-pulse',
    className
  ].filter(Boolean).join(' ');

  // Floating animation styles
  const floatingStyles: React.CSSProperties = floating ? {
    animation: `floating ${animationDuration} ease-in-out infinite alternate`,
    transform: 'translateY(0px)'
  } : {};

  return (
    <>
      {/* Add floating animation keyframes if needed */}
      {floating && (
        <style>
          {`
            @keyframes floating {
              0% { transform: translateY(0px); }
              100% { transform: translateY(-6px); }
            }
          `}
        </style>
      )}
      
      {/* Modified container */}
      <div
        className={dynamicClasses}
        style={{ ...dynamicStyles, ...floatingStyles }}
        {...props}
      >
        {children}
      </div>
    </>
  );
};

/**
 * Higher-order component factory for creating modified containers
 * Pattern: Standard React HOC pattern
 */
export const withContainerModifier = <P extends object>(
  Component: React.ComponentType<P>,
  defaultModifierProps: Partial<UIContainerModifierProps> = {}
) => {
  return React.forwardRef<any, P & Partial<UIContainerModifierProps>>((props, ref) => {
    const { wrapContent, ...componentProps } = props;
    const modifierProps = { ...defaultModifierProps, ...props };
    
    return (
      <UIContainerModifier {...modifierProps}>
        <Component {...(componentProps as P)} ref={ref} />
      </UIContainerModifier>
    );
  });
};
