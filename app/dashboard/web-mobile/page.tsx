"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Smartphone,
  Tablet,
  Monitor,
  CheckCircle2,
  Globe,
  Clock,
  FileCheck,
  Users,
  ShoppingCart,
  FileText,
  MessageSquare,
  Mic,
  MapPin,
  TrendingUp,
  BarChart3,
  Package,
  Building2,
  Calculator,
} from "lucide-react"

export default function WebMobilePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Nexo ERP Web / Móvil</h1>
          <p className="text-muted-foreground mt-2">
            Acceso completo a su ERP desde cualquier dispositivo, en cualquier momento y lugar
          </p>
        </div>
        <Button>
          <Globe className="w-4 h-4 mr-2" />
          Configurar Acceso
        </Button>
      </div>

      {/* Device Access Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Teléfonos Inteligentes</h3>
            <p className="text-sm text-muted-foreground">
              Acceso completo desde iOS y Android con interfaz optimizada para móviles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Tablet className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Tabletas</h3>
            <p className="text-sm text-muted-foreground">
              Experiencia optimizada para iPad y tabletas Android con vistas expandidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Monitor className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Computadoras</h3>
            <p className="text-sm text-muted-foreground">
              Acceso web completo desde cualquier navegador sin instalación
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Key Features */}
      <Card>
        <CardHeader>
          <CardTitle>Características Principales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Business Intelligence Móvil</h4>
                  <p className="text-sm text-muted-foreground">
                    Acceso a su tablero de consultas y cualquier reporte de BI en tiempo real
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <FileCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Autorizaciones en Línea</h4>
                  <p className="text-sm text-muted-foreground">
                    Apruebe pagos, pedidos, requisiciones y órdenes de compra desde cualquier lugar
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Gestión de Contactos</h4>
                  <p className="text-sm text-muted-foreground">
                    Alta y consulta de prospectos, clientes y proveedores con enlace directo a llamadas y correos
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Embudo de Ventas</h4>
                  <p className="text-sm text-muted-foreground">
                    Cree y envíe cotizaciones por email con seguimiento automático del embudo de ventas
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Pedidos de Vendedores</h4>
                  <p className="text-sm text-muted-foreground">
                    Registro de pre-pedidos/pedidos, consulta de historial y existencias en tiempo real
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Facturación Móvil</h4>
                  <p className="text-sm text-muted-foreground">
                    Elabore facturas electrónicas de contado, crédito o plazos desde cualquier dispositivo
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Consulta en Tiempo Real</h4>
                  <p className="text-sm text-muted-foreground">
                    Estados de cuenta, documentos pendientes, estados financieros y movimientos bancarios
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Sistema de Conversaciones</h4>
                  <p className="text-sm text-muted-foreground">
                    Control de pendientes y tickets interno o con clientes/proveedores vía eCommerce/eProcurement
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <Mic className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Comandos por Voz</h4>
                  <p className="text-sm text-muted-foreground">
                    Búsquedas y capturas mediante comandos de voz o texto para mayor eficiencia
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Geolocalización</h4>
                  <p className="text-sm text-muted-foreground">
                    Ubicación automática con Google Places® para visitas a clientes y proveedores
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Modules */}
      <Card>
        <CardHeader>
          <CardTitle>Módulos Disponibles en Móvil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Clientes / CRM", icon: Users },
              { name: "Proveedores", icon: Package },
              { name: "Bancos", icon: Building2 },
              { name: "Contabilidad", icon: Calculator },
              { name: "Business Intelligence", icon: BarChart3 },
              { name: "Cotizaciones", icon: FileText },
              { name: "Pedidos", icon: ShoppingCart },
              { name: "Facturas CFDI", icon: FileCheck },
              { name: "Estados de Cuenta", icon: Clock },
            ].map((module) => (
              <div
                key={module.name}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <module.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium text-sm">{module.name}</span>
                <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold">Sin Instalación</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Acceso inmediato desde cualquier navegador web sin necesidad de instalar aplicaciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold">Tiempo Real</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Información siempre actualizada sincronizada con su sistema principal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold">100% Seguro</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Conexión encriptada y autenticación de dos factores para máxima seguridad
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
