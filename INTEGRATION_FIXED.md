# Integración Proveedores→Almacén→Ventas - Corregida

## Fecha: 2026-01-08

## Problemas Corregidos

### 1. Modelo de Almacenes (Warehouses)
**Problema**: Warehouses no tenían companyId consistente y campos obligatorios vacíos.

**Solución Implementada**:
- ✅ `companyId` ya existe en BaseDocument y se incluye automáticamente en todos los warehouses
- ✅ Validación obligatoria de campos: `nombre`, `codigo`, `ubicacion`
- ✅ Validación en frontend (warehouses-tab.tsx) y backend (use-warehouse-data.ts)
- ✅ Los dropdowns de "Almacén Destino" ahora filtran correctamente por companyId

**Código Modificado**:
- `hooks/use-warehouse-data.ts`: Validaciones en createWarehouse()
- `components/warehouse/warehouses-tab.tsx`: Validación en handleSave()

### 2. Flujo de Inventario: Configuración vs Datos Reales

**Arquitectura Implementada**:

#### supplierProducts = Solo Configuración
**Propósito**: Define las condiciones y parámetros de compra por proveedor

**Campos de Configuración**:
- Precios y descuentos por volumen
- Unidades: `unidadBase` (ej: "KG"), `unidadCompra` (ej: "CAJA"), `unidadesPorEmpaque` (ej: 80)
- Lead times y cantidades mín/máx
- Tracking: `trackingType` ("ninguno" | "lote" | "serie"), `requiresExpiry`
- **Nuevo**: `almacenDestinoId` y `almacenDestinoNombre` por defecto

**NO almacena cantidades de inventario** - Solo sirve como "catálogo de condiciones"

#### GoodsReceipt + StockMovements = Datos Reales
**Flujo de Entrada (Compras)**:
```
1. Usuario crea PurchaseOrder con supplierProducts como referencia
   └─ Se pre-llenan: precios, unidades, condiciones

2. Al recibir mercancía → createGoodsReceiptWithInventoryImpact()
   a. Valida que almacenId esté especificado (obligatorio)
   b. Convierte unidades de compra a unidades base
   c. Crea UN SOLO StockMovement tipo "recepcion_compra" con:
      - warehouseId (almacenId)
      - productId
      - cantidad (en unidad base convertida)
      - costoUnitario (costo por unidad base)
      - Trazabilidad: supplierId, ordenCompraId, recepcionId
      - Si aplica: lote, fechaCaducidad

3. inventoryStock se calcula desde StockMovements
   └─ Función: calculateInventoryFromLedger()
   └─ Agrupa por: almacenId + productoId + lote
   └─ Calcula: cantidadActual, costoPromedio (weighted average)
```

**Flujo de Salida (Ventas)**:
```
1. Usuario confirma SalesOrder

2. Al entregar → fulfillSalesOrder(orderId, almacenId, almacenNombre)
   a. Valida que almacenId esté especificado (OBLIGATORIO)
   b. Valida disponibilidad con selectLotsForFulfillment()
   c. Selecciona lotes con FIFO o FEFO:
      - Si hay fechaCaducidad → FEFO (First Expired First Out)
      - Si no hay caducidad → FIFO (First In First Out)
   d. Crea StockMovement tipo "venta" por cada lote con:
      - warehouseId (almacenId de donde se surte)
      - productId
      - cantidad (descontada del lote)
      - costoUnitario (del lote asignado)
      - Trazabilidad: clienteId, ordenVentaId, remisionId
      - lote y fechaCaducidad del lote usado

3. inventoryStock se actualiza automáticamente
   └─ Se descuenta la cantidad vendida
   └─ Se mantiene trazabilidad completa por IDs
```

### 3. Resultado Esperado (IMPLEMENTADO)

✅ **supplierProducts**: Solo configuración, no datos de inventario
✅ **GoodsReceipt + StockMovements**: Una sola línea de información por entrada
✅ **Inventario en Almacén**: Se deriva automáticamente del ledger (stockMovements)
✅ **Trazabilidad Completa**: supplierId, proveedorId, ordenCompraId, recepcionId, warehouseId
✅ **FIFO/FEFO**: Implementado en selectLotsFIFO() con lógica de caducidad
✅ **Validación de Inventario por Almacén**: Obligatoria en ventas
✅ **Conversión de Unidades**: Automática (unidad compra → unidad base)

### 4. Archivos Modificados

1. `lib/types.ts`
   - Actualizado GoodsReceipt para incluir almacenId/almacenNombre obligatorios
   - Actualizado SupplierProduct para incluir almacenDestinoId por defecto
   - Documentación mejorada en comentarios

2. `hooks/use-warehouse-data.ts`
   - Validación de campos obligatorios en createWarehouse()
   - Logs mejorados con companyId

3. `hooks/use-suppliers-data.ts`
   - createGoodsReceiptWithInventoryImpact() valida almacenId obligatorio
   - Documentación del flujo de conversión de unidades

4. `hooks/use-sales-data.ts`
   - fulfillSalesOrder() valida almacenId obligatorio
   - Mejora en mensaje de log para indicar FIFO vs FEFO

5. `components/warehouse/warehouses-tab.tsx`
   - Validación de campos requeridos antes de guardar
   - Campos marcados con asterisco (*)

### 5. Cómo Probar

**Test 1: Crear Almacén**
```
1. Ir a Almacén → Almacenes
2. Intentar crear sin nombre → Debe mostrar error
3. Llenar nombre, código, ubicación → Debe guardar
4. Verificar en Firestore que tiene companyId
```

**Test 2: Flujo Compras → Inventario**
```
1. Crear SupplierProduct con:
   - unidadBase: "KG"
   - unidadCompra: "CAJA"
   - unidadesPorEmpaque: 80 (1 caja = 80 kg)
   - almacenDestinoId: [seleccionar almacén]

2. Crear PurchaseOrder con 2 CAJAS

3. Crear GoodsReceipt:
   - Recibir 2 CAJAS
   - Asignar lote: "L001"
   - Fecha caducidad: [si aplica]

4. Verificar en Almacén → Inventario:
   - Producto aparece con 160 KG (2 × 80)
   - Almacén correcto
   - Lote: L001

5. Verificar en Almacén → Movimientos:
   - Tipo: "recepcion_compra"
   - Cantidad: 160 KG (en unidad base)
   - Referencia: folio de orden de compra
```

**Test 3: Flujo Ventas → Descuento Inventario**
```
1. Crear SalesOrder con 50 KG del producto

2. Confirmar orden

3. Entregar orden:
   - DEBE seleccionar almacén
   - Si no selecciona → Error

4. Sistema debe:
   - Usar FEFO si hay lotes con caducidad
   - Usar FIFO si no hay caducidad
   - Crear StockMovement tipo "venta"
   - Descontar 50 KG del inventario

5. Verificar en Almacén → Inventario:
   - Cantidad actualizada: 110 KG (160 - 50)
   - Lote correcto descontado

6. Verificar trazabilidad:
   - StockMovement tiene: clienteId, ordenVentaId, remisionId
```

### 6. Mejoras Adicionales Sugeridas (Futuro)

- [ ] Dashboard con alertas de stock bajo usando puntoReorden
- [ ] Reportes de rotación de inventario
- [ ] Integración con lectores de código de barras para lotes
- [ ] Exportación de reportes de trazabilidad
- [ ] Auditoría automática de movimientos sospechosos

---

**Estado**: ✅ IMPLEMENTADO Y LISTO PARA PRODUCCIÓN
**Autor**: v0
**Fecha**: 2026-01-08
