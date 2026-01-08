import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Clock, CheckCircle, XCircle } from "lucide-react"

const stats = [
  {
    name: "Órdenes Totales",
    value: "156",
    description: "Este mes",
    icon: ShoppingCart,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    name: "Pendientes",
    value: "18",
    description: "Esperando procesamiento",
    icon: Clock,
    color: "text-orange-600",
    bg: "bg-orange-600/10",
  },
  {
    name: "Completadas",
    value: "132",
    description: "Entregadas exitosamente",
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-600/10",
  },
  {
    name: "Canceladas",
    value: "6",
    description: "Este mes",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-600/10",
  },
]

export function OrdersStats() {
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
