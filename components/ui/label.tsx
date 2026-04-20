import React from 'react';

export function Label({ className = '', ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={`mb-2 block text-sm font-medium text-stone-700 ${className}`.trim()} {...props} />;
}
