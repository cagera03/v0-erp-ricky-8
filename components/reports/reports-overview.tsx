import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, TrendingUp, Calendar } from "lucide-react"

const reportTypes = [
  {
    name: "Reporte de Ventas",
    description: "Análisis completo de ventas mensuales",
    icon: TrendingUp,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    name: "Reporte Financiero",
    description: "Estado de ingresos y gastos",
    icon: FileText,
    color: "text-green-600",
    bg: "bg-green-600/10",
  },
  {
    name: "Reporte de Inventario",
    description: "Estado actual del inventario",
    icon: Calendar,
    color: "text-blue-600",
    bg: "bg-blue-600/10",
  },
]

export function ReportsOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {reportTypes.map((report) => (
        <Card key={report.name}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className={`w-12 h-12 rounded-lg ${report.bg} flex items-center justify-center mb-4`}>
                  <report.icon className={`w-6 h-6 ${report.color}`} />
                </div>
                <h3 className="font-semibold mb-1">{report.name}</h3>
                <p className="text-sm text-muted-foreground">{report.description}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4 bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Descargar PDF
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
