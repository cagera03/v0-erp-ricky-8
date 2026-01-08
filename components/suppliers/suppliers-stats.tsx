import { Card, CardContent } from "@/components/ui/card"
import { Users, TrendingUp, DollarSign, Package } from "lucide-react"

const stats = [
  {
    name: "Proveedores Activos",
    value: "12",
    description: "Registrados en sistema",
    icon: Users,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    name: "Compras del Mes",
    value: "$18,450",
    description: "Total invertido",
    icon: DollarSign,
    color: "text-green-600",
    bg: "bg-green-600/10",
  },
  {
    name: "Productos Suministrados",
    value: "248",
    description: "En catálogo",
    icon: Package,
    color: "text-blue-600",
    bg: "bg-blue-600/10",
  },
  {
    name: "Mejor Desempeño",
    value: "98%",
    description: "Entregas a tiempo",
    icon: TrendingUp,
    color: "text-orange-600",
    bg: "bg-orange-600/10",
  },
]

export function SuppliersStats() {
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
