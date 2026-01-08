"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wrench, Calendar, CheckCircle, AlertTriangle, Settings, FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useMaintenanceData } from "@/hooks/use-maintenance-data"
import { useWarehouseData } from "@/hooks/use-warehouse-data"
import { MaintenanceOrdersTab } from "@/components/maintenance/maintenance-orders-tab"
import { MaintenanceAssetsTab } from "@/components/maintenance/maintenance-assets-tab"
import { MaintenanceScheduleTab } from "@/components/maintenance/maintenance-schedule-tab"
import { MaintenanceHistoryTab } from "@/components/maintenance/maintenance-history-tab"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

export default function MaintenancePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("Todos")

  const { warehouses } = useWarehouseData()

  const {
    equipment,
    preventivos,
    workOrders,
    readings,
    technicians,
    createEquipment,
    updateEquipment,
    removeEquipment,
    createPreventivo,
    updatePreventivo,
    createWorkOrder,
    updateWorkOrder,
    removeWorkOrder,
    createReading,
    otsTotales,
    otsProgramadas,
    otsCompletadas,
    cumplimientoPercentage,
    otsVencidas,
    loading,
    generateAutomaticWorkOrders,
    completeWorkOrder,
    getEquipmentHistory,
  } = useMaintenanceData()

  const formatCurrency = (value: number | undefined) => {
    if (!value || isNaN(value)) return "$0.00"
    return `$${value.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatDate = (date: any) => {
    if (!date) return "-"
    const d = date instanceof Date ? date : new Date(date)
    return d.toLocaleDateString("es-MX")
  }

  const filteredEquipment = equipment.filter(
    (eq) =>
      eq.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.planta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.categoria?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mantenimiento</h1>
          <p className="text-muted-foreground mt-2">
            Gestión integral de mantenimiento preventivo y correctivo de equipos
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nueva OT
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <Wrench className="w-8 h-8 text-primary mb-4" />
            <p className="text-sm text-muted-foreground">OT's Totales</p>
            <p className="text-2xl font-bold mt-1">{otsTotales}</p>
            <p className="text-xs text-muted-foreground mt-1">Este año</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Calendar className="w-8 h-8 text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Programadas</p>
            <p className="text-2xl font-bold mt-1">{otsProgramadas}</p>
            <p className="text-xs text-muted-foreground mt-1">Próximos 30 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <CheckCircle className="w-8 h-8 text-green-500 mb-4" />
            <p className="text-sm text-muted-foreground">Completadas</p>
            <p className="text-2xl font-bold mt-1">{otsCompletadas}</p>
            <p className="text-xs text-green-600 mt-1">{cumplimientoPercentage}% cumplimiento</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <AlertTriangle className="w-8 h-8 text-yellow-500 mb-4" />
            <p className="text-sm text-muted-foreground">Vencidas</p>
            <p className="text-2xl font-bold mt-1">{otsVencidas}</p>
            <p className="text-xs text-yellow-600 mt-1">{otsVencidas > 0 ? "Requiere atención" : "Al corriente"}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ordenes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ordenes">
            <Wrench className="w-4 h-4 mr-2" />
            Órdenes de Trabajo
          </TabsTrigger>
          <TabsTrigger value="equipos">
            <Settings className="w-4 h-4 mr-2" />
            Catálogo de Equipos
          </TabsTrigger>
          <TabsTrigger value="planeacion">
            <Calendar className="w-4 h-4 mr-2" />
            Planeación
          </TabsTrigger>
          <TabsTrigger value="historial">
            <FileText className="w-4 h-4 mr-2" />
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ordenes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Órdenes de Trabajo</CardTitle>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todos">Todos los estados</SelectItem>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="programada">Programada</SelectItem>
                      <SelectItem value="en_proceso">En Proceso</SelectItem>
                      <SelectItem value="completada">Completada</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Buscar órdenes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Cargando órdenes...</div>
              ) : (
                <MaintenanceOrdersTab
                  workOrders={workOrders}
                  equipment={equipment}
                  technicians={technicians}
                  searchQuery={searchTerm}
                  statusFilter={statusFilter}
                  onCreate={createWorkOrder}
                  onUpdate={updateWorkOrder}
                  onComplete={completeWorkOrder}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipos" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Catálogo de Equipos</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Buscar equipos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Cargando equipos...</div>
              ) : (
                <MaintenanceAssetsTab
                  equipment={equipment}
                  warehouses={warehouses}
                  searchQuery={searchTerm}
                  onCreate={createEquipment}
                  onUpdate={updateEquipment}
                  onDelete={removeEquipment}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planeacion" className="space-y-4">
          <MaintenanceScheduleTab
            preventivos={preventivos}
            equipment={equipment}
            onGenerateAutomatic={generateAutomaticWorkOrders}
          />
        </TabsContent>

        <TabsContent value="historial" className="space-y-4">
          <MaintenanceHistoryTab equipment={equipment} getEquipmentHistory={getEquipmentHistory} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
