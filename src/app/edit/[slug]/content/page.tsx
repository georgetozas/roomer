// src/app/edit/[slug]/content/page.tsx
export const runtime = 'nodejs';

import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

type PageProps<T> = { params: Promise<T> };
type Kind = 'WELCOME' | 'AMENITIES' | 'GUIDE';

async function saveSection(form: FormData) {
  'use server';

  const slug = String(form.get('slug') || '');
  const kind = String(form.get('kind') || '') as Kind;
  const title = String(form.get('title') || '').trim();
  const body = String(form.get('body') || '').trim();

  const property = await db.property.findUnique({ where: { slug } });
  if (!property) throw new Error('Property not found');

  await db.section.upsert({
    where: { propertyId_kind: { propertyId: property.id, kind } },
    create: { propertyId: property.id, kind, title, body },
    update: { title, body },
  });

  redirect(`/edit/${slug}/content?saved=${kind}`);
}

export default async function ContentEditor({ params }: PageProps<{ slug: string }>) {
  const { slug } = await params;

  const property = await db.property.findUnique({
    where: { slug },
    include: { sections: true },
  });
  if (!property) return <main className="p-6">Not found</main>;

  const get = (k: Kind) => property.sections.find(s => s.kind === k) ?? null;

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Content · {property.name}</h1>
        <div className="flex gap-3">
          <a className="px-3 py-2 rounded border" href={`/edit/${property.slug}`}>← Back</a>
          <a className="px-3 py-2 rounded border" href={`/edit/${property.slug}/rooms`}>Rooms</a>
          <a className="px-3 py-2 rounded border" href={`/edit/${property.slug}/branding`}>Branding</a>
        </div>
      </div>

      {(['WELCOME','AMENITIES','GUIDE'] as Kind[]).map((kind) => {
        const s = get(kind);
        const human =
          kind === 'WELCOME' ? 'Welcome' :
          kind === 'AMENITIES' ? 'Amenities' : 'Local Guide';

        return (
          <section key={kind} className="p-4 border rounded-xl space-y-3">
            <h2 className="text-lg font-semibold">{human}</h2>
            <form action={saveSection} className="space-y-3">
              <input type="hidden" name="slug" value={property.slug} />
              <input type="hidden" name="kind" value={kind} />
              <label className="block">
                <span className="font-medium">Title</span>
                <input name="title" className="border rounded p-2 w-full"
                  defaultValue={s?.title ?? human} placeholder={human} />
              </label>
              <label className="block">
                <span className="font-medium">Body (plain text; new lines kept)</span>
                <textarea name="body" rows={8}
                  className="border rounded p-2 w-full"
                  defaultValue={s?.body ?? ''} placeholder={`Write your ${human.toLowerCase()}...`} />
              </label>
              <button className="px-4 py-2 rounded bg-black text-white">Save {human}</button>
              <div className="text-xs text-gray-500">
                Guest page: <a className="underline text-blue-600" href={`/g/${property.slug}/${kind === 'WELCOME' ? 'welcome' : kind === 'AMENITIES' ? 'amenities' : 'guide'}`} target="_blank">
                  /g/{property.slug}/{kind === 'WELCOME' ? 'welcome' : kind === 'AMENITIES' ? 'amenities' : 'guide'}
                </a>
              </div>
            </form>
          </section>
        );
      })}
    </main>
  );
}
