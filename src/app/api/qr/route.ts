export const runtime = 'nodejs';

import QRCode from 'qrcode';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get('target');
  if (!target) return new Response('Missing target', { status: 400 });

  const pngBuffer = await QRCode.toBuffer(target, { width: 512, margin: 2 });

  // Convert Node Buffer -> ArrayBuffer -> Uint8Array for Web Response
  const ab = pngBuffer.buffer.slice(
    pngBuffer.byteOffset,
    pngBuffer.byteOffset + pngBuffer.byteLength
  );
  const u8 = new Uint8Array(ab);

  return new Response(u8, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
