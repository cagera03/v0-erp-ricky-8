"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  UserPlus,
  TrendingUp,
  DollarSign,
  FileText,
  Receipt,
  ShoppingCart,
  Mail,
  Phone,
  Target,
  Package,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Pencil,
  Trash2,
  Plus,
  Eye,
  TrendingDown,
  Search,
  Filter,
  Sparkles,
  MoreHorizontal,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useData } from "@/hooks/use-data"
import { useAuth } from "@/hooks/use-auth"
import { useFirestore } from "@/hooks/use-firestore"
import { COLLECTIONS } from "@/lib/firestore"
import type { Customer } from "@/lib/types"
import { FormDialog } from "@/components/ui/form-dialog"
import { NewClientSheet } from "@/components/clients/new-client-sheet"
import { ClientDetail } from "@/components/clients/client-detail"
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

type Client = {
  id: string
  firestoreId?: string
  name: string
  rfc: string
  razonSocial?: string
  regimenFiscal?: string
  usoCfdi?: string
  codigoPostal?: string
  correosFacturacion?: string
  telefonos?: string
  direccionFiscal?: string
  historialCambiosFiscales?: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  creditLimit: number
  balance: number
  status: string
  tags?: string[]
  clientType?: string
  priceType?: string
  creditDays?: number
  notes?: string
}

type Prospect = {
  id: string
  company: string
  contact: string
  email: string
  phone: string
  source: string
  stage: string
  value: number
  probability: number
}

type Quotation = {
  id: string
  client: string
  date: string
  total: number
  status: string
  probability: number
}

type Document = {
  id: string
  type: string
  client: string
  date: string
  amount: number
  status: string
}

type Invoice = {
  id: string
  client: string
  amount: number
  dueDate: string
  status: string
  paymentMethod: string
}

export default function ClientsPageClient() {
  const { user } = useAuth()
  const companyId = user?.companyId || user?.uid || ""
  const [activeTab, setActiveTab] = useState("clientes")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newClientOpen, setNewClientOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [viewingClient, setViewingClient] = useState<Client | null>(null)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<any>(null)
  const [currentModule, setCurrentModule] = useState<"clients" | "prospects" | "quotations" | "documents" | "invoices">(
    "clients",
  )

  const {
    items: clients,
    loading: loadingClients,
    create: createClient,
    update: updateClient,
    remove: removeClient,
  } = useData<Client>("clients")
  const { create: createCustomerFs, update: updateCustomerFs } = useFirestore<Customer>(COLLECTIONS.customers, [], true)
  const {
    items: prospects,
    loading: loadingProspects,
    create: createProspect,
    update: updateProspect,
    remove: removeProspect,
  } = useData<Prospect>("prospects")
  const {
    items: quotations,
    loading: loadingQuotations,
    create: createQuotation,
    update: updateQuotation,
    remove: removeQuotation,
  } = useData<Quotation>("quotations")
  const {
    items: documents,
    loading: loadingDocuments,
    create: createDocument,
    update: updateDocument,
    remove: removeDocument,
  } = useData<Document>("documents")
  const {
    items: invoices,
    loading: loadingInvoices,
    create: createInvoice,
    update: updateInvoice,
    remove: removeInvoice,
  } = useData<Invoice>("invoices")

  const clientsSafe = Array.isArray(clients) ? clients.filter((c) => c && typeof c === "object") : []
  const prospectsSafe = Array.isArray(prospects) ? prospects.filter((p) => p && typeof p === "object") : []
  const quotationsSafe = Array.isArray(quotations) ? quotations.filter((q) => q && typeof q === "object") : []
  const documentsSafe = Array.isArray(documents) ? documents.filter((d) => d && typeof d === "object") : []
  const invoicesSafe = Array.isArray(invoices) ? invoices.filter((i) => i && typeof i === "object") : []

  const clientFields = [
    { name: "name", label: "Nombre comercial", type: "text" as const, required: true },
    { name: "razonSocial", label: "Razón social", type: "text" as const, required: true },
    { name: "rfc", label: "RFC", type: "text" as const, required: true, placeholder: "XAXX010101000" },
    { name: "regimenFiscal", label: "Régimen fiscal", type: "text" as const, required: true },
    { name: "usoCfdi", label: "Uso CFDI", type: "text" as const, required: true },
    { name: "codigoPostal", label: "Código postal", type: "text" as const, required: true },
    { name: "correosFacturacion", label: "Correos para facturación", type: "text" as const, required: true },
    { name: "telefonos", label: "Teléfonos", type: "text" as const, required: true },
    { name: "direccionFiscal", label: "Dirección fiscal", type: "textarea" as const, required: true },
    {
      name: "historialCambiosFiscales",
      label: "Historial de cambios fiscales",
      type: "textarea" as const,
      required: false,
    },
    { name: "email", label: "Email", type: "email" as const, required: true },
    { name: "phone", label: "Teléfono", type: "tel" as const, required: true },
    { name: "address", label: "Dirección", type: "textarea" as const, required: true },
    { name: "city", label: "Ciudad", type: "text" as const, required: true },
    { name: "state", label: "Estado", type: "text" as const, required: true },
    {
      name: "status",
      label: "Estado",
      type: "select" as const,
      required: true,
      options: [
        { value: "active", label: "Activo" },
        { value: "prospecto", label: "Prospecto" },
        { value: "inactive", label: "Inactivo" },
        { value: "vip", label: "VIP" },
      ],
    },
    { name: "creditLimit", label: "Límite de Crédito", type: "number" as const, required: true },
  ]

  const prospectFields = [
    { name: "company", label: "Empresa", type: "text" as const, required: true },
    { name: "contact", label: "Contacto", type: "text" as const, required: true },
    { name: "phone", label: "Teléfono", type: "tel" as const, required: true },
    { name: "email", label: "Email", type: "email" as const, required: true },
    {
      name: "source",
      label: "Fuente",
      type: "select" as const,
      required: true,
      options: [
        { value: "referido", label: "Referido" },
        { value: "web", label: "Web" },
        { value: "evento", label: "Evento" },
        { value: "telefono", label: "Teléfono" },
      ],
    },
    {
      name: "stage",
      label: "Etapa",
      type: "select" as const,
      required: true,
      options: [
        { value: "contacto", label: "Contacto Inicial" },
        { value: "calificado", label: "Calificado" },
        { value: "presentacion", label: "Presentación" },
        { value: "negociacion", label: "Negociación" },
      ],
    },
    { name: "value", label: "Valor Estimado", type: "number" as const, required: true },
  ]

  const quotationFields = [
    { name: "client", label: "Cliente", type: "text" as const, required: true },
    { name: "total", label: "Monto", type: "number" as const, required: true },
    { name: "probability", label: "Probabilidad (%)", type: "number" as const, required: true },
    {
      name: "status",
      label: "Estado",
      type: "select" as const,
      required: true,
      options: [
        { value: "pendiente", label: "Pendiente" },
        { value: "enviada", label: "Enviada" },
        { value: "seguimiento", label: "En Seguimiento" },
        { value: "aprobada", label: "Aprobada" },
        { value: "rechazada", label: "Rechazada" },
      ],
    },
    { name: "salesperson", label: "Vendedor", type: "text" as const, required: true },
    { name: "notes", label: "Notas", type: "textarea" as const },
  ]

  const documentFields = [
    {
      name: "type",
      label: "Tipo",
      type: "select" as const,
      required: true,
      options: [
        { value: "factura", label: "Factura" },
        { value: "pedido", label: "Pedido" },
        { value: "cotizacion", label: "Cotización" },
        { value: "remision", label: "Remisión" },
        { value: "notacredito", label: "Nota de Crédito" },
      ],
    },
    { name: "client", label: "Cliente", type: "text" as const, required: true },
    { name: "amount", label: "Monto", type: "number" as const, required: true },
    {
      name: "status",
      label: "Estado",
      type: "select" as const,
      required: true,
      options: [
        { value: "pendiente", label: "Pendiente" },
        { value: "timbrada", label: "Timbrada" },
        { value: "enviada", label: "Enviada" },
        { value: "pagada", label: "Pagada" },
        { value: "cancelada", label: "Cancelada" },
      ],
    },
  ]

  const invoiceFields = [
    { name: "client", label: "Cliente", type: "text" as const, required: true },
    { name: "amount", label: "Monto", type: "number" as const, required: true },
    { name: "dueDate", label: "Fecha de Vencimiento", type: "date" as const, required: true },
    {
      name: "status",
      label: "Estado",
      type: "select" as const,
      required: true,
      options: [
        { value: "pendiente", label: "Pendiente" },
        { value: "pagada", label: "Pagada" },
        { value: "vencida", label: "Vencida" },
        { value: "parcial", label: "Pago Parcial" },
      ],
    },
    {
      name: "paymentMethod",
      label: "Método de Pago",
      type: "select" as const,
      required: true,
      options: [
        { value: "transferencia", label: "Transferencia" },
        { value: "cheque", label: "Cheque" },
        { value: "efectivo", label: "Efectivo" },
        { value: "tarjeta", label: "Tarjeta" },
      ],
    },
  ]

  const handleSave = async (values: any) => {
    const processedValues = {
      ...values,
      amount: values.amount ? Number.parseFloat(values.amount) : undefined,
      creditLimit: values.creditLimit ? Number.parseFloat(values.creditLimit) : undefined,
      value: values.value ? Number.parseFloat(values.value) : undefined,
      probability: values.probability ? Number.parseInt(values.probability) : undefined,
      balance: editingItem?.balance || 0,
      date: new Date().toISOString().split("T")[0],
    }

    if (editingItem) {
      switch (currentModule) {
        case "clients":
          await updateClient(editingItem.id, processedValues)
          break
        case "prospects":
          await updateProspect(editingItem.id, processedValues)
          break
        case "quotations":
          await updateQuotation(editingItem.id, processedValues)
          break
        case "documents":
          await updateDocument(editingItem.id, processedValues)
          break
        case "invoices":
          await updateInvoice(editingItem.id, processedValues)
          break
      }
    } else {
      switch (currentModule) {
        case "clients":
          await createClient(processedValues)
          break
        case "prospects":
          await createProspect(processedValues)
          break
        case "quotations":
          await createQuotation(processedValues)
          break
        case "documents":
          await createDocument(processedValues)
          break
        case "invoices":
          await createInvoice(processedValues)
          break
      }
    }
    setEditingItem(null)
    setDialogOpen(false)
  }

  const handleDelete = async () => {
    if (itemToDelete) {
      switch (currentModule) {
        case "clients":
          await removeClient(itemToDelete.id)
          break
        case "prospects":
          await removeProspect(itemToDelete.id)
          break
        case "quotations":
          await removeQuotation(itemToDelete.id)
          break
        case "documents":
          await removeDocument(itemToDelete.id)
          break
        case "invoices":
          await removeInvoice(itemToDelete.id)
          break
      }
      setItemToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const openDialog = (module: typeof currentModule, item?: any) => {
    setCurrentModule(module)
    setEditingItem(item || null)
    setDialogOpen(true)
  }

  const filteredClients = useMemo(
    () =>
      clientsSafe.filter((client) => {
        const matchesSearch =
          client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client?.rfc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client?.email?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "todos" || client?.status === statusFilter
        return matchesSearch && matchesStatus
      }),
    [clientsSafe, searchTerm, statusFilter],
  )

  const filteredProspects = useMemo(
    () => prospectsSafe.filter((prospect) => prospect?.company?.toLowerCase().includes(searchTerm.toLowerCase())),
    [prospectsSafe, searchTerm],
  )

  const filteredQuotations = useMemo(
    () => quotationsSafe.filter((quote) => quote?.client?.toLowerCase().includes(searchTerm.toLowerCase())),
    [quotationsSafe, searchTerm],
  )

  const filteredDocuments = useMemo(
    () => documentsSafe.filter((doc) => doc?.client?.toLowerCase().includes(searchTerm.toLowerCase())),
    [documentsSafe, searchTerm],
  )

  const filteredInvoices = useMemo(
    () => invoicesSafe.filter((invoice) => invoice?.client?.toLowerCase().includes(searchTerm.toLowerCase())),
    [invoicesSafe, searchTerm],
  )

  const totalClients = clientsSafe.length
  const activeClients = clientsSafe.filter((c) => c?.status === "active" || c?.status === "vip").length
  const totalRevenue = clientsSafe.reduce((acc, c) => acc + (c?.balance || 0), 0)
  const pipelineValue = prospectsSafe.reduce((acc, p) => acc + (p?.value ?? 0), 0)
  const weightedPipelineValue = prospectsSafe.reduce(
    (acc, p) => acc + (p?.value ?? 0) * ((p?.probability ?? 0) / 100),
    0,
  )

  const getStatusBadge = (status?: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      active: { label: "Activo", className: "bg-[#24A148] text-white hover:bg-[#24A148]/90" },
      prospecto: { label: "Prospecto", className: "bg-[#F1C21B] text-[#1A1D1F] hover:bg-[#F1C21B]/90" },
      vip: { label: "VIP", className: "bg-[#0F62FE] text-white hover:bg-[#0F62FE]/90" },
      inactive: { label: "Inactivo", className: "bg-[#6F7780] text-white hover:bg-[#6F7780]/90" },
    }
    const variant = status ? variants[status] : undefined
    return (
      <Badge className={variant?.className ?? "bg-[#6F7780] text-white"}>
        {variant?.label ?? "Sin estado"}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount)

  const getBalanceColor = (balance: number, creditLimit: number) => {
    if (!creditLimit) return "text-[#6F7780]"
    const percentage = (balance / creditLimit) * 100
    if (balance < 0) return "text-[#DA1E28]"
    if (percentage > 90) return "text-[#DA1E28]"
    if (percentage > 80) return "text-[#F1C21B]"
    return "text-[#6F7780]"
  }

  const getCreditAlert = (balance: number, creditLimit: number) => {
    if (!creditLimit) return { show: false, message: "", color: "" }
    const percentage = (balance / creditLimit) * 100
    if (balance > creditLimit) {
      return { show: true, message: "Crédito excedido", color: "text-[#DA1E28]" }
    }
    if (percentage > 80) {
      return { show: true, message: "Cerca del límite", color: "text-[#F1C21B]" }
    }
    return { show: false, message: "", color: "" }
  }

  const handleClientSheetChange = (open: boolean) => {
    setNewClientOpen(open)
    if (!open) {
      setEditingClient(null)
    }
  }

  const openCreateClient = () => {
    setEditingClient(null)
    setNewClientOpen(true)
  }

  const openEditClient = (client: Client) => {
    setEditingClient(client)
    setNewClientOpen(true)
  }

  const openViewClient = (client: Client) => {
    setViewingClient(client)
  }

  const closeViewClient = () => {
    setViewingClient(null)
  }

  const handleUpsertClient = async (payload: Record<string, unknown>) => {
    const toString = (value: unknown) => (typeof value === "string" ? value : value ? String(value) : "")
    const mapStatus = (value: unknown) => {
      if (value === "inactive" || value === "inactivo") return "inactivo"
      return "activo"
    }
    const mapTipoCliente = (priceType: string, tags: unknown) => {
      const tagList = Array.isArray(tags) ? tags.map((tag) => String(tag).toLowerCase()) : []
      if (tagList.includes("vip")) return "vip"
      if (priceType.includes("mayorista") || tagList.includes("mayorista")) return "mayorista"
      return "minorista"
    }

    const priceType = toString(payload.priceType)
    const customerPayload: Omit<Customer, "id"> = {
      nombre: toString(payload.razonSocial || payload.name),
      rfc: toString(payload.rfc),
      email: toString(payload.email),
      telefono: toString(payload.phone || payload.telefonos),
      direccion: toString(payload.direccionFiscal || payload.address),
      ciudad: toString(payload.city),
      estado: mapStatus(payload.status) as Customer["estado"],
      codigoPostal: toString(payload.codigoPostal),
      limiteCredito: Number(payload.creditLimit || 0),
      saldo: Number(payload.balance || 0),
      diasCredito: Number(payload.creditDays || 0),
      tipoCliente: mapTipoCliente(priceType.toLowerCase(), payload.tags) as Customer["tipoCliente"],
      descuentoDefault: 0,
      fechaRegistro: new Date().toISOString(),
      notas: toString(payload.notes),
      companyId,
    }

    let firestoreId = editingClient?.firestoreId

    if (editingClient) {
      if (firestoreId) {
        await updateCustomerFs(firestoreId, customerPayload)
      } else {
        const created = await createCustomerFs(customerPayload)
        firestoreId = created.id
      }
      await updateClient(editingClient.id, { ...payload, firestoreId })
    } else {
      const created = await createCustomerFs(customerPayload)
      firestoreId = created.id
      await createClient({ ...payload, firestoreId })
    }
    setNewClientOpen(false)
    setEditingClient(null)
  }

  const crmStages = [
    { id: "contacto", label: "Contacto inicial", accent: "from-cyan-400/80 to-sky-500/80" },
    { id: "calificado", label: "Calificados", accent: "from-emerald-400/80 to-lime-400/80" },
    { id: "presentacion", label: "Presentacion", accent: "from-amber-400/80 to-yellow-300/80" },
    { id: "negociacion", label: "Negociacion", accent: "from-violet-400/80 to-fuchsia-500/80" },
  ]

  const getCurrentFields = () => {
    switch (currentModule) {
      case "clients":
        return clientFields
      case "prospects":
        return prospectFields
      case "quotations":
        return quotationFields
      case "documents":
        return documentFields
      case "invoices":
        return invoiceFields
      default:
        return clientFields
    }
  }

  return (
    <div className="space-y-6">
      {viewingClient ? (
        <ClientDetail client={viewingClient} onBack={closeViewClient} onEdit={openEditClient} />
      ) : (
        <>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-3 space-y-1">
            <div className="flex items-center justify-between">
              <Users className="w-6 h-6 text-primary" />
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground">Total Clientes</p>
            <p className="text-2xl font-bold leading-tight">{totalClients}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 space-y-1">
            <div className="flex items-center justify-between">
              <UserPlus className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground">Clientes Activos</p>
            <p className="text-2xl font-bold leading-tight">{activeClients}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 space-y-1">
            <div className="flex items-center justify-between">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground">Por Cobrar</p>
            <p className="text-2xl font-bold leading-tight">
              ${totalRevenue.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 space-y-1">
            <div className="flex items-center justify-between">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Docs del Mes</p>
            <p className="text-2xl font-bold leading-tight">{documentsSafe.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="crm">CRM / Prospectos</TabsTrigger>
        </TabsList>

        <TabsContent value="clientes" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Clientes</h3>
              <p className="text-sm text-muted-foreground">Gestiona tu cartera de clientes y prospectos</p>
            </div>
            <Button onClick={openCreateClient} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Cliente
            </Button>
          </div>

          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[240px] max-w-sm relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="prospecto">Prospecto</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-muted-foreground">{filteredClients.length} clientes</div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border">
            {loadingClients ? (
              <div className="text-center py-8 text-muted-foreground">Cargando...</div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No hay clientes registrados</p>
                <Button onClick={openCreateClient}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Agregar Primer Cliente
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-semibold">Cliente</TableHead>
                    <TableHead className="font-semibold">Tipo</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    <TableHead className="font-semibold">Etiquetas</TableHead>
                    <TableHead className="font-semibold">Última Compra</TableHead>
                    <TableHead className="font-semibold text-right">Saldo</TableHead>
                    <TableHead className="font-semibold text-right">Límite Crédito</TableHead>
                    <TableHead className="font-semibold text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => {
                    const tags =
                      client?.tags && client.tags.length > 0
                        ? client.tags
                        : [client?.city, client?.state].filter(Boolean)
                    const balance = client?.balance ?? 0
                    const creditLimit = client?.creditLimit ?? 0
                    const alert = getCreditAlert(balance, creditLimit)
                    return (
                      <TableRow key={client?.id ?? Math.random()} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{client?.name ?? "Sin nombre"}</TableCell>
                        <TableCell>
                          <span className="text-muted-foreground text-sm">{client?.status === "vip" ? "VIP" : "Cliente"}</span>
                        </TableCell>
                        <TableCell>{getStatusBadge(client?.status)}</TableCell>
                        <TableCell>
                          {tags.length === 0 ? (
                            <span className="text-xs text-muted-foreground">Sin etiquetas</span>
                          ) : (
                            <div className="flex gap-1 flex-wrap">
                              {tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">-</TableCell>
                        <TableCell className={`text-right font-medium ${getBalanceColor(balance, creditLimit)}`}>
                          <div className="flex items-center justify-end gap-2">
                            {formatCurrency(balance)}
                            {alert.show ? (
                              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${alert.color} border-current`}>
                                {alert.message}
                              </Badge>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(creditLimit)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openViewClient(client as Client)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="w-4 h-4 text-primary" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => openEditClient(client as Client)}
                            >
                              <Pencil className="w-4 h-4 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => {
                                setItemToDelete(client)
                                setCurrentModule("clients")
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="crm" className="space-y-4">
          <div
            className="crm-board relative overflow-hidden rounded-3xl border border-white/15 bg-slate-950 p-6 text-white shadow-[0_30px_80px_rgba(15,23,42,0.45)] sm:p-8"
            style={{
              backgroundImage:
                "radial-gradient(circle at 18% 12%, rgba(56,189,248,0.35), transparent 45%), radial-gradient(circle at 80% 20%, rgba(14,165,233,0.28), transparent 45%), radial-gradient(circle at 50% 90%, rgba(16,185,129,0.18), transparent 55%), linear-gradient(135deg, rgba(15,23,42,0.95), rgba(7,10,23,0.92))",
            }}
          >
            <div className="absolute -left-20 -top-16 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="absolute -right-12 top-24 h-32 w-32 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="absolute bottom-10 left-1/3 h-48 w-48 rounded-full bg-indigo-400/15 blur-[120px]" />

            <div className="relative space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.28em] text-white/70">
                    <Sparkles className="h-3 w-3" />
                    Pipeline comercial
                  </div>
                  <h2 className="text-2xl font-semibold sm:text-3xl">Negociaciones activas</h2>
                  <p className="text-sm text-white/70">
                    Visualiza oportunidades, valor del pipeline y tareas de seguimiento sin salir del CRM.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button className="bg-cyan-400 text-slate-950 hover:bg-cyan-300" onClick={() => openDialog("prospects")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva oportunidad
                  </Button>
                  <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                    <Target className="mr-2 h-4 w-4" />
                    Reglas
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                  {crmStages.map((stage) => (
                    <span
                      key={stage.id}
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70"
                    >
                      <span className={`h-2 w-2 rounded-full bg-gradient-to-r ${stage.accent}`} />
                      {stage.label}
                    </span>
                  ))}
                </div>
                <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                  <div className="relative flex-1 sm:min-w-[260px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                    <Input
                      placeholder="Busca empresas, contactos o valor..."
                      className="h-10 border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/50"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    En proceso
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-wide text-white/60">Oportunidades</p>
                  <p className="mt-2 text-2xl font-semibold">{prospectsSafe.length}</p>
                  <p className="text-xs text-white/60">Total en pipeline</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-wide text-white/60">Valor bruto</p>
                  <p className="mt-2 text-2xl font-semibold">
                    ${pipelineValue.toLocaleString("es-MX", { minimumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-white/60">Monto estimado</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-wide text-white/60">Valor ponderado</p>
                  <p className="mt-2 text-2xl font-semibold">
                    ${weightedPipelineValue.toLocaleString("es-MX", { minimumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-white/60">Probabilidad aplicada</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-wide text-white/60">Conversion</p>
                  <p className="mt-2 text-2xl font-semibold">
                    {prospectsSafe.length
                      ? Math.round((prospectsSafe.filter((p) => p?.stage === "negociacion").length / prospectsSafe.length) * 100)
                      : 0}
                    %
                  </p>
                  <p className="text-xs text-white/60">A negociacion</p>
                </div>
              </div>

              <div className="mt-2 overflow-x-auto pb-4">
                <div className="flex min-w-[900px] gap-4">
                  {crmStages.map((stage) => {
                    const stageItems = filteredProspects.filter((p) => p?.stage === stage.id)
                    const stageTotal = stageItems.reduce((acc, p) => acc + (p?.value ?? 0), 0)
                    return (
                      <div key={stage.id} className="flex min-w-[240px] flex-1 flex-col gap-3">
                        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${stage.accent}`} />
                              <p className="text-sm font-semibold">{stage.label}</p>
                            </div>
                            <Badge variant="outline" className="border-white/20 text-white/70">
                              {stageItems.length}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-white/70">
                            ${stageTotal.toLocaleString("es-MX", { minimumFractionDigits: 0 })}
                          </p>
                        </div>

                        <div className="flex flex-col gap-3">
                          {stageItems.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-4 text-sm text-white/60">
                              Sin prospectos en esta etapa.
                            </div>
                          ) : (
                            stageItems.map((prospect) => (
                              <div
                                key={prospect?.id ?? Math.random()}
                                className="rounded-2xl bg-white p-4 text-slate-900 shadow-[0_12px_35px_rgba(15,23,42,0.18)]"
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="text-sm font-semibold">{prospect?.company ?? "Sin nombre"}</p>
                                    <p className="text-xs text-slate-500">{prospect?.contact ?? "Contacto"}</p>
                                  </div>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                  </Button>
                                </div>
                                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                  <Mail className="h-3.5 w-3.5" />
                                  {prospect?.email ?? "correo@empresa.com"}
                                </div>
                                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                                  <Phone className="h-3.5 w-3.5" />
                                  {prospect?.phone ?? "Telefono"}
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                  <div>
                                    <p className="text-xs text-slate-400">Valor</p>
                                    <p className="text-sm font-semibold text-slate-900">
                                      ${(prospect?.value ?? 0).toLocaleString("es-MX")}
                                    </p>
                                  </div>
                                  <Badge className="bg-slate-900 text-white">
                                    {prospect?.probability ?? 0}% prob.
                                  </Badge>
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                  <Badge variant="outline" className="border-slate-200 text-slate-500">
                                    {prospect?.source ?? "Fuente"}
                                  </Badge>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 border-slate-200 text-slate-700 hover:bg-slate-100"
                                    onClick={() => openDialog("prospects", prospect)}
                                  >
                                    Editar
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}

                          <Button
                            variant="outline"
                            className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                            onClick={() => openDialog("prospects")}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar oportunidad
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingItem ? `Editar ${currentModule}` : `Nuevo ${currentModule}`}
        fields={getCurrentFields()}
        defaultValues={editingItem || {}}
        onSubmit={handleSave}
      />
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el registro seleccionado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </>
      )}
      <NewClientSheet
        open={newClientOpen}
        onOpenChange={handleClientSheetChange}
        onSubmit={handleUpsertClient}
        initialValues={editingClient || undefined}
      />
    </div>
  )
}
