"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, ArrowUpDown } from "lucide-react"
import { format } from "date-fns"

export function MovementsTab({ warehouseData }: { warehouseData: any }) {
  const { stockMovements, warehouses, products, createMovement } = warehouseData
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filterType, setFilterType] = useState("all")

  const [formData, setFormData] = useState({
    almacenId: "",
    productoId: "",
    tipo: "entrada" as "entrada" | "salida" | "ajuste",
    cantidad: 0,
    motivo: "",
    referencia: "",
    notas: "",
  })

  const filteredMovements = (stockMovements || []).filter((m: any) => {
    const matchesSearch =
      m.productoNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.almacenNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.referencia?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === "all" || m.tipo === filterType

    return matchesSearch && matchesType
  })

  const handleOpenDialog = () => {
    setFormData({
      almacenId: "",
      productoId: "",
      tipo: "entrada",
      cantidad: 0,
      motivo: "",
      referencia: "",
      notas: "",
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      const almacen = (warehouses || []).find((w: any) => w.id === formData.almacenId)
      const producto = (products || []).find((p: any) => p.id === formData.productoId)

      await createMovement({
        ...formData,
        almacenNombre: almacen?.nombre || "",
        productoNombre: producto?.name || "",
        fecha: new Date().toISOString(),
        usuarioId: "current-user",
        usuarioNombre: "Usuario Actual",
      })
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error creating movement:", error)
    }
  }

  const getTypeBadge = (type: string) => {
    const variants: any = {
      entrada: "default",
      salida: "secondary",
      ajuste: "outline",
    }
    return <Badge variant={variants[type] || "secondary"}>{type.charAt(0).toUpperCase() + type.slice(1)}</Badge>
  }

  const handleExport = () => {
    const csv = [
      ["Fecha", "Tipo", "Almacén", "Producto", "Cantidad", "Motivo", "Referencia"].join(","),
      ...filteredMovements.map((m: any) =>
        [
          m.fecha ? format(new Date(m.fecha), "dd/MM/yyyy HH:mm") : "",
          m.tipo,
          m.almacenNombre,
          m.productoNombre,
          m.cantidad,
          m.motivo || "",
          m.referencia || "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `movimientos-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Movimientos de Inventario</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Total de movimientos: {filteredMovements.length}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              Exportar CSV
            </Button>
            <Button onClick={handleOpenDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Registrar Movimiento
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar movimientos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="entrada">Entradas</SelectItem>
              <SelectItem value="salida">Salidas</SelectItem>
              <SelectItem value="ajuste">Ajustes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredMovements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ArrowUpDown className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay movimientos registrados</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Almacén</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Referencia</TableHead>
                <TableHead>Usuario</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovements.map((movement: any) => (
                <TableRow key={movement.id}>
                  <TableCell>{movement.fecha ? format(new Date(movement.fecha), "dd/MM/yyyy HH:mm") : "-"}</TableCell>
                  <TableCell>{getTypeBadge(movement.tipo)}</TableCell>
                  <TableCell>{movement.almacenNombre}</TableCell>
                  <TableCell>{movement.productoNombre}</TableCell>
                  <TableCell className="font-medium">
                    {movement.tipo === "salida" ? "-" : "+"}
                    {movement.cantidad}
                  </TableCell>
                  <TableCell>{movement.motivo || "-"}</TableCell>
                  <TableCell>{movement.referencia || "-"}</TableCell>
                  <TableCell>{movement.usuarioNombre || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Movimiento</DialogTitle>
            <DialogDescription>Registra una entrada, salida o ajuste de inventario</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Movimiento</Label>
              <Select value={formData.tipo} onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="salida">Salida</SelectItem>
                  <SelectItem value="ajuste">Ajuste</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Almacén</Label>
              <Select
                value={formData.almacenId}
                onValueChange={(value) => setFormData({ ...formData, almacenId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar almacén" />
                </SelectTrigger>
                <SelectContent>
                  {(warehouses || []).map((w: any) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Producto</Label>
              <Select
                value={formData.productoId}
                onValueChange={(value) => setFormData({ ...formData, productoId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>
                <SelectContent>
                  {(products || []).map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cantidad</Label>
              <Input
                type="number"
                value={formData.cantidad}
                onChange={(e) => setFormData({ ...formData, cantidad: Number(e.target.value) })}
                placeholder="10"
              />
            </div>
            <div className="space-y-2">
              <Label>Motivo</Label>
              <Input
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                placeholder="Compra, Venta, Corrección..."
              />
            </div>
            <div className="space-y-2">
              <Label>Referencia</Label>
              <Input
                value={formData.referencia}
                onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                placeholder="Número de orden, factura..."
              />
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Input
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                placeholder="Notas adicionales"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
