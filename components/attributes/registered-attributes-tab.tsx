"use client"

import { useState, useMemo } from "react"
import { useAttributesData } from "@/hooks/use-attributes-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Tag, Download } from "lucide-react"

export function RegisteredAttributesTab() {
  const [searchTerm, setSearchTerm] = useState("")
  const { attributes, assignments, variants, products } = useAttributesData()

  const registeredData = useMemo(() => {
    return attributes
      .filter((attr) => attr.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
      .map((attr) => {
        const attrAssignments = assignments.filter((a) => a.atributoId === attr.id)
        const attrVariants = variants.filter((v) =>
          Object.keys(v.combinacionAtributos).some((key) => key === attr.nombre),
        )

        return {
          attribute: attr,
          assignmentCount: attrAssignments.length,
          variantCount: attrVariants.length,
          products: attrAssignments.map((a) => a.productoNombre),
        }
      })
  }, [attributes, assignments, variants, searchTerm])

  const handleExport = () => {
    const csvContent = [
      ["Atributo", "Tipo", "Valores", "Productos", "Variantes", "Estado"].join(","),
      ...registeredData.map((data) =>
        [
          data.attribute.nombre,
          data.attribute.tipo,
          data.attribute.valores.map((v) => v.valor).join(";"),
          data.assignmentCount,
          data.variantCount,
          data.attribute.activo ? "Activo" : "Inactivo",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `atributos-registrados-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Atributos Registrados</CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {registeredData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay atributos registrados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {registeredData.map((data) => (
              <div key={data.attribute.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{data.attribute.nombre}</h4>
                      <Badge variant={data.attribute.activo ? "default" : "secondary"}>
                        {data.attribute.activo ? "Activo" : "Inactivo"}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {data.attribute.tipo}
                      </Badge>
                    </div>
                    {data.attribute.descripcion && (
                      <p className="text-sm text-muted-foreground">{data.attribute.descripcion}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Valores</p>
                    <p className="font-medium">{data.attribute.valores.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Productos</p>
                    <p className="font-medium">{data.assignmentCount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Variantes</p>
                    <p className="font-medium">{data.variantCount}</p>
                  </div>
                </div>

                {data.products.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-1">Productos:</p>
                    <div className="flex flex-wrap gap-1">
                      {data.products.slice(0, 3).map((product, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {product}
                        </Badge>
                      ))}
                      {data.products.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{data.products.length - 3} más
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
