"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Star } from "lucide-react"
import type { ServiceTicket, Customer } from "@/lib/types"
import { Timestamp } from "firebase/firestore"

interface TicketDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticket: ServiceTicket
  onUpdate: (id: string, updates: Partial<ServiceTicket>) => Promise<void>
  customers: Customer[]
}

export function TicketDetailDialog({ open, onOpenChange, ticket, onUpdate }: TicketDetailDialogProps) {
  const [estado, setEstado] = useState(ticket.estado)
  const [nota, setNota] = useState("")
  const [calificacion, setCalificacion] = useState(ticket.calificacion || 0)
  const [comentario, setComentario] = useState(ticket.comentarioCliente || "")
  const [loading, setLoading] = useState(false)

  const handleUpdateEstado = async () => {
    setLoading(true)
    try {
      const updates: Partial<ServiceTicket> = {
        estado,
        fechaUltimaActualizacion: Timestamp.fromDate(new Date()),
      }

      if (estado === "resuelto" || estado === "cerrado") {
        const now = new Date()
        const createdAt =
          ticket.fechaCreacion instanceof Date ? ticket.fechaCreacion : (ticket.fechaCreacion as any).toDate()
        const minutesToResolve = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60))

        updates.fechaResolucion = Timestamp.fromDate(now)
        updates.tiempoResolucion = minutesToResolve
      }

      if (nota) {
        const newNote = {
          id: crypto.randomUUID(),
          fecha: Timestamp.fromDate(new Date()),
          autor: "Usuario",
          contenido: nota,
          interno: true,
        }
        updates.notasInternas = [...(ticket.notasInternas || []), newNote]
      }

      await onUpdate(ticket.id, updates)
      setNota("")
      alert("Ticket actualizado correctamente")
    } catch (error) {
      console.error("Error updating ticket:", error)
      alert("Error al actualizar el ticket")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitRating = async () => {
    if (calificacion === 0) {
      alert("Por favor selecciona una calificación")
      return
    }

    setLoading(true)
    try {
      await onUpdate(ticket.id, {
        calificacion,
        comentarioCliente: comentario,
        fechaUltimaActualizacion: Timestamp.fromDate(new Date()),
      })
      alert("Calificación registrada correctamente")
    } catch (error) {
      console.error("Error saving rating:", error)
      alert("Error al guardar la calificación")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: any) => {
    if (!date) return "-"
    const d = date instanceof Date ? date : date.toDate()
    return d.toLocaleString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalle del Ticket - {ticket.numero}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Cliente</Label>
              <p className="font-medium">{ticket.clienteNombre}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Canal</Label>
              <p className="font-medium capitalize">{ticket.canal}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Categoría</Label>
              <p className="font-medium">{ticket.categoria.replace("_", " ")}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Prioridad</Label>
              <Badge>{ticket.prioridad}</Badge>
            </div>
            <div>
              <Label className="text-muted-foreground">Fecha Creación</Label>
              <p className="text-sm">{formatDate(ticket.fechaCreacion)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Última Actualización</Label>
              <p className="text-sm">{formatDate(ticket.fechaUltimaActualizacion)}</p>
            </div>
          </div>

          {/* Subject and Description */}
          <div>
            <Label className="text-muted-foreground">Asunto</Label>
            <p className="font-medium">{ticket.asunto}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Descripción</Label>
            <p className="text-sm whitespace-pre-wrap">{ticket.descripcion}</p>
          </div>

          {/* State Management */}
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estado">Estado del Ticket</Label>
                <Select value={estado} onValueChange={setEstado}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="abierto">Abierto</SelectItem>
                    <SelectItem value="en_proceso">En Proceso</SelectItem>
                    <SelectItem value="en_espera">En Espera</SelectItem>
                    <SelectItem value="resuelto">Resuelto</SelectItem>
                    <SelectItem value="cerrado">Cerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nota">Agregar Nota Interna</Label>
              <Textarea
                id="nota"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Escribe una nota interna sobre el ticket..."
                rows={3}
              />
            </div>

            <Button onClick={handleUpdateEstado} disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar Ticket"}
            </Button>
          </div>

          {/* Rating Section */}
          {(ticket.estado === "resuelto" || ticket.estado === "cerrado") && (
            <div className="border-t pt-4 space-y-4">
              <Label>Calificación del Cliente</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setCalificacion(rating)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        rating <= calificacion ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="comentario">Comentario del Cliente</Label>
                <Textarea
                  id="comentario"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Comentario opcional del cliente..."
                  rows={2}
                />
              </div>
              <Button onClick={handleSubmitRating} disabled={loading || calificacion === 0}>
                {loading ? "Guardando..." : "Guardar Calificación"}
              </Button>
            </div>
          )}

          {/* Internal Notes History */}
          {ticket.notasInternas && ticket.notasInternas.length > 0 && (
            <div className="border-t pt-4">
              <Label className="text-muted-foreground mb-2 block">Notas Internas</Label>
              <div className="space-y-2">
                {ticket.notasInternas.map((note) => (
                  <div key={note.id} className="bg-muted p-3 rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium">{note.autor}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(note.fecha)}</span>
                    </div>
                    <p className="text-sm">{note.contenido}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
