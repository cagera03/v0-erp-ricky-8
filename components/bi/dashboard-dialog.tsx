"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { BIDashboard } from "@/lib/types"

interface DashboardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dashboard: BIDashboard | null
  onSave: (dashboard: Omit<BIDashboard, "id" | "createdAt" | "updatedAt">) => void
}

export function DashboardDialog({ open, onOpenChange, dashboard, onSave }: DashboardDialogProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    categoria: "ejecutivo" as BIDashboard["categoria"],
    widgets: [] as BIDashboard["widgets"],
    layout: "grid" as BIDashboard["layout"],
    columnas: 3,
    autoRefresh: false,
    refreshInterval: 5,
    compartido: false,
    publico: false,
    favorito: false,
    predeterminado: false,
    creadoPor: "",
  })

  useEffect(() => {
    if (dashboard) {
      setFormData({
        nombre: dashboard.nombre || "",
        descripcion: dashboard.descripcion || "",
        categoria: dashboard.categoria || "ejecutivo",
        widgets: dashboard.widgets || [],
        layout: dashboard.layout || "grid",
        columnas: dashboard.columnas || 3,
        autoRefresh: dashboard.autoRefresh || false,
        refreshInterval: dashboard.refreshInterval || 5,
        compartido: dashboard.compartido || false,
        publico: dashboard.publico || false,
        favorito: dashboard.favorito || false,
        predeterminado: dashboard.predeterminado || false,
        creadoPor: dashboard.creadoPor || "",
      })
    } else {
      setFormData({
        nombre: "",
        descripcion: "",
        categoria: "ejecutivo",
        widgets: [],
        layout: "grid",
        columnas: 3,
        autoRefresh: false,
        refreshInterval: 5,
        compartido: false,
        publico: false,
        favorito: false,
        predeterminado: false,
        creadoPor: "",
      })
    }
  }, [dashboard, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const dashboardData: Omit<BIDashboard, "id" | "createdAt" | "updatedAt"> = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim(),
      categoria: formData.categoria,
      widgets: formData.widgets,
      layout: formData.layout,
      columnas: Number(formData.columnas || 3),
      autoRefresh: formData.autoRefresh,
      refreshInterval: formData.autoRefresh ? Number(formData.refreshInterval || 5) : undefined,
      ultimaActualizacion: null,
      creadoPor: formData.creadoPor,
      compartido: formData.compartido,
      publico: formData.publico,
      favorito: formData.favorito,
      predeterminado: formData.predeterminado,
      userId: "",
      status: "active",
    }

    onSave(dashboardData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-6">
          <DialogTitle>{dashboard ? "Editar Tablero" : "Nuevo Tablero"}</DialogTitle>
          <DialogDescription>Configura tu tablero personalizado con widgets de datos en tiempo real</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Tablero *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Tablero Ejecutivo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción del tablero"
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value: any) => setFormData({ ...formData, categoria: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ejecutivo">Ejecutivo</SelectItem>
                    <SelectItem value="ventas">Ventas</SelectItem>
                    <SelectItem value="operaciones">Operaciones</SelectItem>
                    <SelectItem value="financiero">Financiero</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="columnas">Columnas</Label>
                <Input
                  id="columnas"
                  type="number"
                  min="1"
                  max="6"
                  value={formData.columnas}
                  onChange={(e) => setFormData({ ...formData, columnas: Number(e.target.value || 3) })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoRefresh">Actualización Automática</Label>
                  <p className="text-xs text-muted-foreground">Refrescar datos periódicamente</p>
                </div>
                <Switch
                  id="autoRefresh"
                  checked={formData.autoRefresh}
                  onCheckedChange={(checked) => setFormData({ ...formData, autoRefresh: checked })}
                />
              </div>

              {formData.autoRefresh && (
                <div className="space-y-2">
                  <Label htmlFor="refreshInterval">Intervalo (minutos)</Label>
                  <Input
                    id="refreshInterval"
                    type="number"
                    min="1"
                    max="60"
                    value={formData.refreshInterval}
                    onChange={(e) => setFormData({ ...formData, refreshInterval: Number(e.target.value || 5) })}
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="compartido">Compartir</Label>
                  <p className="text-xs text-muted-foreground">Permitir acceso a otros usuarios</p>
                </div>
                <Switch
                  id="compartido"
                  checked={formData.compartido}
                  onCheckedChange={(checked) => setFormData({ ...formData, compartido: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="predeterminado">Predeterminado</Label>
                  <p className="text-xs text-muted-foreground">Mostrar al abrir BI</p>
                </div>
                <Switch
                  id="predeterminado"
                  checked={formData.predeterminado}
                  onCheckedChange={(checked) => setFormData({ ...formData, predeterminado: checked })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Tablero</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
