"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Edit, Download } from "lucide-react"
import type { QualityCertificate } from "@/lib/types"

interface ProductionQualityTabProps {
  certificates: QualityCertificate[]
  searchQuery: string
  onCreate: (cert: Omit<QualityCertificate, "id">) => Promise<QualityCertificate>
  onUpdate: (id: string, updates: Partial<QualityCertificate>) => Promise<QualityCertificate | null>
}

export function ProductionQualityTab({ certificates, searchQuery, onCreate, onUpdate }: ProductionQualityTabProps) {
  const filteredCerts = useMemo(() => {
    return certificates.filter(
      (c) =>
        !searchQuery ||
        c.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [certificates, searchQuery])

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "outline"
      case "review":
        return "secondary"
      case "rejected":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "Aprobado"
      case "review":
        return "Revisión"
      case "rejected":
        return "Rechazado"
      default:
        return status
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Certificados de Calidad por Lote</CardTitle>
          <Button onClick={() => alert("Crear nuevo certificado de calidad")}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Inspección
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredCerts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay certificados de calidad</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCerts.map((cert) => (
              <div key={cert.id} className="p-4 rounded-lg border">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{cert.productName}</h3>
                      <Badge variant={getStatusVariant(cert.status)}>{getStatusLabel(cert.status)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Lote: {cert.batchNumber} • Inspector: {cert.inspector}
                    </p>
                    {cert.notes && <p className="text-sm text-muted-foreground mt-2">{cert.notes}</p>}
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Calificación</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">{cert.rating}</span>
                        <span className="text-sm text-muted-foreground">/100</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alert(`Editar certificado ${cert.batchNumber}`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alert(`Exportar certificado ${cert.batchNumber}`)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Progress value={cert.rating} className="h-2 mt-3" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
