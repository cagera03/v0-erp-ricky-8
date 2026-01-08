"use client"

import { useState, useMemo } from "react"
import { useAttributesData } from "@/hooks/use-attributes-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Package, Search, Settings, CheckCircle } from "lucide-react"

export function AssignmentTab() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const { products, attributes, assignments, createAssignment, updateAssignment, removeAssignment, generateVariants } =
    useAttributesData()

  const filteredProducts = useMemo(() => {
    return products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [products, searchTerm])

  const productAssignments = useMemo(() => {
    if (!selectedProduct) return []
    return assignments.filter((a) => a.productoId === selectedProduct)
  }, [assignments, selectedProduct])

  const handleAssignAttribute = async (productId: string, attributeId: string, values: string[]) => {
    const product = products.find((p) => p.id === productId)
    const attribute = attributes.find((a) => a.id === attributeId)
    if (!product || !attribute) return

    const existing = assignments.find((a) => a.productoId === productId && a.atributoId === attributeId)

    if (existing) {
      if (values.length === 0) {
        await removeAssignment(existing.id)
      } else {
        await updateAssignment(existing.id, {
          valoresSeleccionados: values,
        })
      }
    } else if (values.length > 0) {
      await createAssignment({
        productoId: productId,
        productoNombre: product.name,
        atributoId: attributeId,
        atributoNombre: attribute.nombre,
        atributoTipo: attribute.tipo,
        valoresSeleccionados: values,
        generarVariantes: true,
      })
    }
  }

  const handleGenerateVariants = async (productId: string) => {
    try {
      const variants = await generateVariants(productId)
      alert(`Se generaron ${variants.length} variantes exitosamente`)
    } catch (error) {
      alert("Error al generar variantes")
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Variantes Automáticas</p>
              <p className="text-sm text-blue-700 mt-1">
                El sistema genera automáticamente todas las combinaciones posibles de atributos para crear variantes de
                productos
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900">Control de Inventario</p>
              <p className="text-sm text-green-700 mt-1">
                Cada variante puede tener su propio inventario, precio y SKU independiente
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Productos</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredProducts.map((product) => {
                const assignedCount = assignments.filter((a) => a.productoId === product.id).length
                return (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product.id)}
                    className={`w-full p-3 border rounded-lg text-left hover:shadow-md transition-all ${
                      selectedProduct === product.id ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {assignedCount} atributo{assignedCount !== 1 ? "s" : ""} asignado
                          {assignedCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <Package className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atributos del Producto</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedProduct ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Selecciona un producto para asignar atributos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {attributes
                  .filter((attr) => attr.activo && attr.tipo === "seleccion")
                  .map((attr) => {
                    const assignment = productAssignments.find((a) => a.atributoId === attr.id)
                    const selectedValues = assignment?.valoresSeleccionados || []

                    return (
                      <div key={attr.id} className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-3">{attr.nombre}</h4>
                        <div className="space-y-2">
                          {attr.valores.map((value) => {
                            const isSelected = selectedValues.includes(value.valor)
                            return (
                              <div key={value.id} className="flex items-center gap-2">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={(checked) => {
                                    const newValues = checked
                                      ? [...selectedValues, value.valor]
                                      : selectedValues.filter((v) => v !== value.valor)
                                    handleAssignAttribute(selectedProduct, attr.id, newValues)
                                  }}
                                />
                                <label className="text-sm">{value.valor}</label>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}

                {productAssignments.length > 0 && (
                  <Button onClick={() => handleGenerateVariants(selectedProduct)} className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Generar Variantes
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
