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
import { Search, Plus, ClipboardCheck } from "lucide-react"
import { format } from "date-fns"

export function PhysicalCountTab({ warehouseData }: { warehouseData: any }) {
  const { physicalCounts, warehouses, createPhysicalCount, updatePhysicalCount } = warehouseData
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    almacenId: "",
    tipo: "ciclico" as "ciclico" | "anual" | "sorpresa",
    fechaConteo: new Date().toISOString().split("T")[0],
    notas: "",
  })

  const filteredCounts = (physicalCounts || []).filter(
    (c: any) =>
      c.almacenNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.folioConteo?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleOpenDialog = () => {
    setFormData({
      almacenId: "",
      tipo: "ciclico",
      fechaConteo: new Date().toISOString().split("T")[0],
      notas: "",
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      const almacen = (warehouses || []).find((w: any) => w.id === formData.almacenId)

      await createPhysicalCount({
        ...formData,
        almacenNombre: almacen?.nombre || "",
        folioConteo: `CNT-${Date.now()}`,
        estado: "en_progreso",
        iniciadoPor: "Usuario Actual",
        conteos: [],
      })
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error creating physical count:", error)
    }
  }

  const handleFinalize = async (countId: string) => {
    try {
      await updatePhysicalCount(countId, {
        estado: "finalizado",
        fechaFinalizacion: new Date().toISOString(),
        finalizadoPor: "Usuario Actual",
      })
    } catch (error) {
      console.error("Error finalizing count:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: any = {
      programado: "secondary",
      en_progreso: "default",
      finalizado: "default",
      cancelado: "destructive",
    }
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status === "en_progreso" ? "En Progreso" : status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Inventario Físico</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Conteos en Progreso: {warehouseData.conteosEnProgreso || 0}
            </p>
          </div>
          <Button onClick={handleOpenDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Conteo
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar conteos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredCounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ClipboardCheck className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay conteos físicos registrados</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Folio</TableHead>
                <TableHead>Almacén</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha Conteo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Iniciado Por</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCounts.map((count: any) => (
                <TableRow key={count.id}>
                  <TableCell className="font-medium">{count.folioConteo}</TableCell>
                  <TableCell>{count.almacenNombre}</TableCell>
                  <TableCell className="capitalize">{count.tipo}</TableCell>
                  <TableCell>{count.fechaConteo ? format(new Date(count.fechaConteo), "dd/MM/yyyy") : "-"}</TableCell>
                  <TableCell>{getStatusBadge(count.estado)}</TableCell>
                  <TableCell>{count.iniciadoPor || "-"}</TableCell>
                  <TableCell>
                    {count.estado === "en_progreso" && (
                      <Button size="sm" variant="outline" onClick={() => handleFinalize(count.id)}>
                        Finalizar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Conteo Físico</DialogTitle>
            <DialogDescription>Inicia un conteo físico de inventario</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
              <Label>Tipo de Conteo</Label>
              <Select value={formData.tipo} onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ciclico">Cíclico</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                  <SelectItem value="sorpresa">Sorpresa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha de Conteo</Label>
              <Input
                type="date"
                value={formData.fechaConteo}
                onChange={(e) => setFormData({ ...formData, fechaConteo: e.target.value })}
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
            <Button onClick={handleSave}>Iniciar Conteo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
