import React from 'react';

interface A4PageProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const A4Page: React.FC<A4PageProps> = ({ children, className = '', style }) => {
  return (
    <div className={`page-a4 text-black text-sm leading-tight ${className}`} style={style}>
      {children}
    </div>
  );
};