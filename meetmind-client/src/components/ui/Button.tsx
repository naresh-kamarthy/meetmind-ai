import React from 'react';
import type { LucideIcon } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'admin' | 'danger' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  children?: React.ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  admin: 'btn-admin',
  danger: 'btn-danger',
  icon: 'btn-icon',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  className = '',
  children,
  type = 'button',
  ...props
}) => {
  const isIconOnly = variant === 'icon' || (!children && Icon);
  const resolvedVariant = isIconOnly && variant !== 'icon' ? 'icon' : variant;

  return (
    <button
      type={type}
      className={`
        ${variantClass[resolvedVariant]}
        ${isIconOnly ? '' : sizeClass[size]}
        ${className}
      `.trim()}
      {...props}
    >
      {Icon && iconPosition === 'left' && (
        <Icon size={size === 'sm' ? 14 : 18} className="shrink-0" aria-hidden />
      )}
      {children}
      {Icon && iconPosition === 'right' && (
        <Icon size={size === 'sm' ? 14 : 18} className="shrink-0" aria-hidden />
      )}
    </button>
  );
};
