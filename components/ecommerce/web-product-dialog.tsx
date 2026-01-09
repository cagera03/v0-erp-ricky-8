"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

interface WebProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: any | null
  onSave: (product: any) => Promise<void>
}

export function WebProductDialog({ open, onOpenChange, product, onSave }: WebProductDialogProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    sku: "",
    precio: 0,
    stock: 0,
    publicado: true,
    disponible: true,
    destacado: false,
  })

  useEffect(() => {
    if (product) {
      setFormData({
        nombre: product.nombre || "",
        descripcion: product.descripcion || "",
        sku: product.sku || "",
        precio: Number(product.precio || 0),
        stock: Number(product.stock || 0),
        publicado: product.publicado ?? true,
        disponible: product.disponible ?? true,
        destacado: product.destacado ?? false,
      })
    } else {
      setFormData({
        nombre: "",
        descripcion: "",
        sku: "",
        precio: 0,
        stock: 0,
        publicado: true,
        disponible: true,
        destacado: false,
      })
    }
  }, [product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre.trim()) {
      alert("El nombre del producto es obligatorio")
      return
    }
    if (!formData.sku.trim()) {
      alert("El SKU es obligatorio")
      return
    }

    await onSave(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-6">
          <DialogTitle>{product ? "Editar Producto" : "Nuevo Producto Web"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="PRD-001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Producto *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Producto Premium A"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción detallada del producto..."
                rows={4}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="precio">Precio</Label>
                <Input
                  id="precio"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: Number(e.target.value || 0) })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock Disponible</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value || 0) })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="publicado">Publicado en el Catálogo</Label>
                  <p className="text-sm text-muted-foreground">El producto será visible para los clientes</p>
                </div>
                <Switch
                  id="publicado"
                  checked={formData.publicado}
                  onCheckedChange={(checked) => setFormData({ ...formData, publicado: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="disponible">Disponible para Venta</Label>
                  <p className="text-sm text-muted-foreground">Los clientes pueden agregar al carrito</p>
                </div>
                <Switch
                  id="disponible"
                  checked={formData.disponible}
                  onCheckedChange={(checked) => setFormData({ ...formData, disponible: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="destacado">Producto Destacado</Label>
                  <p className="text-sm text-muted-foreground">Aparecerá en la página principal</p>
                </div>
                <Switch
                  id="destacado"
                  checked={formData.destacado}
                  onCheckedChange={(checked) => setFormData({ ...formData, destacado: checked })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{product ? "Guardar Cambios" : "Crear Producto"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
