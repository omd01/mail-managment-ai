import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, FileText, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Legal Documents | AiMailer",
  description: "Legal documents for the AiMailer open source email management platform",
}

export default function LegalPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-2">Legal Documents</h1>
        <p className="text-muted-foreground">
          Important legal information about using the AiMailer open source platform
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Terms of Service
            </CardTitle>
            <CardDescription>The rules and guidelines for using the AiMailer platform</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Our Terms of Service outline the rules, guidelines, and legal agreements between users and AiMailer. These
              terms govern your use of our platform and services.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/legal/terms">View Terms of Service</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Privacy Policy
            </CardTitle>
            <CardDescription>How we collect, use, and protect your data</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Our Privacy Policy explains how we collect, use, and protect your personal information when you use the
              AiMailer platform. We're committed to protecting your privacy and data security.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/legal/privacy">View Privacy Policy</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8 p-4 border rounded-lg bg-muted/20">
        <h2 className="text-lg font-medium mb-2">Open Source Notice</h2>
        <p className="text-sm text-muted-foreground">
          AiMailer is an open source project released under the MIT License. You can view the source code and contribute
          to the project on{" "}
          <a href="https://github.com/aimailer/aimailer" className="text-primary hover:underline">
            GitHub
          </a>
          . The license allows you to use, modify, and distribute the software freely, subject to certain conditions
          outlined in the license agreement.
        </p>
      </div>
    </div>
  )
}
