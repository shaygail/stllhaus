'use client';

import Image from 'next/image';
import { ReactNode } from 'react';

interface SplitSectionProps {
  imageSrc: string;
  imageAlt: string;
  imagePosition?: 'left' | 'right';
  backgroundColor?: string;
  children: ReactNode;
}

export function SplitSection({
  imageSrc,
  imageAlt,
  imagePosition = 'right',
  backgroundColor = 'bg-stll-cream',
  children,
}: SplitSectionProps) {
  return (
    <div className={`${backgroundColor} grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch overflow-hidden rounded-3xl scroll-reveal`}>
      {/* Text Content */}
      <div
        className={`flex flex-col justify-center p-8 sm:p-16 ${
          imagePosition === 'left' ? 'md:order-2' : 'md:order-1'
        } hover:bg-white/50 transition-colors duration-500`}
      >
        <div className="space-y-6">
          {children}
        </div>
      </div>

      {/* Image */}
      <div
        className={`relative h-96 md:h-auto min-h-96 md:min-h-125 group overflow-hidden ${
          imagePosition === 'left' ? 'md:order-1' : 'md:order-2'
        }`}
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          unoptimized
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
      </div>
    </div>
  );
}
