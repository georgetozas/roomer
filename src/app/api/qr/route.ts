export const runtime = 'nodejs';

import QRCode from 'qrcode';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get('target');
  if (!target) return new Response('Missing target', { status: 400 });

  const pngBuffer = await QRCode.toBuffer(target, { width: 512, margin: 2 });

  // ✅ Blob is a valid BodyInit
  const blob = new Blob([pngBuffer], { type: 'image/png' });

  return new Response(blob, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
