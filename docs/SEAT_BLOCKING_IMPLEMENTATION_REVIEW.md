# Seat Blocking Feature - Frontend Implementation Review

**Date:** 2026-01-01  
**Reviewer:** AI Assistant  
**Status:** ⚠️ **FRONTEND READY - NOT INTEGRATED**

> **Note:** Backend API is being handled separately. This review focuses on **frontend implementation only**.

---

## Executive Summary

The **Seat Blocking** frontend has been **fully implemented but not integrated**:

✅ **Frontend Components** - Fully implemented and ready  
✅ **Service Layer** - Complete API client wrapper  
✅ **UI Components** - Block/Unblock modals and list views created  
⚠️ **Backend API** - Being handled elsewhere (not in this codebase)  
❌ **UI Integration** - Components exist but are **NOT CONNECTED** to any pages  
❌ **Testing** - Cannot test until integrated into a page

---

## What Has Been Implemented

### 1. API Documentation ✅

**Location:** `docs/SEAT_BLOCKING_API.md`

Complete API specification including:

- 4 endpoints (block, unblock, get blocked seats, get availability)
- Request/response formats
- Error handling
- Authorization rules (Organizers + Super-admins)
- Flutter/Dart integration examples

### 2. Frontend Service Layer ✅

**Location:** `src/services/seatBlocking.service.js`

```javascript
// Complete API wrapper with 4 methods:
-blockSeats(eventId, data) -
    unblockSeats(eventId, data) -
    getBlockedSeats(eventId) -
    getAvailability(eventId);
```

**Features:**

- Uses `ticketingAxios` for authenticated requests
- Proper error handling
- Block reason constants and display helpers
- TypeScript-style JSDoc comments

### 3. UI Components ✅

**Location:** `src/components/ticketing/`

#### a) BlockSeatsModal.js

- Modal for blocking seats with reason selection
- Validation for seat labels, reason, and notes
- Support for all 6 block reasons (VIP, Sponsor, Accessibility, Production, Technical, Other)
- Character limit (500) for notes
- Loading states and error handling

#### b) UnblockSeatsModal.js

- Confirmation dialog for unblocking seats
- Shows blocked seat details (reason, notes, blocked by, date)
- Warning message about making seats public again

#### c) BlockedSeatsList.js

- Responsive table/card view of all blocked seats
- Desktop: Full table with sortable columns
- Mobile: Card-based layout
- Shows: seat labels, reason, notes, blocked by user, date
- Unblock button integration
- Summary statistics (total blocks, total seats)

---

## What Is Missing (Critical)

### 1. Backend API Routes ❌

**Required Routes:**

```
POST   /api/ticketing/seatsio/events/[eventId]/block-seats
POST   /api/ticketing/seatsio/events/[eventId]/unblock-seats
GET    /api/ticketing/seatsio/events/[eventId]/blocked-seats
GET    /api/ticketing/seatsio/events/[eventId]/availability
```

**Current Status:** These routes **DO NOT EXIST** in `src/app/api/ticketing/`

**Required Implementation:**

- Create route handlers in Next.js API routes
- Implement authentication middleware
- Implement authorization (organizer owns event OR super-admin)
- Integrate with Seats.io API to actually block/unblock seats
- Store blocked seat records in MongoDB

### 2. Database Model ❌

**Required Model:** `BlockedSeats` or `SeatBlock`

**Location:** Should be in `src/models/ticketing/`

**Schema Fields:**

```javascript
{
  id: UUID,
  event_id: UUID (ref: PublicEvent),
  seat_labels: [String],  // e.g., ["A-1", "A-2", "A-3"]
  reason: String,         // VIP, Sponsor, Accessibility, etc.
  notes: String,          // Optional, max 500 chars
  blocked_by: ObjectId (ref: User),
  blocked_at: Date,
  created_at: Date,
  updated_at: Date
}
```

### 3. UI Integration ❌

**Components exist but are NOT used anywhere!**

The following components are **orphaned** (no imports found):

- `BlockSeatsModal`
- `UnblockSeatsModal`
- `BlockedSeatsList`

**Where They Should Be Integrated:**

#### Option A: Add to Seating Configuration Page

**File:** `src/app/panel/my-events/[id]/seating/page.js`

Add a new tab or section for "Blocked Seats Management" where organizers can:

- View currently blocked seats
- Block new seats
- Unblock existing seats

#### Option B: Add to Ticketing Management Page

**File:** `src/app/panel/my-events/[id]/ticketing/page.js`

Add a new tab "Seat Blocking" alongside:

- Ticket Types
- Sales Analytics
- Attendees
- Promo Codes

#### Option C: Create Dedicated Page

**New File:** `src/app/panel/my-events/[id]/blocked-seats/page.js`

Standalone page for seat blocking management.

---

## Authorization & Roles

### Current Role System

**Roles in System:**

- `customer` - Regular users
- `system-admin` - System administrators
- `super-admin` - Super administrators (highest level)
- `admin` - General admin
- `manager` - Manager role

### Seat Blocking Authorization

According to the API documentation:

- **Organizers** can block/unblock seats for **their own events**
- **Super-admins** can block/unblock seats for **any event**

**Implementation Required:**

```javascript
// In API route handler
const canManageSeats = (user, event) => {
    // Super-admin can manage any event
    if (user.role === "super-admin") return true;

    // Organizer can only manage their own events
    if (event.organizer_id === user.id) return true;

    return false;
};
```

---

## Testing the Feature

### Current State: Cannot Test ❌

**Why?**

1. Backend API routes don't exist → Frontend calls will fail with 404
2. No database model → Can't store blocked seats
3. UI not integrated → No way to access the feature

### Testing Checklist (After Implementation)

#### As Super-Admin:

- [ ] Navigate to any event's seating/ticketing page
- [ ] See "Blocked Seats" tab/section
- [ ] Block multiple seats with different reasons
- [ ] View list of blocked seats
- [ ] Unblock seats
- [ ] Verify seats appear as unavailable on public seating chart

#### As Organizer:

- [ ] Navigate to own event's seating/ticketing page
- [ ] Block seats for own event
- [ ] Cannot block seats for other organizers' events
- [ ] View only own event's blocked seats

#### As Customer:

- [ ] Cannot access seat blocking features
- [ ] Blocked seats appear as unavailable on public event page
- [ ] Cannot select blocked seats during ticket purchase

---

## Recommended Implementation Plan

### Phase 1: Backend Implementation (High Priority)

#### Step 1: Create Database Model

**File:** `src/models/ticketing/BlockedSeats.js`

```javascript
import mongoose from "mongoose";

const blockedSeatsSchema = new mongoose.Schema(
    {
        event_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PublicEvent",
            required: true,
            index: true,
        },
        seat_labels: {
            type: [String],
            required: true,
        },
        reason: {
            type: String,
            enum: ["VIP", "Sponsor", "Accessibility", "Production", "Technical", "Other"],
            required: true,
        },
        notes: {
            type: String,
            maxlength: 500,
        },
        blocked_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        blocked_at: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.BlockedSeats || mongoose.model("BlockedSeats", blockedSeatsSchema);
```

#### Step 2: Create API Routes

**Directory Structure:**

```
src/app/api/ticketing/seatsio/events/[eventId]/
  ├── block-seats/
  │   └── route.js
  ├── unblock-seats/
  │   └── route.js
  ├── blocked-seats/
  │   └── route.js
  └── availability/
      └── route.js
```

**Example:** `block-seats/route.js`

```javascript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import BlockedSeats from "@/models/ticketing/BlockedSeats";
import PublicEvent from "@/models/ticketing/PublicEvent";
import { SeatsioClient } from "seatsio";

export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { eventId } = params;
        const { seat_labels, reason, notes } = await request.json();

        // Validate input
        if (!seat_labels || !Array.isArray(seat_labels) || seat_labels.length === 0) {
            return NextResponse.json(
                {
                    message: "The given data was invalid.",
                    errors: { seat_labels: ["The seat labels field is required."] },
                },
                { status: 422 }
            );
        }

        // Get event
        const event = await PublicEvent.findById(eventId);
        if (!event) {
            return NextResponse.json({ message: "Event not found" }, { status: 404 });
        }

        // Check authorization
        const canManage =
            session.user.role === "super-admin" ||
            event.organizer_id?.toString() === session.user.id;
        if (!canManage) {
            return NextResponse.json(
                {
                    message: "You do not have permission to manage this event",
                },
                { status: 403 }
            );
        }

        // Check if event has seatsio configuration
        if (!event.seatsio_event_key) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Seats.io event not created",
                },
                { status: 400 }
            );
        }

        // Block seats in Seats.io
        const seatsioClient = new SeatsioClient(process.env.SEATSIO_SECRET_KEY);
        try {
            await seatsioClient.events.book(
                event.seatsio_event_key,
                seat_labels,
                null,
                null,
                null,
                "blocked"
            );
        } catch (seatsioError) {
            // Check if seats are already booked
            if (seatsioError.message.includes("already booked")) {
                return NextResponse.json(
                    {
                        success: false,
                        message: `Cannot block seats that are already booked: ${seat_labels.join(", ")}`,
                    },
                    { status: 400 }
                );
            }
            throw seatsioError;
        }

        // Save to database
        const blockedRecord = await BlockedSeats.create({
            event_id: eventId,
            seat_labels,
            reason,
            notes,
            blocked_by: session.user.id,
            blocked_at: new Date(),
        });

        // Populate blocked_by user info
        await blockedRecord.populate("blocked_by", "name email");

        return NextResponse.json({
            success: true,
            message: `${seat_labels.length} seat(s) blocked successfully`,
            data: {
                id: blockedRecord._id,
                event_id: blockedRecord.event_id,
                seat_labels: blockedRecord.seat_labels,
                reason: blockedRecord.reason,
                notes: blockedRecord.notes,
                blocked_by: {
                    id: blockedRecord.blocked_by._id,
                    name: blockedRecord.blocked_by.name,
                    email: blockedRecord.blocked_by.email,
                },
                blocked_at: blockedRecord.blocked_at,
                created_at: blockedRecord.createdAt,
                updated_at: blockedRecord.updatedAt,
            },
        });
    } catch (error) {
        console.error("Error blocking seats:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to block seats",
            },
            { status: 500 }
        );
    }
}
```

### Phase 2: UI Integration (Medium Priority)

#### Option 1: Add Tab to Ticketing Management Page

**File:** `src/app/panel/my-events/[id]/ticketing/page.js`

**Changes:**

1. Import the components
2. Add "Seat Blocking" tab
3. Add state for modal management
4. Render BlockedSeatsList with modals

```javascript
import BlockedSeatsList from "@/components/ticketing/BlockedSeatsList";
import BlockSeatsModal from "@/components/ticketing/BlockSeatsModal";
import UnblockSeatsModal from "@/components/ticketing/UnblockSeatsModal";

// Add to tabs
<Button
    onClick={() => setActiveTab("blocked-seats")}
    variant={activeTab === "blocked-seats" ? "primary" : "ghost"}
    className="gap-2 whitespace-nowrap"
>
    <Lock className="w-5 h-5" />
    Seat Blocking
</Button>;

// Add to content area
{
    activeTab === "blocked-seats" && (
        <div>
            <BlockedSeatsList
                eventId={eventId}
                onUnblock={handleUnblockClick}
                onRefresh={refreshKey}
            />
            {/* Modals */}
        </div>
    );
}
```

#### Option 2: Add Section to Seating Configuration Page

**File:** `src/app/panel/my-events/[id]/seating/page.js`

Add a "Manage Blocked Seats" section after seating configuration is complete.

### Phase 3: Testing (High Priority)

1. **Unit Tests** - Test API routes with different user roles
2. **Integration Tests** - Test full flow from UI to database
3. **E2E Tests** - Test as super-admin and organizer
4. **Manual Testing** - Follow testing checklist above

---

## Security Considerations

### Authentication

- All endpoints require valid session/JWT token
- Unauthenticated requests return 401

### Authorization

- Super-admin: Can manage any event's seats
- Organizer: Can only manage own event's seats
- Other roles: No access (403)

### Validation

- Seat labels must be array of strings
- Reason must be one of 6 valid values
- Notes max 500 characters
- Event must exist and have Seats.io configuration

### Seats.io Integration

- Verify seats exist in chart before blocking
- Handle already-booked seats gracefully
- Sync block status with Seats.io API
- Handle Seats.io API errors properly

---

## API Endpoint Summary

| Endpoint                                                | Method | Auth | Role                  | Status             |
| ------------------------------------------------------- | ------ | ---- | --------------------- | ------------------ |
| `/api/ticketing/seatsio/events/[eventId]/block-seats`   | POST   | ✅   | Organizer/Super-admin | ❌ Not Implemented |
| `/api/ticketing/seatsio/events/[eventId]/unblock-seats` | POST   | ✅   | Organizer/Super-admin | ❌ Not Implemented |
| `/api/ticketing/seatsio/events/[eventId]/blocked-seats` | GET    | ✅   | Organizer/Super-admin | ❌ Not Implemented |
| `/api/ticketing/seatsio/events/[eventId]/availability`  | GET    | ✅   | Organizer/Super-admin | ❌ Not Implemented |

---

## Files Inventory

### ✅ Implemented

- `docs/SEAT_BLOCKING_API.md` - API documentation
- `src/services/seatBlocking.service.js` - Frontend service
- `src/components/ticketing/BlockSeatsModal.js` - Block modal UI
- `src/components/ticketing/UnblockSeatsModal.js` - Unblock modal UI
- `src/components/ticketing/BlockedSeatsList.js` - List view UI

### ❌ Missing

- `src/models/ticketing/BlockedSeats.js` - Database model
- `src/app/api/ticketing/seatsio/events/[eventId]/block-seats/route.js`
- `src/app/api/ticketing/seatsio/events/[eventId]/unblock-seats/route.js`
- `src/app/api/ticketing/seatsio/events/[eventId]/blocked-seats/route.js`
- `src/app/api/ticketing/seatsio/events/[eventId]/availability/route.js`

### 🔧 Needs Modification

- `src/app/panel/my-events/[id]/ticketing/page.js` - Add seat blocking tab
- OR `src/app/panel/my-events/[id]/seating/page.js` - Add blocked seats section

---

## Next Steps

1. **Immediate:** Create backend API routes and database model
2. **Then:** Integrate UI components into ticketing or seating page
3. **Finally:** Test as super-admin and organizer roles
4. **Optional:** Add admin panel view to see all blocked seats across all events

---

## Questions to Resolve

1. **Where to integrate UI?**
    - Ticketing Management page (recommended)
    - Seating Configuration page
    - Dedicated page
    - Multiple locations

2. **Should customers see blocked seats?**
    - Currently: Blocked seats appear as "unavailable"
    - Alternative: Show "Reserved" with reason?

3. **Bulk operations?**
    - Should we support blocking entire sections/rows?
    - CSV import for bulk blocking?

4. **Audit trail?**
    - Track who unblocked seats and when?
    - Keep history of blocking/unblocking?

---

**End of Review**
