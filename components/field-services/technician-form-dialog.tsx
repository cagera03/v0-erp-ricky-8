"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FieldTechnician } from "@/lib/types"

interface TechnicianFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  technician?: FieldTechnician | null
  onSubmit: (data: Partial<FieldTechnician>) => Promise<void>
}

export default function TechnicianFormDialog({ open, onOpenChange, technician, onSubmit }: TechnicianFormDialogProps) {
  const [formData, setFormData] = useState<Partial<FieldTechnician>>({
    nombre: "",
    email: "",
    telefono: "",
    especialidades: [],
    zona: "",
    disponibilidad: "disponible",
    rating: 5,
    totalServicios: 0,
    serviciosCompletados: 0,
    unidad: "",
    placas: "",
    certificaciones: [],
    nivelExperiencia: "mid",
  })

  const [especialidadInput, setEspecialidadInput] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (technician) {
      setFormData(technician)
    } else {
      setFormData({
        nombre: "",
        email: "",
        telefono: "",
        especialidades: [],
        zona: "",
        disponibilidad: "disponible",
        rating: 5,
        totalServicios: 0,
        serviciosCompletados: 0,
        unidad: "",
        placas: "",
        certificaciones: [],
        nivelExperiencia: "mid",
      })
    }
  }, [technician, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit(formData)
      onOpenChange(false)
    } catch (error) {
      console.error("Error submitting technician:", error)
    } finally {
      setLoading(false)
    }
  }

  const addEspecialidad = () => {
    if (especialidadInput.trim()) {
      setFormData({
        ...formData,
        especialidades: [...(formData.especialidades || []), especialidadInput.trim()],
      })
      setEspecialidadInput("")
    }
  }

  const removeEspecialidad = (index: number) => {
    setFormData({
      ...formData,
      especialidades: (formData.especialidades || []).filter((_, i) => i !== index),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{technician ? "Editar Técnico" : "Nuevo Técnico"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zona">Zona de Trabajo</Label>
              <Input
                id="zona"
                value={formData.zona}
                onChange={(e) => setFormData({ ...formData, zona: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Especialidades</Label>
            <div className="flex gap-2">
              <Input
                value={especialidadInput}
                onChange={(e) => setEspecialidadInput(e.target.value)}
                placeholder="Agregar especialidad"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addEspecialidad()
                  }
                }}
              />
              <Button type="button" onClick={addEspecialidad}>
                Agregar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {(formData.especialidades || []).map((esp, index) => (
                <div key={index} className="px-3 py-1 bg-primary/10 rounded-full text-sm flex items-center gap-2">
                  {esp}
                  <button type="button" onClick={() => removeEspecialidad(index)} className="text-red-600">
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="disponibilidad">Disponibilidad</Label>
              <Select
                value={formData.disponibilidad}
                onValueChange={(value) => setFormData({ ...formData, disponibilidad: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponible">Disponible</SelectItem>
                  <SelectItem value="en_servicio">En Servicio</SelectItem>
                  <SelectItem value="no_disponible">No Disponible</SelectItem>
                  <SelectItem value="descanso">Descanso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nivelExperiencia">Nivel de Experiencia</Label>
              <Select
                value={formData.nivelExperiencia}
                onValueChange={(value) => setFormData({ ...formData, nivelExperiencia: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="mid">Mid-Level</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unidad">Unidad/Vehículo</Label>
              <Input
                id="unidad"
                value={formData.unidad}
                onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="placas">Placas</Label>
              <Input
                id="placas"
                value={formData.placas}
                onChange={(e) => setFormData({ ...formData, placas: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : technician ? "Actualizar" : "Crear Técnico"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
