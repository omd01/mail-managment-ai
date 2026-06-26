"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Send, Loader2, Mail, LayoutTemplate, Cable, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { compileTemplate } from "@/lib/template-compiler"

// Interfaces
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
}

interface VariableValues {
  [key: string]: string
}

export function SendEmailForm() {
  const { toast } = useToast()
  const searchParams = useSearchParams()

  // Loading States
  const [loading, setLoading] = useState(false)
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [integrationsLoading, setIntegrationsLoading] = useState(true)

  // Data States
  const [templates, setTemplates] = useState<Template[]>([])
  const [availableEmails, setAvailableEmails] = useState<AvailableEmail[]>([])
  const [integrations, setIntegrations] = useState<Record<string, boolean>>({ aws: false, resend: false })

  // Selection States
  const [selectedTemplate, setSelectedTemplate] = useState<string>("none")
  const [emailMode, setEmailMode] = useState<"blank" | "template">("blank")
  const [selectedProvider, setSelectedProvider] = useState<string>("auto")
  const [fromEmail, setFromEmail] = useState("")

  // Form Data
  const [emailData, setEmailData] = useState({
    to: "",
    subject: "",
    message: "",
  })
  const [variableValues, setVariableValues] = useState<VariableValues>({})

  // UI States
  const [error, setError] = useState<string | null>(null)
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null)
  const [previewHtml, setPreviewHtml] = useState<string>("")

  // Fetch Integrations
  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const res = await fetch("/api/integrations")
        if (res.ok) {
          const data = await res.json()
          const statusMap: Record<string, boolean> = {}
          data.integrations.forEach((i: any) => {
            statusMap[i.provider] = i.isActive
          })
          setIntegrations(prev => ({ ...prev, ...statusMap }))
        }
      } catch (error) {
        console.error("Failed to fetch integrations", error)
      } finally {
        setIntegrationsLoading(false)
      }
    }
    fetchIntegrations()
  }, [])

  // Fetch Available Emails
  const fetchAvailableEmails = async () => {
    try {
      const response = await fetch("/api/settings/emails", {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      })

      if (!response.ok) throw new Error("Failed to fetch available emails")

      const data = await response.json()
      const activeEmails = data.filter((email: AvailableEmail) => email.isActive)
      setAvailableEmails(activeEmails)

      if (activeEmails.length > 0 && !fromEmail) {
        setFromEmail(activeEmails[0].email)
      }
    } catch (error) {
      console.error("Error fetching available emails:", error)
    }
  }

  // Fetch Templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setTemplatesLoading(true)
        const response = await fetch("/api/templates")
        if (!response.ok) throw new Error("Failed to fetch templates")

        const data = await response.json()
        setTemplates(data)

        // URL Params Logic
        const templateId = searchParams.get("template")
        if (templateId) {
          setSelectedTemplate(templateId)
          setEmailMode("template")
          
          // Fetch the full template detail to avoid truncated list content
          try {
            const res = await fetch(`/api/templates/${templateId}`)
            if (res.ok) {
              const template = await res.json()
              setCurrentTemplate(template)
              setEmailData((prev) => ({
                ...prev,
                subject: template.subject || "No Subject",
                message: template.content || "",
              }))

              if (template.variables && template.variables.length > 0) {
                const initialValues: VariableValues = {}
                template.variables.forEach((variable: string) => {
                  initialValues[variable] = ""
                })
                setVariableValues(initialValues)
                setPreviewHtml(compileTemplate(template.content, (template.templateType || "html") as any, initialValues))
              } else {
                setVariableValues({})
                setPreviewHtml(compileTemplate(template.content, (template.templateType || "html") as any, {}))
              }
            }
          } catch (err) {
            console.error("Error loading template details:", err)
          }
        }
      } catch (error) {
        console.error("Error fetching templates:", error)
        setError("Failed to load templates.")
      } finally {
        setTemplatesLoading(false)
      }
    }

    fetchTemplates()
    fetchAvailableEmails()
  }, [searchParams])

  // Handlers
  const handleTemplateChange = async (value: string) => {
    setSelectedTemplate(value)
    if (value === "none") {
      setEmailData(prev => ({ ...prev, subject: "", message: "" }))
      setCurrentTemplate(null)
      setVariableValues({})
      setPreviewHtml("")
      return
    }

    try {
      // Fetch full, untruncated template details
      const response = await fetch(`/api/templates/${value}`)
      if (!response.ok) throw new Error("Failed to fetch template details")
      const template = await response.json()

      setCurrentTemplate(template)
      setEmailData(prev => ({
        ...prev,
        subject: template.subject || "No Subject",
        message: template.content || "",
      }))

      if (template.variables && template.variables.length > 0) {
        const initialValues: VariableValues = {}
        template.variables.forEach(variable => initialValues[variable] = "")
        setVariableValues(initialValues)
        setPreviewHtml(compileTemplate(template.content, (template.templateType || "html") as any, initialValues))
      } else {
        setVariableValues({})
        setPreviewHtml(compileTemplate(template.content, (template.templateType || "html") as any, {}))
      }
    } catch (err) {
      console.error("Error loading template details:", err)
      toast({
        title: "Error Loading Template",
        description: "Failed to load template content.",
        variant: "destructive",
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setEmailData(prev => ({ ...prev, [id]: value }))
  }

  const handleVariableChange = (variable: string, value: string) => {
    setVariableValues(prev => {
      const newValues = { ...prev, [variable]: value }
      if (currentTemplate) {
        setPreviewHtml(compileTemplate(currentTemplate.content, (currentTemplate.templateType || "html") as any, newValues))
        if (currentTemplate.subject) {
          setEmailData(prevData => ({
            ...prevData,
            subject: replaceVariables(currentTemplate.subject, newValues)
          }))
        }
      }
      return newValues
    })
  }

  const replaceVariables = (content: string, variables: VariableValues): string => {
    let result = content
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, "g"), value || `{{${key}}}`)
    })
    return result
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let finalMessage = emailData.message
      let finalSubject = emailData.subject

      if (emailMode === "template" && currentTemplate) {
        finalMessage = compileTemplate(currentTemplate.content, (currentTemplate.templateType || "html") as any, variableValues)
        if (!finalSubject && currentTemplate.subject) {
          finalSubject = replaceVariables(currentTemplate.subject, variableValues)
        } else if (!finalSubject) {
          finalSubject = "No Subject"
        }
      }

      if (!emailData.to) throw new Error("Recipient email is required")
      if (!finalSubject) throw new Error("Email subject is required")
      if (!finalMessage) throw new Error("Email content is required")

      // API Call
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromEmail,
          to: emailData.to,
          subject: finalSubject,
          html: finalMessage,
          templateId: selectedTemplate !== "none" ? selectedTemplate : undefined,
          variables: emailMode === "template" ? variableValues : undefined,
          provider: selectedProvider !== 'auto' ? selectedProvider : undefined
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to send email")

      toast({
        title: "Email Sent Successfully",
        description: `Sent via ${data.provider || 'auto-selected provider'} from ${fromEmail || 'default identity'}`,
      })

      // Reset Logic (Simplified)
      if (emailMode === "blank") {
        setEmailData(prev => ({ ...prev, to: "", subject: "", message: "" }))
      } else {
        setEmailData(prev => ({ ...prev, to: "" }))
        // Reset variables
        if (currentTemplate?.variables) {
          const reset: VariableValues = {}
          currentTemplate.variables.forEach(v => reset[v] = "")
          setVariableValues(reset)
          setPreviewHtml(replaceVariables(currentTemplate.content, reset))
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send email."
      setError(errorMessage)
      toast({
        title: "Error Sending Email",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Render Helpers
  const renderGatewayOption = (provider: string, label: string) => {
    const isActive = integrations[provider]
    return (
      <SelectItem value={provider} disabled={!isActive && provider !== 'auto'}>
        <div className="flex items-center gap-2">
          <span>{label}</span>
          {provider !== 'auto' && (
            <Badge variant="outline" className={`text-[10px] h-4 px-1 ${isActive ? 'text-green-500 border-green-900 bg-green-900/10' : 'text-neutral-500 border-neutral-800'}`}>
              {isActive ? 'ACTIVE' : 'INACTIVE'}
            </Badge>
          )}
        </div>
      </SelectItem>
    )
  }

  return (
    <div className="grid gap-6 animate-in fade-in duration-500">

      {/* Configuration Card */}
      <div className="editorial-card p-6 border border-neutral-200 bg-white shadow-sm">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="label-mono text-neutral-500 font-medium">Gateway_Provider</Label>
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger className="w-full bg-white border-neutral-200 focus-visible:ring-neutral-400 h-10 py-2 text-neutral-900">
                <SelectValue placeholder="Select Gateway" />
              </SelectTrigger>
              <SelectContent className="bg-white border-neutral-200 z-[999] text-neutral-900">
                <SelectItem value="auto">
                  <span className="font-bold">Auto (Best Available)</span>
                </SelectItem>
                {renderGatewayOption('aws', 'Amazon SES')}
                {renderGatewayOption('resend', 'Resend API')}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-neutral-500 font-mono">
              Selects the Email Service Provider (ESP) infrastructure.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="label-mono text-neutral-500 font-medium">From_Identity</Label>
            <Select value={fromEmail} onValueChange={setFromEmail}>
              <SelectTrigger className="w-full bg-white border-neutral-200 focus-visible:ring-neutral-400 h-10 py-2 text-neutral-900">
                <SelectValue placeholder="Select Identity" />
              </SelectTrigger>
              <SelectContent className="bg-white border-neutral-200 z-[999] text-neutral-900">
                {availableEmails.length > 0 ? (
                  availableEmails.map((email) => (
                    <SelectItem key={email._id} value={email.email}>
                      <span className="font-mono text-xs text-neutral-800">{email.email}</span>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="test@aimailer.com" disabled>No verified identities found</SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-neutral-500 font-mono">
              Must be verified in the selected Gateway.
            </p>
          </div>
        </div>
      </div>

      <div className="editorial-card border border-neutral-200 bg-white overflow-hidden shadow-sm">
        <Tabs
          defaultValue="blank"
          value={emailMode}
          onValueChange={(value) => setEmailMode(value as "blank" | "template")}
          className="w-full"
        >
          <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-2">
            <TabsList className="bg-transparent border-0 p-0 h-auto gap-6">
              <TabsTrigger
                value="blank"
                className="data-[state=active]:bg-transparent data-[state=active]:text-neutral-900 data-[state=active]:shadow-none text-neutral-500 rounded-none border-b-2 border-transparent data-[state=active]:border-neutral-900 px-0 py-2 font-mono text-xs uppercase tracking-wider transition-all"
              >
                <Mail className="h-3 w-3 mr-2" />
                Blank_Canvas
              </TabsTrigger>
              <TabsTrigger
                value="template"
                className="data-[state=active]:bg-transparent data-[state=active]:text-neutral-900 data-[state=active]:shadow-none text-neutral-500 rounded-none border-b-2 border-transparent data-[state=active]:border-neutral-900 px-0 py-2 font-mono text-xs uppercase tracking-wider transition-all"
              >
                <LayoutTemplate className="h-3 w-3 mr-2" />
                Use_Template
              </TabsTrigger>
            </TabsList>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">

            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-600">
                <AlertTitle className="font-mono text-xs uppercase">Error_Occurred</AlertTitle>
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="to" className="label-mono text-neutral-500 font-medium">Recipient_To</Label>
                <Input
                  id="to"
                  placeholder="recipient@example.com, another@domain.com"
                  value={emailData.to}
                  onChange={handleChange}
                  className="bg-white border-neutral-200 text-neutral-900 focus-visible:ring-neutral-400 font-mono text-sm placeholder:text-neutral-400"
                  disabled={loading}
                />
              </div>

              {emailMode === 'template' && (
                <div className="grid gap-2">
                  <Label htmlFor="template" className="label-mono text-neutral-500 font-medium">Select_Template</Label>
                  <Select
                    value={selectedTemplate}
                    onValueChange={handleTemplateChange}
                    disabled={loading || templatesLoading}
                  >
                    <SelectTrigger id="template" className="bg-white border-neutral-200 focus-visible:ring-neutral-400 text-neutral-900">
                      <SelectValue placeholder={templatesLoading ? "Loading..." : "Choose a template..."} />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-neutral-200 text-neutral-900">
                      <SelectItem value="none">None</SelectItem>
                      {templates.map(t => (
                        <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="subject" className="label-mono text-neutral-500 font-medium">Subject_Line</Label>
                <Input
                  id="subject"
                  placeholder="Important Notification..."
                  value={emailData.subject}
                  onChange={handleChange}
                  className="bg-white border-neutral-200 text-neutral-900 focus-visible:ring-neutral-400 placeholder:text-neutral-400"
                  disabled={loading || (emailMode === 'template' && !!currentTemplate?.subject)}
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="message" className="label-mono text-neutral-500 font-medium flex justify-between">
                  <span>Content_Body</span>
                  {emailMode === 'template' && <span className="text-neutral-400 text-[10px]">READ_ONLY_TEMPLATE</span>}
                </Label>

                {emailMode === 'blank' ? (
                  <Textarea
                    id="message"
                    placeholder="Type your message content here..."
                    className="min-h-[300px] w-full bg-white border-neutral-200 focus-visible:ring-neutral-400 text-neutral-900 font-mono text-sm leading-relaxed placeholder:text-neutral-400"
                    value={emailData.message}
                    onChange={handleChange}
                    disabled={loading}
                  />
                ) : (
                  <div className="space-y-4">
                    {currentTemplate?.variables && currentTemplate.variables.length > 0 && (
                      <div className="p-4 border border-neutral-200 bg-neutral-50/50 rounded space-y-3 shadow-sm">
                        <h4 className="label-mono text-xs text-neutral-500 mb-2">Variables_Input</h4>
                        {currentTemplate.variables.map(v => (
                          <div key={v} className="grid gap-1.5">
                            <Label htmlFor={v} className="text-xs text-neutral-500 font-medium">{v}</Label>
                            <Input
                              id={v}
                              value={variableValues[v] || ""}
                              onChange={(e) => handleVariableChange(v, e.target.value)}
                              className="bg-white border-neutral-200 focus-visible:ring-neutral-400 text-neutral-900 h-8 text-xs placeholder:text-neutral-400"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="hidden md:block text-xs text-neutral-400 font-mono">
                      Template content is rendered in the preview panel.
                    </div>
                  </div>
                )}

              </div>

              {/* Preview Panel */}
              <div className="space-y-2">
                <Label className="label-mono text-neutral-500 font-medium">Render_Preview</Label>
                <div className="border border-neutral-200 rounded bg-white overflow-hidden h-[300px] md:h-[400px] relative group shadow-sm">
                  <div className="absolute top-0 left-0 right-0 bg-neutral-50 border-b border-neutral-200 px-3 py-2 flex items-center justify-between z-10">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-neutral-300" />
                      <div className="w-2 h-2 rounded-full bg-neutral-300" />
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500">HTML_VIEW</span>
                  </div>
                  <iframe
                    srcDoc={(() => {
                      const content = emailMode === 'blank' ? emailData.message : previewHtml
                      const trimmed = (content || "").trim().toLowerCase()
                      const isFullList = trimmed.startsWith("<!doctype") || trimmed.startsWith("<html")

                      // If it's a full HTML document, render as is. 
                      // Otherwise wrap in our styles.
                      if (isFullList) return content

                      return `<!DOCTYPE html><html><head><style>body{font-family:system-ui,sans-serif;color:#111;padding:16px;margin:0;} a{color:#2563eb}</style></head><body>${content || '<span style="color:#888">No content...</span>'}</body></html>`
                    })()}
                    className="w-full h-full pt-8 bg-white"
                    sandbox="allow-same-origin"
                    title="Preview"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 flex justify-end">
              <Button
                type="submit"
                disabled={loading}
                className="btn-handcrafted bg-neutral-900 text-white hover:bg-neutral-800 w-full sm:w-auto shadow-sm"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Transmit_Message
              </Button>
            </div>
          </form>
        </Tabs>
      </div>
    </div>
  )
}
