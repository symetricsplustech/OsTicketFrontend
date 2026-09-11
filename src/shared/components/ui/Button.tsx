import React from 'react';
import { classNames } from '@shared/lib/classNames';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md';

const variants: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
  danger: 'text-red-600 hover:text-red-700 hover:bg-red-50',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-2 py-1 text-xs',
  md: '',
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return <button className={classNames('inline-flex items-center justify-center gap-2', variants[variant], sizes[size], className)} {...props} />;
}
