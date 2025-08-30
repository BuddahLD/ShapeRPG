// Design System Service - Modern iOS-inspired minimalist design with cartoon contours
// Following Prince of Persia 2008 aesthetic with pastel color palette

export class DesignSystem {
  // Modern pastel color palette - authentic and sophisticated
  static readonly COLORS = {
    // Primary brand colors - sophisticated blues
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe', 
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9', // Main brand
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e'
    },
    
    // Secondary colors - warm coral/peach tones
    secondary: {
      50: '#fef7f0',
      100: '#fdeee0',
      200: '#fad8c1',
      300: '#f7ba96',
      400: '#f39069',
      500: '#ed6b47', // Main secondary
      600: '#dc4a26',
      700: '#b8391c',
      800: '#94301b',
      900: '#7a2b1a'
    },
    
    // Zone-specific color schemes
    zones: {
      hub: {
        primary: '#a78bfa',   // Soft violet
        secondary: '#c4b5fd', // Light violet
        accent: '#ddd6fe',    // Pale violet
        background: '#faf5ff' // Violet background
      },
      fields: {
        primary: '#34d399',   // Soft emerald
        secondary: '#6ee7b7', // Light emerald  
        accent: '#a7f3d0',    // Pale emerald
        background: '#f0fdf4' // Green background
      },
      arena: {
        primary: '#fb7185',   // Soft rose
        secondary: '#fda4af', // Light rose
        accent: '#fecdd3',    // Pale rose
        background: '#fff1f2' // Rose background
      }
    },
    
    // Neutral colors - iOS inspired grays
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373', 
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717'
    },
    
    // Functional colors - muted and sophisticated
    success: '#10b981',   // Emerald 500
    warning: '#f59e0b',   // Amber 500  
    error: '#ef4444',     // Red 500
    info: '#3b82f6'       // Blue 500
  };

  // Typography system - iOS inspired
  static readonly TYPOGRAPHY = {
    fonts: {
      display: 'SF Pro Display, system-ui, -apple-system, sans-serif',
      text: 'SF Pro Text, system-ui, -apple-system, sans-serif',
      mono: 'SF Mono, Menlo, Monaco, monospace'
    },
    
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px  
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem'  // 36px
    },
    
    weights: {
      light: '300',
      normal: '400', 
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  };

  // Spacing system - 8px base grid
  static readonly SPACING = {
    0: '0',
    1: '0.125rem', // 2px
    2: '0.25rem',  // 4px
    3: '0.375rem', // 6px
    4: '0.5rem',   // 8px
    5: '0.625rem', // 10px
    6: '0.75rem',  // 12px
    8: '1rem',     // 16px
    10: '1.25rem', // 20px
    12: '1.5rem',  // 24px
    16: '2rem',    // 32px
    20: '2.5rem',  // 40px
    24: '3rem',    // 48px
    32: '4rem',    // 64px
    40: '5rem',    // 80px
    48: '6rem',    // 96px
    64: '8rem'     // 128px
  };

  // Border radius system - iOS inspired rounded corners
  static readonly RADIUS = {
    none: '0',
    sm: '0.125rem',  // 2px
    md: '0.375rem',  // 6px  
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px'
  };

  // Shadow system - subtle iOS-like shadows
  static readonly SHADOWS = {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
  };

  // Game-specific visual tokens
  static readonly GAME_VISUALS = {
    // Character stroke widths for cartoon effect
    strokeWidths: {
      thin: 1,
      normal: 2,
      thick: 3,
      bold: 4
    },
    
    // Animation durations
    animations: {
      fast: '150ms',
      normal: '300ms', 
      slow: '500ms',
      smooth: '750ms'
    },
    
    // Glow effects for magical elements
    glows: {
      fire: '0 0 20px rgba(255, 107, 107, 0.6)',
      ice: '0 0 20px rgba(147, 197, 253, 0.6)',
      magic: '0 0 20px rgba(196, 181, 253, 0.6)',
      success: '0 0 15px rgba(52, 211, 153, 0.5)',
      danger: '0 0 15px rgba(248, 113, 113, 0.5)'
    }
  };

  // Get zone-specific color scheme
  static getZoneColors(zoneId: string) {
    if (zoneId === 'LOC_HUB_FIGUREIUM') return this.COLORS.zones.hub;
    if (zoneId === 'LOC_PEACEFUL_FIELDS') return this.COLORS.zones.fields;
    if (zoneId === 'LOC_ARENA_1') return this.COLORS.zones.arena;
    return this.COLORS.zones.hub; // Default fallback
  }

  // Generate gradient backgrounds for zones
  static createZoneGradient(ctx: CanvasRenderingContext2D, zoneId: string, width: number, height: number) {
    const colors = this.getZoneColors(zoneId);
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    
    // Create sophisticated gradients instead of solid colors
    if (zoneId === 'LOC_HUB_FIGUREIUM') {
      gradient.addColorStop(0, '#1e1b4b'); // Deep violet
      gradient.addColorStop(0.5, '#312e81'); // Medium violet
      gradient.addColorStop(1, '#3730a3'); // Rich violet
    } else if (zoneId === 'LOC_PEACEFUL_FIELDS') {
      gradient.addColorStop(0, '#14532d'); // Deep green
      gradient.addColorStop(0.5, '#166534'); // Medium green
      gradient.addColorStop(1, '#15803d'); // Rich green
    } else if (zoneId === 'LOC_ARENA_1') {
      gradient.addColorStop(0, '#7c2d12'); // Deep brown-red
      gradient.addColorStop(0.5, '#9a3412'); // Medium brown-red 
      gradient.addColorStop(1, '#c2410c'); // Rich brown-red
    }
    
    return gradient;
  }

  // Apply cartoon-style stroke effect (Prince of Persia 2008 inspired)
  static applyCartoonStroke(ctx: CanvasRenderingContext2D, strokeColor: string, strokeWidth: number = 2) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    // Add subtle glow effect for cartoon look
    ctx.shadowColor = strokeColor;
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  // Reset canvas styling
  static resetCanvasStyle(ctx: CanvasRenderingContext2D) {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
}