# ERP 2026-2027 Architecture Implementation

## Overview

This document describes the modern ERP architecture implemented for the Nexo ERP system, following 2026-2027 best practices.

## Core Principles

### 1. Inventory as Ledger

**Old approach:** Store stock quantity in product documents or separate inventory records.

**New approach:** Inventory is a **calculated view** from a movement ledger (StockMovement collection).

- Every entry, exit, transfer, adjustment is a movement record
- Current stock = SUM of all movements for (warehouse + product + lot)
- Provides complete audit trail and traceability
- No risk of quantity mismatches between documents

### 2. Unit Conversions

Products support:
- **Base Unit**: Unit for inventory control (KG, PZA, LT)
- **Purchase Unit**: Unit for buying (CAJA, TARIMA, LOTE)
- **Units Per Package**: Conversion factor (1 CAJA = 80 KG)

When receiving goods:
- Capture: "2 CAJAS received"
- System calculates: 2 × 80 = 160 KG in inventory
- Cost per base unit: Total / 160

### 3. Lot & Expiry Tracking

- **Lot tracking**: Optional per product (ninguno/lote/serie)
- **Expiry dates**: User enters date directly (not calculated from "días de vida útil")
- **FIFO/FEFO**: Automatic lot selection using First-Expired-First-Out

### 4. Complete Traceability

Every movement record includes references to source documents:

**From Suppliers:**
- proveedorId, ordenCompraId, recepcionId

**From Sales:**
- clienteId, ordenVentaId, remisionId, facturaId

**From Transfers:**
- transferenciaId

**From Production:**
- ordenProduccionId

**Result:** Full chain: product → supplier → receipt → movement → inventory → sale → delivery → invoice

### 5. Status Workflows

**Purchase Orders:**
- borrador → autorizada → enviada → recibida_parcial → recibida_completa

**Sales Orders:**
- draft → confirmed → in_progress → delivered → invoiced

**Transfers:**
- solicitada → aprobada → en_transito → recibida

**Physical Counts:**
- en_progreso → completado → ajustado

## Data Flow Examples

### Purchase Flow

1. Create Purchase Order (PO)
2. Authorize PO
3. Send PO to supplier
4. Create Goods Receipt
   - Enter: Boxes received, lot number, expiry date
   - System converts boxes → base units
   - System calculates cost per base unit
5. System creates StockMovement (tipo: recepcion_compra)
   - Traces: proveedorId, ordenCompraId, recepcionId
   - Stores: lote, fechaCaducidad
6. Inventory increases (calculated from ledger)

### Sales Flow

1. Create Sales Order (draft)
2. Confirm order
3. System fulfills order:
   - Selects lots using FIFO/FEFO
   - Creates StockMovement (tipo: venta) for each lot
   - Traces: clienteId, ordenVentaId, remisionId
4. Creates Delivery document (remisión)
5. Inventory decreases (calculated from ledger)
6. Optionally create Invoice (factura)

### Transfer Flow

1. Create Transfer request
2. Approve transfer
3. Ship from origin
   - Creates StockMovement (tipo: transferencia_salida)
4. Receive at destination
   - Creates StockMovement (tipo: transferencia_entrada)
5. Inventory balanced across warehouses

## Key Collections

- **warehouses**: Physical locations
- **products**: Product catalog with unit definitions
- **supplierProducts**: Supplier pricing with unit conversions
- **purchaseOrders**: Purchase orders
- **goodsReceipts**: Receipt documents
- **stockMovements**: **Ledger of all inventory movements**
- **inventoryStock**: **Calculated view** (not stored, computed from movements)
- **salesOrders**: Sales orders
- **deliveries**: Delivery notes (remisiones)
- **invoices**: Sales invoices
- **warehouseTransfers**: Inter-warehouse transfers
- **physicalCounts**: Physical inventory counts

## Benefits

1. **Audit trail**: Every movement is logged with full context
2. **Traceability**: Follow product from supplier to customer
3. **Unit flexibility**: Buy in boxes, sell in pieces, track in kilograms
4. **FIFO compliance**: Automatic lot rotation
5. **No sync issues**: Inventory is always calculated from movements
6. **Scalability**: Ledger-based approach scales to millions of transactions
7. **Compliance**: Full documentation for audits and regulations

## Migration Notes

- Existing inventoryStock records should be migrated to initial stockMovements
- companyId must be present in all documents for multi-tenant queries
- Users should have companyId in their profile for proper filtering
