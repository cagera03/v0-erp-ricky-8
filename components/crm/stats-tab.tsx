"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCRMData } from "@/hooks/use-crm-data"
import { BarChart3 } from "lucide-react"

export function StatsTab() {
  const { totalClientes, clientesActivos, porCobrar, documentosDelMes, loading } = useCRMData()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estadísticas</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando...</div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-6 border rounded-lg">
                <p className="text-sm text-muted-foreground">Total Clientes</p>
                <p className="text-3xl font-bold mt-2">{totalClientes}</p>
              </div>
              <div className="p-6 border rounded-lg">
                <p className="text-sm text-muted-foreground">Clientes Activos</p>
                <p className="text-3xl font-bold mt-2">{clientesActivos}</p>
              </div>
              <div className="p-6 border rounded-lg">
                <p className="text-sm text-muted-foreground">Por Cobrar</p>
                <p className="text-3xl font-bold mt-2">
                  ${porCobrar.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-6 border rounded-lg">
                <p className="text-sm text-muted-foreground">Documentos del Mes</p>
                <p className="text-3xl font-bold mt-2">{documentosDelMes}</p>
              </div>
            </div>

            <div className="text-center py-8">
              <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Próximamente: Gráficas y análisis detallado</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
