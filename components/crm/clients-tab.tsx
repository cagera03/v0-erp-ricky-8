"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Pencil, Trash2, Search, Mail, Phone, Users } from "lucide-react"
import { useCRMData } from "@/hooks/use-crm-data"
import { Badge } from "@/components/ui/badge"
import { ClientFormDialog } from "./client-form-dialog"
import type { Customer } from "@/lib/types"

export function ClientsTab() {
  const { customers, loading, removeCustomer } = useCRMData()
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Customer | null>(null)

  const filteredClients = customers.filter(
    (client) =>
      client.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.rfc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEdit = (client: Customer) => {
    setEditingClient(client)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este cliente?")) {
      await removeCustomer(id)
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingClient(null)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Catálogo de Clientes</CardTitle>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Cliente
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando...</div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "No se encontraron clientes" : "No hay clientes registrados"}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Primer Cliente
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Nombre</th>
                  <th className="text-left p-3 font-medium">RFC</th>
                  <th className="text-left p-3 font-medium">Contacto</th>
                  <th className="text-right p-3 font-medium">Límite Crédito</th>
                  <th className="text-right p-3 font-medium">Saldo</th>
                  <th className="text-center p-3 font-medium">Estado</th>
                  <th className="text-center p-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{client.nombre}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <p className="text-sm">{client.rfc || "-"}</p>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        {client.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            <span>{client.email}</span>
                          </div>
                        )}
                        {client.telefono && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            <span>{client.telefono}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <p className="font-medium">
                        ${(client.limiteCredito || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </p>
                    </td>
                    <td className="p-3 text-right">
                      <p className={`font-medium ${(client.saldo || 0) > 0 ? "text-orange-500" : ""}`}>
                        ${(client.saldo || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </p>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant={client.estado === "activo" ? "default" : "secondary"} className="capitalize">
                        {client.estado || "activo"}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(client)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(client.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <ClientFormDialog open={isDialogOpen} onOpenChange={handleDialogClose} client={editingClient} />
    </Card>
  )
}
