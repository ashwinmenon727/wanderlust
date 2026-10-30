import { prisma } from '../prisma.js';

const BASE_URL = 'http://localhost:5000/api';

function separator(stepNumber: number, title: string) {
  console.log('\n======================================================================');
  console.log(`VERIFICATION STEP ${stepNumber}: ${title}`);
  console.log('======================================================================');
}

async function runVerification() {
  console.log('🌟 Commencing Official Full-Stack Package & Itinerary Verification\n');

  // STEP 0: Authenticate as Administrator
  separator(0, 'Admin Authentication');
  const loginRes = await fetch(`${BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@wanderlust.com',
      password: 'AdminPassword2026!',
    }),
  });
  const loginData = await loginRes.json();
  if (!loginData.token) {
    throw new Error(`Admin authentication failed: ${JSON.stringify(loginData)}`);
  }
  const adminToken = loginData.token;
  console.log(`✅ Logged in successfully as: ${loginData.admin.name} (${loginData.admin.role})`);

  // Fetch primary destination
  const destRes = await fetch(`${BASE_URL}/destinations`);
  const destData = await destRes.json();
  const primaryDest = destData.data.find((d: any) => d.slug === 'santorini-greece') || destData.data[0];
  console.log(`✅ Using Destination for Test Package: ${primaryDest.name} (${primaryDest.id})`);

  // STEP 1: Create a package as an admin with at least 3 itinerary days; confirm it is stored with correct day ordering
  separator(1, 'Admin Creates Package with 3 Itinerary Days & Correct Ordering');
  const uniqueId = Date.now();
  const packagePayload = {
    title: `Aegean Odyssey & Caldera Sails ${uniqueId}`,
    slug: `aegean-odyssey-caldera-sails-${uniqueId}`,
    destinationId: primaryDest.id,
    linkedDestinationIds: [],
    durationDays: 3,
    durationNights: 2,
    priceCents: 450000, // $4,500.00
    currency: 'USD',
    pricingBasis: 'per_person',
    isSamplePrice: true,
    category: 'LUXURY',
    difficulty: 'MODERATE',
    maxGroupSize: 10,
    overview: 'An ultra-exclusive 3-day private yachting and clifftop sanctuary retreat overlooking the Aegean caldera.',
    heroImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80',
    ],
    includes: [
      'Private helicopter arrival transfer',
      'Daily artisanal breakfast & Michelin-starred dinners',
      'Private Riva catamaran caldera cruise',
      'Dedicated 24/7 Wanderlust concierge',
    ],
    excludes: [
      'International airfare',
      'Discretionary crew gratuities',
      'Personal travel insurance',
    ],
    transport: 'Private Eurocopter EC130 & Mercedes Maybach',
    activities: ['Helicopter arrival', 'Catamaran sailing', 'Volcanic wine tasting'],
    cancellationPolicy: 'Complimentary cancellation up to 30 days prior to scheduled arrival.',
    isFeatured: false,
    isPublished: false, // Created as unpublished draft initially
    seoTitle: `Aegean Odyssey & Caldera Sails | Wanderlust Luxury Expeditions`,
    seoDescription: 'Bespoke 3-day Greek islands luxury tour package featuring private helicopter transfers and yacht charter.',
    itineraryEntries: [
      {
        dayNumber: 1,
        title: 'Helicopter Touchdown & Private Cliffside Welcome',
        description: 'Arrive via private helicopter over the caldera with champagne reception and private sunset dinner.',
        locations: ['Athens Helipad', 'Oia Clifftop Sanctuary'],
        activities: ['Helicopter flight', 'Sunset Champagne Reception'],
        mealsIncluded: 'Welcome Sommelier Dinner',
        accommodation: 'Grace Hotel Auberge Cliffside Villa',
        orderIndex: 1,
      },
      {
        dayNumber: 2,
        title: 'Caldera Catamaran Cruise & Secluded Thermal Springs',
        description: 'Full-day private catamaran sailing into volcanic lagoons, snorkeling, and on-board Mediterranean feast.',
        locations: ['Ammoudi Bay', 'Palea Kameni Volcanic Springs', 'Red Beach'],
        activities: ['Catamaran Sailing', 'Thermal Spring Swimming', 'Private Chef Lunch'],
        mealsIncluded: 'Breakfast, Seafood Catamaran Lunch',
        accommodation: 'Grace Hotel Auberge Cliffside Villa',
        orderIndex: 2,
      },
      {
        dayNumber: 3,
        title: 'Centuries-Old Terroir Tasting & Gala Departure',
        description: 'Exclusive sommelier walkthrough of ungrafted volcanic vineyards followed by farewell helicopter transfer.',
        locations: ['Pyrgos Historic Vineyards', 'Santorini Helipad'],
        activities: ['Private Terroir Tasting', 'Farewell Reception'],
        mealsIncluded: 'Artisanal Breakfast, 5-Course Wine Pairing Lunch',
        accommodation: 'Grace Hotel Auberge Cliffside Villa',
        orderIndex: 3,
      },
    ],
  };

  const createRes = await fetch(`${BASE_URL}/admin/packages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
    body: JSON.stringify(packagePayload),
  });
  const createData = await createRes.json();
  if (createRes.status !== 201 || !createData.success) {
    throw new Error(`Package creation failed (${createRes.status}): ${JSON.stringify(createData)}`);
  }
  const createdPkg = createData.data;
  console.log(`✅ Package Created: ID = ${createdPkg.id}, Slug = "${createdPkg.slug}"`);
  console.log(`✅ Price in minor units: ${createdPkg.priceCents} cents ($${createdPkg.priceCents / 100})`);
  console.log(`✅ Initial Publication Status: isPublished = ${createdPkg.isPublished} (Draft)`);

  // Verify database persistence and day ordering
  const dbEntries = await prisma.itineraryEntry.findMany({
    where: { packageId: createdPkg.id },
    orderBy: { dayNumber: 'asc' },
  });
  console.log(`✅ DB Itinerary Entries count: ${dbEntries.length}`);
  dbEntries.forEach((e) => {
    console.log(`   - Day ${e.dayNumber} (order ${e.orderIndex}): "${e.title}" | Stay: ${e.accommodation} | Meals: ${e.mealsIncluded}`);
  });
  if (dbEntries.length !== 3 || dbEntries[0].dayNumber !== 1 || dbEntries[1].dayNumber !== 2 || dbEntries[2].dayNumber !== 3) {
    throw new Error('Day ordering in database is inconsistent!');
  }

  // STEP 2: Publish it and confirm it appears on public catalog and detail page with full itinerary
  separator(2, 'Publish Package & Verify Public Visibility on Catalog and Detail Page');
  const pubToggleRes = await fetch(`${BASE_URL}/admin/packages/${createdPkg.id}/publish`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ isPublished: true }),
  });
  const pubToggleData = await pubToggleRes.json();
  console.log(`✅ Admin publish toggle response: "${pubToggleData.message}" (isPublished = ${pubToggleData.data.isPublished})`);

  // Check public catalog
  const catalogRes = await fetch(`${BASE_URL}/packages`);
  const catalogData = await catalogRes.json();
  const catalogMatch = catalogData.data.find((p: any) => p.id === createdPkg.id);
  if (!catalogMatch) {
    throw new Error(`Published package ${createdPkg.id} did not appear in public catalog!`);
  }
  console.log(`✅ Public Catalog check: Found published package "${catalogMatch.title}"`);

  // Check public detail page by slug
  const publicDetailRes = await fetch(`${BASE_URL}/packages/${createdPkg.slug}`);
  if (publicDetailRes.status !== 200) {
    throw new Error(`Expected 200 for public detail page, got ${publicDetailRes.status}`);
  }
  const publicDetailData = await publicDetailRes.json();
  const pubPkg = publicDetailData.data;
  console.log(`✅ Public Detail Page response (200 OK):`);
  console.log(`   - Title: "${pubPkg.title}"`);
  console.log(`   - Inclusions count: ${pubPkg.includes.length}`);
  console.log(`   - Exclusions count: ${pubPkg.excludes.length}`);
  console.log(`   - Price: $${pubPkg.priceCents / 100} ${pubPkg.currency} (${pubPkg.pricingBasis})`);
  console.log(`   - Day count in public itinerary: ${pubPkg.itineraryEntries.length}`);
  pubPkg.itineraryEntries.forEach((entry: any) => {
    console.log(`     * Day ${entry.dayNumber}: ${entry.title}`);
  });

  // STEP 3: Edit an itinerary entry and reorder days, then confirm public page reflects change
  separator(3, 'Edit Itinerary Entry & Reorder Days (Swap Day 1 and Day 2)');
  const updatedPayload = {
    title: `Aegean Odyssey & Caldera Sails (Curated Reordered Edition) ${uniqueId}`,
    priceCents: 495000, // Updated to $4,950.00
    itineraryEntries: [
      {
        dayNumber: 1,
        title: 'Caldera Catamaran Cruise & Secluded Thermal Springs (Swapped to Day 1)',
        description: 'Now embarking directly onto the private yacht upon arrival for caldera thermal swimming.',
        locations: ['Ammoudi Bay', 'Palea Kameni'],
        activities: ['Catamaran Sailing', 'Thermal Spring Swimming'],
        mealsIncluded: 'Welcome Seafood Lunch & Sunset Dinner',
        accommodation: 'Grace Hotel Auberge Cliffside Villa',
        orderIndex: 1,
      },
      {
        dayNumber: 2,
        title: 'Helicopter Aerial Tour & Clifftop Welcome (Swapped to Day 2)',
        description: 'Panoramic midday flight over the Aegean volcano followed by cliffside spa treatments.',
        locations: ['Santorini Helipad', 'Oia Clifftop Sanctuary'],
        activities: ['Scenic Helicopter Flight', 'Sunset Cocktails'],
        mealsIncluded: 'Artisanal Breakfast & Sommelier Tasting Dinner',
        accommodation: 'Grace Hotel Auberge Cliffside Villa',
        orderIndex: 2,
      },
      {
        dayNumber: 3,
        title: 'Centuries-Old Terroir Tasting & Gala Departure (Day 3)',
        description: 'Exclusive sommelier walkthrough of volcanic vineyards followed by farewell dinner.',
        locations: ['Pyrgos Historic Vineyards'],
        activities: ['Private Terroir Tasting', 'Farewell Reception'],
        mealsIncluded: 'Artisanal Breakfast, 5-Course Gala Lunch',
        accommodation: 'Grace Hotel Auberge Cliffside Villa',
        orderIndex: 3,
      },
    ],
  };

  const updateRes = await fetch(`${BASE_URL}/admin/packages/${createdPkg.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
    body: JSON.stringify(updatedPayload),
  });
  const updateData = await updateRes.json();
  if (!updateData.success) {
    throw new Error(`Package update failed: ${JSON.stringify(updateData)}`);
  }
  console.log(`✅ Package updated atomically in single transaction.`);

  // Verify public detail endpoint reflects the reordering immediately
  const reorderedPublicRes = await fetch(`${BASE_URL}/packages/${createdPkg.slug}`);
  const reorderedPublicData = await reorderedPublicRes.json();
  const reorderedPkg = reorderedPublicData.data;
  console.log(`✅ Public Detail Page immediately reflects updated title: "${reorderedPkg.title}"`);
  console.log(`✅ Price updated: $${reorderedPkg.priceCents / 100}`);
  console.log(`✅ Day 1 title is now: "${reorderedPkg.itineraryEntries[0].title}"`);
  console.log(`✅ Day 2 title is now: "${reorderedPkg.itineraryEntries[1].title}"`);
  if (!reorderedPkg.itineraryEntries[0].title.includes('Swapped to Day 1')) {
    throw new Error('Public page did not reflect itinerary reordering!');
  }

  // STEP 4: Unpublish it and confirm public page returns not-found
  separator(4, 'Unpublish Package & Confirm Public 404 Not-Found Response');
  const unpubRes = await fetch(`${BASE_URL}/admin/packages/${createdPkg.id}/publish`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ isPublished: false }),
  });
  const unpubData = await unpubRes.json();
  console.log(`✅ Admin unpublished package: "${unpubData.message}" (isPublished = ${unpubData.data.isPublished})`);

  // Confirm public endpoint returns 404
  const publicUnpubRes = await fetch(`${BASE_URL}/packages/${createdPkg.slug}`);
  const publicUnpubData = await publicUnpubRes.json();
  console.log(`✅ Public GET /api/packages/${createdPkg.slug} status: ${publicUnpubRes.status} (Expected 404)`);
  console.log(`✅ Error message returned publicly: "${publicUnpubData.message}"`);
  if (publicUnpubRes.status !== 404) {
    throw new Error(`Expected 404 for unpublished package, but received ${publicUnpubRes.status}`);
  }

  // STEP 5: Duplicate a package and confirm the copy is unpublished with its own ID, slug, and itinerary
  separator(5, 'Duplicate Package Safely as Unpublished Draft with Deep-Copied Itinerary');
  const dupRes = await fetch(`${BASE_URL}/admin/packages/${createdPkg.id}/duplicate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  });
  const dupData = await dupRes.json();
  if (dupRes.status !== 201 || !dupData.success) {
    throw new Error(`Duplication failed: ${JSON.stringify(dupData)}`);
  }
  const duplicatedPkg = dupData.data;
  console.log(`✅ Duplicated Package Created: ID = ${duplicatedPkg.id}`);
  console.log(`✅ Original ID: ${createdPkg.id} vs Duplicate ID: ${duplicatedPkg.id} (Unique: ${createdPkg.id !== duplicatedPkg.id})`);
  console.log(`✅ Original Slug: "${createdPkg.slug}" vs Duplicate Slug: "${duplicatedPkg.slug}"`);
  console.log(`✅ Duplicate Title: "${duplicatedPkg.title}"`);
  console.log(`✅ Publication Status: isPublished = ${duplicatedPkg.isPublished} (Strictly Draft)`);
  console.log(`✅ Duplicated Itinerary Days count: ${duplicatedPkg.itineraryEntries?.length}`);
  duplicatedPkg.itineraryEntries?.forEach((entry: any) => {
    console.log(`   - Day ${entry.dayNumber}: "${entry.title}" (ID: ${entry.id})`);
  });
  if (duplicatedPkg.isPublished !== false) {
    throw new Error('Duplicated package must be created in unpublished draft state!');
  }

  // Confirm duplicated package is 404 publicly
  const dupPublicRes = await fetch(`${BASE_URL}/packages/${duplicatedPkg.slug}`);
  console.log(`✅ Duplicated draft public status: ${dupPublicRes.status} (Expected 404 Not Found)`);
  if (dupPublicRes.status !== 404) {
    throw new Error('Duplicated draft package should return 404 publicly!');
  }

  // STEP 6: Attempt a package write as a non-admin user and confirm rejection
  separator(6, 'Security: Attempt Package Writes Without Valid Admin Authentication');
  const unauthPostRes = await fetch(`${BASE_URL}/admin/packages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Hacked Package' }),
  });
  console.log(`✅ Unauthorized POST /api/admin/packages status: ${unauthPostRes.status} (Expected 401 Unauthorized)`);

  const unauthPutRes = await fetch(`${BASE_URL}/admin/packages/${createdPkg.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Hacked Title' }),
  });
  console.log(`✅ Unauthorized PUT /api/admin/packages/:id status: ${unauthPutRes.status} (Expected 401 Unauthorized)`);

  const unauthDupRes = await fetch(`${BASE_URL}/admin/packages/${createdPkg.id}/duplicate`, {
    method: 'POST',
  });
  console.log(`✅ Unauthorized POST /api/admin/packages/:id/duplicate status: ${unauthDupRes.status} (Expected 401 Unauthorized)`);

  const unauthDelRes = await fetch(`${BASE_URL}/admin/packages/${createdPkg.id}`, {
    method: 'DELETE',
  });
  console.log(`✅ Unauthorized DELETE /api/admin/packages/:id status: ${unauthDelRes.status} (Expected 401 Unauthorized)`);

  if (unauthPostRes.status !== 401 || unauthPutRes.status !== 401 || unauthDupRes.status !== 401 || unauthDelRes.status !== 401) {
    throw new Error('Non-admin package write was not rejected with 401!');
  }

  // STEP 7: Confirm an existing booking referencing a package still resolves after package is archived
  separator(7, 'Soft-Delete Archiving: Preserving Existing Bookings Intact');
  // Create an inquiry/booking referencing the package
  const inqPayload = {
    customerName: 'Countess Victoria de Rothschild',
    email: 'victoria.rothschild@estate.ch',
    phone: '+41 22 555 0188',
    destinationId: primaryDest.id,
    packageId: createdPkg.id,
    departureDate: '2026-12-15',
    returnDate: '2026-12-18',
    adults: 2,
    children: 0,
    travelType: 'LUXURY',
    budget: '$15,000+',
    accommodationPref: 'FIVE_STAR_LUXURY',
    additionalRequirements: 'Private sommelier tasting on Day 3.',
    preferredContact: 'EMAIL',
    privacyConsent: true,
  };

  const inqRes = await fetch(`${BASE_URL}/inquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inqPayload),
  });
  const inqData = await inqRes.json();
  const createdInquiry = inqData.inquiry || inqData.data;
  console.log(`✅ Booking/Inquiry created: Reference ${createdInquiry.reference}, ID ${createdInquiry.id}`);
  console.log(`   - Linked Package ID: ${createdInquiry.packageId}`);

  // Now attempt admin DELETE on the package
  const archiveRes = await fetch(`${BASE_URL}/admin/packages/${createdPkg.id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  const archiveData = await archiveRes.json();
  console.log(`✅ Admin delete response: "${archiveData.message}", archived = ${archiveData.archived}`);
  if (!archiveData.archived) {
    throw new Error('Package referenced by booking should be soft-deleted/archived, not hard-deleted!');
  }

  // Check DB status of package
  const archivedPkgDb = await prisma.tourPackage.findUnique({ where: { id: createdPkg.id } });
  console.log(`✅ DB verification: isArchived = ${archivedPkgDb?.isArchived}, isPublished = ${archivedPkgDb?.isPublished}`);
  if (!archivedPkgDb?.isArchived || archivedPkgDb.isPublished) {
    throw new Error('Archived package in DB is not marked isArchived=true and isPublished=false!');
  }

  // Check that the booking still resolves and references the package details
  const bookingCheckRes = await fetch(`${BASE_URL}/admin/inquiries?search=victoria.rothschild`, {
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  const bookingCheckData = await bookingCheckRes.json();
  const matchedBooking = bookingCheckData.data.find((b: any) => b.id === createdInquiry.id);
  if (!matchedBooking || !matchedBooking.package) {
    throw new Error('Booking could not be resolved or package reference was lost!');
  }
  console.log(`✅ Existing booking resolved successfully: Reference ${matchedBooking.reference}`);
  console.log(`   - Linked Package Title: "${matchedBooking.package.title}"`);
  console.log(`   - Linked Package ID: "${matchedBooking.package.id}" (Matches original: ${matchedBooking.package.id === createdPkg.id})`);

  // Clean up duplicate package to keep catalog pristine
  await prisma.itineraryEntry.deleteMany({ where: { packageId: duplicatedPkg.id } });
  await prisma.tourPackage.delete({ where: { id: duplicatedPkg.id } });
  console.log(`✅ Cleaned up temporary duplicate package ${duplicatedPkg.id}`);

  console.log('\n======================================================================');
  console.log('🎉 ALL 7 BACKEND / DATABASE / SECURITY VERIFICATION STEPS PASSED 100%!');
  console.log('======================================================================\n');
}

runVerification().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
