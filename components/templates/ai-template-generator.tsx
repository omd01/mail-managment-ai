"use client"

import { useState } from "react"
import { Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"

interface AITemplateGeneratorProps {
  templateType: string
  onGenerated: (content: string, variables: string[]) => void
}

export function AITemplateGenerator({ templateType, onGenerated }: AITemplateGeneratorProps) {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const generateTemplate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a description of the template you want to generate.",
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
          prompt,
          templateType,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate template")
      }

      const data = await response.json()

      onGenerated(data.content, data.variables)

      toast({
        title: "Template generated",
        description: "AI has created your template. You can now edit it as needed.",
      })
    } catch (error) {
      console.error("Error generating template:", error)
      toast({
        title: "Generation failed",
        description: "There was an error generating your template. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Describe the template you want (e.g., 'Create a job recommendation email')"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="flex-1"
          disabled={isGenerating}
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={generateTemplate} disabled={isGenerating} className="gap-1">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Generate a template using AI based on your description</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <p className="text-xs text-muted-foreground">
        Tip: For dynamic content, the AI will use the {"{{"}
        <span>variable_name</span>
        {"}}"} syntax. Be specific about the type of email you want.
      </p>
    </div>
  )
}
