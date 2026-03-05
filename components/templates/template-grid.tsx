"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Edit, Plus, Send, Trash, Code, Palette, FileText, Calendar, Eye, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"

interface Template {
  _id: string
  name: string
  description: string
  content: string
  templateType: "html" | "react" | "tailwind"
  createdAt: string
  updatedAt: string
  usageCount?: number
}

export function TemplateGrid() {
  const router = useRouter()
  const { toast } = useToast()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(Date.now()) // Used to force refetch

  // Fetch templates with no caching
  const fetchTemplates = async () => {
    try {
      setLoading(true)

      // Add timestamp to URL to bypass browser cache
      const timestamp = Date.now()
      const response = await fetch(`/api/templates?t=${timestamp}`, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch templates")
      }

      const data = await response.json()
      setTemplates(data)
      setError(null)
    } catch (error) {
      console.error("Error fetching templates:", error)
      setError("Failed to load templates")
    } finally {
      setLoading(false)
    }
  }

  // Force refresh function
  const forceRefresh = () => {
    setRefreshKey(Date.now())
  }

  useEffect(() => {
    fetchTemplates()

    // Set up polling to refresh data every 30 seconds
    const intervalId = setInterval(() => {
      fetchTemplates()
    }, 30000)

    return () => clearInterval(intervalId)
  }, [refreshKey]) // Depend on refreshKey to force refetch

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id)

      const response = await fetch(`/api/templates/${id}?t=${Date.now()}`, {
        method: "DELETE",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete template")
      }

      // Update local state immediately
      setTemplates((prevTemplates) => prevTemplates.filter((template) => template._id !== id))

      // Force router to refresh all routes
      router.refresh()

      // Force a complete refetch after a short delay
      setTimeout(() => {
        forceRefresh()
      }, 300)

      toast({
        title: "Template Deleted",
        description: "The template has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting template:", error)
      toast({
        title: "Error",
        description: "Failed to delete template. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  // Function to get a safe preview of the template content
  const getSafePreview = (content: string) => {
    // Strip potentially harmful tags and attributes
    const sanitized = content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/on\w+="[^"]*"/g, "")
      .replace(/javascript:/g, "")

    // Limit the preview length
    return sanitized.length > 500 ? sanitized.substring(0, 500) + "..." : sanitized
  }

  // Get template type icon
  const getTemplateTypeIcon = (type: string) => {
    switch (type) {
      case "react":
        return <Code className="h-4 w-4" />
      case "tailwind":
        return <Palette className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  // Get template type label
  const getTemplateTypeLabel = (type: string) => {
    switch (type) {
      case "react":
        return "React JSX"
      case "tailwind":
        return "Tailwind CSS"
      default:
        return "HTML"
    }
  }

  // Get template type color
  const getTemplateTypeColor = (type: string) => {
    switch (type) {
      case "react":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
      case "tailwind":
        return "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
    }
  }

  // Memoize the template cards to prevent unnecessary re-renders
  const templateCards = useMemo(() => {
    if (loading) {
      return Array(6)
        .fill(0)
        .map((_, i) => (
          <Card key={i} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-2 space-y-1">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="pb-2">
              <Skeleton className="h-[120px] w-full rounded-md" />
            </CardContent>
            <CardFooter className="flex justify-between pt-2 pb-4">
              <Skeleton className="h-9 w-20" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </CardFooter>
          </Card>
        ))
    }

    if (error) {
      return (
        <div className="col-span-full p-8 text-center border rounded-lg bg-muted/10">
          <h3 className="text-lg font-medium mb-2 text-red-500">Error Loading Templates</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={forceRefresh}>Try Again</Button>
        </div>
      )
    }

    if (templates.length === 0) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/10">
          <div className="bg-primary/10 p-3 rounded-full mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">No templates found</h3>
          <p className="text-muted-foreground mb-4">Create your first email template to get started.</p>
          <Button onClick={() => router.push("/templates/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Template
          </Button>
        </div>
      )
    }

    return templates.map((template) => (
      <Card
        key={template._id}
        className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 border-t-4 group"
        style={{
          borderTopColor:
            template.templateType === "react"
              ? "#3b82f6"
              : template.templateType === "tailwind"
                ? "#14b8a6"
                : "#6b7280",
        }}
      >
        <CardHeader className="pb-2 space-y-1">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold line-clamp-1">{template.name}</CardTitle>
            <Badge
              variant="outline"
              className={`flex items-center gap-1 text-xs ${getTemplateTypeColor(template.templateType)}`}
            >
              {getTemplateTypeIcon(template.templateType)}
              <span className="hidden sm:inline">{getTemplateTypeLabel(template.templateType)}</span>
            </Badge>
          </div>
          <CardDescription className="line-clamp-1">{template.description}</CardDescription>
        </CardHeader>

        <CardContent className="pb-2">
          <div className="h-[120px] overflow-hidden rounded-md border bg-muted/40 p-2 text-xs relative group">
            <div className="card-preview relative w-full aspect-video overflow-hidden rounded-md border">
              <iframe
                title={`Card preview of ${template.name}`}
                srcDoc={`<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    ${template.content}
  </body>
</html>`}
                sandbox="allow-same-origin"
                className="w-full h-full absolute inset-0 border-0"
              />
            </div>

            {/* Preview overlay */}
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center transition-opacity duration-200 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/templates/${template._id}`} className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  <span>Preview Template</span>
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDistanceToNow(new Date(template.updatedAt), { addSuffix: true })}</span>
            </div>
            {template.usageCount !== undefined && <span className="text-xs">Used {template.usageCount} times</span>}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between pt-2 pb-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" asChild className="text-xs h-9">
                  <Link href={`/templates/${template._id}`}>
                    <Edit className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Edit this template</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" asChild className="text-xs h-9">
                    <Link href={`/send?template=${template._id}&t=${Date.now()}`}>
                      <Send className="mr-1.5 h-3.5 w-3.5" />
                      Send
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Send email using this template</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(template._id)}
                    disabled={isDeleting === template._id}
                    className="text-xs h-9"
                  >
                    <Trash className="mr-1.5 h-3.5 w-3.5" />
                    {isDeleting === template._id ? "Deleting..." : "Delete"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Delete this template</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardFooter>
      </Card>
    ))
  }, [templates, loading, error, router, isDeleting])

  return (
    <>
      <div className="flex justify-between mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={forceRefresh}
          className="flex items-center gap-1"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>

        <Button onClick={() => router.push("/templates/new")} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Create New Template
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{templateCards}</div>
    </>
  )
}
