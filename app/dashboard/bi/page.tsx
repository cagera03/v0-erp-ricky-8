"use client"

import { useState } from "react"
import { useData } from "@/hooks/use-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FormDialog } from "@/components/ui/form-dialog"
import {
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  Download,
  Plus,
  Search,
  Grid3x3,
  List,
  Map,
  Mail,
  Calendar,
  Filter,
  Settings2,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bar,
  BarChart,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const dashboardStats = [
  { name: "Consultas Activas", value: "24", icon: BarChart3, trend: "+6" },
  { name: "Tableros Creados", value: "8", icon: Grid3x3, trend: "+2" },
  { name: "Reportes Programados", value: "12", icon: Calendar, trend: "+3" },
  { name: "Exportaciones", value: "156", icon: Download, trend: "+45" },
]

const initialQueries = [
  {
    id: "QRY-001",
    name: "Ventas por Producto",
    type: "Tabla",
    category: "Ventas",
    lastRun: "15/12/2024",
    scheduled: true,
  },
  {
    id: 1,
    name: "Ventas por Región",
    type: "Gráfico de Barras",
    category: "Ventas",
    lastRun: "2024-01-15 10:30",
    scheduled: true,
  },
  {
    id: 2,
    name: "Top 10 Clientes",
    type: "Tabla Multinivel",
    category: "Cobranza",
    lastRun: "2024-01-15 09:15",
    scheduled: false,
  },
  {
    id: 3,
    name: "Análisis de Inventario",
    type: "Gráfico Circular",
    category: "Almacén",
    lastRun: "2024-01-14 18:45",
    scheduled: true,
  },
  {
    id: 4,
    name: "Flujo de Efectivo",
    type: "Línea de Tendencia",
    category: "Bancos",
    lastRun: "2024-01-15 08:00",
    scheduled: true,
  },
  {
    id: 5,
    name: "Cuentas por Cobrar",
    type: "Tabla Simple",
    category: "CxC",
    lastRun: "2024-01-15 07:30",
    scheduled: false,
  },
  {
    id: 6,
    name: "Razones Financieras",
    type: "Comparativo",
    category: "Contabilidad",
    lastRun: "2024-01-14 16:20",
    scheduled: true,
  },
]

const salesByRegionData = [
  { region: "Norte", ventas: 45000, meta: 40000 },
  { region: "Sur", ventas: 38000, meta: 35000 },
  { region: "Este", ventas: 52000, meta: 48000 },
  { region: "Oeste", ventas: 41000, meta: 42000 },
  { region: "Centro", ventas: 65000, meta: 60000 },
]

const productMixData = [
  { name: "Producto A", value: 35, color: "#8b5cf6" },
  { name: "Producto B", value: 25, color: "#6366f1" },
  { name: "Producto C", value: 20, color: "#3b82f6" },
  { name: "Producto D", value: 12, color: "#0ea5e9" },
  { name: "Otros", value: 8, color: "#06b6d4" },
]

const trendData = [
  { mes: "Jul", actual: 42000, proyectado: 40000 },
  { mes: "Ago", actual: 45000, proyectado: 43000 },
  { mes: "Sep", actual: 48000, proyectado: 46000 },
  { mes: "Oct", actual: 51000, proyectado: 49000 },
  { mes: "Nov", actual: 54000, proyectado: 52000 },
  { mes: "Dic", actual: 58000, proyectado: 55000 },
]

const dataModules = [
  { name: "Ventas", description: "Documentos, clientes, productos vendidos", icon: TrendingUp },
  { name: "Cobranza", description: "CxC, pagos, saldos por cliente", icon: BarChart3 },
  { name: "Compras", description: "Órdenes, proveedores, CxP", icon: BarChart3 },
  { name: "Almacén", description: "Existencias, movimientos, costos", icon: BarChart3 },
  { name: "Bancos", description: "Saldos, movimientos, flujo de efectivo", icon: BarChart3 },
  { name: "Contabilidad", description: "Ingresos, egresos, razones financieras", icon: BarChart3 },
]

export default function BusinessIntelligencePage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchQuery, setSearchQuery] = useState("")
  const {
    items: savedQueries,
    addItem: addQuery,
    updateItem: updateQuery,
    deleteItem: deleteQuery,
  } = useData("bi-queries", initialQueries)
  const [isQueryDialogOpen, setIsQueryDialogOpen] = useState(false)
  const [editingQuery, setEditingQuery] = useState<any>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Business Intelligence</h1>
          <p className="text-muted-foreground mt-2">
            Analice su información con consultas personalizadas, tableros y reportes automáticos
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditingQuery(null)
            setIsQueryDialogOpen(true)
          }}
        >
          <Plus className="w-4 h-4" />
          Nueva Consulta
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <Badge variant="secondary" className="gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.trend}
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">{stat.name}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="dashboard">
            <Grid3x3 className="w-4 h-4 mr-2" />
            Tablero
          </TabsTrigger>
          <TabsTrigger value="queries">
            <List className="w-4 h-4 mr-2" />
            Consultas
          </TabsTrigger>
          <TabsTrigger value="wizard">
            <Settings2 className="w-4 h-4 mr-2" />
            Asistente
          </TabsTrigger>
          <TabsTrigger value="maps">
            <Map className="w-4 h-4 mr-2" />
            Mapas
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            <Calendar className="w-4 h-4 mr-2" />
            Programados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Ventas por Región vs Meta
                  <Button variant="ghost" size="icon">
                    <Download className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    ventas: { label: "Ventas", color: "hsl(var(--primary))" },
                    meta: { label: "Meta", color: "hsl(var(--muted-foreground))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesByRegionData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="region" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="ventas" fill="var(--color-ventas)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="meta" fill="var(--color-meta)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Mix de Productos
                  <Button variant="ghost" size="icon">
                    <Download className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: { label: "Porcentaje", color: "hsl(var(--primary))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={productMixData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry) => `${entry.name}: ${entry.value}%`}
                      >
                        {productMixData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Tendencia de Ventas: Real vs Proyectado
                  <Button variant="ghost" size="icon">
                    <Download className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    actual: { label: "Real", color: "hsl(var(--primary))" },
                    proyectado: { label: "Proyectado", color: "hsl(var(--muted-foreground))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="mes" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="var(--color-actual)"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="proyectado"
                        stroke="var(--color-proyectado)"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 4 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="queries" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Mis Consultas Guardadas</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar consultas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {savedQueries.map((query) => (
                  <div
                    key={query.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{query.name}</h4>
                          {query.scheduled && (
                            <Badge variant="secondary" className="gap-1">
                              <Calendar className="w-3 h-3" />
                              Programado
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{query.type}</span>
                          <span>•</span>
                          <span>{query.category}</span>
                          <span>•</span>
                          <span>Última ejecución: {query.lastRun}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => alert(`Ejecutando: ${query.name}`)}>
                        Ejecutar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => alert(`Descargando: ${query.name}`)}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingQuery(query)
                          setIsQueryDialogOpen(true)
                        }}
                      >
                        <Settings2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`¿Eliminar consulta ${query.name}?`)) {
                            deleteQuery(query.id)
                          }
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wizard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Asistente de Consultas</CardTitle>
              <p className="text-sm text-muted-foreground">
                Cree fácilmente sus consultas personalizadas con el asistente paso a paso
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">1. Seleccione la fuente de datos</h3>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {dataModules.map((module) => (
                    <button
                      key={module.name}
                      className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <module.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{module.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{module.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">2. Configure los niveles de consulta</h3>
                <div className="p-6 rounded-lg border bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground">Seleccione una fuente de datos para continuar</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">3. Defina visualización</h3>
                <div className="grid gap-3 md:grid-cols-4">
                  <button className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors text-center">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Barras</p>
                  </button>
                  <button className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors text-center">
                    <PieChart className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Circular</p>
                  </button>
                  <button className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors text-center">
                    <LineChart className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Líneas</p>
                  </button>
                  <button className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors text-center">
                    <List className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Tabla</p>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visualización Geográfica</CardTitle>
              <p className="text-sm text-muted-foreground">
                Visualice sus datos en mapas geográficos según la ubicación de clientes o proveedores
              </p>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg border bg-muted/50 flex items-center justify-center">
                <div className="text-center">
                  <Map className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Vista de mapa interactivo</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Muestre sus consultas como puntos o mapas de calor
                  </p>
                  <Button className="mt-4">Configurar Vista de Mapa</Button>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 mt-6">
                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold text-sm mb-2">Ventas por Estado</h4>
                  <p className="text-xs text-muted-foreground mb-3">Mapa de calor de ventas</p>
                  <div className="flex items-center justify-between">
                    <Badge>Activo</Badge>
                    <Button variant="ghost" size="sm">
                      Ver Mapa
                    </Button>
                  </div>
                </div>
                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold text-sm mb-2">Clientes Potenciales</h4>
                  <p className="text-xs text-muted-foreground mb-3">Puntos geográficos</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">Inactivo</Badge>
                    <Button variant="ghost" size="sm">
                      Ver Mapa
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reportes Programados</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure el envío automático de consultas y tableros por correo electrónico
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {savedQueries
                  .filter((q) => q.scheduled)
                  .map((query) => (
                    <div key={query.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Mail className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{query.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">Diario a las 8:00 AM • Formato: PDF</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>Activo</Badge>
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
              <Button
                className="w-full mt-4 bg-transparent"
                variant="outline"
                onClick={() => {
                  setEditingQuery(null)
                  setIsQueryDialogOpen(true)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Programar Nuevo Reporte
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <FormDialog
        open={isQueryDialogOpen}
        onOpenChange={setIsQueryDialogOpen}
        title={editingQuery ? "Editar Consulta" : "Nueva Consulta"}
        fields={[
          { name: "name", label: "Nombre de la Consulta", type: "text", required: true },
          { name: "type", label: "Tipo", type: "text", required: true },
          { name: "category", label: "Categoría", type: "text", required: true },
        ]}
        initialData={editingQuery}
        onSubmit={(data) => {
          if (editingQuery) {
            updateQuery(editingQuery.id, data)
          } else {
            addQuery({
              ...data,
              id: `QRY-${String(savedQueries.length + 1).padStart(3, "0")}`,
              lastRun: new Date().toLocaleDateString(),
              scheduled: false,
            })
          }
          setIsQueryDialogOpen(false)
        }}
      />
    </div>
  )
}
