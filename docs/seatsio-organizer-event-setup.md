# Seats.io Event Setup Guide (Organizer Flow)

This document covers how organizers create and configure seated events - including selecting pre-built admin charts or designing custom venue charts.

---

## Table of Contents

1. [Overview](#overview)
2. [Event Creation Flow](#event-creation-flow)
3. [API Endpoints](#api-endpoints)
4. [Chart Selection vs Custom Design](#chart-selection-vs-custom-design)
5. [Category to Ticket Type Mapping](#category-to-ticket-type-mapping)
6. [Component Examples](#component-examples)
7. [TypeScript Interfaces](#typescript-interfaces)
8. [Complete Flow Diagram](#complete-flow-diagram)

---

## Overview

### Two Ways to Get a Seating Chart

| Option | Description | Use Case |
|--------|-------------|----------|
| **Select Admin Chart** | Choose from pre-built venue charts created by platform admins | Common venues (O2 Arena, Wembley, etc.) |
| **Design Custom Chart** | Create your own chart using seats.io designer | Unique venues, private events |

### Event Setup Steps

1. Create event with `event_type: 'seated'`
2. Select existing chart OR create custom chart
3. Assign chart to event
4. Create ticket types (VIP, Standard, etc.)
5. Map seats.io categories to ticket types
6. Publish event (creates seats.io event)

---

## Event Creation Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    CREATE SEATED EVENT                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Step 1: Create Event                                            │
│  POST /api/public-events                                         │
│  { "title": "...", "event_type": "seated", ... }                 │
│                                                                   │
│  Step 2: Get Available Charts                                    │
│  GET /api/ticketing/seatsio/charts                               │
│  └─> Returns admin charts + organizer's own charts               │
│                                                                   │
│  Step 3a: SELECT existing chart                                  │
│  └─> Skip to Step 4                                              │
│                                                                   │
│  Step 3b: CREATE custom chart                                    │
│  POST /api/ticketing/seatsio/charts                              │
│  └─> Get designer config                                         │
│  GET /api/ticketing/seatsio/charts/{id}/designer                 │
│  └─> Embed seats.io Chart Designer                               │
│  └─> User designs chart                                          │
│  └─> Sync chart after design                                     │
│  POST /api/ticketing/seatsio/charts/{id}/sync                    │
│                                                                   │
│  Step 4: Assign Chart to Event                                   │
│  POST /api/ticketing/seatsio/events/{eventId}/assign-chart       │
│                                                                   │
│  Step 5: Create Ticket Types                                     │
│  POST /api/ticketing/events/{eventId}/ticket-types               │
│  (Create one for each pricing tier: VIP, Standard, etc.)         │
│                                                                   │
│  Step 6: Map Categories to Ticket Types                          │
│  POST /api/ticketing/seatsio/events/{eventId}/map-categories     │
│                                                                   │
│  Step 7: Publish Event                                           │
│  POST /api/public-events/{eventId}/publish                       │
│  └─> Backend creates seats.io event automatically                │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### 1. Get Available Charts

Returns admin-created charts (available to all) plus organizer's own charts.

```
GET /api/ticketing/seatsio/charts
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "chart-uuid-1",
      "name": "O2 Arena - Standard Layout",
      "venue_name": "O2 Arena",
      "venue_address": "Peninsula Square, London SE10 0DX",
      "city": "London",
      "country": "UK",
      "seatsio_chart_key": "abc123",
      "total_capacity": 20000,
      "categories": [
        { "key": "floor", "label": "Floor", "color": "#FF5733" },
        { "key": "lower-tier", "label": "Lower Tier", "color": "#33FF57" },
        { "key": "upper-tier", "label": "Upper Tier", "color": "#3357FF" }
      ],
      "is_admin_chart": true,
      "is_active": true,
      "thumbnail_url": "https://cdn.seatsio.net/charts/abc123/thumbnail",
      "created_by": {
        "id": "admin-uuid",
        "name": "Platform Admin"
      }
    },
    {
      "id": "chart-uuid-2",
      "name": "My Custom Venue",
      "venue_name": "Private Event Space",
      "city": "Manchester",
      "seatsio_chart_key": "xyz789",
      "total_capacity": 500,
      "categories": [
        { "key": "vip", "label": "VIP", "color": "#FFD700" },
        { "key": "general", "label": "General", "color": "#808080" }
      ],
      "is_admin_chart": false,
      "is_active": true,
      "created_by": {
        "id": "current-user-uuid",
        "name": "Current Organizer"
      }
    }
  ]
}
```

---

### 2. Create Custom Chart

Create a new chart that the organizer can design.

```
POST /api/ticketing/seatsio/charts
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "My Event Venue",
  "venue_name": "Community Hall",
  "venue_address": "123 Main Street",
  "city": "Birmingham",
  "country": "UK",
  "categories": [
    { "key": "vip", "label": "VIP Section", "color": "#FFD700" },
    { "key": "standard", "label": "Standard", "color": "#4CAF50" },
    { "key": "economy", "label": "Economy", "color": "#2196F3" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Chart created successfully",
  "data": {
    "id": "new-chart-uuid",
    "name": "My Event Venue",
    "venue_name": "Community Hall",
    "seatsio_chart_key": "new-chart-key",
    "categories": [
      { "key": "vip", "label": "VIP Section", "color": "#FFD700" },
      { "key": "standard", "label": "Standard", "color": "#4CAF50" },
      { "key": "economy", "label": "Economy", "color": "#2196F3" }
    ],
    "is_admin_chart": false,
    "status": "draft"
  }
}
```

---

### 3. Get Chart Designer Configuration

Get the configuration needed to embed the seats.io Chart Designer.

```
GET /api/ticketing/seatsio/charts/{chartId}/designer
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "designer_key": "designer-key-for-embedding",
    "chart_key": "seatsio-chart-key",
    "secret_key": "workspace-secret-for-designer",
    "features": {
      "enabled": ["sections", "rows", "seats", "generalAdmission", "tables"],
      "disabled": []
    },
    "mode": "design"
  }
}
```

---

### 4. Get Single Chart Details

```
GET /api/ticketing/seatsio/charts/{chartId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "chart-uuid",
    "name": "My Event Venue",
    "venue_name": "Community Hall",
    "venue_address": "123 Main Street",
    "city": "Birmingham",
    "country": "UK",
    "seatsio_chart_key": "chart-key",
    "total_capacity": 500,
    "categories": [
      { "key": "vip", "label": "VIP Section", "color": "#FFD700" },
      { "key": "standard", "label": "Standard", "color": "#4CAF50" }
    ],
    "is_admin_chart": false,
    "is_active": true,
    "status": "published",
    "created_at": "2025-12-28T10:00:00Z",
    "updated_at": "2025-12-28T12:00:00Z"
  }
}
```

---

### 5. Sync Chart from Seats.io

After designing in the Chart Designer, sync to update local data (categories, capacity).

```
POST /api/ticketing/seatsio/charts/{chartId}/sync
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Chart synced successfully",
  "data": {
    "id": "chart-uuid",
    "name": "My Event Venue",
    "total_capacity": 750,
    "categories": [
      { "key": "vip", "label": "VIP Section", "color": "#FFD700" },
      { "key": "standard", "label": "Standard", "color": "#4CAF50" },
      { "key": "balcony", "label": "Balcony", "color": "#9C27B0" }
    ],
    "last_synced_at": "2025-12-28T14:30:00Z"
  }
}
```

---

### 6. Assign Chart to Event

```
POST /api/ticketing/seatsio/events/{eventId}/assign-chart
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "chart_id": "chart-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Chart assigned to event successfully",
  "data": {
    "id": "event-uuid",
    "title": "Concert Night",
    "event_type": "seated",
    "venue_chart_id": "chart-uuid",
    "seatsio_chart_key": "chart-key",
    "venue_chart": {
      "id": "chart-uuid",
      "name": "O2 Arena - Standard Layout",
      "venue_name": "O2 Arena",
      "categories": [...]
    }
  }
}
```

---

### 7. Create Ticket Types

Create ticket types for each pricing tier (existing endpoint).

```
POST /api/ticketing/events/{eventId}/ticket-types
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "VIP Ticket",
  "description": "Front row access with complimentary drinks",
  "price": 15000,
  "capacity": 100,
  "min_per_order": 1,
  "max_per_order": 10,
  "sale_start": "2025-01-01T00:00:00Z",
  "sale_end": "2025-06-01T00:00:00Z"
}
```

**Note:** Price is in cents (15000 = £150.00)

---

### 8. Map Categories to Ticket Types

Link seats.io chart categories to your ticket types for pricing.

```
POST /api/ticketing/seatsio/events/{eventId}/map-categories
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "mappings": [
    {
      "category_key": "vip",
      "category_label": "VIP Section",
      "ticket_type_id": "vip-ticket-uuid"
    },
    {
      "category_key": "standard",
      "category_label": "Standard",
      "ticket_type_id": "standard-ticket-uuid"
    },
    {
      "category_key": "economy",
      "category_label": "Economy",
      "ticket_type_id": "economy-ticket-uuid"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Categories mapped successfully",
  "data": [
    {
      "id": "mapping-uuid-1",
      "event_id": "event-uuid",
      "seatsio_category_key": "vip",
      "category_label": "VIP Section",
      "ticket_type": {
        "id": "vip-ticket-uuid",
        "name": "VIP Ticket",
        "price": 15000
      }
    },
    {
      "id": "mapping-uuid-2",
      "event_id": "event-uuid",
      "seatsio_category_key": "standard",
      "category_label": "Standard",
      "ticket_type": {
        "id": "standard-ticket-uuid",
        "name": "Standard Ticket",
        "price": 7500
      }
    }
  ]
}
```

---

## Chart Selection vs Custom Design

### UI Flow Decision Tree

```
                    ┌─────────────────────┐
                    │  Creating Seated    │
                    │      Event?         │
                    └─────────┬───────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │  Show Chart Options │
                    │  - Available Charts │
                    │  - Create New       │
                    └─────────┬───────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
    ┌─────────────────┐             ┌─────────────────┐
    │ SELECT EXISTING │             │  CREATE CUSTOM  │
    │     CHART       │             │     CHART       │
    └────────┬────────┘             └────────┬────────┘
             │                               │
             │                               ▼
             │                     ┌─────────────────┐
             │                     │ Enter Details   │
             │                     │ - Name          │
             │                     │ - Venue Name    │
             │                     │ - Categories    │
             │                     └────────┬────────┘
             │                              │
             │                              ▼
             │                     ┌─────────────────┐
             │                     │ Open Designer   │
             │                     │ (Embed iframe)  │
             │                     └────────┬────────┘
             │                              │
             │                              ▼
             │                     ┌─────────────────┐
             │                     │ Design Complete │
             │                     │ Sync Chart      │
             │                     └────────┬────────┘
             │                              │
             └──────────────┬───────────────┘
                            │
                            ▼
                  ┌─────────────────┐
                  │  Assign Chart   │
                  │   to Event      │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Create Ticket   │
                  │    Types        │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Map Categories  │
                  │ to Ticket Types │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Publish Event   │
                  └─────────────────┘
```

---

## Category to Ticket Type Mapping

### Concept

Seats.io charts have **categories** (e.g., "Floor", "Balcony", "VIP Box").
Your event has **ticket types** with prices.

**Mapping** connects them: Category "Floor" → Ticket Type "Floor Access" @ £150

### Visual Representation

```
┌─────────────────────────────────────────────────────────────────┐
│                    CATEGORY MAPPING UI                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Chart Categories          →        Ticket Types                │
│  (from seats.io)                    (your pricing)              │
│                                                                  │
│  ┌──────────────────┐              ┌──────────────────┐         │
│  │ 🟡 VIP Section   │  ────────►   │ VIP Ticket       │         │
│  │    (50 seats)    │              │ £150.00          │         │
│  └──────────────────┘              │ [Select ▼]       │         │
│                                    └──────────────────┘         │
│                                                                  │
│  ┌──────────────────┐              ┌──────────────────┐         │
│  │ 🟢 Standard      │  ────────►   │ Standard Ticket  │         │
│  │    (200 seats)   │              │ £75.00           │         │
│  └──────────────────┘              │ [Select ▼]       │         │
│                                    └──────────────────┘         │
│                                                                  │
│  ┌──────────────────┐              ┌──────────────────┐         │
│  │ 🔵 Economy       │  ────────►   │ Economy Ticket   │         │
│  │    (500 seats)   │              │ £35.00           │         │
│  └──────────────────┘              │ [Select ▼]       │         │
│                                    └──────────────────┘         │
│                                                                  │
│  [Save Mappings]                                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Examples

### Chart Selection Component

```tsx
// components/organizer/ChartSelector.tsx
'use client';

import { useState, useEffect } from 'react';

interface VenueChart {
  id: string;
  name: string;
  venue_name: string;
  city: string | null;
  total_capacity: number;
  categories: Array<{ key: string; label: string; color: string }>;
  is_admin_chart: boolean;
  thumbnail_url?: string;
}

interface ChartSelectorProps {
  onSelect: (chart: VenueChart) => void;
  onCreateNew: () => void;
}

export default function ChartSelector({ onSelect, onCreateNew }: ChartSelectorProps) {
  const [charts, setCharts] = useState<VenueChart[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'admin' | 'own'>('all');

  useEffect(() => {
    fetchCharts();
  }, []);

  const fetchCharts = async () => {
    try {
      const response = await fetch('/api/ticketing/seatsio/charts', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (data.success) {
        setCharts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch charts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCharts = charts.filter(chart => {
    if (filter === 'admin') return chart.is_admin_chart;
    if (filter === 'own') return !chart.is_admin_chart;
    return true;
  });

  const adminCharts = filteredCharts.filter(c => c.is_admin_chart);
  const ownCharts = filteredCharts.filter(c => !c.is_admin_chart);

  if (loading) {
    return <div className="loading">Loading available charts...</div>;
  }

  return (
    <div className="chart-selector">
      <div className="selector-header">
        <h2>Select Venue Chart</h2>
        <button onClick={onCreateNew} className="btn-create">
          + Design Custom Chart
        </button>
      </div>

      <div className="filter-tabs">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All Charts ({charts.length})
        </button>
        <button
          className={filter === 'admin' ? 'active' : ''}
          onClick={() => setFilter('admin')}
        >
          Pre-built Venues ({adminCharts.length})
        </button>
        <button
          className={filter === 'own' ? 'active' : ''}
          onClick={() => setFilter('own')}
        >
          My Charts ({ownCharts.length})
        </button>
      </div>

      {/* Admin Charts Section */}
      {(filter === 'all' || filter === 'admin') && adminCharts.length > 0 && (
        <div className="chart-section">
          <h3>Pre-built Venue Charts</h3>
          <p className="section-desc">Popular venues ready to use</p>
          <div className="chart-grid">
            {adminCharts.map(chart => (
              <ChartCard
                key={chart.id}
                chart={chart}
                onSelect={() => onSelect(chart)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Own Charts Section */}
      {(filter === 'all' || filter === 'own') && ownCharts.length > 0 && (
        <div className="chart-section">
          <h3>My Custom Charts</h3>
          <div className="chart-grid">
            {ownCharts.map(chart => (
              <ChartCard
                key={chart.id}
                chart={chart}
                onSelect={() => onSelect(chart)}
                showEditButton
              />
            ))}
          </div>
        </div>
      )}

      {filteredCharts.length === 0 && (
        <div className="empty-state">
          <p>No charts found. Create your first custom chart!</p>
          <button onClick={onCreateNew} className="btn-primary">
            Design Custom Chart
          </button>
        </div>
      )}
    </div>
  );
}

// Chart Card Sub-component
function ChartCard({
  chart,
  onSelect,
  showEditButton = false
}: {
  chart: VenueChart;
  onSelect: () => void;
  showEditButton?: boolean;
}) {
  return (
    <div className="chart-card">
      <div className="chart-thumbnail">
        {chart.thumbnail_url ? (
          <img src={chart.thumbnail_url} alt={chart.name} />
        ) : (
          <div className="placeholder-thumb">No Preview</div>
        )}
        {chart.is_admin_chart && (
          <span className="badge admin">Official</span>
        )}
      </div>

      <div className="chart-info">
        <h4>{chart.name}</h4>
        <p className="venue">{chart.venue_name}</p>
        {chart.city && <p className="location">{chart.city}</p>}
        <p className="capacity">{chart.total_capacity.toLocaleString()} seats</p>

        <div className="categories">
          {chart.categories.slice(0, 3).map(cat => (
            <span
              key={cat.key}
              className="category-tag"
              style={{ backgroundColor: cat.color }}
            >
              {cat.label}
            </span>
          ))}
          {chart.categories.length > 3 && (
            <span className="more">+{chart.categories.length - 3} more</span>
          )}
        </div>
      </div>

      <div className="chart-actions">
        <button onClick={onSelect} className="btn-select">
          Select This Chart
        </button>
        {showEditButton && (
          <button className="btn-edit">Edit Design</button>
        )}
      </div>
    </div>
  );
}
```

### Create Custom Chart Component

```tsx
// components/organizer/CreateChartForm.tsx
'use client';

import { useState } from 'react';

interface Category {
  key: string;
  label: string;
  color: string;
}

interface CreateChartFormProps {
  onCreated: (chartId: string) => void;
  onCancel: () => void;
}

const DEFAULT_COLORS = [
  '#FFD700', // Gold
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#9C27B0', // Purple
  '#FF5722', // Orange
  '#607D8B', // Grey
];

export default function CreateChartForm({ onCreated, onCancel }: CreateChartFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    venue_name: '',
    venue_address: '',
    city: '',
    country: 'UK',
  });

  const [categories, setCategories] = useState<Category[]>([
    { key: 'vip', label: 'VIP', color: DEFAULT_COLORS[0] },
    { key: 'standard', label: 'Standard', color: DEFAULT_COLORS[1] },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addCategory = () => {
    const newKey = `category-${Date.now()}`;
    const colorIndex = categories.length % DEFAULT_COLORS.length;
    setCategories([
      ...categories,
      { key: newKey, label: '', color: DEFAULT_COLORS[colorIndex] },
    ]);
  };

  const updateCategory = (index: number, field: keyof Category, value: string) => {
    const updated = [...categories];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-generate key from label
    if (field === 'label') {
      updated[index].key = value.toLowerCase().replace(/\s+/g, '-');
    }

    setCategories(updated);
  };

  const removeCategory = (index: number) => {
    if (categories.length <= 1) return;
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate categories
    const validCategories = categories.filter(c => c.label.trim());
    if (validCategories.length === 0) {
      setError('At least one category is required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/ticketing/seatsio/charts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          ...formData,
          categories: validCategories,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onCreated(data.data.id);
      } else {
        setError(data.message || 'Failed to create chart');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-chart-form">
      <h2>Create Custom Venue Chart</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="form-section">
        <h3>Chart Details</h3>

        <div className="form-group">
          <label htmlFor="name">Chart Name *</label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Summer Concert Layout"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="venue_name">Venue Name *</label>
          <input
            id="venue_name"
            type="text"
            value={formData.venue_name}
            onChange={e => setFormData({ ...formData, venue_name: e.target.value })}
            placeholder="e.g., City Convention Center"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              id="city"
              type="text"
              value={formData.city}
              onChange={e => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g., London"
            />
          </div>

          <div className="form-group">
            <label htmlFor="country">Country</label>
            <input
              id="country"
              type="text"
              value={formData.country}
              onChange={e => setFormData({ ...formData, country: e.target.value })}
              placeholder="e.g., UK"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="venue_address">Address</label>
          <input
            id="venue_address"
            type="text"
            value={formData.venue_address}
            onChange={e => setFormData({ ...formData, venue_address: e.target.value })}
            placeholder="Full venue address"
          />
        </div>
      </div>

      <div className="form-section">
        <div className="section-header">
          <h3>Seating Categories</h3>
          <button type="button" onClick={addCategory} className="btn-add-category">
            + Add Category
          </button>
        </div>
        <p className="help-text">
          Define pricing zones (e.g., VIP, Standard, Economy). You'll map these to ticket prices later.
        </p>

        <div className="categories-list">
          {categories.map((category, index) => (
            <div key={index} className="category-row">
              <input
                type="color"
                value={category.color}
                onChange={e => updateCategory(index, 'color', e.target.value)}
                className="color-picker"
              />
              <input
                type="text"
                value={category.label}
                onChange={e => updateCategory(index, 'label', e.target.value)}
                placeholder="Category name (e.g., VIP)"
                className="category-label-input"
              />
              <span className="category-key">Key: {category.key || '...'}</span>
              {categories.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCategory(index)}
                  className="btn-remove"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-cancel">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-submit">
          {loading ? 'Creating...' : 'Create & Open Designer'}
        </button>
      </div>
    </form>
  );
}
```

### Chart Designer Embed Component

```tsx
// components/organizer/ChartDesigner.tsx
'use client';

import { useEffect, useState, useRef } from 'react';

interface DesignerConfig {
  designer_key: string;
  chart_key: string;
  secret_key: string;
  features: {
    enabled: string[];
    disabled: string[];
  };
}

interface ChartDesignerProps {
  chartId: string;
  onSave: () => void;
  onCancel: () => void;
}

export default function ChartDesigner({ chartId, onSave, onCancel }: ChartDesignerProps) {
  const [config, setConfig] = useState<DesignerConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const designerRef = useRef<any>(null);

  useEffect(() => {
    fetchDesignerConfig();
    loadSeatsioScript();
  }, [chartId]);

  const loadSeatsioScript = () => {
    if (document.getElementById('seatsio-designer-script')) return;

    const script = document.createElement('script');
    script.id = 'seatsio-designer-script';
    script.src = 'https://cdn-eu.seatsio.net/chart-designer/chart-designer.js';
    script.async = true;
    document.body.appendChild(script);
  };

  const fetchDesignerConfig = async () => {
    try {
      const response = await fetch(
        `/api/ticketing/seatsio/charts/${chartId}/designer`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      const data = await response.json();

      if (data.success) {
        setConfig(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to load designer configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!config || loading) return;

    // Wait for seatsio script to load
    const initDesigner = () => {
      if (typeof (window as any).seatsio === 'undefined') {
        setTimeout(initDesigner, 100);
        return;
      }

      designerRef.current = new (window as any).seatsio.SeatingChartDesigner({
        divId: 'chart-designer-container',
        secretKey: config.secret_key,
        chartKey: config.chart_key,
        features: config.features,
        onChartPublished: handleChartPublished,
        onExitRequested: onCancel,
      }).render();
    };

    initDesigner();

    return () => {
      if (designerRef.current?.destroy) {
        designerRef.current.destroy();
      }
    };
  }, [config, loading]);

  const handleChartPublished = async () => {
    setSaving(true);

    try {
      // Sync chart data after publishing
      const response = await fetch(
        `/api/ticketing/seatsio/charts/${chartId}/sync`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      const data = await response.json();

      if (data.success) {
        onSave();
      } else {
        setError('Chart published but failed to sync: ' + data.message);
      }
    } catch (err) {
      setError('Chart published but failed to sync');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="designer-loading">Loading chart designer...</div>;
  }

  if (error) {
    return (
      <div className="designer-error">
        <p>{error}</p>
        <button onClick={onCancel}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="chart-designer-wrapper">
      <div className="designer-header">
        <h2>Design Your Seating Chart</h2>
        <p>Add sections, rows, and seats. Click "Publish" when done.</p>
      </div>

      <div
        id="chart-designer-container"
        style={{ width: '100%', height: 'calc(100vh - 150px)' }}
      />

      {saving && (
        <div className="saving-overlay">
          <p>Syncing chart data...</p>
        </div>
      )}
    </div>
  );
}
```

### Category Mapping Component

```tsx
// components/organizer/CategoryMapping.tsx
'use client';

import { useState, useEffect } from 'react';

interface Category {
  key: string;
  label: string;
  color: string;
}

interface TicketType {
  id: string;
  name: string;
  price: number;
  capacity: number;
}

interface Mapping {
  category_key: string;
  category_label: string;
  ticket_type_id: string;
}

interface CategoryMappingProps {
  eventId: string;
  categories: Category[];
  onComplete: () => void;
}

export default function CategoryMapping({
  eventId,
  categories,
  onComplete
}: CategoryMappingProps) {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTicketTypes();
  }, [eventId]);

  const fetchTicketTypes = async () => {
    try {
      const response = await fetch(
        `/api/ticketing/events/${eventId}/ticket-types`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      const data = await response.json();

      if (data.success) {
        setTicketTypes(data.data);

        // Initialize mappings with empty values
        const initialMappings: Record<string, string> = {};
        categories.forEach(cat => {
          initialMappings[cat.key] = '';
        });
        setMappings(initialMappings);
      }
    } catch (err) {
      setError('Failed to load ticket types');
    } finally {
      setLoading(false);
    }
  };

  const updateMapping = (categoryKey: string, ticketTypeId: string) => {
    setMappings(prev => ({
      ...prev,
      [categoryKey]: ticketTypeId,
    }));
  };

  const handleSave = async () => {
    // Validate all categories are mapped
    const unmapped = categories.filter(cat => !mappings[cat.key]);
    if (unmapped.length > 0) {
      setError(`Please map all categories. Missing: ${unmapped.map(c => c.label).join(', ')}`);
      return;
    }

    setSaving(true);
    setError(null);

    const mappingData: Mapping[] = categories.map(cat => ({
      category_key: cat.key,
      category_label: cat.label,
      ticket_type_id: mappings[cat.key],
    }));

    try {
      const response = await fetch(
        `/api/ticketing/seatsio/events/${eventId}/map-categories`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ mappings: mappingData }),
        }
      );

      const data = await response.json();

      if (data.success) {
        onComplete();
      } else {
        setError(data.message || 'Failed to save mappings');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (cents: number) => {
    return `£${(cents / 100).toFixed(2)}`;
  };

  if (loading) {
    return <div className="loading">Loading ticket types...</div>;
  }

  if (ticketTypes.length === 0) {
    return (
      <div className="no-ticket-types">
        <h3>No Ticket Types Found</h3>
        <p>Please create ticket types before mapping categories.</p>
        <a href={`/organizer/events/${eventId}/ticket-types`} className="btn-primary">
          Create Ticket Types
        </a>
      </div>
    );
  }

  return (
    <div className="category-mapping">
      <h2>Map Seating Categories to Ticket Types</h2>
      <p className="description">
        Connect each seating zone to a ticket type. This determines pricing for seats in each category.
      </p>

      {error && <div className="error-message">{error}</div>}

      <div className="mapping-table">
        <div className="mapping-header">
          <span>Chart Category</span>
          <span></span>
          <span>Ticket Type (Price)</span>
        </div>

        {categories.map(category => (
          <div key={category.key} className="mapping-row">
            <div className="category-info">
              <span
                className="category-color"
                style={{ backgroundColor: category.color }}
              />
              <span className="category-name">{category.label}</span>
            </div>

            <span className="arrow">→</span>

            <select
              value={mappings[category.key] || ''}
              onChange={e => updateMapping(category.key, e.target.value)}
              className="ticket-type-select"
            >
              <option value="">Select ticket type...</option>
              {ticketTypes.map(tt => (
                <option key={tt.id} value={tt.id}>
                  {tt.name} - {formatPrice(tt.price)}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="mapping-summary">
        <h4>Summary</h4>
        <ul>
          {categories.map(cat => {
            const ticketType = ticketTypes.find(tt => tt.id === mappings[cat.key]);
            return (
              <li key={cat.key}>
                <span style={{ color: cat.color }}>●</span>
                {cat.label}:
                {ticketType ? (
                  <strong> {ticketType.name} ({formatPrice(ticketType.price)})</strong>
                ) : (
                  <em> Not mapped</em>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mapping-actions">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : 'Save Mappings'}
        </button>
      </div>
    </div>
  );
}
```

---

## TypeScript Interfaces

```typescript
// types/seatsio-organizer.ts

export interface VenueChart {
  id: string;
  name: string;
  venue_name: string;
  venue_address: string | null;
  city: string | null;
  country: string | null;
  seatsio_chart_key: string;
  total_capacity: number;
  categories: ChartCategory[];
  is_admin_chart: boolean;
  is_active: boolean;
  status: 'draft' | 'published';
  thumbnail_url?: string;
  created_by: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ChartCategory {
  key: string;
  label: string;
  color: string;
}

export interface CreateChartRequest {
  name: string;
  venue_name: string;
  venue_address?: string;
  city?: string;
  country?: string;
  categories: ChartCategory[];
}

export interface DesignerConfig {
  designer_key: string;
  chart_key: string;
  secret_key: string;
  features: {
    enabled: string[];
    disabled: string[];
  };
  mode: 'design' | 'view';
}

export interface AssignChartRequest {
  chart_id: string;
}

export interface CategoryMapping {
  category_key: string;
  category_label: string;
  ticket_type_id: string;
}

export interface MapCategoriesRequest {
  mappings: CategoryMapping[];
}

export interface TicketType {
  id: string;
  name: string;
  description: string | null;
  price: number; // in cents
  capacity: number;
  sold: number;
  reserved: number;
  min_per_order: number;
  max_per_order: number;
  sale_start: string | null;
  sale_end: string | null;
  is_active: boolean;
}

export interface EventWithSeating {
  id: string;
  title: string;
  event_type: 'general_admission' | 'seated';
  venue_chart_id: string | null;
  seatsio_chart_key: string | null;
  seatsio_event_key: string | null;
  venue_chart: VenueChart | null;
  category_mappings: Array<{
    id: string;
    seatsio_category_key: string;
    category_label: string;
    ticket_type: TicketType;
  }>;
}
```

---

## Complete Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        ORGANIZER EVENT SETUP FLOW                           │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐                                                           │
│  │ Create Event│ POST /api/public-events                                   │
│  │ (seated)    │ { event_type: "seated", ... }                             │
│  └──────┬──────┘                                                           │
│         │                                                                   │
│         ▼                                                                   │
│  ┌─────────────────────────────────────────────────┐                       │
│  │            SELECT SEATING CHART                  │                       │
│  │  GET /api/ticketing/seatsio/charts              │                       │
│  └──────┬──────────────────────────┬───────────────┘                       │
│         │                          │                                        │
│    Use Existing              Create Custom                                  │
│         │                          │                                        │
│         │                          ▼                                        │
│         │               ┌─────────────────────┐                            │
│         │               │ POST /charts        │                            │
│         │               │ Create chart record │                            │
│         │               └──────────┬──────────┘                            │
│         │                          │                                        │
│         │                          ▼                                        │
│         │               ┌─────────────────────┐                            │
│         │               │ GET /charts/{id}/   │                            │
│         │               │     designer        │                            │
│         │               │ Get designer config │                            │
│         │               └──────────┬──────────┘                            │
│         │                          │                                        │
│         │                          ▼                                        │
│         │               ┌─────────────────────┐                            │
│         │               │ Embed seats.io      │                            │
│         │               │ Chart Designer      │                            │
│         │               │ (User designs)      │                            │
│         │               └──────────┬──────────┘                            │
│         │                          │                                        │
│         │                          ▼                                        │
│         │               ┌─────────────────────┐                            │
│         │               │ POST /charts/{id}/  │                            │
│         │               │       sync          │                            │
│         │               │ Sync after design   │                            │
│         │               └──────────┬──────────┘                            │
│         │                          │                                        │
│         └────────────┬─────────────┘                                       │
│                      │                                                      │
│                      ▼                                                      │
│         ┌─────────────────────────────┐                                    │
│         │ POST /events/{id}/assign-   │                                    │
│         │       chart                 │                                    │
│         │ Assign chart to event       │                                    │
│         └──────────────┬──────────────┘                                    │
│                        │                                                    │
│                        ▼                                                    │
│         ┌─────────────────────────────┐                                    │
│         │ POST /ticketing/events/{id}/│                                    │
│         │     ticket-types            │                                    │
│         │ Create ticket types         │                                    │
│         │ (VIP £150, Standard £75...) │                                    │
│         └──────────────┬──────────────┘                                    │
│                        │                                                    │
│                        ▼                                                    │
│         ┌─────────────────────────────┐                                    │
│         │ POST /events/{id}/map-      │                                    │
│         │       categories            │                                    │
│         │ Map categories to tickets   │                                    │
│         └──────────────┬──────────────┘                                    │
│                        │                                                    │
│                        ▼                                                    │
│         ┌─────────────────────────────┐                                    │
│         │ POST /public-events/{id}/   │                                    │
│         │       publish               │                                    │
│         │ Publish event               │                                    │
│         │ (Creates seats.io event)    │                                    │
│         └──────────────┬──────────────┘                                    │
│                        │                                                    │
│                        ▼                                                    │
│                   ┌─────────┐                                              │
│                   │  DONE!  │                                              │
│                   │ Event   │                                              │
│                   │ is live │                                              │
│                   └─────────┘                                              │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Quick Reference

| Step | Endpoint | Method | Auth |
|------|----------|--------|------|
| List charts | `/ticketing/seatsio/charts` | GET | Yes |
| Create chart | `/ticketing/seatsio/charts` | POST | Yes |
| Get designer | `/ticketing/seatsio/charts/{id}/designer` | GET | Yes |
| Sync chart | `/ticketing/seatsio/charts/{id}/sync` | POST | Yes |
| Assign chart | `/ticketing/seatsio/events/{id}/assign-chart` | POST | Yes |
| Create ticket type | `/ticketing/events/{id}/ticket-types` | POST | Yes |
| Map categories | `/ticketing/seatsio/events/{id}/map-categories` | POST | Yes |
| Publish event | `/public-events/{id}/publish` | POST | Yes |

---

## Support

For backend API issues, contact the backend team.

For seats.io Chart Designer questions:
- [Chart Designer Docs](https://docs.seats.io/docs/chart-designer)
- [Designer Embedding](https://docs.seats.io/docs/embedded-designer)
