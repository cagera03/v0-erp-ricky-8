"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authService, type User } from "./auth"

export interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
  isAdmin: boolean
  hasRole: (role: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/forgot-password", "/register"]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user)
      setLoading(false)

      // Redirect logic
      const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

      if (!user && !isPublicRoute) {
        // Not authenticated and trying to access protected route
        router.push("/login")
      } else if (user && isPublicRoute) {
        // Authenticated and trying to access public route (login, etc)
        router.push("/dashboard")
      }
    })

    return () => unsubscribe()
  }, [pathname, router])

  const logout = async () => {
    try {
      await authService.logout()
      router.push("/login")
    } catch (error) {
      console.error("[Auth] Logout error:", error)
    }
  }

  const isAdmin = user?.role === "admin"
  const hasRole = (role: string) => user?.role === role

  return <AuthContext.Provider value={{ user, loading, logout, isAdmin, hasRole }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
