"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Package, Users, DollarSign } from "lucide-react"
import type { ProductFormula } from "@/lib/types"

interface ProductionFormulasTabProps {
  formulas: ProductFormula[]
  searchQuery: string
  onCreate: (formula: Omit<ProductFormula, "id">) => Promise<ProductFormula>
  onUpdate: (id: string, updates: Partial<ProductFormula>) => Promise<ProductFormula | null>
}

export function ProductionFormulasTab({ formulas, searchQuery, onCreate, onUpdate }: ProductionFormulasTabProps) {
  const filteredFormulas = useMemo(() => {
    return formulas.filter((f) => !searchQuery || f.productName.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [formulas, searchQuery])

  const formatCurrency = (value: number | undefined | null): string => {
    return `$${(value || 0).toFixed(2)}`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Fórmulas Estándar de Productos</CardTitle>
          <Button onClick={() => alert("Crear nueva fórmula")}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Fórmula
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredFormulas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay fórmulas registradas</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredFormulas.map((formula) => (
              <div key={formula.id} className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">{formula.productName}</h3>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Costo Total</p>
                      <p className="text-xl font-bold">{formatCurrency(formula.totalCost)}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => alert(`Editar fórmula ${formula.productName}`)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-2">Componentes:</p>
                    <div className="space-y-2">
                      {formula.components.map((component, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 px-3 rounded bg-muted/50">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{component.materialName}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium">
                              {component.quantity} {component.unit}
                            </span>
                            <span className="text-xs text-muted-foreground ml-3">
                              {formatCurrency(component.costPerUnit)} c/u
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Mano de Obra</p>
                        <p className="text-sm font-medium">{formatCurrency(formula.laborCost)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Gastos de Fabricación</p>
                        <p className="text-sm font-medium">{formatCurrency(formula.manufacturingCost)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
