"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Package, Search } from "lucide-react"
import { WebProductDialog } from "./web-product-dialog"

interface WebCatalogTabProps {
  data: {
    products: any[]
    createProduct: (product: any) => Promise<any>
    updateProduct: (id: string, updates: any) => Promise<void>
    deleteProduct: (id: string) => Promise<void>
  }
}

export function WebCatalogTab({ data }: WebCatalogTabProps) {
  const { products, createProduct, updateProduct, deleteProduct } = data
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)

  const filteredProducts = products.filter(
    (p) =>
      (p.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku || "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSave = async (product: any) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, product)
    } else {
      await createProduct(product)
    }
    setIsDialogOpen(false)
    setEditingProduct(null)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Catálogo de Productos Web</CardTitle>
          <Button
            onClick={() => {
              setEditingProduct(null)
              setIsDialogOpen(true)
            }}
          >
            <Package className="w-4 h-4 mr-2" />
            Agregar Producto
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos en el catálogo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay productos en el catálogo</p>
            <p className="text-sm text-muted-foreground mt-2">Agrega productos para comenzar a vender en línea</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">SKU</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Producto</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Precio</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Stock</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Estado</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b last:border-0">
                    <td className="py-3 px-2 text-sm font-medium">{product.sku}</td>
                    <td className="py-3 px-2 text-sm font-medium">{product.nombre}</td>
                    <td className="py-3 px-2 text-sm font-medium">${Number(product.precio || 0).toLocaleString()}</td>
                    <td className="py-3 px-2 text-sm">{product.stock || 0} unidades</td>
                    <td className="py-3 px-2">
                      <Badge variant={product.publicado ? "default" : "secondary"}>
                        {product.publicado ? "Publicado" : "Borrador"}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingProduct(product)
                          setIsDialogOpen(true)
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          if (confirm(`¿Eliminar producto ${product.nombre}?`)) {
                            await deleteProduct(product.id)
                          }
                        }}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <WebProductDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        product={editingProduct}
        onSave={handleSave}
      />
    </Card>
  )
}
