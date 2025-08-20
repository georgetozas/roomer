// src/app/g/[slug]/page.tsx
export const runtime = 'nodejs';

import { db } from '@/lib/db';
import Image from 'next/image';

type PageParams = { slug: string };
type PageProps<T> = { params: Promise<T> };

export default async function GuestPage({ params }: PageProps<PageParams>) {
  const { slug } = await params;

  const property = await db.property.findUnique({ where: { slug } });

  if (!property) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Property not found</h1>
        <p>Check the link or ask your host.</p>
      </main>
    );
  }

  const primary = property.brandPrimary ?? '#0f172a';
  const secondary = property.brandSecondary ?? '#38bdf8';

  return (
    <main className="p-6 max-w-xl mx-auto space-y-4">
      {property.logoDataUrl && (
        <div className="flex justify-center">
          <Image
            src={property.logoDataUrl}
            alt={`${property.name} logo`}
            width={120}
            height={120}
            className="rounded"
            unoptimized
            priority
          />
        </div>
      )}

      <h1 className="text-3xl font-bold" style={{ color: primary }}>
        {property.name}
      </h1>

      <section className="p-4 rounded-lg border" style={{ borderColor: secondary }}>
        <h2 className="text-xl font-semibold" style={{ color: primary }}>Wi-Fi</h2>
        <p><strong>SSID:</strong> {property.wifiSsid || '—'}</p>
        <p><strong>Password:</strong> {property.wifiPass || '—'}</p>
      </section>

      <section className="p-4 rounded-lg border" style={{ borderColor: secondary }}>
        <h2 className="text-xl font-semibold" style={{ color: primary }}>House Rules</h2>
        <p className="whitespace-pre-wrap">{property.rules || '—'}</p>
      </section>

      <p className="text-sm text-gray-500">Powered by Roomer</p>
    </main>
  );
}
