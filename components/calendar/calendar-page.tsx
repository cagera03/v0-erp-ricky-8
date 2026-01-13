"use client"

import type React from "react"
import { useMemo, useState } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import listPlugin from "@fullcalendar/list"
import interactionPlugin from "@fullcalendar/interaction"
import { format, addHours } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useFirestore } from "@/hooks/use-firestore"
import { useAuth } from "@/hooks/use-auth"
import { COLLECTIONS } from "@/lib/firestore"
import type { CalendarEvent, Customer, Lead } from "@/lib/types"
import { CalendarDays, Plus, Users, Briefcase, MapPin } from "lucide-react"
import { serverTimestamp } from "firebase/firestore"

const eventColorMap: Record<CalendarEvent["eventType"], string> = {
  reunion: "#38bdf8",
  cita: "#10b981",
  tarea: "#f59e0b",
  recordatorio: "#a855f7",
}

const eventTypeLabels: Record<CalendarEvent["eventType"], string> = {
  reunion: "Reunion",
  cita: "Cita",
  tarea: "Tarea",
  recordatorio: "Recordatorio",
}

const toInputValue = (value?: string | Date | null) => {
  if (!value) return ""
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const tzOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16)
}

const toDateValue = (value: any) => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value.toDate === "function") return value.toDate()
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function CalendarPage() {
  const { user } = useAuth()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)

  const { items: events, create, update } = useFirestore<CalendarEvent>(COLLECTIONS.calendarEvents, [], true)
  const { items: customers } = useFirestore<Customer>(COLLECTIONS.customers, [], true)
  const { items: leads } = useFirestore<Lead>(COLLECTIONS.leads, [], true)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    allDay: false,
    eventType: "reunion" as CalendarEvent["eventType"],
    location: "",
    clientId: "",
    leadId: "",
  })

  const calendarEvents = useMemo(() => {
    return events.map((event) => {
      const start = toDateValue(event.startDate)
      const end = toDateValue(event.endDate)
      return {
        id: event.id,
        title: event.title,
        start: start || undefined,
        end: end || undefined,
        allDay: event.allDay,
        backgroundColor: eventColorMap[event.eventType],
        borderColor: eventColorMap[event.eventType],
        textColor: "#0f172a",
        extendedProps: event,
      }
    })
  }, [events])

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      allDay: false,
      eventType: "reunion",
      location: "",
      clientId: "",
      leadId: "",
    })
    setEditingEventId(null)
  }

  const openDialogForDate = (date: Date) => {
    const start = date
    const end = addHours(date, 1)
    setFormData((prev) => ({
      ...prev,
      startDate: toInputValue(start),
      endDate: toInputValue(end),
    }))
    setEditingEventId(null)
    setDialogOpen(true)
  }

  const openDialogForEvent = (event: CalendarEvent) => {
    setFormData({
      title: event.title || "",
      description: event.description || "",
      startDate: toInputValue(toDateValue(event.startDate)),
      endDate: toInputValue(toDateValue(event.endDate)),
      allDay: event.allDay,
      eventType: event.eventType,
      location: event.location || "",
      clientId: event.clientId || "",
      leadId: event.leadId || "",
    })
    setEditingEventId(event.id)
    setDialogOpen(true)
  }

  const handleSaveEvent = async () => {
    if (!formData.title.trim() || !formData.startDate) return

    const selectedClient = customers.find((c) => c.id === formData.clientId)
    const selectedLead = leads.find((l) => l.id === formData.leadId)

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      startDate: new Date(formData.startDate).toISOString(),
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : new Date(formData.startDate).toISOString(),
      allDay: formData.allDay,
      eventType: formData.eventType,
      location: formData.location,
      clientId: formData.clientId ? formData.clientId : null,
      clientName: selectedClient?.nombre || null,
      leadId: formData.leadId ? formData.leadId : null,
      leadName: selectedLead?.empresa || null,
      status: "programado",
      color: formData.eventType,
      companyId: user?.companyId || user?.uid || "",
      userId: user?.uid || "",
      updatedAt: serverTimestamp() as any,
    }

    if (editingEventId) {
      await update(editingEventId, payload)
    } else {
      await create({
        ...payload,
        createdAt: serverTimestamp() as any,
      } as any)
    }

    setDialogOpen(false)
    resetForm()
  }

  const handleEventMove = async (eventId: string, start: Date | null, end: Date | null, allDay: boolean) => {
    if (!start) return
    await update(eventId, {
      startDate: start.toISOString(),
      endDate: (end || start).toISOString(),
      allDay,
      updatedAt: serverTimestamp() as any,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
<div className="flex flex-wrap gap-2">
          <Button onClick={() => openDialogForDate(new Date())}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo evento
          </Button>
        </div>
      </div>

      <div className="calendar-shell rounded-[28px] border border-white/20 bg-slate-950/95 p-4 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
          initialView="dayGridMonth"
          locale={es}
          height="auto"
          editable
          selectable
          selectMirror
          events={calendarEvents}
          select={(info) => openDialogForDate(info.start)}
          eventClick={(info) => openDialogForEvent(info.event.extendedProps as CalendarEvent)}
          eventDrop={(info) => handleEventMove(info.event.id, info.event.start, info.event.end, info.event.allDay)}
          eventResize={(info) => handleEventMove(info.event.id, info.event.start, info.event.end, info.event.allDay)}
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingEventId ? "Editar evento" : "Nuevo evento"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Título</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Reunión comercial"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={formData.eventType}
                onValueChange={(value) => setFormData({ ...formData, eventType: value as CalendarEvent["eventType"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(eventTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ubicación</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Sala Norte"
              />
            </div>
            <div className="space-y-2">
              <Label>Inicio</Label>
              <Input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Fin</Label>
              <Input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <Switch
                checked={formData.allDay}
                onCheckedChange={(checked) => setFormData({ ...formData, allDay: checked })}
              />
              <Label>Todo el día</Label>
            </div>
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Lead</Label>
              <Select value={formData.leadId} onValueChange={(value) => setFormData({ ...formData, leadId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar lead" />
                </SelectTrigger>
                <SelectContent>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.empresa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Descripción</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Notas o agenda de la reunión"
              />
            </div>
            <div className="md:col-span-2 flex flex-wrap gap-2">
              <Badge variant="outline" className="inline-flex items-center gap-2">
                <Users className="w-3 h-3" />
                {formData.clientId ? "Cliente vinculado" : "Sin cliente"}
              </Badge>
              <Badge variant="outline" className="inline-flex items-center gap-2">
                <Briefcase className="w-3 h-3" />
                {formData.leadId ? "Lead vinculado" : "Sin lead"}
              </Badge>
              {formData.location && (
                <Badge variant="outline" className="inline-flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  {formData.location}
                </Badge>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEvent}>
              {editingEventId ? "Actualizar" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
