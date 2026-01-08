"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Settings } from "lucide-react"
import type { Equipment, Warehouse } from "@/lib/types"
import { Timestamp } from "firebase/firestore"

interface MaintenanceAssetsTabProps {
  equipment: Equipment[]
  warehouses: Warehouse[]
  searchQuery: string
  onCreate: (equipment: Omit<Equipment, "id">) => Promise<Equipment>
  onUpdate: (id: string, updates: Partial<Equipment>) => Promise<Equipment | null>
  onDelete: (id: string) => Promise<boolean>
}

export function MaintenanceAssetsTab({
  equipment,
  warehouses,
  searchQuery,
  onCreate,
  onUpdate,
  onDelete,
}: MaintenanceAssetsTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)

  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    categoria: "Maquinaria",
    planta: "",
    area: "",
    criticidad: "media",
    tipoLectura: "ninguno",
    lecturaActual: 0,
    unidadLectura: "hrs",
    almacenRefaccionesId: "",
    estado: "operativo",
  })

  const filteredEquipment = useMemo(() => {
    return equipment.filter(
      (eq) =>
        !searchQuery ||
        eq.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.planta.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [equipment, searchQuery])

  const handleCreate = () => {
    setSelectedEquipment(null)
    setFormData({
      codigo: "",
      nombre: "",
      categoria: "Maquinaria",
      planta: "",
      area: "",
      criticidad: "media",
      tipoLectura: "ninguno",
      lecturaActual: 0,
      unidadLectura: "hrs",
      almacenRefaccionesId: "",
      estado: "operativo",
    })
    setDialogOpen(true)
  }

  const handleEdit = (eq: Equipment) => {
    setSelectedEquipment(eq)
    setFormData({
      codigo: eq.codigo,
      nombre: eq.nombre,
      categoria: eq.categoria,
      planta: eq.planta,
      area: eq.area,
      criticidad: eq.criticidad,
      tipoLectura: eq.tipoLectura || "ninguno",
      lecturaActual: eq.lecturaActual,
      unidadLectura: eq.unidadLectura,
      almacenRefaccionesId: eq.almacenRefaccionesId || "",
      estado: eq.estado,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    const almacen = warehouses.find((w) => w.id === formData.almacenRefaccionesId)

    const equipmentData: Omit<Equipment, "id" | "companyId" | "createdAt" | "updatedAt"> = {
      codigo: formData.codigo,
      nombre: formData.nombre,
      categoria: formData.categoria,
      planta: formData.planta,
      area: formData.area,
      criticidad: formData.criticidad as "baja" | "media" | "alta" | "critica",
      tipoLectura: formData.tipoLectura as "horas" | "kilometros" | "ciclos" | "ninguno",
      lecturaActual: formData.lecturaActual,
      unidadLectura: formData.unidadLectura,
      estado: formData.estado as "operativo" | "mantenimiento" | "fuera_servicio" | "baja",
      almacenRefaccionesId: almacen?.id,
      almacenRefaccionesNombre: almacen?.nombre,
    }

    if (selectedEquipment) {
      await onUpdate(selectedEquipment.id!, equipmentData)
    } else {
      await onCreate(equipmentData)
    }

    setDialogOpen(false)
  }

  const getCriticalityVariant = (criticidad: string) => {
    switch (criticidad) {
      case "critica":
        return "destructive"
      case "alta":
        return "destructive"
      case "media":
        return "default"
      default:
        return "secondary"
    }
  }

  const getStatusVariant = (estado: string) => {
    switch (estado) {
      case "operativo":
        return "outline"
      case "mantenimiento":
        return "default"
      case "fuera_servicio":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const formatDate = (date: any) => {
    if (!date) return "-"
    const d = date instanceof Timestamp ? date.toDate() : new Date(date)
    return d.toLocaleDateString("es-MX")
  }

  if (filteredEquipment.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Settings className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No hay equipos registrados</p>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Equipo
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEquipment.map((eq) => (
          <Card key={eq.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{eq.nombre}</h3>
                  <p className="text-sm text-muted-foreground">{eq.codigo}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(eq)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onDelete(eq.id!)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 mb-3">
                <Badge variant={getCriticalityVariant(eq.criticidad)}>{eq.criticidad}</Badge>
                <Badge variant={getStatusVariant(eq.estado)}>{eq.estado}</Badge>
                <Badge variant="outline">{eq.categoria}</Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Planta:</span>
                  <span className="font-medium">{eq.planta}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Área:</span>
                  <span className="font-medium">{eq.area}</span>
                </div>
                {eq.tipoLectura && eq.tipoLectura !== "ninguno" && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lectura:</span>
                    <span className="font-medium">
                      {eq.lecturaActual} {eq.unidadLectura}
                    </span>
                  </div>
                )}
                {eq.proximoMantenimiento && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Próximo Mant.:</span>
                    <span className="font-medium">{formatDate(eq.proximoMantenimiento)}</span>
                  </div>
                )}
                {eq.almacenRefaccionesNombre && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Almacén:</span>
                    <span className="font-medium">{eq.almacenRefaccionesNombre}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEquipment ? "Editar Equipo" : "Nuevo Equipo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Código *</Label>
                <Input
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  placeholder="EQ-001"
                />
              </div>
              <div>
                <Label>Nombre *</Label>
                <Input
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Torno CNC"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Categoría *</Label>
                <Select value={formData.categoria} onValueChange={(v) => setFormData({ ...formData, categoria: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Maquinaria">Maquinaria</SelectItem>
                    <SelectItem value="Vehículo">Vehículo</SelectItem>
                    <SelectItem value="Herramienta">Herramienta</SelectItem>
                    <SelectItem value="Infraestructura">Infraestructura</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Criticidad *</Label>
                <Select value={formData.criticidad} onValueChange={(v) => setFormData({ ...formData, criticidad: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baja">Baja</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="critica">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Estado *</Label>
                <Select value={formData.estado} onValueChange={(v) => setFormData({ ...formData, estado: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operativo">Operativo</SelectItem>
                    <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                    <SelectItem value="fuera_servicio">Fuera de Servicio</SelectItem>
                    <SelectItem value="baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Planta *</Label>
                <Input
                  value={formData.planta}
                  onChange={(e) => setFormData({ ...formData, planta: e.target.value })}
                  placeholder="Planta Norte"
                />
              </div>
              <div>
                <Label>Área *</Label>
                <Input
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="Producción"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Tipo de Lectura</Label>
                <Select
                  value={formData.tipoLectura}
                  onValueChange={(v) => setFormData({ ...formData, tipoLectura: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ninguno">Ninguno</SelectItem>
                    <SelectItem value="horas">Horas</SelectItem>
                    <SelectItem value="kilometros">Kilómetros</SelectItem>
                    <SelectItem value="ciclos">Ciclos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Lectura Actual</Label>
                <Input
                  type="number"
                  value={formData.lecturaActual}
                  onChange={(e) => setFormData({ ...formData, lecturaActual: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Unidad</Label>
                <Input
                  value={formData.unidadLectura}
                  onChange={(e) => setFormData({ ...formData, unidadLectura: e.target.value })}
                  placeholder="hrs"
                />
              </div>
            </div>

            <div>
              <Label>Almacén de Refacciones</Label>
              <Select
                value={formData.almacenRefaccionesId}
                onValueChange={(v) => setFormData({ ...formData, almacenRefaccionesId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar almacén" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin almacén</SelectItem>
                  {warehouses.map((wh) => (
                    <SelectItem key={wh.id} value={wh.id!}>
                      {wh.codigo} - {wh.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Almacén donde se guardan las refacciones para este equipo
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.codigo || !formData.nombre || !formData.planta || !formData.area}
            >
              {selectedEquipment ? "Actualizar" : "Crear"} Equipo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
