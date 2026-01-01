# Seat Blocking API Documentation

> API documentation for blocking and managing reserved seats for events.

---

## Overview

Seat blocking allows organizers and admins to reserve specific seats that should not be available for public purchase. Common use cases include:

- **VIP seats** - Reserved for VIP guests
- **Sponsor seats** - Reserved for event sponsors  
- **Accessibility seats** - Reserved for guests with special needs
- **Production seats** - Reserved for cameras, sound equipment
- **Technical seats** - Reserved for technical crew
- **Other** - Any other reservation reason

---

## Base URL

```
https://api.parlomo.co.uk/api
```

## Authentication

All endpoints require Bearer token authentication:

```
Authorization: Bearer {access_token}
```

## Authorization

- **Organizers** can block/unblock seats for their own events
- **Super Admins** can block/unblock seats for any event

---

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ticketing/seatsio/events/{eventId}/block-seats` | Block specific seats |
| POST | `/ticketing/seatsio/events/{eventId}/unblock-seats` | Unblock/release seats |
| GET | `/ticketing/seatsio/events/{eventId}/blocked-seats` | Get all blocked seats |
| GET | `/ticketing/seatsio/events/{eventId}/availability` | Get seat availability by category |

---

## 1. Block Seats

**POST** `/ticketing/seatsio/events/{eventId}/block-seats`

Blocks specific seats for an event, making them unavailable for purchase.

### Request Body

```json
{
  "seat_labels": ["A-1", "A-2", "A-3", "B-10"],
  "reason": "VIP",
  "notes": "Reserved for VIP guests - John Smith party"
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `seat_labels` | array | Yes | Array of seat labels to block |
| `reason` | string | Yes | Reason for blocking (see options below) |
| `notes` | string | No | Additional notes (max 500 chars) |

### Reason Options

| Value | Description |
|-------|-------------|
| `VIP` | Reserved for VIP guests |
| `Sponsor` | Reserved for event sponsors |
| `Accessibility` | Reserved for guests with special accessibility needs |
| `Production` | Reserved for cameras, equipment, etc. |
| `Technical` | Reserved for technical crew |
| `Other` | Any other reason |

### Success Response (200)

```json
{
  "success": true,
  "message": "4 seat(s) blocked successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "event_id": "event-uuid",
    "seat_labels": ["A-1", "A-2", "A-3", "B-10"],
    "reason": "VIP",
    "notes": "Reserved for VIP guests - John Smith party",
    "blocked_by": "user-uuid",
    "blocked_at": "2025-12-31T19:00:00.000000Z",
    "created_at": "2025-12-31T19:00:00.000000Z",
    "updated_at": "2025-12-31T19:00:00.000000Z"
  }
}
```

### Error Responses

**Validation Error (422)**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "seat_labels": ["The seat labels field is required."],
    "reason": ["The selected reason is invalid."]
  }
}
```

**Event Not Seated (400)**
```json
{
  "success": false,
  "message": "Seats.io event not created"
}
```

**Unauthorized (403)**
```json
{
  "message": "You do not have permission to manage this event"
}
```

**Seats Already Booked (400)**
```json
{
  "success": false,
  "message": "Cannot block seats that are already booked: A-1, A-2"
}
```

---

## 2. Unblock Seats

**POST** `/ticketing/seatsio/events/{eventId}/unblock-seats`

Releases previously blocked seats, making them available for purchase again.

### Request Body

```json
{
  "seat_labels": ["A-1", "A-2"]
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `seat_labels` | array | Yes | Array of seat labels to unblock |

### Success Response (200)

```json
{
  "success": true,
  "message": "Seats unblocked successfully"
}
```

### Error Response (400)

```json
{
  "success": false,
  "message": "Failed to unblock seats: A-1 is not blocked"
}
```

---

## 3. Get Blocked Seats

**GET** `/ticketing/seatsio/events/{eventId}/blocked-seats`

Retrieves all currently blocked seats for an event.

### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "event_id": "event-uuid",
      "seat_labels": ["A-1", "A-2", "A-3"],
      "reason": "VIP",
      "notes": "John Smith party",
      "blocked_by": {
        "id": "user-uuid",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "blocked_at": "2025-12-31T19:00:00.000000Z",
      "created_at": "2025-12-31T19:00:00.000000Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "event_id": "event-uuid",
      "seat_labels": ["C-5", "C-6"],
      "reason": "Production",
      "notes": "Camera positions",
      "blocked_by": {
        "id": "user-uuid-2",
        "name": "Event Organizer"
      },
      "blocked_at": "2025-12-30T10:00:00.000000Z",
      "created_at": "2025-12-30T10:00:00.000000Z"
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier for the block record |
| `event_id` | UUID | The event ID |
| `seat_labels` | array | List of blocked seat labels |
| `reason` | string | Reason for blocking |
| `notes` | string | Additional notes |
| `blocked_by` | object | User who blocked the seats |
| `blocked_at` | datetime | When the seats were blocked |

---

## 4. Get Seat Availability

**GET** `/ticketing/seatsio/events/{eventId}/availability`

Gets seat availability breakdown by category.

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "vip": {
      "category_key": "vip",
      "category_label": "VIP Section",
      "total": 100,
      "available": 85,
      "booked": 10,
      "held": 2,
      "blocked": 3,
      "ticket_type": {
        "id": "ticket-type-uuid",
        "name": "VIP Ticket",
        "price": 15000,
        "price_formatted": "£150.00",
        "currency": "GBP"
      }
    },
    "standard": {
      "category_key": "standard",
      "category_label": "Standard Seating",
      "total": 500,
      "available": 450,
      "booked": 40,
      "held": 5,
      "blocked": 5,
      "ticket_type": {
        "id": "ticket-type-uuid-2",
        "name": "Standard Ticket",
        "price": 7500,
        "price_formatted": "£75.00",
        "currency": "GBP"
      }
    }
  }
}
```

### Availability Fields

| Field | Description |
|-------|-------------|
| `total` | Total seats in category |
| `available` | Seats available for purchase |
| `booked` | Seats already purchased |
| `held` | Seats temporarily held during checkout |
| `blocked` | Seats blocked by organizer/admin |

---

## Flutter Integration

### Blocking Seats

```dart
class SeatBlockingService {
  final Dio _dio;
  final String baseUrl;
  
  SeatBlockingService(this._dio, this.baseUrl);

  /// Block seats for an event
  Future<BlockedSeatResult> blockSeats({
    required String eventId,
    required List<String> seatLabels,
    required String reason,
    String? notes,
  }) async {
    final response = await _dio.post(
      '$baseUrl/ticketing/seatsio/events/$eventId/block-seats',
      data: {
        'seat_labels': seatLabels,
        'reason': reason,
        if (notes != null) 'notes': notes,
      },
    );
    
    if (response.data['success']) {
      return BlockedSeatResult.fromJson(response.data['data']);
    }
    throw Exception(response.data['message']);
  }

  /// Unblock seats for an event
  Future<void> unblockSeats({
    required String eventId,
    required List<String> seatLabels,
  }) async {
    final response = await _dio.post(
      '$baseUrl/ticketing/seatsio/events/$eventId/unblock-seats',
      data: {
        'seat_labels': seatLabels,
      },
    );
    
    if (!response.data['success']) {
      throw Exception(response.data['message']);
    }
  }

  /// Get all blocked seats for an event
  Future<List<BlockedSeatRecord>> getBlockedSeats(String eventId) async {
    final response = await _dio.get(
      '$baseUrl/ticketing/seatsio/events/$eventId/blocked-seats',
    );
    
    if (response.data['success']) {
      return (response.data['data'] as List)
          .map((e) => BlockedSeatRecord.fromJson(e))
          .toList();
    }
    throw Exception(response.data['message']);
  }

  /// Get seat availability
  Future<Map<String, CategoryAvailability>> getAvailability(String eventId) async {
    final response = await _dio.get(
      '$baseUrl/ticketing/seatsio/events/$eventId/availability',
    );
    
    if (response.data['success']) {
      final Map<String, dynamic> data = response.data['data'];
      return data.map((key, value) => 
        MapEntry(key, CategoryAvailability.fromJson(value))
      );
    }
    throw Exception(response.data['message']);
  }
}
```

### Models

```dart
/// Reason for blocking seats
enum BlockReason {
  vip('VIP'),
  sponsor('Sponsor'),
  accessibility('Accessibility'),
  production('Production'),
  technical('Technical'),
  other('Other');

  final String value;
  const BlockReason(this.value);
}

/// Blocked seat record
class BlockedSeatRecord {
  final String id;
  final String eventId;
  final List<String> seatLabels;
  final String reason;
  final String? notes;
  final BlockedByUser? blockedBy;
  final DateTime blockedAt;

  BlockedSeatRecord({
    required this.id,
    required this.eventId,
    required this.seatLabels,
    required this.reason,
    this.notes,
    this.blockedBy,
    required this.blockedAt,
  });

  factory BlockedSeatRecord.fromJson(Map<String, dynamic> json) {
    return BlockedSeatRecord(
      id: json['id'],
      eventId: json['event_id'],
      seatLabels: List<String>.from(json['seat_labels']),
      reason: json['reason'],
      notes: json['notes'],
      blockedBy: json['blocked_by'] != null 
          ? BlockedByUser.fromJson(json['blocked_by']) 
          : null,
      blockedAt: DateTime.parse(json['blocked_at']),
    );
  }
  
  /// Get reason display text
  String get reasonDisplay {
    switch (reason) {
      case 'VIP': return 'VIP Reserved';
      case 'Sponsor': return 'Sponsor Reserved';
      case 'Accessibility': return 'Accessibility Reserved';
      case 'Production': return 'Production Equipment';
      case 'Technical': return 'Technical Crew';
      default: return 'Reserved';
    }
  }
  
  /// Get total number of blocked seats
  int get seatCount => seatLabels.length;
}

/// User who blocked the seats
class BlockedByUser {
  final String id;
  final String name;
  final String? email;

  BlockedByUser({
    required this.id,
    required this.name,
    this.email,
  });

  factory BlockedByUser.fromJson(Map<String, dynamic> json) {
    return BlockedByUser(
      id: json['id'],
      name: json['name'],
      email: json['email'],
    );
  }
}

/// Category availability
class CategoryAvailability {
  final String categoryKey;
  final String categoryLabel;
  final int total;
  final int available;
  final int booked;
  final int held;
  final int blocked;

  CategoryAvailability({
    required this.categoryKey,
    required this.categoryLabel,
    required this.total,
    required this.available,
    required this.booked,
    required this.held,
    required this.blocked,
  });

  factory CategoryAvailability.fromJson(Map<String, dynamic> json) {
    return CategoryAvailability(
      categoryKey: json['category_key'],
      categoryLabel: json['category_label'],
      total: json['total'],
      available: json['available'],
      booked: json['booked'],
      held: json['held'],
      blocked: json['blocked'],
    );
  }
  
  /// Calculate occupancy percentage
  double get occupancyPercent => total > 0 ? (booked / total) * 100 : 0;
  
  /// Calculate availability percentage
  double get availabilityPercent => total > 0 ? (available / total) * 100 : 0;
}
```

### UI Example - Block Seats Dialog

```dart
class BlockSeatsDialog extends StatefulWidget {
  final String eventId;
  final List<String> selectedSeats;
  final VoidCallback onSuccess;

  const BlockSeatsDialog({
    Key? key,
    required this.eventId,
    required this.selectedSeats,
    required this.onSuccess,
  }) : super(key: key);

  @override
  State<BlockSeatsDialog> createState() => _BlockSeatsDialogState();
}

class _BlockSeatsDialogState extends State<BlockSeatsDialog> {
  BlockReason _selectedReason = BlockReason.vip;
  final _notesController = TextEditingController();
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text('Block ${widget.selectedSeats.length} Seat(s)'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Selected seats: ${widget.selectedSeats.join(", ")}'),
          SizedBox(height: 16),
          
          Text('Reason:'),
          DropdownButton<BlockReason>(
            value: _selectedReason,
            isExpanded: true,
            items: BlockReason.values.map((reason) {
              return DropdownMenuItem(
                value: reason,
                child: Text(reason.value),
              );
            }).toList(),
            onChanged: (value) {
              setState(() => _selectedReason = value!);
            },
          ),
          
          SizedBox(height: 16),
          TextField(
            controller: _notesController,
            decoration: InputDecoration(
              labelText: 'Notes (optional)',
              hintText: 'e.g., Reserved for John Smith',
              border: OutlineInputBorder(),
            ),
            maxLines: 2,
            maxLength: 500,
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: _isLoading ? null : _blockSeats,
          child: _isLoading 
              ? SizedBox(
                  width: 20, 
                  height: 20, 
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : Text('Block Seats'),
        ),
      ],
    );
  }

  Future<void> _blockSeats() async {
    setState(() => _isLoading = true);
    
    try {
      await SeatBlockingService().blockSeats(
        eventId: widget.eventId,
        seatLabels: widget.selectedSeats,
        reason: _selectedReason.value,
        notes: _notesController.text.isNotEmpty ? _notesController.text : null,
      );
      
      Navigator.pop(context);
      widget.onSuccess();
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Seats blocked successfully')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to block seats: $e')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }
}
```

### UI Example - Blocked Seats List

```dart
class BlockedSeatsListPage extends StatelessWidget {
  final String eventId;

  const BlockedSeatsListPage({Key? key, required this.eventId}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Blocked Seats'),
      ),
      body: FutureBuilder<List<BlockedSeatRecord>>(
        future: SeatBlockingService().getBlockedSeats(eventId),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(child: CircularProgressIndicator());
          }
          
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          
          final blockedSeats = snapshot.data!;
          
          if (blockedSeats.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.event_seat, size: 64, color: Colors.grey),
                  SizedBox(height: 16),
                  Text('No blocked seats'),
                ],
              ),
            );
          }
          
          return ListView.builder(
            itemCount: blockedSeats.length,
            itemBuilder: (context, index) {
              final record = blockedSeats[index];
              return Card(
                margin: EdgeInsets.all(8),
                child: ListTile(
                  leading: CircleAvatar(
                    child: Text(record.seatCount.toString()),
                  ),
                  title: Text(record.seatLabels.join(', ')),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Reason: ${record.reasonDisplay}'),
                      if (record.notes != null) Text('Notes: ${record.notes}'),
                      Text(
                        'Blocked by ${record.blockedBy?.name ?? "Unknown"}',
                        style: TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                    ],
                  ),
                  trailing: IconButton(
                    icon: Icon(Icons.lock_open),
                    onPressed: () => _unblockSeats(context, record),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }

  Future<void> _unblockSeats(BuildContext context, BlockedSeatRecord record) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Unblock Seats?'),
        content: Text('Are you sure you want to unblock ${record.seatLabels.join(", ")}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: Text('Unblock'),
          ),
        ],
      ),
    );
    
    if (confirm == true) {
      try {
        await SeatBlockingService().unblockSeats(
          eventId: eventId,
          seatLabels: record.seatLabels,
        );
        // Refresh the list
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Seats unblocked successfully')),
        );
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to unblock: $e')),
        );
      }
    }
  }
}
```

---

## Use Cases

### 1. Block VIP Seats Before Event Goes Live

```dart
// Block front row for VIP guests
await seatBlockingService.blockSeats(
  eventId: eventId,
  seatLabels: ['A-1', 'A-2', 'A-3', 'A-4', 'A-5'],
  reason: 'VIP',
  notes: 'Reserved for celebrity guests',
);
```

### 2. Reserve Accessibility Seats

```dart
// Block wheelchair accessible seats
await seatBlockingService.blockSeats(
  eventId: eventId,
  seatLabels: ['ACC-1', 'ACC-2', 'ACC-3', 'ACC-4'],
  reason: 'Accessibility',
  notes: 'Wheelchair accessible - call venue for booking',
);
```

### 3. Block Production Equipment Locations

```dart
// Block seats where cameras will be placed
await seatBlockingService.blockSeats(
  eventId: eventId,
  seatLabels: ['M-15', 'M-16', 'M-17'],
  reason: 'Production',
  notes: 'Camera positions for live broadcast',
);
```

### 4. Release Unused VIP Seats Close to Event

```dart
// Release VIP seats that weren't claimed
await seatBlockingService.unblockSeats(
  eventId: eventId,
  seatLabels: ['A-4', 'A-5'],  // These guests cancelled
);
```

---

## Notes

1. **Blocked seats in Seats.io**: Blocked seats appear as unavailable on the seating chart. Customers cannot select them.

2. **Blocking already booked seats**: The API will reject attempts to block seats that are already purchased.

3. **Multiple block records**: You can have multiple block records for the same event (e.g., one for VIP, one for Production).

4. **Partial unblocking**: You can unblock specific seats from a block record without unblocking all of them.

---

## Quick Reference

| Action | Method | Endpoint |
|--------|--------|----------|
| Block seats | POST | `/ticketing/seatsio/events/{eventId}/block-seats` |
| Unblock seats | POST | `/ticketing/seatsio/events/{eventId}/unblock-seats` |
| List blocked | GET | `/ticketing/seatsio/events/{eventId}/blocked-seats` |
| Availability | GET | `/ticketing/seatsio/events/{eventId}/availability` |

| Reason | Value |
|--------|-------|
| VIP Reserved | `VIP` |
| Sponsor Reserved | `Sponsor` |
| Accessibility | `Accessibility` |
| Production | `Production` |
| Technical | `Technical` |
| Other | `Other` |
