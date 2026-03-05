"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash, Plus, RefreshCw, Mail } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"

interface AvailableEmail {
  _id: string
  email: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function EmailSettings() {
  const { toast } = useToast()
  const [emails, setEmails] = useState<AvailableEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch available emails
  const fetchEmails = async () => {
    try {
      setRefreshing(true)
      const response = await fetch("/api/settings/emails", {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch emails")
      }

      const data = await response.json()
      setEmails(data)
      setError(null)
    } catch (error) {
      console.error("Error fetching emails:", error)
      setError("Failed to load emails. Please try again.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchEmails()
  }, [])

  // Add new email
  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newEmail) {
      toast({
        title: "Missing Email",
        description: "Please enter an email address.",
        variant: "destructive",
      })
      return
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/settings/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newEmail,
          description: newDescription,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to add email")
      }

      toast({
        title: "Email Added",
        description: `${newEmail} has been added successfully.`,
      })

      // Reset form and refresh list
      setNewEmail("")
      setNewDescription("")
      fetchEmails()
    } catch (error) {
      console.error("Error adding email:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Toggle email active status
  const toggleEmailStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/settings/emails/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update email status")
      }

      // Update local state
      setEmails(emails.map((email) => (email._id === id ? { ...email, isActive: !currentStatus } : email)))

      toast({
        title: "Status Updated",
        description: `Email has been ${!currentStatus ? "activated" : "deactivated"}.`,
      })
    } catch (error) {
      console.error("Error updating email status:", error)
      toast({
        title: "Error",
        description: "Failed to update email status. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Delete email
  const handleDeleteEmail = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to delete ${email}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/settings/emails/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete email")
      }

      // Update local state
      setEmails(emails.filter((email) => email._id !== id))

      toast({
        title: "Email Deleted",
        description: `${email} has been deleted successfully.`,
      })
    } catch (error) {
      console.error("Error deleting email:", error)
      toast({
        title: "Error",
        description: "Failed to delete email. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Addresses</CardTitle>
          <CardDescription>
            Manage the email addresses that can be used to send emails from your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <form onSubmit={handleAddEmail} className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  placeholder="noreply@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="No-reply email for system notifications"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={submitting} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  {submitting ? "Adding..." : "Add Email"}
                </Button>
              </div>
            </form>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium">Available Email Addresses</h3>
                <Button variant="outline" size="sm" onClick={fetchEmails} disabled={refreshing}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>

              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-md">
                      <Skeleton className="h-5 w-48" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : emails.length === 0 ? (
                <div className="text-center py-8 border rounded-md bg-muted/20">
                  <Mail className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No email addresses found. Add your first email address above.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {emails.map((email) => (
                    <div key={email._id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{email.email}</span>
                          {!email.isActive && (
                            <Badge variant="outline" className="text-xs bg-muted">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        {email.description && <p className="text-xs text-muted-foreground">{email.description}</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={email.isActive}
                            onCheckedChange={() => toggleEmailStatus(email._id, email.isActive)}
                          />
                          <span className="text-xs text-muted-foreground">
                            {email.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteEmail(email._id, email.email)}
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/50 px-6 py-3">
          <p className="text-xs text-muted-foreground">
            These email addresses will be available for selection when sending emails. Make sure they are properly
            configured with your email provider.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
