"use client"

import { useMemo, useEffect, useState } from "react"
import { useFirestore } from "./use-firestore"
import { COLLECTIONS, migrateDocumentsWithoutUserId } from "@/lib/firestore"
import type { BankAccount, Check, BankTransfer, BankTransaction } from "@/lib/types"
import { orderBy } from "firebase/firestore"

export function useBankingData() {
  const [migrationDone, setMigrationDone] = useState(false)

  useEffect(() => {
    const runMigration = async () => {
      if (!migrationDone) {
        try {
          const results = await Promise.all([
            migrateDocumentsWithoutUserId(COLLECTIONS.bankAccounts),
            migrateDocumentsWithoutUserId(COLLECTIONS.checks),
            migrateDocumentsWithoutUserId(COLLECTIONS.bankTransfers),
            migrateDocumentsWithoutUserId(COLLECTIONS.bankTransactions),
          ])
          setMigrationDone(true)
        } catch (error) {
          console.error("[useBankingData] Migration error:", error)
        }
      }
    }

    runMigration()
  }, [migrationDone])

  const {
    items: bankAccounts,
    loading: loadingAccounts,
    create: createBankAccount,
    update: updateBankAccount,
    remove: removeBankAccount,
  } = useFirestore<BankAccount>(COLLECTIONS.bankAccounts, [orderBy("alias", "asc")], true)

  const {
    items: checks,
    loading: loadingChecks,
    create: createCheck,
    update: updateCheck,
    remove: removeCheck,
  } = useFirestore<Check>(COLLECTIONS.checks, [orderBy("fechaEmision", "desc")], true)

  const {
    items: transfers,
    loading: loadingTransfers,
    create: createTransfer,
    update: updateTransfer,
    remove: removeTransfer,
  } = useFirestore<BankTransfer>(COLLECTIONS.bankTransfers, [orderBy("fechaProgramada", "desc")], true)

  const {
    items: transactions,
    loading: loadingTransactions,
    create: createTransaction,
    update: updateTransaction,
    remove: removeTransaction,
  } = useFirestore<BankTransaction>(COLLECTIONS.bankTransactions, [orderBy("fecha", "desc")], true)

  const loading = loadingAccounts || loadingChecks || loadingTransfers || loadingTransactions

  const totalBalance = useMemo(() => {
    return (bankAccounts || []).reduce((sum, account) => sum + (account.saldoActual || 0), 0)
  }, [bankAccounts])

  const activeAccountsCount = useMemo(() => {
    return (bankAccounts || []).filter((a) => a.estado === "activa").length
  }, [bankAccounts])

  const monthlyIncome = useMemo(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    return (transactions || [])
      .filter((t) => {
        const date = t.fecha instanceof Date ? t.fecha : new Date(t.fecha)
        return date >= startOfMonth && t.tipo === "ingreso"
      })
      .reduce((sum, t) => sum + (t.monto || 0), 0)
  }, [transactions])

  const monthlyExpenses = useMemo(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    return (transactions || [])
      .filter((t) => {
        const date = t.fecha instanceof Date ? t.fecha : new Date(t.fecha)
        return date >= startOfMonth && t.tipo === "egreso"
      })
      .reduce((sum, t) => sum + (t.monto || 0), 0)
  }, [transactions])

  const recentTransactions = useMemo(() => {
    return (transactions || []).slice(0, 10)
  }, [transactions])

  return {
    bankAccounts: bankAccounts || [],
    accounts: bankAccounts || [],
    checks: checks || [],
    transfers: transfers || [],
    transactions: transactions || [],

    createBankAccount,
    updateBankAccount,
    removeBankAccount,
    createAccount: createBankAccount,
    updateAccount: updateBankAccount,
    removeAccount: removeBankAccount,

    createCheck,
    updateCheck,
    removeCheck,
    createTransfer,
    updateTransfer,
    removeTransfer,
    createTransaction,
    updateTransaction,
    removeTransaction,

    totalBalance,
    activeAccountsCount,
    monthlyIncome,
    monthlyExpenses,
    recentTransactions,

    loading,
  }
}
