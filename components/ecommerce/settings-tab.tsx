"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

const capabilities = [
  "Pre-pedidos y pedidos confirmados de clientes actuales o nuevos prospectos",
  "Sincronización automática con inventario y catálogo del ERP",
  "Portal personalizado para cada cliente con usuario y contraseña",
  "Sistema de auto-facturación para clientes registrados",
  "Integración con pasarelas de pago (PayPal, PayU, Stripe)",
  "Cotización automática de envíos con paqueterías",
  "Gestión de reseñas y calificaciones de productos",
  "Sistema de promociones y descuentos configurables",
  "Notificaciones por email de cambios de estado",
  "Dashboard de métricas de ventas y conversión",
]

export function SettingsTab({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Capacidades del Módulo E-Commerce</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {capabilities.map((capability, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{capability}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integración sin Dobles Capturas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            El módulo de E-Commerce se integra completamente con el ERP, eliminando la necesidad de capturar información
            dos veces. Los productos, inventario, clientes y pedidos se sincronizan automáticamente entre el sistema web
            y el ERP, garantizando consistencia y ahorrando tiempo operativo.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
