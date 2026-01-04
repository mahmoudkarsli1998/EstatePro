// 10+ complete projects
export const projects = [
  {
    id: 1,
    name: "Sunset Towers",
    slug: "sunset-towers",
    description: "Luxury residential towers in prime location",
    address: "123 Ocean Drive, Miami Beach",
    location: { lat: 25.7617, lng: -80.1918 },
    status: "ready",
    status: "ready",
    type: "keys",
    propertyType: "residential",
    listingType: "sale",
    createdById: 1, // Default Admin
    status: "active",
    privateNotes: [],
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750"
    ],
    stats: { totalUnits: 120, available: 45, sold: 75 },
    amenities: ["Swimming Pool", "Gym", "Parking", "Security 24/7"],
    deliveryDate: "2026-12-31",
    priceRange: { min: 250000, max: 1500000 },
    developer: { id: 1, name: "Premium Developers" },
    phases: [
      { id: 1, name: "Phase 1", deliveryDate: "2026-06-30" },
      { id: 2, name: "Phase 2", deliveryDate: "2026-12-31" }
    ]
  },
  {
    id: 2,
    name: "Ocean Breeze Villas",
    slug: "ocean-breeze",
    description: "Exclusive beachfront villas with private access",
    address: "456 Coastal Hwy, Malibu",
    location: { lat: 34.0259, lng: -118.7798 },
    status: "active",
    status: "active",
    type: "developer",
    propertyType: "residential",
    listingType: "sale",
    createdById: 1,
    status: "active",
    privateNotes: [],
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227"
    ],
    stats: { totalUnits: 20, available: 5, sold: 15 },
    amenities: ["Private Beach", "Concierge", "Smart Home", "Infinity Pool"],
    deliveryDate: "2025-08-15",
    priceRange: { min: 2500000, max: 5000000 },
    developer: { id: 2, name: "Coastal Living" },
    phases: [
      { id: 3, name: "Phase 1", deliveryDate: "2025-08-15" }
    ]
  },
  {
    id: 3,
    name: "Urban Heights",
    slug: "urban-heights",
    description: "Modern apartments in the heart of the city",
    address: "789 Downtown Ave, New York",
    location: { lat: 40.7128, lng: -74.0060 },
    status: "upcoming",
    status: "upcoming",
    type: "invest",
    propertyType: "commercial",
    listingType: "sale",
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
      "https://images.unsplash.com/photo-1460317442991-0ec209397118"
    ],
    stats: { totalUnits: 200, available: 200, sold: 0 },
    amenities: ["Rooftop Garden", "Co-working Space", "Metro Access", "Pet Friendly"],
    deliveryDate: "2027-03-01",
    priceRange: { min: 500000, max: 1200000 },
    developer: { id: 1, name: "Premium Developers" },
    phases: [
      { id: 4, name: "Tower A", deliveryDate: "2027-03-01" },
      { id: 5, name: "Tower B", deliveryDate: "2027-09-01" }
    ]
  },
  {
    id: 4,
    name: "Green Valley Estate",
    slug: "green-valley",
    description: "Eco-friendly community surrounded by nature",
    address: "321 Forest Rd, Portland",
    location: { lat: 45.5152, lng: -122.6784 },
    status: "active",
    status: "active",
    type: "offer",
    propertyType: "residential",
    listingType: "rent",
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233"
    ],
    stats: { totalUnits: 80, available: 30, sold: 50 },
    amenities: ["Solar Power", "Community Garden", "Trails", "Recycling Center"],
    deliveryDate: "2026-05-20",
    priceRange: { min: 400000, max: 900000 },
    developer: { id: 3, name: "EcoBuilders" },
    phases: [
      { id: 6, name: "Phase 1", deliveryDate: "2026-05-20" }
    ]
  },
  {
    id: 5,
    name: "The Skyline",
    slug: "the-skyline",
    description: "Iconic skyscraper with panoramic city views",
    address: "555 High St, Chicago",
    location: { lat: 41.8781, lng: -87.6298 },
    status: "resale",
    status: "resale",
    type: "keys",
    propertyType: "commercial",
    listingType: "sale",
    images: [
      "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8",
      "https://images.unsplash.com/photo-1430285561322-7808604715df"
    ],
    stats: { totalUnits: 150, available: 0, sold: 150 },
    amenities: ["Sky Lounge", "Valet Parking", "Spa", "Cinema"],
    deliveryDate: "2024-12-01",
    priceRange: { min: 800000, max: 3000000 },
    developer: { id: 2, name: "Coastal Living" },
    phases: [
      { id: 7, name: "Full Project", deliveryDate: "2024-12-01" }
    ]
  },
  {
    id: 6,
    name: "Lakeside Serenity",
    slug: "lakeside-serenity",
    description: "Peaceful living by the lake with modern amenities",
    address: "88 Lakeview Dr, Seattle",
    location: { lat: 47.6062, lng: -122.3321 },
    status: "unlocked",
    status: "unlocked",
    type: "developer",
    propertyType: "residential",
    listingType: "sale",
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b91d",
      "https://images.unsplash.com/photo-1516156008625-3a9d6067fab5"
    ],
    stats: { totalUnits: 60, available: 20, sold: 40 },
    amenities: ["Private Dock", "Clubhouse", "Tennis Courts", "Walking Trails"],
    deliveryDate: "2026-08-01",
    priceRange: { min: 600000, max: 1500000 },
    developer: { id: 3, name: "EcoBuilders" },
    phases: [
      { id: 8, name: "Phase 1", deliveryDate: "2026-08-01" }
    ]
  },
  {
    id: 7,
    name: "Desert Mirage",
    slug: "desert-mirage",
    description: "Contemporary desert homes with sustainable design",
    address: "777 Sand Dune Way, Phoenix",
    location: { lat: 33.4484, lng: -112.0740 },
    status: "upcoming",
    status: "upcoming",
    type: "offer",
    propertyType: "residential",
    listingType: "rent",
    images: [
      "https://images.unsplash.com/photo-1513584685908-2274653fa36f",
      "https://images.unsplash.com/photo-1505577058444-a3dab90d4253"
    ],
    stats: { totalUnits: 90, available: 90, sold: 0 },
    amenities: ["Desert Garden", "Solar Roofs", "Pool", "Hiking Access"],
    deliveryDate: "2027-01-01",
    priceRange: { min: 450000, max: 850000 },
    developer: { id: 3, name: "EcoBuilders" },
    phases: [
      { id: 9, name: "Phase 1", deliveryDate: "2027-01-01" }
    ]
  },
  {
    id: 8,
    name: "Marina Heights",
    slug: "marina-heights",
    description: "Premium waterfront apartments with yacht club access",
    address: "100 Marina Blvd, Dubai",
    location: { lat: 25.0773, lng: 55.1396 },
    status: "active",
    type: "keys",
    images: [
      "https://images.unsplash.com/photo-1574362848149-11496d93a7c7",
      "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e"
    ],
    stats: { totalUnits: 250, available: 80, sold: 170 },
    amenities: ["Yacht Club", "Infinity Pool", "Mall Access", "Concierge"],
    deliveryDate: "2025-11-30",
    priceRange: { min: 500000, max: 2000000 },
    developer: { id: 1, name: "Premium Developers" },
    phases: [{ id: 10, name: "Tower 1", deliveryDate: "2025-11-30" }]
  },
  {
    id: 9,
    name: "Hillside Retreat",
    slug: "hillside-retreat",
    description: "Secluded villas nestled in the rolling hills",
    address: "42 Hilltop Rd, Tuscany",
    location: { lat: 43.7696, lng: 11.2558 },
    status: "upcoming",
    type: "developer",
    images: [
      "https://images.unsplash.com/photo-1600596542815-2a4d9fddace7",
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739"
    ],
    stats: { totalUnits: 40, available: 40, sold: 0 },
    amenities: ["Vineyard", "Private Pool", "Gated Community", "Nature Trails"],
    deliveryDate: "2026-09-15",
    priceRange: { min: 1200000, max: 3500000 },
    developer: { id: 2, name: "Coastal Living" },
    phases: [{ id: 11, name: "Phase 1", deliveryDate: "2026-09-15" }]
  },
  {
    id: 10,
    name: "Central Park Lofts",
    slug: "central-park-lofts",
    description: "Industrial style lofts overlooking the city park",
    address: "88 Central Ave, London",
    location: { lat: 51.5074, lng: -0.1278 },
    status: "resale",
    type: "invest",
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea"
    ],
    stats: { totalUnits: 65, available: 12, sold: 53 },
    amenities: ["Gym", "Rooftop Terrace", "Co-working", "Cafe"],
    deliveryDate: "2024-06-01",
    priceRange: { min: 750000, max: 1300000 },
    developer: { id: 1, name: "Premium Developers" },
    phases: [{ id: 12, name: "Completed", deliveryDate: "2024-06-01" }]
  },
  {
    id: 11,
    name: "Golden Sands Resort",
    slug: "golden-sands",
    description: "Luxury resort living with private beach access",
    address: "220 Beach Rd, Gold Coast",
    location: { lat: -28.0167, lng: 153.4000 },
    status: "active",
    type: "offer",
    images: [
      "https://images.unsplash.com/photo-1582719508461-905c673771fd",
      "https://images.unsplash.com/photo-1590490360182-f33cfe293d23"
    ],
    stats: { totalUnits: 300, available: 45, sold: 255 },
    amenities: ["Beach Club", "Water Sports", "Spa", "Kids Club"],
    deliveryDate: "2025-05-01",
    priceRange: { min: 400000, max: 950000 },
    developer: { id: 3, name: "EcoBuilders" },
    phases: [{ id: 13, name: "Tower A", deliveryDate: "2025-05-01" }]
  },

  {
    id: 12,
    name: "Mountain Retreat",
    slug: "mountain-retreat",
    description: "Cozy cabins and lodges in the mountains",
    address: "99 Alpine Rd, Denver",
    location: { lat: 39.7392, lng: -104.9903 },
    status: "ready",
    type: "invest",
    images: [
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739",
      "https://images.unsplash.com/photo-1449156493391-d2cfa28e468b"
    ],
    stats: { totalUnits: 40, available: 10, sold: 30 },
    amenities: ["Ski Access", "Fireplace", "Hot Tub", "Hiking Trails"],
    deliveryDate: "2025-11-01",
    priceRange: { min: 500000, max: 1200000 },
    developer: { id: 2, name: "Coastal Living" },
    phases: [
      { id: 10, name: "Phase 1", deliveryDate: "2025-11-01" }
    ]
  },
  {
    id: 13,
    name: "The Harbor",
    slug: "the-harbor",
    description: "Waterfront apartments with marina access",
    address: "22 Bay St, San Francisco",
    location: { lat: 37.7749, lng: -122.4194 },
    status: "active",
    type: "keys",
    images: [
      "https://images.unsplash.com/photo-1515263487990-61b07816b324",
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6"
    ],
    stats: { totalUnits: 100, available: 15, sold: 85 },
    amenities: ["Marina", "Seafood Restaurant", "Gym", "Concierge"],
    deliveryDate: "2025-06-01",
    priceRange: { min: 900000, max: 2500000 },
    developer: { id: 1, name: "Premium Developers" },
    phases: [
      { id: 11, name: "Phase 1", deliveryDate: "2025-06-01" }
    ]
  },
  {
    id: 14,
    name: "Royal Gardens",
    slug: "royal-gardens",
    description: "Aristocratic living in expansive gardens",
    address: "10 Palace Ave, London",
    location: { lat: 51.5074, lng: -0.1278 },
    status: "unlocked",
    type: "invest",
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
      "https://images.unsplash.com/photo-1600596542815-27bfef402399"
    ],
    stats: { totalUnits: 50, available: 50, sold: 0 },
    amenities: ["Formal Gardens", "Butler Service", "Library", "Tea Room"],
    deliveryDate: "2027-05-01",
    priceRange: { min: 1500000, max: 5000000 },
    developer: { id: 1, name: "Premium Developers" },
    phases: [
      { id: 12, name: "Phase 1", deliveryDate: "2027-05-01" }
    ]
  },
  // Generated Projects 15-33
  ...Array.from({ length: 19 }, (_, i) => ({
    id: 15 + i,
    name: `Luxury Residence ${15 + i}`,
    slug: `luxury-residence-${15 + i}`,
    description: `Experience the epitome of luxury living in Residence ${12 + i}. Featuring state-of-the-art amenities and breathtaking views.`,
    address: `${100 + i} Exclusive Blvd, Prime City`,
    location: { lat: 25.0 + (i * 0.1), lng: 55.0 + (i * 0.1) },
    status: i % 3 === 0 ? "active" : i % 3 === 1 ? "upcoming" : "resale",
    type: i % 4 === 0 ? "keys" : i % 4 === 1 ? "invest" : i % 4 === 2 ? "offer" : "developer",
    propertyType: ["apartment", "villa", "penthouse", "studio"][i % 4],
    images: [
      `https://images.unsplash.com/photo-${['1600585154340-be6161a56a0c', '1600596542815-2a4d9fddace7', '1600607687939-ce8a6c25118c'][i % 3]}`,
      `https://images.unsplash.com/photo-${['1512917774080-9991f1c4c750', '1600566753086-00f18fb6b3ea', '1564013799919-ab600027ffc6'][i % 3]}`
    ],
    stats: { totalUnits: 100 + (i * 10), available: 20 + i, sold: 80 + (i * 9) },
    amenities: ["infinity Pool", "Smart Home System", "Private Gym", "24/7 Concierge"],
    deliveryDate: `202${5 + (i % 3)}-01-01`,
    priceRange: { min: 500000 + (i * 10000), max: 1500000 + (i * 50000) },
    developer: { id: (i % 3) + 1, name: ["Premium Developers", "Coastal Living", "EcoBuilders"][i % 3] },
    phases: [{ id: 20 + i, name: "Phase 1", deliveryDate: `202${5 + (i % 3)}-01-01` }]
  }))
];

// Blocks
export const blocks = [
  { id: 1, projectId: 1, name: "Block A", phaseId: 1 },
  { id: 2, projectId: 1, name: "Block B", phaseId: 1 },
  { id: 3, projectId: 2, name: "Villas Phase 1", phaseId: 3 },
  { id: 4, projectId: 3, name: "Tower A", phaseId: 4 },
  { id: 5, projectId: 3, name: "Tower B", phaseId: 5 },
  { id: 6, projectId: 4, name: "Green Block", phaseId: 6 },
  { id: 7, projectId: 5, name: "Main Tower", phaseId: 7 },
  { id: 8, projectId: 6, name: "Lake View Block", phaseId: 8 },
  { id: 9, projectId: 7, name: "Desert Block", phaseId: 9 },
  { id: 10, projectId: 8, name: "Alpine Lodge", phaseId: 10 },
  { id: 11, projectId: 9, name: "Harbor View", phaseId: 11 },
  { id: 12, projectId: 10, name: "Royal Wing", phaseId: 12 }
];

// 20+ units distributed across projects
export const units = [
  // Project 1: Sunset Towers
  {
    id: 1,
    projectId: 1,
    blockId: 1,
    number: "A-101",
    floor: 1,
    type: "apartment",
    area_m2: 120,
    price: 350000,
    status: "available",
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"],
    features: { bedrooms: 2, bathrooms: 2, parking: 1, view: "Sea View", furnished: false, balcony: true },
    notes: "Corner unit"
  },
  {
    id: 2,
    projectId: 1,
    blockId: 1,
    number: "A-102",
    floor: 1,
    type: "apartment",
    area_m2: 110,
    price: 320000,
    status: "sold",
    buildingCode: 'B1',
    buildingFloors: 12,
    city: 'new_cairo',
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"],
    features: { bedrooms: 2, bathrooms: 2, parking: 1, view: "Garden View", furnished: true, balcony: true },
    notes: "Sold to Mr. Smith"
  },
  {
    id: 15, // New unit, re-using id 1 from instruction as 15 to avoid conflict
    number: 'APT-101',
    projectId: 1,
    phaseId: 1,
    blockId: 1,
    type: 'apartment',
    status: 'available',
    floor: 1,
    area_m2: 150,
    price: 3500000,
    buildingCode: 'B1',
    buildingFloors: 12,
    city: 'new_cairo',
    latitude: '30.0444',
    longitude: '31.2357',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
    ],
    features: {
      bedrooms: 3,
      bathrooms: 2,
      parking: true,
      view: 'garden',
      furnished: true,
      balcony: true
    }
  },
  {
    id: 16, // New unit, re-using id 2 from instruction as 16 to avoid conflict
    number: 'VL-55',
    projectId: 2,
    phaseId: 2,
    blockId: 2,
    type: 'villa',
    status: 'sold',
    floor: 0,
    area_m2: 450,
    price: 12500000,
    buildingCode: 'V55',
    buildingFloors: 3,
    city: 'sheikh_zayed',
    latitude: '30.0444',
    longitude: '31.2357',
    images: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80'
    ],
    features: {
      bedrooms: 5,
      bathrooms: 4,
      parking: true,
      view: 'pool',
      furnished: false,
      balcony: true
    }
  },
  {
    id: 17, // New unit, re-using id 3 from instruction as 17 to avoid conflict
    number: 'APT-205',
    projectId: 1,
    phaseId: 1,
    blockId: 1,
    type: 'apartment',
    status: 'rented',
    floor: 2,
    area_m2: 120,
    price: 2800000,
    buildingCode: 'B2',
    buildingFloors: 10,
    city: 'new_cairo',
    latitude: '30.0074',
    longitude: '31.4913',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
    ],
    features: {
      bedrooms: 2,
      bathrooms: 2,
      parking: true,
      view: 'street',
      furnished: true,
      balcony: true
    }
  },
  {
    id: 18, // New unit, re-using id 4 from instruction as 18 to avoid conflict
    number: 'OFF-301',
    projectId: 3,
    phaseId: 3,
    blockId: 4,
    type: 'office',
    status: 'available',
    floor: 3,
    area_m2: 80,
    price: 1500000,
    buildingCode: 'O1',
    buildingFloors: 5,
    city: 'new_capital',
    latitude: '30.0131',
    longitude: '31.7089',
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'
    ],
    features: {
      bedrooms: 0,
      bathrooms: 1,
      parking: true,
      view: 'city',
      furnished: true,
      balcony: false
    }
  },
  {
    id: 19, // New unit, re-using id 5 from instruction as 19 to avoid conflict
    number: 'S-22',
    projectId: 2,
    phaseId: 2,
    blockId: 3,
    type: 'commercial',
    status: 'available',
    floor: 0,
    area_m2: 60,
    price: 4500000,
    buildingCode: 'Mall1',
    buildingFloors: 2,
    city: 'sheikh_zayed',
    latitude: '30.0626',
    longitude: '30.9318',
    titleAr: 'محل تجاري 60م في مول العرب',
    images: [
      'https://images.unsplash.com/photo-1555617778-02518510b9fa?auto=format&fit=crop&w=800&q=80'
    ],
    features: {
      bedrooms: 0,
      bathrooms: 0,
      parking: true,
      view: 'street',
      furnished: false,
      balcony: false
    }
  },
  {
    id: 3,
    projectId: 1,
    blockId: 2,
    number: "B-501",
    floor: 5,
    type: "penthouse",
    area_m2: 175,
    price: 13000000,
    status: "available",
    titleAr: "شقه 175م جاردن متشطبه في ماونتن فيو هايد بارك",
    locationAr: "التجمع الخامس",
    images: ["https://images.unsplash.com/photo-1512918760513-95f192972701"],
    features: { bedrooms: 3, bathrooms: 3, parking: 2, view: "Garden View", furnished: true, balcony: true },
    notes: "Premium finish"
  },
  // Project 2: Ocean Breeze
  {
    id: 4,
    projectId: 2,
    blockId: 3,
    number: "V-01",
    floor: 0,
    type: "villa",
    area_m2: 150,
    price: 12000000,
    status: "available",
    titleAr: "شاليه أرضي في لافيستا 6 - موقع مميز",
    locationAr: "العين السخنة",
    buildingCode: 'V-01',
    buildingFloors: 2,
    city: 'miami',
    images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811"],
    features: { bedrooms: 3, bathrooms: 2, parking: 1, view: "Sea View", furnished: false, balcony: true },
    notes: "Direct beach access"
  },
  {
    id: 5,
    projectId: 2,
    blockId: 3,
    number: "V-02",
    floor: 0,
    type: "villa",
    area_m2: 265,
    price: 41598001,
    status: "reserved",
    titleAr: "تاون هاوس للبيع في وودفيل 265 م",
    locationAr: "6 أكتوبر",
    images: ["https://images.unsplash.com/photo-1613977257363-707ba9348227"],
    features: { bedrooms: 4, bathrooms: 5, parking: 2, view: "Park View", furnished: false, balcony: true },
    notes: "Reserved by Mrs. Johnson"
  },
  // Project 3: Urban Heights
  {
    id: 6,
    projectId: 3,
    blockId: 4,
    number: "1001",
    floor: 10,
    type: "studio",
    area_m2: 45,
    price: 500000,
    status: "available",
    images: ["https://images.unsplash.com/photo-1536376072261-38c75010e6c9"],
    features: { bedrooms: 0, bathrooms: 1, parking: 0, view: "City View", furnished: true, balcony: false },
    notes: "Great investment"
  },
  {
    id: 7,
    projectId: 3,
    blockId: 4,
    number: "1002",
    floor: 10,
    type: "apartment",
    area_m2: 80,
    price: 750000,
    status: "available",
    images: ["https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6"],
    features: { bedrooms: 1, bathrooms: 1, parking: 1, view: "City View", furnished: false, balcony: true },
    notes: "Spacious layout"
  },
  // Project 4: Green Valley
  {
    id: 8,
    projectId: 4,
    blockId: 6,
    number: "G-12",
    floor: 0,
    type: "apartment",
    area_m2: 95,
    price: 450000,
    status: "available",
    images: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb"],
    features: { bedrooms: 2, bathrooms: 1, parking: 1, view: "Forest View", furnished: false, balcony: true },
    notes: "Quiet location"
  },
  // Project 5: The Skyline
  {
    id: 9,
    projectId: 5,
    blockId: 7,
    number: "4501",
    floor: 45,
    type: "penthouse",
    area_m2: 300,
    price: 2800000,
    status: "sold",
    images: ["https://images.unsplash.com/photo-1512918760513-95f192972701"],
    features: { bedrooms: 3, bathrooms: 3, parking: 2, view: "Lake View", furnished: true, balcony: true },
    notes: "Sold out"
  },
  // Additional Units
  {
    id: 10,
    projectId: 6,
    blockId: 8,
    number: "L-22",
    floor: 2,
    type: "apartment",
    area_m2: 130,
    price: 700000,
    status: "available",
    images: ["https://images.unsplash.com/photo-1560185007-cde436f6a4d0"],
    features: { bedrooms: 3, bathrooms: 2, parking: 2, view: "Lake View", furnished: false, balcony: true },
    notes: "Spacious balcony"
  },
  {
    id: 11,
    projectId: 7,
    blockId: 9,
    number: "D-05",
    floor: 1,
    type: "villa",
    area_m2: 200,
    price: 450000,
    status: "available",
    images: ["https://images.unsplash.com/photo-1580587771525-78b9dba3b91d"],
    features: { bedrooms: 3, bathrooms: 2, parking: 2, view: "Desert View", furnished: false, balcony: true },
    notes: "Sustainable design"
  },
  {
    id: 12,
    projectId: 8,
    blockId: 10,
    number: "C-09",
    floor: 0,
    type: "apartment",
    area_m2: 85,
    price: 550000,
    status: "reserved",
    images: ["https://images.unsplash.com/photo-1510798831971-661eb04b3739"],
    features: { bedrooms: 2, bathrooms: 1, parking: 1, view: "Mountain View", furnished: true, balcony: true },
    notes: "Cozy fireplace"
  },
  {
    id: 13,
    projectId: 9,
    blockId: 11,
    number: "H-33",
    floor: 3,
    type: "apartment",
    area_m2: 110,
    price: 1100000,
    status: "available",
    images: ["https://images.unsplash.com/photo-1515263487990-61b07816b324"],
    features: { bedrooms: 2, bathrooms: 2, parking: 1, view: "Marina View", furnished: false, balcony: true },
    notes: "Luxury finish"
  },
  {
    id: 14,
    projectId: 10,
    blockId: 12,
    number: "R-01",
    floor: 1,
    type: "apartment",
    area_m2: 150,
    price: 1800000,
    status: "available",
    images: ["https://images.unsplash.com/photo-1600596542815-27bfef402399"],
    features: { bedrooms: 3, bathrooms: 3, parking: 2, view: "Garden View", furnished: true, balcony: true },
    notes: "Exclusive access"
  }
];

// Locations
export const locations = [
  {
    id: 1,
    name: "New Cairo",
    slug: "new_cairo",
    city: "Cairo",
    country: "Egypt",
    lat: 30.0444,
    lng: 31.2357,
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80",
    description: "A modern city with luxurious compounds and vast green spaces."
  },
  {
    id: 2,
    name: "Sheikh Zayed",
    slug: "sheikh_zayed",
    city: "Giza",
    country: "Egypt",
    lat: 30.0444,
    lng: 30.9318,
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80",
    description: "Premium residential area with high-end amenities."
  },
  {
    id: 3,
    name: "New Capital",
    slug: "new_capital",
    city: "Cairo",
    country: "Egypt",
    lat: 30.0131,
    lng: 31.7089,
    image: "https://images.unsplash.com/photo-1590490360182-f33cfe293d23?auto=format&fit=crop&w=800&q=80",
    description: "The administrative and financial hub of the future."
  },
  {
    id: 4,
    name: "North Coast",
    slug: "north_coast",
    city: "Alexandria",
    country: "Egypt",
    lat: 30.8256,
    lng: 28.9567,
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
    description: "Beautiful beaches and summer luxury resorts."
  },
  {
    id: 5,
    name: "Dubai Marina",
    slug: "dubai_marina",
    city: "Dubai",
    country: "UAE",
    lat: 25.0773,
    lng: 55.1396,
    image: "https://images.unsplash.com/photo-1512453979798-5ea936a79402?auto=format&fit=crop&w=800&q=80",
    description: "Luxury waterfront living in the heart of Dubai."
  }
];

// Developers
export const developers = [
  {
    id: 1,
    name: "Premium Developers",
    contactEmail: "info@premiumdev.com",
    contactPhone: "+1-555-0100",
    logo: "https://via.placeholder.com/150",
    projects: [1, 3, 7, 9, 10]
  },
  {
    id: 2,
    name: "Coastal Living",
    contactEmail: "sales@coastalliving.com",
    contactPhone: "+1-555-0200",
    logo: "https://via.placeholder.com/150",
    projects: [2, 5, 8]
  },
  {
    id: 3,
    name: "EcoBuilders",
    contactEmail: "contact@ecobuilders.com",
    contactPhone: "+1-555-0300",
    logo: "https://via.placeholder.com/150",
    projects: [4, 6]
  },
  {
    id: 4,
    name: "Palm Hills Developments",
    description: "A leading real estate developer in Egypt, creating integrated residential, commercial, and resort communities.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Palm_Hills_Developments_Logo.jpg/800px-Palm_Hills_Developments_Logo.jpg", // Placeholder or real logic if available
    contactEmail: "info@palmhills.com",
    contactPhone: "19014",
    address: "Smart Village, A-B 28, km 28 Cairo-Alex Desert Road",
    website: "https://www.palmhillsdevelopments.com",
    established: "2005",
    projects: [1, 9] // Assuming linking to some projects
  },
  {
    id: 5,
    name: "Sodic",
    description: "SODIC is one of the country's leading real estate development companies, transforming the way people live and work.",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/SODIC_Logo.png/220px-SODIC_Logo.png",
    contactEmail: "sales@sodic.com",
    contactPhone: "16220",
    address: "Km 38 Cairo-Alexandria Desert Road, Sheikh Zayed City",
    website: "https://sodic.com",
    established: "1996",
    projects: [10, 11]
  },
  {
    id: 6,
    name: "Mountain View",
    description: "Driven by innovation, Mountain View is among Egypt's leading private property development companies.",
    logo: "https://mountainviewegypt.com/assets/images/logo.png",
    contactEmail: "info@mountainviewegypt.com",
    contactPhone: "16201",
    address: "Cairo Business Plaza, New Cairo",
    website: "https://mountainviewegypt.com",
    established: "2005",
    projects: [12, 13]
  }
];

// Agents
export const agents = [
  {
    id: 1,
    userId: 3,
    name: "John Smith",
    email: "john@company.com",
    phone: "+1-555-0101",
    assignedProjects: [1, 2, 3, 6],
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
  },
  {
    id: 2,
    userId: 4,
    name: "Jane Doe",
    email: "jane@company.com",
    phone: "+1-555-0102",
    assignedProjects: [4, 5, 7, 8],
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
  },
  {
    id: 3,
    userId: 5,
    name: "Mike Ross",
    email: "mike@company.com",
    phone: "+1-555-0103",
    assignedProjects: [1, 5, 9, 10],
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
  },
  {
    id: 4,
    userId: 6,
    name: "Sarah Johnson",
    email: "sarah.j@company.com",
    phone: "+1-555-0104",
    assignedProjects: [2, 4, 6],
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
  },
  {
    id: 5,
    userId: 7,
    name: "David Chen",
    email: "david.c@company.com",
    phone: "+1-555-0105",
    assignedProjects: [3, 7, 9],
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
  },
  {
    id: 6,
    userId: 8,
    name: "Emily Wilson",
    email: "emily.w@company.com",
    phone: "+1-555-0106",
    assignedProjects: [1, 8, 10],
    avatar: "https://images.unsplash.com/photo-1598550874175-4d7112ee7f38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
  },
  {
    id: 7,
    userId: 9,
    name: "Robert Taylor",
    email: "robert.t@company.com",
    phone: "+1-555-0107",
    assignedProjects: [2, 5],
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
  },
  {
    id: 8,
    userId: 10,
    name: "Jessica Martinez",
    email: "jessica.m@company.com",
    phone: "+1-555-0108",
    assignedProjects: [3, 4, 6],
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
  }
];

// Users with Roles
export const users = [
  // Admin
  {
    id: 1,
    name: "Admin User",
    fullName: "Admin User",
    email: "admin@company.com",
    role: "admin",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
    joinDate: "2025-01-01",
    lastLogin: "2025-12-07T08:00:00Z"
  },
  // Manager
  {
    id: 2,
    name: "Manager User",
    fullName: "Manager User",
    email: "manager@company.com",
    role: "manager",
    status: "active",
    department: "Sales",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    joinDate: "2025-01-15"
  },
  // Sales
  {
    id: 3,
    name: "Sales User",
    fullName: "Sales User",
    email: "sales@estatepro.com",
    role: "sales",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    joinDate: "2025-02-01",
    assignedLeads: 12,
    activities: [
      { id: 1, action: "UNIT_CREATED", details: "Created unit 101 in Sunset Towers", date: "2025-01-02T10:00:00Z" },
      { id: 2, action: "STATUS_UPDATE", details: "Changed status of Unit 205 to Reserved", date: "2025-01-01T14:30:00Z" },
      { id: 3, action: "NOTE_ADDED", details: "Added private note to Unit 302", date: "2024-12-30T09:15:00Z" },
      { id: 4, action: "FOLLOW_UP", details: "Call with Sarah Johnson - High Interest", date: "2024-12-29T11:20:00Z" },
      { id: 5, action: "STATUS_UPDATE", details: "Marked Lead Michael Brown as Contacted", date: "2024-12-28T16:45:00Z" },
      { id: 6, action: "UNIT_UPDATED", details: "Updated pricing for Ocean Breeze Villas", date: "2024-12-27T10:00:00Z" },
      { id: 7, action: "FOLLOW_UP", details: "Email sent to Jessica Miller regarding floor plans", date: "2024-12-26T14:30:00Z" },
      { id: 8, action: "NOTE_ADDED", details: "Internal note: Client prefers corner units", date: "2024-12-25T09:00:00Z" }
    ]
  },
  // Agent
  {
    id: 4,
    name: "Agent User",
    fullName: "Agent User",
    email: "agent@estatepro.com",
    role: "agent",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
    joinDate: "2025-02-10",
    assignedProjects: [1, 2]
  },
  // Lead / Guest
  // Additional Agents
  {
    id: 5,
    name: "Mike Ross",
    fullName: "Mike Ross",
    email: "mike@company.com",
    role: "agent",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
    joinDate: "2025-02-15"
  },
  {
    id: 6,
    name: "Sarah Johnson",
    fullName: "Sarah Johnson",
    email: "sarah.j@company.com",
    role: "agent",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
    joinDate: "2025-02-16"
  },
  {
    id: 7,
    name: "David Chen",
    fullName: "David Chen",
    email: "david.c@company.com",
    role: "agent",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
    joinDate: "2025-02-17"
  },
  {
    id: 8,
    name: "Emily Wilson",
    fullName: "Emily Wilson",
    email: "emily.w@company.com",
    role: "agent",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1598550874175-4d7112ee7f38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
    joinDate: "2025-02-18"
  },
  {
    id: 9,
    name: "Robert Taylor",
    fullName: "Robert Taylor",
    email: "robert.t@company.com",
    role: "agent",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
    joinDate: "2025-02-19"
  },
  {
    id: 10,
    name: "Jessica Martinez",
    fullName: "Jessica Martinez",
    email: "jessica.m@company.com",
    role: "agent",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
    joinDate: "2025-02-20"
  },
  {
    id: 11,
    name: "John Doe",
    fullName: "John Doe",
    email: "john@gmail.com",
    role: "user",
    status: "active",
    joinDate: "2025-03-01"
  }
];

// Re-export specific groups for backward compatibility
export const admins = users.filter(u => u.role === 'admin');
export const managers = users.filter(u => u.role === 'manager');
// Note: agents array in mockData was more complex, matching userId to agentId. 
// For simplicity in this mock transition, we'll keep the separate agents array 
// but ensure the users specific to agents exist in the main users array above if needed.
// However, the existing 'agents' array (lines 852-925) is separate. 
// We should probably alias it or leave it be if it's used differently.
// For now, we leave the 'agents' export from lines 852-925 alone and only replace 'users', 'managers', 'admins'.

// Leads
export const leads = [
  {
    id: 1,
    projectId: 1,
    unitId: 1,
    name: "Sarah Johnson",
    email: "sarah@email.com",
    phone: "+1-555-0200",
    message: "I'm interested in viewing this unit",
    assignedAgentId: 3,
    status: "new",
    source: "website",
    createdAt: "2025-11-28T14:30:00Z",
    followUps: [{ id: 1, date: "2025-11-29T10:00:00Z", note: "Initial contact made via email.", performedById: 1 }]
  },
  {
    id: 2,
    projectId: 2,
    unitId: 4,
    name: "Michael Brown",
    email: "michael@email.com",
    phone: "+1-555-0201",
    message: "Is the price negotiable?",
    assignedAgentId: 3,
    status: "contacted",
    source: "referral",
    createdAt: "2025-11-27T09:15:00Z",
    followUps: []
  },
  {
    id: 3,
    projectId: 3,
    unitId: 6,
    name: "Emily Davis",
    email: "emily@email.com",
    phone: "+1-555-0202",
    message: "When is the delivery date?",
    assignedAgentId: 3,
    status: "qualified",
    source: "social_media",
    createdAt: "2025-11-26T16:45:00Z",
    followUps: []
  },
  {
    id: 4,
    projectId: 1,
    unitId: 2,
    name: "David Wilson",
    email: "david@email.com",
    phone: "+1-555-0203",
    message: "I want to buy this unit.",
    assignedAgentId: 3,
    status: "closed",
    source: "website",
    createdAt: "2025-11-20T11:00:00Z",
    followUps: []
  },
  {
    id: 5,
    projectId: 6,
    unitId: 10,
    name: "Jessica Miller",
    email: "jessica@email.com",
    phone: "+1-555-0204",
    message: "Can I see the floor plan?",
    assignedAgentId: 3,
    status: "new",
    source: "website",
    createdAt: "2025-11-29T10:00:00Z",
    followUps: []
  },
  {
    id: 6,
    projectId: 7,
    unitId: 11,
    name: "Robert Taylor",
    email: "robert@email.com",
    phone: "+1-555-0205",
    message: "Is there a payment plan?",
    assignedAgentId: 3,
    status: "contacted",
    source: "referral",
    createdAt: "2025-11-28T15:30:00Z",
    followUps: []
  },
  {
    id: 7,
    projectId: 8,
    unitId: 12,
    name: "Linda Anderson",
    email: "linda@email.com",
    phone: "+1-555-0206",
    message: "I love the mountain view!",
    assignedAgentId: 3,
    status: "qualified",
    source: "social_media",
    createdAt: "2025-11-27T12:00:00Z",
    followUps: []
  },
  {
    id: 8,
    projectId: 9,
    unitId: 13,
    name: "James Thomas",
    email: "james@email.com",
    phone: "+1-555-0207",
    message: "Is the marina accessible?",
    assignedAgentId: 3,
    status: "new",
    source: "website",
    createdAt: "2025-11-26T09:00:00Z",
    followUps: []
  }
];
// Cities / Locations
export const cities = [
  { id: 'cairo', nameAr: 'القاهرة', nameEn: 'Cairo' },
  { id: 'giza', nameAr: 'الجيزة', nameEn: 'Giza' },
  { id: 'alexandria', nameAr: 'الإسكندرية', nameEn: 'Alexandria' },
  { id: 'north_coast', nameAr: 'الساحل الشمالي', nameEn: 'North Coast' },
  { id: 'sokhna', nameAr: 'العين السخنة', nameEn: 'Ain Sokhna' },
  { id: 'hurghada', nameAr: 'الغردقة', nameEn: 'Hurghada' },
  { id: 'sharm', nameAr: 'شرم الشيخ', nameEn: 'Sharm El Sheikh' },
  { id: 'el_gouna', nameAr: 'الجونة', nameEn: 'El Gouna' },
  { id: 'maadi', nameAr: 'المعادي', nameEn: 'Maadi' },
  { id: 'new_cairo', nameAr: 'القاهرة الجديدة', nameEn: 'New Cairo' },
  { id: 'sheikh_zayed', nameAr: 'الشيخ زايد', nameEn: 'Sheikh Zayed' },
  { id: 'october', nameAr: '6 أكتوبر', nameEn: '6th of October' },
  { id: 'new_capital', nameAr: 'العاصمة الإدارية', nameEn: 'New Capital' }
];
