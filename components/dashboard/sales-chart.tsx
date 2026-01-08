"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useFirestore } from "@/hooks/use-firestore"
import { COLLECTIONS } from "@/lib/firestore"
import type { Order } from "@/lib/types"
import { Timestamp } from "firebase/firestore"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface MonthlyData {
  month: string
  ventas: number
}

const DEFAULT_CHART_DATA: MonthlyData[] = [
  { month: "Ene", ventas: 0 },
  { month: "Feb", ventas: 0 },
  { month: "Mar", ventas: 0 },
  { month: "Abr", ventas: 0 },
  { month: "May", ventas: 0 },
  { month: "Jun", ventas: 0 },
  { month: "Jul", ventas: 0 },
  { month: "Ago", ventas: 0 },
  { month: "Sep", ventas: 0 },
  { month: "Oct", ventas: 0 },
  { month: "Nov", ventas: 0 },
  { month: "Dic", ventas: 0 },
]

export function SalesChart() {
  const { items: orders, loading } = useFirestore<Order>(COLLECTIONS.orders, [], true)
  const [chartData, setChartData] = useState<MonthlyData[]>(DEFAULT_CHART_DATA)

  useEffect(() => {
    if (!orders || orders.length === 0) {
      setChartData(DEFAULT_CHART_DATA)
      return
    }

    const monthlyTotals: Record<number, number> = {}
    const currentYear = new Date().getFullYear()

    orders.forEach((order) => {
      try {
        if (order && (order.status === "completed" || order.status === "processing")) {
          const orderDate = order.date instanceof Timestamp ? order.date.toDate() : new Date(order.date)

          if (orderDate && orderDate.getFullYear() === currentYear) {
            const monthKey = orderDate.getMonth()
            monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + (order.total || 0)
          }
        }
      } catch (err) {
        console.error("[v0] Error processing order in chart:", err)
      }
    })

    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

    const data = months.map((month, index) => ({
      month,
      ventas: monthlyTotals[index] || 0,
    }))

    setChartData(data)
  }, [orders])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas Anuales</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <ChartContainer
            config={{
              ventas: {
                label: "Ventas",
                color: "hsl(var(--primary))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="ventas" stroke="var(--color-ventas)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
