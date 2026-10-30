import bcrypt from 'bcryptjs';
import { prisma } from '../prisma.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

import { seedCatalog } from './seedCatalog.js';

async function seed() {
  logger.info('🌱 Beginning database seeding for Wanderlust Luxury Travel...');

  // 0. Seed Comprehensive Expanded Catalog (34 Destinations, Verified Hotels, 42 Tour Packages)
  await seedCatalog();

  // 1. Seed Administrator
  const adminPasswordHash = await bcrypt.hash(env.INITIAL_ADMIN_PASSWORD, 12);
  const admin = await prisma.admin.upsert({
    where: { email: env.INITIAL_ADMIN_EMAIL.toLowerCase() },
    update: { passwordHash: adminPasswordHash, name: env.INITIAL_ADMIN_NAME },
    create: {
      email: env.INITIAL_ADMIN_EMAIL.toLowerCase(),
      passwordHash: adminPasswordHash,
      name: env.INITIAL_ADMIN_NAME,
      role: 'SUPERADMIN',
    },
  });
  logger.info(`Admin seeded: ${admin.email}`);

  // 2. Seed Destinations
  const destinationsData = [
    {
      slug: 'santorini-greece',
      name: 'Santorini',
      country: 'Greece',
      continent: 'Europe',
      tagline: 'Azure Caldera Horizons & Sun-Drenched Cycladic Splendor',
      description: 'Perched high above the Aegean Sea, Santorini is the jewel of the Cyclades. Experience bespoke private catamaran cruises, cliffside infinity pools in Oia, world-class volcanic vineyards, and unforgettable golden sunsets.',
      heroImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1920&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'
      ],
      bestTimeToVisit: 'April to October',
      language: 'Greek & English',
      currency: 'EUR (€)',
      rating: 4.9,
      reviewsCount: 142,
      isFeatured: true,
      startingPrice: 4200,
      highlights: [
        'Private Sunset Sailing on a 50ft Luxury Catamaran',
        'Helicopter Transfer from Athens to Private Cliffside Villa',
        'Exclusive Wine Tasting with Master Sommelier at Domaine Sigalas',
        'Private Archaeology Guide at Ancient Akrotiri'
      ]
    },
    {
      slug: 'kyoto-japan',
      name: 'Kyoto & Hakone',
      country: 'Japan',
      continent: 'Asia',
      tagline: 'Centuries of Zen Mastery, Ancient Cedar Groves & Ryokan Luxury',
      description: 'Immerse yourself in timeless Japanese refinement. Stroll through secluded bamboo forests before dawn, participate in private private tea ceremonies in 400-year-old gardens, and soak in private hot springs overlooking Mount Fuji.',
      heroImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1920&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80'
      ],
      bestTimeToVisit: 'March to May & October to November',
      language: 'Japanese & English',
      currency: 'JPY (¥)',
      rating: 5.0,
      reviewsCount: 189,
      isFeatured: true,
      startingPrice: 6500,
      highlights: [
        'Private Evening Access to UNESCO World Heritage Temples',
        'Michelin 3-Star Kaiseki Dinner Hosted by Renowned Shokunin',
        'Private Onsen Ryokan Suite in Hakone Facing Fuji',
        'Master Swordsmith Katana Demonstration in Kameoka'
      ]
    },
    {
      slug: 'serengeti-tanzania',
      name: 'Serengeti & Ngorongoro',
      country: 'Tanzania',
      continent: 'Africa',
      tagline: 'The Great Migration, Untamed Savannahs & Ultra-Luxury Tented Camps',
      description: 'Witness the planet’s greatest wildlife spectacle from bespoke luxury canvas suites. Savor sunrise hot air balloon safaris over endless plains, guided bush walks with Maasai elders, and sundowners around roaring open fires under starlit African skies.',
      heroImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1920&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80'
      ],
      bestTimeToVisit: 'June to October & January to March',
      language: 'Swahili & English',
      currency: 'USD ($)',
      rating: 4.95,
      reviewsCount: 118,
      isFeatured: true,
      startingPrice: 8900,
      highlights: [
        'Dawn Hot Air Balloon Safari with Champagne Bush Breakfast',
        'Exclusive Solitary Mobile Camp Tracking the Migration',
        'Ngorongoro Crater Floor Private Game Exploration',
        'Conservation Behind-the-Scenes with Wildlife Biologists'
      ]
    },
    {
      slug: 'swiss-alps-zermatt',
      name: 'Swiss Alps & Zermatt',
      country: 'Switzerland',
      continent: 'Europe',
      tagline: 'Glacier Peaks, Matterhorn Panoramas & Michelin Alpine Dining',
      description: 'Ascend to the pinnacle of mountain luxury. Traverse scenic high-altitude railways, ski pristine glacier trails beneath the Matterhorn, and unwind in private chalets featuring wood-burning fireplaces, heated outdoor pools, and private ski butlers.',
      heroImage: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1920&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'
      ],
      bestTimeToVisit: 'December to April (Ski) & July to September (Hiking)',
      language: 'German, French & English',
      currency: 'CHF (Fr)',
      rating: 4.9,
      reviewsCount: 96,
      isFeatured: true,
      startingPrice: 7400,
      highlights: [
        'Helicopter Sightseeing Around the Summit of the Matterhorn',
        'Glacier Express Excellence Class Panoramic Journey',
        'Private 5-Star Ski Guide and Alpine Mountain Hut Lunch',
        'Swiss Chocolate Atelier & Artisan Fondue Experience'
      ]
    },
    {
      slug: 'amalfi-coast-italy',
      name: 'Amalfi Coast & Capri',
      country: 'Italy',
      continent: 'Europe',
      tagline: 'Cliff-Hugging Villas, Limoncello Groves & Mediterranean Glamour',
      description: 'Experience Dolce Vita elegance along Italy’s most enchanting coastline. Cruise to Capri on a vintage Riva yacht, explore the vibrant pastel alleys of Positano, and dine on cliffside terraces perched high above the azure Tyrrhenian waters.',
      heroImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1920&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=1200&q=80'
      ],
      bestTimeToVisit: 'May to October',
      language: 'Italian & English',
      currency: 'EUR (€)',
      rating: 4.88,
      reviewsCount: 165,
      isFeatured: false,
      startingPrice: 5100,
      highlights: [
        'Private Riva Yacht Charter Around Capri and the Blue Grotto',
        'Exclusive Masterclass with a Positano Leather Craftsman',
        'Terrace Tasting at Ravello Historical Lemon Orchards',
        'Sunset Aperitivo at Le Sirenuse'
      ]
    },
    {
      slug: 'bora-bora-polynesia',
      name: 'Bora Bora & Tetiaroa',
      country: 'French Polynesia',
      continent: 'Oceania',
      tagline: 'Turquoise Lagoons, Overwater Bungalows & Coral Sanctuaries',
      description: 'Escape to ultimate tropical serenity. Settle into luxurious overwater villas with glass floor viewing panels, snorkel with gentle manta rays in crystal shallows, and indulge in Polynesian wellness rituals on private motu islands.',
      heroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=1200&q=80'
      ],
      bestTimeToVisit: 'May to October',
      language: 'French & Tahitian',
      currency: 'XPF / USD',
      rating: 4.98,
      reviewsCount: 82,
      isFeatured: true,
      startingPrice: 9800,
      highlights: [
        'Canoe-Delivered Champagne Breakfast to Your Lagoon Villa',
        'Private Coral Reef Marine Biologist Snorkel Safari',
        'Sunset Motu Dinner with Polynesian Fire Dancing',
        'Helicopter Flight Over Mount Otemanu'
      ]
    }
  ];

  for (const d of destinationsData) {
    await prisma.destination.upsert({
      where: { slug: d.slug },
      update: d,
      create: d,
    });
  }
  logger.info(`Seeded ${destinationsData.length} luxury destinations.`);

  // 3. Seed Tour Packages
  const santorini = await prisma.destination.findUnique({ where: { slug: 'santorini-greece' } });
  const kyoto = await prisma.destination.findUnique({ where: { slug: 'kyoto-japan' } });
  const serengeti = await prisma.destination.findUnique({ where: { slug: 'serengeti-tanzania' } });
  const alps = await prisma.destination.findUnique({ where: { slug: 'swiss-alps-zermatt' } });
  const amalfi = await prisma.destination.findUnique({ where: { slug: 'amalfi-coast-italy' } });
  const borabora = await prisma.destination.findUnique({ where: { slug: 'bora-bora-polynesia' } });

  const packagesData = [
    {
      slug: 'aegean-mythology-oia-retreat',
      title: 'Cycladic Grandeur: Oia Cliffside Luxury & Private Catamaran',
      destinationId: santorini!.id,
      durationDays: 7,
      durationNights: 6,
      price: 5400,
      discountPrice: 4850,
      category: 'HONEYMOON',
      difficulty: 'EASY',
      maxGroupSize: 8,
      overview: 'Spend a magnificent week immersed in Grecian luxury. Enjoy a private cave villa suite with panoramic caldera views, dedicated butler service, and private yacht charters.',
      itinerary: [
        {
          day: 1,
          title: 'Arrival in Athens & Helicopter Hop to Santorini',
          description: 'VIP meet-and-greet at Athens airport, followed by a private helicopter transfer directly to the Oia helipad and your luxury caldera villa.',
          activities: ['VIP Airport Transfer', 'Welcome Champagne Reception', 'Sunset Villa Dinner'],
          mealsIncluded: 'Dinner',
          accommodation: 'Canaves Oia Suites or Mystique Luxury Collection'
        },
        {
          day: 2,
          title: 'Akrotiri Excavations & Volcanic Vineyard Tasting',
          description: 'Private guided exploration of prehistoric Akrotiri, followed by an exclusive cellar tour and curated wine pairing.',
          activities: ['Private Archaeological Tour', '5-Course Wine Pairing Lunch', 'Evening at Leisure'],
          mealsIncluded: 'Breakfast, Lunch',
          accommodation: 'Canaves Oia Suites'
        },
        {
          day: 3,
          title: 'Full-Day Private Catamaran Cruise to Red Beach & Hot Springs',
          description: 'Sail the sparkling caldera aboard a 52ft luxury catamaran with chef on board, swim in secluded coves, and watch the legendary sunset from the bow.',
          activities: ['Snorkeling & Swimming', 'Fresh Seafood Grill', 'Open Bar', 'Sunset at Sea'],
          mealsIncluded: 'Breakfast, Lunch, Dinner',
          accommodation: 'Canaves Oia Suites'
        },
        {
          day: 4,
          title: 'Fira to Oia Scenic Hike & Traditional Villages',
          description: 'Optional scenic clifftop stroll with a private photographer, followed by afternoon visit to Pyrgos village.',
          activities: ['Private Photography Walk', 'Pyrgos Village Tour', 'Artisan Shopping'],
          mealsIncluded: 'Breakfast',
          accommodation: 'Canaves Oia Suites'
        },
        {
          day: 5,
          title: 'Holistic Spa & Thermal Bath Indulgence',
          description: 'Full morning spa rituals utilizing volcanic salts and Aegean sea herbs. Afternoon private helicopter tour over Thirassia.',
          activities: ['Signature Spa Ritual', 'Scenic Flight', 'Private Chef Dinner on Terrace'],
          mealsIncluded: 'Breakfast, Dinner',
          accommodation: 'Canaves Oia Suites'
        },
        {
          day: 6,
          title: 'Secluded Beach Day & Gourmet Finale',
          description: 'Private cabana reserved at Perivolos black sand beach with full beach club service, culminating in an exclusive dinner overlooking the caldera.',
          activities: ['Beachside Relaxation', 'Farewell 7-Course Degustation Dinner'],
          mealsIncluded: 'Breakfast, Dinner',
          accommodation: 'Canaves Oia Suites'
        },
        {
          day: 7,
          title: 'Fond Farewell & Departure',
          description: 'Private transfer to Santorini airport or private yacht terminal for your onward journey.',
          activities: ['Breakfast on Terrace', 'Private Airport Transfer'],
          mealsIncluded: 'Breakfast'
        }
      ],
      includes: [
        'Luxury Villa Suite with Private Heated Plunge Pool',
        'Private 52ft Catamaran Day Charter with Private Chef',
        'Roundtrip VIP Airport & Helicopter Transfers',
        'Daily Champagne Breakfasts and 3 Degustation Dinners',
        '24/7 Dedicated Concierge & Local Chauffeur'
      ],
      excludes: [
        'International Long-Haul Airfare',
        'Personal Souvenirs & Discretionary Gratuities',
        'Premium Rare Vintage Wines Beyond Tasting Flights'
      ],
      heroImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80'
      ],
      isFeatured: true,
      rating: 4.95,
      reviewsCount: 48,
      departureDates: ['2026-05-15', '2026-06-12', '2026-07-10', '2026-08-14', '2026-09-18']
    },
    {
      slug: 'kyoto-fuji-zen-heritage',
      title: 'Emperors & Artisans: Ultra-Luxury Kyoto & Mount Fuji Ryokan',
      destinationId: kyoto!.id,
      durationDays: 10,
      durationNights: 9,
      price: 8900,
      discountPrice: null,
      category: 'CULTURAL',
      difficulty: 'EASY',
      maxGroupSize: 6,
      overview: 'An unparalleled cultural odyssey through old Japan. Sleep on futons in historic ryokan with private open-air onsens, gain private entry to closed temples, and travel in Shinkansen Gran Class.',
      itinerary: [
        {
          day: 1,
          title: 'Tokyo Arrival to Kyoto via Shinkansen Gran Class',
          description: 'First-class train ride across Japan with Fuji views, checking into the Aman Kyoto secluded in botanical forest.',
          activities: ['Gran Class Bullet Train', 'Private Check-in at Aman Kyoto', 'Welcome Kaiseki Dinner'],
          mealsIncluded: 'Dinner',
          accommodation: 'Aman Kyoto or The Ritz-Carlton Kyoto'
        },
        {
          day: 2,
          title: 'Secret Kyoto: Exclusive Temple Access Before Public Hours',
          description: 'Special permission access to Daitoku-ji Zen gardens and private meditation session led by the abbot.',
          activities: ['Private Zen Meditation', 'Tea Ceremony with Grand Master', 'Gion Evening Geisha Dinner'],
          mealsIncluded: 'Breakfast, Lunch, Dinner',
          accommodation: 'Aman Kyoto'
        },
        {
          day: 3,
          title: 'Arashiyama Bamboo Grove & Private Boat Along Oi River',
          description: 'Early morning bamboo forest walk before crowds, followed by traditional wooden barge journey with matcha treats.',
          activities: ['Sagano Bamboo Stroll', 'River Boat Cruise', 'Michelin 2-Star Shojin Ryori Lunch'],
          mealsIncluded: 'Breakfast, Lunch',
          accommodation: 'Aman Kyoto'
        },
        {
          day: 4,
          title: 'Journey to Hakone & Mount Fuji Views',
          description: 'Chauffeured drive to the forested mountains of Hakone. Check in to Gora Kadan, former imperial villa.',
          activities: ['Lake Ashi Cruise', 'Private Onsen Soak', '10-Course Evening Feast'],
          mealsIncluded: 'Breakfast, Dinner',
          accommodation: 'Gora Kadan Ryokan'
        },
        {
          day: 5,
          title: 'Mount Fuji Scenic Flight & Contemporary Art Sanctuary',
          description: 'Morning private helicopter circuit around Mount Fuji crater, followed by Hakone Open-Air Museum VIP tour.',
          activities: ['Helicopter Sightseeing', 'VIP Art Tour', 'Hot Springs Relaxation'],
          mealsIncluded: 'Breakfast, Lunch, Dinner',
          accommodation: 'Gora Kadan Ryokan'
        }
      ],
      includes: [
        '9 Nights at Japan’s Most Prestigious Luxury Ryokan & Hotels',
        'All Shinkansen Gran Class and Private Chauffeured Transfers',
        'Daily Full Breakfast and 6 Michelin-Star / Kaiseki Dinners',
        'Private Licensed Heritage Scholar and Cultural Guide',
        'Exclusive Temple and Artisanal Workshop Permissions'
      ],
      excludes: [
        'International Flights',
        'Personal Purchases',
        'Travel Medical Insurance'
      ],
      heroImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80'
      ],
      isFeatured: true,
      rating: 5.0,
      reviewsCount: 39,
      departureDates: ['2026-04-10', '2026-05-08', '2026-10-16', '2026-11-12']
    },
    {
      slug: 'serengeti-safari-unbounded',
      title: 'Untamed Majesty: Singita Serengeti & Ngorongoro Crater Expedition',
      destinationId: serengeti!.id,
      durationDays: 8,
      durationNights: 7,
      price: 11200,
      discountPrice: 10500,
      category: 'ADVENTURE',
      difficulty: 'MODERATE',
      maxGroupSize: 6,
      overview: 'The pinnacle of African safaris. Fly between private airstrips in Cessna aircraft, track the Big Five in customized Land Cruisers, and sleep at renowned Singita luxury lodges.',
      itinerary: [
        {
          day: 1,
          title: 'Kilimanjaro to Serengeti Private Air Transfer',
          description: 'Meet upon touchdown at Kilimanjaro, board private bush flight directly into the central Serengeti plains.',
          activities: ['Scenic Bush Flight', 'Welcome Sunset Game Drive', 'Starlight Boma Dinner'],
          mealsIncluded: 'Lunch, Dinner',
          accommodation: 'Singita Sasakwa Lodge'
        },
        {
          day: 2,
          title: 'Predator Tracking & Mara River Crossing Point',
          description: 'Full day in the Grumeti Reserve witnessing lion prides, leopards in acacia trees, and vast wildebeest herds.',
          activities: ['Morning & Afternoon Game Drives', 'Bush Picnic', 'Sundowner Cocktails'],
          mealsIncluded: 'Breakfast, Lunch, Dinner',
          accommodation: 'Singita Sasakwa Lodge'
        },
        {
          day: 3,
          title: 'Dawn Hot Air Balloon Flight & Bush Champagne Breakfast',
          description: 'Float silently above the savannah at sunrise as herds stir below, landing for a white-linen bush breakfast.',
          activities: ['Hot Air Ballooning', 'Champagne Breakfast', 'Afternoon Spa & Wildlife Viewing'],
          mealsIncluded: 'Breakfast, Lunch, Dinner',
          accommodation: 'Singita Sasakwa Lodge'
        },
        {
          day: 4,
          title: 'Descent into Ngorongoro Crater Lost World',
          description: 'Transfer to the rim of Ngorongoro. Descend 2,000 feet into the UNESCO volcanic caldera to view black rhinos and flamingos.',
          activities: ['Crater Floor Game Drive', 'Lakeside Wildlife Picnic'],
          mealsIncluded: 'Breakfast, Lunch, Dinner',
          accommodation: 'Ngorongoro Crater Lodge'
        }
      ],
      includes: [
        'Luxury Lodge Suites with Private Verandas and Heated Plunge Pools',
        'All Internal Bush Charter Flights and Private 4x4 Game Vehicles',
        'All Meals, Premium Fine Wines, Spirits and Champagne',
        'National Park & Conservation Concession Fees ($1,800 value)',
        'Hot Air Balloon Safari Experience with Full Crew'
      ],
      excludes: [
        'International Long-Haul Flights',
        'Tanzanian Entry Visa',
        'Gratuities for Field Guides and Lodge Staff'
      ],
      heroImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=800&q=80'
      ],
      isFeatured: true,
      rating: 4.98,
      reviewsCount: 64,
      departureDates: ['2026-06-20', '2026-07-18', '2026-08-15', '2026-09-05', '2026-10-10']
    },
    {
      slug: 'swiss-matterhorn-heli-ski-retreat',
      title: 'Alpine Summit: Zermatt Ski Chalet & Heli-Ski Matterhorn Safari',
      destinationId: alps!.id,
      durationDays: 7,
      durationNights: 6,
      price: 8200,
      discountPrice: null,
      category: 'LUXURY',
      difficulty: 'CHALLENGING',
      maxGroupSize: 8,
      overview: 'Experience the Swiss Alps in unrivaled style. Private 5-star ski chalet with indoor pool, spa, personal chef, and Air Zermatt heli-skiing drops.',
      itinerary: [
        {
          day: 1,
          title: 'Zurich Arrival & Glacier Express Excellence Class to Zermatt',
          description: 'Board the world-famous Glacier Express Excellence Class with 5-course degustation and champagne, arriving in car-free Zermatt.',
          activities: ['Glacier Express Excellence Class', 'Private Electric Limo Transfer', 'Chalet Welcome Fondue'],
          mealsIncluded: 'Lunch, Dinner',
          accommodation: 'Chalet Zermatt Peak or The Omnia'
        },
        {
          day: 2,
          title: 'Matterhorn Glacier Paradise Skiing & Private Guide',
          description: 'Carve Europe’s highest ski runs with an ex-Olympian private instructor. Lunch at Chez Vrony high above the valley.',
          activities: ['Private Ski Guidance', 'Chez Vrony VIP Table', 'Chalet Outdoor Hot Tub Aprés-Ski'],
          mealsIncluded: 'Breakfast, Lunch, Dinner',
          accommodation: 'Chalet Zermatt Peak'
        },
        {
          day: 3,
          title: 'Air Zermatt Heli-Skiing Drop on Monte Rosa',
          description: 'Take flight from Zermatt heliport to pristine untracked powder fields on the Monte Rosa massif.',
          activities: ['Heli-Ski Flight', 'Untracked Powder Runs', 'Evening Wine Tasting with Sommelier'],
          mealsIncluded: 'Breakfast, Lunch, Dinner',
          accommodation: 'Chalet Zermatt Peak'
        }
      ],
      includes: [
        'Exclusive Private Luxury Chalet with Staff and Private Chef',
        'Glacier Express Excellence Class First-Class Rail Pass',
        'Unlimited Zermatt-Cervinia International Ski Pass',
        'Air Zermatt Heli-Skiing Experience with Mountain Guide',
        'All Daily Gourmet Meals and Selected Cellar Wines'
      ],
      excludes: [
        'Ski Gear (High-End Rental Available On-Site)',
        'International Flights',
        'Specialty Vintage Spirits'
      ],
      heroImage: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=800&q=80'
      ],
      isFeatured: false,
      rating: 4.92,
      reviewsCount: 31,
      departureDates: ['2026-12-14', '2026-01-18', '2026-02-15', '2026-03-08']
    },
    {
      slug: 'bora-bora-lagoon-paradise',
      title: 'South Pacific Sanctuary: Bora Bora Overwater Villa & Private Motu',
      destinationId: borabora!.id,
      durationDays: 8,
      durationNights: 7,
      price: 12500,
      discountPrice: 11400,
      category: 'HONEYMOON',
      difficulty: 'EASY',
      maxGroupSize: 4,
      overview: 'The epitome of romantic isolation. Wake up above translucent turquoise water, enjoy breakfast brought by outrigger canoe, and dine privately on your own deserted islet.',
      itinerary: [
        {
          day: 1,
          title: 'Tahiti to Bora Bora Watercraft Arrival',
          description: 'Scenic inter-island flight with views of atolls, followed by private yacht transfer to Four Seasons Resort Bora Bora.',
          activities: ['Lagoon Yacht Transfer', 'Overwater Villa Check-In', 'Polynesian Welcome Massage'],
          mealsIncluded: 'Dinner',
          accommodation: 'Four Seasons Resort Bora Bora'
        },
        {
          day: 2,
          title: 'Lagoon Exploration & Ray Encounter',
          description: 'Snorkel in warm shallows surrounded by graceful stingrays, reef sharks, and schools of butterfly fish.',
          activities: ['Guided Lagoon Snorkel', 'Outrigger Canoe Ride', 'Beachside Grill'],
          mealsIncluded: 'Breakfast, Lunch',
          accommodation: 'Four Seasons Resort Bora Bora'
        },
        {
          day: 3,
          title: 'Castaway Day on a Private Deserted Motu',
          description: 'A dedicated boat drops you off at a private islet for a day of pure seclusion with a personal chef and musician.',
          activities: ['Private Motu Picnic', 'Champagne Bar on the Beach', 'Sunset Cruise'],
          mealsIncluded: 'Breakfast, Lunch, Dinner',
          accommodation: 'Four Seasons Resort Bora Bora'
        }
      ],
      includes: [
        '7 Nights in Premier Otemanu Overwater Bungalow Suite',
        'Daily Canoe Champagne Breakfast and Gourmet Dinners',
        'Private Inter-Island Flights and Luxury Boat Transfers',
        'Exclusive Motu Islet Reservation for One Full Day',
        'Couples Polynesian Monoi Oil Spa Treatment'
      ],
      excludes: ['International Flights to Papeete', 'Gratuities'],
      heroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=800&q=80'
      ],
      isFeatured: true,
      rating: 4.99,
      reviewsCount: 52,
      departureDates: ['2026-06-05', '2026-07-03', '2026-08-07', '2026-09-11', '2026-10-09']
    }
  ];

  for (const p of packagesData) {
    await prisma.tourPackage.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }
  logger.info(`Seeded ${packagesData.length} tour packages.`);

  // 4. Seed Testimonials
  const testimonialsData = [
    {
      customerName: 'Eleanor & Marcus Vance',
      location: 'London, United Kingdom',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      rating: 5,
      reviewText: 'Wanderlust curated our 15th anniversary in Santorini down to the exact second. From the helicopter transfer right to our private villa terrace to the solitary sunset catamaran sail, we did not have to think about a single detail. Truly peerless concierge service.',
      tripTitle: 'Cycladic Grandeur Honeymoon',
      tripDate: 'September 2025',
      isFeatured: true,
      isApproved: true,
    },
    {
      customerName: 'Jonathan Sterling',
      location: 'New York, USA',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      rating: 5,
      reviewText: 'The Singita safari in the Serengeti surpassed all expectations. Having a dedicated tracker and private bush flight meant we spent hours with migrating lion prides without another vehicle in sight. Worth every penny of the investment.',
      tripTitle: 'Untamed Serengeti Expedition',
      tripDate: 'July 2025',
      isFeatured: true,
      isApproved: true,
    },
    {
      customerName: 'Dr. Alistair & Mei Chen',
      location: 'Singapore',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      rating: 5,
      reviewText: 'Entering the Kyoto temple complex at sunrise before the general public was a spiritual experience I will never forget. Wanderlust’s connections in Japan opened doors that standard luxury agencies simply cannot access.',
      tripTitle: 'Kyoto Zen & Mount Fuji Ryokan',
      tripDate: 'November 2025',
      isFeatured: true,
      isApproved: true,
    },
    {
      customerName: 'Victoria & Henrik Lindqvist',
      location: 'Stockholm, Sweden',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      rating: 5,
      reviewText: 'Our private chalet in Zermatt was magnificent. Fresh croissants and espresso on the balcony watching the morning sun illuminate the Matterhorn was breathtaking. The ski guide was patient with our teens and exhilarating on the glaciers.',
      tripTitle: 'Alpine Summit Matterhorn Safari',
      tripDate: 'February 2026',
      isFeatured: true,
      isApproved: true,
    }
  ];

  for (const t of testimonialsData) {
    await prisma.testimonial.create({ data: t });
  }
  logger.info(`Seeded ${testimonialsData.length} client testimonials.`);

  // 5. Seed Initial Sample Inquiries (to provide immediate live data in Admin dashboard)
  const sampleInquiry = await prisma.inquiry.upsert({
    where: { reference: 'WND-2026-DEMO1' },
    update: {},
    create: {
      reference: 'WND-2026-DEMO1',
      customerName: 'Lord Harrison Montgomery',
      email: 'harrison.montgomery@estate.co.uk',
      phone: '+44 20 7946 0991',
      destinationId: santorini!.id,
      packageId: (await prisma.tourPackage.findFirst({ where: { destinationId: santorini!.id } }))?.id,
      departureDate: '2026-06-12',
      returnDate: '2026-06-19',
      adults: 2,
      children: 0,
      travelType: 'HONEYMOON',
      budget: '$15,000 - $25,000',
      accommodationPref: 'FIVE_STAR_LUXURY',
      additionalRequirements: 'Requires airport helicopter transfer and strict gluten-free dining for spouse. Interested in booking private vineyard for exclusive dinner.',
      preferredContact: 'EMAIL',
      privacyConsent: true,
      status: 'IN_REVIEW',
      internalNotes: 'Contacted guest office on Oct 28. Villa selection narrowed down to Canaves Oia Epitome. Awaiting sommelier confirmation.',
      followUpDate: '2026-11-05',
    },
  });

  await prisma.emailNotificationLog.create({
    data: {
      inquiryId: sampleInquiry.id,
      recipientEmail: 'harrison.montgomery@estate.co.uk',
      recipientType: 'CUSTOMER',
      templateName: 'customer_inquiry_confirmation',
      status: 'SENT',
      attempts: 1,
      sentAt: new Date(),
    },
  });

  logger.info('✅ Database seeding finished successfully!');
  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
