"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Send, Download } from "lucide-react"
import { useBankingData } from "@/hooks/use-banking-data"
import type { BankTransfer } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Timestamp } from "firebase/firestore"
import * as XLSX from "xlsx"
import { useToast } from "@/hooks/use-toast"

export function TransfersTab() {
  const { transfers, accounts, loading, createTransfer, updateAccount, createTransaction } = useBankingData()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    tipo: "spei" as "interna" | "spei" | "externa",
    cuentaOrigenId: "",
    cuentaDestinoId: "",
    beneficiario: "",
    clabe: "",
    monto: "",
    moneda: "MXN" as "MXN" | "USD",
    fechaProgramada: "",
    referencia: "",
    concepto: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTransfers, setSelectedTransfers] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!formData.cuentaOrigenId || !formData.beneficiario || !formData.monto || !formData.concepto) {
        toast({
          title: "Error de validación",
          description: "Por favor completa todos los campos requeridos",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const monto = Number.parseFloat(formData.monto) || 0

      if (monto <= 0) {
        toast({
          title: "Error de validación",
          description: "El monto debe ser mayor a cero",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const sourceAccount = accounts.find((a) => a.id === formData.cuentaOrigenId)
      if (!sourceAccount) {
        throw new Error("Cuenta de origen no encontrada")
      }

      if (sourceAccount.saldoActual < monto) {
        toast({
          title: "Advertencia: Saldo insuficiente",
          description: `La cuenta tiene $${sourceAccount.saldoActual.toFixed(2)}. La transferencia se registrará como "programada".`,
          variant: "default",
        })
      }

      if (formData.tipo === "interna") {
        if (!formData.cuentaDestinoId) {
          toast({
            title: "Error de validación",
            description: "Debes seleccionar una cuenta destino para transferencias internas",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }

        if (formData.cuentaOrigenId === formData.cuentaDestinoId) {
          toast({
            title: "Error de validación",
            description: "Las cuentas origen y destino deben ser diferentes",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }
      }

      const transferData: Omit<BankTransfer, "id"> = {
        tipo: formData.tipo,
        cuentaOrigenId: formData.cuentaOrigenId,
        cuentaDestinoId: formData.cuentaDestinoId || null,
        beneficiario: formData.beneficiario,
        clabe: formData.clabe || "",
        monto,
        moneda: formData.moneda,
        fechaProgramada: formData.fechaProgramada,
        referencia: formData.referencia || "",
        concepto: formData.concepto,
        estado: "programada",
        layoutGenerado: false,
      }

      await createTransfer(transferData)

      await updateAccount(sourceAccount.id, {
        saldoActual: sourceAccount.saldoActual - monto,
      })

      await createTransaction({
        cuentaId: sourceAccount.id,
        tipo: "egreso",
        monto: -monto,
        fecha: formData.fechaProgramada,
        concepto: `Transferencia a ${formData.beneficiario} - ${formData.concepto}`,
        referencia: formData.referencia || "",
        categoria: "transferencia",
      })

      if (formData.tipo === "interna" && formData.cuentaDestinoId) {
        const destAccount = accounts.find((a) => a.id === formData.cuentaDestinoId)
        if (destAccount) {
          await updateAccount(destAccount.id, {
            saldoActual: destAccount.saldoActual + monto,
          })

          await createTransaction({
            cuentaId: destAccount.id,
            tipo: "ingreso",
            monto,
            fecha: formData.fechaProgramada,
            concepto: `Transferencia desde ${sourceAccount.alias || sourceAccount.banco} - ${formData.concepto}`,
            referencia: formData.referencia || "",
            categoria: "transferencia",
          })
        }
      }

      toast({
        title: "Transferencia creada",
        description: `Transferencia por $${monto.toFixed(2)} creada exitosamente`,
      })

      setFormData({
        tipo: "spei",
        cuentaOrigenId: "",
        cuentaDestinoId: "",
        beneficiario: "",
        clabe: "",
        monto: "",
        moneda: "MXN",
        fechaProgramada: "",
        referencia: "",
        concepto: "",
      })
      setDialogOpen(false)
    } catch (error) {
      console.error("Error creating transfer:", error)
      toast({
        title: "Error al crear transferencia",
        description: error instanceof Error ? error.message : "No se pudo crear la transferencia",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExportLayout = () => {
    const transfersToExport = transfers.filter((t) => selectedTransfers.has(t.id))

    if (transfersToExport.length === 0) {
      alert("Selecciona al menos una transferencia para exportar")
      return
    }

    const data = transfersToExport.map((t) => {
      const account = accounts.find((a) => a.id === t.cuentaOrigenId)
      return {
        Fecha:
          t.fechaProgramada instanceof Timestamp
            ? t.fechaProgramada.toDate().toLocaleDateString("es-MX")
            : new Date(t.fechaProgramada as string).toLocaleDateString("es-MX"),
        CuentaOrigen: account?.numeroEnmascarado || "",
        Beneficiario: t.beneficiario,
        CLABE: t.clabe || "",
        Monto: t.monto,
        Moneda: t.moneda,
        Referencia: t.referencia || "",
        Concepto: t.concepto,
      }
    })

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Transferencias")

    const fileName = `layout_transferencias_${new Date().toISOString().split("T")[0]}.xlsx`
    XLSX.writeFile(wb, fileName)

    setSelectedTransfers(new Set())
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Transferencias Bancarias</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportLayout} disabled={selectedTransfers.size === 0}>
            <Download className="w-4 h-4 mr-2" />
            Descargar Layout ({selectedTransfers.size})
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Send className="w-4 h-4 mr-2" />
            Nueva Transferencia
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando transferencias...</div>
        ) : transfers.length === 0 ? (
          <div className="text-center py-12">
            <Send className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No hay transferencias registradas</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Transferencia
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTransfers(new Set(transfers.map((t) => t.id)))
                        } else {
                          setSelectedTransfers(new Set())
                        }
                      }}
                    />
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Tipo</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Beneficiario</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Monto</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Fecha</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((transfer) => {
                  const account = accounts.find((a) => a.id === transfer.cuentaOrigenId)
                  return (
                    <tr key={transfer.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <input
                          type="checkbox"
                          checked={selectedTransfers.has(transfer.id)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedTransfers)
                            if (e.target.checked) {
                              newSelected.add(transfer.id)
                            } else {
                              newSelected.delete(transfer.id)
                            }
                            setSelectedTransfers(newSelected)
                          }}
                        />
                      </td>
                      <td className="py-3 px-2 text-sm capitalize">{transfer.tipo}</td>
                      <td className="py-3 px-2 text-sm">{transfer.beneficiario}</td>
                      <td className="py-3 px-2 text-sm font-medium">
                        ${transfer.monto.toLocaleString("es-MX", { minimumFractionDigits: 2 })} {transfer.moneda}
                      </td>
                      <td className="py-3 px-2 text-sm">
                        {transfer.fechaProgramada instanceof Timestamp
                          ? transfer.fechaProgramada.toDate().toLocaleDateString("es-MX")
                          : new Date(transfer.fechaProgramada as string).toLocaleDateString("es-MX")}
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant="default" className="capitalize">
                          {transfer.estado}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent aria-describedby="transfers-dialog-desc" className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Transferencia</DialogTitle>
            <DialogDescription id="transfers-dialog-desc">
              Registra una nueva transferencia bancaria. Completa todos los campos requeridos.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Transferencia *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: "interna" | "spei" | "externa") => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interna">Transferencia Interna</SelectItem>
                  <SelectItem value="spei">SPEI</SelectItem>
                  <SelectItem value="externa">Externa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cuentaOrigenId">Cuenta Origen *</Label>
              <Select
                value={formData.cuentaOrigenId}
                onValueChange={(value) => setFormData({ ...formData, cuentaOrigenId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona cuenta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.alias || acc.banco} - {acc.numeroEnmascarado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formData.tipo === "interna" && (
              <div className="space-y-2">
                <Label htmlFor="cuentaDestinoId">Cuenta Destino *</Label>
                <Select
                  value={formData.cuentaDestinoId}
                  onValueChange={(value) => setFormData({ ...formData, cuentaDestinoId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.alias || acc.banco} - {acc.numeroEnmascarado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="beneficiario">Beneficiario *</Label>
              <Input
                id="beneficiario"
                placeholder="Nombre del beneficiario"
                value={formData.beneficiario}
                onChange={(e) => setFormData({ ...formData, beneficiario: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clabe">CLABE (si aplica)</Label>
              <Input
                id="clabe"
                placeholder="012180001234567890"
                value={formData.clabe}
                onChange={(e) => setFormData({ ...formData, clabe: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monto">Monto *</Label>
                <Input
                  id="monto"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.monto}
                  onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="moneda">Moneda *</Label>
                <Select
                  value={formData.moneda}
                  onValueChange={(value: "MXN" | "USD") => setFormData({ ...formData, moneda: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MXN">MXN</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaProgramada">Fecha Programada *</Label>
              <Input
                id="fechaProgramada"
                type="date"
                value={formData.fechaProgramada}
                onChange={(e) => setFormData({ ...formData, fechaProgramada: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="referencia">Referencia</Label>
              <Input
                id="referencia"
                placeholder="REF-001"
                value={formData.referencia}
                onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="concepto">Concepto *</Label>
              <Input
                id="concepto"
                placeholder="Pago por..."
                value={formData.concepto}
                onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Crear Transferencia"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
