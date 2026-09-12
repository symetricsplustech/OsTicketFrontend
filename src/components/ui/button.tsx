import React from 'react';
import { classNames } from '@shared/lib/classNames';

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'destructive' | 'primary' | 'secondary' | 'danger';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon' | 'md';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variants: Record<ButtonVariant, string> = {
  default: 'btn-primary',
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'border border-gray-300 bg-transparent hover:bg-gray-100',
  ghost: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
  danger: 'text-red-600 hover:text-red-700 hover:bg-red-50',
};

const sizes: Record<ButtonSize, string> = {
  default: 'px-4 py-2',
  md: 'px-4 py-2',
  sm: 'px-3 py-1.5 text-sm',
  lg: 'px-6 py-3',
  icon: 'h-10 w-10',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'default', className, ...props }, ref) => (
    <button
      ref={ref}
      className={classNames('inline-flex items-center justify-center gap-2 rounded-md', variants[variant], sizes[size], className)}
      {...props}
    />
  ),
);

Button.displayName = 'Button';
