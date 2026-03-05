"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  name?: string
  isOnboarded: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, otp: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, otp: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Verification failed")
      }

      setUser(data.user)
      localStorage.setItem("user", JSON.stringify(data.user))

      // Redirect based on onboarding status
      if (!data.user.isOnboarded) {
        router.push("/onboarding")
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    setLoading(true)
    try {
      // In a real app, this would redirect to Google OAuth
      // For demo purposes, we'll simulate a successful login
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "demo@example.com",
          name: "Demo User",
          profileImage: "https://ui-avatars.com/api/?name=Demo+User",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed")
      }

      setUser(data.user)
      localStorage.setItem("user", JSON.stringify(data.user))

      // Redirect based on onboarding status
      if (!data.user.isOnboarded) {
        router.push("/onboarding")
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Google login error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")

    // Clear cookies by making a request to the logout API
    fetch("/api/auth/logout", {
      method: "POST",
    }).finally(() => {
      router.push("/login")
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
