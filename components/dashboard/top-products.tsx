"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useFirestore } from "@/hooks/use-firestore"
import { COLLECTIONS } from "@/lib/firestore"
import type { Order } from "@/lib/types"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Package } from "lucide-react"

interface ProductSales {
  name: string
  sales: number
  revenue: number
  trend: "up" | "down"
}

export function TopProducts() {
  const { items: orders, loading } = useFirestore<Order>(COLLECTIONS.orders, [], true)
  const [topProducts, setTopProducts] = useState<ProductSales[]>([])

  useEffect(() => {
    if (!orders || orders.length === 0) {
      setTopProducts([])
      return
    }

    const productMap: Record<string, { sales: number; revenue: number }> = {}

    orders.forEach((order) => {
      try {
        if (order && (order.status === "completed" || order.status === "processing")) {
          const productName = order.product || "Producto Desconocido"

          if (!productMap[productName]) {
            productMap[productName] = { sales: 0, revenue: 0 }
          }

          productMap[productName].sales += order.quantity || 1
          productMap[productName].revenue += order.total || 0
        }
      } catch (err) {
        console.error("[v0] Error processing order in top products:", err)
      }
    })

    const productsArray = Object.entries(productMap).map(([name, data]) => ({
      name,
      sales: data.sales || 0,
      revenue: data.revenue || 0,
      trend: "up" as const,
    }))

    productsArray.sort((a, b) => (b.revenue || 0) - (a.revenue || 0))

    setTopProducts(productsArray.slice(0, 5))
  }, [orders])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos Más Vendidos</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : topProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Aún no hay ventas registradas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.sales} unidades vendidas</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">
                    ${(product.revenue || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </p>
                  <Badge variant={product.trend === "up" ? "default" : "secondary"} className="mt-1">
                    {product.trend === "up" ? "↑" : "↓"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
