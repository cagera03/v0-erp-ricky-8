"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { InventoryTablePreferences } from "@/hooks/use-user-preferences"

interface ColumnConfigModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preferences: InventoryTablePreferences
  onSave: (preferences: InventoryTablePreferences) => Promise<void>
}

const COLUMN_LABELS: Record<keyof InventoryTablePreferences["visibleColumns"], string> = {
  sku: "SKU",
  name: "Producto",
  category: "Categoría",
  stock: "Stock Actual",
  minStock: "Stock Mínimo",
  price: "Precio",
  supplier: "Proveedor",
  avgDemand: "Demanda Promedio (30 días)",
  suggestedOrder: "Pedido Sugerido",
  status: "Estado",
}

export function ColumnConfigModal({ open, onOpenChange, preferences, onSave }: ColumnConfigModalProps) {
  const [localPreferences, setLocalPreferences] = useState(preferences)
  const [saving, setSaving] = useState(false)

  const handleToggle = (column: keyof InventoryTablePreferences["visibleColumns"]) => {
    setLocalPreferences({
      ...localPreferences,
      visibleColumns: {
        ...localPreferences.visibleColumns,
        [column]: !localPreferences.visibleColumns[column],
      },
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(localPreferences)
      onOpenChange(false)
    } catch (error) {
      console.error("[ColumnConfig] Error saving:", error)
      alert("Error al guardar la configuración")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    const defaultPrefs: InventoryTablePreferences = {
      visibleColumns: {
        sku: true,
        name: true,
        category: true,
        stock: true,
        minStock: true,
        price: true,
        supplier: false,
        avgDemand: true,
        suggestedOrder: true,
        status: true,
      },
    }
    setLocalPreferences(defaultPrefs)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar Columnas</DialogTitle>
          <DialogDescription>Selecciona las columnas que deseas mostrar en la tabla de inventario.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {Object.entries(COLUMN_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={key} className="text-sm font-medium cursor-pointer">
                {label}
              </Label>
              <Switch
                id={key}
                checked={localPreferences.visibleColumns[key as keyof InventoryTablePreferences["visibleColumns"]]}
                onCheckedChange={() => handleToggle(key as keyof InventoryTablePreferences["visibleColumns"])}
              />
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReset} disabled={saving}>
            Restablecer
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar Configuración"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
