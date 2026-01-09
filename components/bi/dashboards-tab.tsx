"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, MoreVertical, Edit, Trash2, Share2, Star } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import type { BIDashboard } from "@/lib/types"
import { DashboardDialog } from "./dashboard-dialog"

interface DashboardsTabProps {
  dashboards: BIDashboard[]
  loading: boolean
  onAddDashboard: (dashboard: Omit<BIDashboard, "id" | "createdAt" | "updatedAt">) => Promise<any>
  onUpdateDashboard: (id: string, updates: Partial<BIDashboard>) => Promise<void>
  onDeleteDashboard: (id: string) => Promise<void>
}

export function DashboardsTab({
  dashboards,
  loading,
  onAddDashboard,
  onUpdateDashboard,
  onDeleteDashboard,
}: DashboardsTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDashboard, setEditingDashboard] = useState<BIDashboard | null>(null)

  const handleAdd = () => {
    setEditingDashboard(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (dashboard: BIDashboard) => {
    setEditingDashboard(dashboard)
    setIsDialogOpen(true)
  }

  const handleSave = async (dashboardData: Omit<BIDashboard, "id" | "createdAt" | "updatedAt">) => {
    if (editingDashboard) {
      await onUpdateDashboard(editingDashboard.id, dashboardData)
    } else {
      await onAddDashboard(dashboardData)
    }
    setIsDialogOpen(false)
    setEditingDashboard(null)
  }

  if (loading) {
    return <div className="flex items-center justify-center py-12">Cargando tableros...</div>
  }

  if (dashboards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Plus className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="font-semibold">No hay tableros creados</h3>
          <p className="text-sm text-muted-foreground">Crea tu primer tablero para visualizar datos</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Crear Tablero
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{dashboards.length} tableros</p>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Tablero
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dashboards.map((dashboard) => (
          <div key={dashboard.id} className="border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{dashboard.nombre}</h4>
                  {dashboard.favorito && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                </div>
                {dashboard.descripcion && <p className="text-sm text-muted-foreground">{dashboard.descripcion}</p>}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(dashboard)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartir
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDeleteDashboard(dashboard.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">{dashboard.categoria}</Badge>
              <Badge variant="secondary">{dashboard.widgets.length} widgets</Badge>
              {dashboard.compartido && <Badge>Compartido</Badge>}
              {dashboard.predeterminado && <Badge variant="default">Predeterminado</Badge>}
            </div>

            <div className="text-xs text-muted-foreground">
              {dashboard.ultimaActualizacion
                ? `Actualizado: ${new Date(dashboard.ultimaActualizacion as string).toLocaleDateString()}`
                : "Sin actualizaciones"}
            </div>
          </div>
        ))}
      </div>

      <DashboardDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        dashboard={editingDashboard}
        onSave={handleSave}
      />
    </div>
  )
}
