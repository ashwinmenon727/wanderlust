import { prisma } from '../prisma.js';

export async function migrateItineraries() {
  console.log('Migrating itinerary JSON to ItineraryEntry records...');

  const packages = await prisma.tourPackage.findMany({
    include: { itineraryEntries: true },
  });

  let migratedCount = 0;

  for (const pkg of packages) {
    if (pkg.itineraryEntries.length > 0) {
      continue; // already has entries
    }

    const rawItinerary = pkg.itinerary as any;
    if (Array.isArray(rawItinerary) && rawItinerary.length > 0) {
      for (const item of rawItinerary) {
        await prisma.itineraryEntry.upsert({
          where: {
            packageId_dayNumber: {
              packageId: pkg.id,
              dayNumber: item.day || 1,
            },
          },
          update: {
            title: item.title || `Day ${item.day}`,
            description: item.description || '',
            activities: Array.isArray(item.activities) ? item.activities : [],
            mealsIncluded: item.mealsIncluded || 'Breakfast',
            accommodation: item.accommodation || null,
            orderIndex: item.day || 1,
          },
          create: {
            packageId: pkg.id,
            dayNumber: item.day || 1,
            title: item.title || `Day ${item.day}`,
            description: item.description || '',
            activities: Array.isArray(item.activities) ? item.activities : [],
            mealsIncluded: item.mealsIncluded || 'Breakfast',
            accommodation: item.accommodation || null,
            orderIndex: item.day || 1,
          },
        });
      }
      migratedCount++;
    }
  }

  console.log(`✅ Migrated itineraries for ${migratedCount} packages.`);
}

migrateItineraries()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
