import { seedEvents } from './seedEvents';
import { seedStatus } from './seedStatus';
import { seedUser } from './seedUser';
import { seedVenues } from './seedVenues';

async function seedAll() {
  await seedUser();
  await seedStatus();
  await seedVenues();
  seedEvents();
}

seedAll()
  .then(() => console.log('Seeding completed.'))
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
