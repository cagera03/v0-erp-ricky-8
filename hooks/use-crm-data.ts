"use client"

import { useMemo } from "react"
import { useFirestore } from "./use-firestore"
import { COLLECTIONS } from "@/lib/firestore"
import type { Customer, Lead, CustomerDocument, AccountReceivable, CFDI } from "@/lib/types"
import { orderBy } from "firebase/firestore"

export function useCRMData() {
  // Load all CRM collections
  const {
    items: customers,
    loading: loadingCustomers,
    create: createCustomer,
    update: updateCustomer,
    remove: removeCustomer,
  } = useFirestore<Customer>(COLLECTIONS.customers, [orderBy("nombre", "asc")], true)

  const {
    items: leads,
    loading: loadingLeads,
    create: createLead,
    update: updateLead,
    remove: removeLead,
  } = useFirestore<Lead>(COLLECTIONS.leads, [orderBy("empresa", "asc")], true)

  const {
    items: documents,
    loading: loadingDocuments,
    create: createDocument,
    update: updateDocument,
    remove: removeDocument,
  } = useFirestore<CustomerDocument>(COLLECTIONS.customerDocuments, [orderBy("fecha", "desc")], true)

  const {
    items: receivables,
    loading: loadingReceivables,
    create: createReceivable,
    update: updateReceivable,
    remove: removeReceivable,
  } = useFirestore<AccountReceivable>(COLLECTIONS.accountsReceivable, [orderBy("fechaVencimiento", "asc")], true)

  const {
    items: cfdis,
    loading: loadingCFDIs,
    create: createCFDI,
    update: updateCFDI,
    remove: removeCFDI,
  } = useFirestore<CFDI>(COLLECTIONS.cfdi, [orderBy("fecha", "desc")], true)

  const loading = loadingCustomers || loadingLeads || loadingDocuments || loadingReceivables || loadingCFDIs

  // Calculate metrics
  const totalClientes = useMemo(() => {
    return (customers || []).length
  }, [customers])

  const clientesActivos = useMemo(() => {
    return (customers || []).filter((c) => c.estado === "activo").length
  }, [customers])

  const porCobrar = useMemo(() => {
    return (receivables || []).filter((r) => r.estado !== "pagada").reduce((sum, r) => sum + (r.saldo || 0), 0)
  }, [receivables])

  const documentosDelMes = useMemo(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    return (documents || []).filter((doc) => {
      const fecha = doc.fecha instanceof Date ? doc.fecha : new Date(doc.fecha as string)
      return fecha >= startOfMonth
    }).length
  }, [documents])

  // Lead pipeline stats
  const leadsByStage = useMemo(() => {
    const stages = {
      prospecto: 0,
      contactado: 0,
      calificado: 0,
      propuesta: 0,
      negociacion: 0,
      cerrado: 0,
      perdido: 0,
    }
    ;(leads || []).forEach((lead) => {
      if (stages.hasOwnProperty(lead.etapa)) {
        stages[lead.etapa as keyof typeof stages]++
      }
    })

    return stages
  }, [leads])

  const valorEstimadoPipeline = useMemo(() => {
    return (leads || [])
      .filter((l) => l.etapa !== "cerrado" && l.etapa !== "perdido")
      .reduce((sum, l) => sum + ((l.valorEstimado || 0) * (l.probabilidad || 0)) / 100, 0)
  }, [leads])

  // Document stats
  const documentsByType = useMemo(() => {
    const types = {
      cotizacion: 0,
      pedido: 0,
      remision: 0,
      factura: 0,
      nota_credito: 0,
    }
    ;(documents || []).forEach((doc) => {
      if (types.hasOwnProperty(doc.tipo)) {
        types[doc.tipo as keyof typeof types]++
      }
    })

    return types
  }, [documents])

  // Receivables aging
  const receivablesAging = useMemo(() => {
    const now = new Date()
    const aging = {
      vigente: 0, // Not due yet
      vencido30: 0, // 1-30 days overdue
      vencido60: 0, // 31-60 days overdue
      vencido90: 0, // 61-90 days overdue
      vencido90Plus: 0, // 90+ days overdue
    }
    ;(receivables || [])
      .filter((r) => r.estado !== "pagada")
      .forEach((r) => {
        const dueDate = r.fechaVencimiento instanceof Date ? r.fechaVencimiento : new Date(r.fechaVencimiento as string)
        const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

        if (daysOverdue <= 0) {
          aging.vigente += r.saldo || 0
        } else if (daysOverdue <= 30) {
          aging.vencido30 += r.saldo || 0
        } else if (daysOverdue <= 60) {
          aging.vencido60 += r.saldo || 0
        } else if (daysOverdue <= 90) {
          aging.vencido90 += r.saldo || 0
        } else {
          aging.vencido90Plus += r.saldo || 0
        }
      })

    return aging
  }, [receivables])

  return {
    // Collections
    customers: customers || [],
    leads: leads || [],
    documents: documents || [],
    receivables: receivables || [],
    cfdis: cfdis || [],

    // CRUD methods
    createCustomer,
    updateCustomer,
    removeCustomer,
    createLead,
    updateLead,
    removeLead,
    createDocument,
    updateDocument,
    removeDocument,
    createReceivable,
    updateReceivable,
    removeReceivable,
    createCFDI,
    updateCFDI,
    removeCFDI,

    // Metrics
    totalClientes,
    clientesActivos,
    porCobrar,
    documentosDelMes,
    leadsByStage,
    valorEstimadoPipeline,
    documentsByType,
    receivablesAging,

    loading,
  }
}
