"use client"

import { useMemo } from "react"
import { useFirestore } from "./use-firestore"
import { COLLECTIONS } from "@/lib/firestore"
import type { LedgerAccount, JournalEntry, Budget } from "@/lib/types"
import { orderBy } from "firebase/firestore"

export function useAccountingData() {
  // Fetch ledger accounts
  const {
    items: ledgerAccounts,
    loading: loadingAccounts,
    addItem: addAccount,
    updateItem: updateAccount,
    deleteItem: deleteAccount,
  } = useFirestore<LedgerAccount>(COLLECTIONS.ledgerAccounts, [orderBy("codigo", "asc")], true)

  // Fetch journal entries
  const {
    items: journalEntries,
    loading: loadingEntries,
    addItem: addEntry,
    updateItem: updateEntry,
    deleteItem: deleteEntry,
  } = useFirestore<JournalEntry>(COLLECTIONS.journalEntries, [orderBy("fecha", "desc")], true)

  // Fetch budgets
  const {
    items: budgets,
    loading: loadingBudgets,
    addItem: addBudget,
    updateItem: updateBudget,
    deleteItem: deleteBudget,
  } = useFirestore<Budget>(COLLECTIONS.budgets, [orderBy("año", "desc")], true)

  // Calculate balance general from ledger accounts
  const balanceGeneral = useMemo(() => {
    if (!ledgerAccounts || ledgerAccounts.length === 0) return 0

    const activoCuentas = ledgerAccounts.filter((acc) => acc.tipo === "Activo" && acc.acumulaSaldo)
    const pasivoCuentas = ledgerAccounts.filter((acc) => acc.tipo === "Pasivo" && acc.acumulaSaldo)
    const capitalCuentas = ledgerAccounts.filter((acc) => acc.tipo === "Capital" && acc.acumulaSaldo)

    const totalActivo = activoCuentas.reduce((sum, acc) => sum + (acc.saldo || 0), 0)
    const totalPasivo = pasivoCuentas.reduce((sum, acc) => sum + (acc.saldo || 0), 0)
    const totalCapital = capitalCuentas.reduce((sum, acc) => sum + (acc.saldo || 0), 0)

    return totalActivo - totalPasivo - totalCapital
  }, [ledgerAccounts])

  // Calculate monthly income from journal entries
  const ingresosDelMes = useMemo(() => {
    if (!journalEntries || journalEntries.length === 0) return 0

    const now = new Date()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()

    return journalEntries
      .filter((entry) => {
        if (entry.estado !== "autorizada") return false
        const entryDate = entry.fecha instanceof Date ? entry.fecha : new Date(entry.fecha)
        return entryDate.getMonth() === thisMonth && entryDate.getFullYear() === thisYear
      })
      .filter((entry) => entry.tipo === "Ingresos")
      .reduce((sum, entry) => sum + (entry.totalAbonos || 0), 0)
  }, [journalEntries])

  // Calculate monthly expenses from journal entries
  const egresosDelMes = useMemo(() => {
    if (!journalEntries || journalEntries.length === 0) return 0

    const now = new Date()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()

    return journalEntries
      .filter((entry) => {
        if (entry.estado !== "autorizada") return false
        const entryDate = entry.fecha instanceof Date ? entry.fecha : new Date(entry.fecha)
        return entryDate.getMonth() === thisMonth && entryDate.getFullYear() === thisYear
      })
      .filter((entry) => entry.tipo === "Egresos")
      .reduce((sum, entry) => sum + (entry.totalCargos || 0), 0)
  }, [journalEntries])

  // Journal entry stats
  const polizasDelMes = useMemo(() => {
    if (!journalEntries || journalEntries.length === 0) return 0

    const now = new Date()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()

    return journalEntries.filter((entry) => {
      const entryDate = entry.fecha instanceof Date ? entry.fecha : new Date(entry.fecha)
      return entryDate.getMonth() === thisMonth && entryDate.getFullYear() === thisYear
    }).length
  }, [journalEntries])

  const polizasPendientes = useMemo(() => {
    if (!journalEntries || journalEntries.length === 0) return 0
    return journalEntries.filter((entry) => entry.estado === "borrador").length
  }, [journalEntries])

  // Active budget
  const presupuestoActivo = useMemo(() => {
    if (!budgets || budgets.length === 0) return null
    return budgets.find((b) => b.estado === "activo") || null
  }, [budgets])

  const loading = loadingAccounts || loadingEntries || loadingBudgets

  return {
    // Data
    ledgerAccounts: ledgerAccounts || [],
    journalEntries: journalEntries || [],
    budgets: budgets || [],

    // KPIs
    balanceGeneral,
    ingresosDelMes,
    egresosDelMes,
    polizasDelMes,
    polizasPendientes,
    presupuestoActivo,

    // Loading state
    loading,

    // CRUD methods
    addAccount,
    updateAccount,
    deleteAccount,
    addEntry,
    updateEntry,
    deleteEntry,
    addBudget,
    updateBudget,
    deleteBudget,
  }
}
