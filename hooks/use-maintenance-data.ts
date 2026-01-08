"use client"

import { useMemo, useCallback } from "react"
import { useFirestore } from "./use-firestore"
import { COLLECTIONS } from "@/lib/firestore"
import type {
  Equipment,
  PreventiveMaintenance,
  WorkOrder,
  EquipmentReading,
  MaintenanceTechnician,
  StockMovement,
} from "@/lib/types"
import { orderBy, Timestamp } from "firebase/firestore"
import { toast } from "sonner"

export function useMaintenanceData() {
  const {
    items: equipment,
    loading: loadingEquipment,
    create: createEquipment,
    update: updateEquipment,
    remove: removeEquipment,
  } = useFirestore<Equipment>(COLLECTIONS.equipment, [orderBy("nombre", "asc")], true)

  const {
    items: preventivos,
    loading: loadingPreventivos,
    create: createPreventivo,
    update: updatePreventivo,
    remove: removePreventivo,
  } = useFirestore<PreventiveMaintenance>(COLLECTIONS.preventiveMaintenance, [orderBy("nombre", "asc")], true)

  const {
    items: workOrders,
    loading: loadingWO,
    create: createWorkOrder,
    update: updateWorkOrder,
    remove: removeWorkOrder,
  } = useFirestore<WorkOrder>(COLLECTIONS.workOrders, [orderBy("fechaProgramada", "desc")], true)

  const {
    items: readings,
    loading: loadingReadings,
    create: createReading,
  } = useFirestore<EquipmentReading>(COLLECTIONS.equipmentReadings, [orderBy("fecha", "desc")], true)

  const {
    items: technicians,
    loading: loadingTechnicians,
    create: createTechnician,
    update: updateTechnician,
  } = useFirestore<MaintenanceTechnician>(COLLECTIONS.maintenanceTechnicians, [orderBy("nombre", "asc")], true)

  const { create: createStockMovement } = useFirestore<StockMovement>(COLLECTIONS.stockMovements, [], false)

  const loading = loadingEquipment || loadingPreventivos || loadingWO || loadingReadings || loadingTechnicians

  const otsTotales = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return (workOrders || []).filter((wo) => {
      const woDate = wo.fechaCreacion instanceof Timestamp ? wo.fechaCreacion.toDate() : new Date(wo.fechaCreacion)
      return woDate.getFullYear() === currentYear
    }).length
  }, [workOrders])

  const otsProgramadas = useMemo(() => {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    return (workOrders || []).filter((wo) => {
      if (wo.estado !== "programada" && wo.estado !== "draft") return false
      const woDate =
        wo.fechaProgramada instanceof Timestamp ? wo.fechaProgramada.toDate() : new Date(wo.fechaProgramada)
      return woDate >= now && woDate <= thirtyDaysFromNow
    }).length
  }, [workOrders])

  const otsCompletadas = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return (workOrders || []).filter((wo) => {
      if (wo.estado !== "completada") return false
      const woDate = wo.fechaCreacion instanceof Timestamp ? wo.fechaCreacion.toDate() : new Date(wo.fechaCreacion)
      return woDate.getFullYear() === currentYear
    }).length
  }, [workOrders])

  const cumplimientoPercentage = useMemo(() => {
    if (otsTotales === 0) return 0
    return Math.round((otsCompletadas / otsTotales) * 100)
  }, [otsTotales, otsCompletadas])

  const otsVencidas = useMemo(() => {
    const now = new Date()
    return (workOrders || []).filter((wo) => {
      if (wo.estado === "completada" || wo.estado === "cancelada") return false
      const woDate =
        wo.fechaProgramada instanceof Timestamp ? wo.fechaProgramada.toDate() : new Date(wo.fechaProgramada)
      return woDate < now
    }).length
  }, [workOrders])

  const generateAutomaticWorkOrders = useCallback(async () => {
    const now = new Date()
    const generatedCount = 0

    for (const pm of preventivos || []) {
      if (!pm.generacionAutomatica || pm.estado !== "activo") continue

      let shouldGenerate = false

      if (pm.tipo === "calendario" && pm.proximaFechaEjecucion) {
        const proximaFecha =
          pm.proximaFechaEjecucion instanceof Timestamp
            ? pm.proximaFechaEjecucion.toDate()
            : new Date(pm.proximaFechaEjecucion)
        const diasParaEjecucion = Math.floor((proximaFecha.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (diasParaEjecucion <= pm.diasAnticipacion) {
          shouldGenerate = true
        }
      } else if (pm.tipo === "lectura" && pm.proximaLectura) {
        // Check equipment reading
        const equipo = equipment?.find((e) => e.id === pm.equipoId)
        if (equipo && equipo.lecturaActual >= pm.proximaLectura) {
          shouldGenerate = true
        }
      }

      if (shouldGenerate) {
        // Check if already generated
        const existingWO = workOrders?.find(
          (wo) =>
            wo.preventivo?.preventivoId === pm.id &&
            (wo.estado === "draft" || wo.estado === "programada" || wo.estado === "en_proceso"),
        )

        if (!existingWO) {
          const equipo = equipment?.find((e) => e.id === pm.equipoId)
          if (!equipo) continue

          const fechaProgramada =
            pm.tipo === "calendario" && pm.proximaFechaEjecucion
              ? pm.proximaFechaEjecucion
              : Timestamp.fromDate(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) // 7 days from now

          await createWorkOrder({
            folio: `PM-${Date.now()}`,
            tipo: "preventivo",
            equipoId: pm.equipoId,
            equipoNombre: pm.equipoNombre,
            equipoCodigo: pm.equipoCodigo,
            equipoPlanta: equipo.planta,
            preventivo: {
              preventivoId: pm.id!,
              preventivoCodigo: pm.codigo,
              preventivoNombre: pm.nombre,
              generadoAutomaticamente: true,
            },
            estado: "programada",
            prioridad: equipo.criticidad === "critica" ? "urgente" : equipo.criticidad === "alta" ? "alta" : "media",
            fechaCreacion: Timestamp.now(),
            fechaProgramada,
            tecnicoAsignadoId: pm.tecnicoAsignadoId,
            tecnicoAsignadoNombre: pm.tecnicoAsignadoNombre,
            actividades: pm.actividades.map((act) => ({
              descripcion: act.descripcion,
              orden: act.orden,
              completada: false,
              evidenciaRequerida: act.requiereEvidencia,
            })),
            refacciones: pm.refacciones?.map((ref) => ({
              productoId: ref.productoId,
              sku: ref.sku,
              nombre: ref.nombre,
              cantidad: ref.cantidad,
              unidad: ref.unidad,
              costoUnitario: 0,
              costoTotal: 0,
            })),
            tiempoEstimado: pm.tiempoEstimadoTotal,
            requiereAprobacion: equipo.criticidad === "critica",
            costoManoObra: 0,
            costoRefacciones: 0,
            costoParo: 0,
            costoTotal: 0,
          } as Omit<WorkOrder, "id" | "companyId" | "createdAt" | "updatedAt">)
        }
      }
    }

    if (generatedCount > 0) {
      toast.success(`Se generaron ${generatedCount} órdenes de trabajo automáticamente`)
    }

    return generatedCount
  }, [preventivos, equipment, workOrders, createWorkOrder])

  const completeWorkOrder = useCallback(
    async (
      workOrderId: string,
      data: {
        observaciones?: string
        tiempoReal: number
        costoManoObra: number
        evidencias?: WorkOrder["evidencias"]
        lecturaEquipo?: number
        completadoPor: string
        completadoPorNombre: string
      },
    ) => {
      const wo = workOrders?.find((w) => w.id === workOrderId)
      if (!wo) {
        toast.error("Orden de trabajo no encontrada")
        return null
      }

      // Calculate total spare parts cost
      const costoRefacciones = wo.refacciones?.reduce((sum, ref) => sum + ref.costoTotal, 0) || 0

      if (wo.refacciones && wo.refacciones.length > 0) {
        for (const refaccion of wo.refacciones) {
          if (refaccion.almacenId && refaccion.cantidad > 0) {
            await createStockMovement({
              tipo: "salida",
              concepto: "consumo_mantenimiento",
              productoId: refaccion.productoId,
              sku: refaccion.sku,
              productoNombre: refaccion.nombre,
              cantidad: refaccion.cantidad,
              unidad: refaccion.unidad,
              almacenOrigenId: refaccion.almacenId,
              almacenOrigenNombre: refaccion.almacenNombre || "",
              costoUnitario: refaccion.costoUnitario,
              costoTotal: refaccion.costoTotal,
              referenciaId: workOrderId,
              referenciaTipo: "work_order",
              referenciaFolio: wo.folio,
              fecha: Timestamp.now(),
              lote: refaccion.lote,
              serie: refaccion.serie,
              observaciones: `Consumo en OT ${wo.folio} - ${wo.equipoNombre}`,
            } as Omit<StockMovement, "id" | "companyId" | "createdAt" | "updatedAt">)
          }
        }
      }

      const costoTotal = data.costoManoObra + costoRefacciones + (data.tiempoReal * (wo.costoParo || 0)) / 60

      const updates: Partial<WorkOrder> = {
        estado: "completada",
        fechaFinalizacion: Timestamp.now(),
        observaciones: data.observaciones,
        tiempoReal: data.tiempoReal,
        costoManoObra: data.costoManoObra,
        costoRefacciones,
        costoTotal,
        evidencias: data.evidencias,
        lecturaEquipo: data.lecturaEquipo,
        tecnicoEjecutorId: data.completadoPor,
        tecnicoEjecutorNombre: data.completadoPorNombre,
      }

      const updated = await updateWorkOrder(workOrderId, updates)

      if (data.lecturaEquipo && wo.equipoId) {
        await updateEquipment(wo.equipoId, {
          lecturaActual: data.lecturaEquipo,
          ultimoMantenimiento: Timestamp.now(),
        })

        // Create reading record
        await createReading({
          equipoId: wo.equipoId,
          equipoNombre: wo.equipoNombre,
          equipoCodigo: wo.equipoCodigo,
          fecha: Timestamp.now(),
          lectura: data.lecturaEquipo,
          unidad: equipment?.find((e) => e.id === wo.equipoId)?.unidadLectura || "hrs",
          registradoPor: data.completadoPor,
          registradoPorNombre: data.completadoPorNombre,
          observaciones: `Lectura registrada al completar OT ${wo.folio}`,
        } as Omit<EquipmentReading, "id" | "companyId" | "createdAt" | "updatedAt">)
      }

      if (wo.preventivo) {
        const pm = preventivos?.find((p) => p.id === wo.preventivo?.preventivoId)
        if (pm) {
          const pmUpdates: Partial<PreventiveMaintenance> = {
            ultimaEjecucion: Timestamp.now(),
            ultimaOrdenTrabajoId: workOrderId,
          }

          if (pm.tipo === "calendario" && pm.periodicidadDias) {
            const proximaFecha = new Date()
            proximaFecha.setDate(proximaFecha.getDate() + pm.periodicidadDias)
            pmUpdates.proximaFechaEjecucion = Timestamp.fromDate(proximaFecha)
          } else if (pm.tipo === "lectura" && pm.periodicidadLectura && data.lecturaEquipo) {
            pmUpdates.lecturaBaseUltimaEjecucion = data.lecturaEquipo
            pmUpdates.proximaLectura = data.lecturaEquipo + pm.periodicidadLectura
          }

          await updatePreventivo(pm.id!, pmUpdates)
        }
      }

      toast.success("Orden de trabajo completada exitosamente")
      return updated
    },
    [
      workOrders,
      equipment,
      preventivos,
      updateWorkOrder,
      updateEquipment,
      updatePreventivo,
      createReading,
      createStockMovement,
    ],
  )

  const getEquipmentHistory = useCallback(
    (equipoId: string) => {
      const equipmentWOs = (workOrders || [])
        .filter((wo) => wo.equipoId === equipoId)
        .sort(
          (a, b) =>
            (b.fechaFinalizacion instanceof Timestamp
              ? b.fechaFinalizacion.toMillis()
              : new Date(b.fechaFinalizacion || 0).getTime()) -
            (a.fechaFinalizacion instanceof Timestamp
              ? a.fechaFinalizacion.toMillis()
              : new Date(a.fechaFinalizacion || 0).getTime()),
        )

      const equipmentReadings = (readings || [])
        .filter((r) => r.equipoId === equipoId)
        .sort(
          (a, b) =>
            (b.fecha instanceof Timestamp ? b.fecha.toMillis() : new Date(b.fecha).getTime()) -
            (a.fecha instanceof Timestamp ? a.fecha.toMillis() : new Date(a.fecha).getTime()),
        )

      return {
        workOrders: equipmentWOs,
        readings: equipmentReadings,
      }
    },
    [workOrders, readings],
  )

  return {
    equipment: equipment || [],
    preventivos: preventivos || [],
    workOrders: workOrders || [],
    readings: readings || [],
    technicians: technicians || [],
    createEquipment,
    updateEquipment,
    removeEquipment,
    createPreventivo,
    updatePreventivo,
    removePreventivo,
    createWorkOrder,
    updateWorkOrder,
    removeWorkOrder,
    createReading,
    createTechnician,
    updateTechnician,
    otsTotales,
    otsProgramadas,
    otsCompletadas,
    cumplimientoPercentage,
    otsVencidas,
    loading,
    generateAutomaticWorkOrders,
    completeWorkOrder,
    getEquipmentHistory,
  }
}
