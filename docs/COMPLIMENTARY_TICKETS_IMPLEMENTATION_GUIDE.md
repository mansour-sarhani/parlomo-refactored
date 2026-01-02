# Complimentary Tickets Implementation Guide

This guide provides ready-to-use React components for the Complimentary Tickets feature, following your existing codebase patterns.

## ✅ Already Completed

1. **Type Definitions** - [`src/types/complimentary-tickets-types.js`](../src/types/complimentary-tickets-types.js)
2. **Service Layer** - Extended [`src/services/ticketing.service.js`](../src/services/ticketing.service.js) with 5 new methods
3. **Redux State** - Extended [`src/features/ticketing/ticketingSlice.js`](../src/features/ticketing/ticketingSlice.js) with state, thunks, and selectors

## 📝 Components To Create

All components follow your existing patterns (useState, toast from 'sonner', etc.)

---

## Component 1: ComplimentaryTicketForm

**File:** `src/components/ticketing/organizer/ComplimentaryTicketForm.js`

### Key Features:
- Reuses existing `SeatingChart` component for seat selection
- Form validation
- Supports multiple ticket types
- Toast notifications

### Dependencies:
```javascript
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { toast } from 'sonner';
import SeatingChart from '@/components/ticketing/SeatingChart';
import SelectedSeatsSummary from '@/components/ticketing/SelectedSeatsSummary';
import {
    issueComplimentaryTickets,
    selectSelectedSeats,
    clearSelectedSeats,
    selectTicketingLoading,
} from '@/features/ticketing/ticketingSlice';
```

### Implementation Notes:
- Uses existing seat selection Redux state (`selectedSeats`)
- Validates that selected seats match ticket quantity for seated events
- Clears seats after successful submission
- Shows SeatingChart inline (not in modal) for better UX
- Handles all API error scenarios from documentation

### Form Fields:
1. **Recipient Info**: name (required), email (required), phone (optional)
2. **Ticket Selection**: Dynamic array of {ticketTypeId, quantity}
3. **Seat Selection**: Only shown for seated events, uses `SeatingChart` component
4. **Reason**: Dropdown with pre-defined options (VIP Guest, Sponsor, Media Pass, Staff, Other)
5. **Notes**: Optional textarea

---

## Component 2: ComplimentaryTicketsList

**File:** `src/components/ticketing/organizer/ComplimentaryTicketsList.js`

### Key Features:
- Table view of all complimentary tickets
- Search by name/email/order number
- Date range filter
- CSV export
- Summary stats cards

### Dependencies:
```javascript
import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, Download, Search } from 'lucide-react';
import { Button } from '@/components/common/Button';
import {
    fetchComplimentaryTickets,
    selectComplimentaryTickets,
    selectComplimentaryTicketsLoading,
} from '@/features/ticketing/ticketingSlice';
```

### Implementation Notes:
- Fetches data on mount using `fetchComplimentaryTickets` thunk
- Client-side search and filtering
- Uses `useMemo` for performance
- Exports to CSV using blob download pattern

### Table Columns:
1. Order Number (monospace font)
2. Recipient Name
3. Email
4. Ticket Count (badge)
5. Reason (badge)
6. Issued By (if available)
7. Date (formatted)
8. Actions (View button)

---

## Component 3: ComplimentaryTicketDetailsModal

**File:** `src/components/ticketing/organizer/ComplimentaryTicketDetailsModal.js`

### Key Features:
- Modal displaying full order details
- List of tickets with seat info
- Email resend button
- PDF download button

### Dependencies:
```javascript
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Download, X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { toast } from 'sonner';
import ticketingService from '@/services/ticketing.service';
import {
    fetchComplimentaryTicketDetails,
    selectSelectedComplimentaryTicket,
    selectTicketingLoading,
} from '@/features/ticketing/ticketingSlice';
```

### Implementation Notes:
- Fetches details when modal opens
- Handles resend email with graceful fallback
- Handles PDF download with blob creation
- Shows event info, recipient info, issuance info, notes, and all tickets

---

## Component 4: ComplimentaryTicketsManager

**File:** `src/components/ticketing/organizer/ComplimentaryTicketsManager.js`

### Key Features:
- Tab-based interface: "Issue Tickets" and "Issued Tickets"
- Manages modal state
- Coordinates between form and list

### Dependencies:
```javascript
import { useState } from 'react';
import ComplimentaryTicketForm from './ComplimentaryTicketForm';
import ComplimentaryTicketsList from './ComplimentaryTicketsList';
import ComplimentaryTicketDetailsModal from './ComplimentaryTicketDetailsModal';
```

### Implementation Notes:
- Simple state management for tabs and modals
- Passes callbacks between components
- Switches to "Issued Tickets" tab after successful issuance

---

## Component 5: Permission Utilities

**File:** `src/utils/permissions.js` (or extend existing auth utils)

```javascript
/**
 * Check if user can manage complimentary tickets
 * @param {Object} user - Current user
 * @param {Object} event - Event object
 * @returns {boolean}
 */
export const canManageComplimentaryTickets = (user, event) => {
    if (!user) return false;

    // Super admin or admin can manage any event
    if (user.role === 'super_admin' || user.role === 'admin') {
        return true;
    }

    // Organizer can manage their own events
    if (user.role === 'organizer' && event.organizer_id === user.id) {
        return true;
    }

    return false;
};
```

---

## Integration into Ticketing Page

**File:** `src/app/panel/my-events/[id]/ticketing/page.js`

### Changes Needed:

1. **Import the manager component:**
```javascript
import ComplimentaryTicketsManager from '@/components/ticketing/organizer/ComplimentaryTicketsManager';
import { canManageComplimentaryTickets } from '@/utils/permissions';
```

2. **Check permissions:**
```javascript
// Inside component
const user = useSelector((state) => state.auth.user); // Adjust path as needed
const canManageComp = canManageComplimentaryTickets(user, event);
```

3. **Update tabs array:**
```javascript
const tabs = [
    { id: 'tickets', label: 'Ticket Types' },
    { id: 'sales', label: 'Sales Analytics' },
    { id: 'attendees', label: 'Attendees' },
    { id: 'promocodes', label: 'Promo Codes' },
    // Add complimentary tickets tab (only if user has permission)
    ...(canManageComp ? [{ id: 'complimentary', label: 'Complimentary Tickets' }] : []),
    ...(isSeatedEvent ? [{ id: 'blocked', label: 'Blocked Seats' }] : []),
];
```

4. **Add tab content:**
```javascript
{activeTab === 'complimentary' && (
    <ComplimentaryTicketsManager
        eventId={eventId}
        ticketTypes={ticketTypes}
        isSeatedEvent={isSeatedEvent}
    />
)}
```

---

## Error Handling Patterns

Based on API documentation, handle these scenarios:

### 1. **403 Unauthorized**
```javascript
if (error.response?.status === 403) {
    toast.error('You do not have permission to issue complimentary tickets');
    return;
}
```

### 2. **400 Seat Already Booked**
```javascript
if (error.response?.data?.message?.includes('already booked')) {
    toast.error('Selected seats are already booked. Please choose different seats.');
    // Clear selected seats
    dispatch(clearSelectedSeats());
    return;
}
```

### 3. **400 Insufficient Availability**
```javascript
if (error.response?.data?.message?.includes('Not enough tickets')) {
    toast.error('Not enough tickets available for the selected type');
    return;
}
```

### 4. **422 Validation Errors**
```javascript
if (error.response?.status === 422 && error.response?.data?.errors) {
    const errors = error.response.data.errors;
    Object.values(errors).flat().forEach(msg => toast.error(msg));
    return;
}
```

---

## Styling Guide

Follow existing component patterns:

### Cards:
```javascript
<div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
```

### Form Inputs:
```javascript
<input
    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
    required
/>
```

### Buttons:
```javascript
<Button loading={saving} className="w-full">
    Submit
</Button>
```

### Badges:
```javascript
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
    {count}
</span>
```

---

## Testing Checklist

### Functional Tests:
- [ ] Issue complimentary tickets for general admission
- [ ] Issue complimentary tickets for seated event with seat selection
- [ ] Verify seat count matches ticket quantity validation
- [ ] Test search and filter functionality
- [ ] Test CSV export
- [ ] View ticket details in modal
- [ ] Resend email (with graceful fallback)
- [ ] Download PDF (with graceful fallback)
- [ ] Permission checks hide tab for non-authorized users

### Edge Cases:
- [ ] Seat count mismatch error
- [ ] Already booked seats error
- [ ] Maximum 50 tickets per issuance
- [ ] Field length validations (name 255, reason 200, notes 1000)
- [ ] Empty states (no tickets issued yet)
- [ ] Loading states during API calls

### UI/UX:
- [ ] Responsive on mobile/tablet/desktop
- [ ] Dark mode compatibility
- [ ] Toast notifications for all actions
- [ ] Form resets after successful submission
- [ ] Tab switching works correctly

---

## Next Steps

1. Create the 4 component files listed above
2. Add permission utility function
3. Integrate into ticketing page
4. Test thoroughly
5. Deploy to staging for user acceptance testing

---

## Quick Implementation Order

1. **ComplimentaryTicketsManager** (Main container - simplest)
2. **ComplimentaryTicketsList** (List view - moderate complexity)
3. **ComplimentaryTicketDetailsModal** (Details view - moderate)
4. **ComplimentaryTicketForm** (Form with validation - most complex)
5. **Integration** (Add tab to ticketing page)
6. **Permissions** (Add utility function)

---

## Additional Notes

- **Seats.io is already installed** - No package installation needed
- **Existing components to reuse**:
  - `SeatingChart` - for seat selection
  - `SelectedSeatsSummary` - to display selected seats
  - `Button`, form inputs, badges - from common components
- **Redux state for seats** - Already managed, just use `selectedSeats` from Redux
- **API error handling** - Backend will return proper error messages per documentation

---

## Support

Refer to:
- **API Docs**: [`docs/COMPLIMENTARY_TICKETS_API.md`](./COMPLIMENTARY_TICKETS_API.md)
- **Implementation Plan**: [`~/.claude/plans/deep-sprouting-donut.md`](~/.claude/plans/deep-sprouting-donut.md)
- **Existing Components**: Check `src/components/ticketing/organizer/PromoCodeManager.js` for form patterns

