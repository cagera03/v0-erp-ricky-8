"use client"

import { useState } from "react"
import { useData } from "@/hooks/use-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormDialog } from "@/components/ui/form-dialog"
import {
  ShoppingCart,
  Users,
  Package,
  CreditCard,
  Truck,
  FileText,
  MessageSquare,
  Globe,
  CheckCircle2,
  Search,
  Eye,
  TrendingUp,
  Download,
} from "lucide-react"

const tabs = [
  { id: "overview", label: "Resumen General" },
  { id: "catalog", label: "Catálogo Web" },
  { id: "orders", label: "Pedidos Online" },
  { id: "customers", label: "Portal de Clientes" },
  { id: "features", label: "Características" },
]

const stats = [
  {
    name: "Pedidos del Mes",
    value: "234",
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
    value: "489",
    change: "+5%",
    icon: Package,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    name: "Ventas Online",
    value: "$127,450",
    change: "+23%",
    icon: TrendingUp,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
]

const features = [
  {
    icon: Users,
    title: "Acceso para Clientes",
    description: "Sistema de usuario y contraseña para cada cliente con portal personalizado",
  },
  {
    icon: Package,
    title: "Catálogo con Imágenes",
    description: "Despliegue productos con imágenes clasificados en 3 niveles de navegación gráfica",
  },
  {
    icon: FileText,
    title: "Auto-factura",
    description: "Los clientes pueden generar sus propias facturas con folio, fecha y monto",
  },
  {
    icon: Globe,
    title: "Inventario en Tiempo Real",
    description: "Muestre disponibilidad de productos actualizada desde el ERP",
  },
  {
    icon: ShoppingCart,
    title: "Pre-pedidos y Pedidos",
    description: "Reciba órdenes de clientes actuales o nuevos prospectos directamente",
  },
  {
    icon: CreditCard,
    title: "Pagos en Línea",
    description: "Integración con PayPal y PayU para cobro automático de pedidos",
  },
  {
    icon: Truck,
    title: "Cotización de Envío",
    description: "Cotización automática con Estafeta y otras empresas de mensajería",
  },
  {
    icon: FileText,
    title: "Portal de Información",
    description: "Estado de cuenta, historial de compras y seguimiento de pedidos",
  },
  {
    icon: Download,
    title: "Descarga de Documentos",
    description: "Facturas electrónicas, complementos de pago y guías de embarque",
  },
  {
    icon: MessageSquare,
    title: "Conversaciones",
    description: "Canal de comunicación directa con clientes desde el módulo",
  },
]

const initialProducts = [
  {
    id: "PROD-001",
    name: "Producto Premium A",
    category: "Categoría 1",
    sku: "PRD-001-A",
    price: 1250.0,
    stock: 45,
    published: true,
    views: 1234,
  },
  {
    id: "PROD-002",
    name: "Producto B",
    category: "Categoría 2",
    sku: "PRD-002-B",
    price: 850.0,
    stock: 32,
    published: true,
    views: 189,
  },
  {
    id: "PROD-003",
    name: "Producto C",
    category: "Categoría 3",
    sku: "PRD-003-C",
    price: 320.0,
    stock: 78,
    published: true,
    views: 156,
  },
  {
    id: "PROD-004",
    name: "Producto D",
    category: "Categoría 4",
    sku: "PRD-004-D",
    price: 1890.0,
    stock: 12,
    published: false,
    views: 98,
  },
]

const onlineOrders = [
  {
    id: "WEB-001",
    customer: "Empresas Global S.A.",
    products: 5,
    amount: 2850.0,
    status: "pending",
    date: "2024-01-15 14:30",
    payment: "PayPal",
  },
  {
    id: "WEB-002",
    customer: "Distribuidora Norte",
    products: 3,
    amount: 1520.0,
    status: "paid",
    date: "2024-01-15 13:15",
    payment: "PayU",
  },
  {
    id: "WEB-003",
    customer: "Comercial del Sur",
    products: 8,
    amount: 4230.0,
    status: "processing",
    date: "2024-01-15 11:45",
    payment: "Transferencia",
  },
  {
    id: "WEB-004",
    customer: "Minorista Central",
    products: 2,
    amount: 890.0,
    status: "shipped",
    date: "2024-01-15 10:20",
    payment: "PayPal",
  },
  {
    id: "WEB-005",
    customer: "Grupo Comercial XYZ",
    products: 6,
    amount: 3640.0,
    status: "delivered",
    date: "2024-01-14 16:00",
    payment: "PayU",
  },
]

const statusConfig = {
  pending: { label: "Pendiente", variant: "secondary" as const },
  paid: { label: "Pagado", variant: "default" as const },
  processing: { label: "Procesando", variant: "default" as const },
  shipped: { label: "Enviado", variant: "outline" as const },
  delivered: { label: "Entregado", variant: "outline" as const },
}

export default function ECommercePage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const {
    items: products,
    addItem: addProduct,
    updateItem: updateProduct,
    deleteItem: deleteProduct,
  } = useData("ecommerce-products", initialProducts)
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">E-Commerce</h1>
        <p className="text-muted-foreground mt-2">Integre su compañía al comercio electrónico sin dobles capturas</p>
      </div>

      <div className="flex gap-2 border-b overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
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

          <Card>
            <CardHeader>
              <CardTitle>Pedidos Recientes Online</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">ID</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Cliente</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Productos</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Monto</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Estado</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Método Pago</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {onlineOrders.map((order) => (
                      <tr key={order.id} className="border-b last:border-0">
                        <td className="py-3 px-2 text-sm font-medium">{order.id}</td>
                        <td className="py-3 px-2 text-sm">{order.customer}</td>
                        <td className="py-3 px-2 text-sm">{order.products} items</td>
                        <td className="py-3 px-2 text-sm font-medium">${order.amount.toLocaleString()}</td>
                        <td className="py-3 px-2">
                          <Badge variant={statusConfig[order.status as keyof typeof statusConfig].variant}>
                            {statusConfig[order.status as keyof typeof statusConfig].label}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-sm">{order.payment}</td>
                        <td className="py-3 px-2 text-right">
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "catalog" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Catálogo de Productos Web</CardTitle>
                <Button
                  onClick={() => {
                    setEditingProduct(null)
                    setIsProductDialogOpen(true)
                  }}
                >
                  <Package className="w-4 h-4 mr-2" />
                  Agregar Producto
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar productos en el catálogo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">ID</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Producto</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Categoría</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Precio</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Stock</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Vistas</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Estado</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b last:border-0">
                        <td className="py-3 px-2 text-sm font-medium">{product.id}</td>
                        <td className="py-3 px-2 text-sm font-medium">{product.name}</td>
                        <td className="py-3 px-2 text-sm text-muted-foreground">{product.category}</td>
                        <td className="py-3 px-2 text-sm font-medium">${product.price.toLocaleString()}</td>
                        <td className="py-3 px-2 text-sm">{product.stock} unidades</td>
                        <td className="py-3 px-2 text-sm">{product.views}</td>
                        <td className="py-3 px-2">
                          <Badge variant={product.published ? "default" : "secondary"}>
                            {product.published ? "Publicado" : "Borrador"}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingProduct(product)
                              setIsProductDialogOpen(true)
                            }}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm(`¿Eliminar producto ${product.name}?`)) {
                                deleteProduct(product.id)
                              }
                            }}
                          >
                            Eliminar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Navegación de 3 Niveles:</strong> Los productos se organizan automáticamente en categorías,
                  subcategorías y productos para facilitar la búsqueda a sus clientes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pre-pedidos</p>
                    <p className="text-2xl font-bold">42</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pedidos Confirmados</p>
                    <p className="text-2xl font-bold">187</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pagos Procesados</p>
                    <p className="text-2xl font-bold">$127,450</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Gestión de Pedidos Online</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Pedido</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Cliente</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Fecha</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Items</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Total</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Pago</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {onlineOrders.map((order) => (
                      <tr key={order.id} className="border-b last:border-0">
                        <td className="py-3 px-2 text-sm font-medium">{order.id}</td>
                        <td className="py-3 px-2 text-sm">{order.customer}</td>
                        <td className="py-3 px-2 text-sm text-muted-foreground">{order.date}</td>
                        <td className="py-3 px-2 text-sm">{order.products}</td>
                        <td className="py-3 px-2 text-sm font-medium">${order.amount.toLocaleString()}</td>
                        <td className="py-3 px-2 text-sm">{order.payment}</td>
                        <td className="py-3 px-2">
                          <Badge variant={statusConfig[order.status as keyof typeof statusConfig].variant}>
                            {statusConfig[order.status as keyof typeof statusConfig].label}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Cotización de Envío Automática</p>
                    <p className="text-sm text-blue-700 mt-1">
                      El sistema cotiza automáticamente con Estafeta y otras mensajerías el costo de envío para cada
                      pedido.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "customers" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Portal de Clientes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold">Acceso Seguro</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Cada cliente recibe usuario y contraseña personalizada para acceder a su portal exclusivo.
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold">Auto-factura</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Los clientes pueden generar sus propias facturas capturando folio, fecha y monto de su ticket.
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold">Historial de Compras</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Acceso completo al historial de compras con detalles de productos y fechas de entrega.
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="font-semibold">Estado de Cuenta</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Consulta de estado de cuenta actualizado con saldos y pagos recibidos en tiempo real.
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-red-600" />
                    </div>
                    <h3 className="font-semibold">Seguimiento de Pedidos</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Seguimiento en tiempo real del estado de pedidos, remisiones y facturas con guías de embarque.
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <Download className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold">Descarga de Documentos</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Descarga de facturas electrónicas (CFDI), complementos de pago y cualquier otro documento.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Módulo de Conversaciones</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Canal de comunicación directa con sus clientes disponible desde el portal E-Commerce para atender
                      dudas y solicitudes.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "features" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Características del Módulo E-Commerce</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {features.map((feature, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Integración Perfecta</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      El módulo E-Commerce se integra completamente con su ERP eliminando dobles capturas y retrabajos.
                      Todo se sincroniza en tiempo real: inventario, precios, clientes y pedidos.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Sin dobles capturas</Badge>
                      <Badge variant="outline">Sincronización automática</Badge>
                      <Badge variant="outline">Integración completa</Badge>
                      <Badge variant="outline">Tiempo real</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Embebido en su Portal:</strong> El módulo web eCommerce puede quedar integrado dentro de un
                  marco de su portal de Internet corporativo manteniendo su imagen de marca.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <FormDialog
        open={isProductDialogOpen}
        onOpenChange={setIsProductDialogOpen}
        title={editingProduct ? "Editar Producto" : "Nuevo Producto"}
        fields={[
          { name: "name", label: "Nombre del Producto", type: "text", required: true },
          { name: "category", label: "Categoría", type: "text", required: true },
          { name: "sku", label: "SKU", type: "text", required: true },
          { name: "price", label: "Precio", type: "number", required: true },
          { name: "stock", label: "Stock", type: "number", required: true },
        ]}
        initialData={editingProduct}
        onSubmit={(data) => {
          if (editingProduct) {
            updateProduct(editingProduct.id, data)
          } else {
            addProduct({
              ...data,
              id: `PROD-${String(products.length + 1).padStart(3, "0")}`,
              published: false,
              views: 0,
            })
          }
          setIsProductDialogOpen(false)
        }}
      />
    </div>
  )
}
