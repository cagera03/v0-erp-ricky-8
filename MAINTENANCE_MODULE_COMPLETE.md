# Módulo de Mantenimiento - ERP 2026-2027

## Resumen de Implementación

El módulo de Mantenimiento ha sido completamente implementado siguiendo las mejores prácticas de ERP moderno con Firestore como fuente única de verdad.

## Arquitectura

### 1. Tipos y Modelos (lib/types.ts)
- **Equipment**: Catálogo de equipos con ubicación, criticidad, lecturas y relación a almacén de refacciones
- **PreventiveMaintenance**: Mantenimientos preventivos con periodicidad por calendario o lectura, generación automática
- **WorkOrder**: Órdenes de trabajo con estados, actividades, refacciones y costos completos
- **EquipmentReading**: Registro de lecturas para equipos (horas, km, ciclos)
- **MaintenanceTechnician**: Técnicos con especialidades y disponibilidad
- **WorkOrderActivity**: Checklist de actividades con evidencias
- **WorkOrderSparePart**: Refacciones consumidas con trazabilidad a inventario

### 2. Hook de Datos (hooks/use-maintenance-data.ts)
- Suscripción directa a Firestore con useFirestore
- Cálculo de KPIs desde datos reales
- `generateAutomaticWorkOrders()`: Genera OTs desde preventivos basados en fechas o lecturas
- `completeWorkOrder()`: Completa OT, registra consumo de refacciones en inventario, actualiza lecturas y preventivos
- `getEquipmentHistory()`: Historial unificado de OTs y lecturas por equipo

### 3. Componentes de UI

#### MaintenanceOrdersTab
- Lista de órdenes con filtros por estado
- Creación de órdenes manuales (correctivas, predictivas, mejora)
- Inicio de OT (draft → programada → en_proceso)
- Completar OT con datos de tiempo, costo, lecturas y evidencias
- Sin estados locales, todo desde Firestore

#### MaintenanceAssetsTab
- Catálogo de equipos en tarjetas
- CRUD completo con validación
- Asignación de almacén de refacciones por equipo
- Criticidad y tipo de lectura configurables

#### MaintenanceScheduleTab
- Vista de próximos 30 días de mantenimientos preventivos
- Alerta de mantenimientos vencidos
- Botón para generar OTs automáticas
- Basado en fechas (calendario) y lecturas

#### MaintenanceHistoryTab
- Historial unificado por equipo
- 3 vistas: Timeline, Solo OTs, Solo Lecturas
- Estadísticas por equipo
- Trazabilidad completa

### 4. Integración con Inventario
- Consumo de refacciones registra `StockMovement` con tipo `consumo_mantenimiento`
- Referencia a `workOrderId` y `folio`
- Descuenta del almacén especificado en `WorkOrderSparePart.almacenId`
- Sin duplicar stock, usa el ledger existente

### 5. Flujo End-to-End

1. **Catálogo de Equipos**: Crear equipos con planta, criticidad, tipo de lectura, almacén de refacciones
2. **Mantenimientos Preventivos**: Configurar con periodicidad (calendario o lectura), actividades y refacciones
3. **Generación Automática**: Sistema genera OTs cuando se acerca la fecha o se alcanza la lectura
4. **Ejecución**: Técnico inicia OT, registra actividades, consume refacciones
5. **Completar**: Registra tiempo, costos, lecturas, actualiza preventivo
6. **Historial**: Trazabilidad completa por equipo

## Características ERP 2026-2027

✅ Firestore como única fuente de verdad (sin estados duplicados)
✅ UI estable: loading → empty → table/cards
✅ Todos los tipos con companyId, createdAt, updatedAt
✅ Sin colecciones innecesarias
✅ Integración con inventario sin duplicar stock
✅ KPIs calculados desde datos reales
✅ Generación automática de OTs basada en reglas
✅ Trazabilidad completa (equipos, lecturas, costos, refacciones)
✅ Periodicidad por calendario Y por uso (lecturas)

## Archivos Modificados/Creados

1. `lib/types.ts` - Tipos de mantenimiento agregados
2. `hooks/use-maintenance-data.ts` - Reescrito completamente con lógica integrada
3. `components/maintenance/maintenance-orders-tab.tsx` - NUEVO
4. `components/maintenance/maintenance-assets-tab.tsx` - NUEVO
5. `components/maintenance/maintenance-schedule-tab.tsx` - NUEVO
6. `components/maintenance/maintenance-history-tab.tsx` - NUEVO
7. `app/dashboard/maintenance/page.tsx` - Actualizado con integración completa

## Próximos Pasos

- Agregar módulo de Preventivos (CRUD completo) en tab dedicado
- Agregar módulo de Técnicos en tab de Recursos
- Integrar notificaciones para OTs vencidas
- Dashboard de métricas MTBF, MTTR, disponibilidad
