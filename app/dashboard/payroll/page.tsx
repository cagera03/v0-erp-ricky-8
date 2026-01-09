"use client"

import { useState } from "react"
import { usePayrollData } from "@/hooks/use-payroll-data"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, DollarSign, Calendar, FileText, Upload, UserPlus, Briefcase, TrendingUp } from "lucide-react"
import { EmployeesTab } from "@/components/payroll/employees-tab"
import { EmployeeFormDialog } from "@/components/payroll/employee-form-dialog"

const tabs = [
  { id: "employees", name: "Empleados", icon: Users },
  { id: "payroll", name: "Nómina", icon: DollarSign },
  { id: "incidents", name: "Incidencias", icon: Calendar },
  { id: "concepts", name: "Conceptos", icon: FileText },
  { id: "hr", name: "Recursos Humanos", icon: Briefcase },
  { id: "reports", name: "Reportes", icon: TrendingUp },
]

export default function PayrollPage() {
  const [activeTab, setActiveTab] = useState("employees")
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<any>(null)

  const {
    employees,
    payrollPeriods,
    incidents,
    payrollConcepts,
    candidates,
    loading,
    empleadosActivos,
    nominaMensual,
    incidenciasPendientes,
    candidatosActivos,
    addEmployee,
    updateEmployee,
  } = usePayrollData()

  const safeEmployees = Array.isArray(employees) ? employees : []
  const safeIncidents = Array.isArray(incidents) ? incidents : []

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
              <p className="text-2xl font-bold mt-1">{loading ? "..." : empleadosActivos}</p>
              <p className="text-xs text-muted-foreground mt-1">En nómina</p>
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
              <p className="text-2xl font-bold mt-1">{loading ? "..." : `$${nominaMensual.toLocaleString()}`}</p>
              <p className="text-xs text-muted-foreground mt-1">Total mensual</p>
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
              <p className="text-2xl font-bold mt-1">{loading ? "..." : incidenciasPendientes}</p>
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
              <p className="text-2xl font-bold mt-1">{loading ? "..." : candidatosActivos}</p>
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
            <EmployeesTab
              employees={safeEmployees}
              loading={loading}
              onEdit={(employee) => {
                setEditingEmployee(employee)
                setIsEmployeeDialogOpen(true)
              }}
              onDelete={async (id) => {
                if (confirm("¿Estás seguro de eliminar este empleado?")) {
                  await updateEmployee(id, { estado: "inactivo" })
                }
              }}
            />
          )}

          {activeTab === "payroll" && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Tab de Nómina en desarrollo</p>
              <p className="text-sm mt-2">Aquí se mostrarán los períodos de nómina</p>
            </div>
          )}

          {activeTab === "incidents" && (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Tab de Incidencias en desarrollo</p>
              <p className="text-sm mt-2">Total de incidencias: {safeIncidents.length}</p>
            </div>
          )}

          {activeTab === "concepts" && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Tab de Conceptos en desarrollo</p>
              <p className="text-sm mt-2">
                Total de conceptos: {Array.isArray(payrollConcepts) ? payrollConcepts.length : 0}
              </p>
            </div>
          )}

          {activeTab === "hr" && (
            <div className="text-center py-12 text-muted-foreground">
              <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Tab de Recursos Humanos en desarrollo</p>
              <p className="text-sm mt-2">Candidatos activos: {candidatosActivos}</p>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Tab de Reportes en desarrollo</p>
              <p className="text-sm mt-2">Reportes de nómina y análisis</p>
            </div>
          )}
        </CardContent>
      </Card>

      <EmployeeFormDialog
        open={isEmployeeDialogOpen}
        onOpenChange={setIsEmployeeDialogOpen}
        employee={editingEmployee}
        onSave={async (employeeData) => {
          if (editingEmployee) {
            await updateEmployee(editingEmployee.id, employeeData)
          } else {
            await addEmployee(employeeData)
          }
          setIsEmployeeDialogOpen(false)
          setEditingEmployee(null)
        }}
      />
    </div>
  )
}
