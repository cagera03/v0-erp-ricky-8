"use client"

import { useMemo } from "react"
import { useFirestore } from "./use-firestore"
import { useCRMData } from "./use-crm-data"
import { COLLECTIONS } from "@/lib/firestore"
import type { FieldServiceOrder, FieldTechnician, TechnicianLocation, FieldServiceMetrics } from "@/lib/types"
import { orderBy } from "firebase/firestore"

export function useFieldServicesData() {
  // Load all field service collections
  const {
    items: services,
    loading: loadingServices,
    create: createService,
    update: updateService,
    remove: removeService,
  } = useFirestore<FieldServiceOrder>(COLLECTIONS.fieldServiceOrders, [orderBy("fechaProgramada", "desc")], true)

  const {
    items: technicians,
    loading: loadingTechnicians,
    create: createTechnician,
    update: updateTechnician,
    remove: removeTechnician,
  } = useFirestore<FieldTechnician>(COLLECTIONS.fieldTechnicians, [orderBy("nombre", "asc")], true)

  const { items: locations, loading: loadingLocations } = useFirestore<TechnicianLocation>(
    COLLECTIONS.technicianLocations,
    [orderBy("timestamp", "desc")],
    true,
  )

  // Get customers for linking
  const { customers } = useCRMData()

  const loading = loadingServices || loadingTechnicians || loadingLocations

  // Generate unique service number
  const generateServiceNumber = useMemo(() => {
    const maxNumber = (services || []).reduce((max, service) => {
      const num = Number.parseInt(service.folio.split("-")[1] || "0")
      return Math.max(max, num)
    }, 0)
    return `SRV-${String(maxNumber + 1).padStart(3, "0")}`
  }, [services])

  // Calculate KPIs
  const serviciosActivos = useMemo(() => {
    return (services || []).filter((s) => s.estado === "asignado" || s.estado === "en_ruta" || s.estado === "en_sitio")
      .length
  }, [services])

  const tecnicosEnCampo = useMemo(() => {
    return (technicians || []).filter((t) => t.disponibilidad === "en_servicio").length
  }, [technicians])

  const serviciosDelMes = useMemo(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    return (services || []).filter((service) => {
      const fecha =
        service.fechaCreacion instanceof Date ? service.fechaCreacion : new Date(service.fechaCreacion as string)
      return fecha >= startOfMonth
    }).length
  }, [services])

  const tiempoPromedioHoras = useMemo(() => {
    const serviciosConDuracion = (services || []).filter((s) => s.duracionMinutos != null && s.duracionMinutos > 0)
    if (serviciosConDuracion.length === 0) return 0

    const totalMinutos = serviciosConDuracion.reduce((sum, s) => sum + (s.duracionMinutos || 0), 0)
    return totalMinutos / serviciosConDuracion.length / 60 // Convert to hours
  }, [services])

  const serviciosPorEstado = useMemo(() => {
    const estados: Record<string, number> = {}
    ;(services || []).forEach((s) => {
      estados[s.estado] = (estados[s.estado] || 0) + 1
    })
    return estados
  }, [services])

  const serviciosPorPrioridad = useMemo(() => {
    const prioridades: Record<string, number> = {}
    ;(services || []).forEach((s) => {
      prioridades[s.prioridad] = (prioridades[s.prioridad] || 0) + 1
    })
    return prioridades
  }, [services])

  const cumplimientoSLA = useMemo(() => {
    const serviciosCompletados = (services || []).filter((s) => s.estado === "finalizado")
    if (serviciosCompletados.length === 0) return 100

    const cumplidos = serviciosCompletados.filter((s) => {
      if (!s.duracionMinutos || !s.slaHoras) return true
      return s.duracionMinutos / 60 <= s.slaHoras
    }).length

    return (cumplidos / serviciosCompletados.length) * 100
  }, [services])

  const eficienciaTecnicos = useMemo(() => {
    if (!technicians || technicians.length === 0) return 100

    const promedioServicios =
      technicians.reduce((sum, t) => sum + (t.serviciosCompletados || 0), 0) / technicians.length

    return Math.min(100, (promedioServicios / 10) * 100) // Normalized to 100
  }, [technicians])

  const metrics: FieldServiceMetrics = {
    serviciosActivos,
    tecnicosEnCampo,
    serviciosDelMes,
    tiempoPromedioHoras,
    serviciosPorEstado,
    serviciosPorPrioridad,
    eficienciaTecnicos,
    cumplimientoSLA,
  }

  return {
    services: services || [],
    technicians: technicians || [],
    locations: locations || [],
    customers: customers || [],
    createService,
    updateService,
    removeService,
    createTechnician,
    updateTechnician,
    removeTechnician,
    generateServiceNumber,
    metrics,
    loading,
  }
}
