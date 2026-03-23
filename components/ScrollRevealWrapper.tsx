'use client';

import { useScrollReveal } from '@/hooks/useScrollReveal';

interface ScrollRevealWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function ScrollRevealWrapper({ children, className = '' }: ScrollRevealWrapperProps) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div ref={ref} className={`scroll-reveal ${isVisible ? 'visible' : ''} ${className}`}>
      {children}
    </div>
  );
}
