import { PrismaClient } from '@prisma/client';
import { redirect } from 'next/navigation';

const db = new PrismaClient();

async function updateProperty(formData: FormData) {
  'use server';
  const slug = String(formData.get('slug'));
  const key = String(formData.get('key') || '');
  if (key !== process.env.APP_SECRET) {
    throw new Error('Wrong key');
  }
  await db.property.update({
    where: { slug },
    data: {
      name: String(formData.get('name') || ''),
      wifiSsid: String(formData.get('wifiSsid') || ''),
      wifiPass: String(formData.get('wifiPass') || ''),
      rules: String(formData.get('rules') || ''),
    }
  });
  redirect(`/g/${slug}`);
}

export default async function EditPage({ params }: { params: { slug: string } }) {
  const property = await db.property.findUnique({ where: { slug: params.slug } });
  if (!property) return <main className="p-6">Not found</main>;

  return (
    <main className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Edit: {property.name}</h1>
      <form action={updateProperty} className="space-y-3">
        <input type="hidden" name="slug" defaultValue={property.slug} />

        <label className="block">
          <span className="font-medium">Secret Key</span>
          <input name="key" type="password" className="border rounded p-2 w-full" placeholder="enter APP_SECRET" required />
        </label>

        <label className="block">
          <span className="font-medium">Name</span>
          <input name="name" className="border rounded p-2 w-full" defaultValue={property.name} />
        </label>

        <label className="block">
          <span className="font-medium">Wi‑Fi SSID</span>
          <input name="wifiSsid" className="border rounded p-2 w-full" defaultValue={property.wifiSsid ?? ''} />
        </label>

        <label className="block">
          <span className="font-medium">Wi‑Fi Password</span>
          <input name="wifiPass" className="border rounded p-2 w-full" defaultValue={property.wifiPass ?? ''} />
        </label>

        <label className="block">
          <span className="font-medium">House Rules</span>
<textarea
  name="rules"
  rows={6}
  className="border rounded p-2 w-full"
  defaultValue={property.rules ?? ''}
/>
        </label>

        <button className="px-4 py-2 rounded bg-black text-white">Save</button>
      </form>
      <p className="text-sm text-gray-500">Tip: after saving, you’ll jump to the guest page.</p>
    </main>
  );
}
