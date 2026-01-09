"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { getFirebaseDb } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"

export interface InventoryTablePreferences {
  visibleColumns: {
    sku: boolean
    name: boolean
    category: boolean
    stock: boolean
    minStock: boolean
    price: boolean
    supplier: boolean
    avgDemand: boolean
    suggestedOrder: boolean
    status: boolean
  }
  demandPeriodDays: number
}

const DEFAULT_PREFERENCES: InventoryTablePreferences = {
  visibleColumns: {
    sku: true,
    name: true,
    category: true,
    stock: true,
    minStock: true,
    price: true,
    supplier: false,
    avgDemand: true,
    suggestedOrder: true,
    status: true,
  },
  demandPeriodDays: 30,
}

export function useUserPreferences() {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<InventoryTablePreferences>(DEFAULT_PREFERENCES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) {
      setPreferences(DEFAULT_PREFERENCES)
      setLoading(false)
      return
    }

    loadPreferences()
  }, [user?.uid])

  const loadPreferences = async () => {
    if (!user?.uid) return

    try {
      const db = getFirebaseDb()
      const prefsRef = doc(db, `users/${user.uid}/preferences/inventoryTable`)
      const prefsSnap = await getDoc(prefsRef)

      if (prefsSnap.exists()) {
        setPreferences(prefsSnap.data() as InventoryTablePreferences)
      } else {
        setPreferences(DEFAULT_PREFERENCES)
      }
    } catch (error) {
      console.error("[Preferences] Error loading preferences:", error)
      setPreferences(DEFAULT_PREFERENCES)
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async (newPreferences: InventoryTablePreferences) => {
    if (!user?.uid) return

    try {
      const db = getFirebaseDb()
      const prefsRef = doc(db, `users/${user.uid}/preferences/inventoryTable`)
      await setDoc(prefsRef, newPreferences, { merge: true })
      setPreferences(newPreferences)
    } catch (error) {
      console.error("[Preferences] Error saving preferences:", error)
      throw error
    }
  }

  return {
    preferences,
    loading,
    savePreferences,
  }
}
