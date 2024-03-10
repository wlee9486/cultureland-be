// src/db/prisma/seedAll.ts

import { seedEvents } from './seedEvents';
import { seedStatus } from './seedStatus';
import { seedVenues } from './seedVenues';

async function seedAll() {
  await seedStatus();
  await seedVenues();
  await seedEvents();
}

seedAll()
  .then(() => console.log('Seeding completed.'))
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
