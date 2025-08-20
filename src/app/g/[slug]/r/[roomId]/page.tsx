// src/app/g/[slug]/r/[roomId]/page.tsx
export const runtime = 'nodejs';

import { db } from '@/lib/db';

type PageProps<T> = { params: Promise<T> };

export default async function RoomGuestPage({
  params,
}: PageProps<{ slug: string; roomId: string }>) {
  const { slug, roomId } = await params;

  const property = await db.property.findUnique({ where: { slug } });
  if (!property) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Property not found</h1>
      </main>
    );
  }

  const room = await db.room.findFirst({
    where: { id: roomId, propertyId: property.id },
  });

  if (!room) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Room not found</h1>
        <p>Please check the QR or link.</p>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold">
        {property.name} — Room {room.name}
      </h1>

      <section className="p-4 border rounded-lg">
        <h2 className="text-xl font-semibold">Wi-Fi</h2>
        <p><strong>SSID:</strong> {property.wifiSsid || '—'}</p>
        <p><strong>Password:</strong> {property.wifiPass || '—'}</p>
      </section>

      <section className="p-4 border rounded-lg">
        <h2 className="text-xl font-semibold">House Rules</h2>
        <p className="whitespace-pre-wrap">{property.rules || '—'}</p>
      </section>

      <p className="text-sm text-gray-500">Powered by Roomer</p>
    </main>
  );
}
