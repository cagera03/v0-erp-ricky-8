"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, GripVertical, Heading2, FileText, AlertTriangle, CheckCircle2 } from "lucide-react"
import type { SalesOrderLine, Product, InventoryStock } from "@/lib/types"
import { calculateLineTotal, formatCurrency } from "@/lib/utils/sales-calculations"

interface SalesOrderLinesTabProps {
  lines: SalesOrderLine[]
  products: Product[]
  onChange: (lines: SalesOrderLine[]) => void
  readOnly?: boolean
  warehouseId?: string
  inventoryStock?: InventoryStock[]
}

export function SalesOrderLinesTab({
  lines,
  products,
  onChange,
  readOnly = false,
  warehouseId,
  inventoryStock = [],
}: SalesOrderLinesTabProps) {
  const addProductLine = () => {
    const newLine: SalesOrderLine = {
      id: `line-${Date.now()}`,
      type: "product",
      description: "",
      quantity: 1,
      unit: "PZA",
      unitPrice: 0,
      tax: 16,
      discount: 0,
      order: lines.length,
    }
    onChange([...lines, calculateLineTotal(newLine)])
  }

  const addSection = () => {
    const newLine: SalesOrderLine = {
      id: `section-${Date.now()}`,
      type: "section",
      description: "Nueva Sección",
      order: lines.length,
    }
    onChange([...lines, newLine])
  }

  const addNote = () => {
    const newLine: SalesOrderLine = {
      id: `note-${Date.now()}`,
      type: "note",
      description: "Nota...",
      order: lines.length,
    }
    onChange([...lines, newLine])
  }

  const updateLine = (index: number, updates: Partial<SalesOrderLine>) => {
    const updated = [...lines]
    updated[index] = { ...updated[index], ...updates }

    // Recalculate if it's a product line
    if (updated[index].type === "product") {
      updated[index] = calculateLineTotal(updated[index])
    }

    onChange(updated)
  }

  const removeLine = (index: number) => {
    const updated = lines.filter((_, i) => i !== index)
    onChange(updated)
  }

  const selectProduct = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (product) {
      updateLine(index, {
        productId: product.id,
        productName: product.name,
        description: product.description || product.name,
        unitPrice: product.price,
        unit: "PZA",
      })
    }
  }

  const getAvailableStock = (productId: string): number => {
    if (!warehouseId || !inventoryStock) return 0
    const stock = inventoryStock.find((s) => s.almacenId === warehouseId && s.productoId === productId)
    return stock?.cantidadDisponible || 0
  }

  if (readOnly && lines.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No hay líneas en esta orden</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!warehouseId && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <p className="text-sm text-amber-800">Selecciona un almacén para ver la disponibilidad de inventario</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={addProductLine} size="sm" disabled={readOnly}>
          <Plus className="w-4 h-4 mr-2" />
          Agregar Producto
        </Button>
        <Button onClick={addSection} size="sm" variant="outline" disabled={readOnly}>
          <Heading2 className="w-4 h-4 mr-2" />
          Agregar Sección
        </Button>
        <Button onClick={addNote} size="sm" variant="outline" disabled={readOnly}>
          <FileText className="w-4 h-4 mr-2" />
          Agregar Nota
        </Button>
      </div>

      {lines.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">Aún no hay productos en esta orden</p>
          <Button onClick={addProductLine} disabled={readOnly}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Primer Producto
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Producto / Descripción</TableHead>
                <TableHead className="w-24">Cantidad</TableHead>
                <TableHead className="w-24">Unidad</TableHead>
                {warehouseId && <TableHead className="w-32">Disponible</TableHead>}
                <TableHead className="w-32">Precio Unit.</TableHead>
                <TableHead className="w-24">IVA %</TableHead>
                <TableHead className="w-24">Desc. %</TableHead>
                <TableHead className="w-32 text-right">Importe</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((line, index) => {
                if (line.type === "section") {
                  return (
                    <TableRow key={line.id}>
                      <TableCell colSpan={warehouseId ? 10 : 9} className="bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Heading2 className="w-4 h-4 text-muted-foreground" />
                          <Input
                            value={line.description}
                            onChange={(e) => updateLine(index, { description: e.target.value })}
                            className="font-semibold border-0 bg-transparent"
                            disabled={readOnly}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {!readOnly && (
                          <Button size="sm" variant="ghost" onClick={() => removeLine(index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                }

                if (line.type === "note") {
                  return (
                    <TableRow key={line.id}>
                      <TableCell colSpan={warehouseId ? 10 : 9}>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <Input
                            value={line.description}
                            onChange={(e) => updateLine(index, { description: e.target.value })}
                            className="text-sm border-0"
                            placeholder="Escribe una nota..."
                            disabled={readOnly}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {!readOnly && (
                          <Button size="sm" variant="ghost" onClick={() => removeLine(index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                }

                const availableStock = line.productId ? getAvailableStock(line.productId) : 0
                const hasStock = availableStock >= (line.quantity || 0)
                const stockStatus = warehouseId ? (hasStock ? "ok" : "insufficient") : "unknown"

                return (
                  <TableRow key={line.id}>
                    <TableCell>
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Select
                          value={line.productId || ""}
                          onValueChange={(value) => selectProduct(index, value)}
                          disabled={readOnly}
                        >
                          <SelectTrigger className="text-xs">
                            <SelectValue placeholder="Seleccionar producto" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          value={line.description}
                          onChange={(e) => updateLine(index, { description: e.target.value })}
                          className="text-sm"
                          placeholder="Descripción"
                          disabled={readOnly}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={line.quantity || 0}
                        onChange={(e) => {
                          const val = e.target.value
                          updateLine(index, { quantity: val === "" ? 0 : Number.parseFloat(val) || 0 })
                        }}
                        className="text-right"
                        placeholder="0"
                        disabled={readOnly}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={line.unit || ""}
                        onChange={(e) => updateLine(index, { unit: e.target.value })}
                        placeholder="PZA"
                        disabled={readOnly}
                      />
                    </TableCell>
                    {warehouseId && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {stockStatus === "ok" && (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-700 font-medium">{availableStock}</span>
                            </>
                          )}
                          {stockStatus === "insufficient" && (
                            <>
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                              <span className="text-sm text-red-700 font-medium">{availableStock}</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <Input
                        value={line.unitPrice || 0}
                        onChange={(e) => {
                          const val = e.target.value
                          updateLine(index, { unitPrice: val === "" ? 0 : Number.parseFloat(val) || 0 })
                        }}
                        className="text-right"
                        placeholder="0.00"
                        disabled={readOnly}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={line.tax || 0}
                        onChange={(e) => {
                          const val = e.target.value
                          const num = val === "" ? 0 : Number.parseFloat(val) || 0
                          updateLine(index, { tax: Math.min(100, Math.max(0, num)) })
                        }}
                        className="text-right"
                        placeholder="16"
                        disabled={readOnly}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={line.discount || 0}
                        onChange={(e) => {
                          const val = e.target.value
                          const num = val === "" ? 0 : Number.parseFloat(val) || 0
                          updateLine(index, { discount: Math.min(100, Math.max(0, num)) })
                        }}
                        className="text-right"
                        placeholder="0"
                        disabled={readOnly}
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(line.total || 0)}</TableCell>
                    <TableCell>
                      {!readOnly && (
                        <Button size="sm" variant="ghost" onClick={() => removeLine(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
