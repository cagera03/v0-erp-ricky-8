"use client"

import { useState, useMemo } from "react"
import { useFieldServicesData } from "@/hooks/use-field-services-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  MapPin,
  Users,
  Wrench,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Plus,
  Navigation,
  Calendar,
  FileText,
  TrendingUp,
  Phone,
} from "lucide-react"
import ServiceFormDialog from "./service-form-dialog"
import TechnicianFormDialog from "./technician-form-dialog"
import ServiceMapView from "./service-map-view"

const statusConfig = {
  nuevo: { label: "Nuevo", variant: "secondary" as const, icon: Clock },
  asignado: { label: "Asignado", variant: "default" as const, icon: Calendar },
  en_ruta: { label: "En Ruta", variant: "default" as const, icon: Navigation },
  en_sitio: { label: "En Sitio", variant: "default" as const, icon: Wrench },
  finalizado: { label: "Completado", variant: "outline" as const, icon: CheckCircle },
  cancelado: { label: "Cancelado", variant: "destructive" as const, icon: AlertCircle },
}

const priorityConfig = {
  baja: { label: "Baja", variant: "outline" as const },
  media: { label: "Media", variant: "secondary" as const },
  alta: { label: "Alta", variant: "destructive" as const },
  urgente: { label: "Urgente", variant: "destructive" as const },
}

export default function FieldServicesContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("services")
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false)
  const [isTechnicianDialogOpen, setIsTechnicianDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<any>(null)
  const [editingTechnician, setEditingTechnician] = useState<any>(null)
  const [showMap, setShowMap] = useState(false)

  const {
    services,
    technicians,
    locations,
    customers,
    createService,
    updateService,
    removeService,
    createTechnician,
    updateTechnician,
    removeTechnician,
    generateServiceNumber,
    metrics,
    loading,
  } = useFieldServicesData()

  // Filter services by search term
  const filteredServices = useMemo(() => {
    if (!searchTerm.trim()) return services

    const term = searchTerm.toLowerCase()
    return services.filter(
      (s) =>
        s.folio.toLowerCase().includes(term) ||
        s.clienteNombre.toLowerCase().includes(term) ||
        s.tecnicoNombre?.toLowerCase().includes(term) ||
        s.estado.toLowerCase().includes(term) ||
        s.prioridad.toLowerCase().includes(term) ||
        s.zona?.toLowerCase().includes(term) ||
        s.direccion.toLowerCase().includes(term),
    )
  }, [services, searchTerm])

  const stats = [
    {
      name: "Servicios Activos",
      value: metrics.serviciosActivos.toString(),
      change: "+8",
      icon: Wrench,
      color: "blue",
    },
    {
      name: "Técnicos en Campo",
      value: metrics.tecnicosEnCampo.toString(),
      change: "+2",
      icon: Users,
      color: "green",
    },
    {
      name: "Servicios del Mes",
      value: metrics.serviciosDelMes.toString(),
      change: "+23",
      icon: TrendingUp,
      color: "purple",
    },
    {
      name: "Tiempo Promedio",
      value: `${metrics.tiempoPromedioHoras.toFixed(1)}h`,
      change: "-15min",
      icon: Clock,
      color: "orange",
    },
  ]

  const tabs = [
    { id: "services", label: "Servicios" },
    { id: "technicians", label: "Técnicos" },
    { id: "map", label: "Mapa" },
    { id: "features", label: "Características" },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Field Services</h1>
          <p className="text-muted-foreground mt-2">
            Gestión y seguimiento de servicios en campo con geolocalización en tiempo real
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingService(null)
            setIsServiceDialogOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Servicio
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <Badge variant="outline" className="text-green-600">
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

      {activeTab === "services" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Órdenes de Servicio</CardTitle>
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar servicios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <Wrench className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? "No se encontraron servicios" : "No hay servicios registrados"}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 bg-transparent"
                  onClick={() => {
                    setEditingService(null)
                    setIsServiceDialogOpen(true)
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primer Servicio
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredServices.map((service) => {
                  const StatusIcon = statusConfig[service.estado as keyof typeof statusConfig].icon
                  return (
                    <div key={service.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <StatusIcon className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{service.folio}</h4>
                              <Badge variant={statusConfig[service.estado as keyof typeof statusConfig].variant}>
                                {statusConfig[service.estado as keyof typeof statusConfig].label}
                              </Badge>
                              <Badge variant={priorityConfig[service.prioridad as keyof typeof priorityConfig].variant}>
                                {priorityConfig[service.prioridad as keyof typeof priorityConfig].label}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium mb-1">{service.clienteNombre}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {service.direccion}
                              </span>
                              {service.tecnicoNombre && (
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {service.tecnicoNombre}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(service.fechaProgramada as string).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Ver en mapa"
                            onClick={() => {
                              setActiveTab("map")
                              setShowMap(true)
                            }}
                          >
                            <Navigation className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingService(service)
                              setIsServiceDialogOpen(true)
                            }}
                          >
                            Editar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "technicians" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Técnicos en Campo</CardTitle>
              <Button
                size="sm"
                onClick={() => {
                  setEditingTechnician(null)
                  setIsTechnicianDialogOpen(true)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Técnico
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {technicians.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No hay técnicos registrados</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 bg-transparent"
                  onClick={() => {
                    setEditingTechnician(null)
                    setIsTechnicianDialogOpen(true)
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Primer Técnico
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {technicians.map((tech) => (
                  <div key={tech.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{tech.nombre}</h4>
                            <Badge
                              variant={
                                tech.disponibilidad === "en_servicio"
                                  ? "default"
                                  : tech.disponibilidad === "disponible"
                                    ? "outline"
                                    : "secondary"
                              }
                            >
                              {tech.disponibilidad === "en_servicio"
                                ? "En Servicio"
                                : tech.disponibilidad === "disponible"
                                  ? "Disponible"
                                  : tech.disponibilidad === "no_disponible"
                                    ? "No Disponible"
                                    : "Descanso"}
                            </Badge>
                            <Badge variant="outline">★ {tech.rating.toFixed(1)}</Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {tech.zona}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {tech.telefono}
                            </span>
                            <span>{tech.serviciosCompletados} servicios</span>
                            <span className="text-xs text-muted-foreground">{tech.especialidades.join(", ")}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveTab("map")
                            setShowMap(true)
                          }}
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          Rastrear
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingTechnician(tech)
                            setIsTechnicianDialogOpen(true)
                          }}
                        >
                          Editar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "map" && (
        <Card>
          <CardHeader>
            <CardTitle>Mapa de Servicios en Tiempo Real</CardTitle>
          </CardHeader>
          <CardContent>
            <ServiceMapView services={services} technicians={technicians} locations={locations} active={showMap} />

            <div className="grid gap-4 md:grid-cols-3 mt-6">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900">Completados</span>
                </div>
                <p className="text-2xl font-bold text-green-900">{metrics.serviciosPorEstado.finalizado || 0}</p>
                <p className="text-xs text-green-700 mt-1">Servicios finalizados</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">En Progreso</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  {(metrics.serviciosPorEstado.en_ruta || 0) + (metrics.serviciosPorEstado.en_sitio || 0)}
                </p>
                <p className="text-xs text-blue-700 mt-1">Servicios activos ahora</p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="font-semibold text-orange-900">Pendientes</span>
                </div>
                <p className="text-2xl font-bold text-orange-900">
                  {(metrics.serviciosPorEstado.nuevo || 0) + (metrics.serviciosPorEstado.asignado || 0)}
                </p>
                <p className="text-xs text-orange-700 mt-1">Servicios programados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "features" && (
        <Card>
          <CardHeader>
            <CardTitle>Características del Módulo Field Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Geolocalización GPS</h3>
                    <p className="text-sm text-muted-foreground">
                      Seguimiento en tiempo real de la ubicación de técnicos mediante GPS integrado
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Programación Inteligente</h3>
                    <p className="text-sm text-muted-foreground">
                      Asignación automática de servicios basada en ubicación y disponibilidad
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Reportes Digitales</h3>
                    <p className="text-sm text-muted-foreground">
                      Los técnicos pueden capturar fotos, firmas digitales y completar checklist desde el móvil
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Control de Tiempos</h3>
                    <p className="text-sm text-muted-foreground">
                      Registro automático de check-in/check-out y tiempo real de servicio
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Alertas y Notificaciones</h3>
                    <p className="text-sm text-muted-foreground">
                      Notificaciones push para servicios urgentes, cambios y actualizaciones
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <Navigation className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Optimización de Rutas</h3>
                    <p className="text-sm text-muted-foreground">
                      Cálculo automático de la ruta más eficiente entre múltiples servicios
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <ServiceFormDialog
        open={isServiceDialogOpen}
        onOpenChange={setIsServiceDialogOpen}
        service={editingService}
        customers={customers}
        technicians={technicians}
        generateServiceNumber={generateServiceNumber}
        onSubmit={async (data) => {
          try {
            if (editingService) {
              await updateService(editingService.id, data)
            } else {
              await createService(data)
            }
            setIsServiceDialogOpen(false)
            setEditingService(null)
          } catch (error) {
            console.error("Error saving service:", error)
            alert("Error al guardar el servicio")
          }
        }}
      />

      <TechnicianFormDialog
        open={isTechnicianDialogOpen}
        onOpenChange={setIsTechnicianDialogOpen}
        technician={editingTechnician}
        onSubmit={async (data) => {
          try {
            if (editingTechnician) {
              await updateTechnician(editingTechnician.id, data)
            } else {
              await createTechnician(data)
            }
            setIsTechnicianDialogOpen(false)
            setEditingTechnician(null)
          } catch (error) {
            console.error("Error saving technician:", error)
            alert("Error al guardar el técnico")
          }
        }}
      />
    </div>
  )
}
