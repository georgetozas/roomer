// src/app/edit/[slug]/branding/page.tsx
export const runtime = 'nodejs';

import { db } from '@/lib/db';
import Image from 'next/image';
import { redirect } from 'next/navigation';

type PageProps<T> = { params: Promise<T> };

async function updateBranding(form: FormData) {
  'use server';

  const slug = String(form.get('slug') || '');
  const brandPrimary = String(form.get('brandPrimary') || '').trim();
  const brandSecondary = String(form.get('brandSecondary') || '').trim();
  const file = form.get('logo') as File | null;

  let logoDataUrl: string | undefined;
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mime = file.type || 'image/png';
    logoDataUrl = `data:${mime};base64,${base64}`;
  }

  await db.property.update({
    where: { slug },
    data: {
      brandPrimary: brandPrimary || null,
      brandSecondary: brandSecondary || null,
      ...(logoDataUrl ? { logoDataUrl } : {}),
    },
  });

  redirect(`/edit/${slug}/branding?updated=1`);
}

async function removeLogo(form: FormData) {
  'use server';
  const slug = String(form.get('slug') || '');
  await db.property.update({ where: { slug }, data: { logoDataUrl: null } });
  redirect(`/edit/${slug}/branding?removed=1`);
}

export default async function BrandingPage({ params }: PageProps<{ slug: string }>) {
  const { slug } = await params;

  const property = await db.property.findUnique({ where: { slug } });
  if (!property) return <main className="p-6">Not found</main>;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '';

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Branding · {property.name}</h1>
        <div className="flex gap-3">
          <a className="px-3 py-2 rounded border" href={`/edit/${property.slug}`}>← Back</a>
          <a className="px-3 py-2 rounded border" href={`/edit/${property.slug}/rooms`}>Rooms</a>
          <a className="px-3 py-2 rounded border" href={`/edit/${property.slug}/qr-cards`}>QR Cards</a>
        </div>
      </div>

      <section className="p-4 border rounded-xl space-y-4">
        <h2 className="text-lg font-semibold">Logo</h2>
        {property.logoDataUrl ? (
          <div className="flex items-center gap-4">
            <Image
              src={property.logoDataUrl}
              alt={`${property.name} logo`}
              width={160}
              height={160}
              className="rounded border bg-white"
              unoptimized
              priority
            />
            <form action={removeLogo}>
              <input type="hidden" name="slug" value={property.slug} />
              <button className="px-3 py-2 rounded bg-black text-white">Remove Logo</button>
            </form>
          </div>
        ) : (
          <p className="text-sm text-gray-600">No logo uploaded yet.</p>
        )}

        <form action={updateBranding} className="space-y-4" encType="multipart/form-data">
          <input type="hidden" name="slug" value={property.slug} />
          <label className="block">
            <span className="font-medium">Upload new logo</span>
            <input
              name="logo"
              type="file"
              accept="image/*"
              className="block w-full mt-1"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="font-medium">Primary color</span>
              <input
                name="brandPrimary"
                type="color"
                defaultValue={property.brandPrimary ?? '#0f172a'}
                className="block w-24 h-10 p-0 border rounded mt-1"
              />
              <input
                name="brandPrimary"
                type="text"
                defaultValue={property.brandPrimary ?? '#0f172a'}
                className="mt-1 border rounded p-2 w-full"
                placeholder="#0F172A"
              />
            </label>

            <label className="block">
              <span className="font-medium">Secondary color</span>
              <input
                name="brandSecondary"
                type="color"
                defaultValue={property.brandSecondary ?? '#38bdf8'}
                className="block w-24 h-10 p-0 border rounded mt-1"
              />
              <input
                name="brandSecondary"
                type="text"
                defaultValue={property.brandSecondary ?? '#38bdf8'}
                className="mt-1 border rounded p-2 w-full"
                placeholder="#38BDF8"
              />
            </label>
          </div>

          <button className="px-4 py-2 rounded bg-black text-white">Save Branding</button>
        </form>
      </section>

      <section className="p-4 border rounded-xl">
        <h2 className="text-lg font-semibold">Preview</h2>
        <div className="p-4 rounded-lg border" style={{ borderColor: property.brandSecondary ?? '#e5e7eb' }}>
          {property.logoDataUrl && (
            <Image
              src={property.logoDataUrl}
              alt="Preview logo"
              width={120}
              height={120}
              className="mb-3"
              unoptimized
            />
          )}
          <h3 className="text-xl font-bold" style={{ color: property.brandPrimary ?? '#0f172a' }}>
            {property.name}
          </h3>
          <p className="text-sm text-gray-600">Guest info will inherit your colors.</p>
          <a
            href={`${baseUrl}/g/${property.slug}`}
            className="inline-block mt-3 px-3 py-2 rounded text-white"
            style={{ background: property.brandPrimary ?? '#0f172a' }}
            target="_blank"
          >
            Open guest page
          </a>
        </div>
      </section>
    </main>
  );
}
