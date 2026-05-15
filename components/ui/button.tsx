import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: '#174ea6',
    borderColor: '#174ea6',
    color: '#ffffff',
  },
  secondary: {
    background: '#ffffff',
    borderColor: '#c8d0dc',
    color: '#102033',
  },
  ghost: {
    background: 'transparent',
    borderColor: 'transparent',
    color: '#174ea6',
  },
};

export function Button({ children, style, type = 'button', variant = 'secondary', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      style={{
        minHeight: 36,
        border: '1px solid',
        borderRadius: 6,
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        fontSize: 14,
        fontWeight: 600,
        lineHeight: 1,
        padding: '0 14px',
        opacity: props.disabled ? 0.6 : 1,
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
