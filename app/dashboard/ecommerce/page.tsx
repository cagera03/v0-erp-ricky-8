"use client"
import { useAuth } from "@/contexts/auth-context"
import { useEcommerceData } from "@/hooks/use-ecommerce-data"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, Users, Package, TrendingUp } from "lucide-react"
import { OverviewTab } from "@/components/ecommerce/overview-tab"
import { WebCatalogTab } from "@/components/ecommerce/web-catalog-tab"
import { OnlineOrdersTab } from "@/components/ecommerce/online-orders-tab"
import { CustomerPortalTab } from "@/components/ecommerce/customer-portal-tab"
import { SettingsTab } from "@/components/ecommerce/settings-tab"

export default function ECommercePage() {
  const { user, companyId } = useAuth()
  const ecommerceData = useEcommerceData()
  const { loading } = ecommerceData

  if (loading) {
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
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No se pudo obtener el companyId. Por favor, verifica tu sesión.
            </p>
            <p className="text-xs text-center text-muted-foreground mt-2">Debug: userId={user?.uid}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = [
    {
      name: "Pedidos del Mes",
      value: ecommerceData.ordenesPendientes.toString(),
      change: "+18%",
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Clientes Activos",
      value: "156",
      change: "+12%",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      name: "Productos Publicados",
      value: ecommerceData.productosPublicados.toString(),
      change: "+5%",
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      name: "Ventas Online",
      value: `$${ecommerceData.ventasDelMes.toLocaleString()}`,
      change: "+23%",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">E-Commerce</h1>
        <p className="text-muted-foreground mt-2">Integre su compañía al comercio electrónico sin dobles capturas</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {stat.change}
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
