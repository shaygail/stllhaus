'use client';

import Image from 'next/image';

interface BrandSectionProps {
  label: string;
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
  backgroundColor?: string;
  isDark?: boolean;
}

export function BrandSection({
  label,
  title,
  description,
  imageSrc,
  imageAlt,
  backgroundColor = 'bg-white',
  isDark = false,
}: BrandSectionProps) {
  return (
    <div className={`${backgroundColor} rounded-3xl overflow-hidden scroll-reveal`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch">
        {/* Content Side */}
        <div className={`flex flex-col justify-center p-12 ${isDark ? 'bg-stll-charcoal text-white' : ''}`}>
          <p className={`text-xs uppercase tracking-[0.3em] font-semibold ${isDark ? 'text-stll-sage/80' : 'text-stll-sage'}`}>
            ({label})
          </p>
          <h3 className={`mt-6 text-3xl font-bold uppercase leading-tight ${isDark ? 'text-white' : 'text-stll-charcoal'}`}>
            {title}
          </h3>
          <p className={`mt-6 text-base leading-relaxed max-w-md ${isDark ? 'text-gray-300' : 'text-stll-muted'}`}>
            {description}
          </p>
        </div>

        {/* Image Side */}
        {imageSrc && (
          <div className="relative h-96 md:h-auto min-h-80">
            <Image
              src={imageSrc}
              alt={imageAlt || title}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
}
