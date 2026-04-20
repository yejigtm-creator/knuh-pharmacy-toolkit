import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline';
};

export function Button({ className = '', variant = 'default', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50';
  const styles = variant === 'outline'
    ? 'border border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
    : 'bg-stone-800 text-white hover:bg-stone-700';

  return <button className={`${base} ${styles} ${className}`.trim()} {...props} />;
}
