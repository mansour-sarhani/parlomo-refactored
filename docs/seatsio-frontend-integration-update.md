# Seats.io Frontend Integration - Updated API Response

## Change Summary

The `/designer` endpoint response has been updated to match seats.io's actual requirements.

---

## Designer Endpoint

### Endpoint
```
GET /api/ticketing/seatsio/charts/{chartId}/designer
Authorization: Bearer {token}
```

### Updated Response
```json
{
  "success": true,
  "data": {
    "chart_key": "abc123-seatsio-chart-key",
    "secret_key": "your-workspace-secret-key",
    "region": "eu",
    "mode": "safe"
  }
}
```

### Response Fields

| Field | Description |
|-------|-------------|
| `chart_key` | The seats.io chart key to load in the designer |
| `secret_key` | Workspace secret key for authentication |
| `region` | API region (`eu` or `na`) |
| `mode` | Designer mode (`safe` recommended) |

---

## Frontend Implementation

### 1. Load Seats.io Script

```html
<!-- For EU region -->
<script src="https://cdn-eu.seatsio.net/chart.js"></script>

<!-- For NA region -->
<script src="https://cdn-na.seatsio.net/chart.js"></script>
```

### 2. Embed Designer

```javascript
// Fetch designer config from backend
const response = await fetch(
  `/api/ticketing/seatsio/charts/${chartId}/designer`,
  {
    headers: { Authorization: `Bearer ${token}` }
  }
);
const { data } = await response.json();

// Embed seats.io Chart Designer
new seatsio.SeatingChartDesigner({
  divId: 'chart-designer-container',
  secretKey: data.secret_key,
  chartKey: data.chart_key,
  mode: data.mode,

  // Optional callbacks
  onChartPublished: (chartKey) => {
    console.log('Chart published:', chartKey);
    // Call sync endpoint after publishing
    syncChart(chartId);
  },
  onExitRequested: () => {
    // User clicked exit
    handleExit();
  }
}).render();
```

### 3. React/Next.js Component

```tsx
'use client';

import { useEffect, useState, useRef } from 'react';

interface DesignerConfig {
  chart_key: string;
  secret_key: string;
  region: string;
  mode: string;
}

interface ChartDesignerProps {
  chartId: string;
  onPublish?: () => void;
  onExit?: () => void;
}

export default function ChartDesigner({ chartId, onPublish, onExit }: ChartDesignerProps) {
  const [config, setConfig] = useState<DesignerConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const designerRef = useRef<any>(null);

  useEffect(() => {
    // Load seats.io script
    const script = document.createElement('script');
    script.src = 'https://cdn-eu.seatsio.net/chart.js'; // Change to cdn-na for NA region
    script.async = true;
    document.body.appendChild(script);

    // Fetch designer config
    fetchConfig();

    return () => {
      if (designerRef.current?.destroy) {
        designerRef.current.destroy();
      }
    };
  }, [chartId]);

  const fetchConfig = async () => {
    try {
      const response = await fetch(
        `/api/ticketing/seatsio/charts/${chartId}/designer`,
        {
          headers: { Authorization: `Bearer ${getToken()}` }
        }
      );
      const data = await response.json();

      if (data.success) {
        setConfig(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to load designer config');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!config || loading) return;

    const initDesigner = () => {
      if (typeof (window as any).seatsio === 'undefined') {
        setTimeout(initDesigner, 100);
        return;
      }

      designerRef.current = new (window as any).seatsio.SeatingChartDesigner({
        divId: 'chart-designer',
        secretKey: config.secret_key,
        chartKey: config.chart_key,
        mode: config.mode,
        onChartPublished: async () => {
          // Sync chart after publishing
          await fetch(`/api/ticketing/seatsio/charts/${chartId}/sync`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${getToken()}` }
          });
          onPublish?.();
        },
        onExitRequested: () => {
          onExit?.();
        }
      }).render();
    };

    initDesigner();
  }, [config, loading]);

  if (loading) return <div>Loading designer...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div
      id="chart-designer"
      style={{ width: '100%', height: '80vh' }}
    />
  );
}
```

---

## After Design: Sync Chart

After the user finishes designing and publishes the chart, call the sync endpoint to update local data:

```
POST /api/ticketing/seatsio/charts/{chartId}/sync
Authorization: Bearer {token}
```

This updates categories, capacity, and thumbnail in your database.

---

## Region-Specific CDN URLs

| Region | Script URL |
|--------|------------|
| Europe (eu) | `https://cdn-eu.seatsio.net/chart.js` |
| North America (na) | `https://cdn-na.seatsio.net/chart.js` |

Use the same region as configured in backend (`SEATSIO_REGION` in `.env`).

---

## Quick Reference

| Task | Endpoint | Method |
|------|----------|--------|
| Get designer config | `/ticketing/seatsio/charts/{id}/designer` | GET |
| Sync after publish | `/ticketing/seatsio/charts/{id}/sync` | POST |
| Get chart details | `/ticketing/seatsio/charts/{id}` | GET |
