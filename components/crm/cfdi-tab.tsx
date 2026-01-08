"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCRMData } from "@/hooks/use-crm-data"
import { FileText } from "lucide-react"

export function CFDITab() {
  const { cfdis, loading } = useCRMData()

  return (
    <Card>
      <CardHeader>
        <CardTitle>CFDI - Facturación Electrónica</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando...</div>
        ) : cfdis.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay CFDIs registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Folio</th>
                  <th className="text-left p-3 font-medium">UUID</th>
                  <th className="text-left p-3 font-medium">Cliente</th>
                  <th className="text-right p-3 font-medium">Total</th>
                  <th className="text-left p-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {cfdis.map((cfdi) => (
                  <tr key={cfdi.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">{cfdi.folio}</td>
                    <td className="p-3 font-mono text-xs">{cfdi.uuid || "-"}</td>
                    <td className="p-3">{cfdi.clienteNombre}</td>
                    <td className="p-3 text-right">
                      ${(cfdi.total || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 capitalize">{cfdi.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
