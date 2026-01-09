"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

interface AuthUser extends FirebaseUser {
  companyId?: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log("[v0] [Auth] User authenticated:", firebaseUser.uid)

        let companyId: string | undefined

        try {
          const userDocRef = doc(db, "users", firebaseUser.uid)
          const userDoc = await getDoc(userDocRef)

          if (userDoc.exists()) {
            const userData = userDoc.data()
            companyId = userData.companyId || userData.empresaId
            console.log("[v0] [Auth] CompanyId from profile:", companyId)
          }
        } catch (error) {
          console.error("[v0] [Auth] Error fetching user profile:", error)
        }

        // Fallback 1: Try custom claims
        if (!companyId) {
          try {
            const tokenResult = await firebaseUser.getIdTokenResult()
            companyId = tokenResult.claims.companyId as string | undefined
            console.log("[v0] [Auth] CompanyId from claims:", companyId)
          } catch (error) {
            console.error("[v0] [Auth] Error getting token claims:", error)
          }
        }

        // Fallback 2: Use uid as companyId for development
        if (!companyId) {
          companyId = firebaseUser.uid
          console.log("[v0] [Auth] Using uid as companyId (fallback):", companyId)
        }

        setUser({
          ...firebaseUser,
          companyId,
        })
      } else {
        console.log("[v0] [Auth] User logged out")
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
