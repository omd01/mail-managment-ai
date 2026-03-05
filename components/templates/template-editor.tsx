"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Save,
  Send,
  Plus,
  Trash,
  Code,
  Palette,
  Paperclip,
  X,
  FileText,
  Variable,
  Eye,
  Info,
  HelpCircle,
  Upload,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { AITemplateGenerator } from "./ai-template-generator"

interface TemplateEditorProps {
  id: string
}

interface TemplateData {
  name: string
  description: string
  subject: string
  content: string
  variables: string[]
  templateType: "html" | "react" | "tailwind"
  attachments: Attachment[]
}

interface Attachment {
  name: string
  type: "static" | "dynamic"
  url?: string
  description?: string
}

// Client-side cache for individual templates
const templateCache: Record<string, any> = {}
const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes in milliseconds

export function TemplateEditor({ id }: TemplateEditorProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("edit")
  const [newVariable, setNewVariable] = useState("")
  const [template, setTemplate] = useState<TemplateData>({
    name: "",
    description: "",
    subject: "",
    content: "",
    variables: [],
    templateType: "html",
    attachments: [],
  })
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)
  const [testEmailTo, setTestEmailTo] = useState("")
  const [newAttachmentName, setNewAttachmentName] = useState("")
  const [newAttachmentType, setNewAttachmentType] = useState<"static" | "dynamic">("static")
  const [newAttachmentUrl, setNewAttachmentUrl] = useState("")
  const [newAttachmentDescription, setNewAttachmentDescription] = useState("")
  const [testAttachments, setTestAttachments] = useState<File[]>([])
  const [aiPrompt, setAiPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const getDefaultTemplate = useCallback((type: "html" | "react" | "tailwind") => {
    switch (type) {
      case "react":
        return `
<div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
  <h1 style={{ color: '#333' }}>Hello {{name}}</h1>
  <p>Welcome to {{company}}!</p>
  <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px', margin: '20px 0' }}>
    <p>Your account has been created successfully.</p>
  </div>
  <p>Best regards,<br/>The AiMailer Team</p>
</div>
`
      case "tailwind":
        return `
<div class="font-sans max-w-2xl mx-auto">
  <h1 class="text-2xl font-bold text-gray-800 mb-4">Hello {{name}}</h1>
  <p class="text-gray-600 mb-6">Welcome to {{company}}!</p>
  <div class="bg-gray-100 p-4 rounded-lg mb-6">
    <p class="text-gray-700">Your account has been created successfully.</p>
  </div>
  <p class="text-gray-600">Best regards,<br/>The AiMailer Team</p>
</div>
`
      default: // html
        return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #333;">Hello {{name}}</h1>
  <p>Welcome to {{company}}!</p>
  <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <p>Your account has been created successfully.</p>
  </div>
  <p>Best regards,<br/>The AiMailer Team</p>
</div>
`
    }
  }, [])

  // Optimized template fetching with caching
  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const fetchTemplate = async () => {
      // For new templates, just set defaults and return
      if (id === "new") {
        const defaultContent = getDefaultTemplate("html")
        setTemplate((prev) => ({
          ...prev,
          content: defaultContent,
          templateType: "html",
          variables: ["name", "company"],
        }))
        setVariableValues({ name: "John Doe", company: "Acme Inc" })
        setFetchLoading(false)
        return
      }

      // Check cache first
      const now = Date.now()
      const cachedTemplate = templateCache[id]
      if (cachedTemplate && now - cachedTemplate.timestamp < CACHE_DURATION) {
        setTemplate(cachedTemplate.data)

        // Initialize variable values from cache
        if (cachedTemplate.data.variables && cachedTemplate.data.variables.length > 0) {
          const initialValues: Record<string, string> = {}
          cachedTemplate.data.variables.forEach((variable: string) => {
            initialValues[variable] = `Sample ${variable}`
          })
          setVariableValues(initialValues)
        }

        setFetchLoading(false)
        return
      }

      try {
        setFetchLoading(true)
        const response = await fetch(`/api/templates/${id}`, {
          signal,
          cache: "force-cache",
          next: { revalidate: 300 },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch template")
        }

        const data = await response.json()

        // Update cache
        templateCache[id] = {
          data: {
            name: data.name,
            description: data.description || "",
            subject: data.subject,
            content: data.content,
            variables: data.variables || [],
            templateType: data.templateType || "html",
            attachments: data.attachments || [],
          },
          timestamp: now,
        }

        setTemplate(templateCache[id].data)

        // Initialize variable values
        const initialValues: Record<string, string> = {}
        if (data.variables && data.variables.length > 0) {
          data.variables.forEach((variable: string) => {
            initialValues[variable] = `Sample ${variable}`
          })
          setVariableValues(initialValues)
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Error fetching template:", error)
          toast({
            title: "Error",
            description: "Failed to load template. Please try again.",
            variant: "destructive",
          })
        }
      } finally {
        setFetchLoading(false)
      }
    }

    fetchTemplate()

    return () => {
      controller.abort()
    }
  }, [id, toast, getDefaultTemplate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setTemplate((prev) => ({ ...prev, [id]: value }))
  }

  const handleTemplateTypeChange = (value: "html" | "react" | "tailwind") => {
    const newContent = getDefaultTemplate(value)
    setTemplate((prev) => ({
      ...prev,
      templateType: value,
      content: newContent,
      variables: ["name", "company"],
    }))
    setVariableValues({ name: "John Doe", company: "Acme Inc" })
  }

  const handleAddVariable = () => {
    if (!newVariable.trim()) return

    if (template.variables.includes(newVariable)) {
      showConfirmation("Variable already exists", `The variable "${newVariable}" already exists.`, "destructive")
      return
    }

    setTemplate((prev) => ({
      ...prev,
      variables: [...prev.variables, newVariable],
    }))

    setVariableValues((prev) => ({
      ...prev,
      [newVariable]: `Sample ${newVariable}`,
    }))

    setNewVariable("")
  }

  const handleAddAttachment = () => {
    if (!newAttachmentName.trim()) {
      showConfirmation("Name Required", "Please enter a name for the attachment.", "destructive")
      return
    }

    if (newAttachmentType === "static" && !newAttachmentUrl.trim()) {
      showConfirmation("URL Required", "Please enter a URL for the static attachment.", "destructive")
      return
    }

    const newAttachment: Attachment = {
      name: newAttachmentName,
      type: newAttachmentType,
      url: newAttachmentType === "static" ? newAttachmentUrl : undefined,
      description: newAttachmentDescription || undefined,
    }

    setTemplate((prev) => ({
      ...prev,
      attachments: [...prev.attachments, newAttachment],
    }))

    // Reset form
    setNewAttachmentName("")
    setNewAttachmentUrl("")
    setNewAttachmentDescription("")
    setNewAttachmentType("static")

    showConfirmation(
      "Attachment Added",
      `${newAttachmentType === "static" ? "Static" : "Dynamic"} attachment "${newAttachmentName}" has been added.`,
    )
  }

  const handleRemoveAttachment = (index: number) => {
    setTemplate((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }))
  }

  const handleTestAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setTestAttachments((prev) => [...prev, ...newFiles])
    }
  }

  const handleRemoveTestAttachment = (index: number) => {
    setTestAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  // Add a visible confirmation function
  const showConfirmation = (title: string, message: string, type: "default" | "destructive" = "default") => {
    console.log(`Toast: ${title} - ${message}`)
    toast({
      title,
      description: message,
      variant: type,
    })
  }

  const handleRemoveVariable = (variable: string) => {
    setTemplate((prev) => ({
      ...prev,
      variables: prev.variables.filter((v) => v !== variable),
    }))

    setVariableValues((prev) => {
      const newValues = { ...prev }
      delete newValues[variable]
      return newValues
    })
  }

  const handleVariableValueChange = (variable: string, value: string) => {
    setVariableValues((prev) => ({
      ...prev,
      [variable]: value,
    }))
  }

  const replaceVariables = (content: string, variables: Record<string, string>): string => {
    let result = content
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, "g"), value || `{{${key}}}`)
    })
    return result
  }

  const getProcessedPreview = () => {
    const processedContent = replaceVariables(template.content, variableValues)

    // For all templates, ensure we have a complete HTML document
    // This ensures proper rendering in the iframe
    if (template.templateType === "tailwind") {
      return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { margin: 0; padding: 16px; }
        </style>
      </head>
      <body>
        ${processedContent}
      </body>
      </html>
    `
    } else {
      return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin: 0; padding: 16px; }
        </style>
      </head>
      <body>
        ${processedContent}
      </body>
      </html>
    `
    }
  }

  // Optimize the save handler
  const handleSave = async () => {
    // Validate required fields
    if (!template.name.trim()) {
      toast({
        title: "Missing Name",
        description: "Please enter a template name.",
        variant: "destructive",
      })
      return
    }

    if (!template.description.trim()) {
      toast({
        title: "Missing Description",
        description: "Please enter a template description.",
        variant: "destructive",
      })
      return
    }

    if (!template.subject.trim()) {
      toast({
        title: "Missing Subject",
        description: "Please enter an email subject.",
        variant: "destructive",
      })
      return
    }

    if (!template.content.trim()) {
      toast({
        title: "Missing Content",
        description: "Please enter email content.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const method = id === "new" ? "POST" : "PUT"
      const url = id === "new" ? "/api/templates" : `/api/templates/${id}`

      // Add timestamp to prevent caching
      const timestamp = Date.now()
      const finalUrl = `${url}?t=${timestamp}`

      const response = await fetch(finalUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        body: JSON.stringify(template),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || (id === "new" ? "Failed to create template" : "Failed to update template"))
      }

      const data = await response.json()

      toast({
        title: id === "new" ? "Template Created" : "Template Saved",
        description:
          id === "new" ? "Your template has been created successfully." : "Your template has been saved successfully.",
      })

      // Force router refresh to update all routes
      router.refresh()

      if (id === "new") {
        // Navigate to the edit page with the new ID and a timestamp to prevent caching
        router.push(`/templates/${data._id}?t=${Date.now()}`)
      }
    } catch (error) {
      console.error("Error saving template:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save template. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendTest = async () => {
    setIsTestDialogOpen(true)
  }

  const sendTestEmail = async () => {
    if (!testEmailTo) {
      showConfirmation("Email Required", "Please enter a recipient email address.", "destructive")
      return
    }

    setIsTestDialogOpen(false)

    try {
      // Replace variables in the message
      const finalMessage = replaceVariables(template.content, variableValues)
      const finalSubject = replaceVariables(template.subject || "Test Email", variableValues)

      // Create FormData for file uploads
      const formData = new FormData()
      formData.append("from", "test@aimailer.in")
      formData.append("to", testEmailTo)
      formData.append("subject", finalSubject)
      formData.append("html", finalMessage)

      // Add static attachments
      template.attachments
        .filter((att) => att.type === "static" && att.url)
        .forEach((att, index) => {
          formData.append(`staticAttachments[${index}][name]`, att.name)
          formData.append(`staticAttachments[${index}][url]`, att.url || "")
        })

      // Add dynamic test attachments
      testAttachments.forEach((file) => {
        formData.append(`attachments`, file)
      })

      // In a real app, you'd call the API to send the test email
      const response = await fetch("/api/send-email", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to send test email")
      }

      showConfirmation("Test Email Sent", `A test email has been sent to ${testEmailTo}.`)

      // Reset the test email field and attachments
      setTestEmailTo("")
      setTestAttachments([])
    } catch (error) {
      console.error("Error sending test email:", error)
      showConfirmation("Error", "Failed to send test email. Please try again.", "destructive")
    }
  }

  const extractVariablesFromContent = () => {
    const regex = /{{([^}]+)}}/g
    const matches = Array.from(template.content.matchAll(regex))
    const extractedVariables = new Set<string>()

    for (const match of matches) {
      if (match[1]) {
        extractedVariables.add(match[1])
      }
    }

    const newVariables = Array.from(extractedVariables)

    if (newVariables.length > 0) {
      // Add any new variables that don't already exist
      const variablesToAdd = newVariables.filter((v) => !template.variables.includes(v))

      if (variablesToAdd.length > 0) {
        setTemplate((prev) => ({
          ...prev,
          variables: [...prev.variables, ...variablesToAdd],
        }))

        // Initialize values for new variables
        const newValues: Record<string, string> = {}
        variablesToAdd.forEach((variable) => {
          newValues[variable] = `Sample ${variable}`
        })

        setVariableValues((prev) => ({
          ...prev,
          ...newValues,
        }))

        showConfirmation("Variables Extracted", `Found ${variablesToAdd.length} new variables in your template.`)
      } else {
        showConfirmation("No New Variables", "No new variables found in your template.")
      }
    } else {
      showConfirmation(
        "No Variables Found",
        "No variables found in your template. Variables should be in the format {{variable_name}}.",
      )
    }
  }

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt to generate content.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          templateType: template.templateType,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate template content")
      }

      const data = await response.json()

      // Update the template content
      setTemplate((prev) => ({
        ...prev,
        content: data.content,
      }))

      // Add any new variables
      if (data.variables && data.variables.length > 0) {
        const newVariables = data.variables.filter((v: string) => !template.variables.includes(v))

        if (newVariables.length > 0) {
          setTemplate((prev) => ({
            ...prev,
            variables: [...prev.variables, ...newVariables],
          }))

          // Initialize values for new variables
          const newValues: Record<string, string> = {}
          newVariables.forEach((variable: string) => {
            newValues[variable] = `Sample ${variable}`
          })

          setVariableValues((prev) => ({
            ...prev,
            ...newValues,
          }))

          toast({
            title: "Variables Added",
            description: `Added ${newVariables.length} new variables from the generated content.`,
          })
        }
      }

      // Switch to preview mode
      setActiveTab("preview")

      toast({
        title: "Template Generated",
        description: "AI has generated your template content. You can now edit it as needed.",
      })
    } catch (error) {
      console.error("Error generating template:", error)
      toast({
        title: "Generation Failed",
        description: "Failed to generate template content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Use a loading state for the initial fetch
  if (fetchLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10 sm:col-span-2" />
              <Skeleton className="h-10 sm:col-span-2" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[400px] w-full" />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[300px]" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
          <CardDescription>Edit the basic information for your email template</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                Template Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={template.name}
                onChange={handleChange}
                placeholder="Welcome Email"
                required
                aria-required="true"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateType">
                Template Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={template.templateType}
                onValueChange={(value) => handleTemplateTypeChange(value as "html" | "react" | "tailwind")}
              >
                <SelectTrigger id="templateType" aria-label="Select template type">
                  <SelectValue placeholder="Select template type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="html" className="flex items-center">
                    <div className="flex items-center">
                      <Code className="mr-2 h-4 w-4" />
                      HTML
                    </div>
                  </SelectItem>
                  <SelectItem value="react">
                    <div className="flex items-center">
                      <Code className="mr-2 h-4 w-4" />
                      React JSX
                    </div>
                  </SelectItem>
                  <SelectItem value="tailwind">
                    <div className="flex items-center">
                      <Palette className="mr-2 h-4 w-4" />
                      Tailwind CSS
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Choose the format for your email template</p>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Input
                id="description"
                value={template.description}
                onChange={handleChange}
                placeholder="A welcome email for new users"
                required
                aria-required="true"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="subject">
                Email Subject <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subject"
                value={template.subject}
                onChange={handleChange}
                placeholder="Welcome to Our Platform!"
                required
                aria-required="true"
              />
              <p className="text-xs text-muted-foreground">
                Variables like {"{{"}
                <span>name</span>
                {"}}"} will be replaced with actual values when sending
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Email Content</CardTitle>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={extractVariablesFromContent}
                          aria-label="Extract variables from content"
                        >
                          <Variable className="h-4 w-4 mr-2" />
                          Extract Variables
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Find all {"{{"}
                        <span>variables</span>
                        {"}}"} in your template
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab(activeTab === "preview" ? "edit" : "preview")}
                          aria-label={activeTab === "preview" ? "Edit template" : "Preview template"}
                        >
                          {activeTab === "preview" ? (
                            <>
                              <FileText className="h-4 w-4 mr-2" />
                              Edit
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {activeTab === "preview" ? "Switch to edit mode" : "Preview your email"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <CardDescription>
                Write your email content using{" "}
                {template.templateType === "html"
                  ? "HTML"
                  : template.templateType === "react"
                    ? "React JSX"
                    : "Tailwind CSS"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/* Add AI Template Generator */}
              <div className="mb-4 border rounded-md p-4 bg-muted/30">
                <h3 className="text-sm font-medium mb-2">AI Template Generator</h3>
                <AITemplateGenerator
                  templateType={template.templateType}
                  onGenerated={(content, variables) => {
                    setTemplate((prev) => ({ ...prev, content, variables }))

                    // Create sample values for the extracted variables
                    const newValues: Record<string, string> = {}
                    variables.forEach((variable) => {
                      newValues[variable] = `Sample ${variable.charAt(0).toUpperCase() + variable.slice(1)}`
                    })

                    setVariableValues((prev) => ({ ...prev, ...newValues }))

                    // Switch to preview mode to show the generated template
                    setActiveTab("preview")
                  }}
                />
              </div>
              {activeTab === "edit" ? (
                <Textarea
                  id="content"
                  className="min-h-[400px] font-mono border-0 rounded-none resize-none focus-visible:ring-0"
                  value={template.content}
                  onChange={handleChange}
                  placeholder="Enter your email content here..."
                  required
                  aria-label="Email content"
                />
              ) : (
                <div className="border-t">
                  <div className="flex items-center justify-between bg-muted/30 px-4 py-2 border-b">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-xs text-muted-foreground">Email Preview</div>
                    <div></div>
                  </div>
                  <div className="relative" style={{ height: "500px" }}>
                    <iframe
                      srcDoc={getProcessedPreview()}
                      title="Email Preview"
                      className="absolute inset-0 w-full h-full border-0"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Template Actions</CardTitle>
              <CardDescription>Save or test your email template</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="w-full"
                aria-label={id === "new" ? "Create template" : "Save template"}
              >
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Saving..." : id === "new" ? "Create Template" : "Save Template"}
              </Button>
              <Button variant="secondary" onClick={handleSendTest} className="w-full" aria-label="Send test email">
                <Send className="mr-2 h-4 w-4" />
                Send Test Email
              </Button>
            </CardContent>
          </Card>

          <Accordion type="single" collapsible defaultValue="variables" className="w-full">
            <AccordionItem value="variables">
              <AccordionTrigger className="px-4 py-2 bg-card rounded-t-md border border-b-0">
                <div className="flex items-center">
                  <Variable className="mr-2 h-4 w-4" />
                  <span>Template Variables</span>
                  {template.variables.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {template.variables.length}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="border border-t-0 rounded-b-md p-4 bg-card">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add variable (e.g. name)"
                      value={newVariable}
                      onChange={(e) => setNewVariable(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddVariable()}
                      aria-label="New variable name"
                    />
                    <Button onClick={handleAddVariable} type="button" aria-label="Add variable">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {template.variables.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {template.variables.map((variable) => (
                          <Badge key={variable} variant="secondary" className="flex items-center gap-1">
                            {variable}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-transparent"
                              onClick={() => handleRemoveVariable(variable)}
                              aria-label={`Remove ${variable} variable`}
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>

                      <div className="space-y-3 mt-4">
                        <h4 className="text-sm font-medium">Test Values</h4>
                        <div className="max-h-[200px] overflow-y-auto space-y-3 pr-2">
                          {template.variables.map((variable) => (
                            <div key={variable} className="flex gap-2 items-center">
                              <Label htmlFor={`var-${variable}`} className="w-1/3 text-xs">
                                {`{{${variable}}}`}
                              </Label>
                              <Input
                                id={`var-${variable}`}
                                value={variableValues[variable] || ""}
                                onChange={(e) => handleVariableValueChange(variable, e.target.value)}
                                placeholder={`Value for ${variable}`}
                                className="w-2/3 h-8 text-sm"
                                aria-label={`Test value for ${variable}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No variables defined. Add variables to make your template dynamic.
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="attachments">
              <AccordionTrigger className="px-4 py-2 bg-card rounded-t-md border border-b-0">
                <div className="flex items-center">
                  <Paperclip className="mr-2 h-4 w-4" />
                  <span>Attachments</span>
                  {template.attachments.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {template.attachments.length}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="border border-t-0 rounded-b-md p-4 bg-card">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="attachment-name" className="text-xs">
                        Name
                      </Label>
                      <Input
                        id="attachment-name"
                        placeholder="Invoice PDF"
                        value={newAttachmentName}
                        onChange={(e) => setNewAttachmentName(e.target.value)}
                        className="h-8 text-sm"
                        aria-label="Attachment name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="attachment-type" className="text-xs">
                        Type
                      </Label>
                      <Select
                        value={newAttachmentType}
                        onValueChange={(value) => setNewAttachmentType(value as "static" | "dynamic")}
                      >
                        <SelectTrigger id="attachment-type" className="h-8 text-sm" aria-label="Attachment type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="static">Static (URL)</SelectItem>
                          <SelectItem value="dynamic">Dynamic (Upload when sending)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {newAttachmentType === "static" ? (
                    <div className="space-y-2">
                      <Label htmlFor="attachment-url" className="text-xs">
                        URL
                      </Label>
                      <Input
                        id="attachment-url"
                        placeholder="https://example.com/files/invoice.pdf"
                        value={newAttachmentUrl}
                        onChange={(e) => setNewAttachmentUrl(e.target.value)}
                        className="h-8 text-sm"
                        aria-label="Attachment URL"
                      />
                    </div>
                  ) : (
                    <Alert className="bg-muted/50 border-muted">
                      <AlertDescription className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          <span>Dynamic attachments will be uploaded when sending emails</span>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="attachment-description" className="text-xs">
                      Description (Optional)
                    </Label>
                    <Input
                      id="attachment-description"
                      placeholder="Monthly invoice PDF"
                      value={newAttachmentDescription}
                      onChange={(e) => setNewAttachmentDescription(e.target.value)}
                      className="h-8 text-sm"
                      aria-label="Attachment description"
                    />
                  </div>

                  <Button
                    onClick={handleAddAttachment}
                    type="button"
                    size="sm"
                    className="w-full"
                    aria-label="Add attachment"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Attachment
                  </Button>

                  {template.attachments.length > 0 ? (
                    <div className="space-y-2 mt-4">
                      <h4 className="text-sm font-medium">Defined Attachments</h4>
                      <div className="border rounded-md divide-y max-h-[200px] overflow-y-auto">
                        {template.attachments.map((attachment, index) => (
                          <div key={index} className="p-2 flex justify-between items-center">
                            <div>
                              <div className="font-medium flex items-center text-sm">
                                <Paperclip className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="truncate max-w-[150px]">{attachment.name}</span>
                                <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0 h-4">
                                  {attachment.type === "static" ? "Static" : "Dynamic"}
                                </Badge>
                              </div>
                              {attachment.type === "static" && attachment.url && (
                                <div className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                                  {attachment.url}
                                </div>
                              )}
                              {attachment.type === "dynamic" && (
                                <div className="text-[10px] text-muted-foreground">Will be uploaded when sending</div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveAttachment(index)}
                              className="h-6 w-6 p-0"
                              aria-label={`Remove ${attachment.name}`}
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2 text-muted-foreground text-sm">No attachments defined.</div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="help">
              <AccordionTrigger className="px-4 py-2 bg-card rounded-t-md border border-b-0">
                <div className="flex items-center">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help & Tips</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="border border-t-0 rounded-b-md p-4 bg-card">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p>
                      Use{" "}
                      <code className="bg-muted-foreground/20 px-1 rounded">
                        {"{{"}
                        <span>variable_name</span>
                        {"}}"}
                      </code>{" "}
                      syntax to add variables to your template.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p>
                      <strong>Static attachments</strong> are included automatically with every email using the URL you
                      provide.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p>
                      <strong>Dynamic attachments</strong> require uploading files when sending the email.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p>Click "Extract Variables" to automatically find all variables in your template content.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p>Use the "Preview" button to see how your email will look with the test values.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>
              Enter the recipient email address and add any dynamic attachments to send a test email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="test-email-from">From</Label>
              <Input id="test-email-from" value="test@aimailer.in" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-email-to">To</Label>
              <Input
                id="test-email-to"
                type="email"
                placeholder="recipient@example.com"
                value={testEmailTo}
                onChange={(e) => setTestEmailTo(e.target.value)}
                required
                aria-required="true"
              />
            </div>

            {/* Dynamic attachments section */}
            {template.attachments.some((att) => att.type === "dynamic") && (
              <div className="space-y-2 pt-2">
                <Label>Dynamic Attachments</Label>
                <div className="border rounded-md p-3">
                  <Input
                    type="file"
                    onChange={handleTestAttachmentUpload}
                    multiple
                    className="mb-2"
                    aria-label="Upload attachments"
                  />

                  {testAttachments.length > 0 ? (
                    <div className="space-y-2 mt-3">
                      {testAttachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
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
                            onClick={() => handleRemoveTestAttachment(index)}
                            className="h-6 w-6 p-0"
                            aria-label={`Remove ${file.name}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No files selected. Upload files to include as dynamic attachments.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTestDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={sendTestEmail}>
              <Send className="mr-2 h-4 w-4" />
              Send Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
