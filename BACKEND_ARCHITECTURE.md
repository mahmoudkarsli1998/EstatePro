# Backend Architecture & System Design

## 1. Architecture Overview

### Recommended Framework: NestJS (Node.js)
**Why NestJS?**
Given the requirement for a robust, scalable, and clearly layered architecture ("Expert Software Architect" standard), **NestJS** is the recommended framework. It provides:
- **Strict Modularity**: Enforces separation of concerns (Modules, Controllers, Services).
- **TypeScript First**: Native support matches the industry standard for maintainable Node.js apps.
- **Dependency Injection**: Simplifies testing and component decoupling.
- **Decorator-based Validation**: Uses `class-validator` and `class-transformer` for robust DTOs.

### System Layers
The application will follow a **Clean Architecture** approach adapted for NestJS:

1.  **Presentation Layer (Controllers)**: Handles HTTP requests, authentication guards, and response formatting.
2.  **Application Layer (Services)**: Contains business logic, orchestration, and transaction management.
3.  **Domain/Data Layer (Repositories/Mongoose Models)**: Direct interaction with the MongoDB database.
4.  **Shared/Core Layer**: Global filters, interceptors, DTOs, and utility functions.

---

## 2. Backend Requirements & Business Logic

### Core Entities (inferred from Frontend)
1.  **Users & Auth**: Centralized identity management with roles (Admin, Manager, Agent, Developer).
2.  **Projects**: The core product. Hierarchical structure: `Project` -> `Phase` -> `Block` -> `Unit`.
3.  **Units**: Individual inventory items with status tracking (Available, Sold, Reserved).
4.  **Leads (CRM)**: Customer inquiries with lifecycle tracking and assignment to Agents.
5.  **Developers**: Third-party partners who own/build the projects.
6.  **Locations/Cities**: Geographical categorization for SEO and search.
7.  **Activities/Audit**: System-wide event logging (Who did what, when).

### Key Business Rules
-   **Inventory Log**: When a Unit is sold/reserved, the parent Project's stats (`available` count) must update transactionally.
-   **Role-Based Access**:
    -   `Admin`: Full access to all resources.
    -   `Manager`: Can manage Users, Leads, and Inventory but cannot delete system configs.
    -   `Agent`: Read-only Inventory, R/W access to assigned Leads only.
    -   `Developer`: Read-only access to their specific Projects.
-   **Lead Assignment**: Leads can be manually assigned to Agents. This triggers notifications (optional future scope, but data model handles it).
-   **Search & Filtering**: Projects/Units require rich filtering (amenities, price range, geo-location) requiring MongoDB Indexes.

---

## 3. Database Architecture (MongoDB + Mongoose)

### Connection Strategy
-   **Replica Set**: Recommended for transactions (ACID compliance) and high availability.
-   **Connection Pooling**: Logic handled by Mongoose default pool size (min 10).

### Schema Definitions & Relations

#### 3.1 User & Auth Module
```typescript
// Roles Enum
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  AGENT = 'agent',
  DEVELOPER = 'developer'
}

// User Schema
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, index: true, lowercase: true },
  passwordHash: { type: String, required: true, select: false }, // Exclude by default
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.AGENT },
  isActive: { type: Boolean, default: false },
  avatar: { type: String }, // URL
  phone: { type: String },
  lastLogin: { type: Date },
  // For Invite flow
  inviteToken: { type: String, select: false },
  inviteExpires: { type: Date },
}, { timestamps: true });
```

#### 3.2 Projects & Inventory Module
*Note: We use a normalized approach for Phases and Blocks to allow independent management, but embed critical summary data in Project for read performance.*

**Project Schema**
```typescript
const ProjectSchema = new Schema({
  name: { type: String, required: true, index: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  address: { type: String },
  city: { type: String, index: true }, // Filter key
  country: { type: String, default: 'Egypt' },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [longitude, latitude]
  },
  developer: { type: Schema.Types.ObjectId, ref: 'Developer', required: true, index: true },
  
  // Status & Classification
  status: { type: String, enum: ['active', 'upcoming', 'ready', 'resale'], default: 'upcoming' },
  type: { type: String, enum: ['keys', 'off_plan', 'resale'], required: true },
  
  // Media
  images: [{ type: String }],
  
  // Aggregated Stats (Updated via Hooks/Service)
  stats: {
    totalUnits: { type: Number, default: 0 },
    availableUnits: { type: Number, default: 0 },
    soldUnits: { type: Number, default: 0 },
    minPrice: { type: Number, default: 0 },
    maxPrice: { type: Number, default: 0 }
  },

  amenities: [{ type: String }],
  deliveryDate: { type: Date }
}, { timestamps: true });

// 2dsphere index for geospatial queries
ProjectSchema.index({ location: '2dsphere' });
```

**Unit Schema**
```typescript
const UnitSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  phaseId: { type: Schema.Types.ObjectId, ref: 'Phase' },
  blockId: { type: Schema.Types.ObjectId, ref: 'Block' },
  
  number: { type: String, required: true }, // e.g. "A-101"
  buildingCode: { type: String },
  floor: { type: Number, required: true },
  
  type: { type: String, enum: ['apartment', 'villa', 'studio', 'penthouse', 'office', 'commercial'], required: true },
  status: { type: String, enum: ['available', 'reserved', 'sold', 'rented'], default: 'available', index: true },
  
  // Specs
  area_m2: { type: Number, required: true },
  price: { type: Number, required: true, index: true },
  bedrooms: { type: Number, default: 0 },
  bathrooms: { type: Number, default: 0 },
  featureList: {
    parking: { type: Boolean, default: false },
    balcony: { type: Boolean, default: false },
    furnished: { type: Boolean, default: false },
    view: { type: String }
  },
  
  images: [{ type: String }]
}, { timestamps: true });

// Compound index for ensuring unique unit numbers within a project/block if needed
UnitSchema.index({ projectId: 1, number: 1 }, { unique: true });
```

**Developer Schema**
```typescript
const DeveloperSchema = new Schema({
  name: { type: String, required: true },
  contactEmail: { type: String },
  contactPhone: { type: String },
  logo: { type: String },
  website: { type: String }
}, { timestamps: true });
```

#### 3.3 CRM Module (Leads)
```typescript
const FollowUpSchema = new Schema({
  note: { type: String, required: true },
  date: { type: Date, default: Date.now },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User' }
});

const LeadSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  source: { type: String, default: 'website' }, // e.g., 'facebook', 'walk-in'
  
  status: { type: String, enum: ['new', 'contacted', 'qualified', 'lost', 'won'], default: 'new' },
  
  assignedAgent: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  interestedInProjects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
  
  followUps: [FollowUpSchema],
  
  lastActivity: { type: Date, default: Date.now }
}, { timestamps: true });
```

#### 3.4 Audit Module
```typescript
const AuditLogSchema = new Schema({
  action: { type: String, required: true }, // e.g., 'UNIT_SOLD', 'USER_LOGIN'
  performedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // Null if system
  targetId: { type: Schema.Types.ObjectId }, // Generic ref to target entity
  targetCollection: { type: String }, // e.g., 'units'
  metadata: { type: Schema.Types.Mixed }, // Changed fields, old/new values
  ipAddress: { type: String },
  userAgent: { type: String }
}, { timestamps: true, expireAfterSeconds: 31536000 }); // Auto-delete after 1 year
```

---

## 4. API Endpoints Specification

### 4.1 Authentication `AuthModule`
| Method | Path | Protected | Description |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/login` | No | Authenticate and return JWT |
| POST | `/api/auth/invite` | Yes (Admin) | Create user & send invite email |
| POST | `/api/auth/accept-invite` | No | Complete registration with token |
| GET | `/api/auth/me` | Yes | Get current user profile |

### 4.2 Projects `ProjectsModule`
| Method | Path | Protected | Description |
| :--- | :--- | :--- | :--- |
| GET | `/api/projects` | No | Public list with filters (city, type, status) |
| GET | `/api/projects/:slug` | No | Public detailed view with phases/blocks |
| POST | `/api/projects` | Yes (Admin) | Create new project |
| PATCH | `/api/projects/:id` | Yes (Admin) | Update project details |
| DELETE | `/api/projects/:id` | Yes (Admin) | Soft delete project |

### 4.3 Units `UnitsModule`
| Method | Path | Protected | Description |
| :--- | :--- | :--- | :--- |
| GET | `/api/projects/:id/units` | No | Public list of available units |
| POST | `/api/units` | Yes (Manager) | Add new unit inventory |
| PATCH | `/api/units/:id` | Yes (Manager) | Update unit (price, status) |
| PATCH | `/api/units/:id/status` | Yes (Agent) | Quick status change (Reserved/Sold) |

### 4.4 Leads `LeadsModule`
| Method | Path | Protected | Description |
| :--- | :--- | :--- | :--- |
| POST | `/api/leads` | No | Public submission form |
| GET | `/api/leads` | Yes (Manager) | List all leads |
| GET | `/api/leads/my` | Yes (Agent) | List assigned leads only |
| PATCH | `/api/leads/:id/assign` | Yes (Manager) | Assign lead to agent |
| POST | `/api/leads/:id/follow-up` | Yes | Add follow-up note |

---

## 5. Security, Performance & Reliability Implementation

### Security
1.  **JWT Authentication**: Stateless authentication using `passport-jwt`. Tokens expire in 15m; Refresh Tokens stored in HTTPOnly cookie.
2.  **RBAC Guards**: Custom Decorators `@Roles('admin', 'manager')` to enforce permission checks at the Controller level.
3.  **Sanitization**: Use `mongo-sanitize` to prevent NoSQL Injection in query params.
4.  **Rate Limiting**: `ThrottlerModule` (NestJS) to limit public endpoints (e.g., Login: 5 req/min).

### Performance
1.  **Indexing strategies**:
    -   Compound index on `Project`: `{ status: 1, type: 1, priceRange: 1 }` for search filtering.
    -   Text index on `Project`: `{ name: 'text', description: 'text' }` for search bar.
2.  **Caching**:
    -   Use `CacheInterceptor` for `GET /api/projects` (public endpoints) with 5-minute TTL.
    -   Invalidate cache on `POST/PATCH` events.
3.  **Pagination**:
    -   Cursor-based pagination for `Activities` (infinite scroll).
    -   Standard `page/limit` for Data Tables (Units, Leads).

### Reliability
1.  **Transactions**: Use Mongoose Sessions for critical operations:
    -   *Scenario*: Marking a Unit as SOLD must simultaneously update Project Stats. If one fails, both rollback.
2.  **Audit Trail**: Every mutation (POST/PUT/DELETE) triggers an `AuditService.log()` call using an Interceptor.
3.  **Error Handling**: Global Exception Filter to standardize errors:
    ```json
    {
      "statusCode": 400,
      "message": "Unit already reserved",
      "error": "Bad Request"
    }
    ```

## 6. Implementation Roadmap
1.  **Scaffold NestJS**: `nest new real-estate-api`.
2.  **Database**: Setup MongoDB & Connect Mongoose.
3.  **Auth Module**: Implement Login, Guards, and Decorators.
4.  **Core Modules**: Implement Project/Unit CRUD with Relations.
5.  **Business Logic**: Add Stats aggregation and Inventory controls.
6.  **CRM**: Implement Leads workflow.
