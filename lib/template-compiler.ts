/**
 * Template compiler utility for converting React JSX and Tailwind CSS to HTML
 */

// Function to compile React JSX to HTML
export function compileReactTemplate(code: string, variables: Record<string, string> = {}): string {
  try {
    // Replace React-style props with HTML attributes
    let processedCode = code.replace(/className=/g, "class=").replace(/style={{([^}]+)}}/g, (match, styles) => {
      // Convert React style object to inline CSS
      const styleObj = styles
        .split(",")
        .map((style: string) => {
          const [key, value] = style.split(":").map((s: string) => s.trim())
          // Convert camelCase to kebab-case
          const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase()
          // Remove quotes from values
          const cssValue = value.replace(/['"`]/g, "")
          return `${cssKey}: ${cssValue}`
        })
        .join("; ")

      return `style="${styleObj}"`
    })

    // Replace variables
    Object.entries(variables).forEach(([key, value]) => {
      processedCode = processedCode.replace(new RegExp(`{{${key}}}`, "g"), value || `{{${key}}}`)
    })

    return processedCode
  } catch (error) {
    console.error("Error compiling React template:", error)
    return `<div class="text-red-500">Error compiling template: ${error instanceof Error ? error.message : String(error)}</div>`
  }
}

// Function to compile Tailwind CSS to HTML with inline styles
export function compileTailwindTemplate(code: string, variables: Record<string, string> = {}): string {
  try {
    // For Tailwind, we'll keep the classes but wrap the content in a proper HTML document
    // that includes the Tailwind CDN
    let processedCode = code

    // Replace variables
    Object.entries(variables).forEach(([key, value]) => {
      processedCode = processedCode.replace(new RegExp(`{{${key}}}`, "g"), value || `{{${key}}}`)
    })

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        ${processedCode}
      </body>
      </html>
    `
  } catch (error) {
    console.error("Error compiling Tailwind template:", error)
    return `<div class="text-red-500">Error compiling template: ${error instanceof Error ? error.message : String(error)}</div>`
  }
}

// Main function to compile any template type
export function compileTemplate(
  content: string,
  templateType: "html" | "react" | "tailwind",
  variables: Record<string, string> = {},
): string {
  switch (templateType) {
    case "react":
      return compileReactTemplate(content, variables)
    case "tailwind":
      return compileTailwindTemplate(content, variables)
    default: // html
      // For HTML, just replace variables
      let processedContent = content
      Object.entries(variables).forEach(([key, value]) => {
        processedContent = processedContent.replace(new RegExp(`{{${key}}}`, "g"), value || `{{${key}}}`)
      })
      return processedContent
  }
}

// Function to extract just the HTML content from a full HTML document
// Useful when sending emails to remove the Tailwind CDN script
export function extractHtmlContent(fullHtml: string): string {
  // Simple regex to extract content between <body> tags
  const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  if (bodyMatch && bodyMatch[1]) {
    return bodyMatch[1].trim()
  }

  // If no body tags found, return the original content
  return fullHtml
}
