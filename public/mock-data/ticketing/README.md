# Mock Ticketing Database

This directory contains the JSON-based mock database for the ticketing system.

## Files

- `ticket-types.json` - Ticket type configurations
- `orders.json` - Purchase orders
- `order-items.json` - Order line items
- `tickets.json` - Individual ticket instances
- `promo-codes.json` - Promotional discount codes
- `fees.json` - Platform and service fees

## Seeding Data

To populate the database with sample data:

### Method 1: API Route (Recommended)
1. Start the development server: `npm run dev`
2. Send a POST request to: `http://localhost:3000/api/seed-ticketing`

Using curl:
```bash
curl -X POST http://localhost:3000/api/seed-ticketing
```

### Method 2: npm Script
```bash
npm run seed-ticketing
```

## Data Structure

All data is stored as objects indexed by ID:

```json
{
  "1": { "id": 1, "name": "...", ... },
  "2": { "id": 2, "name": "...", ... }
}
```

## Notes

- Data persists between server restarts
- Seeding will reset all existing data
- Only works in development mode
- IDs are auto-incremented
