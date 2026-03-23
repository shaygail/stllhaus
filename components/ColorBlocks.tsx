'use client';

interface ColorBlocksProps {
  blocks: {
    color: string;
    height?: string;
  }[];
  orientation?: 'horizontal' | 'vertical';
}

export function ColorBlocks({
  blocks,
  orientation = 'horizontal',
}: ColorBlocksProps) {
  return (
    <div
      className={`overflow-hidden rounded-3xl ${
        orientation === 'horizontal' ? 'flex max-h-48' : 'grid grid-cols-1'
      }`}
    >
      {blocks.map((block, index) => (
        <div
          key={index}
          className={`${block.color} ${
            orientation === 'horizontal'
              ? 'flex-1'
              : block.height || 'h-32'
          } transition-all duration-500 hover:grow`}
        />
      ))}
    </div>
  );
}
