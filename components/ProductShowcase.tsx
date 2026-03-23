'use client';

import Image from 'next/image';

interface ProductShowcaseProps {
  items: {
    id: string;
    src: string;
    alt: string;
    title?: string;
    description?: string;
  }[];
  columns?: 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

const gapMap = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
};

const colsMap = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
};

export function ProductShowcase({
  items,
  columns = 3,
  gap = 'md',
}: ProductShowcaseProps) {
  return (
    <div className={`grid grid-cols-1 ${colsMap[columns]} ${gapMap[gap]}`}>
      {items.map((item, index) => (
        <div key={item.id} className={`group scroll-reveal`} style={{ transitionDelay: `${index * 50}ms` }}>
          <div className="relative h-96 rounded-2xl overflow-hidden mb-4">
            <Image
              src={item.src}
              alt={item.alt}
              fill
              unoptimized
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          </div>
          {item.title && (
            <h3 className="text-lg font-semibold text-stll-charcoal group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-stll-accent group-hover:to-stll-sage transition-all">
              {item.title}
            </h3>
          )}
          {item.description && (
            <p className="mt-2 text-sm text-stll-muted group-hover:text-stll-charcoal transition-colors">
              {item.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
