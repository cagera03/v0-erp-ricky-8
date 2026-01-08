"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useBankingData } from "@/hooks/use-banking-data"
import type { BankAccount } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface BankAccountFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account: BankAccount | null
}

export function BankAccountFormDialog({ open, onOpenChange, account }: BankAccountFormDialogProps) {
  const { createBankAccount, updateBankAccount } = useBankingData()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    accountName: "",
    bankName: "",
    accountNumber: "",
    accountType: "corriente",
    currency: "MXN",
    balance: "0",
    status: "activa",
  })

  useEffect(() => {
    if (account) {
      setFormData({
        accountName: account.accountName || "",
        bankName: account.bankName || "",
        accountNumber: account.accountNumber || "",
        accountType: account.accountType || "corriente",
        currency: account.currency || "MXN",
        balance: String(account.balance || 0),
        status: account.status || "activa",
      })
    } else {
      setFormData({
        accountName: "",
        bankName: "",
        accountNumber: "",
        accountType: "corriente",
        currency: "MXN",
        balance: "0",
        status: "activa",
      })
    }
  }, [account, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[v0] BankAccountFormDialog - handleSubmit called")
    console.log("[v0] Form data:", formData)

    setLoading(true)

    try {
      const accountData = {
        accountName: formData.accountName,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        accountType: formData.accountType as "corriente" | "ahorro" | "inversion",
        currency: formData.currency,
        balance: Number.parseFloat(formData.balance) || 0,
        status: formData.status as "activa" | "inactiva" | "cerrada",
      }

      console.log("[v0] Saving account data:", accountData)

      if (account) {
        await updateBankAccount(account.id, accountData)
        toast({
          title: "Cuenta actualizada",
          description: "La cuenta bancaria se actualizó correctamente",
        })
      } else {
        await createBankAccount(accountData)
        toast({
          title: "Cuenta creada",
          description: "La cuenta bancaria se creó correctamente",
        })
      }

      console.log("[v0] Account saved successfully")
      onOpenChange(false)
    } catch (error) {
      console.error("[v0] Error saving bank account:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la cuenta bancaria",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{account ? "Editar Cuenta Bancaria" : "Nueva Cuenta Bancaria"}</DialogTitle>
          <DialogDescription>
            {account ? "Actualiza la información de la cuenta" : "Registra una nueva cuenta bancaria"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountName">
                  Nombre de la Cuenta <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="accountName"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  placeholder="Ej: Cuenta Principal"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName">
                  Banco <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="Ej: BBVA"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountNumber">
                  Número de Cuenta <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder="1234567890"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountType">Tipo de Cuenta</Label>
                <Select
                  value={formData.accountType}
                  onValueChange={(value) => setFormData({ ...formData, accountType: value })}
                >
                  <SelectTrigger id="accountType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corriente">Corriente</SelectItem>
                    <SelectItem value="ahorro">Ahorro</SelectItem>
                    <SelectItem value="inversion">Inversión</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Moneda</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MXN">MXN</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="balance">Saldo Inicial</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activa">Activa</SelectItem>
                    <SelectItem value="inactiva">Inactiva</SelectItem>
                    <SelectItem value="cerrada">Cerrada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : account ? "Actualizar" : "Crear Cuenta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
