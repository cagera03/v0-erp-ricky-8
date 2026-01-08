# ERP 2026-2027 - Documentación Final Completa

## 🎯 RESUMEN EJECUTIVO

Implementación completa de un ERP moderno con arquitectura de inventario basada en ledger (movimientos), trazabilidad end-to-end, conversiones de unidades, FIFO/FEFO automático y sincronización en tiempo real.

---

## 📁 ARCHIVOS MODIFICADOS

### Hooks (Lógica de Negocio)
1. `hooks/use-sales-data.ts` - Gestión de órdenes de venta con validación de inventario
2. `hooks/use-warehouse-data.ts` - Gestión de almacenes, inventario y movimientos
3. `hooks/use-suppliers-data.ts` - Gestión de proveedores, órdenes de compra y recepciones

### Componentes de Ventas
4. `components/sales/sales-order-form.tsx` - Formulario con selector de almacén obligatorio
5. `components/sales/sales-order-lines-tab.tsx` - Tabla con disponibilidad en tiempo real

### Utilidades
6. `lib/utils/inventory-ledger.ts` - Motor de cálculo de inventario y FIFO/FEFO
7. `lib/types.ts` - Tipos TypeScript actualizados con arquitectura ERP 2026-2027
8. `lib/firestore.ts` - Colecciones Firestore

### Configuración
9. `firestore.rules` - Reglas de seguridad actualizadas

### Documentación
10. `ERP_2026_2027_ARCHITECTURE.md` - Arquitectura del sistema
11. `ERP_2026_2027_FINAL_DOCUMENTATION.md` - Este documento

---

## 🗄️ COLECCIONES DE FIRESTORE

### Colecciones Principales (ERP 2026-2027)

#### 1. **warehouses** (Almacenes)
```typescript
{
  id: string (auto)
  userId: string (required)
  companyId?: string
  nombre: string
  codigo: string
  ubicacion: string
  tipo: "principal" | "sucursal" | "bodega" | "transito"
  estado: "activo" | "inactivo" | "mantenimiento"
  responsable?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### 2. **stockMovements** (Ledger de Inventario) ⭐
```typescript
{
  id: string (auto)
  userId: string (required)
  companyId?: string
  folio: string
  
  // Ubicación
  almacenId: string
  almacenNombre: string
  
  // Producto
  productoId: string
  productoNombre: string
  sku: string
  
  // Tipo de movimiento
  tipo: "entrada" | "salida" | "ajuste" | "recepcion_compra" | 
        "devolucion_compra" | "venta" | "devolucion_venta" | 
        "transferencia_salida" | "transferencia_entrada" | 
        "produccion_consumo" | "produccion_salida"
  
  // Cantidades (siempre en unidades base)
  unidadBase: string
  cantidad: number
  cantidadAnterior: number
  cantidadNueva: number
  
  // Costos (por unidad base)
  costoUnitario: number
  costoTotal: number
  
  // Lote/Caducidad (opcional)
  lote?: string | null
  fechaCaducidad?: Timestamp | null
  
  // Trazabilidad - Referencias a documentos origen
  proveedorId?: string | null
  proveedorNombre?: string | null
  ordenCompraId?: string | null
  ordenCompraFolio?: string | null
  recepcionId?: string | null
  recepcionFolio?: string | null
  
  clienteId?: string | null
  clienteNombre?: string | null
  ordenVentaId?: string | null
  ordenVentaFolio?: string | null
  remisionId?: string | null
  remisionFolio?: string | null
  facturaId?: string | null
  facturaFolio?: string | null
  
  transferenciaId?: string | null
  conteoFisicoId?: string | null
  ordenProduccionId?: string | null
  
  fecha: Timestamp
  referencia?: string
  notas?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Índices compuestos requeridos para stockMovements:**
- `userId` ASC + `almacenId` ASC + `fecha` DESC
- `userId` ASC + `productoId` ASC + `fecha` ASC
- `userId` ASC + `almacenId` ASC + `productoId` ASC + `fecha` ASC
- `companyId` ASC + `almacenId` ASC + `fecha` DESC
- `ordenVentaId` ASC + `fecha` DESC

#### 3. **inventoryStock** (Resumen de Inventario - Opcional)
```typescript
{
  id: string (auto)
  userId: string (required)
  companyId?: string
  almacenId: string
  almacenNombre: string
  productoId: string
  productoNombre: string
  sku: string
  
  // Cantidades (calculadas desde stockMovements)
  unidadBase: string
  cantidadDisponible: number // Calculada
  cantidadComprometida: number
  cantidadEnTransito: number
  
  // Costos
  costoPromedioUnitario: number
  valorInventario: number
  
  // Lote más antiguo (FIFO/FEFO)
  loteActual?: string | null
  fechaCaducidadProxima?: Timestamp | null
  
  ultimoMovimiento: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### 4. **salesOrders** (Órdenes de Venta)
```typescript
{
  id: string (auto)
  userId: string (required)
  companyId?: string
  orderNumber: string
  folio: string
  
  // Cliente
  customerId: string
  customerName: string
  
  // Almacén obligatorio ⭐
  warehouseId: string
  warehouseName: string
  
  // Estado
  status: "draft" | "sent" | "confirmed" | "in_progress" | "delivered" | "cancelled"
  
  // Líneas de venta
  items: SalesOrderLine[]
  
  // Totales
  subtotal: number
  iva: number
  discount: number
  total: number
  currency: "MXN" | "USD" | "EUR"
  
  // Fechas
  orderDate: Timestamp
  deliveryDate?: Timestamp
  
  // Referencias
  deliveryId?: string | null
  invoiceId?: string | null
  
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Índices compuestos requeridos para salesOrders:**
- `userId` ASC + `status` ASC + `orderDate` DESC
- `companyId` ASC + `orderDate` DESC
- `companyId` ASC + `warehouseId` ASC + `status` ASC

#### 5. **salesOrderActivities** (Auditoría de Ventas)
```typescript
{
  id: string (auto)
  userId: string (required)
  companyId?: string
  salesOrderId: string
  action: "created" | "sent" | "confirmed" | "delivered" | "cancelled"
  description: string
  userName: string
  timestamp: Timestamp
  createdAt: Timestamp
}
```

#### 6. **deliveries** (Remisiones/Entregas)
```typescript
{
  id: string (auto)
  userId: string (required)
  companyId?: string
  folio: string
  salesOrderId: string
  salesOrderFolio: string
  customerId: string
  customerName: string
  warehouseId: string
  items: DeliveryItem[]
  status: "pending" | "in_transit" | "delivered" | "returned"
  deliveryDate: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### 7. **salesInvoices** (Facturas de Venta)
```typescript
{
  id: string (auto)
  userId: string (required)
  companyId?: string
  folio: string
  salesOrderId: string
  deliveryId?: string
  customerId: string
  customerName: string
  items: InvoiceItem[]
  subtotal: number
  iva: number
  total: number
  currency: "MXN" | "USD" | "EUR"
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  invoiceDate: Timestamp
  dueDate: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### 8. **suppliers** (Proveedores)
```typescript
{
  id: string (auto)
  userId: string (required)
  companyId?: string
  nombre: string
  codigo: string
  tipo: "nacional" | "internacional" | "maquilador"
  rfc?: string
  contacto: string
  telefono: string
  email: string
  direccion: string
  ciudad: string
  estado: string
  pais: string
  terminosPago: string
  creditoDias: number
  moneda: "MXN" | "USD" | "EUR"
  activo: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### 9. **supplierProducts** (Catálogo de Productos por Proveedor)
```typescript
{
  id: string (auto)
  userId: string (required)
  companyId?: string
  proveedorId: string
  productoId: string
  skuProveedor: string
  descripcion: string
  
  // Unidades y conversión
  unidadCompra: string // "CAJA", "PALET", etc.
  unidadBase: string // "KG", "L", "PZA"
  unidadesPorEmpaque: number // 1 CAJA = 80 KG
  
  // Precios
  precioUnitario: number // Por unidad base
  moneda: "MXN" | "USD" | "EUR"
  
  // Tiempo de entrega
  tiempoEntregaDias: number
  cantidadMinima: number
  
  preferido: boolean
  activo: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### 10. **purchaseOrders** (Órdenes de Compra)
```typescript
{
  id: string (auto)
  userId: string (required)
  companyId?: string
  folio: string
  proveedorId: string
  proveedorNombre: string
  fecha: Timestamp
  fechaEntregaEsperada: Timestamp
  almacenDestinoId: string
  almacenDestinoNombre: string
  items: PurchaseOrderItem[]
  subtotal: number
  iva: number
  total: number
  moneda: "MXN" | "USD" | "EUR"
  estado: "borrador" | "enviada" | "confirmada" | "recibida_parcial" | "recibida_completa" | "cancelada"
  autorizada: boolean
  autorizadoPor?: string
  notas?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### 11. **goodsReceipts** (Recepciones de Mercancía)
```typescript
{
  id: string (auto)
  userId: string (required)
  companyId?: string
  folio: string
  ordenCompraId: string
  ordenCompraFolio: string
  proveedorId: string
  proveedorNombre: string
  fecha: Timestamp
  items: GoodsReceiptItem[]
  estado: "completa" | "parcial" | "devolucion"
  facturaVinculada: boolean
  facturaId?: string
  notas?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**GoodsReceiptItem incluye:**
- Conversión automática de unidades de compra → base
- Registro opcional de lote y fecha de caducidad
- Costo por unidad base para trazabilidad

#### 12. **accountsPayable** (Cuentas por Pagar)
```typescript
{
  id: string (auto)
  userId: string (required)
  companyId?: string
  proveedorId: string
  proveedorNombre: string
  facturaProveedor: string
  ordenCompraId?: string
  recepcionId?: string
  fecha: Timestamp
  fechaVencimiento: Timestamp
  montoOriginal: number
  montoPagado: number
  saldo: number
  moneda: "MXN" | "USD" | "EUR"
  estado: "pendiente" | "parcial" | "pagada" | "vencida"
  autorizada: boolean
  pagos: SupplierPayment[]
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### 13. **warehouseTransfers** (Transferencias entre Almacenes)
```typescript
{
  id: string (auto)
  userId: string (required)
  companyId?: string
  folio: string
  almacenOrigenId: string
  almacenOrigenNombre: string
  almacenDestinoId: string
  almacenDestinoNombre: string
  items: TransferItem[]
  estado: "pendiente" | "en_transito" | "recibida" | "cancelada"
  fechaSalida: Timestamp
  fechaRecepcion?: Timestamp
  responsableEnvio: string
  responsableRecepcion?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### 14. **physicalCounts** (Conteos Físicos)
```typescript
{
  id: string (auto)
  userId: string (required)
  companyId?: string
  folio: string
  almacenId: string
  almacenNombre: string
  fecha: Timestamp
  items: PhysicalCountItem[]
  estado: "en_progreso" | "completado" | "ajustado"
  responsable: string
  observaciones?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### 15. **productBatches** (Lotes - Opcional para trazabilidad extendida)
```typescript
{
  id: string (auto)
  userId: string (required)
  companyId?: string
  lote: string
  productoId: string
  productoNombre: string
  fechaProduccion?: Timestamp
  fechaCaducidad?: Timestamp
  proveedorId?: string
  recepcionId?: string
  cantidadInicial: number
  cantidadDisponible: number
  almacenId: string
  estado: "disponible" | "cuarentena" | "agotado" | "caducado"
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

## 🔐 REGLAS DE FIRESTORE

Todas las colecciones siguen el patrón:
- **read**: `isAuthenticated()` (cualquier usuario autenticado puede leer)
- **create**: `hasValidUserId()` (se valida que userId = request.auth.uid)
- **update/delete**: `isOwner(resource.data.userId)` (solo el dueño puede modificar)

Las colecciones principales del ERP 2026-2027 están explícitamente definidas en `firestore.rules`.

---

## 🔍 ÍNDICES COMPUESTOS REQUERIDOS

Crea estos índices en Firebase Console → Firestore → Indexes:

### stockMovements
```
Collection: stockMovements
Fields:
  - userId (Ascending)
  - almacenId (Ascending)
  - fecha (Descending)
Query scope: Collection
```

```
Collection: stockMovements
Fields:
  - userId (Ascending)
  - productoId (Ascending)
  - fecha (Ascending)
Query scope: Collection
```

```
Collection: stockMovements
Fields:
  - userId (Ascending)
  - almacenId (Ascending)
  - productoId (Ascending)
  - fecha (Ascending)
Query scope: Collection
```

```
Collection: stockMovements
Fields:
  - companyId (Ascending)
  - almacenId (Ascending)
  - fecha (Descending)
Query scope: Collection
```

```
Collection: stockMovements
Fields:
  - ordenVentaId (Ascending)
  - fecha (Descending)
Query scope: Collection
```

### salesOrders
```
Collection: salesOrders
Fields:
  - userId (Ascending)
  - status (Ascending)
  - orderDate (Descending)
Query scope: Collection
```

```
Collection: salesOrders
Fields:
  - companyId (Ascending)
  - orderDate (Descending)
Query scope: Collection
```

```
Collection: salesOrders
Fields:
  - companyId (Ascending)
  - warehouseId (Ascending)
  - status (Ascending)
Query scope: Collection
```

### deliveries
```
Collection: deliveries
Fields:
  - companyId (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

### salesInvoices
```
Collection: salesInvoices
Fields:
  - companyId (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

---

## ⚙️ LÓGICA DE NEGOCIO PRINCIPAL

### 1. Recepción de Mercancía (Proveedor → Almacén)

**Flujo:**
1. Usuario crea orden de compra (`purchaseOrders`)
2. Al recibir mercancía, crea `goodsReceipt` vinculado a la OC
3. **Automático**: `createGoodsReceiptWithInventoryImpact()` genera:
   - Movimiento en `stockMovements` tipo `recepcion_compra`
   - Convierte unidades de compra → base (ej: 10 CAJAS × 80 KG = 800 KG)
   - Registra lote y caducidad si aplica
   - Actualiza estado de orden de compra

**Código:** `hooks/use-suppliers-data.ts`

### 2. Venta y Descuento de Inventario (Almacén → Cliente)

**Flujo:**
1. Usuario crea orden de venta (`salesOrders`) **con warehouseId obligatorio**
2. La UI muestra disponibilidad en tiempo real por almacén
3. Al confirmar venta, `fulfillSalesOrder()`:
   - Valida stock disponible en el almacén seleccionado
   - Usa FIFO/FEFO para seleccionar lotes
   - Genera movimientos tipo `venta` en `stockMovements`
   - Vincula con `salesOrderId` y `deliveryId`
   - Descuenta solo del almacén especificado

**Código:** `hooks/use-sales-data.ts`

### 3. Cálculo de Inventario Disponible (Ledger)

**Flujo:**
1. Sistema lee todos los `stockMovements` del almacén + producto
2. Suma entradas (tipo `entrada`, `recepcion_compra`, etc.)
3. Resta salidas (tipo `salida`, `venta`, etc.)
4. Aplica ajustes (tipo `ajuste`)
5. Resultado = inventario disponible en tiempo real

**Código:** `lib/utils/inventory-ledger.ts` → `calculateInventoryFromLedger()`

### 4. FIFO/FEFO Automático

**Flujo:**
1. Al cumplir una venta, `selectLotsForFulfillment()` consulta:
   - Todos los movimientos de entrada con lote/caducidad
   - Ordena por fecha de entrada (FIFO) o caducidad (FEFO)
2. Selecciona lotes hasta cumplir cantidad requerida
3. Crea movimientos de salida referenciando cada lote

**Código:** `lib/utils/inventory-ledger.ts` → `selectLotsForFulfillment()`

### 5. Transferencias entre Almacenes

**Flujo:**
1. Usuario crea transferencia (`warehouseTransfers`)
2. Estado inicial: `pendiente`
3. Al completar, `updateTransfer()` genera:
   - Movimiento tipo `transferencia_salida` en almacén origen
   - Movimiento tipo `transferencia_entrada` en almacén destino
   - Ambos vinculados por `transferenciaId`

**Código:** `hooks/use-warehouse-data.ts`

### 6. Conteo Físico y Ajustes

**Flujo:**
1. Usuario crea conteo físico (`physicalCounts`)
2. Registra cantidad física vs sistema
3. Al finalizar, `updatePhysicalCount()`:
   - Calcula diferencia por producto
   - Genera movimientos tipo `ajuste` positivos o negativos
   - Actualiza inventario al valor físico real

**Código:** `hooks/use-warehouse-data.ts`

---

## 🔄 SINCRONIZACIÓN EN TIEMPO REAL

### Listeners Activos

Todos los hooks usan `onSnapshot` de Firestore para suscribirse a cambios en tiempo real:

1. **`useSalesData`**: Escucha cambios en `salesOrders`, `deliveries`, `salesInvoices`
2. **`useWarehouseData`**: Escucha cambios en `warehouses`, `stockMovements`, `transfers`, `physicalCounts`
3. **`useSuppliersData`**: Escucha cambios en `suppliers`, `purchaseOrders`, `goodsReceipts`

**Resultado:** Cualquier cambio en una colección se refleja instantáneamente en todos los dashboards conectados sin recargar la página.

---

## 📊 CAMPOS OBLIGATORIOS Y DEFAULTS

### Regla General
**NUNCA enviar `undefined` a Firestore.** Usar valores por defecto:

- **Strings vacíos:** `""`
- **Números:** `0`
- **Booleanos:** `false`
- **Arrays:** `[]`
- **Objetos:** `null` o `{}`
- **Fechas:** `serverTimestamp()` o `Timestamp.now()`

### Campos Requeridos en Todos los Documentos

```typescript
{
  userId: string // Siempre presente, del usuario autenticado
  companyId?: string // Opcional, si el usuario tiene compañía asignada
  createdAt: Timestamp // serverTimestamp() al crear
  updatedAt: Timestamp // serverTimestamp() al actualizar
}
```

### Sanitización de Datos

Todos los wrappers (`createWarehouse`, `createStock`, `createMovement`, etc.) sanitizan campos automáticamente antes de enviar a Firestore:

```typescript
const sanitized = {
  ...data,
  userId: currentUser.uid,
  companyId: companyId || "",
  stringField: data.stringField ?? "",
  numberField: data.numberField ?? 0,
  arrayField: data.arrayField ?? [],
  optionalField: data.optionalField ?? null,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
}
```

---

## 🧪 CONFIGURACIÓN DE LOTES/CADUCIDAD

### Configuración por Producto

La gestión de lotes es **opcional** y se configura a nivel de producto:

```typescript
interface Product {
  // ...otros campos
  gestionaLote: boolean // true = requiere lote en cada movimiento
  gestionaCaducidad: boolean // true = requiere fecha de caducidad
  metodoRotacion: "FIFO" | "FEFO" | "manual" // Método de selección de lotes
}
```

### Comportamiento

- **`gestionaLote = false`**: No requiere lote, FIFO simple por fecha de entrada
- **`gestionaLote = true` + `gestionaCaducidad = false`**: FIFO estándar por lote
- **`gestionaLote = true` + `gestionaCaducidad = true`**: FEFO (primero en caducar, primero en salir)

### Flexibilidad de Empaques

Los productos manejan múltiples unidades:

```typescript
interface Product {
  unidadBase: string // "KG", "L", "PZA" - unidad para inventario
  unidadVenta: string // "KG", "CAJA", "PALET" - unidad para venta
  unidadCompra: string // "CAJA", "PALET", "CONTENEDOR" - unidad para compra
  unidadesPorEmpaque: number // Factor de conversión (ej: 1 CAJA = 80 KG)
}
```

**Ejemplo:**
- Producto: Aderezo Ranch
- `unidadBase`: "KG"
- `unidadCompra`: "CAJA"
- `unidadesPorEmpaque`: 80 (1 CAJA = 80 KG)
- Al recibir 5 CAJAS → se registran 400 KG en inventario

---

## 📝 RESUMEN DE CAMBIOS POR ARCHIVO

### 1. `firestore.rules`
- **Cambio:** Agregadas reglas explícitas para colecciones ERP 2026-2027
- **Colecciones nuevas:** `stockMovements`, `salesOrderActivities`, `deliveries`, `salesInvoices`, `supplierProducts`, `goodsReceipts`, `warehouseTransfers`, `physicalCounts`, `productBatches`, `exchangeRates`

### 2. `lib/types.ts`
- **Cambio:** Tipos actualizados para soportar arquitectura de ledger
- **Nuevos tipos:** `StockMovement`, `GoodsReceiptItem`, `SalesOrderLine`, `DeliveryItem`, `InvoiceItem`, `TransferItem`, `PhysicalCountItem`
- **Campos agregados:** `warehouseId` obligatorio en `SalesOrder`, conversión de unidades en items, trazabilidad completa con referencias por ID

### 3. `lib/firestore.ts`
- **Cambio:** Colecciones agregadas al enum `COLLECTIONS`
- **Nuevas:** `stockMovements`, `deliveries`, `salesInvoices`, `salesOrderActivities`, `productBatches`, `exchangeRates`

### 4. `lib/utils/inventory-ledger.ts`
- **Cambio:** Nuevo archivo creado
- **Funciones:** 
  - `calculateInventoryFromLedger()` - Calcula inventario desde movimientos
  - `selectLotsForFulfillment()` - FIFO/FEFO automático
  - `calculateAvailableByWarehouse()` - Disponibilidad por almacén

### 5. `hooks/use-warehouse-data.ts`
- **Cambio:** Refactorizado completamente para arquitectura de ledger
- **Funciones actualizadas:**
  - `createMovement()` - Ahora actualiza inventario automáticamente
  - `updateTransfer()` - Genera movimientos de salida/entrada
  - `updatePhysicalCount()` - Genera ajustes de inventario
- **Sanitización:** Todos los campos validados antes de Firestore

### 6. `hooks/use-suppliers-data.ts`
- **Cambio:** Integración completa con inventario
- **Nueva función:** `createGoodsReceiptWithInventoryImpact()` - Recepción con impacto en inventario
- **Conversión de unidades:** Automática de unidad de compra → base
- **Lotes:** Registro opcional en cada línea de recepción

### 7. `hooks/use-sales-data.ts`
- **Cambio:** Validación de inventario y almacén obligatorio
- **Nueva función:** `fulfillSalesOrder()` - Cumplimiento con descuento de inventario
- **Validación:** Verifica disponibilidad antes de confirmar
- **FIFO/FEFO:** Usa `selectLotsForFulfillment()` para asignar lotes

### 8. `components/sales/sales-order-form.tsx`
- **Cambio:** Selector de almacén obligatorio agregado
- **UI:** Campo destacado con validación visual
- **Validación:** No permite confirmar sin almacén seleccionado

### 9. `components/sales/sales-order-lines-tab.tsx`
- **Cambio:** Columna de disponibilidad en tiempo real
- **UI:** Íconos verde/rojo según stock en almacén seleccionado
- **Cálculo:** Usa `calculateAvailableByWarehouse()` en cada render

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Firebase Console
- [ ] Crear índices compuestos para `stockMovements` (5 índices)
- [ ] Crear índices compuestos para `salesOrders` (3 índices)
- [ ] Crear índices compuestos para `deliveries` (1 índice)
- [ ] Crear índices compuestos para `salesInvoices` (1 índice)
- [ ] Verificar que `firestore.rules` esté publicado

### Datos Iniciales
- [ ] Crear al menos 1 almacén en la colección `warehouses`
- [ ] Asignar `companyId` al usuario autenticado en `users/{userId}`
- [ ] Configurar productos con `gestionaLote` y `metodoRotacion`
- [ ] Definir `unidadBase`, `unidadCompra`, `unidadesPorEmpaque` en productos

### Testing
- [ ] Crear orden de compra → recibir mercancía → validar movimiento en `stockMovements`
- [ ] Crear orden de venta con almacén → confirmar → validar descuento de inventario
- [ ] Verificar sincronización en tiempo real (abrir dos ventanas)
- [ ] Probar transferencia entre almacenes → validar movimientos en ambos
- [ ] Hacer conteo físico → validar ajustes generados
- [ ] Vender producto con lotes → verificar FIFO/FEFO funciona

---

## 🚀 PRÓXIMOS PASOS (Opcional)

1. **Reportes avanzados**: Análisis ABC, rotación de inventario, obsolescencia
2. **Integraciones**: SAT (facturación electrónica), transportistas, e-commerce
3. **Alertas**: Notificaciones de bajo stock, caducidades próximas
4. **Mobile app**: App móvil para técnicos de almacén (escaneo de códigos de barras)
5. **BI Dashboard**: PowerBI/Looker para análisis ejecutivo

---

## 📞 SOPORTE

Si encuentras errores o necesitas ajustes:
1. Revisa los logs del navegador (busca `[v0]` en la consola)
2. Verifica que los índices compuestos estén creados en Firebase
3. Confirma que `userId` y `companyId` estén presentes en todos los documentos
4. Valida que las reglas de Firestore permitan las operaciones

**Fin de la documentación ERP 2026-2027.**
