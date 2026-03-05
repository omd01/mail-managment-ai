import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Terms of Service | AiMailer",
  description: "Terms of Service for AiMailer open source email management platform",
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/legal">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Legal Documents
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: April 4, 2024</p>
      </div>

      <div className="prose dark:prose-invert max-w-none">
        <div className="p-4 border rounded-lg bg-muted/20 mb-6">
          <h3 className="mt-0 text-base font-medium">Open Source Software Notice</h3>
          <p className="text-sm mb-0">
            AiMailer is open source software released under the MIT License. This means you can use, modify, and
            distribute the software freely, subject to the terms of the MIT License. The following Terms of Service
            apply specifically to the hosted version of AiMailer and related services provided by AiMailer, Inc. If
            you're self-hosting the software, these terms may not all apply to you, but we still recommend following the
            usage guidelines.
          </p>
        </div>

        <p>
          Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the AiMailer.in
          website and email management service (the "Service") operated by AiMailer, Inc. ("us", "we", or "our").
        </p>

        <p>
          Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms.
          These Terms apply to all visitors, users, and others who access or use the Service.
        </p>

        <p>
          <strong>
            By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the
            terms, then you may not access the Service.
          </strong>
        </p>

        <h2>1. Accounts</h2>
        <p>
          When you create an account with us, you must provide accurate, complete, and current information at all times.
          Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account
          on our Service.
        </p>

        <p>
          You are responsible for safeguarding the password that you use to access the Service and for any activities or
          actions under your password, whether your password is with our Service or a third-party service.
        </p>

        <p>
          You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware
          of any breach of security or unauthorized use of your account.
        </p>

        <h2>2. AWS Integration</h2>
        <p>
          Our Service integrates with Amazon Web Services (AWS) Simple Email Service (SES). By using our Service, you
          acknowledge that:
        </p>
        <ul>
          <li>You are responsible for any AWS credentials you provide to our Service</li>
          <li>You must comply with AWS's terms of service and acceptable use policies</li>
          <li>
            We store your AWS credentials securely but cannot be held responsible for any costs incurred through your
            AWS account
          </li>
          <li>You are responsible for monitoring your AWS usage and costs</li>
        </ul>

        <h2>3. Email Content and Usage</h2>
        <p>
          You are solely responsible for the content of emails sent through our Service. You agree not to use our
          Service to:
        </p>
        <ul>
          <li>Send unsolicited commercial email (spam)</li>
          <li>Send harassing, abusive, or threatening messages</li>
          <li>Send content that is illegal, harmful, or violates the rights of others</li>
          <li>Impersonate others or misrepresent your identity or affiliation</li>
          <li>Distribute malware, viruses, or other harmful code</li>
        </ul>

        <h2>4. Intellectual Property</h2>
        <p>
          The Service is provided as open source software under the MIT License. The MIT License grants you permission
          to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, subject to
          the conditions outlined in the license.
        </p>

        <p>
          While the software is open source, our trademarks, service marks, and logos used in connection with the
          Service are not. These remain the exclusive property of AiMailer, Inc. and may not be used without our prior
          written consent.
        </p>

        <h2>5. Termination</h2>
        <p>
          We may terminate or suspend your account immediately, without prior notice or liability, for any reason
          whatsoever, including without limitation if you breach the Terms.
        </p>

        <p>
          Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account,
          you may simply discontinue using the Service or contact us to request account deletion.
        </p>

        <h2>6. Limitation of Liability</h2>
        <p>
          In no event shall AiMailer, Inc., nor its directors, employees, partners, agents, suppliers, or affiliates, be
          liable for any indirect, incidental, special, consequential or punitive damages, including without limitation,
          loss of profits, data, use, goodwill, or other intangible losses, resulting from:
        </p>
        <ul>
          <li>Your access to or use of or inability to access or use the Service</li>
          <li>Any conduct or content of any third party on the Service</li>
          <li>Any content obtained from the Service</li>
          <li>Unauthorized access, use, or alteration of your transmissions or content</li>
        </ul>

        <h2>7. Changes</h2>
        <p>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is
          material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What
          constitutes a material change will be determined at our sole discretion.
        </p>

        <p>
          By continuing to access or use our Service after those revisions become effective, you agree to be bound by
          the revised terms. If you do not agree to the new terms, please stop using the Service.
        </p>

        <h2>8. MIT License</h2>
        <p>The AiMailer software is licensed under the MIT License, which states:</p>
        <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
          MIT License Copyright (c) 2024 AiMailer, Inc. Permission is hereby granted, free of charge, to any person
          obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software
          without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute,
          sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do
          so, subject to the following conditions: The above copyright notice and this permission notice shall be
          included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT
          WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
          FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
          LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
          FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
        </pre>

        <h2>9. Contact Us</h2>
        <p>If you have any questions about these Terms, please contact us at:</p>
        <p>
          <strong>Email:</strong> support@aimailer.in
          <br />
          <strong>Address:</strong> AiMailer, Inc., 123 Email Street, San Francisco, CA 94103
          <br />
          <strong>GitHub:</strong>{" "}
          <a href="https://github.com/aimailer/aimailer" className="text-primary">
            github.com/aimailer/aimailer
          </a>
        </p>
      </div>
    </div>
  )
}
