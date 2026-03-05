import { type NextRequest, NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

// Make sure we have the API key
if (!process.env.OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY environment variable")
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, templateType } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Create a system prompt that instructs the AI how to format the response
    const systemPrompt = `You are an expert email template designer. 
    Create a professional ${templateType === "html" ? "HTML" : templateType === "react" ? "React JSX" : "Tailwind CSS"} email template based on the user's request.
    
    Important guidelines:
    - Use the {{variable_name}} syntax for any dynamic content (e.g., {{name}}, {{company}}, etc.)
    - Create a well-structured, responsive email template
    - Include appropriate styling for a professional look
    - For HTML templates, use inline CSS styles
    - For React templates, use style objects
    - For Tailwind templates, use Tailwind CSS classes
    - Make sure the template is complete and ready to use
    - Identify 3-5 key variables that would make the template customizable
    
    Return ONLY the template code without any explanations or markdown formatting.`

    // Generate the template content using OpenAI
    const { text } = await generateText({
      model: openai("gpt-4o", { apiKey: process.env.OPENAI_API_KEY }),
      system: systemPrompt,
      prompt: prompt,
      temperature: 0.7,
      maxTokens: 2000,
    })

    // Extract potential variables from the generated content
    const variableRegex = /{{([^}]+)}}/g
    const matches = Array.from(text.matchAll(variableRegex))
    const extractedVariables = Array.from(new Set(matches.map((match) => match[1])))

    return NextResponse.json({
      content: text,
      variables: extractedVariables,
    })
  } catch (error) {
    console.error("Error generating template:", error)
    return NextResponse.json({ error: "Failed to generate template content" }, { status: 500 })
  }
}
