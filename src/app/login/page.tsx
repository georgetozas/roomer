// src/app/login/page.tsx
export const runtime = 'nodejs';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSessionCookie } from '@/lib/auth';

type SearchParams = Record<string, string | string[] | undefined>;

async function login(form: FormData) {
  'use server';

  const email = String(form.get('email') || '').trim().toLowerCase();
  const password = String(form.get('password') || '');
  const next = String(form.get('next') || '/') || '/';

  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
  const adminPass = process.env.ADMIN_PASSWORD || '';

  if (!adminEmail || !adminPass) {
    throw new Error('Missing ADMIN_EMAIL or ADMIN_PASSWORD env vars');
  }
  if (email !== adminEmail || password !== adminPass) {
    throw new Error('Invalid credentials');
  }

  const session = await createSessionCookie({ sub: 'admin', email });

  // Next 15 types can mark cookies() as read-only in some contexts.
  // At runtime in a Server Action, setting is allowed. We await and set:
  const jar = await cookies();
  // @ts-expect-error: mutation is valid in Server Actions even if types say Readonly
  jar.set(session.name, session.value, session.options);

  redirect(next);
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const next = typeof sp?.next === 'string' ? sp.next : '/';

  return (
    <main className="p-6 max-w-sm mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Log in</h1>
      <form action={login} className="space-y-3">
        <input type="hidden" name="next" value={next} />
        <label className="block">
          <span className="font-medium">Email</span>
          <input name="email" type="email" className="border rounded p-2 w-full" required />
        </label>
        <label className="block">
          <span className="font-medium">Password</span>
          <input name="password" type="password" className="border rounded p-2 w-full" required />
        </label>
        <button className="px-4 py-2 rounded bg-black text-white">Sign in</button>
      </form>
      <p className="text-xs text-gray-500">
        Use the credentials set in your env: <code>ADMIN_EMAIL</code> &amp; <code>ADMIN_PASSWORD</code>.
      </p>
    </main>
  );
}
