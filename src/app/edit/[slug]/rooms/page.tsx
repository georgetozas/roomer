// src/app/edit/[slug]/rooms/page.tsx
export const runtime = 'nodejs';

import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

type PageProps<T> = { params: Promise<T> };

async function createRoom(form: FormData) {
  'use server';

  const slug = String(form.get('slug') || '');
  const name = String(form.get('name') || '').trim();
  if (!slug) throw new Error('Missing slug');
  if (!name) throw new Error('Room name required');

  const property = await db.property.findUnique({
    where: { slug },
    include: { rooms: true },
  });
  if (!property) throw new Error('Property not found');

  const isEnterprise = property.plan === 'ENTERPRISE';
  const currentRooms = property.rooms.length;

  // Gate: only Enterprise can have more than 1 room
  if (!isEnterprise && currentRooms >= 1) {
    throw new Error('Multi-room is an Enterprise feature. Please upgrade to add more rooms.');
  }

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

  const isEnterprise = property.plan === 'ENTERPRISE';
  const guestBase =
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/g/${property.slug}`;

  return (
    <main className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Rooms · {property.name}</h1>
      <p className="text-sm text-gray-600">
        Plan: <span className="font-medium">{property.plan}</span>
        {property.subscriptionStatus ? ` · ${property.subscriptionStatus}` : ''}
      </p>

      {!isEnterprise && (
        <div className="p-4 border rounded-lg bg-yellow-50">
          <p className="mb-2">
            Multi-room is an <strong>Enterprise</strong> feature.
          </p>
          <div className="flex gap-3">
            <a
              className="px-3 py-2 rounded bg-black text-white"
              href={`/api/billing/checkout?slug=${property.slug}&plan=enterprise`}
            >
              Upgrade to Enterprise
            </a>
            {property.stripeCustomerId && (
              <a
                className="px-3 py-2 rounded border"
                href={`/api/billing/portal?slug=${property.slug}`}
              >
                Manage Billing
              </a>
            )}
          </div>
        </div>
      )}

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
                  view
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
        {!isEnterprise && property.rooms.length >= 1 ? (
          <p className="text-sm">
            You already have 1 room on <strong>{property.plan}</strong>. Upgrade to add more.
          </p>
        ) : (
          <form action={createRoom} className="space-y-2">
            <input type="hidden" name="slug" defaultValue={property.slug} />
            <label className="block">
              <span className="font-medium">Room name/number</span>
              <input
                name="name"
                className="border rounded p-2 w-full"
                placeholder="e.g., 203"
                required
              />
            </label>
            <button className="px-4 py-2 rounded bg-black text-white">
              Create room
            </button>
          </form>
        )}
      </section>

      <div className="flex gap-3">
        <a className="underline text-blue-600" href={`/edit/${property.slug}`}>
          Back to property editor
        </a>
        {property.stripeCustomerId && (
          <a
            className="underline text-blue-600"
            href={`/api/billing/portal?slug=${property.slug}`}
          >
            Manage Billing
          </a>
        )}
      </div>
    </main>
  );
}
