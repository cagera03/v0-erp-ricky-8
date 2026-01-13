"use client"
import { useAuth } from "@/contexts/auth-context"
import { useEcommerceData } from "@/hooks/use-ecommerce-data"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, Users, Package, TrendingUp } from "lucide-react"
import { OverviewTab } from "@/components/ecommerce/overview-tab"
import { WebCatalogTab } from "@/components/ecommerce/web-catalog-tab"
import { OnlineOrdersTab } from "@/components/ecommerce/online-orders-tab"
import { CustomerPortalTab } from "@/components/ecommerce/customer-portal-tab"
import { SettingsTab } from "@/components/ecommerce/settings-tab"

export default function ECommercePage() {
  const { user, companyId, loading: authLoading } = useAuth()
  const ecommerceData = useEcommerceData(companyId)
  const { loading } = ecommerceData

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!companyId) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="max-w-md">
          <CardContent className="pt-6 space-y-4">
            <p className="text-center text-muted-foreground">No se pudo obtener la información de la empresa.</p>
            <p className="text-xs text-center text-muted-foreground">
              Debug: userId={user?.uid || "none"}, companyId={companyId || "none"}
            </p>
            <div className="text-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Recargar Página
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = [
    {
      name: "Pedidos del Mes",
      value: ecommerceData.ordenesPendientes,
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Clientes Activos",
      value: ecommerceData.clientesActivos,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      name: "Productos Publicados",
      value: ecommerceData.productosPublicados,
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      name: "Ventas Online",
      value: `$${ecommerceData.ventasDelMes.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  return (
    <div className="space-y-6">
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">{stat.name}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Resumen General</TabsTrigger>
          <TabsTrigger value="catalog">Catálogo Web</TabsTrigger>
          <TabsTrigger value="orders">Pedidos Online</TabsTrigger>
          <TabsTrigger value="customers">Portal de Clientes</TabsTrigger>
          <TabsTrigger value="settings">Características</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab data={ecommerceData} />
        </TabsContent>

        <TabsContent value="catalog">
          <WebCatalogTab data={ecommerceData} />
        </TabsContent>

        <TabsContent value="orders">
          <OnlineOrdersTab data={ecommerceData} />
        </TabsContent>

        <TabsContent value="customers">
          <CustomerPortalTab data={ecommerceData} />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab data={ecommerceData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
