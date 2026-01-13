"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormDialog } from "@/components/ui/form-dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useFirestore } from "@/hooks/use-firestore"
import { COLLECTIONS } from "@/lib/firestore"
import { FileText, Plus, Pencil, Trash2, Search } from "lucide-react"

type CfdiDoc = {
  id: string
  tipo: "factura" | "nota_credito" | "complemento_pago" | "cancelacion" | "sustitucion"
  estatus: "borrador" | "aprobado" | "cancelado"
  uuid?: string
  clienteId?: string
  clienteNombre?: string
  vendedor?: string
  salesOrderId?: string
  subtotal?: number
  iva?: number
  total?: number
  facturacionTipo?: "parcial" | "total"
  montoFacturado?: number
  motivoCancelacion?: string
  uuidSustituye?: string
  pacStatus?: string
  satStatus?: string
  xmlUrl?: string
  pdfUrl?: string
  createdAt?: any
}

type Customer = {
  id: string
  name?: string
  rfc?: string
}

const tipoTabs = [
  { value: "factura", label: "Facturas" },
  { value: "nota_credito", label: "Notas de credito" },
  { value: "complemento_pago", label: "Complementos de pago" },
  { value: "cancelacion", label: "Cancelaciones" },
  { value: "sustitucion", label: "Sustituciones" },
]

const statusLabels: Record<string, string> = {
  borrador: "Borrador",
  aprobado: "Aprobado",
  cancelado: "Cancelado",
}

export default function FacturacionPage() {
  const { items: cfdis, loading, create, update, remove } = useFirestore<CfdiDoc>(COLLECTIONS.cfdi, [], true)
  const { items: customers } = useFirestore<Customer>(COLLECTIONS.customers, [], true)

  const [activeTab, setActiveTab] = useState("factura")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [clienteFilter, setClienteFilter] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CfdiDoc | null>(null)

  const customerOptions = useMemo(
    () =>
      customers.map((customer) => ({
        value: customer.id,
        label: `${customer.name || "Cliente"}${customer.rfc ? ` (${customer.rfc})` : ""}`,
      })),
    [customers],
  )

  const filteredDocs = useMemo(() => {
    return cfdis.filter((doc) => {
      const matchesTab = doc.tipo === activeTab
      const matchesStatus = statusFilter ? doc.estatus === statusFilter : true
      const matchesCustomer = clienteFilter ? doc.clienteId === clienteFilter : true
      const searchLower = search.toLowerCase()
      const matchesSearch =
        doc.uuid?.toLowerCase().includes(searchLower) ||
        doc.clienteNombre?.toLowerCase().includes(searchLower) ||
        doc.salesOrderId?.toLowerCase().includes(searchLower)
      return matchesTab && matchesStatus && matchesCustomer && (search ? matchesSearch : true)
    })
  }, [cfdis, activeTab, statusFilter, clienteFilter, search])

  const clientHistory = useMemo(() => {
    if (!clienteFilter) return []
    return cfdis
      .filter((doc) => doc.clienteId === clienteFilter)
      .sort((a, b) => {
        const aDate = (a.createdAt as any)?.seconds || 0
        const bDate = (b.createdAt as any)?.seconds || 0
        return bDate - aDate
      })
      .slice(0, 6)
  }, [cfdis, clienteFilter])

  const fields = [
    {
      name: "tipo",
      label: "Tipo",
      type: "select" as const,
      required: true,
      options: tipoTabs.map((tab) => ({ value: tab.value, label: tab.label })),
    },
    {
      name: "estatus",
      label: "Estatus",
      type: "select" as const,
      required: true,
      options: [
        { value: "borrador", label: "Borrador" },
        { value: "aprobado", label: "Aprobado" },
        { value: "cancelado", label: "Cancelado" },
      ],
    },
    {
      name: "clienteId",
      label: "Cliente",
      type: "select" as const,
      options: customerOptions,
    },
    { name: "clienteNombre", label: "Cliente (texto)", type: "text" as const },
    { name: "vendedor", label: "Vendedor asignado", type: "text" as const },
    { name: "salesOrderId", label: "Pedido de venta", type: "text" as const },
    { name: "uuid", label: "UUID", type: "text" as const },
    { name: "pacStatus", label: "Estatus PAC", type: "text" as const },
    { name: "satStatus", label: "Estatus SAT", type: "text" as const },
    { name: "subtotal", label: "Subtotal", type: "number" as const },
    { name: "iva", label: "IVA", type: "number" as const },
    { name: "total", label: "Total", type: "number" as const },
    {
      name: "facturacionTipo",
      label: "Facturacion",
      type: "select" as const,
      options: [
        { value: "total", label: "Total" },
        { value: "parcial", label: "Parcial" },
      ],
    },
    { name: "montoFacturado", label: "Monto facturado", type: "number" as const },
    { name: "motivoCancelacion", label: "Motivo cancelacion SAT", type: "text" as const },
    { name: "uuidSustituye", label: "UUID sustituye", type: "text" as const },
    { name: "xmlUrl", label: "XML (URL)", type: "text" as const },
    { name: "pdfUrl", label: "PDF (URL)", type: "text" as const },
  ]

  const handleSave = async (values: Record<string, any>) => {
    const payload: Partial<CfdiDoc> = {
      ...values,
      subtotal: Number(values.subtotal || 0),
      iva: Number(values.iva || 0),
      total: Number(values.total || 0),
      montoFacturado: Number(values.montoFacturado || 0),
      clienteNombre:
        values.clienteNombre ||
        customers.find((c) => c.id === values.clienteId)?.name ||
        "",
    }

    if (editingItem?.id) {
      await update(editingItem.id, payload)
    } else {
      await create(payload as Omit<CfdiDoc, "id">)
    }

    setDialogOpen(false)
    setEditingItem(null)
  }

  const openNew = () => {
    setEditingItem({
      id: "",
      tipo: activeTab as CfdiDoc["tipo"],
      estatus: "borrador",
    })
    setDialogOpen(true)
  }

  const openEdit = (item: CfdiDoc) => {
    setEditingItem(item)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Facturacion CFDI</h2>
          <p className="text-sm text-muted-foreground">Gestiona facturas, notas de credito y complementos.</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo CFDI
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por UUID, cliente o pedido..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos los estatus</option>
              <option value="borrador">Borrador</option>
              <option value="aprobado">Aprobado</option>
              <option value="cancelado">Cancelado</option>
            </select>
            <select
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              value={clienteFilter}
              onChange={(e) => setClienteFilter(e.target.value)}
            >
              <option value="">Todos los clientes</option>
              {customerOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Badge variant="outline">{filteredDocs.length} resultados</Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          {tipoTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tipoTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-6 text-sm text-muted-foreground">Cargando...</div>
                ) : filteredDocs.length === 0 ? (
                  <div className="p-6 text-sm text-muted-foreground">No hay registros para este tipo.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>UUID</TableHead>
                        <TableHead>Estatus</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Vendedor</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocs.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">{doc.clienteNombre || "Sin cliente"}</TableCell>
                          <TableCell>{doc.uuid || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{statusLabels[doc.estatus] || doc.estatus}</Badge>
                          </TableCell>
                          <TableCell>
                            {(doc.total || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
                          </TableCell>
                          <TableCell>{doc.vendedor || "-"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button size="icon" variant="ghost" onClick={() => openEdit(doc)}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                onClick={() => remove(doc.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Historial por cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {clienteFilter ? (
            clientHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay historial para este cliente.</p>
            ) : (
              clientHistory.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{doc.tipo}</p>
                      <p className="text-xs text-muted-foreground">{doc.uuid || "Sin UUID"}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{statusLabels[doc.estatus] || doc.estatus}</Badge>
                </div>
              ))
            )
          ) : (
            <p className="text-sm text-muted-foreground">Selecciona un cliente para ver historial.</p>
          )}
        </CardContent>
      </Card>

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingItem?.id ? "Editar CFDI" : "Nuevo CFDI"}
        description="Registra facturas, notas de credito, cancelaciones y complementos."
        fields={fields}
        initialValues={editingItem || { tipo: activeTab, estatus: "borrador" }}
        onSubmit={handleSave}
      />
    </div>
  )
}
