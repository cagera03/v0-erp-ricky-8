"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, AlertCircle } from "lucide-react"
import type { MaterialPlanning } from "@/lib/types"

interface ProductionPlanningTabProps {
  materials: MaterialPlanning[]
  searchQuery: string
  onUpdate: (id: string, updates: Partial<MaterialPlanning>) => Promise<MaterialPlanning | null>
  onGenerateRequisitions?: () => void
}

export function ProductionPlanningTab({
  materials,
  searchQuery,
  onUpdate,
  onGenerateRequisitions,
}: ProductionPlanningTabProps) {
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => !searchQuery || m.material.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [materials, searchQuery])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Planeación de Materiales (MRP)</CardTitle>
          {onGenerateRequisitions && (
            <Button variant="outline" size="sm" onClick={onGenerateRequisitions}>
              <FileText className="w-4 h-4 mr-2" />
              Generar Requisiciones
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {filteredMaterials.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay materiales planificados</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Material</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Disponible</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Reservado</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Requerido</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Faltante</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Proveedor</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaterials.map((material) => {
                    const shortage = material.shortage || 0
                    const hasShortage = shortage > 0
                    return (
                      <tr key={material.id} className="border-b last:border-0">
                        <td className="py-3 px-2 text-sm font-medium">{material.material}</td>
                        <td className="py-3 px-2 text-sm">
                          {material.available} {material.unit}
                        </td>
                        <td className="py-3 px-2 text-sm text-orange-600">
                          {material.reserved || 0} {material.unit}
                        </td>
                        <td className="py-3 px-2 text-sm">
                          {material.required} {material.unit}
                        </td>
                        <td className="py-3 px-2">
                          {hasShortage ? (
                            <span className="text-sm font-medium text-red-600">
                              {shortage} {material.unit}
                            </span>
                          ) : (
                            <span className="text-sm text-green-600">Suficiente</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-sm text-muted-foreground">
                          {material.supplierName || "-"}
                          {material.leadTimeDays && <span className="text-xs ml-1">({material.leadTimeDays}d)</span>}
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant={material.status === "sufficient" ? "outline" : "secondary"}>
                            {material.status === "sufficient"
                              ? "OK"
                              : material.status === "critical"
                                ? "Crítico"
                                : "Pendiente"}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">
                  <strong>Nota:</strong> El sistema calcula automáticamente los requerimientos basándose en las órdenes
                  de producción activas. Los materiales reservados no están disponibles para otras órdenes. Use "Generar
                  Requisiciones" para crear solicitudes de compra basadas en los faltantes.
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
