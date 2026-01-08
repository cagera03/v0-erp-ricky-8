"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Sale {
  id: string
  date: string
  customer: string
  product: string
  quantity: number
  unitPrice: number
  total: number
  paymentMethod: string
}

const sales: Sale[] = [
  {
    id: "VTA-001",
    date: "2024-01-15 14:30",
    customer: "María González",
    product: "Ramo de Rosas Rojas",
    quantity: 2,
    unitPrice: 85,
    total: 170,
    paymentMethod: "Tarjeta",
  },
  {
    id: "VTA-002",
    date: "2024-01-15 15:45",
    customer: "Carlos Ramírez",
    product: "Arreglo de Lirios",
    quantity: 1,
    unitPrice: 120,
    total: 120,
    paymentMethod: "Efectivo",
  },
  {
    id: "VTA-003",
    date: "2024-01-15 16:20",
    customer: "Ana Martínez",
    product: "Centro de Mesa",
    quantity: 3,
    unitPrice: 95,
    total: 285,
    paymentMethod: "Tarjeta",
  },
  {
    id: "VTA-004",
    date: "2024-01-14 10:15",
    customer: "Luis Torres",
    product: "Bouquet de Tulipanes",
    quantity: 1,
    unitPrice: 65,
    total: 65,
    paymentMethod: "Transferencia",
  },
  {
    id: "VTA-005",
    date: "2024-01-14 12:30",
    customer: "Patricia Ruiz",
    product: "Orquídeas en Maceta",
    quantity: 2,
    unitPrice: 90,
    total: 180,
    paymentMethod: "Tarjeta",
  },
  {
    id: "VTA-006",
    date: "2024-01-14 14:50",
    customer: "Roberto Silva",
    product: "Ramo de Girasoles",
    quantity: 1,
    unitPrice: 75,
    total: 75,
    paymentMethod: "Efectivo",
  },
  {
    id: "VTA-007",
    date: "2024-01-13 11:20",
    customer: "Carmen López",
    product: "Arreglo Mixto",
    quantity: 1,
    unitPrice: 95,
    total: 95,
    paymentMethod: "Tarjeta",
  },
  {
    id: "VTA-008",
    date: "2024-01-13 16:40",
    customer: "Jorge Méndez",
    product: "Ramo de Claveles",
    quantity: 3,
    unitPrice: 45,
    total: 135,
    paymentMethod: "Efectivo",
  },
]

export function SalesTable() {
  const [search, setSearch] = useState("")
  const [paymentFilter, setPaymentFilter] = useState("all")

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.id.toLowerCase().includes(search.toLowerCase()) ||
      sale.customer.toLowerCase().includes(search.toLowerCase()) ||
      sale.product.toLowerCase().includes(search.toLowerCase())

    const matchesPayment = paymentFilter === "all" || sale.paymentMethod === paymentFilter

    return matchesSearch && matchesPayment
  })

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Historial de Ventas</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Total: <span className="font-semibold text-primary">${totalSales.toLocaleString()}</span>
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ventas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Método de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Efectivo">Efectivo</SelectItem>
                <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                <SelectItem value="Transferencia">Transferencia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">ID</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Fecha</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Cliente</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Producto</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Cant.</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">P. Unit.</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Total</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Método Pago</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="py-3 px-2 text-sm font-medium">{sale.id}</td>
                  <td className="py-3 px-2 text-sm text-muted-foreground">{sale.date}</td>
                  <td className="py-3 px-2 text-sm">{sale.customer}</td>
                  <td className="py-3 px-2 text-sm">{sale.product}</td>
                  <td className="py-3 px-2 text-sm text-center">{sale.quantity}</td>
                  <td className="py-3 px-2 text-sm">${sale.unitPrice.toFixed(2)}</td>
                  <td className="py-3 px-2 text-sm font-semibold text-primary">${sale.total.toFixed(2)}</td>
                  <td className="py-3 px-2 text-sm">{sale.paymentMethod}</td>
                  <td className="py-3 px-2">
                    <div className="flex items-center justify-end">
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
