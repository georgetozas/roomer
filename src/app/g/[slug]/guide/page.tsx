// src/app/g/[slug]/guide/page.tsx
export const runtime = 'nodejs';

import { db } from '@/lib/db';
import Image from 'next/image';

type PageProps<T> = { params: Promise<T> };

export default async function GuidePage({ params }: PageProps<{ slug: string }>) {
  const { slug } = await params;

  const property = await db.property.findUnique({
    where: { slug },
    include: { sections: true },
  });
  if (!property) return <main className="p-6">Not found</main>;

  const s = property.sections.find(x => x.kind === 'GUIDE') ?? null;
  const primary = property.brandPrimary ?? '#0f172a';
  const secondary = property.brandSecondary ?? '#38bdf8';

  return (
    <main className="p-6 max-w-xl mx-auto space-y-4">
      {property.logoDataUrl && (
        <div className="flex justify-center">
          <Image src={property.logoDataUrl} alt={`${property.name} logo`} width={120} height={120} unoptimized />
        </div>
      )}
      <h1 className="text-3xl font-bold" style={{ color: primary }}>{s?.title ?? 'Local Guide'}</h1>
      <div className="p-4 rounded-lg border whitespace-pre-wrap" style={{ borderColor: secondary }}>
        {s?.body ?? '—'}
      </div>
      <nav className="pt-2 text-sm">
        <a className="underline text-blue-600" href={`/g/${slug}`}>Guest Info</a> ·{' '}
        <a className="underline text-blue-600" href={`/g/${slug}/welcome`}>Welcome</a> ·{' '}
        <a className="underline text-blue-600" href={`/g/${slug}/amenities`}>Amenities</a>
      </nav>
      <p className="text-xs text-gray-500">Powered by Roomer</p>
    </main>
  );
}
