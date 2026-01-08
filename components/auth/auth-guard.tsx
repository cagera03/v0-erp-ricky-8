"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

const PUBLIC_ROUTES = ["/login", "/forgot-password", "/register"]

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading) {
      const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

      if (!user && !isPublicRoute) {
        router.push("/login")
      }
    }
  }, [user, loading, pathname, router])

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // Don't render protected content if not authenticated
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)
  if (!user && !isPublicRoute) {
    return null
  }

  return <>{children}</>
}
