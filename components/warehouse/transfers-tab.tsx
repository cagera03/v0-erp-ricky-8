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
import { Search, Plus, ArrowRightLeft } from "lucide-react"
import { format } from "date-fns"

export function TransfersTab({ warehouseData }: { warehouseData: any }) {
  const { transfers, warehouses, products, createTransfer, updateTransfer } = warehouseData
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    almacenOrigenId: "",
    almacenDestinoId: "",
    productoId: "",
    cantidad: 0,
    motivo: "",
    notas: "",
  })

  const filteredTransfers = (transfers || []).filter(
    (t: any) =>
      t.almacenOrigenNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.almacenDestinoNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.folioTransferencia?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleOpenDialog = () => {
    setFormData({
      almacenOrigenId: "",
      almacenDestinoId: "",
      productoId: "",
      cantidad: 0,
      motivo: "",
      notas: "",
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      const origenWarehouse = (warehouses || []).find((w: any) => w.id === formData.almacenOrigenId)
      const destinoWarehouse = (warehouses || []).find((w: any) => w.id === formData.almacenDestinoId)
      const producto = (products || []).find((p: any) => p.id === formData.productoId)

      await createTransfer({
        ...formData,
        almacenOrigenNombre: origenWarehouse?.nombre || "",
        almacenDestinoNombre: destinoWarehouse?.nombre || "",
        productoNombre: producto?.name || "",
        estado: "solicitada",
        folioTransferencia: `TRF-${Date.now()}`,
        fechaSolicitud: new Date().toISOString(),
        solicitadoPor: "Usuario Actual",
      })
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error creating transfer:", error)
    }
  }

  const handleStatusChange = async (transferId: string, newStatus: string) => {
    try {
      const updateData: any = { estado: newStatus }
      if (newStatus === "aprobada") {
        updateData.fechaAprobacion = new Date().toISOString()
        updateData.aprobadoPor = "Usuario Actual"
      } else if (newStatus === "en_transito") {
        updateData.fechaEnvio = new Date().toISOString()
        updateData.enviadoPor = "Usuario Actual"
      } else if (newStatus === "completada") {
        updateData.fechaRecepcion = new Date().toISOString()
        updateData.recibidoPor = "Usuario Actual"
      }
      await updateTransfer(transferId, updateData)
    } catch (error) {
      console.error("Error updating transfer:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: any = {
      solicitada: "secondary",
      aprobada: "default",
      en_transito: "default",
      completada: "default",
      cancelada: "destructive",
    }
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status === "en_transito" ? "En Tránsito" : status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transferencias entre Almacenes</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Pendientes: {warehouseData.transferenciasPendientes || 0} | En Tránsito:{" "}
              {warehouseData.transferenciasEnTransito || 0}
            </p>
          </div>
          <Button onClick={handleOpenDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Transferencia
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar transferencias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTransfers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ArrowRightLeft className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay transferencias registradas</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Folio</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Fecha Solicitud</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransfers.map((transfer: any) => (
                <TableRow key={transfer.id}>
                  <TableCell className="font-medium">{transfer.folioTransferencia}</TableCell>
                  <TableCell>{transfer.almacenOrigenNombre}</TableCell>
                  <TableCell>{transfer.almacenDestinoNombre}</TableCell>
                  <TableCell>{transfer.productoNombre}</TableCell>
                  <TableCell>{transfer.cantidad}</TableCell>
                  <TableCell>
                    {transfer.fechaSolicitud ? format(new Date(transfer.fechaSolicitud), "dd/MM/yyyy") : "-"}
                  </TableCell>
                  <TableCell>{getStatusBadge(transfer.estado)}</TableCell>
                  <TableCell>
                    {transfer.estado === "solicitada" && (
                      <Button size="sm" variant="outline" onClick={() => handleStatusChange(transfer.id, "aprobada")}>
                        Aprobar
                      </Button>
                    )}
                    {transfer.estado === "aprobada" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(transfer.id, "en_transito")}
                      >
                        Enviar
                      </Button>
                    )}
                    {transfer.estado === "en_transito" && (
                      <Button size="sm" variant="outline" onClick={() => handleStatusChange(transfer.id, "completada")}>
                        Recibir
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
            <DialogTitle>Nueva Transferencia</DialogTitle>
            <DialogDescription>Solicita una transferencia entre almacenes</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Almacén Origen</Label>
              <Select
                value={formData.almacenOrigenId}
                onValueChange={(value) => setFormData({ ...formData, almacenOrigenId: value })}
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
              <Label>Almacén Destino</Label>
              <Select
                value={formData.almacenDestinoId}
                onValueChange={(value) => setFormData({ ...formData, almacenDestinoId: value })}
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
                placeholder="Reabastecimiento"
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
            <Button onClick={handleSave}>Crear Transferencia</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
