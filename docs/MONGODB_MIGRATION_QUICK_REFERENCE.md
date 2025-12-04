# MongoDB Migration - Quick Reference Guide

## ✅ COMPLETED ROUTES (4/35)

1. ✅ /api/public-events/route.js
2. ✅ /api/public-events/[id]/route.js  
3. ✅ /api/seed-ticketing/route.js
4. ✅ /api/ticketing/checkout/start/route.js (CRITICAL)

## 🔄 MIGRATION PATTERN

For each remaining route, apply these changes:

### Step 1: Update Imports
```javascript
// ADD this import
import { connectDB } from '@/lib/mongodb';

// CHANGE these imports
// FROM: '@/lib/mock-ticketing-db'
// TO:   '@/lib/ticketing-db'

// FROM: '@/lib/mock-public-events-db'
// TO:   '@/lib/public-events-db'
```

### Step 2: Add MongoDB Connection
```javascript
export async function GET(request, { params }) {
    try {
        await connectDB(); // ADD THIS LINE
        
        // ... rest of code
    }
}
```

### Step 3: Add await to Database Calls
```javascript
// BEFORE:
const event = getPublicEvent(id);
const ticketType = getTicketType(id);
const order = createOrder(data);

// AFTER:
const event = await getPublicEvent(id);
const ticketType = await getTicketType(id);
const order = await createOrder(data);
```

### Step 4: Remove parseInt for IDs
```javascript
// BEFORE:
const { id } = await params;
const eventId = parseInt(id, 10);
const event = getPublicEvent(eventId);

// AFTER:
const { id } = await params;
const event = await getPublicEvent(id);
```

## 🎯 PRIORITY ORDER (Remaining Critical Routes)

### HIGH PRIORITY (Complete These Next):
1. /api/ticketing/checkout/complete/route.js
2. /api/ticketing/orders/[orderId]/route.js
3. /api/ticketing/orders/[orderId]/tickets/route.js
4. /api/ticketing/events/[eventId]/ticket-types/route.js
5. /api/ticketing/promo/validate/route.js

### MEDIUM PRIORITY:
6. /api/ticketing/events/[eventId]/route.js
7. /api/ticketing/events/[eventId]/promo-codes/route.js
8. /api/ticketing/events/[eventId]/promo-codes/[codeId]/route.js
9. /api/ticketing/events/[eventId]/attendees/route.js
10. /api/ticketing/scanner/scan/route.js

### LOWER PRIORITY (Public Events):
11. /api/public-events/[id]/stats/route.js
12. /api/public-events/[id]/publish/route.js
13. /api/public-events/[id]/unpublish/route.js
14. /api/public-events/[id]/cancel/route.js
15. /api/public-events/categories/route.js
16. /api/public-events/slug/[slug]/route.js
17. /api/seed-public-events/route.js
18. /api/reset-public-events/route.js

### FINANCIAL ROUTES:
19. /api/financials/settlements/route.js
20. /api/financials/settlements/[id]/route.js
21. /api/financials/settlements/admin/route.js
22. /api/financials/settlements/organizer/route.js
23. /api/financials/refunds/route.js
24. /api/financials/refunds/[id]/route.js
25. /api/financials/refunds/admin/route.js
26. /api/financials/refunds/organizer/route.js

### OTHER:
27. /api/events/[eventName]/route.js

## 📝 NOTES

- All routes follow the same pattern
- MongoDB connection is automatic via connectDB()
- Error handling stays the same
- Response format unchanged (backward compatible)
- Test each route after migration

## ✨ BENEFITS OF COMPLETED MIGRATION

Once all routes are migrated:
- Real database with indexing and performance
- Proper data persistence
- Transaction support
- Better query capabilities
- Production-ready architecture
