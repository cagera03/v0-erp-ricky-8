"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Eye, Edit, Trash2, Search, Phone, Mail, MapPin, Users } from "lucide-react"

interface Supplier {
  id: string
  name: string
  contact: string
  email: string
  phone: string
  address: string
  productsSupplied: number
  totalPurchases: number
  rating: number
  status: "active" | "inactive"
}

const suppliers: Supplier[] = [
  {
    id: "SUP-001",
    name: "Flores del Valle",
    contact: "Juan Pérez",
    email: "contacto@floresvalle.com",
    phone: "+52 55 1234-5678",
    address: "Av. Insurgentes 123, CDMX",
    productsSupplied: 85,
    totalPurchases: 8500,
    rating: 4.8,
    status: "active",
  },
  {
    id: "SUP-002",
    name: "Jardín Botánico",
    contact: "María López",
    email: "ventas@jardinbotanico.com",
    phone: "+52 55 2345-6789",
    address: "Calle Reforma 456, CDMX",
    productsSupplied: 62,
    totalPurchases: 6200,
    rating: 4.5,
    status: "active",
  },
  {
    id: "SUP-003",
    name: "Vivero Central",
    contact: "Carlos Ramírez",
    email: "info@viverocentral.com",
    phone: "+52 55 3456-7890",
    address: "Blvd. Manuel Ávila Camacho 789, Estado de México",
    productsSupplied: 48,
    totalPurchases: 4800,
    rating: 4.2,
    status: "active",
  },
  {
    id: "SUP-004",
    name: "Floresta Nacional",
    contact: "Ana Martínez",
    email: "contacto@forestanal.com",
    phone: "+52 55 4567-8901",
    address: "Av. Universidad 321, CDMX",
    productsSupplied: 35,
    totalPurchases: 3200,
    rating: 4.6,
    status: "active",
  },
  {
    id: "SUP-005",
    name: "Plantas Premium",
    contact: "Roberto Silva",
    email: "ventas@plantaspremium.com",
    phone: "+52 55 5678-9012",
    address: "Calle Juárez 654, CDMX",
    productsSupplied: 28,
    totalPurchases: 2800,
    rating: 3.9,
    status: "active",
  },
  {
    id: "SUP-006",
    name: "Flores Express",
    contact: "Patricia Ruiz",
    email: "info@floresexpress.com",
    phone: "+52 55 6789-0123",
    address: "Av. Revolución 987, CDMX",
    productsSupplied: 42,
    totalPurchases: 3950,
    rating: 4.4,
    status: "inactive",
  },
]

export function SuppliersTable() {
  const [search, setSearch] = useState("")

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(search.toLowerCase()) ||
      supplier.contact.toLowerCase().includes(search.toLowerCase()) ||
      supplier.email.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>Lista de Proveedores</CardTitle>
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
        <div className="space-y-4">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{supplier.name}</h3>
                          <Badge variant={supplier.status === "active" ? "outline" : "secondary"}>
                            {supplier.status === "active" ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">ID: {supplier.id}</p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <span className="text-sm font-medium">{supplier.rating}</span>
                        <span className="text-yellow-500 text-lg">★</span>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Contacto:</span>
                        <span className="font-medium">{supplier.contact}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{supplier.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Teléfono:</span>
                        <span className="font-medium">{supplier.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Dirección:</span>
                        <span className="font-medium truncate">{supplier.address}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{supplier.productsSupplied}</p>
                        <p className="text-xs text-muted-foreground">Productos</p>
                      </div>
                      <div className="h-10 w-px bg-border" />
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">${supplier.totalPurchases.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Compras Totales</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex lg:flex-col items-center gap-2">
                    <Button variant="outline" size="sm" className="w-full lg:w-auto bg-transparent">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalles
                    </Button>
                    <Button variant="outline" size="sm" className="w-full lg:w-auto bg-transparent">
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="w-full lg:w-auto bg-transparent">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
