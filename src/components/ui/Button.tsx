import Link from 'next/link';
import { ReactNode } from 'react';

type Variant = 'primary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  href?: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  target?: string;
  rel?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  'aria-label'?: string;
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
};

const variantClasses: Record<Variant, string> = {
  primary: 'bg-[var(--accent)] text-white hover:opacity-90',
  outline: 'border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-dim)]',
  ghost: 'text-[var(--text-muted)] hover:text-[var(--text)]',
};

export default function Button({ variant = 'primary', size = 'md', href, children, onClick, className = '', target, rel, type = 'button', disabled, 'aria-label': ariaLabel }: ButtonProps) {
  const classes = `inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
  if (href) return <Link href={href} className={classes} target={target} rel={rel} aria-label={ariaLabel}>{children}</Link>;
  return <button type={type} onClick={onClick} className={classes} disabled={disabled} aria-label={ariaLabel}>{children}</button>;
}
