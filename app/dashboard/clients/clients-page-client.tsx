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
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useData } from "@/hooks/use-data"
import { FormDialog } from "@/components/ui/form-dialog"
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
  name: string
  rfc: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  creditLimit: number
  balance: number
  status: string
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
  const [activeTab, setActiveTab] = useState("clientes")
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
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
    { name: "name", label: "Nombre / Razón Social", type: "text" as const, required: true },
    { name: "rfc", label: "RFC", type: "text" as const, required: true, placeholder: "XAXX010101000" },
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
      clientsSafe.filter(
        (client) =>
          client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client?.rfc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client?.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [clientsSafe, searchTerm],
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
      <div>
        <h1 className="text-3xl font-bold">Clientes / CRM</h1>
        <p className="text-muted-foreground mt-2">Gestión integral de clientes, ventas y documentos fiscales</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Users className="w-8 h-8 text-primary" />
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground mt-4">Total Clientes</p>
            <p className="text-2xl font-bold mt-1">{totalClients}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <UserPlus className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground mt-4">Clientes Activos</p>
            <p className="text-2xl font-bold mt-1">{activeClients}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground mt-4">Por Cobrar</p>
            <p className="text-2xl font-bold mt-1">
              ${totalRevenue.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground mt-4">Docs del Mes</p>
            <p className="text-2xl font-bold mt-1">{documentsSafe.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="crm">CRM / Prospectos</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
          <TabsTrigger value="cfdi">CFDI</TabsTrigger>
          <TabsTrigger value="cobranza">Cobranza</TabsTrigger>
        </TabsList>

        <TabsContent value="clientes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Catálogo de Clientes</CardTitle>
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar clientes..."
                    className="max-w-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button onClick={() => openDialog("clients")}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Nuevo Cliente
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingClients ? (
                <div className="text-center py-8 text-muted-foreground">Cargando...</div>
              ) : filteredClients.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No hay clientes registrados</p>
                  <Button onClick={() => openDialog("clients")}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Agregar Primer Cliente
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Nombre</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">RFC</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Contacto</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                          Límite Crédito
                        </th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Saldo</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Estado</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClients.map((client) => (
                        <tr
                          key={client?.id ?? Math.random()}
                          className="border-b border-border last:border-0 hover:bg-muted/50"
                        >
                          <td className="py-3 px-2">
                            <div className="text-sm font-medium">{client?.name ?? "Sin nombre"}</div>
                          </td>
                          <td className="py-3 px-2 text-sm">{client?.rfc ?? "N/A"}</td>
                          <td className="py-3 px-2">
                            <div className="flex flex-col gap-1">
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {client?.email ?? "N/A"}
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {client?.phone ?? "N/A"}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-sm font-medium">
                            ${(client?.creditLimit ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-2 text-sm font-medium">
                            ${(client?.balance ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-2">
                            <Badge
                              variant={
                                client?.status === "vip"
                                  ? "default"
                                  : client?.status === "active"
                                    ? "outline"
                                    : "secondary"
                              }
                            >
                              {client?.status === "vip" ? "VIP" : client?.status === "active" ? "Activo" : "Inactivo"}
                            </Badge>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openDialog("clients", client)}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => {
                                  setItemToDelete(client)
                                  setCurrentModule("clients")
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crm" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-6 h-6 text-blue-500" />
                  <Badge variant="outline">Pipeline</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Contacto Inicial</p>
                <p className="text-xl font-bold mt-1">{prospectsSafe.filter((p) => p?.stage === "contacto").length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-xs text-muted-foreground">Calificados</p>
                <p className="text-xl font-bold mt-1">
                  {prospectsSafe.filter((p) => p?.stage === "calificado").length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Package className="w-6 h-6 text-yellow-500" />
                </div>
                <p className="text-xs text-muted-foreground">Presentación</p>
                <p className="text-xl font-bold mt-1">
                  {prospectsSafe.filter((p) => p?.stage === "presentacion").length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-xs text-muted-foreground">Negociación</p>
                <p className="text-xl font-bold mt-1">
                  {prospectsSafe.filter((p) => p?.stage === "negociacion").length}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pipeline de Ventas</CardTitle>
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar prospectos..."
                    className="max-w-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button onClick={() => openDialog("prospects")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Prospecto
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingProspects ? (
                <div className="text-center py-8 text-muted-foreground">Cargando...</div>
              ) : filteredProspects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No hay prospectos registrados</p>
                  <Button onClick={() => openDialog("prospects")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Primer Prospecto
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Empresa</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Contacto</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Fuente</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Etapa</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Valor</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Probabilidad</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProspects.map((prospect) => (
                        <tr
                          key={prospect?.id ?? Math.random()}
                          className="border-b border-border last:border-0 hover:bg-muted/50"
                        >
                          <td className="py-3 px-2">
                            <div className="text-sm font-medium">{prospect?.company ?? "Sin nombre"}</div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex flex-col gap-1">
                              <div className="text-xs font-medium">{prospect?.contact ?? "N/A"}</div>
                              <div className="text-xs text-muted-foreground">{prospect?.email ?? "N/A"}</div>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <Badge variant="outline">{prospect?.source ?? "N/A"}</Badge>
                          </td>
                          <td className="py-3 px-2">
                            <Badge
                              variant={
                                prospect?.stage === "negociacion"
                                  ? "default"
                                  : prospect?.stage === "presentacion"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {prospect?.stage === "contacto"
                                ? "Contacto"
                                : prospect?.stage === "calificado"
                                  ? "Calificado"
                                  : prospect?.stage === "presentacion"
                                    ? "Presentación"
                                    : "Negociación"}
                            </Badge>
                          </td>
                          <td className="py-3 px-2 text-sm font-medium">
                            ${(prospect?.value ?? 0).toLocaleString("es-MX")}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-green-500 h-full"
                                  style={{ width: `${prospect?.probability ?? 0}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium w-10 text-right">{prospect?.probability ?? 0}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openDialog("prospects", prospect)}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => {
                                  setItemToDelete(prospect)
                                  setCurrentModule("prospects")
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardContent className="p-6">
                <Receipt className="w-6 h-6 text-primary mb-2" />
                <p className="text-xs text-muted-foreground">Facturas</p>
                <p className="text-xl font-bold mt-1">{documentsSafe.filter((d) => d?.type === "factura").length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <ShoppingCart className="w-6 h-6 text-blue-500 mb-2" />
                <p className="text-xs text-muted-foreground">Pedidos</p>
                <p className="text-xl font-bold mt-1">{documentsSafe.filter((d) => d?.type === "pedido").length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <FileText className="w-6 h-6 text-green-500 mb-2" />
                <p className="text-xs text-muted-foreground">Cotizaciones</p>
                <p className="text-xl font-bold mt-1">{documentsSafe.filter((d) => d?.type === "cotizacion").length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Package className="w-6 h-6 text-yellow-500 mb-2" />
                <p className="text-xs text-muted-foreground">Remisiones</p>
                <p className="text-xl font-bold mt-1">{documentsSafe.filter((d) => d?.type === "remision").length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <TrendingDown className="w-6 h-6 text-red-500 mb-2" />
                <p className="text-xs text-muted-foreground">N. Crédito</p>
                <p className="text-xl font-bold mt-1">
                  {documentsSafe.filter((d) => d?.type === "notacredito").length}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Documentos Fiscales</CardTitle>
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar documentos..."
                    className="max-w-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button onClick={() => openDialog("documents")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Documento
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingDocuments ? (
                <div className="text-center py-8 text-muted-foreground">Cargando...</div>
              ) : filteredDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No hay documentos registrados</p>
                  <Button onClick={() => openDialog("documents")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Primer Documento
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Tipo</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Cliente</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Fecha</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Monto</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Estado</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDocuments.map((doc) => (
                        <tr
                          key={doc?.id ?? Math.random()}
                          className="border-b border-border last:border-0 hover:bg-muted/50"
                        >
                          <td className="py-3 px-2">
                            <Badge variant="outline">{doc?.type ?? "N/A"}</Badge>
                          </td>
                          <td className="py-3 px-2 text-sm font-medium">{doc?.client ?? "Sin nombre"}</td>
                          <td className="py-3 px-2 text-sm">{doc?.date ?? "N/A"}</td>
                          <td className="py-3 px-2 text-sm font-medium">
                            ${(doc?.amount ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-2">
                            <Badge
                              variant={
                                doc?.status === "pagada" || doc?.status === "timbrada"
                                  ? "default"
                                  : doc?.status === "enviada"
                                    ? "secondary"
                                    : doc?.status === "cancelada"
                                      ? "destructive"
                                      : "outline"
                              }
                            >
                              {doc?.status ?? "N/A"}
                            </Badge>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openDialog("documents", doc)}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => {
                                  setItemToDelete(doc)
                                  setCurrentModule("documents")
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estadisticas" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cotizaciones del Mes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pendientes</span>
                    <Badge variant="outline">{quotationsSafe.filter((q) => q?.status === "pendiente").length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Enviadas</span>
                    <Badge variant="secondary">{quotationsSafe.filter((q) => q?.status === "enviada").length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Aprobadas</span>
                    <Badge>{quotationsSafe.filter((q) => q?.status === "aprobada").length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Rechazadas</span>
                    <Badge variant="destructive">
                      {quotationsSafe.filter((q) => q?.status === "rechazada").length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Conversión de Ventas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-3xl font-bold">
                      {prospectsSafe.length > 0
                        ? Math.round((clientsSafe.length / (clientsSafe.length + prospectsSafe.length)) * 100)
                        : 0}
                      %
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Tasa de conversión</p>
                  </div>
                  <div className="pt-4">
                    <p className="text-2xl font-bold">{prospectsSafe.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">Prospectos activos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Valor Estimado Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-3xl font-bold">
                      ${prospectsSafe.reduce((acc, p) => acc + (p?.value ?? 0), 0).toLocaleString("es-MX")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Total en pipeline</p>
                  </div>
                  <div className="pt-4">
                    <p className="text-2xl font-bold">
                      $
                      {prospectsSafe
                        .reduce((acc, p) => acc + (p?.value ?? 0) * ((p?.probability ?? 0) / 100), 0)
                        .toLocaleString("es-MX")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Valor ponderado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cotizaciones Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingQuotations ? (
                <div className="text-center py-8 text-muted-foreground">Cargando...</div>
              ) : quotationsSafe.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No hay cotizaciones registradas</p>
                  <Button onClick={() => openDialog("quotations")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Primera Cotización
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Cliente</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Fecha</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Monto</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Estado</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Probabilidad</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotationsSafe.map((quote) => (
                        <tr
                          key={quote?.id ?? Math.random()}
                          className="border-b border-border last:border-0 hover:bg-muted/50"
                        >
                          <td className="py-3 px-2 text-sm font-medium">{quote?.client ?? "Sin nombre"}</td>
                          <td className="py-3 px-2 text-sm">{quote?.date ?? "N/A"}</td>
                          <td className="py-3 px-2 text-sm font-medium">
                            ${(quote?.total ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-2">
                            <Badge
                              variant={
                                quote?.status === "aprobada"
                                  ? "default"
                                  : quote?.status === "rechazada"
                                    ? "destructive"
                                    : quote?.status === "seguimiento"
                                      ? "secondary"
                                      : "outline"
                              }
                            >
                              {quote?.status ?? "N/A"}
                            </Badge>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden max-w-[80px]">
                                <div className="bg-green-500 h-full" style={{ width: `${quote?.probability ?? 0}%` }} />
                              </div>
                              <span className="text-xs font-medium">{quote?.probability ?? 0}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openDialog("quotations", quote)}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => {
                                  setItemToDelete(quote)
                                  setCurrentModule("quotations")
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cfdi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sistema CFDI 4.0</CardTitle>
              <p className="text-sm text-muted-foreground">
                Módulo de facturación electrónica compatible con SAT México
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-2">
                  <CardContent className="p-6">
                    <Receipt className="w-8 h-8 text-green-500 mb-2" />
                    <p className="text-sm text-muted-foreground">Timbradas</p>
                    <p className="text-2xl font-bold mt-1">
                      {documentsSafe.filter((d) => d?.status === "timbrada").length}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-2">
                  <CardContent className="p-6">
                    <Send className="w-8 h-8 text-blue-500 mb-2" />
                    <p className="text-sm text-muted-foreground">Enviadas</p>
                    <p className="text-2xl font-bold mt-1">
                      {documentsSafe.filter((d) => d?.status === "enviada").length}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-2">
                  <CardContent className="p-6">
                    <Clock className="w-8 h-8 text-yellow-500 mb-2" />
                    <p className="text-sm text-muted-foreground">Pendientes</p>
                    <p className="text-2xl font-bold mt-1">
                      {documentsSafe.filter((d) => d?.status === "pendiente").length}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-2">
                  <CardContent className="p-6">
                    <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                    <p className="text-sm text-muted-foreground">Canceladas</p>
                    <p className="text-2xl font-bold mt-1">
                      {documentsSafe.filter((d) => d?.status === "cancelada").length}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Últimas Facturas Emitidas</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No hay facturas emitidas</div>
              ) : (
                <div className="space-y-3">
                  {filteredDocuments.slice(0, 10).map((doc) => (
                    <div
                      key={doc?.id ?? Math.random()}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <Receipt className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">{doc?.client ?? "Sin nombre"}</p>
                          <p className="text-sm text-muted-foreground">{doc?.date ?? "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-medium">
                          ${(doc?.amount ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                        </p>
                        <Badge
                          variant={
                            doc?.status === "timbrada" || doc?.status === "pagada"
                              ? "default"
                              : doc?.status === "enviada"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {doc?.status ?? "N/A"}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cobranza" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <DollarSign className="w-6 h-6 text-green-500 mb-2" />
                <p className="text-xs text-muted-foreground">Total Por Cobrar</p>
                <p className="text-xl font-bold mt-1">
                  ${invoicesSafe.reduce((acc, i) => acc + (i?.amount ?? 0), 0).toLocaleString("es-MX")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Clock className="w-6 h-6 text-yellow-500 mb-2" />
                <p className="text-xs text-muted-foreground">Pendientes</p>
                <p className="text-xl font-bold mt-1">{invoicesSafe.filter((i) => i?.status === "pendiente").length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <AlertCircle className="w-6 h-6 text-red-500 mb-2" />
                <p className="text-xs text-muted-foreground">Vencidas</p>
                <p className="text-xl font-bold mt-1">{invoicesSafe.filter((i) => i?.status === "vencida").length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <CheckCircle2 className="w-6 h-6 text-green-500 mb-2" />
                <p className="text-xs text-muted-foreground">Pagadas</p>
                <p className="text-xl font-bold mt-1">{invoicesSafe.filter((i) => i?.status === "pagada").length}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Cuentas por Cobrar</CardTitle>
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar facturas..."
                    className="max-w-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button onClick={() => openDialog("invoices")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Factura
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingInvoices ? (
                <div className="text-center py-8 text-muted-foreground">Cargando...</div>
              ) : filteredInvoices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No hay facturas pendientes de cobro</p>
                  <Button onClick={() => openDialog("invoices")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Primera Factura
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Cliente</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Monto</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                          F. Vencimiento
                        </th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                          Método de Pago
                        </th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Estado</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvoices.map((invoice) => (
                        <tr
                          key={invoice?.id ?? Math.random()}
                          className="border-b border-border last:border-0 hover:bg-muted/50"
                        >
                          <td className="py-3 px-2 text-sm font-medium">{invoice?.client ?? "Sin nombre"}</td>
                          <td className="py-3 px-2 text-sm font-medium">
                            ${(invoice?.amount ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-2 text-sm">{invoice?.dueDate ?? "N/A"}</td>
                          <td className="py-3 px-2">
                            <Badge variant="outline">{invoice?.paymentMethod ?? "N/A"}</Badge>
                          </td>
                          <td className="py-3 px-2">
                            <Badge
                              variant={
                                invoice?.status === "pagada"
                                  ? "default"
                                  : invoice?.status === "vencida"
                                    ? "destructive"
                                    : invoice?.status === "parcial"
                                      ? "secondary"
                                      : "outline"
                              }
                            >
                              {invoice?.status === "pagada"
                                ? "Pagada"
                                : invoice?.status === "vencida"
                                  ? "Vencida"
                                  : invoice?.status === "parcial"
                                    ? "Pago Parcial"
                                    : "Pendiente"}
                            </Badge>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openDialog("invoices", invoice)}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => {
                                  setItemToDelete(invoice)
                                  setCurrentModule("invoices")
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
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
    </div>
  )
}
