"use client"

import { useState, type FormEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, Building2 } from "lucide-react"
import { useBankingData } from "@/hooks/use-banking-data"
import type { BankAccount } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function BankAccountsTab() {
  const { bankAccounts, loading, createBankAccount, updateBankAccount, removeBankAccount } = useBankingData()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<BankAccount | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    banco: "",
    alias: "",
    numeroCompleto: "",
    tipo: "cheques",
    moneda: "MXN",
    saldoInicial: "0",
    clabe: "",
  })

  const handleOpenDialog = (account: BankAccount | null) => {
    console.log("[v0] Opening dialog with account:", account)
    if (account) {
      setFormData({
        banco: account.banco || "",
        alias: account.alias || "",
        numeroCompleto: account.numeroCompleto || "",
        tipo: account.tipo || "cheques",
        moneda: account.moneda || "MXN",
        saldoInicial: String(account.saldoInicial || 0),
        clabe: account.clabe || "",
      })
      setEditingAccount(account)
    } else {
      setFormData({
        banco: "",
        alias: "",
        numeroCompleto: "",
        tipo: "cheques",
        moneda: "MXN",
        saldoInicial: "0",
        clabe: "",
      })
      setEditingAccount(null)
    }
    setDialogOpen(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    console.log("[v0] Form submitted with data:", formData)
    setSaving(true)

    try {
      // Validation
      if (!formData.banco || !formData.numeroCompleto || !formData.alias) {
        toast({
          title: "Error de validación",
          description: "Por favor completa todos los campos requeridos",
          variant: "destructive",
        })
        setSaving(false)
        return
      }

      const numeroCompleto = formData.numeroCompleto || ""
      const numeroEnmascarado = `****${numeroCompleto.slice(-4)}`
      const saldoInicial = Number.parseFloat(formData.saldoInicial) || 0

      const accountData = {
        banco: formData.banco,
        alias: formData.alias,
        numeroEnmascarado,
        numeroCompleto,
        tipo: formData.tipo as "cheques" | "inversion" | "ahorro" | "nomina",
        moneda: formData.moneda as "MXN" | "USD" | "EUR",
        saldoInicial,
        saldoActual: editingAccount ? editingAccount.saldoActual : saldoInicial,
        estado: (editingAccount?.estado || "activa") as "activa" | "inactiva" | "suspendida",
        clabe: formData.clabe || "",
      }

      console.log("[v0] Calling Firestore with data:", accountData)

      if (editingAccount) {
        await updateBankAccount(editingAccount.id, accountData)
        toast({
          title: "Cuenta actualizada",
          description: `La cuenta ${formData.alias} ha sido actualizada exitosamente`,
        })
      } else {
        const result = await createBankAccount(accountData)
        console.log("[v0] Create result:", result)
        toast({
          title: "Cuenta creada",
          description: `La cuenta ${formData.alias} ha sido creada exitosamente`,
        })
      }

      setDialogOpen(false)
      setEditingAccount(null)
    } catch (error) {
      console.error("[BankAccountsTab] Error saving account:", error)
      toast({
        title: "Error al guardar",
        description: error instanceof Error ? error.message : "No se pudo guardar la cuenta",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (accountToDelete) {
      try {
        await removeBankAccount(accountToDelete.id)
        toast({
          title: "Cuenta eliminada",
          description: `La cuenta ${accountToDelete.alias} ha sido eliminada`,
        })
        setAccountToDelete(null)
        setDeleteDialogOpen(false)
      } catch (error) {
        console.error("[BankAccountsTab] Error deleting account:", error)
        toast({
          title: "Error al eliminar",
          description: "No se pudo eliminar la cuenta",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gestión de Cuentas Bancarias</CardTitle>
        <Button onClick={() => handleOpenDialog(null)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Cuenta
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando cuentas...</div>
        ) : bankAccounts.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No hay cuentas bancarias registradas</p>
            <Button onClick={() => handleOpenDialog(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primera Cuenta
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {bankAccounts.map((account) => (
              <Card key={account.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{account.alias || account.banco}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {account.banco} • {account.numeroEnmascarado}
                        </p>
                        <div className="flex gap-6 mt-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Saldo Actual</p>
                            <p className="text-xl font-bold mt-1">
                              ${(account.saldoActual || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Moneda</p>
                            <p className="text-xl font-bold mt-1">{account.moneda}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Tipo</p>
                            <p className="text-sm mt-1 capitalize">{account.tipo}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Badge variant={account.estado === "activa" ? "outline" : "secondary"} className="capitalize">
                            {account.estado}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenDialog(account)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAccountToDelete(account)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAccount ? "Editar Cuenta Bancaria" : "Nueva Cuenta Bancaria"}</DialogTitle>
            <DialogDescription>
              {editingAccount ? "Actualiza la información de la cuenta" : "Registra una nueva cuenta bancaria"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="banco">
                    Banco <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="banco"
                    value={formData.banco}
                    onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                    placeholder="BBVA Bancomer"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alias">
                    Alias / Nombre Amigable <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="alias"
                    value={formData.alias}
                    onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                    placeholder="Cuenta Principal"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroCompleto">
                  Número de Cuenta <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="numeroCompleto"
                  value={formData.numeroCompleto}
                  onChange={(e) => setFormData({ ...formData, numeroCompleto: e.target.value })}
                  placeholder="0112345678"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">
                    Tipo de Cuenta <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                    <SelectTrigger id="tipo">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cheques">Cuenta de Cheques</SelectItem>
                      <SelectItem value="inversion">Cuenta de Inversión</SelectItem>
                      <SelectItem value="ahorro">Cuenta de Ahorro</SelectItem>
                      <SelectItem value="nomina">Cuenta de Nómina</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="moneda">
                    Moneda <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.moneda}
                    onValueChange={(value) => setFormData({ ...formData, moneda: value })}
                  >
                    <SelectTrigger id="moneda">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
                      <SelectItem value="USD">USD - Dólar Estadounidense</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="saldoInicial">
                  Saldo Inicial <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="saldoInicial"
                  type="number"
                  step="0.01"
                  value={formData.saldoInicial}
                  onChange={(e) => setFormData({ ...formData, saldoInicial: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clabe">CLABE Interbancaria (opcional)</Label>
                <Input
                  id="clabe"
                  value={formData.clabe}
                  onChange={(e) => setFormData({ ...formData, clabe: e.target.value })}
                  placeholder="012180001234567890"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando..." : editingAccount ? "Actualizar" : "Crear Cuenta"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cuenta bancaria?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la cuenta "{accountToDelete?.alias}" y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
