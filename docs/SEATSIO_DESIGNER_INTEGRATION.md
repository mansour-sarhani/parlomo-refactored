# Seats.io Chart Designer Integration Guide

> Complete guide for integrating the Seats.io Chart Designer to allow admins and organizers to edit seat layouts.

---

## Table of Contents

1. [Overview](#1-overview)
2. [API Reference](#2-api-reference)
3. [Web Integration](#3-web-integration)
4. [Flutter Integration](#4-flutter-integration)
5. [Complete Flow](#5-complete-flow)
6. [Event Callbacks](#6-event-callbacks)
7. [Best Practices](#7-best-practices)

---

## 1. Overview

The Seats.io Chart Designer allows users to visually create and edit seating layouts. Users can:

- Add seats, rows, sections, tables
- Define categories (VIP, Standard, etc.)
- Set general admission areas
- Add background images
- Configure accessibility options

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHART EDITING FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  STEP 1: Get Designer Configuration                            │
│  ─────────────────────────────────                              │
│  GET /api/admin/seatsio/venue-charts/{id}/designer              │
│  → Returns: chart_key, secret_key, region, mode                 │
│                                                                 │
│  STEP 2: Embed Designer                                         │
│  ─────────────────────────                                      │
│  Load Seats.io Designer in WebView/iframe                       │
│  → User visually edits seat layout                              │
│  → Changes saved as DRAFT automatically                         │
│                                                                 │
│  STEP 3: Publish Changes                                        │
│  ───────────────────────                                        │
│  POST /api/admin/seatsio/venue-charts/{id}/publish              │
│  → Publishes draft changes                                      │
│  → Syncs categories & capacity to database                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. API Reference

### 2.1 Get Designer Configuration

**GET** `/api/admin/seatsio/venue-charts/{id}/designer`

**Headers:**

```
Authorization: Bearer {token}
```

**Response:**

```json
{
    "success": true,
    "data": {
        "chart_key": "abc123-chart-key",
        "secret_key": "your-workspace-secret-key",
        "region": "eu",
        "mode": "safe"
    }
}
```

**Response Fields:**

| Field        | Type   | Description                                 |
| ------------ | ------ | ------------------------------------------- |
| `chart_key`  | string | Unique identifier for the chart in Seats.io |
| `secret_key` | string | Workspace secret key for designer access    |
| `region`     | string | Seats.io region: `eu` or `na`               |
| `mode`       | string | Designer mode: `safe` (recommended)         |

---

### 2.2 Publish Chart Changes

**POST** `/api/admin/seatsio/venue-charts/{id}/publish`

Publishes any draft changes made in the designer and syncs the updated categories/capacity to the database.

**Headers:**

```
Authorization: Bearer {token}
```

**Response:**

```json
{
    "success": true,
    "message": "Chart published successfully",
    "data": {
        "id": "uuid",
        "name": "Main Arena Layout",
        "total_capacity": 5000,
        "categories": [
            { "key": "vip", "label": "VIP", "color": "#FFD700" },
            { "key": "standard", "label": "Standard", "color": "#4CAF50" }
        ],
        "category_capacities": { "vip": 500, "standard": 4500 }
    }
}
```

---

### 2.3 Sync Chart Data

**POST** `/api/admin/seatsio/venue-charts/{id}/sync`

Syncs chart data from Seats.io without publishing (useful for refreshing data).

**Headers:**

```
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "message": "Chart synced successfully",
  "data": {
    "id": "uuid",
    "name": "Main Arena Layout",
    "total_capacity": 5000,
    "categories": [...],
    "category_capacities": {...}
  }
}
```

---

## 3. Web Integration

### 3.1 Load Seats.io SDK

Add the Seats.io script to your page:

```html
<!-- For EU region -->
<script src="https://cdn-eu.seatsio.net/chart.js"></script>

<!-- For NA region -->
<script src="https://cdn-na.seatsio.net/chart.js"></script>
```

### 3.2 HTML Container

```html
<div id="chart-designer" style="width: 100%; height: 600px;"></div>
```

### 3.3 JavaScript Implementation

```javascript
// Step 1: Fetch designer configuration from your API
async function loadDesignerConfig(chartId) {
    const response = await fetch(`/api/admin/seatsio/venue-charts/${chartId}/designer`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
    });
    const result = await response.json();
    return result.data;
}

// Step 2: Initialize the designer
async function initializeDesigner(chartId) {
    const config = await loadDesignerConfig(chartId);

    const designer = new seatsio.SeatingChartDesigner({
        divId: "chart-designer",
        secretKey: config.secret_key,
        chartKey: config.chart_key,
        region: config.region,
        mode: config.mode, // 'safe' mode recommended

        // Optional: Language
        language: "en",

        // Optional: Features configuration
        features: {
            enabled: ["backgroundImage", "generalAdmission", "sections"],
            disabled: [],
        },

        // Event callbacks
        onDesignerRendered: function (designer) {
            console.log("Designer is ready");
        },

        onDesignerRenderingFailed: function (error) {
            console.error("Designer failed to load:", error);
        },

        onChartUpdated: function (event) {
            console.log("Chart was updated (draft saved)");
            // Show "Unsaved changes" indicator
        },

        onChartPublished: function (event) {
            console.log("Chart was published");
            // Call your API to sync
            syncChartData(chartId);
        },

        onExitRequested: function () {
            // User clicked close/exit
            if (confirm("Exit the designer?")) {
                closeDesigner();
            }
        },
    }).render();

    return designer;
}

// Step 3: Publish changes via your API
async function publishChart(chartId) {
    const response = await fetch(`/api/admin/seatsio/venue-charts/${chartId}/publish`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
    });
    const result = await response.json();

    if (result.success) {
        alert("Chart published successfully!");
        console.log("Updated chart:", result.data);
    } else {
        alert("Failed to publish: " + result.message);
    }
}

// Usage
initializeDesigner("chart-uuid-here");
```

### 3.4 React Component Example

```jsx
import { useEffect, useRef, useState } from "react";

function SeatsioDesigner({ chartId, onPublished }) {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasChanges, setHasChanges] = useState(false);
    const designerRef = useRef(null);

    useEffect(() => {
        loadConfig();
    }, [chartId]);

    const loadConfig = async () => {
        try {
            const response = await fetch(`/api/admin/seatsio/venue-charts/${chartId}/designer`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const result = await response.json();
            setConfig(result.data);
        } catch (error) {
            console.error("Failed to load config:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!config) return;

        // Load Seats.io script dynamically
        const script = document.createElement("script");
        script.src = `https://cdn-${config.region}.seatsio.net/chart.js`;
        script.onload = () => {
            designerRef.current = new seatsio.SeatingChartDesigner({
                divId: "designer-container",
                secretKey: config.secret_key,
                chartKey: config.chart_key,
                region: config.region,
                mode: config.mode,
                onChartUpdated: () => setHasChanges(true),
                onChartPublished: () => {
                    setHasChanges(false);
                    handlePublish();
                },
            }).render();
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [config]);

    const handlePublish = async () => {
        const response = await fetch(`/api/admin/seatsio/venue-charts/${chartId}/publish`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (result.success) {
            onPublished?.(result.data);
        }
    };

    if (loading) return <div>Loading designer...</div>;

    return (
        <div>
            <div className="designer-header">
                <h2>Edit Seating Chart</h2>
                {hasChanges && <span className="badge">Unsaved Changes</span>}
                <button onClick={handlePublish} disabled={!hasChanges}>
                    Publish Changes
                </button>
            </div>
            <div id="designer-container" style={{ width: "100%", height: "600px" }} />
        </div>
    );
}

export default SeatsioDesigner;
```

---

## 4. Flutter Integration

### 4.1 Required Packages

```yaml
dependencies:
    webview_flutter: ^4.4.2
    dio: ^5.4.0
```

### 4.2 Designer Config Model

```dart
class DesignerConfig {
  final String chartKey;
  final String secretKey;
  final String region;
  final String mode;

  DesignerConfig({
    required this.chartKey,
    required this.secretKey,
    required this.region,
    required this.mode,
  });

  factory DesignerConfig.fromJson(Map<String, dynamic> json) {
    return DesignerConfig(
      chartKey: json['chart_key'],
      secretKey: json['secret_key'],
      region: json['region'],
      mode: json['mode'],
    );
  }
}
```

### 4.3 Designer Widget

```dart
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class SeatsioDesignerWidget extends StatefulWidget {
  final String chartId;
  final String accessToken;
  final VoidCallback? onPublished;
  final VoidCallback? onClose;

  const SeatsioDesignerWidget({
    Key? key,
    required this.chartId,
    required this.accessToken,
    this.onPublished,
    this.onClose,
  }) : super(key: key);

  @override
  State<SeatsioDesignerWidget> createState() => _SeatsioDesignerWidgetState();
}

class _SeatsioDesignerWidgetState extends State<SeatsioDesignerWidget> {
  late WebViewController _controller;
  DesignerConfig? _config;
  bool _loading = true;
  bool _hasChanges = false;

  @override
  void initState() {
    super.initState();
    _loadConfig();
  }

  Future<void> _loadConfig() async {
    try {
      // Fetch designer config from your API
      final response = await Dio().get(
        '/api/admin/seatsio/venue-charts/${widget.chartId}/designer',
        options: Options(headers: {
          'Authorization': 'Bearer ${widget.accessToken}',
        }),
      );

      if (response.data['success']) {
        setState(() {
          _config = DesignerConfig.fromJson(response.data['data']);
          _loading = false;
        });
        _initWebView();
      }
    } catch (e) {
      print('Failed to load config: $e');
      setState(() => _loading = false);
    }
  }

  void _initWebView() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..addJavaScriptChannel(
        'FlutterChannel',
        onMessageReceived: _handleMessage,
      )
      ..loadHtmlString(_buildDesignerHtml());
  }

  void _handleMessage(JavaScriptMessage message) {
    final data = jsonDecode(message.message);

    switch (data['type']) {
      case 'designerReady':
        print('Designer is ready');
        break;
      case 'chartUpdated':
        setState(() => _hasChanges = true);
        break;
      case 'chartPublished':
        setState(() => _hasChanges = false);
        _publishToBackend();
        break;
      case 'exitRequested':
        _handleExit();
        break;
      case 'error':
        print('Designer error: ${data['message']}');
        break;
    }
  }

  Future<void> _publishToBackend() async {
    try {
      final response = await Dio().post(
        '/api/admin/seatsio/venue-charts/${widget.chartId}/publish',
        options: Options(headers: {
          'Authorization': 'Bearer ${widget.accessToken}',
        }),
      );

      if (response.data['success']) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Chart published successfully!')),
        );
        widget.onPublished?.call();
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to publish chart')),
      );
    }
  }

  void _handleExit() {
    if (_hasChanges) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: Text('Unsaved Changes'),
          content: Text('You have unsaved changes. Are you sure you want to exit?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                Navigator.pop(ctx);
                widget.onClose?.call();
              },
              child: Text('Exit'),
            ),
          ],
        ),
      );
    } else {
      widget.onClose?.call();
    }
  }

  String _buildDesignerHtml() {
    return '''
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script src="https://cdn-${_config!.region}.seatsio.net/chart.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 100%; height: 100vh; overflow: hidden; }
    #designer { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="designer"></div>
  <script>
    try {
      new seatsio.SeatingChartDesigner({
        divId: 'designer',
        secretKey: '${_config!.secretKey}',
        chartKey: '${_config!.chartKey}',
        region: '${_config!.region}',
        mode: '${_config!.mode}',
        language: 'en',

        onDesignerRendered: function(designer) {
          FlutterChannel.postMessage(JSON.stringify({type: 'designerReady'}));
        },

        onDesignerRenderingFailed: function(error) {
          FlutterChannel.postMessage(JSON.stringify({
            type: 'error',
            message: error.message || 'Designer failed to load'
          }));
        },

        onChartUpdated: function(event) {
          FlutterChannel.postMessage(JSON.stringify({type: 'chartUpdated'}));
        },

        onChartPublished: function(event) {
          FlutterChannel.postMessage(JSON.stringify({type: 'chartPublished'}));
        },

        onExitRequested: function() {
          FlutterChannel.postMessage(JSON.stringify({type: 'exitRequested'}));
        }
      }).render();
    } catch (error) {
      FlutterChannel.postMessage(JSON.stringify({
        type: 'error',
        message: error.message
      }));
    }
  </script>
</body>
</html>
''';
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        appBar: AppBar(title: Text('Loading Designer...')),
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_config == null) {
      return Scaffold(
        appBar: AppBar(title: Text('Error')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error, size: 64, color: Colors.red),
              SizedBox(height: 16),
              Text('Failed to load designer configuration'),
              ElevatedButton(
                onPressed: _loadConfig,
                child: Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('Edit Seating Chart'),
        leading: IconButton(
          icon: Icon(Icons.close),
          onPressed: _handleExit,
        ),
        actions: [
          if (_hasChanges)
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 8),
              child: Chip(
                label: Text('Unsaved'),
                backgroundColor: Colors.orange,
              ),
            ),
        ],
      ),
      body: WebViewWidget(controller: _controller),
    );
  }
}
```

### 4.4 Usage Example

```dart
// Navigate to designer
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => SeatsioDesignerWidget(
      chartId: chart.id,
      accessToken: authController.token,
      onPublished: () {
        // Refresh chart list or details
        chartController.refresh();
      },
      onClose: () {
        Navigator.pop(context);
      },
    ),
  ),
);
```

---

## 5. Complete Flow

### Admin Editing a Chart

```
┌─────────────────────────────────────────────────────────────────┐
│  ADMIN CHART EDITING FLOW                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Admin navigates to Chart Management                         │
│     └─▶ GET /admin/seatsio/venue-charts                         │
│                                                                 │
│  2. Admin clicks "Edit Layout" on a chart                       │
│     └─▶ GET /admin/seatsio/venue-charts/{id}/designer           │
│     └─▶ Open designer in WebView/Modal                          │
│                                                                 │
│  3. Admin uses visual tools to:                                 │
│     • Add/remove seats                                          │
│     • Create sections and rows                                  │
│     • Define categories (VIP, Standard, etc.)                   │
│     • Set category colors                                       │
│     • Add general admission areas                               │
│     • Upload background image                                   │
│                                                                 │
│  4. Changes auto-save as DRAFT in Seats.io                      │
│                                                                 │
│  5. Admin clicks "Publish" button in designer                   │
│     └─▶ onChartPublished callback fires                         │
│     └─▶ POST /admin/seatsio/venue-charts/{id}/publish           │
│     └─▶ Backend syncs categories & capacity                     │
│                                                                 │
│  6. Chart is now updated and available for events!              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Event Callbacks

### Available Callbacks

| Callback                           | Description                      |
| ---------------------------------- | -------------------------------- |
| `onDesignerRendered(designer)`     | Designer finished loading        |
| `onDesignerRenderingFailed(error)` | Designer failed to load          |
| `onChartUpdated(event)`            | Chart was modified (draft saved) |
| `onChartPublished(event)`          | User clicked publish in designer |
| `onExitRequested()`                | User wants to close designer     |

### Handling in Flutter

```dart
void _handleMessage(JavaScriptMessage message) {
  final data = jsonDecode(message.message);

  switch (data['type']) {
    case 'designerReady':
      // Hide loading indicator
      break;
    case 'chartUpdated':
      // Show "unsaved changes" badge
      break;
    case 'chartPublished':
      // Call publish API, show success message
      break;
    case 'exitRequested':
      // Show confirmation if unsaved changes
      break;
  }
}
```

---

## 7. Best Practices

### Security

1. **Never expose secret_key in client-side code for production**
    - For production, consider using a short-lived token approach
    - Or use iframe with server-side rendered URL

2. **Always validate user permissions**
    - Ensure only admins/owners can access designer endpoint

### UX

1. **Show loading state** while designer loads

2. **Track unsaved changes**

    ```dart
    bool _hasChanges = false;

    // Set when onChartUpdated fires
    // Clear when onChartPublished fires
    ```

3. **Confirm before closing** with unsaved changes

4. **Auto-sync after publish**
    ```dart
    onChartPublished: () {
      _publishToBackend();  // Sync to your database
    }
    ```

### Error Handling

```dart
try {
  await loadDesignerConfig();
} catch (e) {
  showErrorDialog('Failed to load designer. Please try again.');
}
```

---

## Quick Reference

### Endpoints

| Method | Endpoint                                    | Description         |
| ------ | ------------------------------------------- | ------------------- |
| GET    | `/admin/seatsio/venue-charts/{id}/designer` | Get designer config |
| POST   | `/admin/seatsio/venue-charts/{id}/publish`  | Publish changes     |
| POST   | `/admin/seatsio/venue-charts/{id}/sync`     | Sync data only      |

### CDN URLs

| Region | URL                                   |
| ------ | ------------------------------------- |
| EU     | `https://cdn-eu.seatsio.net/chart.js` |
| NA     | `https://cdn-na.seatsio.net/chart.js` |

---

## Support

- [Seats.io Designer Documentation](https://docs.seats.io/docs/embedded-designer/introduction/)
- [Seats.io API Reference](https://docs.seats.io/reference)
