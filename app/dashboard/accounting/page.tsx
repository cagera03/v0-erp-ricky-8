"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  FileText,
  PieChart,
  BookOpen,
  Download,
  Upload,
  Search,
  FileSpreadsheet,
  BarChart3,
  Plus,
  Eye,
} from "lucide-react"
import { useAccountingData } from "@/hooks/use-accounting-data"
import { NuevaPolizaDialog } from "@/components/accounting/nueva-poliza-dialog"
import { NuevaCuentaDialog } from "@/components/accounting/nueva-cuenta-dialog"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"

export default function AccountingPage() {
  const [activeTab, setActiveTab] = useState("catalog")
  const [searchQuery, setSearchQuery] = useState("")
  const [nuevaPolizaOpen, setNuevaPolizaOpen] = useState(false)
  const [nuevaCuentaOpen, setNuevaCuentaOpen] = useState(false)

  const {
    ledgerAccounts,
    journalEntries,
    balanceGeneral,
    ingresosDelMes,
    egresosDelMes,
    polizasDelMes,
    polizasPendientes,
    loading,
    addEntry,
    addAccount,
  } = useAccountingData()

  const router = useRouter()

  const tabs = [
    { id: "catalog", label: "Catálogo de Cuentas", icon: BookOpen },
    { id: "entries", label: "Pólizas", icon: FileText },
    { id: "financial", label: "Estados Financieros", icon: BarChart3 },
    { id: "ratios", label: "Razones Financieras", icon: PieChart },
    { id: "taxes", label: "Impuestos", icon: Calculator },
    { id: "sat", label: "Contabilidad Electrónica", icon: Upload },
  ]

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return "$0.00"
    }
    return `$${value.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  function handleExportToExcel() {
    if (!ledgerAccounts || ledgerAccounts.length === 0) {
      alert("No hay cuentas para exportar")
      return
    }

    const data = ledgerAccounts.map((acc) => ({
      Código: acc.codigo,
      Nombre: acc.nombre,
      Tipo: acc.tipo,
      Nivel: acc.nivel,
      Saldo: acc.saldo,
      Movimientos: acc.movimientos,
      Estado: acc.activa ? "Activa" : "Inactiva",
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Catálogo de Cuentas")
    XLSX.writeFile(wb, `catalogo-cuentas-${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contabilidad</h1>
          <p className="text-muted-foreground mt-2">Gestión contable completa y control financiero</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportToExcel} disabled={loading}>
            <Download className="w-4 h-4 mr-2" />
            Exportar a Excel
          </Button>
          <Button onClick={() => setNuevaPolizaOpen(true)} disabled={loading}>
            <FileText className="w-4 h-4 mr-2" />
            Nueva Póliza
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Balance General</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(balanceGeneral)}</p>
                {loading && <p className="text-xs text-muted-foreground mt-1">Calculando...</p>}
              </div>
              <Calculator className="w-10 h-10 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ingresos del Mes</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(ingresosDelMes)}</p>
                {loading && <p className="text-xs text-muted-foreground mt-1">Calculando...</p>}
              </div>
              <TrendingUp className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Egresos del Mes</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(egresosDelMes)}</p>
                {loading && <p className="text-xs text-muted-foreground mt-1">Calculando...</p>}
              </div>
              <TrendingDown className="w-10 h-10 text-red-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "catalog" && (
        <CatalogTab
          ledgerAccounts={ledgerAccounts}
          loading={loading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          formatCurrency={formatCurrency}
          onNuevaCuenta={() => setNuevaCuentaOpen(true)}
        />
      )}
      {activeTab === "entries" && (
        <EntriesTab
          journalEntries={journalEntries}
          loading={loading}
          polizasDelMes={polizasDelMes}
          polizasPendientes={polizasPendientes}
          formatCurrency={formatCurrency}
          onNuevaPoliza={() => setNuevaPolizaOpen(true)}
        />
      )}
      {activeTab === "financial" && (
        <FinancialTab ledgerAccounts={ledgerAccounts} loading={loading} formatCurrency={formatCurrency} />
      )}
      {activeTab === "ratios" && <RatiosTab ledgerAccounts={ledgerAccounts} loading={loading} />}
      {activeTab === "taxes" && <TaxesTab formatCurrency={formatCurrency} />}
      {activeTab === "sat" && <SATTab />}

      {/* Dialogs */}
      <NuevaPolizaDialog
        open={nuevaPolizaOpen}
        onOpenChange={setNuevaPolizaOpen}
        onSave={addEntry}
        ledgerAccounts={ledgerAccounts.filter((acc) => acc.acumulaSaldo)}
      />

      <NuevaCuentaDialog open={nuevaCuentaOpen} onOpenChange={setNuevaCuentaOpen} onSave={addAccount} />
    </div>
  )
}

function CatalogTab({
  ledgerAccounts,
  loading,
  searchQuery,
  setSearchQuery,
  formatCurrency,
  onNuevaCuenta,
}: {
  ledgerAccounts: any[]
  loading: boolean
  searchQuery: string
  setSearchQuery: (q: string) => void
  formatCurrency: (value: number) => string
  onNuevaCuenta: () => void
}) {
  const filteredAccounts = ledgerAccounts.filter(
    (acc) =>
      acc.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.nombre.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Catálogo de Cuentas Contables</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => alert("Vista de presupuestos en desarrollo...")}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Ver Presupuestos
              </Button>
              <Button variant="outline" size="sm" onClick={() => alert("Vista de gráficas en desarrollo...")}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Ver Gráficas
              </Button>
              <Button size="sm" onClick={onNuevaCuenta}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Cuenta
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cuenta por código o nombre..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Cargando cuentas...</div>
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                {searchQuery ? "No se encontraron cuentas" : "Aún no hay cuentas registradas"}
              </h3>
              {!searchQuery && (
                <>
                  <p className="text-muted-foreground mb-4">Comienza agregando tu primera cuenta contable</p>
                  <Button onClick={onNuevaCuenta}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Cuenta
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Código</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Nombre</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Tipo</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Saldo</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Movimientos</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map((account) => (
                    <tr key={account.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-2 text-sm font-mono font-medium">{account.codigo}</td>
                      <td className="py-3 px-2 text-sm" style={{ paddingLeft: `${account.nivel * 12}px` }}>
                        <span
                          className={account.nivel === 1 ? "font-bold" : account.nivel === 2 ? "font-semibold" : ""}
                        >
                          {account.nombre}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm">
                        <Badge variant="outline">{account.tipo}</Badge>
                      </td>
                      <td className="py-3 px-2 text-sm font-semibold text-right">{formatCurrency(account.saldo)}</td>
                      <td className="py-3 px-2 text-sm text-center text-muted-foreground">
                        {account.movimientos || 0}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Button variant="ghost" size="sm" onClick={() => alert(`Detalle de cuenta en desarrollo...`)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function EntriesTab({
  journalEntries,
  loading,
  polizasDelMes,
  polizasPendientes,
  formatCurrency,
  onNuevaPoliza,
}: {
  journalEntries: any[]
  loading: boolean
  polizasDelMes: number
  polizasPendientes: number
  formatCurrency: (value: number) => string
  onNuevaPoliza: () => void
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [tipoFilter, setTipoFilter] = useState("all")
  const [estadoFilter, setEstadoFilter] = useState("all")

  const filteredEntries = journalEntries.filter((entry) => {
    const matchesSearch =
      entry.folio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.concepto.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTipo = tipoFilter === "all" || entry.tipo === tipoFilter
    const matchesEstado = estadoFilter === "all" || entry.estado === estadoFilter
    return matchesSearch && matchesTipo && matchesEstado
  })

  const formatDate = (date: any) => {
    if (!date) return "Sin fecha"
    const d = date instanceof Date ? date : new Date(date)
    return d.toLocaleDateString("es-MX")
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pólizas del Mes</p>
            <p className="text-2xl font-bold mt-1">{polizasDelMes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pendientes de Autorizar</p>
            <p className="text-2xl font-bold mt-1">{polizasPendientes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Plantillas Disponibles</p>
            <p className="text-2xl font-bold mt-1">0</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pólizas Contables</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => alert("Importar desde Excel en desarrollo...")}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Importar desde Excel
              </Button>
              <Button size="sm" onClick={onNuevaPoliza}>
                <FileText className="w-4 h-4 mr-2" />
                Nueva Póliza
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por folio o descripción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">Todos los tipos</option>
                <option value="Diario">Diario</option>
                <option value="Ingresos">Ingresos</option>
                <option value="Egresos">Egresos</option>
                <option value="Ajuste">Ajuste</option>
              </select>
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">Todos los estados</option>
                <option value="autorizada">Autorizada</option>
                <option value="borrador">Borrador</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Cargando pólizas...</div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold text-lg mb-2">
                  {searchQuery || tipoFilter !== "all" || estadoFilter !== "all"
                    ? "No se encontraron pólizas"
                    : "Aún no hay pólizas registradas"}
                </h3>
                {!searchQuery && tipoFilter === "all" && estadoFilter === "all" && (
                  <>
                    <p className="text-muted-foreground mb-4">Comienza registrando tu primera póliza contable</p>
                    <Button onClick={onNuevaPoliza}>
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva Póliza
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Folio</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Fecha</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Tipo</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Descripción</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Estado</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Total</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((entry) => (
                      <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-2 text-sm font-mono font-medium">{entry.folio}</td>
                        <td className="py-3 px-2 text-sm">{formatDate(entry.fecha)}</td>
                        <td className="py-3 px-2 text-sm">
                          <Badge variant="outline">{entry.tipo}</Badge>
                        </td>
                        <td className="py-3 px-2 text-sm max-w-xs truncate">{entry.concepto}</td>
                        <td className="py-3 px-2 text-sm">
                          <Badge
                            variant={
                              entry.estado === "autorizada"
                                ? "default"
                                : entry.estado === "cancelada"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {entry.estado === "autorizada"
                              ? "Autorizada"
                              : entry.estado === "cancelada"
                                ? "Cancelada"
                                : "Borrador"}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-sm font-semibold text-right">
                          {formatCurrency(entry.totalCargos || entry.totalAbonos || 0)}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <Button variant="ghost" size="sm" onClick={() => alert(`Detalle de póliza en desarrollo...`)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function FinancialTab({
  ledgerAccounts,
  loading,
  formatCurrency,
}: {
  ledgerAccounts: any[]
  loading: boolean
  formatCurrency: (value: number) => string
}) {
  const activoCuentas = ledgerAccounts.filter((acc) => acc.tipo === "Activo" && acc.acumulaSaldo)
  const pasivoCuentas = ledgerAccounts.filter((acc) => acc.tipo === "Pasivo" && acc.acumulaSaldo)
  const capitalCuentas = ledgerAccounts.filter((acc) => acc.tipo === "Capital" && acc.acumulaSaldo)
  const ingresosCuentas = ledgerAccounts.filter((acc) => acc.tipo === "Ingresos" && acc.acumulaSaldo)
  const egresosCuentas = ledgerAccounts.filter((acc) => acc.tipo === "Egresos" && acc.acumulaSaldo)
  const costosCuentas = ledgerAccounts.filter((acc) => acc.tipo === "Costos" && acc.acumulaSaldo)

  const totalActivo = activoCuentas.reduce((sum, acc) => sum + (acc.saldo || 0), 0)
  const totalPasivo = pasivoCuentas.reduce((sum, acc) => sum + (acc.saldo || 0), 0)
  const totalCapital = capitalCuentas.reduce((sum, acc) => sum + (acc.saldo || 0), 0)
  const totalIngresos = ingresosCuentas.reduce((sum, acc) => sum + (acc.saldo || 0), 0)
  const totalCostos = costosCuentas.reduce((sum, acc) => sum + (acc.saldo || 0), 0)
  const totalEgresos = egresosCuentas.reduce((sum, acc) => sum + (acc.saldo || 0), 0)

  const utilidadBruta = totalIngresos - totalCostos
  const utilidadNeta = utilidadBruta - totalEgresos

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Calculando estados financieros...</p>
      </div>
    )
  }

  if (ledgerAccounts.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="font-semibold text-lg mb-2">No hay datos para mostrar</h3>
        <p className="text-muted-foreground">Configura tu catálogo de cuentas para ver los estados financieros</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Estado de Resultados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-semibold">Ingresos</span>
                <span className="font-bold text-green-600">{formatCurrency(totalIngresos)}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-semibold">Costo de Ventas</span>
                <span className="font-bold text-red-600">{formatCurrency(totalCostos)}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b bg-muted/50">
                <span className="font-semibold">Utilidad Bruta</span>
                <span className="font-bold">{formatCurrency(utilidadBruta)}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-semibold">Gastos de Operación</span>
                <span className="font-bold text-red-600">{formatCurrency(totalEgresos)}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b bg-primary/10">
                <span className="font-bold">Utilidad Neta</span>
                <span className="font-bold text-primary text-lg">{formatCurrency(utilidadNeta)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Balance General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-semibold">ACTIVO</span>
                <span className="font-bold">{formatCurrency(totalActivo)}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-semibold">PASIVO</span>
                <span className="font-bold">{formatCurrency(totalPasivo)}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-semibold">CAPITAL</span>
                <span className="font-bold">{formatCurrency(totalCapital)}</span>
              </div>

              <div className="flex justify-between items-center py-2 bg-muted/50 rounded">
                <span className="font-bold">PASIVO + CAPITAL</span>
                <span className="font-bold">{formatCurrency(totalPasivo + totalCapital)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Opciones de Visualización</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="justify-start bg-transparent"
              onClick={() => alert("Estados a 12 meses en desarrollo...")}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Estados a 12 Meses
            </Button>
            <Button
              variant="outline"
              className="justify-start bg-transparent"
              onClick={() => alert("Por unidad de negocio en desarrollo...")}
            >
              <Calculator className="w-4 h-4 mr-2" />
              Por Unidad de Negocio
            </Button>
            <Button
              variant="outline"
              className="justify-start bg-transparent"
              onClick={() => alert("Comparativo vs período en desarrollo...")}
            >
              <PieChart className="w-4 h-4 mr-2" />
              Comparativo vs Período
            </Button>
            <Button
              variant="outline"
              className="justify-start bg-transparent"
              onClick={() => alert("vs Presupuestado en desarrollo...")}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              vs Presupuestado
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function RatiosTab({ ledgerAccounts, loading }: { ledgerAccounts: any[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Calculando razones financieras...</p>
      </div>
    )
  }

  if (ledgerAccounts.length === 0) {
    return (
      <div className="text-center py-12">
        <PieChart className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="font-semibold text-lg mb-2">No hay datos para calcular razones</h3>
        <p className="text-muted-foreground">Configura tu catálogo de cuentas para ver las razones financieras</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Razones Financieras</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Cálculo automático de razones financieras en desarrollo...</p>
            <p className="text-sm mt-2">Se calcularán automáticamente con base en los datos del catálogo de cuentas</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TaxesTab({ formatCurrency }: { formatCurrency: (value: number) => string }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">IVA Trasladado</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">IVA Acreditable</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">IVA por Pagar</p>
            <p className="text-2xl font-bold mt-1 text-red-600">{formatCurrency(0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">IEPS del Período</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(0)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cálculo Automático de Impuestos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Los impuestos se calcularán automáticamente desde las facturas y transacciones registradas</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SATTab() {
  return (
    <div className="space-y-4">
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Upload className="w-8 h-8 text-primary flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg">Contabilidad Electrónica</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Genera fácilmente todos los archivos XML requeridos por el SAT para cumplir con la obligación de
                contabilidad electrónica. Los archivos se generan automáticamente desde los movimientos contables del
                sistema.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Archivos XML para el SAT</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Generación de archivos XML para SAT en desarrollo...</p>
            <p className="text-sm mt-2">Se generarán automáticamente desde el catálogo de cuentas y pólizas</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
