"use client"

import { useState } from "react"
import { useData } from "@/hooks/use-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FormDialog } from "@/components/ui/form-dialog"
import {
  Users,
  DollarSign,
  Calendar,
  FileText,
  Download,
  Upload,
  Search,
  UserPlus,
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Briefcase,
  Award,
  Target,
} from "lucide-react"

const tabs = [
  { id: "employees", name: "Empleados", icon: Users },
  { id: "payroll", name: "Nómina", icon: DollarSign },
  { id: "incidents", name: "Incidencias", icon: Calendar },
  { id: "concepts", name: "Conceptos", icon: FileText },
  { id: "hr", name: "Recursos Humanos", icon: Briefcase },
  { id: "reports", name: "Reportes", icon: TrendingUp },
]

const initialEmployees = [
  {
    id: "EMP-001",
    name: "Carlos Méndez",
    position: "Gerente de Operaciones",
    department: "Operaciones",
    email: "carlos.mendez@empresa.com",
    phone: "555-0101",
    salary: 45000,
    hireDate: "2020-03-15",
    status: "active",
  },
  {
    id: "EMP-002",
    name: "María López Hernández",
    position: "Contador",
    department: "Contabilidad",
    email: "maria.lopez@empresa.com",
    phone: "555-0202",
    salary: 18000,
    hireDate: "2021-06-01",
    status: "active",
  },
  {
    id: "EMP-003",
    name: "Carlos Ramírez Torres",
    position: "Operador de Producción",
    department: "Producción",
    email: "carlos.ramirez@empresa.com",
    phone: "555-0303",
    salary: 12000,
    hireDate: "2019-11-20",
    status: "active",
  },
  {
    id: "EMP-004",
    name: "Ana Martínez Silva",
    position: "Recursos Humanos",
    department: "RRHH",
    email: "ana.martinez@empresa.com",
    phone: "555-0404",
    salary: 16000,
    hireDate: "2022-01-10",
    status: "vacation",
  },
  {
    id: "EMP-005",
    name: "Luis González Méndez",
    position: "Técnico de Mantenimiento",
    department: "Mantenimiento",
    email: "luis.gonzalez@empresa.com",
    phone: "555-0505",
    salary: 14000,
    hireDate: "2021-08-15",
    status: "active",
  },
]

const payrollPeriods = [
  {
    period: "Quincenal 24/2024",
    startDate: "2024-12-16",
    endDate: "2024-12-31",
    employees: 45,
    total: 675000,
    status: "processing",
  },
  {
    period: "Quincenal 23/2024",
    startDate: "2024-12-01",
    endDate: "2024-12-15",
    employees: 45,
    total: 658000,
    status: "paid",
  },
  {
    period: "Quincenal 22/2024",
    startDate: "2024-11-16",
    endDate: "2024-11-30",
    employees: 44,
    total: 642000,
    status: "paid",
  },
]

const incidents = [
  { employee: "Carlos Méndez", type: "Permiso", date: "2024-12-18", hours: 4, status: "approved" },
  { employee: "María López Hernández", type: "Incapacidad", date: "2024-12-15", days: 3, status: "approved" },
  { employee: "Carlos Ramírez Torres", type: "Falta", date: "2024-12-14", days: 1, status: "pending" },
  { employee: "Luis González Méndez", type: "Destajo", date: "2024-12-17", units: 120, status: "approved" },
  { employee: "Ana Martínez Silva", type: "Vacaciones", date: "2024-12-20", days: 5, status: "approved" },
]

const concepts = [
  { code: "P001", name: "Sueldo Base", type: "Percepción", taxable: true, imss: true },
  { code: "P002", name: "Prima Vacacional", type: "Percepción", taxable: false, imss: false },
  { code: "P003", name: "Aguinaldo", type: "Percepción", taxable: false, imss: false },
  { code: "P004", name: "Horas Extra", type: "Percepción", taxable: true, imss: true },
  { code: "D001", name: "ISR", type: "Deducción", taxable: true, imss: false },
  { code: "D002", name: "IMSS", type: "Deducción", taxable: false, imss: true },
  { code: "D003", name: "Préstamo Personal", type: "Deducción", taxable: false, imss: false },
]

const candidates = [
  { name: "Roberto Sánchez", position: "Vendedor", status: "Entrevista", date: "2024-12-20", score: 85 },
  { name: "Laura Fernández", position: "Asistente", status: "Evaluación", date: "2024-12-18", score: 78 },
  { name: "Diego Morales", position: "Operador", status: "Oferta", date: "2024-12-22", score: 92 },
]

const courses = [
  { name: "Seguridad Industrial", employees: 45, completed: 42, date: "2024-11-15" },
  { name: "Calidad Total", employees: 30, completed: 28, date: "2024-11-20" },
  { name: "Liderazgo", employees: 15, completed: 15, date: "2024-12-01" },
]

export default function PayrollPage() {
  const [activeTab, setActiveTab] = useState("employees")
  const [searchTerm, setSearchTerm] = useState("")
  const { items: employees, addItem, updateItem, deleteItem } = useData("employees", initialEmployees)
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<any>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Nómina y Recursos Humanos</h1>
          <p className="text-muted-foreground mt-2">Gestión integral de empleados, nómina e incidencias</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button
            onClick={() => {
              setEditingEmployee(null)
              setIsEmployeeDialogOpen(true)
            }}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Nuevo Empleado
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Empleados Activos</p>
              <p className="text-2xl font-bold mt-1">45</p>
              <p className="text-xs text-green-600 mt-1">+3 este mes</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Nómina Mensual</p>
              <p className="text-2xl font-bold mt-1">$1,333,000</p>
              <p className="text-xs text-muted-foreground mt-1">Promedio</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Incidencias Pendientes</p>
              <p className="text-2xl font-bold mt-1">12</p>
              <p className="text-xs text-orange-600 mt-1">Por autorizar</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Candidatos Activos</p>
              <p className="text-2xl font-bold mt-1">8</p>
              <p className="text-xs text-muted-foreground mt-1">En proceso</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === "employees" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar empleados..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>

              <div className="space-y-3">
                {employees.map((employee) => (
                  <Card key={employee.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={employee.photo || "/placeholder.svg"}
                          alt={employee.name}
                          className="w-12 h-12 rounded-full bg-muted"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{employee.name}</p>
                            <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                              {employee.status === "active" ? "Activo" : "Vacaciones"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{employee.position}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${employee.salary.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{employee.department}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingEmployee(employee)
                              setIsEmployeeDialogOpen(true)
                            }}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm(`¿Eliminar empleado ${employee.name}?`)) {
                                deleteItem(employee.id)
                              }
                            }}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "payroll" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Períodos de Nómina</h3>
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Calcular Nómina
                </Button>
              </div>

              <div className="space-y-3">
                {payrollPeriods.map((period, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold">{period.period}</h4>
                            <Badge variant={period.status === "paid" ? "outline" : "default"}>
                              {period.status === "paid" ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Pagado
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 mr-1" />
                                  En Proceso
                                </>
                              )}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {period.startDate} - {period.endDate}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">${period.total.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{period.employees} empleados</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          {period.status === "processing" && <Button size="sm">Procesar</Button>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3">Características del Módulo</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Cálculo automático de ISR e IMSS con importes gravados y exentos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Editor de fórmulas personalizado para conceptos adicionales</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Importadores de catálogos: empleados, vacaciones y acumulados</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Exportación a SUA para incapacidades</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "incidents" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Control de Incidencias</h3>
                <Button>
                  <Calendar className="w-4 h-4 mr-2" />
                  Nueva Incidencia
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Empleado</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Tipo</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Fecha</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Cantidad</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Estado</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.map((incident, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-3 px-2 text-sm">{incident.employee}</td>
                        <td className="py-3 px-2">
                          <Badge variant="outline">{incident.type}</Badge>
                        </td>
                        <td className="py-3 px-2 text-sm">{incident.date}</td>
                        <td className="py-3 px-2 text-sm">
                          {incident.hours && `${incident.hours} hrs`}
                          {incident.days && `${incident.days} días`}
                          {incident.units && `${incident.units} uds`}
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant={incident.status === "approved" ? "default" : "secondary"}>
                            {incident.status === "approved" ? "Aprobado" : "Pendiente"}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-right">
                          {incident.status === "pending" && (
                            <Button variant="outline" size="sm">
                              Autorizar
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Tipos de Incidencias Soportadas</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Incapacidades</Badge>
                    <Badge variant="outline">Faltas</Badge>
                    <Badge variant="outline">Permisos</Badge>
                    <Badge variant="outline">Destajos</Badge>
                    <Badge variant="outline">Días Laborados</Badge>
                    <Badge variant="outline">Horas Extra</Badge>
                    <Badge variant="outline">Vacaciones</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "concepts" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Conceptos de Nómina</h3>
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Nuevo Concepto
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Código</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Nombre</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Tipo</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Gravable ISR</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">IMSS</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {concepts.map((concept, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-3 px-2 text-sm font-medium">{concept.code}</td>
                        <td className="py-3 px-2 text-sm">{concept.name}</td>
                        <td className="py-3 px-2">
                          <Badge variant={concept.type === "Percepción" ? "default" : "secondary"}>
                            {concept.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-center">
                          {concept.taxable ? (
                            <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {concept.imss ? (
                            <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <Button variant="ghost" size="sm">
                            Editar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "hr" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Candidatos</h3>
                <div className="space-y-3">
                  {candidates.map((candidate, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <UserPlus className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">{candidate.name}</p>
                              <p className="text-sm text-muted-foreground">{candidate.position}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <Badge>{candidate.status}</Badge>
                              <p className="text-xs text-muted-foreground mt-1">{candidate.date}</p>
                            </div>
                            <div className="text-center">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-bold text-primary">{candidate.score}</span>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              Ver
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Cursos y Capacitaciones</h3>
                <div className="space-y-3">
                  {courses.map((course, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">{course.name}</p>
                              <p className="text-sm text-muted-foreground">{course.employees} empleados inscritos</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div>
                              <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary"
                                  style={{
                                    width: `${(course.completed / course.employees) * 100}%`,
                                  }}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{course.completed} completados</p>
                            </div>
                            <Button variant="outline" size="sm">
                              Detalles
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <ClipboardCheck className="w-5 h-5" />
                      NOM-035
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Encuestas de ambiente laboral y factores de riesgo psicosocial
                    </p>
                    <Button variant="outline" className="w-full bg-transparent">
                      Gestionar Encuestas
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Encuestas 360°
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Retroalimentación entre colaboradores de todos los niveles
                    </p>
                    <Button variant="outline" className="w-full bg-transparent">
                      Configurar Evaluación
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3">Funcionalidades de RRHH</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Gestión de expediente digital con documentos adjuntos</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Portal E-mployee para empleados</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Generación automática de organigrama</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Seguimiento de candidatos y proceso de contratación</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Reportes de Nómina</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <FileText className="w-8 h-8 text-primary mb-3" />
                    <h4 className="font-semibold mb-2">Recibos de Nómina</h4>
                    <p className="text-sm text-muted-foreground">Generar e imprimir recibos individuales o masivos</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <TrendingUp className="w-8 h-8 text-primary mb-3" />
                    <h4 className="font-semibold mb-2">Análisis de Costos</h4>
                    <p className="text-sm text-muted-foreground">Desglose detallado de costos por departamento</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <FileText className="w-8 h-8 text-primary mb-3" />
                    <h4 className="font-semibold mb-2">SUA / IDSE</h4>
                    <p className="text-sm text-muted-foreground">Archivos para presentación ante IMSS</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <Award className="w-8 h-8 text-primary mb-3" />
                    <h4 className="font-semibold mb-2">Acumulados</h4>
                    <p className="text-sm text-muted-foreground">Consulta de acumulados anuales por empleado</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <Calendar className="w-8 h-8 text-primary mb-3" />
                    <h4 className="font-semibold mb-2">Vacaciones</h4>
                    <p className="text-sm text-muted-foreground">Control de días disponibles y tomados</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <AlertCircle className="w-8 h-8 text-primary mb-3" />
                    <h4 className="font-semibold mb-2">Incidencias</h4>
                    <p className="text-sm text-muted-foreground">Reporte consolidado de todas las incidencias</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <FormDialog
        open={isEmployeeDialogOpen}
        onOpenChange={setIsEmployeeDialogOpen}
        title={editingEmployee ? "Editar Empleado" : "Nuevo Empleado"}
        fields={[
          { name: "name", label: "Nombre Completo", type: "text", required: true },
          { name: "position", label: "Puesto", type: "text", required: true },
          { name: "department", label: "Departamento", type: "text", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "phone", label: "Teléfono", type: "text", required: true },
          { name: "salary", label: "Salario Mensual", type: "number", required: true },
          { name: "hireDate", label: "Fecha de Ingreso", type: "text", required: true },
        ]}
        initialData={editingEmployee}
        onSubmit={(data) => {
          if (editingEmployee) {
            updateItem(editingEmployee.id, data)
          } else {
            addItem({
              ...data,
              id: `EMP-${String(employees.length + 1).padStart(3, "0")}`,
              status: "active",
            })
          }
          setIsEmployeeDialogOpen(false)
        }}
      />
    </div>
  )
}
