"use client"

import { Bell, Search, LogOut, Settings, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

export function AppHeader() {
  const { user, logout } = useAuth()

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
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar productos, órdenes, clientes..." className="pl-9" />
        </div>
      </div>

      <div className="flex items-center gap-2">
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
            <DropdownMenuItem>
              <UserCircle className="w-4 h-4 mr-2" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Configuración
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
