# Table Components Guide

## Overview

Complete table component system for displaying tabular data with sorting, actions, and responsive design. All components follow the Parlomo Admin Panel design system with full dark mode support via CSS custom properties.

---

## Components

### 1. Table

Base table component with responsive wrapper.

**Props:**

- `striped` (boolean, default: false) - Alternating row colors
- `hoverable` (boolean, default: true) - Row hover effects
- `className` (string) - Additional CSS classes

**Example:**

```jsx
import { Table, TableBody } from "@/components/tables";

<Table>
    <TableHeader>...</TableHeader>
    <TableBody striped hoverable>
        <TableRow>...</TableRow>
    </TableBody>
</Table>;
```

**Features:**

- Automatic horizontal scrolling on mobile
- Rounded borders
- Dark mode support

---

### 2. TableHeader & TableHeaderCell

Table header with sortable column support.

**TableHeader Props:**

- `sticky` (boolean, default: false) - Sticky header on scroll
- `className` (string) - Additional CSS classes

**TableHeaderCell Props:**

- `sortable` (boolean, default: false) - Enable sorting
- `sortDirection` (string: 'asc' | 'desc' | null) - Current sort direction
- `onSort` (function) - Sort handler
- `align` (string: 'left' | 'center' | 'right', default: 'left') - Text alignment
- `width` (string) - Column width
- `className` (string) - Additional CSS classes

**Example:**

```jsx
import { TableHeader, TableHeaderCell } from "@/components/tables";

<TableHeader sticky>
    <tr>
        <TableHeaderCell
            sortable
            sortDirection={sortColumn === "name" ? sortDirection : null}
            onSort={() => handleSort("name")}
        >
            Name
        </TableHeaderCell>
        <TableHeaderCell align="center">Status</TableHeaderCell>
    </tr>
</TableHeader>;
```

**Features:**

- Sort indicators (up/down arrows)
- Sticky header option
- Hover effects on sortable columns
- Customizable alignment and width

---

### 3. TableRow

Reusable table row with consistent styling.

**Props:**

- `onClick` (function) - Click handler (makes row clickable)
- `hoverable` (boolean, default: true) - Hover effect
- `className` (string) - Additional CSS classes

**Example:**

```jsx
import { TableRow } from "@/components/tables";

<TableRow onClick={() => handleRowClick(item)}>
    <TableCell>...</TableCell>
</TableRow>;
```

**Features:**

- Hover effects
- Click handler support
- Border styling
- Transitions

---

### 4. TableCell

Table cell with alignment and styling options.

**Props:**

- `align` (string: 'left' | 'center' | 'right', default: 'left') - Text alignment
- `truncate` (boolean, default: false) - Truncate long text
- `maxWidth` (string) - Maximum cell width
- `className` (string) - Additional CSS classes

**Example:**

```jsx
import { TableCell } from '@/components/tables';

<TableCell align="center">
  <StatusBadge status="active" />
</TableCell>

<TableCell truncate maxWidth="200px">
  This is a very long text that will be truncated...
</TableCell>
```

**Features:**

- Text alignment
- Truncation support
- Custom width
- Dark mode support

---

### 5. TableActions

Pre-styled action buttons for table rows.

**Props:**

- `onView` (function) - View action handler
- `onEdit` (function) - Edit action handler
- `onDelete` (function) - Delete action handler
- `actions` (array, default: ['view', 'edit', 'delete']) - Actions to show
- `loading` (boolean, default: false) - Loading state
- `compact` (boolean, default: false) - Compact mode (dropdown)
- `className` (string) - Additional CSS classes

**Example:**

```jsx
import { TableActions } from '@/components/tables';

// Inline buttons (default)
<TableActions
  onView={() => handleView(item)}
  onEdit={() => handleEdit(item)}
  onDelete={() => handleDelete(item)}
/>

// Compact dropdown (mobile-friendly)
<TableActions
  compact
  onView={() => handleView(item)}
  onEdit={() => handleEdit(item)}
  onDelete={() => handleDelete(item)}
  actions={['view', 'edit']} // Show only specific actions
/>
```

**Individual Action Components:**

```jsx
import { ViewAction, EditAction, DeleteAction } from '@/components/tables';

<ViewAction onClick={handleView} />
<EditAction onClick={handleEdit} disabled={isLoading} />
<DeleteAction onClick={handleDelete} />
```

**Features:**

- Pre-configured action buttons with icons
- Compact dropdown mode for mobile
- Configurable actions
- Loading states
- Individual action exports

---

## Complete Example

```jsx
"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableHeader,
    TableHeaderCell,
    TableRow,
    TableCell,
    TableActions,
} from "@/components/tables";
import { StatusBadge } from "@/components/common/Badge";
import { Pagination } from "@/components/common/Pagination";

export default function UsersPage() {
    const [sortColumn, setSortColumn] = useState("name");
    const [sortDirection, setSortDirection] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);

    const users = [
        { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "active" },
        { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User", status: "active" },
        // ... more users
    ];

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    };

    const handleView = (user) => {
        console.log("Viewing:", user);
    };

    const handleEdit = (user) => {
        console.log("Editing:", user);
    };

    const handleDelete = (user) => {
        console.log("Deleting:", user);
    };

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader sticky>
                    <tr>
                        <TableHeaderCell
                            sortable
                            sortDirection={sortColumn === "name" ? sortDirection : null}
                            onSort={() => handleSort("name")}
                        >
                            Name
                        </TableHeaderCell>
                        <TableHeaderCell
                            sortable
                            sortDirection={sortColumn === "email" ? sortDirection : null}
                            onSort={() => handleSort("email")}
                        >
                            Email
                        </TableHeaderCell>
                        <TableHeaderCell>Role</TableHeaderCell>
                        <TableHeaderCell align="center">Status</TableHeaderCell>
                        <TableHeaderCell align="right">Actions</TableHeaderCell>
                    </tr>
                </TableHeader>
                <TableBody striped hoverable>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <span
                                    style={{ color: "var(--color-text-primary)", fontWeight: 500 }}
                                >
                                    {user.name}
                                </span>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell align="center">
                                <StatusBadge status={user.status} />
                            </TableCell>
                            <TableCell align="right">
                                <TableActions
                                    onView={() => handleView(user)}
                                    onEdit={() => handleEdit(user)}
                                    onDelete={() => handleDelete(user)}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Pagination
                currentPage={currentPage}
                totalPages={10}
                totalItems={100}
                itemsPerPage={10}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(items) => console.log("Items per page:", items)}
            />
        </div>
    );
}
```

---

## Best Practices

### 1. Responsive Design

- Tables automatically scroll horizontally on small screens
- Consider using compact actions on mobile
- Test on various screen sizes

### 2. Performance

- Use `key` prop on TableRow for efficient rendering
- Implement pagination for large datasets
- Consider virtualization for very large tables (1000+ rows)

### 3. Accessibility

- Use semantic HTML (table, thead, tbody, tr, th, td)
- Provide clear labels for sortable columns
- Ensure sufficient color contrast
- Add ARIA labels for action buttons

### 4. Dark Mode

- All components use CSS variables from globals.css
- Never hard-code colors
- Test in both light and dark themes

### 5. Sorting

- Store sort state at page level
- Apply sorting logic before rendering
- Show clear visual indicators for sort direction

### 6. Actions

- Use inline actions for desktop (default)
- Use compact dropdown for mobile or space-constrained tables
- Confirm destructive actions (delete) with a modal

---

## Styling Customization

All table components use CSS custom properties for consistent theming:

```css
/* Available CSS variables */
--color-background       /* Table background */
--color-secondary        /* Header background */
--color-border          /* Borders */
--color-text-primary    /* Primary text */
--color-text-secondary  /* Secondary text */
--color-hover           /* Row hover background */
--color-primary         /* Sort indicators, links */
```

To customize spacing or borders, extend the components:

```jsx
<Table className="border-2">
  {/* Custom border width */}
</Table>

<TableCell className="px-8 py-6">
  {/* Custom padding */}
</TableCell>
```

---

## Integration with Redux

For data-driven tables with Redux:

```jsx
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { fetchUsers } from "@/features/users/usersSlice";

export default function UsersPage() {
    const dispatch = useAppDispatch();
    const { users, loading, error } = useAppSelector((state) => state.users);

    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    if (loading) return <SkeletonTable rows={5} />;
    if (error) return <EmptyState variant="error" />;
    if (!users.length) return <EmptyState />;

    return <Table>{/* Render users */}</Table>;
}
```

---

## Demo Page

See complete examples with all features on the Components Demo page:

- Navigate to: `/components-demo`
- Section: **Phase 3.4: Data Display (Tables)**

Examples include:

- Basic table
- Sortable table
- Table with inline actions
- Table with compact dropdown actions
- Complete table with all features
- Table features overview

---

## Files Created

- `src/components/tables/Table.js` - Base table component
- `src/components/tables/TableHeader.js` - Header with sortable columns
- `src/components/tables/TableRow.js` - Reusable row component
- `src/components/tables/TableCell.js` - Cell with alignment options
- `src/components/tables/TableActions.js` - Action buttons (view, edit, delete)
- `src/components/tables/index.js` - Central export file

---

## Related Components

These table components work well with:

- **Badge/StatusBadge** - For status display in cells
- **Button** - For custom actions
- **Pagination** - For paginated tables
- **Skeleton** - For loading states (SkeletonTable)
- **EmptyState** - For no data scenarios
- **Modal** - For confirm actions or detail views

---

**Implementation Status:** ✅ Completed - Phase 3.4 (Data Display)

**Next Steps:** Phase 4 - Service Layer & Mock Data
