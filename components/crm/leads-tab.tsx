"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCRMData } from "@/hooks/use-crm-data"
import { Users } from "lucide-react"

export function LeadsTab() {
  const { leads, leadsByStage, valorEstimadoPipeline, loading } = useCRMData()

  return (
    <Card>
      <CardHeader>
        <CardTitle>CRM / Prospectos</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando...</div>
        ) : leads.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay prospectos registrados</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Total Prospectos</p>
                <p className="text-2xl font-bold mt-1">{leads.length}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Valor Estimado Pipeline</p>
                <p className="text-2xl font-bold mt-1">
                  ${valorEstimadoPipeline.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">En Negociación</p>
                <p className="text-2xl font-bold mt-1">{leadsByStage.negociacion}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Pipeline por Etapa</h3>
              <div className="grid gap-2">
                {Object.entries(leadsByStage).map(([stage, count]) => (
                  <div key={stage} className="flex items-center justify-between p-3 border rounded">
                    <span className="capitalize">{stage}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
