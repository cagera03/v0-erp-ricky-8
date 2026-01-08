"use client"

import { useState, useEffect } from "react"
import { COLLECTIONS } from "@/lib/firestore"
import { collection, query, where, getDocs, type Timestamp } from "firebase/firestore"
import { getFirebaseDb } from "@/lib/firebase"

interface Order {
  id: string
  status: string
  items: Array<{
    productId: string
    quantity: number
  }>
  createdAt?: Timestamp
}

interface Product {
  id: string
  leadTime?: number
  stock: number
}

export interface ProductDemandData {
  avgDemand30Days: number
  suggestedOrder: number
  suggestedOrderLevel: "safe" | "warning" | "critical"
}

const DEFAULT_LEAD_TIME = 5 // días
const SAFETY_FACTOR = 3 // 3x demanda promedio para stock de seguridad
const CRITICAL_THRESHOLD = 50 // unidades

export function useInventoryCalculations(products: Product[], demandPeriodDays = 30) {
  const [demandData, setDemandData] = useState<Record<string, ProductDemandData>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    calculateDemand()
  }, [products, demandPeriodDays])

  const calculateDemand = async () => {
    if (products.length === 0) {
      setLoading(false)
      return
    }

    try {
      const db = getFirebaseDb()
      const ordersRef = collection(db, COLLECTIONS.orders)

      // Obtener órdenes de los últimos demandPeriodDays días
      const periodStart = new Date()
      periodStart.setDate(periodStart.getDate() - demandPeriodDays)

      const q = query(ordersRef, where("status", "in", ["completed", "delivered", "dispatched"]))

      const ordersSnapshot = await getDocs(q)
      const orders = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[]

      // Filtrar órdenes de los últimos demandPeriodDays días
      const recentOrders = orders.filter((order) => {
        if (!order.createdAt) return false
        const orderDate = order.createdAt.toDate()
        return orderDate >= periodStart
      })

      // Calcular demanda por producto
      const productDemand: Record<string, number> = {}

      recentOrders.forEach((order) => {
        if (Array.isArray(order.items)) {
          order.items.forEach((item) => {
            if (item.productId && item.quantity) {
              productDemand[item.productId] = (productDemand[item.productId] || 0) + item.quantity
            }
          })
        }
      })

      // Calcular métricas para cada producto
      const calculatedData: Record<string, ProductDemandData> = {}

      products.forEach((product) => {
        const totalDemand = productDemand[product.id] || 0
        const avgDemand = demandPeriodDays > 0 ? totalDemand / demandPeriodDays : 0

        const leadTime = product.leadTime || DEFAULT_LEAD_TIME
        const safetyStock = avgDemand * SAFETY_FACTOR
        const reorderPoint = avgDemand * leadTime + safetyStock
        const currentStock = product.stock || 0

        // Pedido Sugerido = max((Demanda × LeadTime + Stock Seguridad) - Inventario, 0)
        const suggestedOrder = Math.max(reorderPoint - currentStock, 0)

        let level: "safe" | "warning" | "critical" = "safe"
        if (suggestedOrder > 0 && suggestedOrder <= CRITICAL_THRESHOLD) {
          level = "warning"
        } else if (suggestedOrder > CRITICAL_THRESHOLD) {
          level = "critical"
        }

        calculatedData[product.id] = {
          avgDemand30Days: avgDemand,
          suggestedOrder: Math.round(suggestedOrder),
          suggestedOrderLevel: level,
        }
      })

      setDemandData(calculatedData)
    } catch (error) {
      console.error("[Inventory] Error calculating demand:", error)
    } finally {
      setLoading(false)
    }
  }

  return {
    demandData,
    loading: loading,
  }
}
