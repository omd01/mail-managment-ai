"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, ArrowRight, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { signIn } from "next-auth/react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      if (result?.url) {
        router.push(result.url)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to authenticate with Google")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send verification code")
      }

      setOtpSent(true)
      toast({
        title: "Verification Code Sent",
        description: "Check your email for the 6-digit code",
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to send verification code")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!otp) {
      setError("Please enter the verification code")
      return
    }

    setIsLoading(true)
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

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      })

      // Check if user needs to complete onboarding
      if (!data.user.isOnboarded) {
        router.push("/onboarding")
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Invalid verification code")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="label-mono">{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {!otpSent ? (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="label-mono text-neutral-500 font-medium">
                Authorized_Email
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="usr_identifier@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 bg-white border-neutral-200 rounded-md h-12 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-neutral-400 transition-colors font-mono text-sm shadow-sm"
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-handcrafted w-full flex items-center justify-center gap-2 rounded-md bg-neutral-900 text-white hover:bg-neutral-800 transition-all shadow-sm" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Requesting_Token...
                </>
              ) : (
                <>
                  Send Access Code
                  <ArrowRight className="h-3 w-3" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-end mb-2">
                <Label htmlFor="otp" className="label-mono text-neutral-500 font-medium">
                  Sec_Token
                </Label>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="label-mono text-[9px] text-neutral-500 hover:text-neutral-800 transition-colors"
                >
                  [EDIT_TARGET]
                </button>
              </div>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="text-center text-xl tracking-[0.5em] font-mono bg-white border-neutral-200 rounded-md h-14 text-neutral-900 placeholder:text-neutral-300 focus-visible:ring-neutral-400 transition-colors shadow-sm"
                required
              />
              <p className="label-mono text-[9px] text-neutral-500 text-center mt-4">
                Target: {email}
              </p>
            </div>
            <button type="submit" className="btn-handcrafted w-full rounded-md bg-neutral-900 text-white hover:bg-neutral-800 transition-all shadow-sm" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Initialize_Session"
              )}
            </button>
          </form>
        )}
      </div>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-neutral-200"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-4 label-mono text-neutral-500">OR_AUTH_WITH</span>
        </div>
      </div>

      <button
        type="button"
        className="w-full border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900 transition-all h-12 flex items-center justify-center gap-3 label-mono text-[10px] rounded-md shadow-sm"
        onClick={handleGoogleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <svg
              className="h-4 w-4 opacity-70"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="currentColor"
            >
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              />
            </svg>
            Google_Workspace
          </>
        )}
      </button>
    </div>

  )
}
