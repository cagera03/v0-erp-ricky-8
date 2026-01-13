"use client"

import { Bell, LogOut, Settings, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { usePathname } from "next/navigation"
import Link from "next/link"

export function AppHeader() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const moduleTitles: Record<string, string> = {
    "/dashboard": "Panel de Control",
    "/dashboard/clients": "Clientes / CRM",
    "/dashboard/sales": "Ventas",
    "/dashboard/ventas": "Ventas",
    "/dashboard/inventory": "Inventario",
    "/dashboard/warehouse": "Almacén",
    "/dashboard/accounting": "Contabilidad",
    "/dashboard/banking": "Bancos",
    "/dashboard/production": "Producción",
    "/dashboard/maintenance": "Mantenimiento",
    "/dashboard/service": "Servicio",
    "/dashboard/payroll": "Nómina / RRHH",
    "/dashboard/field-services": "Field Services",
    "/dashboard/reports": "Reportes",
    "/dashboard/ecommerce": "E-Commerce",
    "/dashboard/eprocurement": "E-Procurement",
    "/dashboard/attributes": "Atributos",
    "/dashboard/bi": "Business Intelligence",
    "/dashboard/business-intelligence": "Business Intelligence",
    "/dashboard/web-mobile": "ERP Web / Móvil",
    "/dashboard/orders": "Órdenes",
    "/dashboard/suppliers": "Proveedores",
    "/dashboard/punto-venta": "Punto de Venta",
    "/dashboard/calendar": "Calendario",
    "/dashboard/settings": "Configuracion",
    "/dashboard/facturacion": "Facturacion",
  }

  const resolvedTitle =
    Object.keys(moduleTitles)
      .sort((a, b) => b.length - a.length)
      .find((key) => pathname === key || pathname.startsWith(key + "/")) || ""
  const headerTitle = moduleTitles[resolvedTitle] || "Nexo ERP"

  const getUserInitials = () => {
    if (!user) return "U"

    const name = user.name || user.email || "Usuario"
    const nameParts = name.split(" ").filter(Boolean)

    if (nameParts.length === 0) return "U"

    return nameParts
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="h-16 border-b bg-card px-6 flex items-center justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold">{headerTitle}</h2>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">{getUserInitials()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || "Usuario"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                {user?.role && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary mt-1 w-fit">
                    {user.role === "admin" ? "Administrador" : "Usuario"}
                  </span>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <UserCircle className="w-4 h-4 mr-2" />
                Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="w-4 h-4 mr-2" />
                Configuracion
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

