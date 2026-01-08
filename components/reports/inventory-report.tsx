"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const inventoryData = [
  { category: "Rosas", stock: 145, maxStock: 200, percentage: 73 },
  { category: "Lirios", stock: 122, maxStock: 150, percentage: 81 },
  { category: "Tulipanes", stock: 68, maxStock: 120, percentage: 57 },
  { category: "Orquídeas", stock: 87, maxStock: 100, percentage: 87 },
  { category: "Girasoles", stock: 76, maxStock: 100, percentage: 76 },
  { category: "Claveles", stock: 45, maxStock: 80, percentage: 56 },
]

export function InventoryReport() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reporte de Inventario</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {inventoryData.map((item) => (
            <div key={item.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.category}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.stock} de {item.maxStock} unidades
                  </p>
                </div>
                <span className="text-sm font-semibold">{item.percentage}%</span>
              </div>
              <Progress value={item.percentage} className="h-2" />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
            <div className="text-center p-4 rounded-lg bg-primary/5">
              <p className="text-sm text-muted-foreground">Stock Total</p>
              <p className="text-2xl font-bold text-primary mt-1">543</p>
              <p className="text-xs text-muted-foreground mt-1">unidades</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-orange-600/5">
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">$38,420</p>
              <p className="text-xs text-muted-foreground mt-1">inventario</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
