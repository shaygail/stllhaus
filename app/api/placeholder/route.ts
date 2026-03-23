import { NextRequest, NextResponse } from 'next/server';

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const width = parseInt(searchParams.get('width') || '400');
  const height = parseInt(searchParams.get('height') || '300');

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#E8DED6"/>
    <rect width="100%" height="100%" fill="url(#grain)" opacity="0.3"/>
    <defs>
      <pattern id="grain" width="4" height="4" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.5" fill="#C6A27E" opacity="0.4"/>
      </pattern>
    </defs>
    <text x="50%" y="50%" font-family="system-ui, sans-serif" font-size="16" fill="#7A7A7A" text-anchor="middle" dy=".3em" letter-spacing="2">${width} × ${height}</text>
  </svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000',
    },
  });
}
