"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Percent, Calculator } from "lucide-react"
import { useFinancialData } from "@/hooks/use-financial-data"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardStats() {
  const { data: financialData, loading } = useFinancialData({ useCurrentMonth: true })

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <Skeleton className="h-4 w-24 mt-4" />
              <Skeleton className="h-8 w-32 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const stats = [
    {
      name: "Ventas del Mes",
      value: `$${(financialData.totalRevenue || 0).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: financialData.totalRevenue > 0 ? "+12.5%" : "0%",
      trend: financialData.totalRevenue > 0 ? ("up" as const) : ("neutral" as const),
      icon: DollarSign,
    },
    {
      name: "Costo de Bien Vendido (COGS)",
      value: `$${(financialData.cogs || 0).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change:
        financialData.cogs > 0 && financialData.totalRevenue > 0
          ? `${((financialData.cogs / financialData.totalRevenue) * 100).toFixed(1)}%`
          : "0%",
      trend: "neutral" as const,
      icon: Calculator,
    },
    {
      name: "Utilidad Bruta",
      value: `$${(financialData.grossProfit || 0).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change:
        financialData.totalRevenue > 0
          ? `${((financialData.grossProfit / financialData.totalRevenue) * 100).toFixed(1)}%`
          : "0%",
      trend: (financialData.grossProfit || 0) >= 0 ? ("up" as const) : ("down" as const),
      icon: DollarSign,
    },
    {
      name: "Margen de Utilidad Operativa",
      value: `${(financialData.operatingMargin || 0).toFixed(2)}%`,
      change:
        (financialData.operatingProfit || 0) >= 0
          ? `+$${Math.abs(financialData.operatingProfit || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
          : `-$${Math.abs(financialData.operatingProfit || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
      trend: (financialData.operatingMargin || 0) >= 0 ? ("up" as const) : ("down" as const),
      icon: Percent,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.name}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === "up"
                    ? "text-green-600"
                    : stat.trend === "down"
                      ? "text-red-600"
                      : "text-muted-foreground"
                }`}
              >
                {stat.trend === "up" ? (
                  <TrendingUp className="w-4 h-4" />
                ) : stat.trend === "down" ? (
                  <TrendingDown className="w-4 h-4" />
                ) : null}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">{stat.name}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
