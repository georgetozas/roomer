// src/app/api/qr/route.ts
export const runtime = 'nodejs';

import QRCode from 'qrcode';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get('target');
  if (!target) return new Response('Missing target', { status: 400 });

  // 1) Generate PNG as Node Buffer
  const buf = await QRCode.toBuffer(target, { width: 512, margin: 2 });

  // 2) Copy into a fresh, *pure* ArrayBuffer (avoids SharedArrayBuffer typing issues)
  const ab = new ArrayBuffer(buf.byteLength);
  new Uint8Array(ab).set(buf);

  // 3) Send the ArrayBuffer as the body
  return new Response(ab, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
