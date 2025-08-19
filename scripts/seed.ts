import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  await db.property.upsert({
    where: { slug: 'seaside-boutique' },
    update: {},
    create: {
      slug: 'seaside-boutique',
      name: 'Seaside Boutique',
      wifiSsid: 'SEASIDE_GUEST',
      wifiPass: 'sea12345',
      rules: 'No smoking. Quiet hours 22:00–07:00. Be kind to neighbors.',
    }
  });
  console.log('Seeded.');
}

main().finally(()=>db.$disconnect());
