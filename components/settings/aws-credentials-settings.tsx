"use client"

import { CardFooter } from "@/components/ui/card"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Shield, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function AwsCredentialsSettings() {
  const { data: session } = useSession()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(false)
  const [awsData, setAwsData] = useState({
    awsRegion: "",
    awsAccessKeyId: "",
    awsSecretAccessKey: "••••••••••••••••", // Masked for security
  })

  useEffect(() => {
    // Fetch AWS credentials from the server
    const fetchAwsCredentials = async () => {
      try {
        const response = await fetch("/api/user/profile")
        if (response.ok) {
          const data = await response.json()
          setAwsData({
            awsRegion: data.awsRegion || "",
            awsAccessKeyId: data.awsAccessKeyId || "",
            awsSecretAccessKey: "••••••••••••••••", // Always masked
          })
        }
      } catch (error) {
        console.error("Error fetching AWS credentials:", error)
      }
    }

    fetchAwsCredentials()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setAwsData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate the credentials first
      await validateCredentials()

      // Then save them
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          awsRegion: awsData.awsRegion,
          awsAccessKeyId: awsData.awsAccessKeyId,
          ...(awsData.awsSecretAccessKey !== "••••••••••••••••" && {
            awsSecretAccessKey: awsData.awsSecretAccessKey,
          }),
          keepExistingSecret: awsData.awsSecretAccessKey === "••••••••••••••••",
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save AWS credentials")
      }

      toast({
        title: "AWS Credentials Updated",
        description: "Your AWS credentials have been updated successfully.",
      })
    } catch (error) {
      console.error("Error saving AWS credentials:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save AWS credentials",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const validateCredentials = async () => {
    setValidating(true)

    try {
      const response = await fetch("/api/validate-aws", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(awsData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to validate AWS credentials")
      }

      toast({
        title: "Credentials Valid",
        description: "Your AWS credentials have been validated successfully.",
      })

      return true
    } catch (error) {
      console.error("Error validating AWS credentials:", error)
      toast({
        title: "Validation Error",
        description: error instanceof Error ? error.message : "Failed to validate AWS credentials",
        variant: "destructive",
      })
      return false
    } finally {
      setValidating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AWS Credentials</CardTitle>
        <CardDescription>Manage your AWS credentials for sending emails through Amazon SES</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="aws-form" onSubmit={handleSubmit} className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Security Note</AlertTitle>
            <AlertDescription>
              Your AWS credentials are encrypted before being stored in our database. We never share your credentials
              with third parties.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="awsRegion">AWS Region</Label>
            <Input
              id="awsRegion"
              value={awsData.awsRegion}
              onChange={handleChange}
              placeholder="e.g., us-east-1"
              required
            />
            <p className="text-xs text-muted-foreground">The AWS region where your SES service is configured.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="awsAccessKeyId">AWS Access Key ID</Label>
            <Input
              id="awsAccessKeyId"
              value={awsData.awsAccessKeyId}
              onChange={handleChange}
              placeholder="AKIAIOSFODNN7EXAMPLE"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="awsSecretAccessKey">AWS Secret Access Key</Label>
            <Input
              id="awsSecretAccessKey"
              type="password"
              value={awsData.awsSecretAccessKey}
              onChange={handleChange}
              placeholder="Leave unchanged or enter a new secret key"
            />
            <p className="text-xs text-muted-foreground">
              Leave this field unchanged to keep your current secret key, or enter a new one to update it.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={validateCredentials} disabled={validating}>
              {validating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                "Validate Credentials"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="border-t p-6">
        <Button type="submit" form="aws-form" disabled={loading} className="ml-auto">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Credentials"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
