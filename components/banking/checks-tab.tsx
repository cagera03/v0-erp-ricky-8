"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Receipt } from "lucide-react"
import { useBankingData } from "@/hooks/use-banking-data"
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
import { useToast } from "@/hooks/use-toast"
import type { Check } from "@/lib/types"

export function ChecksTab() {
  const { checks, accounts, loading, createCheck, updateAccount, createTransaction } = useBankingData()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    numero: "",
    cuentaId: "",
    beneficiario: "",
    monto: "",
    fechaEmision: "",
    concepto: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!formData.numero || !formData.cuentaId || !formData.beneficiario || !formData.monto) {
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

      const account = accounts.find((a) => a.id === formData.cuentaId)
      if (!account) {
        throw new Error("Cuenta bancaria no encontrada")
      }

      if (account.saldoActual < monto) {
        toast({
          title: "Advertencia: Saldo insuficiente",
          description: `La cuenta tiene $${account.saldoActual.toFixed(2)}. El cheque se registrará como "pendiente".`,
          variant: "default",
        })
      }

      const checkData: Omit<Check, "id"> = {
        numero: formData.numero,
        cuentaId: formData.cuentaId,
        beneficiario: formData.beneficiario,
        monto,
        fechaEmision: formData.fechaEmision,
        concepto: formData.concepto,
        estado: account.saldoActual >= monto ? "emitido" : "pendiente",
      }

      await createCheck(checkData)

      await updateAccount(account.id, {
        saldoActual: account.saldoActual - monto,
      })

      await createTransaction({
        cuentaId: account.id,
        tipo: "egreso",
        monto: -monto,
        fecha: formData.fechaEmision,
        concepto: `Cheque ${formData.numero} - ${formData.concepto}`,
        referencia: formData.numero,
        categoria: "cheque",
      })

      toast({
        title: "Cheque creado",
        description: `Cheque ${formData.numero} por $${monto.toFixed(2)} creado exitosamente`,
      })

      setFormData({ numero: "", cuentaId: "", beneficiario: "", monto: "", fechaEmision: "", concepto: "" })
      setDialogOpen(false)
    } catch (error) {
      console.error("Error creating check:", error)
      toast({
        title: "Error al crear cheque",
        description: error instanceof Error ? error.message : "No se pudo crear el cheque",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrintCheck = (check: Check) => {
    const account = accounts.find((a) => a.id === check.cuentaId)
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cheque ${check.numero}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .check-container { border: 2px solid #000; padding: 30px; max-width: 800px; margin: 0 auto; }
            .check-header { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .check-number { font-size: 24px; font-weight: bold; }
            .check-date { margin-top: 20px; }
            .check-payee { margin: 20px 0; font-size: 18px; }
            .check-amount-words { margin: 15px 0; border-bottom: 1px solid #000; padding-bottom: 10px; }
            .check-amount { text-align: right; font-size: 24px; font-weight: bold; margin: 15px 0; }
            .check-memo { margin: 20px 0; }
            .check-signature { margin-top: 40px; border-top: 1px solid #000; width: 300px; text-align: center; padding-top: 10px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="check-container">
            <div class="check-header">
              <div>
                <h2>${account?.banco || "Banco"}</h2>
                <p>Cuenta: ${account?.numeroEnmascarado || ""}</p>
              </div>
              <div class="check-number">No. ${check.numero}</div>
            </div>
            <div class="check-date">
              Fecha: ${check.fechaEmision instanceof Timestamp ? check.fechaEmision.toDate().toLocaleDateString("es-MX") : new Date(check.fechaEmision as string).toLocaleDateString("es-MX")}
            </div>
            <div class="check-payee">
              Páguese a la orden de: <strong>${check.beneficiario}</strong>
            </div>
            <div class="check-amount-words">
              La cantidad de: <strong>${numberToWords(check.monto)} ${account?.moneda || "MXN"}</strong>
            </div>
            <div class="check-amount">
              $${check.monto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </div>
            <div class="check-memo">
              Concepto: ${check.concepto}
            </div>
            <div class="check-signature">
              Firma Autorizada
            </div>
          </div>
          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()">Imprimir</button>
            <button onclick="window.close()">Cerrar</button>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gestión de Cheques</CardTitle>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cheque
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando cheques...</div>
        ) : checks.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No hay cheques registrados</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Cheque
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">No. Cheque</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Beneficiario</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Monto</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Fecha</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Estado</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {checks.map((check) => {
                  const account = accounts.find((a) => a.id === check.cuentaId)
                  return (
                    <tr key={check.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-2 text-sm font-medium">{check.numero}</td>
                      <td className="py-3 px-2 text-sm">{check.beneficiario}</td>
                      <td className="py-3 px-2 text-sm font-medium">
                        ${check.monto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-2 text-sm">
                        {check.fechaEmision instanceof Timestamp
                          ? check.fechaEmision.toDate().toLocaleDateString("es-MX")
                          : new Date(check.fechaEmision as string).toLocaleDateString("es-MX")}
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant={check.estado === "cobrado" ? "outline" : "default"} className="capitalize">
                          {check.estado}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Button variant="outline" size="sm" onClick={() => handlePrintCheck(check)}>
                          <Receipt className="w-4 h-4 mr-2" />
                          Imprimir
                        </Button>
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
        <DialogContent aria-describedby="checks-dialog-desc">
          <DialogHeader>
            <DialogTitle>Nuevo Cheque</DialogTitle>
            <DialogDescription id="checks-dialog-desc">
              Registra un nuevo cheque bancario. Completa todos los campos requeridos.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="numero">Número de Cheque *</Label>
              <Input
                id="numero"
                placeholder="001234"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cuentaId">Cuenta Bancaria *</Label>
              <Select
                value={formData.cuentaId}
                onValueChange={(value) => setFormData({ ...formData, cuentaId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una cuenta" />
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
              <Label htmlFor="fechaEmision">Fecha de Emisión *</Label>
              <Input
                id="fechaEmision"
                type="date"
                value={formData.fechaEmision}
                onChange={(e) => setFormData({ ...formData, fechaEmision: e.target.value })}
                required
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
                {isSubmitting ? "Guardando..." : "Crear Cheque"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function numberToWords(num: number): string {
  if (num === 0) return "CERO"

  const units = ["", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"]
  const tens = ["", "", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"]
  const hundreds = [
    "",
    "CIENTO",
    "DOSCIENTOS",
    "TRESCIENTOS",
    "CUATROCIENTOS",
    "QUINIENTOS",
    "SEISCIENTOS",
    "SETECIENTOS",
    "OCHOCIENTOS",
    "NOVECIENTOS",
  ]

  let intPart = Math.floor(num)
  const decPart = Math.round((num - intPart) * 100)

  let words = ""

  if (intPart >= 1000000) {
    const millions = Math.floor(intPart / 1000000)
    words += millions === 1 ? "UN MILLÓN " : `${numberToWords(millions)} MILLONES `
    intPart %= 1000000
  }

  if (intPart >= 1000) {
    const thousands = Math.floor(intPart / 1000)
    words += thousands === 1 ? "MIL " : `${numberToWords(thousands)} MIL `
    intPart %= 1000
  }

  if (intPart >= 100) {
    if (intPart === 100) {
      words += "CIEN "
    } else {
      words += hundreds[Math.floor(intPart / 100)] + " "
    }
    intPart %= 100
  }

  if (intPart >= 20) {
    words += tens[Math.floor(intPart / 10)] + " "
    intPart %= 10
  } else if (intPart >= 10) {
    const teens = [
      "DIEZ",
      "ONCE",
      "DOCE",
      "TRECE",
      "CATORCE",
      "QUINCE",
      "DIECISÉIS",
      "DIECISIETE",
      "DIECIOCHO",
      "DIECINUEVE",
    ]
    words += teens[intPart - 10] + " "
    intPart = 0
  }

  if (intPart > 0) {
    words += units[intPart] + " "
  }

  words += `PESOS ${decPart.toString().padStart(2, "0")}/100`

  return words.trim()
}
