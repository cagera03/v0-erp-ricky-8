"use client"

import { useMemo, useCallback } from "react"
import { useFirestore } from "./use-firestore"
import { useAuth } from "./use-auth"
import { COLLECTIONS } from "@/lib/firestore"
import type { ServiceTicket, ServiceMetrics, Customer, StockMovement } from "@/lib/types"
import { orderBy, Timestamp } from "firebase/firestore"

export function useServiceData() {
  const { user } = useAuth()
  const companyId = user?.companyId || user?.uid || ""
  const userId = user?.uid || ""

  const {
    items: tickets,
    loading: loadingTickets,
    create: createTicketBase,
    update: updateTicket,
    remove: removeTicket,
  } = useFirestore<ServiceTicket>(COLLECTIONS.serviceTickets, [orderBy("fechaCreacion", "desc")], true)

  const { items: customers, loading: loadingCustomers } = useFirestore<Customer>(
    COLLECTIONS.customers,
    [orderBy("nombre", "asc")],
    true,
  )

  const { items: stockMovements } = useFirestore<StockMovement>(
    COLLECTIONS.stockMovements,
    [orderBy("fecha", "desc")],
    true,
  )

  const loading = loadingTickets || loadingCustomers

  // Generate unique ticket number
  const generateTicketNumber = useMemo(() => {
    const maxNumber = (tickets || []).reduce((max, ticket) => {
      const num = Number.parseInt(ticket.numero.split("-")[1] || "0")
      return Math.max(max, num)
    }, 0)
    return `TKT-${String(maxNumber + 1).padStart(4, "0")}`
  }, [tickets])

  const createTicket = useCallback(
    async (data: Omit<ServiceTicket, "id" | "createdAt" | "updatedAt" | "companyId" | "userId">) => {
      const now = Timestamp.now()

      const sanitized: Omit<ServiceTicket, "id"> = {
        ...data,
        companyId,
        userId,
        createdAt: now,
        updatedAt: now,
        fechaCreacion: now,
        fechaUltimaActualizacion: now,
        etiquetas: data.etiquetas || [],
        adjuntos: data.adjuntos || [],
        notasInternas: data.notasInternas || [],
        historial: data.historial || [],
        slaViolado: false,
        ordenVentaId: data.ordenVentaId || null,
        ordenVentaFolio: data.ordenVentaFolio || null,
        remisionId: data.remisionId || null,
        remisionFolio: data.remisionFolio || null,
        facturaId: data.facturaId || null,
        facturaFolio: data.facturaFolio || null,
        lineasDevolucion: data.lineasDevolucion || [],
        almacenDevolucionId: data.almacenDevolucionId || null,
        almacenDevolucionNombre: data.almacenDevolucionNombre || null,
        estadoDevolucion: data.estadoDevolucion || null,
        movimientosInventarioIds: data.movimientosInventarioIds || [],
      }

      return await createTicketBase(sanitized)
    },
    [createTicketBase, companyId, userId],
  )

  const totalTickets = useMemo(() => {
    return (tickets || []).length
  }, [tickets])

  const ticketsAbiertos = useMemo(() => {
    return (tickets || []).filter(
      (t) => t.estado === "abierto" || t.estado === "en_proceso" || t.estado === "en_espera",
    ).length
  }, [tickets])

  const tiempoPromedioRespuesta = useMemo(() => {
    const ticketsConRespuesta = (tickets || []).filter((t) => t.tiempoPrimeraRespuesta != null)
    if (ticketsConRespuesta.length === 0) return 0
    const total = ticketsConRespuesta.reduce((sum, t) => sum + (t.tiempoPrimeraRespuesta || 0), 0)
    return total / ticketsConRespuesta.length / 60 // Convert to hours
  }, [tickets])

  const tiempoPromedioResolucion = useMemo(() => {
    const ticketsResueltos = (tickets || []).filter((t) => t.tiempoResolucion != null)
    if (ticketsResueltos.length === 0) return 0
    const total = ticketsResueltos.reduce((sum, t) => sum + (t.tiempoResolucion || 0), 0)
    return total / ticketsResueltos.length / 60 // Convert to hours
  }, [tickets])

  const satisfaccionPromedio = useMemo(() => {
    const ticketsConCalificacion = (tickets || []).filter((t) => t.calificacion != null)
    if (ticketsConCalificacion.length === 0) return 0
    const total = ticketsConCalificacion.reduce((sum, t) => sum + (t.calificacion || 0), 0)
    return total / ticketsConCalificacion.length
  }, [tickets])

  const cumplimientoSLA = useMemo(() => {
    const ticketsCerrados = (tickets || []).filter((t) => t.estado === "cerrado" || t.estado === "resuelto")
    if (ticketsCerrados.length === 0) return 100
    const cumplidos = ticketsCerrados.filter((t) => !t.slaViolado).length
    return (cumplidos / ticketsCerrados.length) * 100
  }, [tickets])

  const distribucionSatisfaccion = useMemo(() => {
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    ;(tickets || []).forEach((t) => {
      if (t.calificacion != null && t.calificacion >= 1 && t.calificacion <= 5) {
        dist[t.calificacion] = (dist[t.calificacion] || 0) + 1
      }
    })
    return dist
  }, [tickets])

  const distribucionCanales = useMemo(() => {
    const dist: Record<string, number> = {}
    ;(tickets || []).forEach((t) => {
      dist[t.canal] = (dist[t.canal] || 0) + 1
    })
    return dist
  }, [tickets])

  const distribucionCategorias = useMemo(() => {
    const dist: Record<string, number> = {}
    ;(tickets || []).forEach((t) => {
      dist[t.categoria] = (dist[t.categoria] || 0) + 1
    })
    return dist
  }, [tickets])

  const distribucionEstados = useMemo(() => {
    const dist: Record<string, number> = {}
    ;(tickets || []).forEach((t) => {
      dist[t.estado] = (dist[t.estado] || 0) + 1
    })
    return dist
  }, [tickets])

  const metrics: ServiceMetrics = {
    totalTickets,
    ticketsAbiertos,
    ticketsEnProceso: distribucionEstados["en_proceso"] || 0,
    ticketsResueltos: (distribucionEstados["resuelto"] || 0) + (distribucionEstados["cerrado"] || 0),
    tiempoPromedioRespuesta,
    tiempoPromedioResolucion,
    satisfaccionPromedio,
    cumplimientoSLA,
    distribucionCanales,
    distribucionCategorias,
    distribucionSatisfaccion,
  }

  return {
    tickets: tickets || [],
    customers: customers || [],
    stockMovements: stockMovements || [],
    createTicket,
    updateTicket,
    removeTicket,
    generateTicketNumber,
    metrics,
    loading,
  }
}
