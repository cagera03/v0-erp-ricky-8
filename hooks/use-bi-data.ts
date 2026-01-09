"use client"

import { useState, useEffect, useMemo } from "react"
import { where } from "firebase/firestore"
import { COLLECTIONS, subscribeToCollection, addItem, updateItem, deleteItem } from "@/lib/firestore"
import type {
  BIQuery,
  BIDashboard,
  BIReport,
  BIExport,
  SalesOrder,
  SalesInvoice,
  StockMovement,
  PurchaseOrder,
  ServiceTicket,
  WorkOrder,
  JournalEntry,
  BankTransaction,
  Employee,
} from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export function useBiData(companyId: string) {
  const { user } = useAuth()
  const { toast } = useToast()

  // BI collections
  const [queries, setQueries] = useState<BIQuery[]>([])
  const [dashboards, setDashboards] = useState<BIDashboard[]>([])
  const [reports, setReports] = useState<BIReport[]>([])
  const [exports, setExports] = useState<BIExport[]>([])

  // Operational data sources for BI queries
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoice[]>([])
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([])
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [serviceTickets, setServiceTickets] = useState<ServiceTicket[]>([])
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])

  const [loading, setLoading] = useState(true)

  const userId = user?.uid || ""

  useEffect(() => {
    if (!userId || !companyId) {
      console.log("[v0] [BI] Waiting for userId and companyId. userId:", userId, "companyId:", companyId)
      setLoading(false)
      return
    }

    console.log("[v0] [BI] Starting subscriptions for companyId:", companyId, "userId:", userId)
    setLoading(true)

    const unsubscribers = [
      // BI collections
      subscribeToCollection<BIQuery>(
        COLLECTIONS.biQueries,
        (data) => {
          console.log("[v0] [BI] Queries updated:", data.length)
          setQueries(data)
        },
        [where("userId", "==", userId), where("companyId", "==", companyId)],
      ),
      subscribeToCollection<BIDashboard>(
        COLLECTIONS.biDashboards,
        (data) => {
          console.log("[v0] [BI] Dashboards updated:", data.length)
          setDashboards(data)
        },
        [where("userId", "==", userId), where("companyId", "==", companyId)],
      ),
      subscribeToCollection<BIReport>(
        COLLECTIONS.biReports,
        (data) => {
          console.log("[v0] [BI] Reports updated:", data.length)
          setReports(data)
        },
        [where("userId", "==", userId), where("companyId", "==", companyId)],
      ),
      subscribeToCollection<BIExport>(
        COLLECTIONS.biExports,
        (data) => {
          console.log("[v0] [BI] Exports updated:", data.length)
          setExports(data)
        },
        [where("userId", "==", userId), where("companyId", "==", companyId)],
      ),

      // Operational data sources
      subscribeToCollection<SalesOrder>(COLLECTIONS.salesOrders, setSalesOrders, [where("companyId", "==", companyId)]),
      subscribeToCollection<SalesInvoice>(COLLECTIONS.salesInvoices, setSalesInvoices, [
        where("companyId", "==", companyId),
      ]),
      subscribeToCollection<StockMovement>(COLLECTIONS.stockMovements, setStockMovements, [
        where("companyId", "==", companyId),
      ]),
      subscribeToCollection<PurchaseOrder>(COLLECTIONS.purchaseOrders, setPurchaseOrders, [
        where("companyId", "==", companyId),
      ]),
      subscribeToCollection<ServiceTicket>(COLLECTIONS.serviceTickets, setServiceTickets, [
        where("companyId", "==", companyId),
      ]),
      subscribeToCollection<WorkOrder>(COLLECTIONS.workOrders, setWorkOrders, [where("companyId", "==", companyId)]),
      subscribeToCollection<JournalEntry>(COLLECTIONS.journalEntries, setJournalEntries, [
        where("companyId", "==", companyId),
      ]),
      subscribeToCollection<BankTransaction>(COLLECTIONS.bankTransactions, setBankTransactions, [
        where("companyId", "==", companyId),
      ]),
      subscribeToCollection<Employee>(COLLECTIONS.employees, setEmployees, [where("companyId", "==", companyId)]),
    ]

    setLoading(false)

    return () => {
      console.log("[v0] [BI] Cleaning up subscriptions")
      unsubscribers.forEach((unsub) => unsub())
    }
  }, [userId, companyId])

  // Metrics calculated from real data
  const metrics = useMemo(() => {
    const safeQueries = Array.isArray(queries) ? queries : []
    const safeDashboards = Array.isArray(dashboards) ? dashboards : []
    const safeReports = Array.isArray(reports) ? reports : []
    const safeExports = Array.isArray(exports) ? exports : []

    return {
      consultasActivas: safeQueries.filter((q) => q.estado === "activa").length,
      tablerosCreados: safeDashboards.length,
      reportesProgramados: safeReports.filter((r) => r.programado && r.estado === "activo").length,
      exportaciones: safeExports.filter((e) => e.estado === "completado").length,
    }
  }, [queries, dashboards, reports, exports])

  // CRUD operations for BI collections
  const addQuery = async (queryData: Omit<BIQuery, "id" | "createdAt" | "updatedAt">) => {
    try {
      console.log("[v0] [BI] Adding query:", queryData.nombre)
      const newQuery = await addItem<BIQuery>(COLLECTIONS.biQueries, {
        ...queryData,
        companyId,
        userId,
        status: "active",
      })
      toast({ title: "Consulta creada", description: "La consulta se ha creado correctamente." })
      return newQuery
    } catch (error) {
      console.error("[v0] [BI] Error adding query:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear la consulta",
        variant: "destructive",
      })
      throw error
    }
  }

  const updateQuery = async (id: string, updates: Partial<BIQuery>) => {
    try {
      console.log("[v0] [BI] Updating query:", id)
      await updateItem<BIQuery>(COLLECTIONS.biQueries, id, updates)
      toast({ title: "Consulta actualizada", description: "Los cambios se han guardado correctamente." })
    } catch (error) {
      console.error("[v0] [BI] Error updating query:", error)
      toast({ title: "Error", description: "No se pudo actualizar la consulta", variant: "destructive" })
      throw error
    }
  }

  const deleteQuery = async (id: string) => {
    try {
      console.log("[v0] [BI] Deleting query:", id)
      await deleteItem(COLLECTIONS.biQueries, id)
      toast({ title: "Consulta eliminada", description: "La consulta se ha eliminado correctamente." })
    } catch (error) {
      console.error("[v0] [BI] Error deleting query:", error)
      toast({ title: "Error", description: "No se pudo eliminar la consulta", variant: "destructive" })
      throw error
    }
  }

  const addDashboard = async (dashboardData: Omit<BIDashboard, "id" | "createdAt" | "updatedAt">) => {
    try {
      console.log("[v0] [BI] Adding dashboard:", dashboardData.nombre)
      const newDashboard = await addItem<BIDashboard>(COLLECTIONS.biDashboards, {
        ...dashboardData,
        companyId,
        userId,
        status: "active",
      })
      toast({ title: "Tablero creado", description: "El tablero se ha creado correctamente." })
      return newDashboard
    } catch (error) {
      console.error("[v0] [BI] Error adding dashboard:", error)
      toast({ title: "Error", description: "No se pudo crear el tablero", variant: "destructive" })
      throw error
    }
  }

  const updateDashboard = async (id: string, updates: Partial<BIDashboard>) => {
    try {
      console.log("[v0] [BI] Updating dashboard:", id)
      await updateItem<BIDashboard>(COLLECTIONS.biDashboards, id, updates)
      toast({ title: "Tablero actualizado", description: "Los cambios se han guardado correctamente." })
    } catch (error) {
      console.error("[v0] [BI] Error updating dashboard:", error)
      toast({ title: "Error", description: "No se pudo actualizar el tablero", variant: "destructive" })
      throw error
    }
  }

  const deleteDashboard = async (id: string) => {
    try {
      console.log("[v0] [BI] Deleting dashboard:", id)
      await deleteItem(COLLECTIONS.biDashboards, id)
      toast({ title: "Tablero eliminado", description: "El tablero se ha eliminado correctamente." })
    } catch (error) {
      console.error("[v0] [BI] Error deleting dashboard:", error)
      toast({ title: "Error", description: "No se pudo eliminar el tablero", variant: "destructive" })
      throw error
    }
  }

  const addReport = async (reportData: Omit<BIReport, "id" | "createdAt" | "updatedAt">) => {
    try {
      console.log("[v0] [BI] Adding report:", reportData.nombre)
      const newReport = await addItem<BIReport>(COLLECTIONS.biReports, {
        ...reportData,
        companyId,
        userId,
        status: "active",
      })
      toast({ title: "Reporte creado", description: "El reporte se ha configurado correctamente." })
      return newReport
    } catch (error) {
      console.error("[v0] [BI] Error adding report:", error)
      toast({ title: "Error", description: "No se pudo crear el reporte", variant: "destructive" })
      throw error
    }
  }

  const updateReport = async (id: string, updates: Partial<BIReport>) => {
    try {
      console.log("[v0] [BI] Updating report:", id)
      await updateItem<BIReport>(COLLECTIONS.biReports, id, updates)
      toast({ title: "Reporte actualizado", description: "Los cambios se han guardado correctamente." })
    } catch (error) {
      console.error("[v0] [BI] Error updating report:", error)
      toast({ title: "Error", description: "No se pudo actualizar el reporte", variant: "destructive" })
      throw error
    }
  }

  const deleteReport = async (id: string) => {
    try {
      console.log("[v0] [BI] Deleting report:", id)
      await deleteItem(COLLECTIONS.biReports, id)
      toast({ title: "Reporte eliminado", description: "El reporte se ha eliminado correctamente." })
    } catch (error) {
      console.error("[v0] [BI] Error deleting report:", error)
      toast({ title: "Error", description: "No se pudo eliminar el reporte", variant: "destructive" })
      throw error
    }
  }

  const createExport = async (exportData: Omit<BIExport, "id" | "createdAt" | "updatedAt">) => {
    try {
      console.log("[v0] [BI] Creating export:", exportData.tipo)
      const newExport = await addItem<BIExport>(COLLECTIONS.biExports, {
        ...exportData,
        companyId,
        userId,
        estado: "generando",
        progreso: 0,
      })
      toast({ title: "Exportación iniciada", description: "Se está generando tu archivo..." })
      return newExport
    } catch (error) {
      console.error("[v0] [BI] Error creating export:", error)
      toast({ title: "Error", description: "No se pudo iniciar la exportación", variant: "destructive" })
      throw error
    }
  }

  // Data source accessor for queries
  const getDataSource = (collectionName: string): any[] => {
    const sources: Record<string, any[]> = {
      salesOrders,
      salesInvoices,
      stockMovements,
      purchaseOrders,
      serviceTickets,
      workOrders,
      journalEntries,
      bankTransactions,
      employees,
    }
    return sources[collectionName] || []
  }

  return {
    // State
    queries: Array.isArray(queries) ? queries : [],
    dashboards: Array.isArray(dashboards) ? dashboards : [],
    reports: Array.isArray(reports) ? reports : [],
    exports: Array.isArray(exports) ? exports : [],
    loading,
    metrics,

    // Data sources
    salesOrders: Array.isArray(salesOrders) ? salesOrders : [],
    salesInvoices: Array.isArray(salesInvoices) ? salesInvoices : [],
    stockMovements: Array.isArray(stockMovements) ? stockMovements : [],
    purchaseOrders: Array.isArray(purchaseOrders) ? purchaseOrders : [],
    serviceTickets: Array.isArray(serviceTickets) ? serviceTickets : [],
    workOrders: Array.isArray(workOrders) ? workOrders : [],
    journalEntries: Array.isArray(journalEntries) ? journalEntries : [],
    bankTransactions: Array.isArray(bankTransactions) ? bankTransactions : [],
    employees: Array.isArray(employees) ? employees : [],

    getDataSource,

    // CRUD operations
    addQuery,
    updateQuery,
    deleteQuery,
    addDashboard,
    updateDashboard,
    deleteDashboard,
    addReport,
    updateReport,
    deleteReport,
    createExport,
  }
}
