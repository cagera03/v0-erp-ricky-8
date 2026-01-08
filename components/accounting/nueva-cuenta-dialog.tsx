"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { LedgerAccount } from "@/lib/types"

interface NuevaCuentaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (account: Omit<LedgerAccount, "id" | "companyId" | "createdAt" | "updatedAt">) => Promise<void>
}

export function NuevaCuentaDialog({ open, onOpenChange, onSave }: NuevaCuentaDialogProps) {
  const [loading, setLoading] = useState(false)
  const [codigo, setCodigo] = useState("")
  const [nombre, setNombre] = useState("")
  const [tipo, setTipo] = useState<"Activo" | "Pasivo" | "Capital" | "Ingresos" | "Egresos" | "Costos">("Activo")
  const [nivel, setNivel] = useState(1)
  const [naturaleza, setNaturaleza] = useState<"deudora" | "acreedora">("deudora")
  const [acumulaSaldo, setAcumulaSaldo] = useState(true)

  const handleSubmit = async () => {
    if (!codigo.trim() || !nombre.trim()) {
      alert("El código y nombre son requeridos")
      return
    }

    setLoading(true)
    try {
      await onSave({
        codigo: codigo.trim(),
        nombre: nombre.trim(),
        tipo,
        nivel,
        naturaleza,
        saldo: 0,
        acumulaSaldo,
        activa: true,
        movimientos: 0,
      })

      // Reset form
      setCodigo("")
      setNombre("")
      setTipo("Activo")
      setNivel(1)
      setNaturaleza("deudora")
      setAcumulaSaldo(true)
      onOpenChange(false)
    } catch (error) {
      console.error("Error creating account:", error)
      alert("Error al crear la cuenta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva Cuenta Contable</DialogTitle>
          <DialogDescription>Agrega una nueva cuenta al catálogo contable</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="codigo">Código</Label>
              <Input id="codigo" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="1000" />
            </div>
            <div>
              <Label htmlFor="nivel">Nivel</Label>
              <select
                id="nivel"
                value={nivel}
                onChange={(e) => setNivel(Number.parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value={1}>1 - Mayor</option>
                <option value={2}>2 - Submajor</option>
                <option value={3}>3 - Detalle</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre de la cuenta"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo">Tipo de Cuenta</Label>
              <select
                id="tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="Activo">Activo</option>
                <option value="Pasivo">Pasivo</option>
                <option value="Capital">Capital</option>
                <option value="Ingresos">Ingresos</option>
                <option value="Egresos">Egresos</option>
                <option value="Costos">Costos</option>
              </select>
            </div>
            <div>
              <Label htmlFor="naturaleza">Naturaleza</Label>
              <select
                id="naturaleza"
                value={naturaleza}
                onChange={(e) => setNaturaleza(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="deudora">Deudora</option>
                <option value="acreedora">Acreedora</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="acumulaSaldo"
              checked={acumulaSaldo}
              onChange={(e) => setAcumulaSaldo(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="acumulaSaldo" className="font-normal">
              Acumula saldo (desmarcar si es solo encabezado)
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cuenta"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
