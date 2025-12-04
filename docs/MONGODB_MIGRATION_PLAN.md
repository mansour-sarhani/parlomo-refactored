# MongoDB Migration Plan - Ticketing System

## 🎯 Overview

Migrate the ticketing system from JSON file-based storage to local MongoDB while maintaining the separate base URL architecture and keeping the production BASE_URL intact.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Implementation Phases](#implementation-phases)
- [File Changes](#file-changes)
- [Environment Configuration](#environment-configuration)
- [Testing Strategy](#testing-strategy)
- [Rollback Plan](#rollback-plan)

---

## Architecture Overview

### Current Architecture
```
Frontend Services (ticketing.service.js, public-events.service.js)
    ↓
ticketing-axios (baseURL: localhost:3000)
    ↓
Next.js API Routes (/api/ticketing/*, /api/public-events/*)
    ↓
mock-ticketing-db.js (JSON files in public/mock-data/)
```

### Target Architecture
```
Frontend Services (ticketing.service.js, public-events.service.js)
    ↓
ticketing-axios (baseURL: localhost:3000)
    ↓
Next.js API Routes (/api/ticketing/*, /api/public-events/*)
    ↓
ticketing-db.js (MongoDB via Mongoose)
    ↓
MongoDB (localhost:27017/parlomo)
```

### Key Points
- ✅ **No Frontend Changes**: Services remain unchanged
- ✅ **No API Route Changes**: Same endpoints, same response formats
- ✅ **Production URL Intact**: Main BASE_URL for Laravel backend untouched
- ✅ **Fresh Start**: No data migration needed, use seed page to populate
- ✅ **Local Development**: MongoDB runs locally on port 27017

---

## Prerequisites

### 1. MongoDB Installation

**Windows:**
```powershell
# Download MongoDB Community Server from:
# https://www.mongodb.com/try/download/community

# Or using Chocolatey:
choco install mongodb

# Start MongoDB service:
net start MongoDB
```

**Verify Installation:**
```powershell
mongosh --version
# Should show MongoDB shell version
```

### 2. NPM Dependencies

Install Mongoose for MongoDB ODM:
```bash
npm install mongoose
```

---

## Implementation Phases

### Phase 1: MongoDB Connection Setup
**Estimated Time: 30 minutes**

#### 1.1 Create MongoDB Connection Module

**File:** `src/lib/mongodb.js` [NEW]

- Singleton connection pattern
- Connection pooling
- Error handling and retry logic
- Development vs production configuration
- Connection status logging

**Features:**
- Reuses existing connections (Next.js hot reload compatible)
- Graceful error handling
- Connection timeout management
- Debug logging for development

#### 1.2 Environment Configuration

**File:** `.env.local` [MODIFY]

Already has:
```env
DEV_MONGO_URI=mongodb://localhost:27017/parlomo
DEV_BASE_URL=http://localhost:3000/
```

No changes needed! ✅

---

### Phase 2: Mongoose Models & Schemas
**Estimated Time: 2-3 hours**

Create Mongoose schemas for all ticketing entities with proper validation, indexes, and timestamps.

#### 2.1 Directory Structure

```
src/models/ticketing/
├── TicketType.js
├── Order.js
├── OrderItem.js
├── Ticket.js
├── PromoCode.js
├── Fee.js
├── PublicEvent.js
├── SettlementRequest.js
└── RefundRequest.js
```

#### 2.2 Schema Features

Each model will include:
- **Field Validation**: Required fields, data types, enums
- **Indexes**: For performance (eventId, userId, organizerId, status, etc.)
- **Timestamps**: Automatic createdAt/updatedAt
- **Virtual Fields**: Computed properties (e.g., available tickets)
- **Methods**: Instance methods (e.g., ticket.markAsUsed())
- **Statics**: Model-level methods (e.g., TicketType.getByEvent())
- **Pre/Post Hooks**: Middleware for auto-calculations

#### 2.3 Key Models

**TicketType Model:**
```javascript
{
  eventId: Number (indexed),
  name: String,
  description: String,
  price: Number,
  currency: String,
  capacity: Number,
  sold: Number (default: 0),
  reserved: Number (default: 0),
  minPerOrder: Number,
  maxPerOrder: Number,
  salesStart: Date,
  salesEnd: Date,
  active: Boolean,
  // Auto timestamps
}
```

**Order Model:**
```javascript
{
  orderNumber: String (unique, indexed),
  eventId: Number (indexed),
  userId: String (indexed),
  status: Enum ['pending', 'paid', 'cancelled', 'refunded'],
  subtotal: Number,
  discount: Number,
  fees: Number,
  total: Number,
  currency: String,
  paymentIntentId: String,
  customerEmail: String,
  customerName: String,
  promoCodeId: ObjectId (ref: PromoCode),
  paidAt: Date,
  cancelledAt: Date,
  // Auto timestamps
}
```

**PublicEvent Model:**
```javascript
{
  title: String (required),
  slug: String (unique, indexed),
  description: String,
  category: String (indexed),
  organizerId: String (indexed),
  status: Enum ['draft', 'published', 'cancelled', 'completed'],
  eventType: Enum ['general_admission', 'seated'],
  startDate: Date (indexed),
  endDate: Date,
  timezone: String,
  venue: Object,
  location: Object (with coordinates),
  globalCapacity: Number,
  currency: String,
  coverImage: String,
  galleryImages: Array,
  videoUrl: String,
  organizer: Object,
  refundPolicy: String,
  tags: Array,
  // Auto timestamps
}
```

**Ticket Model:**
```javascript
{
  orderId: ObjectId (ref: Order, indexed),
  eventId: Number (indexed),
  ticketTypeId: ObjectId (ref: TicketType),
  code: String (unique, indexed),
  qrCode: String,
  status: Enum ['valid', 'used', 'cancelled', 'refunded'],
  attendeeName: String,
  attendeeEmail: String,
  seatInfo: Object (for seated events),
  usedAt: Date,
  usedBy: String,
  // Auto timestamps
}
```

**PromoCode Model:**
```javascript
{
  eventId: Number (indexed),
  code: String (unique, indexed),
  discountType: Enum ['percentage', 'fixed'],
  discountAmount: Number,
  validFrom: Date,
  validUntil: Date,
  maxUses: Number,
  maxUsesPerUser: Number,
  currentUses: Number (default: 0),
  applicableTicketTypes: Array,
  active: Boolean,
  // Auto timestamps
}
```

---

### Phase 3: Database Access Layer
**Estimated Time: 3-4 hours**

#### 3.1 Create New Database Module

**File:** `src/lib/ticketing-db.js` [NEW]

Replace `mock-ticketing-db.js` with MongoDB-based implementation.

**Key Functions to Implement:**

**Ticket Types:**
- `getAllTicketTypes()` → `TicketType.find()`
- `getTicketTypesByEvent(eventId)` → `TicketType.find({ eventId })`
- `getTicketType(id)` → `TicketType.findById(id)`
- `createTicketType(data)` → `new TicketType(data).save()`
- `updateTicketType(id, updates)` → `TicketType.findByIdAndUpdate()`
- `reserveTickets(ticketTypeId, quantity)` → Atomic increment
- `releaseTickets(ticketTypeId, quantity)` → Atomic decrement
- `markTicketsSold(ticketTypeId, quantity)` → Atomic update

**Orders:**
- `getAllOrders()` → `Order.find().populate('promoCodeId')`
- `getOrder(id)` → `Order.findById(id)`
- `getOrdersByUser(userId)` → `Order.find({ userId })`
- `getOrdersByEvent(eventId)` → `Order.find({ eventId })`
- `createOrder(data)` → Auto-generate orderNumber
- `updateOrder(id, updates)` → Handle status transitions

**Tickets:**
- `getAllTickets()` → `Ticket.find()`
- `getTicket(id)` → `Ticket.findById(id)`
- `getTicketByCode(code)` → `Ticket.findOne({ code })`
- `getTicketsByOrder(orderId)` → `Ticket.find({ orderId })`
- `createTicket(data)` → Generate unique code
- `updateTicket(id, updates)` → Handle status changes

**Promo Codes:**
- `getAllPromoCodes()` → `PromoCode.find()`
- `getPromoCodeByCode(code)` → Case-insensitive search
- `getPromoCodesByEvent(eventId)` → `PromoCode.find({ eventId })`
- `createPromoCode(data)` → Validate uniqueness
- `updatePromoCode(id, updates)`
- `deletePromoCode(id)` → Soft delete or hard delete
- `incrementPromoUse(id)` → Atomic increment

**Public Events:**
- `getAllPublicEvents(filters)` → Support filtering by status, category, organizerId
- `getPublicEvent(id)` → `PublicEvent.findById(id)`
- `getPublicEventBySlug(slug)` → `PublicEvent.findOne({ slug })`
- `createPublicEvent(data)` → Auto-generate slug
- `updatePublicEvent(id, updates)`
- `deletePublicEvent(id)` → Soft delete (update status)

**Utility Functions:**
- `resetAllData()` → Drop all collections (for seed page)
- `getStats()` → Aggregate counts across collections

#### 3.2 Keep Mock DB as Fallback

**File:** `src/lib/mock-ticketing-db.js` [KEEP]

Rename to `src/lib/mock-ticketing-db.backup.js` for reference/rollback.

---

### Phase 4: Update API Routes
**Estimated Time: 2-3 hours**

#### 4.1 Update Import Statements

All API routes need to:
1. Import from new `ticketing-db.js` instead of `mock-ticketing-db.js`
2. Add `await` to all database calls
3. Add try-catch error handling
4. Ensure MongoDB connection before operations

**Files to Update:**

**Ticketing API Routes:**
- `src/app/api/ticketing/events/[eventId]/route.js`
- `src/app/api/ticketing/events/[eventId]/ticket-types/route.js`
- `src/app/api/ticketing/events/[eventId]/ticket-types/[id]/route.js`
- `src/app/api/ticketing/events/[eventId]/promo-codes/route.js`
- `src/app/api/ticketing/promo-codes/[id]/route.js`
- `src/app/api/ticketing/checkout/start/route.js`
- `src/app/api/ticketing/checkout/complete/route.js`
- `src/app/api/ticketing/orders/[orderId]/route.js`
- `src/app/api/ticketing/orders/[orderId]/tickets/route.js`
- `src/app/api/ticketing/promo/validate/route.js`
- `src/app/api/ticketing/scanner/scan/route.js`

**Public Events API Routes:**
- `src/app/api/public-events/route.js`
- `src/app/api/public-events/[id]/route.js`
- `src/app/api/public-events/[id]/stats/route.js`
- `src/app/api/public-events/categories/route.js`

**Financial API Routes:**
- `src/app/api/financials/settlements/route.js`
- `src/app/api/financials/settlements/[id]/route.js`
- `src/app/api/financials/refunds/route.js`
- `src/app/api/financials/refunds/[id]/route.js`

#### 4.2 Example Migration Pattern

**Before (JSON files):**
```javascript
import { getTicketTypesByEvent } from '@/lib/mock-ticketing-db';

export async function GET(request, { params }) {
    const ticketTypes = getTicketTypesByEvent(params.eventId);
    return NextResponse.json({ ticketTypes });
}
```

**After (MongoDB):**
```javascript
import { connectDB } from '@/lib/mongodb';
import { getTicketTypesByEvent } from '@/lib/ticketing-db';

export async function GET(request, { params }) {
    try {
        await connectDB();
        const ticketTypes = await getTicketTypesByEvent(params.eventId);
        return NextResponse.json({ ticketTypes });
    } catch (error) {
        console.error('Error fetching ticket types:', error);
        return NextResponse.json(
            { error: 'Failed to fetch ticket types' },
            { status: 500 }
        );
    }
}
```

---

### Phase 5: Update Seed System
**Estimated Time: 1-2 hours**

#### 5.1 Update Seed Data Script

**File:** `src/lib/seed-ticketing-data.js` [MODIFY]

Update to use MongoDB instead of JSON files:
- Import MongoDB models
- Use `await` for all operations
- Add transaction support for data consistency
- Clear collections before seeding

**File:** `src/lib/seed-public-events-data.js` [MODIFY]

Same updates as ticketing seed.

#### 5.2 Update Seed API Routes

**File:** `src/app/api/seed-ticketing/route.js` [MODIFY]

Add MongoDB connection and async operations:
```javascript
import { connectDB } from '@/lib/mongodb';
import { resetAllData } from '@/lib/ticketing-db';
import { seedTicketingData } from '@/lib/seed-ticketing-data';

export async function POST(request) {
    try {
        await connectDB();
        
        const { action } = await request.json();
        
        if (action === 'reset') {
            await resetAllData();
            return NextResponse.json({ 
                success: true, 
                message: 'All ticketing data cleared' 
            });
        }
        
        if (action === 'seed') {
            await resetAllData(); // Clear first
            const result = await seedTicketingData();
            return NextResponse.json({ 
                success: true, 
                message: 'Ticketing data seeded successfully',
                data: result
            });
        }
        
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
```

#### 5.3 Update Seed Page UI

**File:** `src/app/panel/seed/page.js` or similar [MODIFY]

No changes needed if using the same API endpoints! ✅

The existing UI buttons for "Reset Data" and "Seed Data" will work automatically.

---

### Phase 6: Testing & Validation
**Estimated Time: 2-3 hours**

#### 6.1 Unit Testing

Test each database function:
- Create operations
- Read operations (single, multiple, filtered)
- Update operations
- Delete operations
- Atomic operations (reserve, increment)

#### 6.2 Integration Testing

Test complete flows:
1. **Event Creation Flow:**
   - Create public event
   - Add ticket types
   - Add promo codes
   - Verify in MongoDB

2. **Purchase Flow:**
   - Browse event
   - Add tickets to cart
   - Apply promo code
   - Complete checkout
   - Verify order, tickets, inventory updates

3. **Organizer Dashboard:**
   - View events
   - View sales stats
   - Export attendees
   - Manage ticket types

4. **Seed System:**
   - Reset all data
   - Seed fresh data
   - Verify data integrity

#### 6.3 Performance Testing

- Query performance with indexes
- Concurrent order creation
- Inventory reservation race conditions
- Connection pool efficiency

---

## File Changes Summary

### New Files (10)
1. `src/lib/mongodb.js` - MongoDB connection
2. `src/models/ticketing/TicketType.js` - Mongoose model
3. `src/models/ticketing/Order.js` - Mongoose model
4. `src/models/ticketing/OrderItem.js` - Mongoose model
5. `src/models/ticketing/Ticket.js` - Mongoose model
6. `src/models/ticketing/PromoCode.js` - Mongoose model
7. `src/models/ticketing/Fee.js` - Mongoose model
8. `src/models/ticketing/PublicEvent.js` - Mongoose model
9. `src/models/ticketing/SettlementRequest.js` - Mongoose model
10. `src/models/ticketing/RefundRequest.js` - Mongoose model
11. `src/lib/ticketing-db.js` - MongoDB database access layer

### Modified Files (~30)
- All API routes in `src/app/api/ticketing/` (add async/await, MongoDB connection)
- All API routes in `src/app/api/public-events/` (add async/await, MongoDB connection)
- `src/lib/seed-ticketing-data.js` (use MongoDB)
- `src/lib/seed-public-events-data.js` (use MongoDB)
- `src/app/api/seed-ticketing/route.js` (add MongoDB support)

### Unchanged Files ✅
- `src/services/ticketing.service.js` - No changes needed
- `src/services/public-events.service.js` - No changes needed
- `src/lib/ticketing-axios.js` - No changes needed
- All frontend components - No changes needed
- All Redux slices - No changes needed

### Backup Files
- `src/lib/mock-ticketing-db.backup.js` - Keep for reference/rollback

---

## Environment Configuration

### Development (.env.local)
```env
# MongoDB Configuration
DEV_MONGO_URI=mongodb://localhost:27017/parlomo

# Ticketing API Base URL (Next.js localhost)
DEV_BASE_URL=http://localhost:3000/

# Production Laravel Backend (UNCHANGED)
NEXT_PUBLIC_BASE_URL=https://your-production-api.com

# MongoDB Options (optional)
MONGODB_MAX_POOL_SIZE=10
MONGODB_MIN_POOL_SIZE=2
```

### Production (.env.production)
```env
# MongoDB Atlas or Production MongoDB
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/parlomo

# Production Ticketing API
BASE_URL=https://your-app.com

# Production Laravel Backend
NEXT_PUBLIC_BASE_URL=https://your-production-api.com
```

---

## Testing Strategy

### 1. Local Development Testing

**Step 1: Verify MongoDB Connection**
```bash
# Check MongoDB is running
mongosh mongodb://localhost:27017/parlomo

# Should connect successfully
```

**Step 2: Test Seed System**
1. Navigate to seed page
2. Click "Reset Data" - should clear all collections
3. Click "Seed Data" - should populate sample data
4. Verify in MongoDB:
```bash
mongosh mongodb://localhost:27017/parlomo
> db.publicevents.find().pretty()
> db.tickettypes.find().pretty()
```

**Step 3: Test Event Creation**
1. Create new public event via UI
2. Add ticket types
3. Add promo codes
4. Verify data in MongoDB

**Step 4: Test Purchase Flow**
1. Browse to event page
2. Add tickets to cart
3. Apply promo code
4. Complete checkout (use Stripe test card)
5. Verify order and tickets created
6. Check inventory updated

**Step 5: Test Organizer Dashboard**
1. View "My Events"
2. Check sales statistics
3. View attendee list
4. Export data

### 2. Error Handling Testing

- MongoDB connection failure
- Invalid data validation
- Concurrent inventory updates
- Duplicate order prevention
- Promo code max uses enforcement

### 3. Performance Testing

- Load test with multiple concurrent orders
- Query performance with large datasets
- Index effectiveness verification

---

## Rollback Plan

If issues arise, easy rollback:

### Option 1: Quick Rollback (5 minutes)
1. Revert `src/lib/ticketing-db.js` imports back to `mock-ticketing-db.js`
2. Restart dev server
3. System back to JSON files

### Option 2: Git Rollback
```bash
git checkout HEAD -- src/lib/ticketing-db.js
git checkout HEAD -- src/app/api/ticketing/
git checkout HEAD -- src/app/api/public-events/
npm run dev
```

### Option 3: Feature Flag
Add environment variable:
```env
USE_MONGODB=false  # Switch back to JSON files
```

---

## Timeline Estimate

| Phase | Task | Time |
|-------|------|------|
| **Phase 1** | MongoDB Connection Setup | 30 min |
| **Phase 2** | Mongoose Models (9 models) | 2-3 hours |
| **Phase 3** | Database Access Layer | 3-4 hours |
| **Phase 4** | Update API Routes (~30 files) | 2-3 hours |
| **Phase 5** | Update Seed System | 1-2 hours |
| **Phase 6** | Testing & Validation | 2-3 hours |
| **Total** | **Complete Migration** | **11-15 hours** |

**Calendar Time:** 2-3 days of focused work

---

## Success Criteria

✅ MongoDB connection established and stable  
✅ All 9 Mongoose models created with validation  
✅ All database operations migrated from JSON to MongoDB  
✅ All API routes updated and tested  
✅ Seed page can reset and populate MongoDB  
✅ Event creation flow works end-to-end  
✅ Purchase flow completes successfully  
✅ Organizer dashboard displays correct data  
✅ No frontend changes required  
✅ Production BASE_URL remains intact  
✅ Performance meets or exceeds JSON file approach  

---

## Next Steps

1. **Install MongoDB** locally and verify it's running
2. **Install Mongoose**: `npm install mongoose`
3. **Start with Phase 1**: Create MongoDB connection module
4. **Proceed sequentially** through phases
5. **Test thoroughly** after each phase
6. **Use seed page** to reset/populate data during development

---

## Questions & Considerations

### Q: What about data persistence during development?
**A:** MongoDB data persists between restarts. Use the seed page "Reset Data" button to clear when needed.

### Q: How to view/debug MongoDB data?
**A:** Use MongoDB Compass (GUI) or mongosh (CLI):
```bash
mongosh mongodb://localhost:27017/parlomo
> show collections
> db.publicevents.find().pretty()
```

### Q: What about production deployment?
**A:** Two options:
1. **MongoDB Atlas** (cloud) - Update MONGO_URI
2. **Self-hosted MongoDB** - Deploy alongside Next.js

### Q: Can we still migrate to Laravel later?
**A:** Yes! Export MongoDB data, build Laravel API, update ticketing-axios baseURL. No frontend changes needed.

### Q: What about transactions?
**A:** MongoDB supports transactions for multi-document operations (e.g., order creation + inventory update).

---

## Additional Resources

- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/)
- [Next.js API Routes Best Practices](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [MongoDB Atlas Setup](https://www.mongodb.com/cloud/atlas)

---

**Ready to proceed?** Let's start with Phase 1! 🚀
