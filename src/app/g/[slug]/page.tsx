import { PrismaClient } from '@prisma/client';

export const runtime = 'nodejs';

type PageParams = { slug: string };
type PageProps<T> = { params: Promise<T> };

const db = new PrismaClient();

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

  return (
    <main className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold">{property.name}</h1>

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
