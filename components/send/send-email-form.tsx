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
          const template = data.find((t: Template) => t._id === templateId)
          if (template) {
            setCurrentTemplate(template)
            setEmailData((prev) => ({
              ...prev,
              subject: template.subject,
              message: template.content,
            }))

            if (template.variables && template.variables.length > 0) {
              const initialValues: VariableValues = {}
              template.variables.forEach((variable: string) => {
                initialValues[variable] = ""
              })
              setVariableValues(initialValues)
              setPreviewHtml(replaceVariables(template.content, initialValues))
            }
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
  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value)
    if (value === "none") {
      setEmailData(prev => ({ ...prev, subject: "", message: "" }))
      setCurrentTemplate(null)
      setVariableValues({})
      setPreviewHtml("")
      return
    }

    const template = templates.find((t) => t._id === value)
    if (template) {
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
        setPreviewHtml(replaceVariables(template.content, initialValues))
      } else {
        setVariableValues({})
        setPreviewHtml(template.content || "")
      }
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
        setPreviewHtml(replaceVariables(currentTemplate.content, newValues))
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
        finalMessage = replaceVariables(currentTemplate.content, variableValues)
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
      <div className="editorial-card p-6 border border-neutral-800 bg-black/40 backdrop-blur-sm">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="label-mono text-neutral-400">Gateway_Provider</Label>
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger className="w-full bg-neutral-900 border-neutral-800 focus:ring-neutral-700 h-10 py-2">
                <SelectValue placeholder="Select Gateway" />
              </SelectTrigger>
              <SelectContent className="bg-black border-neutral-800 z-[999]">
                <SelectItem value="auto">
                  <span className="font-bold">Auto (Best Available)</span>
                </SelectItem>
                {renderGatewayOption('aws', 'Amazon SES')}
                {renderGatewayOption('resend', 'Resend API')}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-neutral-600 font-mono">
              Selects the Email Service Provider (ESP) infrastructure.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="label-mono text-neutral-400">From_Identity</Label>
            <Select value={fromEmail} onValueChange={setFromEmail}>
              <SelectTrigger className="w-full bg-neutral-900 border-neutral-800 focus:ring-neutral-700 h-10 py-2">
                <SelectValue placeholder="Select Identity" />
              </SelectTrigger>
              <SelectContent className="bg-black border-neutral-800 z-[999]">
                {availableEmails.length > 0 ? (
                  availableEmails.map((email) => (
                    <SelectItem key={email._id} value={email.email}>
                      <span className="font-mono text-xs">{email.email}</span>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="test@aimailer.com" disabled>No verified identities found</SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-neutral-600 font-mono">
              Must be verified in the selected Gateway.
            </p>
          </div>
        </div>
      </div>

      <div className="editorial-card border border-neutral-800 bg-black/40 backdrop-blur-sm overflow-hidden">
        <Tabs
          defaultValue="blank"
          value={emailMode}
          onValueChange={(value) => setEmailMode(value as "blank" | "template")}
          className="w-full"
        >
          <div className="border-b border-neutral-800 bg-neutral-900/30 px-6 py-2">
            <TabsList className="bg-transparent border-0 p-0 h-auto gap-6">
              <TabsTrigger
                value="blank"
                className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none text-neutral-500 rounded-none border-b-2 border-transparent data-[state=active]:border-white px-0 py-2 font-mono text-xs uppercase tracking-wider transition-all"
              >
                <Mail className="h-3 w-3 mr-2" />
                Blank_Canvas
              </TabsTrigger>
              <TabsTrigger
                value="template"
                className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none text-neutral-500 rounded-none border-b-2 border-transparent data-[state=active]:border-white px-0 py-2 font-mono text-xs uppercase tracking-wider transition-all"
              >
                <LayoutTemplate className="h-3 w-3 mr-2" />
                Use_Template
              </TabsTrigger>
            </TabsList>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">

            {error && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-900/50 text-red-400">
                <AlertTitle className="font-mono text-xs uppercase">Error_Occurred</AlertTitle>
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="to" className="label-mono text-neutral-400">Recipient_To</Label>
                <Input
                  id="to"
                  placeholder="recipient@example.com, another@domain.com"
                  value={emailData.to}
                  onChange={handleChange}
                  className="bg-neutral-900 border-neutral-800 font-mono text-sm"
                  disabled={loading}
                />
              </div>

              {emailMode === 'template' && (
                <div className="grid gap-2">
                  <Label htmlFor="template" className="label-mono text-neutral-400">Select_Template</Label>
                  <Select
                    value={selectedTemplate}
                    onValueChange={handleTemplateChange}
                    disabled={loading || templatesLoading}
                  >
                    <SelectTrigger id="template" className="bg-neutral-900 border-neutral-800">
                      <SelectValue placeholder={templatesLoading ? "Loading..." : "Choose a template..."} />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-800">
                      <SelectItem value="none">None</SelectItem>
                      {templates.map(t => (
                        <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="subject" className="label-mono text-neutral-400">Subject_Line</Label>
                <Input
                  id="subject"
                  placeholder="Important Notification..."
                  value={emailData.subject}
                  onChange={handleChange}
                  className="bg-neutral-900 border-neutral-800"
                  disabled={loading || (emailMode === 'template' && !!currentTemplate?.subject)} // Subject editable? Usually yes, even with template.
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="message" className="label-mono text-neutral-400 flex justify-between">
                  <span>Content_Body</span>
                  {emailMode === 'template' && <span className="text-neutral-600 text-[10px]">READ_ONLY_TEMPLATE</span>}
                </Label>

                {emailMode === 'blank' ? (
                  <Textarea
                    id="message"
                    placeholder="Type your message content here..."
                    className="min-h-[300px] w-full bg-neutral-900 border-neutral-800 font-mono text-sm leading-relaxed"
                    value={emailData.message}
                    onChange={handleChange}
                    disabled={loading}
                  />
                ) : (
                  <div className="space-y-4">
                    {currentTemplate?.variables && currentTemplate.variables.length > 0 && (
                      <div className="p-4 border border-neutral-800 bg-neutral-900/30 rounded space-y-3">
                        <h4 className="label-mono text-xs text-neutral-500 mb-2">Variables_Input</h4>
                        {currentTemplate.variables.map(v => (
                          <div key={v} className="grid gap-1.5">
                            <Label htmlFor={v} className="text-xs text-neutral-400">{v}</Label>
                            <Input
                              id={v}
                              value={variableValues[v] || ""}
                              onChange={(e) => handleVariableChange(v, e.target.value)}
                              className="bg-black border-neutral-800 h-8"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="hidden md:block text-xs text-neutral-600">
                      Template content is rendered in the preview panel.
                    </div>
                  </div>
                )}

              </div>

              {/* Preview Panel */}
              <div className="space-y-2">
                <Label className="label-mono text-neutral-400">Render_Preview</Label>
                <div className="border border-neutral-800 rounded bg-neutral-900 overflow-hidden h-[300px] md:h-[400px] relative group">
                  <div className="absolute top-0 left-0 right-0 bg-neutral-950 border-b border-neutral-800 px-3 py-2 flex items-center justify-between z-10">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-neutral-700" />
                      <div className="w-2 h-2 rounded-full bg-neutral-700" />
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500">HTML_VIEW</span>
                  </div>
                  <iframe
                    srcDoc={(() => {
                      const content = emailMode === 'blank' ? emailData.message : previewHtml
                      const trimmed = (content || "").trim().toLowerCase()
                      const isFullList = trimmed.startsWith("<!doctype") || trimmed.startsWith("<html")

                      // If it's a full HTML document, render as is. 
                      // Otherwise wrap in our dark mode styling.
                      if (isFullList) return content

                      return `<!DOCTYPE html><html><head><style>body{font-family:system-ui,sans-serif;color:#fff;padding:16px;margin:0;} a{color:#3b82f6}</style></head><body>${content || '<span style="color:#666">No content...</span>'}</body></html>`
                    })()}
                    className="w-full h-full pt-8 bg-white"
                    sandbox="allow-same-origin"
                    title="Preview"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800 flex justify-end">
              <Button
                type="submit"
                disabled={loading}
                className="btn-handcrafted bg-white text-black hover:bg-neutral-200 w-full sm:w-auto"
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
