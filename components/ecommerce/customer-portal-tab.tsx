"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Globe, ShoppingCart, CreditCard, Truck, Download, MessageSquare } from "lucide-react"

const features = [
  {
    icon: Users,
    title: "Acceso para Clientes",
    description: "Sistema de usuario y contraseña para cada cliente con portal personalizado",
  },
  {
    icon: Globe,
    title: "Catálogo con Imágenes",
    description: "Despliegue productos con imágenes clasificados en 3 niveles de navegación gráfica",
  },
  {
    icon: FileText,
    title: "Auto-factura",
    description: "Los clientes pueden generar sus propias facturas con folio, fecha y monto",
  },
  {
    icon: ShoppingCart,
    title: "Inventario en Tiempo Real",
    description: "Muestre disponibilidad de productos actualizada desde el ERP",
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

export function CustomerPortalTab({ data }: { data: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Portal de Clientes - Características</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
