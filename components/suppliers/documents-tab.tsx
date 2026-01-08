"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSuppliersData } from "@/hooks/use-suppliers-data"

export function DocumentsTab() {
  const { documents, loading } = useSuppliersData()

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Cargando documentos...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentos de Proveedores</CardTitle>
      </CardHeader>
      <CardContent>
        {!documents || documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay documentos registrados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.proveedorNombre}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.tipo} - Folio: {doc.folio}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(doc.fecha as string).toLocaleDateString("es-MX")}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.monto && (
                        <p className="font-medium mr-4">
                          ${doc.monto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                        </p>
                      )}
                      <Badge variant={doc.estado === "activo" ? "default" : "secondary"}>{doc.estado}</Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {doc.archivoUrl && (
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
