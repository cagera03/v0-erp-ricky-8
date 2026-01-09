# Módulo de Servicio al Cliente - Implementación Completa

## Resumen de Cambios

El módulo de Servicio al Cliente ha sido completamente integrado al ERP con las siguientes características:

### 1. **Tipos Actualizados (lib/types.ts)**
- **ServiceTicket**: Agregados campos de trazabilidad para devoluciones:
  - `ordenVentaId`, `ordenVentaFolio`: Referencia a orden de venta
  - `remisionId`, `remisionFolio`: Referencia a remisión (si aplica)
  - `facturaId`, `facturaFolio`: Referencia a factura (si aplica)
  - `lineasDevolucion`: Array de líneas devueltas con producto, cantidad, lote, motivo, disposición
  - `almacenDevolucionId`, `almacenDevolucionNombre`: Almacén donde se recibirá la devolución
  - `estadoDevolucion`: "pendiente" | "aprobada" | "rechazada" | "procesada"
  - `movimientosInventarioIds`: IDs de movimientos de inventario generados

- **ReturnLine**: Nueva interfaz para líneas de devolución:
  - Producto completo (id, nombre, SKU)
  - Cantidad devuelta
  - Lote/serie (opcional, para trazabilidad)
  - Motivo de devolución
  - Estado de disposición (reingreso_stock, cuarentena, scrap, reparacion)
  - Evidencia y notas

### 2. **Hook useServiceData (hooks/use-service-data.ts)**
- Suscripción directa a Firestore con `useFirestore` (loading → empty → data)
- **companyId** y **userId** incluidos en todos los tickets
- **Defaults sin undefined**: Todos los campos opcionales inicializados como `null` o `[]`
- KPIs calculados en tiempo real desde Firestore:
  - Total tickets, abiertos, tiempo promedio respuesta/resolución
  - Satisfacción promedio, cumplimiento SLA
  - Distribución por canales, categorías, estados, calificaciones
- Método `createTicket` con sanitización completa de datos

### 3. **Componente TicketFormDialog**
- **Accesibilidad corregida**: Agregado `<DialogDescription>` para cumplir con ARIA
- Formulario completo con validación
- Campos inicializados correctamente (sin undefined)
- Soporte para categorías de devolución/producto_dañado

### 4. **Componente TicketDetailDialog (CON DEVOLUCIONES)**
- **Accesibilidad corregida**: Agregado `<DialogDescription>`
- Gestión completa del ciclo de vida del ticket
- **Sección de Devoluciones** (visible si categoría = devolucion o producto_danado):
  - Selección de orden de venta relacionada
  - Selección de almacén de devolución (obligatorio)
  - Gestión de líneas de devolución:
    - Selección de producto desde catálogo
    - Cantidad, lote/serie (opcional)
    - Motivo de devolución
    - Estado de disposición (reingreso, cuarentena, scrap, reparación)
  - Botón "Aprobar y Procesar Devolución":
    - Crea movimientos de inventario en `stockMovements` (tipo: `devolucion_venta`)
    - Actualiza el ticket con referencias completas
    - **NO duplica datos**: El stock se calcula desde el ledger
    - Trazabilidad completa: ticket → orden → movimiento → almacén → producto

### 5. **Flujo de Devoluciones End-to-End**

**Paso 1: Cliente reporta problema**
- Usuario crea ticket con categoría "devolucion" o "producto_danado"
- Ticket queda en estado "abierto"

**Paso 2: Agente valida y vincula orden**
- Agente abre ticket en `TicketDetailDialog`
- Selecciona orden de venta relacionada
- Selecciona almacén donde se recibirá la devolución
- Agrega líneas de devolución (productos, cantidades, lotes, motivos, disposición)

**Paso 3: Aprobación y procesamiento**
- Agente hace clic en "Aprobar y Procesar Devolución"
- Sistema crea movimientos de inventario:
  ```typescript
  {
    tipo: "devolucion_venta",
    almacenId: "ALM-001",
    productoId: "PROD-123",
    cantidad: 5,
    ordenVentaId: "ORD-456",
    lote: "L-2024-01",
    motivo: "Producto dañado - Disposición: cuarentena"
  }
  ```
- Movimientos alimentan el `inventoryStock` calculado desde el ledger
- Ticket queda con `estadoDevolucion: "procesada"`

**Paso 4: Trazabilidad**
- Desde el ticket se puede ver:
  - Orden de venta original
  - Almacén de devolución
  - Productos devueltos con cantidades
  - Movimientos de inventario generados (IDs)
- Desde el inventario se puede rastrear:
  - Movimiento → Ticket → Orden → Cliente

### 6. **Integración con Otros Módulos**

**Ventas (SalesOrder)**:
- Ticket referencia `ordenVentaId` y `ordenVentaFolio`
- Permite vincular devoluciones a ventas específicas

**Almacén (Warehouse + StockMovement)**:
- Devoluciones crean movimientos tipo `devolucion_venta`
- Movimientos alimentan el stock calculado desde el ledger
- NO se duplican datos en campos de stock

**Inventario (inventoryStock)**:
- Calculado dinámicamente desde `stockMovements` usando `calculateInventoryFromLedger()`
- Incluye devoluciones automáticamente al sumar movimientos

**CRM (Customer)**:
- Tickets vinculados a clientes por `clienteId`
- Historial de servicio por cliente

## Archivos Modificados

1. **lib/types.ts**
   - Agregados campos de devolución a `ServiceTicket`
   - Nueva interfaz `ReturnLine`

2. **hooks/use-service-data.ts**
   - Reescrito completamente con suscripción directa
   - companyId/userId obligatorios
   - KPIs calculados en tiempo real
   - Método `createTicket` con defaults

3. **components/service/ticket-form-dialog.tsx**
   - Agregado `<DialogDescription>` para accesibilidad
   - Inicialización de campos de devolución

4. **components/service/ticket-detail-dialog.tsx**
   - Agregado `<DialogDescription>` para accesibilidad
   - Sección completa de gestión de devoluciones
   - Creación de movimientos de inventario
   - Integración con ventas y almacenes

5. **components/service/service-page-content.tsx**
   - Ya existía y funciona correctamente
   - KPIs actualizados dinámicamente

6. **app/dashboard/service/page.tsx**
   - Ya existía y funciona correctamente

## Próximos Pasos (Opcionales)

1. **Notificaciones**: Enviar email/WhatsApp al cliente cuando cambia el estado del ticket
2. **Flujo de autorización**: Requerir aprobación de supervisor para devoluciones > $X
3. **Evidencias fotográficas**: Upload de imágenes para devoluciones
4. **Reportes**: Dashboard de motivos de devolución más frecuentes
5. **Integración con facturación**: Generar nota de crédito automática al aprobar devolución

## Pruebas Recomendadas

1. Crear ticket de categoría "devolucion"
2. Vincularlo a una orden de venta existente
3. Agregar líneas de devolución con diferentes productos
4. Aprobar devolución y verificar movimientos en `stockMovements`
5. Verificar que el `inventoryStock` se actualiza correctamente
6. Rastrear trazabilidad: ticket → orden → movimiento → producto

## Conclusión

El módulo de Servicio al Cliente está completamente integrado con:
- ✅ Firestore como fuente de verdad
- ✅ Sin estados duplicados
- ✅ companyId/userId en todos los documentos
- ✅ Defaults sin undefined
- ✅ Accesibilidad corregida (DialogDescription)
- ✅ Devoluciones con trazabilidad completa
- ✅ Integración con Ventas, Almacén e Inventario
- ✅ Flujo end-to-end documentado
