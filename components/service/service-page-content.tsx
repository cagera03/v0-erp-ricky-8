"use client"

import { useState, useMemo } from "react"
import { useServiceData } from "@/hooks/use-service-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Headphones, Ticket, Clock, Star, Search, Filter } from "lucide-react"
import { TicketFormDialog } from "@/components/service/ticket-form-dialog"
import { TicketDetailDialog } from "@/components/service/ticket-detail-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ServiceTicket } from "@/lib/types"

export function ServicePageContent() {
  const { tickets, customers, createTicket, updateTicket, generateTicketNumber, metrics, loading } = useServiceData()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Filter and search tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        searchQuery === "" ||
        ticket.numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.clienteNombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.asunto.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || ticket.estado === statusFilter
      const matchesPriority = priorityFilter === "all" || ticket.prioridad === priorityFilter
      const matchesCategory = categoryFilter === "all" || ticket.categoria === categoryFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory
    })
  }, [tickets, searchQuery, statusFilter, priorityFilter, categoryFilter])

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(tickets.map((t) => t.categoria))
    return Array.from(cats).sort()
  }, [tickets])

  const handleCreateTicket = async (ticketData: Omit<ServiceTicket, "id">) => {
    await createTicket(ticketData)
    setIsDialogOpen(false)
  }

  const handleUpdateTicket = async (id: string, updates: Partial<ServiceTicket>) => {
    await updateTicket(id, updates)
  }

  const openTicketDetail = (ticket: ServiceTicket) => {
    setSelectedTicket(ticket)
    setIsDetailOpen(true)
  }

  const formatTime = (hours: number) => {
    if (hours === 0) return "0h"
    if (hours < 1) return `${Math.round(hours * 60)}m`
    return `${hours.toFixed(1)}h`
  }

  // Calculate satisfaction distribution with percentages
  const satisfactionData = useMemo(() => {
    const total = Object.values(metrics.distribucionSatisfaccion).reduce((sum, count) => sum + count, 0)
    return [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: metrics.distribucionSatisfaccion[rating] || 0,
      percentage: total > 0 ? Math.round(((metrics.distribucionSatisfaccion[rating] || 0) / total) * 100) : 0,
    }))
  }, [metrics.distribucionSatisfaccion])

  const getPriorityBadgeVariant = (prioridad: string) => {
    switch (prioridad) {
      case "critica":
        return "destructive"
      case "alta":
        return "destructive"
      case "media":
        return "default"
      case "baja":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getStatusBadgeVariant = (estado: string) => {
    switch (estado) {
      case "resuelto":
      case "cerrado":
        return "outline"
      case "en_proceso":
        return "default"
      case "en_espera":
        return "secondary"
      case "abierto":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getStatusLabel = (estado: string) => {
    const labels: Record<string, string> = {
      abierto: "Abierto",
      en_proceso: "En Proceso",
      en_espera: "En Espera",
      resuelto: "Resuelto",
      cerrado: "Cerrado",
    }
    return labels[estado] || estado
  }

  const getPriorityLabel = (prioridad: string) => {
    const labels: Record<string, string> = {
      baja: "Baja",
      media: "Media",
      alta: "Alta",
      critica: "Crítica",
    }
    return labels[prioridad] || prioridad
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Servicio al Cliente</h1>
          <p className="text-muted-foreground mt-2">Gestión de tickets y atención al cliente</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Ticket className="w-4 h-4 mr-2" />
          Nuevo Ticket
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Headphones className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Tickets Totales</p>
                <p className="text-2xl font-bold mt-1">{metrics.totalTickets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Ticket className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Abiertos</p>
                <p className="text-2xl font-bold mt-1">{metrics.ticketsAbiertos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
                <p className="text-2xl font-bold mt-1">{formatTime(metrics.tiempoPromedioResolucion)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600 fill-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Satisfacción</p>
                <p className="text-2xl font-bold mt-1">{metrics.satisfaccionPromedio.toFixed(1)}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tickets Table */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Tickets Recientes</CardTitle>
            <div className="flex gap-2 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ID, cliente o asunto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="abierto">Abierto</SelectItem>
                  <SelectItem value="en_proceso">En Proceso</SelectItem>
                  <SelectItem value="en_espera">En Espera</SelectItem>
                  <SelectItem value="resuelto">Resuelto</SelectItem>
                  <SelectItem value="cerrado">Cerrado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="baja">Baja</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">ID</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Cliente</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Asunto</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Prioridad</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        No hay tickets disponibles
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.slice(0, 10).map((ticket) => (
                      <tr
                        key={ticket.id}
                        className="border-b border-border last:border-0 cursor-pointer hover:bg-muted/50"
                        onClick={() => openTicketDetail(ticket)}
                      >
                        <td className="py-3 px-2 text-sm font-medium">{ticket.numero}</td>
                        <td className="py-3 px-2 text-sm">{ticket.clienteNombre}</td>
                        <td className="py-3 px-2 text-sm max-w-[200px] truncate">{ticket.asunto}</td>
                        <td className="py-3 px-2">
                          <Badge variant={getPriorityBadgeVariant(ticket.prioridad)}>
                            {getPriorityLabel(ticket.prioridad)}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant={getStatusBadgeVariant(ticket.estado)}>{getStatusLabel(ticket.estado)}</Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Satisfaction Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Calificación de Satisfacción</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {satisfactionData.map((item) => (
                <div key={item.rating} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">{item.rating} estrellas</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.count} ({item.percentage}%)
                    </div>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <TicketFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleCreateTicket}
        customers={customers}
        nextTicketNumber={generateTicketNumber}
      />

      {selectedTicket && (
        <TicketDetailDialog
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          ticket={selectedTicket}
          onUpdate={handleUpdateTicket}
          customers={customers}
        />
      )}
    </div>
  )
}
