import React, { useEffect, useRef } from 'react';

interface LatexRendererProps {
  text: string;
  className?: string;
}

declare global {
  interface Window {
    katex: any;
  }
}

export const LatexRenderer: React.FC<LatexRendererProps> = ({ text, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && window.katex) {
      const content = text || '';
      // Simple parser for $$ block and $ inline
      // We'll replace the content of the container with parsed segments
      const parts = content.split(/(\$\$.*?\$\$|\$.*?\$)/gs);
      
      containerRef.current.innerHTML = '';
      
      parts.forEach(part => {
        const span = document.createElement('span');
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const formula = part.slice(2, -2);
          try {
            window.katex.render(formula, span, { displayMode: true, throwOnError: false });
          } catch (e) {
            span.textContent = part;
          }
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const formula = part.slice(1, -1);
          try {
            window.katex.render(formula, span, { displayMode: false, throwOnError: false });
          } catch (e) {
            span.textContent = part;
          }
        } else {
          span.textContent = part;
          span.style.whiteSpace = 'pre-wrap';
        }
        containerRef.current?.appendChild(span);
      });
    }
  }, [text]);

  return <div ref={containerRef} className={className} />;
};