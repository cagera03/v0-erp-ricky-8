"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Package, AlertTriangle, TrendingDown, DollarSign } from "lucide-react"
import { useFirestore } from "@/hooks/use-firestore"
import { COLLECTIONS } from "@/lib/firestore"

interface Product {
  id: string
  stock: number
  minStock: number
  price: number
  cost: number
}

export function InventoryStats() {
  const { items: products, loading } = useFirestore<Product>(COLLECTIONS.products, [], true)

  const totalProducts = products.length
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock).length
  const totalValue = products.reduce((sum, p) => sum + p.stock * (p.cost || p.price || 0), 0)

  const stats = [
    {
      name: "Total Productos",
      value: loading ? "..." : totalProducts.toString(),
      description: "En inventario",
      icon: Package,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      name: "Stock Bajo",
      value: loading ? "..." : lowStockProducts.toString(),
      description: "Requieren reposición",
      icon: AlertTriangle,
      color: "text-orange-600",
      bg: "bg-orange-600/10",
    },
    {
      name: "Productos Vendidos",
      value: "156",
      description: "Este mes",
      icon: TrendingDown,
      color: "text-blue-600",
      bg: "bg-blue-600/10",
    },
    {
      name: "Valor Inventario",
      value: loading
        ? "..."
        : `$${totalValue.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      description: "Valor total",
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-600/10",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.name}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{stat.name}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
