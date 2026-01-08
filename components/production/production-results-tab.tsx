"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Download } from "lucide-react"
import type { ProductionResult } from "@/lib/types"

interface ProductionResultsTabProps {
  results: ProductionResult[]
  searchQuery: string
  onCreate: (result: Omit<ProductionResult, "id">) => Promise<ProductionResult>
}

export function ProductionResultsTab({ results, searchQuery, onCreate }: ProductionResultsTabProps) {
  const filteredResults = useMemo(() => {
    return results.filter(
      (r) =>
        !searchQuery ||
        r.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.productName.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [results, searchQuery])

  const stats = useMemo(() => {
    if (results.length === 0) {
      return {
        avgEfficiency: 0,
        totalProduced: 0,
        totalSecondQuality: 0,
        secondQualityPercent: 0,
      }
    }

    const totalProduced = results.reduce((sum, r) => sum + (r.producedQuantity || 0), 0)
    const totalSecondQuality = results.reduce((sum, r) => sum + (r.secondQualityQuantity || 0), 0)
    const avgEfficiency = results.reduce((sum, r) => sum + (r.efficiency || 0), 0) / results.length
    const secondQualityPercent = totalProduced > 0 ? (totalSecondQuality / totalProduced) * 100 : 0

    return {
      avgEfficiency: Math.round(avgEfficiency),
      totalProduced,
      totalSecondQuality,
      secondQualityPercent: secondQualityPercent.toFixed(1),
    }
  }, [results])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Resultados de Producción y Eficiencia</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => alert("Exportar reporte de producción")}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button size="sm" onClick={() => alert("Registrar nuevo resultado")}>
              <Plus className="w-4 h-4 mr-2" />
              Registrar Resultado
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredResults.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay resultados registrados</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto mb-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Orden</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Producto</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Planeado</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Producido</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">2da Calidad</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Eficiencia</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result) => (
                    <tr key={result.id} className="border-b last:border-0">
                      <td className="py-3 px-2 text-sm font-medium">{result.orderNumber}</td>
                      <td className="py-3 px-2 text-sm">{result.productName}</td>
                      <td className="py-3 px-2 text-sm">{result.plannedQuantity || 0}</td>
                      <td className="py-3 px-2 text-sm font-medium">{result.producedQuantity || 0}</td>
                      <td className="py-3 px-2 text-sm">{result.secondQualityQuantity || 0}</td>
                      <td className="py-3 px-2">
                        <Badge variant={(result.efficiency || 0) >= 100 ? "outline" : "secondary"}>
                          {result.efficiency || 0}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <p className="text-sm text-green-900 font-medium">Eficiencia Promedio</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{stats.avgEfficiency}%</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-900 font-medium">Total Producido</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalProduced} unidades</p>
              </div>
              <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <p className="text-sm text-yellow-900 font-medium">Segunda Calidad</p>
                <p className="text-2xl font-bold text-yellow-900 mt-1">
                  {stats.totalSecondQuality} ({stats.secondQualityPercent}%)
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
