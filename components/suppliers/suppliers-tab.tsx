"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Edit, Trash2, Mail, Phone, Building2, Star } from "lucide-react"
import { useSuppliersData } from "@/hooks/use-suppliers-data"
import type { Supplier } from "@/lib/types"
import { SupplierFormDialog } from "./supplier-form-dialog"

export function SuppliersTab() {
  const { suppliers, loading, removeSupplier } = useSuppliersData()
  const [search, setSearch] = useState("")
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [showDialog, setShowDialog] = useState(false)

  const filteredSuppliers = (suppliers || []).filter(
    (supplier) =>
      supplier.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      supplier.razonSocial?.toLowerCase().includes(search.toLowerCase()) ||
      supplier.rfc?.toLowerCase().includes(search.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(search.toLowerCase()),
  )

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setShowDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este proveedor?")) {
      try {
        await removeSupplier(id)
      } catch (error) {
        console.error("[v0] Error deleting supplier:", error)
        alert("Error al eliminar el proveedor")
      }
    }
  }

  const handleDialogClose = () => {
    setShowDialog(false)
    setEditingSupplier(null)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Cargando proveedores...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Catálogo de Proveedores</CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar proveedores..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {search ? "No se encontraron proveedores" : "No hay proveedores registrados"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSuppliers.map((supplier) => (
                <Card key={supplier.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold">{supplier.nombre}</h3>
                              <Badge variant={supplier.estadoProveedor === "activo" ? "default" : "secondary"}>
                                {supplier.estadoProveedor === "activo" ? "Activo" : "Inactivo"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{supplier.razonSocial}</p>
                            {supplier.rfc && <p className="text-xs text-muted-foreground">RFC: {supplier.rfc}</p>}
                          </div>
                          <div className="flex items-center gap-0.5">
                            <span className="text-sm font-medium">{supplier.rating?.toFixed(1) || "0.0"}</span>
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                          {supplier.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <span className="truncate">{supplier.email}</span>
                            </div>
                          )}
                          {supplier.telefono && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span>{supplier.telefono}</span>
                            </div>
                          )}
                          {supplier.contactoPrincipal && (
                            <div className="flex items-center gap-2 text-sm">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              <span>Contacto: {supplier.contactoPrincipal}</span>
                            </div>
                          )}
                          {(supplier.diasCredito || 0) > 0 && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Crédito:</span> {supplier.diasCredito} días
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Compras Totales:</span>{" "}
                            <span className="font-medium">
                              ${(supplier.comprasTotales || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Por Pagar:</span>{" "}
                            <span className="font-medium">
                              ${(supplier.saldoPorPagar || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex lg:flex-col gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(supplier)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(supplier.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <SupplierFormDialog open={showDialog} onOpenChange={handleDialogClose} supplier={editingSupplier} />
    </>
  )
}
