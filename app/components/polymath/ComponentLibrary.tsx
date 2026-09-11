/**
 * Polymath Component Library
 * Reusable UI components for the MVP
 * Design tokens from Viridian (colors, spacing, typography)
 */

// ============================================================================
// DESIGN TOKENS
// ============================================================================

export const colors = {
  primary: '#0d9488', // teal
  primaryDark: '#0f766e',
  primaryLight: '#ccfbf1',

  secondary: '#8b5cf6', // purple
  secondaryDark: '#7c3aed',
  secondaryLight: '#ede9fe',

  danger: '#dc2626', // red
  dangerLight: '#fee2e2',

  warning: '#f59e0b', // amber
  warningLight: '#fef3c7',

  success: '#10b981', // green
  successLight: '#d1fae5',

  bg: {
    light: '#fafaf7',
    lighter: '#f9f7f4',
    white: '#fff',
  },

  text: {
    primary: '#1c1917',
    secondary: '#666',
    tertiary: '#999',
    light: '#ccc',
  },

  border: '#e5e0d8',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
};

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = {
    border: 'none',
    borderRadius: '6px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.sm,
    opacity: disabled || loading ? 0.6 : 1,
  };

  const variants = {
    primary: {
      backgroundColor: colors.primary,
      color: '#fff',
      '&:hover': { backgroundColor: colors.primaryDark },
    },
    secondary: {
      backgroundColor: colors.secondary,
      color: '#fff',
      '&:hover': { backgroundColor: colors.secondaryDark },
    },
    danger: {
      backgroundColor: colors.danger,
      color: '#fff',
      '&:hover': { backgroundColor: '#b91c1c' },
    },
    outline: {
      backgroundColor: 'transparent',
      color: colors.text.primary,
      border: `1px solid ${colors.border}`,
      '&:hover': { backgroundColor: colors.bg.lighter },
    },
  };

  const sizes = {
    sm: { padding: `${spacing.sm} ${spacing.md}`, fontSize: '12px' },
    md: { padding: `${spacing.md} ${spacing.lg}`, fontSize: '14px' },
    lg: { padding: `${spacing.lg} ${spacing.xl}`, fontSize: '16px' },
  };

  return (
    <button
      style={{
        ...baseStyles,
        ...variants[variant],
        ...sizes[size],
      } as React.CSSProperties}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span>⏳</span>}
      {children}
    </button>
  );
}

// ============================================================================
// CARD COMPONENT
// ============================================================================

interface CardProps {
  children: React.ReactNode;
  hoverable?: boolean;
  onClick?: () => void;
}

export function Card({ children, hoverable = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: colors.bg.white,
        border: `1px solid ${colors.border}`,
        borderRadius: '10px',
        padding: spacing.lg,
        cursor: hoverable ? 'pointer' : 'default',
        transition: hoverable ? 'all 0.2s' : 'none',
      }}
      onMouseEnter={(e) => {
        if (hoverable) {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable) {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// INPUT/FORM COMPONENTS
// ============================================================================

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function TextInput({ label, error, ...props }: TextInputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
      {label && (
        <label style={{ fontSize: '14px', fontWeight: '500', color: colors.text.primary }}>
          {label}
        </label>
      )}
      <input
        style={{
          padding: spacing.md,
          border: `1px solid ${error ? colors.danger : colors.border}`,
          borderRadius: '6px',
          fontSize: '14px',
          fontFamily: 'inherit',
          backgroundColor: colors.bg.white,
          color: colors.text.primary,
        }}
        {...props}
      />
      {error && <span style={{ fontSize: '12px', color: colors.danger }}>{error}</span>}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function TextArea({ label, error, ...props }: TextAreaProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
      {label && (
        <label style={{ fontSize: '14px', fontWeight: '500', color: colors.text.primary }}>
          {label}
        </label>
      )}
      <textarea
        style={{
          padding: spacing.md,
          border: `1px solid ${error ? colors.danger : colors.border}`,
          borderRadius: '6px',
          fontSize: '14px',
          fontFamily: 'inherit',
          backgroundColor: colors.bg.white,
          color: colors.text.primary,
          minHeight: '120px',
          resize: 'vertical',
        }}
        {...props}
      />
      {error && <span style={{ fontSize: '12px', color: colors.danger }}>{error}</span>}
    </div>
  );
}

// ============================================================================
// MODAL COMPONENT
// ============================================================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, actions }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <Card>
        <div
          style={{ minWidth: '400px' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.lg,
              paddingBottom: spacing.lg,
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: colors.text.primary }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: colors.text.secondary,
              }}
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div style={{ marginBottom: spacing.lg }}>
            {children}
          </div>

          {/* Actions */}
          {actions && (
            <div style={{ display: 'flex', gap: spacing.md, justifyContent: 'flex-end' }}>
              {actions}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
// LOADING STATES
// ============================================================================

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: '20px', md: '32px', lg: '48px' };
  return (
    <div
      style={{
        width: sizes[size],
        height: sizes[size],
        border: `3px solid ${colors.border}`,
        borderTop: `3px solid ${colors.primary}`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
  );
}

export function LoadingCard() {
  return (
    <Card>
      <div style={{ display: 'flex', gap: spacing.lg }}>
        <div
          style={{
            width: '60px',
            height: '60px',
            backgroundColor: colors.bg.lighter,
            borderRadius: '6px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              height: '20px',
              backgroundColor: colors.bg.lighter,
              borderRadius: '4px',
              marginBottom: spacing.md,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              height: '12px',
              backgroundColor: colors.bg.lighter,
              borderRadius: '4px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// EMPTY STATE
// ============================================================================

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xxl,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '48px', marginBottom: spacing.lg }}>{icon}</div>
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.text.primary, margin: 0, marginBottom: spacing.sm }}>
        {title}
      </h3>
      <p style={{ fontSize: '14px', color: colors.text.secondary, margin: 0, marginBottom: spacing.lg }}>
        {description}
      </p>
      {action}
    </div>
  );
}

// ============================================================================
// BADGE
// ============================================================================

export function Badge({ children, variant = 'primary' }: { children: React.ReactNode; variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' }) {
  const bgColors = {
    primary: colors.primaryLight,
    secondary: colors.secondaryLight,
    success: colors.successLight,
    warning: colors.warningLight,
    danger: colors.dangerLight,
  };

  const textColors = {
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
  };

  return (
    <span
      style={{
        display: 'inline-block',
        padding: `${spacing.xs} ${spacing.md}`,
        backgroundColor: bgColors[variant],
        color: textColors[variant],
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '600',
      }}
    >
      {children}
    </span>
  );
}

// CSS Animations (add to globals.css)
export const animationStyles = `
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;
