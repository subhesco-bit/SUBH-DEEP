import React from 'react';

export function Card({ className = '', children, ...props }) {
  return <div className={`bg-white rounded-lg shadow p-6 ${className}`} {...props}>{children}</div>;
}

export default Card;

export function CardHeader({ className = '', children, ...props }) {
  return <div className={`mb-4 ${className}`} {...props}>{children}</div>;
}

export function CardTitle({ className = '', children, ...props }) {
  return <h3 className={`text-lg font-semibold ${className}`} {...props}>{children}</h3>;
}

export function CardDescription({ className = '', children, ...props }) {
  return <p className={`text-sm text-gray-500 ${className}`} {...props}>{children}</p>;
}

export function CardContent({ className = '', children, ...props }) {
  return <div className={className} {...props}>{children}</div>;
}
