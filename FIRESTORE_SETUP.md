# Firestore Collections Setup

## New Collections for Financial Tracking

This document describes the Firestore collections needed to support the financial dashboard metrics.

### 1. `purchases` Collection

Tracks purchases of raw materials, supplies, and production costs.

**Document Structure:**
\`\`\`typescript
{
  id: string (auto-generated)
  supplierId?: string
  supplierName: string
  description: string
  amount: number
  date: Timestamp
  category: "raw_materials" | "supplies" | "production" | "other"
  status: "pending" | "completed" | "cancelled"
  invoiceNumber?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
\`\`\`

**Example:**
\`\`\`json
{
  "supplierName": "Flores del Valle",
  "description": "Compra de rosas para producción",
  "amount": 1500.00,
  "date": "2025-01-15T00:00:00Z",
  "category": "raw_materials",
  "status": "completed",
  "invoiceNumber": "INV-001"
}
\`\`\`

### 2. `expenses` Collection

Tracks operating expenses (OpEx) like rent, utilities, salaries, etc.

**Document Structure:**
\`\`\`typescript
{
  id: string (auto-generated)
  description: string
  amount: number
  date: Timestamp
  category: "rent" | "utilities" | "salaries" | "marketing" | "maintenance" | "other"
  status: "pending" | "paid"
  paymentMethod?: string
  invoiceNumber?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
\`\`\`

**Example:**
\`\`\`json
{
  "description": "Renta del local - Enero 2025",
  "amount": 5000.00,
  "date": "2025-01-01T00:00:00Z",
  "category": "rent",
  "status": "paid",
  "paymentMethod": "transfer"
}
\`\`\`

### 3. `inventorySnapshots` Collection

Stores monthly inventory valuations for COGS calculation.

**Document Structure:**
\`\`\`typescript
{
  id: string (auto-generated)
  period: string // Format: "YYYY-MM" (e.g., "2025-01")
  periodStart: Timestamp
  periodEnd: Timestamp
  openingValue: number
  closingValue: number
  method: "fifo" | "lifo" | "average"
  status: "draft" | "closed"
  notes?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
\`\`\`

**Example:**
\`\`\`json
{
  "period": "2025-01",
  "periodStart": "2025-01-01T00:00:00Z",
  "periodEnd": "2025-01-31T23:59:59Z",
  "openingValue": 15000.00,
  "closingValue": 12000.00,
  "method": "average",
  "status": "closed"
}
\`\`\`

### 4. Updated `orders` Collection

Ensure orders have the following fields for revenue calculation:

**Required Fields:**
- `status`: "completed" or "processing" orders are counted as revenue
- `total`: Total amount of the order
- `date`: Timestamp of when the order was placed
- `quantity`: Number of items

### 5. Updated `products` Collection

Products should have cost information for inventory valuation:

**Required Fields:**
- `cost`: Cost per unit (for COGS and inventory valuation)
- `price`: Selling price per unit
- `stock`: Current stock quantity

## Financial Calculations

### COGS (Cost of Goods Sold)
\`\`\`
COGS = Opening Inventory + Purchases - Closing Inventory
\`\`\`

### Gross Profit
\`\`\`
Gross Profit = Total Revenue - COGS
\`\`\`

### Operating Profit
\`\`\`
Operating Profit = Gross Profit - Operating Expenses (OpEx)
\`\`\`

### Operating Margin
\`\`\`
Operating Margin = (Operating Profit / Total Revenue) × 100
\`\`\`

## Setup Instructions

1. Create the three new collections in your Firestore database: `purchases`, `expenses`, `inventorySnapshots`
2. Add sample data to test the calculations
3. For the current month, create an inventory snapshot document to enable COGS calculation
4. Ensure existing orders have `status`, `total`, `date`, and `quantity` fields
5. Update products with `cost` field if not already present

## Fallback Behavior

If no inventory snapshots exist:
- The system will try to calculate closing inventory from the current products collection
- Opening inventory will be taken from the previous month's closing value if available
- If no data is available, values will default to 0 with a "pendiente de cierre" status indicator
