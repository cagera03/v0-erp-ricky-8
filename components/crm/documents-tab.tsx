"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCRMData } from "@/hooks/use-crm-data"
import { FileText } from "lucide-react"

export function DocumentsTab() {
  const { documents, documentsByType, loading } = useCRMData()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentos</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando...</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay documentos registrados</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-5">
              {Object.entries(documentsByType).map(([type, count]) => (
                <div key={type} className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground capitalize">{type.replace("_", " ")}</p>
                  <p className="text-2xl font-bold mt-1">{count}</p>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Folio</th>
                    <th className="text-left p-3 font-medium">Cliente</th>
                    <th className="text-left p-3 font-medium">Tipo</th>
                    <th className="text-right p-3 font-medium">Monto</th>
                    <th className="text-left p-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.slice(0, 10).map((doc) => (
                    <tr key={doc.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">{doc.folio}</td>
                      <td className="p-3">{doc.clienteNombre}</td>
                      <td className="p-3 capitalize">{doc.tipo.replace("_", " ")}</td>
                      <td className="p-3 text-right">
                        ${(doc.monto || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 capitalize">{doc.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
