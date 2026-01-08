"use client"

import { useEffect, useState } from "react"
import { MapPin, Navigation, User } from "lucide-react"
import type { FieldServiceOrder, FieldTechnician, TechnicianLocation } from "@/lib/types"

interface ServiceMapViewProps {
  services: FieldServiceOrder[]
  technicians: FieldTechnician[]
  locations: TechnicianLocation[]
  active: boolean
}

export default function ServiceMapView({ services, technicians, locations, active }: ServiceMapViewProps) {
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    if (active) {
      // Simulate map initialization
      const timer = setTimeout(() => {
        setMapReady(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [active])

  if (!active || !mapReady) {
    return (
      <div className="aspect-video rounded-lg border bg-muted/50 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">Vista de mapa interactivo</p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Visualice la ubicación en tiempo real de todos sus técnicos y servicios programados con geolocalización GPS
          </p>
        </div>
      </div>
    )
  }

  // Create a simple visualization with service and technician markers
  return (
    <div className="aspect-video rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden">
      {/* Simple map background grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="border border-gray-300" />
          ))}
        </div>
      </div>

      {/* Service markers */}
      <div className="absolute inset-0 p-8">
        <div className="relative h-full w-full">
          {services.slice(0, 5).map((service, index) => {
            const left = 15 + index * 18
            const top = 20 + (index % 3) * 25

            return (
              <div
                key={service.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                <div className="relative group">
                  <div className="w-8 h-8 rounded-full bg-red-500 border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block z-10">
                    <div className="bg-white rounded-lg shadow-lg p-3 text-xs whitespace-nowrap">
                      <p className="font-semibold">{service.folio}</p>
                      <p className="text-muted-foreground">{service.clienteNombre}</p>
                      <p className="text-xs text-muted-foreground mt-1">{service.direccion}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Technician markers */}
          {technicians.slice(0, 4).map((tech, index) => {
            const left = 25 + index * 22
            const top = 45 + (index % 2) * 20

            return (
              <div
                key={tech.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                <div className="relative group">
                  <div className="w-10 h-10 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  {tech.disponibilidad === "en_servicio" && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block z-10">
                    <div className="bg-white rounded-lg shadow-lg p-3 text-xs whitespace-nowrap">
                      <p className="font-semibold">{tech.nombre}</p>
                      <p className="text-muted-foreground">{tech.zona}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {tech.disponibilidad === "en_servicio" ? "En Servicio" : "Disponible"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4">
            <p className="text-xs font-semibold mb-2">Leyenda</p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                  <MapPin className="w-2 h-2 text-white" />
                </div>
                <span>Servicios Programados</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                  <User className="w-2 h-2 text-white" />
                </div>
                <span>Técnicos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span>En Servicio</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
              <Navigation className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors text-xl font-bold">
              +
            </button>
            <button className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors text-xl font-bold">
              −
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 bg-blue-500 text-white px-3 py-1 rounded text-xs font-medium">
        Mapa Simplificado - Vista de Demostración
      </div>
    </div>
  )
}
