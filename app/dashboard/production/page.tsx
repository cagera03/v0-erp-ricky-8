"use client"

import { Suspense, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Cog, Factory, ClipboardCheck, AlertCircle, FileText, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProductionData } from "@/hooks/use-production-data"
import { useWarehouseData } from "@/hooks/use-warehouse-data"
import { ProductionOrdersTab } from "@/components/production/production-orders-tab"
import { ProductionFormulasTab } from "@/components/production/production-formulas-tab"
import { ProductionPlanningTab } from "@/components/production/production-planning-tab"
import { ProductionQualityTab } from "@/components/production/production-quality-tab"
import { ProductionResultsTab } from "@/components/production/production-results-tab"

function ProductionContent() {
  const productionData = useProductionData()
  const { warehouses, products } = useWarehouseData()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("Todos")
  const [priorityFilter, setPriorityFilter] = useState<string>("Todas")

  const formatNumber = (value: number | undefined | null): string => {
    return (value || 0).toString()
  }

  const formatPercent = (value: number | undefined | null): string => {
    return `${value || 0}%`
  }

  const handleGenerateRequisitions = async () => {
    if (confirm("¿Calcular requerimientos de materiales y generar sugerencias de requisición?")) {
      try {
        await productionData.calculateMaterialRequirements()
        alert("Requerimientos calculados exitosamente. Revise la pestaña Planeación.")
      } catch (error: any) {
        alert(error.message || "Error al calcular requerimientos")
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Producción</h1>
          <p className="text-muted-foreground mt-2">Control total de fórmulas, órdenes, materiales y calidad</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerateRequisitions}>
            <FileText className="w-4 h-4 mr-2" />
            Generar Requisición
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos, órdenes, materiales..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="in_process">En Proceso</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="on_hold">Pausado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todas">Todas</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <Cog className="w-8 h-8 text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Órdenes Activas</p>
            <p className="text-2xl font-bold mt-1">{formatNumber(productionData.ordenesActivas)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Factory className="w-8 h-8 text-primary mb-4" />
            <p className="text-sm text-muted-foreground">En Producción</p>
            <p className="text-2xl font-bold mt-1">{formatNumber(productionData.enProduccion)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <ClipboardCheck className="w-8 h-8 text-green-500 mb-4" />
            <p className="text-sm text-muted-foreground">Eficiencia Promedio</p>
            <p className="text-2xl font-bold mt-1">{formatPercent(productionData.eficienciaPromedio)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <AlertCircle className="w-8 h-8 text-yellow-500 mb-4" />
            <p className="text-sm text-muted-foreground">Materiales Faltantes</p>
            <p className="text-2xl font-bold mt-1">{formatNumber(productionData.materialesFaltantes)}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="orders">Órdenes</TabsTrigger>
          <TabsTrigger value="formulas">Fórmulas</TabsTrigger>
          <TabsTrigger value="planning">Planeación</TabsTrigger>
          <TabsTrigger value="quality">Calidad</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <ProductionOrdersTab
            orders={productionData.orders}
            products={products}
            formulas={productionData.formulas}
            warehouses={warehouses}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            onCreate={productionData.createOrder}
            onUpdate={productionData.updateOrder}
            onDelete={productionData.removeOrder}
            onReserveMaterials={productionData.reserveMaterials}
            onCompleteProduction={productionData.completeProduction}
          />
        </TabsContent>

        <TabsContent value="formulas">
          <ProductionFormulasTab
            formulas={productionData.formulas}
            searchQuery={searchQuery}
            onCreate={productionData.createFormula}
            onUpdate={productionData.updateFormula}
          />
        </TabsContent>

        <TabsContent value="planning">
          <ProductionPlanningTab
            materials={productionData.materials}
            searchQuery={searchQuery}
            onUpdate={productionData.updateMaterialPlanning}
            onGenerateRequisitions={handleGenerateRequisitions}
          />
        </TabsContent>

        <TabsContent value="quality">
          <ProductionQualityTab
            certificates={productionData.qualityCertificates}
            searchQuery={searchQuery}
            onCreate={productionData.createQualityCert}
            onUpdate={productionData.updateQualityCert}
          />
        </TabsContent>

        <TabsContent value="results">
          <ProductionResultsTab
            results={productionData.results}
            searchQuery={searchQuery}
            onCreate={productionData.createResult}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function ProductionPage() {
  return (
    <Suspense fallback={null}>
      <ProductionContent />
    </Suspense>
  )
}
