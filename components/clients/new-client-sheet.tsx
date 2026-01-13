"use client"

import { useEffect, useState } from "react"
import { X, Building2, User, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface NewClientSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: Record<string, unknown>) => Promise<void> | void
  initialValues?: Record<string, unknown>
}

type ClientDraft = {
  id?: string
  name?: string
  razonSocial?: string
  rfc?: string
  regimenFiscal?: string
  usoCfdi?: string
  codigoPostal?: string
  correosFacturacion?: string
  telefonos?: string
  direccionFiscal?: string
  historialCambiosFiscales?: string
  email?: string
  phone?: string
  address?: string
  status?: string
  creditLimit?: number
  creditDays?: number
  balance?: number
  clientType?: string
  priceType?: string
  tags?: string[]
  notes?: string
}

export function NewClientSheet({ open, onOpenChange, onSubmit, initialValues }: NewClientSheetProps) {
  const [clientType, setClientType] = useState("empresa")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [status, setStatus] = useState("prospecto")
  const [priceType, setPriceType] = useState("menudeo")
  const [creditDays, setCreditDays] = useState("0")
  const [creditLimit, setCreditLimit] = useState("0")
  const [name, setName] = useState("")
  const [razonSocial, setRazonSocial] = useState("")
  const [rfc, setRfc] = useState("")
  const [regimenFiscal, setRegimenFiscal] = useState("")
  const [usoCfdi, setUsoCfdi] = useState("")
  const [codigoPostal, setCodigoPostal] = useState("")
  const [correosFacturacion, setCorreosFacturacion] = useState("")
  const [telefonos, setTelefonos] = useState("")
  const [direccionFiscal, setDireccionFiscal] = useState("")
  const [historialCambiosFiscales, setHistorialCambiosFiscales] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [notes, setNotes] = useState("")

  const isEdit = Boolean((initialValues as ClientDraft | undefined)?.id)

  const mapStatusToForm = (value?: string) => {
    switch (value) {
      case "active":
        return "activo"
      case "inactive":
        return "inactivo"
      case "prospecto":
        return "prospecto"
      case "vip":
        return "activo"
      default:
        return "prospecto"
    }
  }

  useEffect(() => {
    if (!open) return
    const values = (initialValues || {}) as ClientDraft
    setClientType(values.clientType || "empresa")
    setSelectedTags(Array.isArray(values.tags) ? values.tags : [])
    setNewTag("")
    setStatus(mapStatusToForm(values.status))
    setPriceType(values.priceType || "menudeo")
    setCreditDays(String(values.creditDays ?? "0"))
    setCreditLimit(String(values.creditLimit ?? "0"))
    setName(values.name || "")
    setRazonSocial(values.razonSocial || "")
    setRfc(values.rfc || "")
    setRegimenFiscal(values.regimenFiscal || "")
    setUsoCfdi(values.usoCfdi || "")
    setCodigoPostal(values.codigoPostal || "")
    setCorreosFacturacion(values.correosFacturacion || "")
    setTelefonos(values.telefonos || "")
    setDireccionFiscal(values.direccionFiscal || "")
    setHistorialCambiosFiscales(values.historialCambiosFiscales || "")
    setEmail(values.email || "")
    setPhone(values.phone || "")
    setAddress(values.address || "")
    setNotes(values.notes || "")
  }, [open, initialValues])

  const availableTags = [
    "VIP",
    "Mayorista",
    "Minorista",
    "Industrial",
    "Construccion",
    "Automotriz",
    "Frecuente",
    "Nuevo",
  ]

  const addTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag))
  }

  const addCustomTag = () => {
    const nextTag = newTag.trim()
    if (nextTag && !selectedTags.includes(nextTag)) {
      setSelectedTags([...selectedTags, nextTag])
      setNewTag("")
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const values = (initialValues || {}) as ClientDraft
    const statusMap: Record<string, string> = {
      activo: "active",
      prospecto: "prospecto",
      inactivo: "inactive",
    }

    await onSubmit({
      name,
      razonSocial,
      rfc,
      regimenFiscal,
      usoCfdi,
      codigoPostal,
      correosFacturacion,
      telefonos,
      direccionFiscal,
      historialCambiosFiscales,
      email,
      phone,
      address,
      status: statusMap[status] ?? "prospecto",
      creditLimit: Number(creditLimit || 0),
      creditDays: Number(creditDays || 0),
      balance: typeof values.balance === "number" ? values.balance : 0,
      clientType,
      priceType,
      tags: selectedTags,
      notes,
    })

    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto rounded-l-2xl my-3 mr-3 h-[calc(100%-1.5rem)] border border-border shadow-2xl">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Editar Cliente" : "Nuevo Cliente"}</SheetTitle>
          <SheetDescription>
            {isEdit ? "Actualiza la informacion del cliente." : "Completa la informacion para agregar un nuevo cliente."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6 px-5 pb-6">
          <div className="space-y-3">
            <Label>Tipo de cliente *</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setClientType("empresa")}
                className={`p-4 border-2 rounded-lg transition-all ${
                  clientType === "empresa"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Building2
                  className={`w-6 h-6 mx-auto mb-2 ${
                    clientType === "empresa" ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <p className="text-sm font-medium">Empresa</p>
              </button>
              <button
                type="button"
                onClick={() => setClientType("persona")}
                className={`p-4 border-2 rounded-lg transition-all ${
                  clientType === "persona"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <User
                  className={`w-6 h-6 mx-auto mb-2 ${
                    clientType === "persona" ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <p className="text-sm font-medium">Persona fisica</p>
              </button>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold">Informacion basica</h3>

            <div className="space-y-2">
              <Label htmlFor="name">Nombre comercial *</Label>
              <Input
                id="name"
                placeholder={clientType === "empresa" ? "Distribuidora Lopez" : "Juan Carlos Ramirez"}
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="razonSocial">Razon social *</Label>
              <Input
                id="razonSocial"
                placeholder="Distribuidora Lopez SA de CV"
                required
                value={razonSocial}
                onChange={(event) => setRazonSocial(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rfc">RFC *</Label>
              <Input
                id="rfc"
                placeholder="DLO010101ABC"
                required
                maxLength={13}
                value={rfc}
                onChange={(event) => setRfc(event.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="regimenFiscal">Regimen fiscal *</Label>
                <Input
                  id="regimenFiscal"
                  placeholder="601 - General de Ley"
                  required
                  value={regimenFiscal}
                  onChange={(event) => setRegimenFiscal(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usoCfdi">Uso CFDI *</Label>
                <Input
                  id="usoCfdi"
                  placeholder="G03 - Gastos en general"
                  required
                  value={usoCfdi}
                  onChange={(event) => setUsoCfdi(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codigoPostal">Codigo postal *</Label>
                <Input
                  id="codigoPostal"
                  placeholder="44100"
                  required
                  value={codigoPostal}
                  onChange={(event) => setCodigoPostal(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="correosFacturacion">Correos para facturacion *</Label>
                <Input
                  id="correosFacturacion"
                  placeholder="facturacion@empresa.mx"
                  required
                  value={correosFacturacion}
                  onChange={(event) => setCorreosFacturacion(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefonos">Telefonos *</Label>
              <Input
                id="telefonos"
                placeholder="+52 33 1234 5678, +52 33 9876 5432"
                required
                value={telefonos}
                onChange={(event) => setTelefonos(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccionFiscal">Direccion fiscal *</Label>
              <Textarea
                id="direccionFiscal"
                placeholder="Calle, numero, colonia, ciudad, estado, CP"
                rows={3}
                value={direccionFiscal}
                onChange={(event) => setDireccionFiscal(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado inicial *</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#24A148]" />
                      Activo
                    </div>
                  </SelectItem>
                  <SelectItem value="prospecto">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#F1C21B]" />
                      Prospecto
                    </div>
                  </SelectItem>
                  <SelectItem value="inactivo">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#6F7780]" />
                      Inactivo
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold">Informacion de contacto</h3>

            <div className="space-y-2">
              <Label htmlFor="email">Correo *</Label>
              <Input
                id="email"
                type="email"
                placeholder="contacto@empresa.mx"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefono *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+52 33 1234 5678"
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Direccion</Label>
              <Textarea
                id="address"
                placeholder="Calle, numero, colonia, ciudad, estado, CP"
                rows={3}
                value={address}
                onChange={(event) => setAddress(event.target.value)}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold">Condiciones comerciales</h3>

            <div className="space-y-2">
              <Label htmlFor="priceType">Tipo de precio *</Label>
              <Select value={priceType} onValueChange={setPriceType}>
                <SelectTrigger id="priceType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mayorista-vip">Mayorista - VIP</SelectItem>
                  <SelectItem value="mayorista-1">Mayorista - Nivel 1</SelectItem>
                  <SelectItem value="mayorista-2">Mayorista - Nivel 2</SelectItem>
                  <SelectItem value="minorista">Minorista - Estandar</SelectItem>
                  <SelectItem value="menudeo">Menudeo</SelectItem>
                  <SelectItem value="especial">Especial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="creditDays">Dias de credito</Label>
                <Select value={creditDays} onValueChange={setCreditDays}>
                  <SelectTrigger id="creditDays">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Contado (0 dias)</SelectItem>
                    <SelectItem value="15">15 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="45">45 dias</SelectItem>
                    <SelectItem value="60">60 dias</SelectItem>
                    <SelectItem value="90">90 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="creditLimit">Limite de credito (MXN)</Label>
                <Input
                  id="creditLimit"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={creditLimit}
                  onChange={(event) => setCreditLimit(event.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold">Etiquetas</h3>

            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <Badge key={tag} variant="outline" className="gap-1 pr-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div>
              <Label className="text-xs text-muted-foreground">Etiquetas sugeridas</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {availableTags
                  .filter((tag) => !selectedTags.includes(tag))
                  .map((tag) => (
                    <Button
                      key={tag}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addTag(tag)}
                      className="h-7 text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {tag}
                    </Button>
                  ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Etiqueta personalizada"
                value={newTag}
                onChange={(event) => setNewTag(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    addCustomTag()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addCustomTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold">Historial de cambios fiscales</h3>
            <Textarea
              placeholder="Registra cambios fiscales relevantes..."
              rows={3}
              value={historialCambiosFiscales}
              onChange={(event) => setHistorialCambiosFiscales(event.target.value)}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold">Notas iniciales (opcional)</h3>
            <Textarea
              placeholder="Notas o comentarios sobre este cliente"
              rows={4}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-4 sticky bottom-0 bg-card pb-6">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
              {isEdit ? "Actualizar cliente" : "Guardar cliente"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
