// src/app/api/qr/route.ts
export const runtime = 'nodejs';

import QRCode from 'qrcode';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get('target');
  if (!target) return new Response('Missing target', { status: 400 });

  const png = await QRCode.toBuffer(target, { width: 512, margin: 2 });
  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
