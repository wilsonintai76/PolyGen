import React from 'react';

interface A4PageProps {
  children: React.ReactNode;
  className?: string;
}

export const A4Page: React.FC<A4PageProps> = ({ children, className = '' }) => {
  return (
    <div className={`page-a4 text-black text-sm leading-tight ${className}`}>
      {children}
    </div>
  );
};