import React from 'react';

export function Badge({ className = '', children, ...props }) {
  return <span className={`inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm ${className}`} {...props}>{children}</span>;
}

export default Badge;
