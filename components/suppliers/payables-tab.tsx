"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, AlertCircle } from "lucide-react"
import { useSuppliersData } from "@/hooks/use-suppliers-data"

export function PayablesTab() {
  const { accountsPayable, loading, cuentasPorPagarVencimiento } = useSuppliersData()

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Cargando cuentas por pagar...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Aging Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Vencimientos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Vigente</p>
              <p className="text-xl font-bold text-green-600">
                ${cuentasPorPagarVencimiento.vigente.toLocaleString("es-MX", { minimumFractionDigits: 0 })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">1-30 días</p>
              <p className="text-xl font-bold text-yellow-600">
                ${cuentasPorPagarVencimiento.vencido30.toLocaleString("es-MX", { minimumFractionDigits: 0 })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">31-60 días</p>
              <p className="text-xl font-bold text-orange-600">
                ${cuentasPorPagarVencimiento.vencido60.toLocaleString("es-MX", { minimumFractionDigits: 0 })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">61-90 días</p>
              <p className="text-xl font-bold text-red-600">
                ${cuentasPorPagarVencimiento.vencido90.toLocaleString("es-MX", { minimumFractionDigits: 0 })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">+90 días</p>
              <p className="text-xl font-bold text-red-800">
                ${cuentasPorPagarVencimiento.vencido90Plus.toLocaleString("es-MX", { minimumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Payable List */}
      <Card>
        <CardHeader>
          <CardTitle>Cuentas por Pagar</CardTitle>
        </CardHeader>
        <CardContent>
          {!accountsPayable || accountsPayable.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay cuentas por pagar registradas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {accountsPayable.map((payable) => {
                const isOverdue =
                  payable.estado !== "pagada" && new Date(payable.fechaVencimiento as string) < new Date()

                return (
                  <Card key={payable.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{payable.proveedorNombre}</p>
                            {isOverdue && <AlertCircle className="w-4 h-4 text-red-600" />}
                          </div>
                          <p className="text-sm text-muted-foreground">Factura: {payable.facturaProveedor}</p>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span className="text-muted-foreground">
                              Vence: {new Date(payable.fechaVencimiento as string).toLocaleDateString("es-MX")}
                            </span>
                            <span className="text-muted-foreground">
                              Saldo:{" "}
                              <span className="font-medium">
                                {payable.moneda} ${payable.saldo.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <p className="text-xl font-bold">
                            {payable.moneda} $
                            {payable.montoOriginal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                          </p>
                          <Badge
                            variant={payable.estado === "pagada" ? "default" : isOverdue ? "destructive" : "secondary"}
                          >
                            {payable.estado === "pagada" ? "Pagada" : isOverdue ? "Vencida" : "Pendiente"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
