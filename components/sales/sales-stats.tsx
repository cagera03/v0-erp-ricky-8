import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, TrendingUp, ShoppingBag, CreditCard } from "lucide-react"

const stats = [
  {
    name: "Ventas Totales",
    value: "$45,280",
    change: "+12.5%",
    description: "Este mes",
    icon: DollarSign,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    name: "Ticket Promedio",
    value: "$285",
    change: "+8.2%",
    description: "Por transacción",
    icon: CreditCard,
    color: "text-green-600",
    bg: "bg-green-600/10",
  },
  {
    name: "Transacciones",
    value: "159",
    change: "+15.3%",
    description: "Este mes",
    icon: ShoppingBag,
    color: "text-blue-600",
    bg: "bg-blue-600/10",
  },
  {
    name: "Crecimiento",
    value: "+18.5%",
    change: "vs mes anterior",
    description: "Tendencia positiva",
    icon: TrendingUp,
    color: "text-orange-600",
    bg: "bg-orange-600/10",
  },
]

export function SalesStats() {
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
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-green-600">{stat.change}</span>
                  <span className="text-xs text-muted-foreground">{stat.description}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
