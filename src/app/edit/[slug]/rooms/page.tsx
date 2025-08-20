// src/app/edit/[slug]/rooms/page.tsx
export const runtime = 'nodejs';

import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

type PageProps<T> = { params: Promise<T> };

async function createRoom(form: FormData) {
  'use server';
  const slug = String(form.get('slug') || '');
  const key = String(form.get('key') || '');
  if (key !== process.env.APP_SECRET) throw new Error('Wrong key');

  const property = await db.property.findUnique({ where: { slug } });
  if (!property) throw new Error('Property not found');

  const existingCount = await db.room.count({ where: { propertyId: property.id } });

  // Simple gating: allow only 1 room unless ALLOW_MULTIROOM=1
  const allowMulti = process.env.ALLOW_MULTIROOM === '1';
  if (!allowMulti && existingCount >= 1) {
    throw new Error('Multi-room is disabled. Set ALLOW_MULTIROOM=1 to enable.');
  }

  const name = String(form.get('name') || '').trim();
  if (!name) throw new Error('Room name required');

  await db.room.create({
    data: { name, propertyId: property.id },
  });

  redirect(`/edit/${slug}/rooms`);
}

export default async function RoomsPage({ params }: PageProps<{ slug: string }>) {
  const { slug } = await params;

  const property = await db.property.findUnique({
    where: { slug },
    include: { rooms: { orderBy: { createdAt: 'desc' } } },
  });

  if (!property) return <main className="p-6">Not found</main>;

  const guestBase = `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/g/${property.slug}`;

  return (
    <main className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Rooms · {property.name}</h1>

      <section className="p-4 border rounded-lg space-y-2">
        <h2 className="text-lg font-semibold">Existing rooms</h2>
        {property.rooms.length === 0 ? (
          <p className="text-sm text-gray-600">No rooms yet.</p>
        ) : (
          <ul className="list-disc pl-5 space-y-1">
            {property.rooms.map((r) => (
              <li key={r.id}>
                <span className="font-medium">{r.name}</span>{' '}
                <a
                  className="underline text-blue-600"
                  href={`${guestBase}/r/${r.id}`}
                  target="_blank"
                >
                  view guest page
                </a>{' '}
                ·{' '}
                <a
                  className="underline text-blue-600"
                  href={`/api/qr?target=${encodeURIComponent(`${guestBase}/r/${r.id}`)}`}
                  target="_blank"
                >
                  QR
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="p-4 border rounded-lg space-y-3">
        <h2 className="text-lg font-semibold">Add a room</h2>
        <form action={createRoom} className="space-y-2">
          <input type="hidden" name="slug" defaultValue={property.slug} />
          <label className="block">
            <span className="font-medium">Secret Key</span>
            <input name="key" type="password" className="border rounded p-2 w-full" placeholder="enter APP_SECRET" required />
          </label>
          <label className="block">
            <span className="font-medium">Room name/number</span>
            <input name="name" className="border rounded p-2 w-full" placeholder="e.g., 203" required />
          </label>
          <button className="px-4 py-2 rounded bg-black text-white">Create room</button>
        </form>
        <p className="text-xs text-gray-500">
          Multi-room is off by default. To enable, set <code>ALLOW_MULTIROOM=1</code> in your env.
        </p>
      </section>

      <p>
        Back to property editor:{' '}
        <a className="underline text-blue-600" href={`/edit/${property.slug}`}>
          /edit/{property.slug}
        </a>
      </p>
    </main>
  );
}
