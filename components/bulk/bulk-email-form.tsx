"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Send,
  Loader2,
  Mail,
  LayoutTemplate,
  Plus,
  Trash,
  Upload,
  Download,
  AlertCircle,
  Paperclip,
  X,
  FileText,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface AvailableEmail {
  _id: string
  email: string
  description: string
  isActive: boolean
}

interface Template {
  _id: string
  name: string
  subject: string
  content: string
  variables?: string[]
  templateType?: string
  attachments?: Attachment[]
}

interface Recipient {
  email: string
  variables: Record<string, string>
  status?: "pending" | "sending" | "sent" | "failed"
  error?: string
}

interface Attachment {
  name: string
  type: "static" | "dynamic"
  url?: string
  description?: string
}

export function BulkEmailForm() {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<string>("none")
  const [emailMode, setEmailMode] = useState<"simple" | "template">("simple")
  const [availableEmails, setAvailableEmails] = useState<AvailableEmail[]>([])
  const [fromEmail, setFromEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null)
  const [recipients, setRecipients] = useState<Recipient[]>([{ email: "", variables: {}, status: "pending" }])
  const [bulkEmailText, setBulkEmailText] = useState("")
  const [emailData, setEmailData] = useState({
    subject: "",
    message: "",
  })
  const [sendingProgress, setSendingProgress] = useState(0)
  const [isSending, setIsSending] = useState(false)
  const [sendingStats, setSendingStats] = useState({
    total: 0,
    sent: 0,
    failed: 0,
  })

  const [attachments, setAttachments] = useState<File[]>([])
  const [staticAttachments, setStaticAttachments] = useState<{ name: string; url: string }[]>([])

  // Fetch available emails and templates
  useEffect(() => {
    const fetchAvailableEmails = async () => {
      try {
        const response = await fetch("/api/settings/emails", {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch available emails")
        }

        const data = await response.json()
        const activeEmails = data.filter((email: AvailableEmail) => email.isActive)
        setAvailableEmails(activeEmails)

        if (activeEmails.length > 0) {
          setFromEmail(activeEmails[0].email)
        }
      } catch (error) {
        console.error("Error fetching available emails:", error)
        setError("Failed to load sender emails. Please refresh and try again.")
      }
    }

    const fetchTemplates = async () => {
      try {
        setTemplatesLoading(true)
        const response = await fetch("/api/templates")
        if (!response.ok) {
          throw new Error("Failed to fetch templates")
        }
        const data = await response.json()
        setTemplates(data)
      } catch (error) {
        console.error("Error fetching templates:", error)
        setError("Failed to load templates. Please refresh and try again.")
      } finally {
        setTemplatesLoading(false)
      }
    }

    fetchAvailableEmails()
    fetchTemplates()
  }, [])

  // Update the handleTemplateChange function to better handle template variables
  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value)
    if (value === "none") {
      setCurrentTemplate(null)
      return
    }

    const template = templates.find((t) => t._id === value)
    if (template) {
      setCurrentTemplate(template)

      // Don't allow editing the subject when using a template
      setEmailData((prev) => ({
        ...prev,
        subject: template.subject || "",
      }))

      // Initialize variables for each recipient
      if (template.variables && template.variables.length > 0) {
        setRecipients((prevRecipients) =>
          prevRecipients.map((recipient) => {
            const newVariables: Record<string, string> = {}
            template.variables?.forEach((variable) => {
              // Preserve existing variable values if they exist
              newVariables[variable] = recipient.variables[variable] || ""
            })
            return {
              ...recipient,
              variables: newVariables,
            }
          }),
        )
      }
    }
  }

  // Add a helper function to check if all required variables are filled
  const validateTemplateVariables = () => {
    if (emailMode !== "template" || !currentTemplate?.variables || currentTemplate.variables.length === 0) {
      return true
    }

    const validRecipients = recipients.filter((r) => r.email.trim() !== "")

    for (const recipient of validRecipients) {
      for (const variable of currentTemplate.variables) {
        if (!recipient.variables[variable]) {
          toast({
            title: "Missing variable values",
            description: `Please fill in all template variables for each recipient.`,
            variant: "destructive",
          })
          return false
        }
      }
    }

    return true
  }

  // Update the validateForm function to check template variables
  const validateForm = () => {
    // Check if sender email is selected
    if (!fromEmail) {
      toast({
        title: "Sender email required",
        description: "Please select a sender email address.",
        variant: "destructive",
      })
      return false
    }

    // Check if subject is provided
    if (!emailData.subject.trim()) {
      toast({
        title: "Subject required",
        description: "Please enter an email subject.",
        variant: "destructive",
      })
      return false
    }

    // For simple mode, check if message is provided
    if (emailMode === "simple" && !emailData.message.trim()) {
      toast({
        title: "Message required",
        description: "Please enter an email message.",
        variant: "destructive",
      })
      return false
    }

    // For template mode, check if template is selected
    if (emailMode === "template" && selectedTemplate === "none") {
      toast({
        title: "Template required",
        description: "Please select an email template.",
        variant: "destructive",
      })
      return false
    }

    // Check if there are valid recipients
    const validRecipients = recipients.filter((r) => r.email.trim() !== "")
    if (validRecipients.length === 0) {
      toast({
        title: "Recipients required",
        description: "Please add at least one recipient email address.",
        variant: "destructive",
      })
      return false
    }

    // Validate template variables
    if (!validateTemplateVariables()) {
      return false
    }

    return true
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setEmailData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleRecipientChange = (index: number, email: string) => {
    const newRecipients = [...recipients]
    newRecipients[index].email = email
    setRecipients(newRecipients)
  }

  const handleVariableChange = (recipientIndex: number, variable: string, value: string) => {
    const newRecipients = [...recipients]
    newRecipients[recipientIndex].variables[variable] = value
    setRecipients(newRecipients)
  }

  const addRecipient = () => {
    const newVariables: Record<string, string> = {}
    if (currentTemplate?.variables) {
      currentTemplate.variables.forEach((variable) => {
        newVariables[variable] = ""
      })
    }
    setRecipients([...recipients, { email: "", variables: newVariables, status: "pending" }])
  }

  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index))
    }
  }

  const parseBulkEmails = () => {
    const emails = bulkEmailText
      .split(/[\n,;]/)
      .map((email) => email.trim())
      .filter((email) => email.length > 0 && email.includes("@"))

    if (emails.length === 0) {
      toast({
        title: "No valid emails",
        description: "Please enter at least one valid email address.",
        variant: "destructive",
      })
      return
    }

    const newRecipients: Recipient[] = emails.map((email) => {
      const variables: Record<string, string> = {}
      if (currentTemplate?.variables) {
        currentTemplate.variables.forEach((variable) => {
          variables[variable] = ""
        })
      }
      return { email, variables, status: "pending" }
    })

    setRecipients(newRecipients)
    toast({
      title: "Emails parsed",
      description: `${newRecipients.length} email addresses have been added.`,
    })
  }

  const replaceVariables = (content: string, variables: Record<string, string>): string => {
    let result = content
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, "g"), value || `{{${key}}}`)
    })
    return result
  }

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setAttachments((prev) => [...prev, ...newFiles])
    }
  }

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAddStaticAttachment = () => {
    const name = prompt("Enter attachment name")
    const url = prompt("Enter attachment URL")

    if (name && url) {
      setStaticAttachments((prev) => [...prev, { name, url }])
    }
  }

  const handleRemoveStaticAttachment = (index: number) => {
    setStaticAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  // Update the sendBulkEmails function to use FormData for attachments
  const sendBulkEmails = async () => {
    if (!validateForm()) return

    const validRecipients = recipients.filter((r) => r.email.trim() !== "")
    if (validRecipients.length === 0) return

    setIsSending(true)
    setSendingProgress(0)
    setSendingStats({
      total: validRecipients.length,
      sent: 0,
      failed: 0,
    })

    // Create a copy of recipients to update status
    const updatedRecipients = [...recipients]
    let sentCount = 0
    let failedCount = 0

    for (let i = 0; i < validRecipients.length; i++) {
      const recipient = validRecipients[i]
      const recipientIndex = recipients.findIndex((r) => r.email === recipient.email)

      if (recipientIndex === -1) continue

      // Update status to sending
      updatedRecipients[recipientIndex].status = "sending"
      setRecipients([...updatedRecipients])

      try {
        // Prepare email content
        let finalSubject = emailData.subject
        let finalMessage = emailData.message

        if (emailMode === "template" && currentTemplate) {
          finalSubject = replaceVariables(currentTemplate.subject, recipient.variables)
          finalMessage = replaceVariables(currentTemplate.content, recipient.variables)
        }

        // Create FormData for file uploads
        const formData = new FormData()
        formData.append("from", fromEmail)
        formData.append("to", recipient.email)
        formData.append("subject", finalSubject)
        formData.append("html", finalMessage)

        if (emailMode === "template" && selectedTemplate !== "none") {
          formData.append("templateId", selectedTemplate)
          formData.append("variables", JSON.stringify(recipient.variables))

          // If the template has dynamic attachments, pass the variables for processing
          if (currentTemplate?.attachments?.some((att) => att.type === "dynamic")) {
            formData.append("hasDynamicAttachments", "true")
          }
        }

        // Add attachments
        attachments.forEach((file) => {
          formData.append("attachments", file)
        })

        // Add static attachments
        staticAttachments.forEach((att, index) => {
          formData.append(`staticAttachments[${index}][name]`, att.name)
          formData.append(`staticAttachments[${index}][url]`, att.url)
        })

        // Send the email
        const response = await fetch("/api/send-email", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to send email")
        }

        // Update status to sent
        updatedRecipients[recipientIndex].status = "sent"
        sentCount++
      } catch (error) {
        console.error(`Error sending email to ${recipient.email}:`, error)

        // Update status to failed
        updatedRecipients[recipientIndex].status = "failed"
        updatedRecipients[recipientIndex].error = error instanceof Error ? error.message : "Failed to send email"
        failedCount++
      }

      // Update progress
      const progress = Math.round(((i + 1) / validRecipients.length) * 100)
      setSendingProgress(progress)
      setSendingStats({
        total: validRecipients.length,
        sent: sentCount,
        failed: failedCount,
      })

      // Update recipients state
      setRecipients([...updatedRecipients])

      // Small delay to prevent rate limiting
      await new Promise((resolve) => setTimeout(resolve, 300))
    }

    setIsSending(false)

    // Show final toast
    if (failedCount === 0) {
      toast({
        title: "Bulk email completed",
        description: `Successfully sent ${sentCount} emails.`,
      })
    } else {
      toast({
        title: "Bulk email completed with errors",
        description: `Sent: ${sentCount}, Failed: ${failedCount}. Check the status for details.`,
        variant: "destructive",
      })
    }
  }

  const exportRecipientsList = () => {
    let csvContent = "email"

    // Add variable headers for template mode
    if (emailMode === "template" && currentTemplate?.variables) {
      currentTemplate.variables.forEach((variable) => {
        csvContent += `,${variable}`
      })
    }
    csvContent += "\n"

    // Add recipient data
    recipients.forEach((recipient) => {
      if (!recipient.email) return

      csvContent += recipient.email

      if (emailMode === "template" && currentTemplate?.variables) {
        currentTemplate.variables.forEach((variable) => {
          csvContent += `,${recipient.variables[variable] || ""}`
        })
      }

      csvContent += "\n"
    })

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "bulk_email_recipients.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const importRecipientsFromCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const csvText = event.target?.result as string
      if (!csvText) return

      const lines = csvText.split("\n")
      if (lines.length < 2) return // Need at least header and one data row

      const headers = lines[0].split(",").map((h) => h.trim())
      const emailIndex = headers.findIndex((h) => h.toLowerCase() === "email")

      if (emailIndex === -1) {
        toast({
          title: "Invalid CSV format",
          description: "CSV file must have an 'email' column.",
          variant: "destructive",
        })
        return
      }

      const newRecipients: Recipient[] = []

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue

        const values = lines[i].split(",").map((v) => v.trim())
        const email = values[emailIndex]

        if (!email || !email.includes("@")) continue

        const variables: Record<string, string> = {}

        // Map other columns to variables if in template mode
        if (emailMode === "template" && currentTemplate?.variables) {
          currentTemplate.variables.forEach((variable) => {
            const variableIndex = headers.findIndex((h) => h.toLowerCase() === variable.toLowerCase())
            if (variableIndex !== -1 && variableIndex < values.length) {
              variables[variable] = values[variableIndex]
            } else {
              variables[variable] = ""
            }
          })
        }

        newRecipients.push({
          email,
          variables,
          status: "pending",
        })
      }

      if (newRecipients.length === 0) {
        toast({
          title: "No valid recipients",
          description: "No valid email addresses found in the CSV file.",
          variant: "destructive",
        })
        return
      }

      setRecipients(newRecipients)
      toast({
        title: "Recipients imported",
        description: `${newRecipients.length} recipients have been imported.`,
      })
    }

    reader.readAsText(file)

    // Reset the input
    e.target.value = ""
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-4">
        <CardTitle>Bulk Email</CardTitle>
        <CardDescription>Send emails to multiple recipients at once</CardDescription>
      </CardHeader>

      {error && (
        <CardContent className="pt-0 pb-4">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      )}

      <Tabs
        defaultValue="simple"
        value={emailMode}
        onValueChange={(value) => setEmailMode(value as "simple" | "template")}
      >
        <CardContent className="pt-0 pb-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="simple" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Simple Email
            </TabsTrigger>
            <TabsTrigger value="template" className="flex items-center gap-2">
              <LayoutTemplate className="h-4 w-4" />
              Template Email
            </TabsTrigger>
          </TabsList>
        </CardContent>

        <CardContent className="space-y-6">
          {/* Sender Email */}
          <div className="space-y-2">
            <Label htmlFor="from">From</Label>
            <Select value={fromEmail} onValueChange={setFromEmail}>
              <SelectTrigger id="from">
                <SelectValue placeholder="Select sender email" />
              </SelectTrigger>
              <SelectContent>
                {availableEmails.length > 0 ? (
                  availableEmails.map((email) => (
                    <SelectItem key={email._id} value={email.email}>
                      {email.email}
                      {email.description && ` - ${email.description}`}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="test@aimailer.com">test@aimailer.com</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="simple" className="space-y-6 mt-0">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Email subject"
                value={emailData.subject}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Your email message"
                className="min-h-[200px]"
                value={emailData.message}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>
          </TabsContent>

          <TabsContent value="template" className="space-y-6 mt-0">
            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <Select
                value={selectedTemplate}
                onValueChange={handleTemplateChange}
                disabled={loading || templatesLoading}
              >
                <SelectTrigger id="template">
                  <SelectValue placeholder={templatesLoading ? "Loading templates..." : "Select a template"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No template</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template._id} value={template._id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentTemplate && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Subject</Label>
                  <Badge variant="outline" className="font-normal">
                    From Template
                  </Badge>
                </div>
                <div className="p-2 border rounded-md bg-muted/20">{currentTemplate.subject}</div>
                {currentTemplate.variables && currentTemplate.variables.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    This template has variables that will be filled from the recipient table below.
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          {/* Recipients Section */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Recipients</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={exportRecipientsList} disabled={recipients.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <div className="relative">
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={importRecipientsFromCSV}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    aria-label="Import CSV"
                  />
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Import CSV
                  </Button>
                </div>
              </div>
            </div>

            {/* Bulk Email Input */}
            <div className="space-y-2">
              <Label htmlFor="bulk-emails">Bulk Add Emails</Label>
              <div className="flex gap-2">
                <Textarea
                  id="bulk-emails"
                  placeholder="Enter multiple email addresses (separated by commas, semicolons, or new lines)"
                  value={bulkEmailText}
                  onChange={(e) => setBulkEmailText(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex justify-end">
                <Button variant="secondary" size="sm" onClick={parseBulkEmails} disabled={!bulkEmailText.trim()}>
                  Parse Emails
                </Button>
              </div>
            </div>

            {/* Recipients Table */}
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    {emailMode === "template" &&
                      currentTemplate?.variables?.map((variable) => <TableHead key={variable}>{variable}</TableHead>)}
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipients.map((recipient, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={recipient.email}
                          onChange={(e) => handleRecipientChange(index, e.target.value)}
                          placeholder="recipient@example.com"
                          disabled={isSending}
                        />
                      </TableCell>
                      {emailMode === "template" &&
                        currentTemplate?.variables?.map((variable) => (
                          <TableCell key={variable}>
                            <Input
                              value={recipient.variables[variable] || ""}
                              onChange={(e) => handleVariableChange(index, variable, e.target.value)}
                              placeholder={variable}
                              disabled={isSending}
                            />
                          </TableCell>
                        ))}
                      <TableCell>
                        {recipient.status === "pending" && <Badge variant="outline">Pending</Badge>}
                        {recipient.status === "sending" && (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                          >
                            Sending...
                          </Badge>
                        )}
                        {recipient.status === "sent" && (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
                          >
                            Sent
                          </Badge>
                        )}
                        {recipient.status === "failed" && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300">
                            Failed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRecipient(index)}
                          disabled={recipients.length <= 1 || isSending}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Add Recipient Button */}
            <Button variant="outline" onClick={addRecipient} disabled={isSending} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Recipient
            </Button>

            {/* Sending Progress */}
            {isSending && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sending emails...</span>
                  <span>{sendingProgress}%</span>
                </div>
                <Progress value={sendingProgress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Total: {sendingStats.total}</span>
                  <span>Sent: {sendingStats.sent}</span>
                  <span>Failed: {sendingStats.failed}</span>
                </div>
              </div>
            )}

            {/* Failed Recipients */}
            {!isSending && recipients.some((r) => r.status === "failed") && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Failed to send some emails</AlertTitle>
                <AlertDescription>
                  <p>Some emails could not be sent. Check the status column for details.</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {recipients
                      .filter((r) => r.status === "failed")
                      .map((r, i) => (
                        <li key={i}>
                          <strong>{r.email}</strong>: {r.error || "Unknown error"}
                        </li>
                      ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
          {/* Add this after the recipients section and before the CardFooter */}
          {/* Attachments Section */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Attachments</h3>
              <Button variant="outline" size="sm" onClick={handleAddStaticAttachment}>
                <Plus className="h-4 w-4 mr-2" />
                Add Static Attachment
              </Button>
            </div>

            {/* File Attachments */}
            <div className="space-y-2">
              <Label htmlFor="attachments">Upload Attachments</Label>
              <Input id="attachments" type="file" onChange={handleAttachmentUpload} multiple disabled={isSending} />

              {attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  <h4 className="text-sm font-medium">Uploaded Files</h4>
                  <div className="border rounded-md divide-y">
                    {attachments.map((file, index) => (
                      <div key={index} className="p-2 flex justify-between items-center">
                        <div className="flex items-center">
                          <Paperclip className="h-4 w-4 mr-2" />
                          <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAttachment(index)}
                          disabled={isSending}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Static Attachments */}
            {staticAttachments.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Static Attachments</h4>
                <div className="border rounded-md divide-y">
                  {staticAttachments.map((attachment, index) => (
                    <div key={index} className="p-2 flex justify-between items-center">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span className="text-sm truncate max-w-[200px]">{attachment.name}</span>
                        <span className="text-xs text-muted-foreground ml-2 truncate max-w-[200px]">
                          {attachment.url}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveStaticAttachment(index)}
                        disabled={isSending}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Template Attachments Info */}
            {emailMode === "template" && currentTemplate?.attachments && currentTemplate.attachments.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Template Attachments</h4>
                <div className="border rounded-md p-3 bg-muted/20">
                  <p className="text-sm">
                    This template includes {currentTemplate.attachments.length} predefined attachment(s). These will be
                    automatically included with each email.
                  </p>
                  <div className="mt-2 space-y-1">
                    {currentTemplate.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <Paperclip className="h-3 w-3 mr-1" />
                        <span>{attachment.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {attachment.type === "static" ? "Static" : "Dynamic"}
                        </Badge>
                        {attachment.type === "dynamic" && (
                          <span className="text-xs text-muted-foreground ml-2">
                            (Variables will be applied to this attachment)
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-4 border-t">
          <Button onClick={sendBulkEmails} disabled={isSending} className="w-full sm:w-auto">
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Bulk Email
              </>
            )}
          </Button>
        </CardFooter>
      </Tabs>
    </Card>
  )
}
