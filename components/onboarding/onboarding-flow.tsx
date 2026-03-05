"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, ArrowRight, ArrowLeft, Check, Shield, Key, Globe, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useSession } from "next-auth/react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

// Updated steps to include domain verification
const steps = [
  { id: "welcome", title: "Welcome" },
  { id: "aws-setup", title: "AWS Setup" },
  { id: "credentials", title: "Credentials" },
  { id: "domain", title: "Domain" },
  { id: "complete", title: "Complete" },
]

export default function OnboardingFlow() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    awsRegion: "us-east-1",
    awsAccessKeyId: "",
    awsSecretAccessKey: "",
    domain: "linksus.in", // Default domain
  })

  // Domain verification states
  const [domainVerified, setDomainVerified] = useState(false)
  const [verificationRecords, setVerificationRecords] = useState<any[]>([])
  const [verificationStatus, setVerificationStatus] = useState("")
  const [checkingDomain, setCheckingDomain] = useState(false)
  const [testEmailTo, setTestEmailTo] = useState("")
  const [sendingTestEmail, setSendingTestEmail] = useState(false)
  const [testEmailSent, setTestEmailSent] = useState(false)

  useEffect(() => {
    // Check if user is authenticated
    if (!session?.user) {
      router.push("/login")
      return
    }

    // Fetch user data to pre-fill AWS credentials if they exist
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/profile")
        if (response.ok) {
          const userData = await response.json()

          // Pre-fill AWS credentials if they exist
          if (userData.awsRegion || userData.awsAccessKeyId) {
            setFormData((prev) => ({
              ...prev,
              awsRegion: userData.awsRegion || "us-east-1",
              awsAccessKeyId: userData.awsAccessKeyId || "",
              awsSecretAccessKey: userData.awsSecretAccessKey ? "••••••••••••••••" : "",
              domain: userData.domain || "linksus.in",
            }))
          }

          // If domain is already verified, update state
          if (userData.domainVerified) {
            setDomainVerified(true)
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }

    fetchUserData()
  }, [router, session])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)

      // If moving to domain step, check domain verification status
      if (steps[currentStep + 1].id === "domain") {
        checkDomainVerification()
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Skip validation if using masked secret key (user didn't change it)
      if (formData.awsSecretAccessKey === "••••••••••••••••") {
        // If we're using the existing secret key, we need to get it from the server
        // Just update the region and access key ID
        const saveResponse = await fetch("/api/onboarding", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: session?.user?.id,
            awsRegion: formData.awsRegion,
            awsAccessKeyId: formData.awsAccessKeyId,
            keepExistingSecret: true,
          }),
        })

        const saveData = await saveResponse.json()

        if (!saveResponse.ok) {
          throw new Error(saveData.error || "Failed to save credentials")
        }

        // Move to the next step
        nextStep()
        return
      }

      // First, validate the AWS credentials
      const validateResponse = await fetch("/api/validate-aws", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const validateData = await validateResponse.json()

      if (!validateResponse.ok) {
        throw new Error(validateData.error || "Failed to validate AWS credentials")
      }

      // If validation succeeds, save the credentials
      const saveResponse = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          ...formData,
        }),
      })

      const saveData = await saveResponse.json()

      if (!saveResponse.ok) {
        throw new Error(saveData.error || "Failed to save credentials")
      }

      // Move to the next step
      nextStep()
    } catch (error) {
      console.error("Error in onboarding:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save credentials",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Check domain verification status with AWS SES
  const checkDomainVerification = async () => {
    setCheckingDomain(true)
    setVerificationStatus("checking")

    try {
      const response = await fetch("/api/verify-domain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain: formData.domain,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to check domain verification")
      }

      setVerificationRecords(data.verificationRecords || [])

      if (data.verified) {
        setDomainVerified(true)
        setVerificationStatus("verified")

        // Save domain verification status
        await fetch("/api/onboarding/domain", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            domain: formData.domain,
            verified: true,
          }),
        })

        toast({
          title: "Domain Verified",
          description: `${formData.domain} is verified and ready to use for sending emails.`,
        })
      } else {
        setDomainVerified(false)
        setVerificationStatus("pending")

        toast({
          title: "Domain Not Verified",
          description: "Please add the required DNS records to verify your domain.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error checking domain verification:", error)
      setVerificationStatus("error")

      toast({
        title: "Verification Error",
        description: error instanceof Error ? error.message : "Failed to check domain verification",
        variant: "destructive",
      })
    } finally {
      setCheckingDomain(false)
    }
  }

  // Send a test email from the verified domain
  const sendTestEmail = async () => {
    if (!testEmailTo) {
      toast({
        title: "Email Required",
        description: "Please enter a recipient email address.",
        variant: "destructive",
      })
      return
    }

    setSendingTestEmail(true)

    try {
      const response = await fetch("/api/test-domain-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain: formData.domain,
          to: testEmailTo,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send test email")
      }

      setTestEmailSent(true)

      toast({
        title: "Test Email Sent",
        description: `A test email has been sent to ${testEmailTo}.`,
      })
    } catch (error) {
      console.error("Error sending test email:", error)

      toast({
        title: "Email Error",
        description: error instanceof Error ? error.message : "Failed to send test email",
        variant: "destructive",
      })
    } finally {
      setSendingTestEmail(false)
    }
  }

  const completeOnboarding = async () => {
    setIsLoading(true)
    try {
      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8 flex items-center justify-center">
        <Link href="/" className="flex items-center gap-2">
          <Mail className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">AiMailer.in</span>
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-center">
          <nav className="flex space-x-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    index < currentStep
                      ? "border-primary bg-primary text-primary-foreground"
                      : index === currentStep
                        ? "border-primary text-primary"
                        : "border-muted-foreground/25 text-muted-foreground/50"
                  }`}
                >
                  {index < currentStep ? <Check className="h-5 w-5" /> : <span>{index + 1}</span>}
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 w-10 ${index < currentStep ? "bg-primary" : "bg-muted-foreground/25"}`} />
                )}
              </div>
            ))}
          </nav>
        </div>
        <div className="mt-2 text-center">
          <h2 className="text-lg font-medium">{steps[currentStep].title}</h2>
        </div>
      </div>

      <Card className="w-full">
        {currentStep === 0 && (
          <>
            <CardHeader>
              <CardTitle>Welcome to AiMailer</CardTitle>
              <CardDescription>Let's set up your account to start sending emails with AWS SES</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium">What you'll need:</h3>
                <ul className="ml-6 list-disc space-y-2">
                  <li>An AWS account with SES service</li>
                  <li>AWS IAM credentials with SES permissions</li>
                  <li>Your AWS region where SES is configured</li>
                  <li>Access to DNS settings for your domain (linksus.in)</li>
                </ul>
              </div>
              <p>
                We'll guide you through setting up a dedicated IAM user for AiMailer with the minimum required
                permissions for security and verifying your domain for email sending.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div></div>
              <Button onClick={nextStep}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </>
        )}

        {currentStep === 1 && (
          <>
            <CardHeader>
              <CardTitle>Create an IAM User for AiMailer</CardTitle>
              <CardDescription>
                Follow these steps to create a dedicated IAM user with the minimum required permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Security Best Practice</AlertTitle>
                <AlertDescription>
                  Always create a dedicated IAM user with limited permissions for third-party services like AiMailer.
                  Never use your root AWS credentials.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-medium">Step 1: Create a new IAM User</h3>
                  <ol className="ml-6 list-decimal space-y-2">
                    <li>Log in to your AWS Management Console</li>
                    <li>Navigate to IAM (Identity and Access Management)</li>
                    <li>Click on "Users" in the left sidebar, then "Add user"</li>
                    <li>Enter a name (e.g., "aimailer-service")</li>
                    <li>Select "Access key - Programmatic access"</li>
                  </ol>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-medium">Step 2: Attach Required Permissions</h3>
                  <p className="mb-2">Create a custom policy with the following permissions:</p>
                  <Textarea
                    readOnly
                    className="h-48 font-mono text-xs"
                    value={`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail",
        "ses:GetSendQuota",
        "ses:GetSendStatistics",
        "ses:VerifyDomainIdentity",
        "ses:VerifyDomainDkim",
        "ses:GetIdentityVerificationAttributes",
        "ses:GetIdentityDkimAttributes"
      ],
      "Resource": "*"
    }
  ]
}`}
                  />
                  <p className="mt-2 text-sm text-muted-foreground">
                    This policy grants the minimum permissions needed for sending emails, checking quotas, and verifying
                    domains.
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-medium">Step 3: Complete User Creation</h3>
                  <ol className="ml-6 list-decimal space-y-2">
                    <li>Review the user details and permissions</li>
                    <li>Click "Create user"</li>
                    <li>
                      <strong>Important:</strong> Download or copy the Access Key ID and Secret Access Key - you'll need
                      these in the next step
                    </li>
                  </ol>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={nextStep}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </>
        )}

        {currentStep === 2 && (
          <>
            <CardHeader>
              <CardTitle>Enter Your AWS Credentials</CardTitle>
              <CardDescription>Provide the AWS credentials for the IAM user you created</CardDescription>
            </CardHeader>
            <CardContent>
              <form id="credentials-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="awsRegion">AWS Region</Label>
                  <Tabs defaultValue="select" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="select">Common Regions</TabsTrigger>
                      <TabsTrigger value="custom">Custom Region</TabsTrigger>
                    </TabsList>
                    <TabsContent value="select" className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: "us-east-1", name: "US East (N. Virginia)" },
                          { id: "us-west-2", name: "US West (Oregon)" },
                          { id: "eu-west-1", name: "EU (Ireland)" },
                          { id: "ap-southeast-1", name: "Asia Pacific (Singapore)" },
                        ].map((region) => (
                          <Button
                            key={region.id}
                            type="button"
                            variant={formData.awsRegion === region.id ? "default" : "outline"}
                            className="justify-start"
                            onClick={() => setFormData((prev) => ({ ...prev, awsRegion: region.id }))}
                          >
                            {region.name}
                          </Button>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="custom">
                      <Input
                        id="awsRegion"
                        name="awsRegion"
                        value={formData.awsRegion}
                        onChange={handleInputChange}
                        placeholder="e.g., eu-central-1"
                      />
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="awsAccessKeyId">AWS Access Key ID</Label>
                  <Input
                    id="awsAccessKeyId"
                    name="awsAccessKeyId"
                    value={formData.awsAccessKeyId}
                    onChange={handleInputChange}
                    placeholder="AKIAIOSFODNN7EXAMPLE"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="awsSecretAccessKey">AWS Secret Access Key</Label>
                  <Input
                    id="awsSecretAccessKey"
                    name="awsSecretAccessKey"
                    type="password"
                    value={formData.awsSecretAccessKey}
                    onChange={handleInputChange}
                    placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                    required
                  />
                </div>

                <Alert>
                  <Key className="h-4 w-4" />
                  <AlertTitle>Secure Credential Storage</AlertTitle>
                  <AlertDescription>
                    Your AWS credentials are encrypted before being stored in our database. We never share your
                    credentials with third parties.
                  </AlertDescription>
                </Alert>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button type="submit" form="credentials-form" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Validating...
                  </>
                ) : (
                  <>
                    Save Credentials
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </>
        )}

        {currentStep === 3 && (
          <>
            <CardHeader>
              <CardTitle>Verify Your Domain</CardTitle>
              <CardDescription>Verify your domain to send emails from {formData.domain}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <div className="flex gap-2">
                  <Input
                    id="domain"
                    name="domain"
                    value={formData.domain}
                    onChange={handleInputChange}
                    placeholder="example.com"
                    disabled={checkingDomain || domainVerified}
                  />
                  <Button
                    onClick={checkDomainVerification}
                    disabled={checkingDomain || !formData.domain}
                    variant="outline"
                  >
                    {checkingDomain ? (
                      <>
                        <svg
                          className="mr-2 h-4 w-4 animate-spin"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Checking...
                      </>
                    ) : (
                      <>
                        <Globe className="mr-2 h-4 w-4" />
                        {domainVerified ? "Refresh Status" : "Check Status"}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {verificationStatus === "checking" && (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              )}

              {verificationStatus === "verified" && (
                <div className="rounded-lg bg-green-50 p-6 dark:bg-green-900/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <h3 className="font-medium">Domain Verified</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your domain {formData.domain} is verified and ready to use for sending emails.
                  </p>

                  <div className="space-y-2 border-t pt-4">
                    <Label htmlFor="testEmail">Send a Test Email</Label>
                    <div className="flex gap-2">
                      <Input
                        id="testEmail"
                        type="email"
                        placeholder="recipient@example.com"
                        value={testEmailTo}
                        onChange={(e) => setTestEmailTo(e.target.value)}
                        disabled={sendingTestEmail}
                      />
                      <Button onClick={sendTestEmail} disabled={sendingTestEmail || !testEmailTo}>
                        {sendingTestEmail ? (
                          <>
                            <svg
                              className="mr-2 h-4 w-4 animate-spin"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Test
                          </>
                        )}
                      </Button>
                    </div>
                    {testEmailSent && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Test email sent successfully! Check your inbox.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {verificationStatus === "pending" && (
                <div className="space-y-4">
                  <Alert>
                    <Globe className="h-4 w-4" />
                    <AlertTitle>Domain Verification Required</AlertTitle>
                    <AlertDescription>
                      To verify your domain, you need to add the following DNS records to your domain's DNS settings.
                    </AlertDescription>
                  </Alert>

                  <div className="rounded-lg border p-4">
                    <h3 className="mb-2 font-medium">DNS Records to Add</h3>
                    <div className="space-y-4">
                      {verificationRecords.map((record, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{record.type}</Badge>
                            <span className="font-mono text-sm">{record.name}</span>
                          </div>
                          <div className="bg-muted p-2 rounded-md overflow-x-auto">
                            <code className="text-xs font-mono break-all">{record.value}</code>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">
                      DNS changes can take up to 24-48 hours to propagate. Click "Check Status" to verify once you've
                      added the records.
                    </p>
                  </div>
                </div>
              )}

              {verificationStatus === "error" && (
                <Alert variant="destructive">
                  <AlertTitle>Verification Error</AlertTitle>
                  <AlertDescription>
                    There was an error verifying your domain. Please check your AWS credentials and try again.
                  </AlertDescription>
                </Alert>
              )}

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Why Domain Verification is Important</AlertTitle>
                <AlertDescription>
                  Verifying your domain helps establish your sender reputation and improves email deliverability. It
                  also prevents others from sending emails from your domain without authorization.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={nextStep} disabled={!domainVerified && verificationStatus !== "verified"}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </>
        )}

        {currentStep === 4 && (
          <>
            <CardHeader>
              <CardTitle>Setup Complete!</CardTitle>
              <CardDescription>Your AiMailer account is now configured and ready to use</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-green-50 p-6 text-center dark:bg-green-900/20">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="mb-2 text-lg font-medium">Domain and AWS SES Integration Successful</h3>
                <p className="text-muted-foreground">
                  Your domain {formData.domain} is verified and your AWS SES credentials have been saved successfully.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">What's next?</h3>
                <ul className="ml-6 list-disc space-y-2">
                  <li>Create email templates for your campaigns</li>
                  <li>Set up your sender email addresses</li>
                  <li>Send your first email campaign</li>
                  <li>Track performance with analytics</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={completeOnboarding} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  <>
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}
