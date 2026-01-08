"use client"

import { useMemo } from "react"
import { useFirestore } from "./use-firestore"
import { COLLECTIONS } from "@/lib/firestore"
import type { Equipment, PreventiveMaintenance, WorkOrder, EquipmentReading } from "@/lib/types"
import { orderBy } from "firebase/firestore"

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
  } = useFirestore<PreventiveMaintenance>(COLLECTIONS.preventiveMaintenance, [orderBy("equipoNombre", "asc")], true)

  const {
    items: workOrders,
    loading: loadingWO,
    create: createWorkOrder,
    update: updateWorkOrder,
  } = useFirestore<WorkOrder>(COLLECTIONS.workOrders, [orderBy("fechaProgramada", "desc")], true)

  const {
    items: readings,
    loading: loadingReadings,
    create: createReading,
  } = useFirestore<EquipmentReading>(COLLECTIONS.equipmentReadings, [orderBy("fecha", "desc")], true)

  const loading = loadingEquipment || loadingPreventivos || loadingWO || loadingReadings

  // Calculate KPIs
  const otsTotales = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return (workOrders || []).filter((wo) => {
      const woDate = wo.fechaCreacion instanceof Date ? wo.fechaCreacion : new Date(wo.fechaCreacion as string)
      return woDate.getFullYear() === currentYear
    }).length
  }, [workOrders])

  const otsProgramadas = useMemo(() => {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    return (workOrders || []).filter((wo) => {
      if (wo.estado !== "pendiente" && wo.estado !== "programada") return false
      const woDate = wo.fechaProgramada instanceof Date ? wo.fechaProgramada : new Date(wo.fechaProgramada as string)
      return woDate >= now && woDate <= thirtyDaysFromNow
    }).length
  }, [workOrders])

  const otsCompletadas = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return (workOrders || []).filter((wo) => {
      if (wo.estado !== "completada") return false
      const woDate = wo.fechaCreacion instanceof Date ? wo.fechaCreacion : new Date(wo.fechaCreacion as string)
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
      const woDate = wo.fechaProgramada instanceof Date ? wo.fechaProgramada : new Date(wo.fechaProgramada as string)
      return woDate < now
    }).length
  }, [workOrders])

  return {
    equipment: equipment || [],
    preventivos: preventivos || [],
    workOrders: workOrders || [],
    readings: readings || [],
    createEquipment,
    updateEquipment,
    removeEquipment,
    createPreventivo,
    updatePreventivo,
    createWorkOrder,
    updateWorkOrder,
    createReading,
    otsTotales,
    otsProgramadas,
    otsCompletadas,
    cumplimientoPercentage,
    otsVencidas,
    loading,
  }
}
