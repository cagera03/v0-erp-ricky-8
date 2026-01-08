"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCRMData } from "@/hooks/use-crm-data"
import { DollarSign } from "lucide-react"

export function CobranzaTab() {
  const { receivables, receivablesAging, porCobrar, loading } = useCRMData()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cobranza</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando...</div>
        ) : receivables.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay cuentas por cobrar</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-6 border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Total Por Cobrar</p>
              <p className="text-3xl font-bold mt-2">
                ${porCobrar.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Antigüedad de Saldos</h3>
              <div className="grid gap-2">
                <div className="flex items-center justify-between p-3 border rounded">
                  <span>Vigente (no vencido)</span>
                  <span className="font-medium">
                    ${receivablesAging.vigente.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <span>1-30 días</span>
                  <span className="font-medium text-yellow-600">
                    ${receivablesAging.vencido30.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <span>31-60 días</span>
                  <span className="font-medium text-orange-600">
                    ${receivablesAging.vencido60.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <span>61-90 días</span>
                  <span className="font-medium text-red-600">
                    ${receivablesAging.vencido90.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <span>Más de 90 días</span>
                  <span className="font-medium text-red-800">
                    ${receivablesAging.vencido90Plus.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Cuentas Pendientes</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Cliente</th>
                      <th className="text-left p-3 font-medium">Documento</th>
                      <th className="text-right p-3 font-medium">Saldo</th>
                      <th className="text-left p-3 font-medium">Vencimiento</th>
                      <th className="text-left p-3 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receivables
                      .filter((r) => r.estado !== "pagada")
                      .slice(0, 10)
                      .map((receivable) => (
                        <tr key={receivable.id} className="border-b hover:bg-muted/50">
                          <td className="p-3">{receivable.clienteNombre}</td>
                          <td className="p-3">{receivable.documentoFolio || "-"}</td>
                          <td className="p-3 text-right">
                            ${(receivable.saldo || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3">
                            {receivable.fechaVencimiento
                              ? new Date(receivable.fechaVencimiento as string).toLocaleDateString("es-MX")
                              : "-"}
                          </td>
                          <td className="p-3 capitalize">{receivable.estado}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
