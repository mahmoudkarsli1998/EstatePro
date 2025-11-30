// 5-7 complete projects
export const projects = [
  {
    id: 1,
    name: "Sunset Towers",
    slug: "sunset-towers",
    description: "Luxury residential towers in prime location",
    address: "123 Ocean Drive, Miami Beach",
    location: { lat: 25.7617, lng: -80.1918 },
    status: "active",
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
    status: "sold_out",
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
  }
];

// 20-30 units distributed across projects
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
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"],
    features: { bedrooms: 2, bathrooms: 2, parking: 1, view: "Garden View", furnished: true, balcony: true },
    notes: "Sold to Mr. Smith"
  },
  {
    id: 3,
    projectId: 1,
    blockId: 2,
    number: "B-501",
    floor: 5,
    type: "penthouse",
    area_m2: 250,
    price: 1200000,
    status: "available",
    images: ["https://images.unsplash.com/photo-1512918760513-95f192972701"],
    features: { bedrooms: 4, bathrooms: 3, parking: 2, view: "Panoramic Sea", furnished: true, balcony: true },
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
    area_m2: 400,
    price: 3500000,
    status: "available",
    images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811"],
    features: { bedrooms: 5, bathrooms: 5, parking: 3, view: "Ocean Front", furnished: false, balcony: true },
    notes: "Direct beach access"
  },
  {
    id: 5,
    projectId: 2,
    blockId: 3,
    number: "V-02",
    floor: 0,
    type: "villa",
    area_m2: 380,
    price: 3200000,
    status: "reserved",
    images: ["https://images.unsplash.com/photo-1613977257363-707ba9348227"],
    features: { bedrooms: 4, bathrooms: 4, parking: 2, view: "Ocean Front", furnished: false, balcony: true },
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
  // More units...
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
  }
];

// 3-5 developers
export const developers = [
  {
    id: 1,
    name: "Premium Developers",
    contactEmail: "info@premiumdev.com",
    contactPhone: "+1-555-0100",
    logo: "https://via.placeholder.com/150",
    projects: [1, 3]
  },
  {
    id: 2,
    name: "Coastal Living",
    contactEmail: "sales@coastalliving.com",
    contactPhone: "+1-555-0200",
    logo: "https://via.placeholder.com/150",
    projects: [2, 5]
  },
  {
    id: 3,
    name: "EcoBuilders",
    contactEmail: "contact@ecobuilders.com",
    contactPhone: "+1-555-0300",
    logo: "https://via.placeholder.com/150",
    projects: [4]
  }
];

// 5-7 agents
export const agents = [
  {
    id: 1,
    userId: 3,
    name: "John Smith",
    email: "john@company.com",
    phone: "+1-555-0101",
    assignedProjects: [1, 2, 3],
    avatar: "https://i.pravatar.cc/150?img=1"
  },
  {
    id: 2,
    userId: 4,
    name: "Jane Doe",
    email: "jane@company.com",
    phone: "+1-555-0102",
    assignedProjects: [4, 5],
    avatar: "https://i.pravatar.cc/150?img=5"
  },
  {
    id: 3,
    userId: 5,
    name: "Mike Ross",
    email: "mike@company.com",
    phone: "+1-555-0103",
    assignedProjects: [1, 5],
    avatar: "https://i.pravatar.cc/150?img=11"
  }
];

// 10-15 users
export const users = [
  {
    id: 1,
    fullName: "Admin User",
    email: "admin@company.com",
    role: "admin",
    isActive: true,
    inviteToken: null,
    inviteExpiresAt: null,
    createdAt: "2025-01-15T10:00:00Z"
  },
  {
    id: 2,
    fullName: "Pending Manager",
    email: "manager@company.com",
    role: "manager",
    isActive: false,
    inviteToken: "abc123def456",
    inviteExpiresAt: "2025-12-07T10:00:00Z",
    createdAt: "2025-11-25T10:00:00Z"
  },
  {
    id: 3,
    fullName: "John Smith",
    email: "john@company.com",
    role: "agent",
    isActive: true,
    createdAt: "2025-02-01T10:00:00Z"
  },
  {
    id: 4,
    fullName: "Jane Doe",
    email: "jane@company.com",
    role: "agent",
    isActive: true,
    createdAt: "2025-02-05T10:00:00Z"
  },
  {
    id: 5,
    fullName: "Mike Ross",
    email: "mike@company.com",
    role: "agent",
    isActive: true,
    createdAt: "2025-02-10T10:00:00Z"
  }
];

// 15-20 leads
export const leads = [
  {
    id: 1,
    projectId: 1,
    unitId: 1,
    name: "Sarah Johnson",
    email: "sarah@email.com",
    phone: "+1-555-0200",
    message: "I'm interested in viewing this unit",
    assignedAgentId: 1,
    status: "new",
    source: "website",
    createdAt: "2025-11-28T14:30:00Z"
  },
  {
    id: 2,
    projectId: 2,
    unitId: 4,
    name: "Michael Brown",
    email: "michael@email.com",
    phone: "+1-555-0201",
    message: "Is the price negotiable?",
    assignedAgentId: 2,
    status: "contacted",
    source: "referral",
    createdAt: "2025-11-27T09:15:00Z"
  },
  {
    id: 3,
    projectId: 3,
    unitId: 6,
    name: "Emily Davis",
    email: "emily@email.com",
    phone: "+1-555-0202",
    message: "When is the delivery date?",
    assignedAgentId: 1,
    status: "qualified",
    source: "social_media",
    createdAt: "2025-11-26T16:45:00Z"
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
    createdAt: "2025-11-20T11:00:00Z"
  }
];
