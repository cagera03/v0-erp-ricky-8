"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Users, UserCheck, DollarSign, FileText } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCRMData } from "@/hooks/use-crm-data"
import { ClientsTab } from "@/components/crm/clients-tab"
import { LeadsTab } from "@/components/crm/leads-tab"
import { DocumentsTab } from "@/components/crm/documents-tab"
import { StatsTab } from "@/components/crm/stats-tab"
import { CFDITab } from "@/components/crm/cfdi-tab"
import { CobranzaTab } from "@/components/crm/cobranza-tab"

export default function ClientsPage() {
  const { totalClientes, clientesActivos, porCobrar, documentosDelMes, loading } = useCRMData()
  const [selectedTab, setSelectedTab] = useState("clients")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Clientes / CRM</h1>
        <p className="text-muted-foreground mt-2">Gestión integral de clientes, ventas y documentos fiscales</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground mt-4">Total Clientes</p>
            <p className="text-2xl font-bold mt-1">{loading ? "..." : totalClientes}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground mt-4">Clientes Activos</p>
            <p className="text-2xl font-bold mt-1">{loading ? "..." : clientesActivos}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground mt-4">Por Cobrar</p>
            <p className="text-2xl font-bold mt-1">
              {loading ? "..." : `$${porCobrar.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground mt-4">Docs del Mes</p>
            <p className="text-2xl font-bold mt-1">{loading ? "..." : documentosDelMes}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="leads">CRM / Prospectos</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          <TabsTrigger value="cfdi">CFDI</TabsTrigger>
          <TabsTrigger value="cobranza">Cobranza</TabsTrigger>
        </TabsList>

        <TabsContent value="clients">
          <ClientsTab />
        </TabsContent>

        <TabsContent value="leads">
          <LeadsTab />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentsTab />
        </TabsContent>

        <TabsContent value="stats">
          <StatsTab />
        </TabsContent>

        <TabsContent value="cfdi">
          <CFDITab />
        </TabsContent>

        <TabsContent value="cobranza">
          <CobranzaTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
