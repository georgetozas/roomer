// src/app/edit/[slug]/qr-cards/page.tsx
export const runtime = 'nodejs';

import { db } from '@/lib/db';

type PageProps<T> = { params: Promise<T> };

function cardUrl(baseUrl: string, slug: string, roomId?: string) {
  const target = roomId ? `${baseUrl}/g/${slug}/r/${roomId}` : `${baseUrl}/g/${slug}`;
  return `/api/qr?target=${encodeURIComponent(target)}`;
}

export default async function QRCardsPage({ params }: PageProps<{ slug: string }>) {
  const { slug } = await params;

  const property = await db.property.findUnique({
    where: { slug },
    include: { rooms: { orderBy: { createdAt: 'asc' } } },
  });

  if (!property) return <main className="p-6">Not found</main>;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '';

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold">QR Cards · {property.name}</h1>
          <p className="text-sm text-gray-600">
            Print these and place them in rooms / reception.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/edit/${property.slug}/rooms`}
            className="px-3 py-2 rounded border"
          >
            ← Back to Rooms
          </a>
          <button
            onClick={() => typeof window !== 'undefined' && window.print()}
            className="px-3 py-2 rounded bg-black text-white"
          >
            Print
          </button>
        </div>
      </div>

      {/* Print styles */}
      <style>
        {`
          @media print {
            @page { size: A4; margin: 12mm; }
            .print-grid { gap: 8mm; }
            .card { box-shadow: none !important; border: 1px solid #ddd; }
            .print:hidden { display: none !important; }
          }
        `}
      </style>

      <section className="print-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Property-level card */}
        <article className="card p-4 border rounded-xl shadow">
          <header className="mb-3">
            <h2 className="text-lg font-semibold">{property.name}</h2>
            <p className="text-xs text-gray-600">Guest Info (All Rooms)</p>
          </header>
          <div className="flex items-center justify-center">
            {/* Property QR */}
            <img
              src={cardUrl(baseUrl, property.slug)}
              alt={`${property.name} QR`}
              width={256}
              height={256}
              className="mx-auto"
            />
          </div>
          <footer className="mt-3 text-center text-xs">
            <div className="truncate">
              {`${baseUrl}/g/${property.slug}`}
            </div>
            <a
              className="underline text-blue-600"
              href={cardUrl(baseUrl, property.slug)}
              download={`${property.slug}-qr.png`}
            >
              Save PNG
            </a>
          </footer>
        </article>

        {/* Room-level cards */}
        {property.rooms.map((room) => (
          <article key={room.id} className="card p-4 border rounded-xl shadow">
            <header className="mb-3">
              <h2 className="text-lg font-semibold">{property.name}</h2>
              <p className="text-xs text-gray-600">Room {room.name}</p>
            </header>
            <div className="flex items-center justify-center">
              {/* Room QR */}
              <img
                src={cardUrl(baseUrl, property.slug, room.id)}
                alt={`${property.name} — Room ${room.name} QR`}
                width={256}
                height={256}
                className="mx-auto"
              />
            </div>
            <footer className="mt-3 text-center text-xs">
              <div className="truncate">
                {`${baseUrl}/g/${property.slug}/r/${room.id}`}
              </div>
              <a
                className="underline text-blue-600"
                href={cardUrl(baseUrl, property.slug, room.id)}
                download={`${property.slug}-room-${room.name}-qr.png`}
              >
                Save PNG
              </a>
            </footer>
          </article>
        ))}
      </section>

      <p className="mt-8 text-center text-xs text-gray-500 print:hidden">
        Tip: Use thicker paper for better results. Cut along the card borders.
      </p>
    </main>
  );
}
