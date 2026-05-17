'use client';

import { useEffect, useRef, useState } from 'react';

export function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    const node = ref.current;
    if (!node) return;

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  return { ref, isVisible };
}
