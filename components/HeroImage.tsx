'use client';

import Image from 'next/image';
import { ReactNode } from 'react';

interface HeroImageProps {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  overlayContent?: ReactNode;
  darken?: boolean;
}

export function HeroImage({
  src,
  alt,
  title,
  subtitle,
  children,
  overlayContent,
  darken = true,
}: HeroImageProps) {
  return (
    <div className="relative w-full h-150 overflow-hidden rounded-3xl group">
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        priority
      />
      <div className={`absolute inset-0 pointer-events-none ${darken ? 'bg-gradient-to-b from-black/20 via-transparent to-black/40' : 'bg-gradient-to-b from-black/10 via-transparent to-black/20'}`} />
      
      {overlayContent && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          {overlayContent}
        </div>
      )}

      {(title || subtitle || children) && (
        <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-16 text-white z-20">
          {title && (
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight animate-slideUp max-w-3xl">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-6 text-base sm:text-lg text-white/95 max-w-2xl leading-relaxed animate-slideUp" style={{ animationDelay: '100ms' }}>
              {subtitle}
            </p>
          )}
          {children}
        </div>
      )}
    </div>
  );
}
