"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Cable, Key, ShieldCheck, Construction, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

interface IntegrationInfo {
    isActive: boolean
    configured: boolean
    source?: string | null
    masked?: any
}

export default function IntegrationsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [info, setInfo] = useState<Record<string, IntegrationInfo>>({
        aws: { isActive: false, configured: false },
        resend: { isActive: false, configured: false },
    })

    // AWS Config State
    const [awsDialogOpen, setAwsDialogOpen] = useState(false)
    const [awsConfig, setAwsConfig] = useState({
        accessKeyId: "",
        secretAccessKey: "",
        region: "us-east-1"
    })
    const [isSavingAws, setIsSavingAws] = useState(false)

    // Resend Config State
    const [resendDialogOpen, setResendDialogOpen] = useState(false)
    const [resendKey, setResendKey] = useState("")
    const [isSavingResend, setIsSavingResend] = useState(false)

    const fetchIntegrations = async () => {
        try {
            const res = await fetch("/api/integrations")
            if (res.ok) {
                const data = await res.json()
                const map: Record<string, IntegrationInfo> = {}
                data.integrations.forEach((i: any) => {
                    map[i.provider] = {
                        isActive: i.isActive,
                        configured: i.configured,
                        source: i.source,
                        masked: i.masked,
                    }
                })
                setInfo(prev => ({ ...prev, ...map }))
            }
        } catch (error) {
            console.error("Failed to fetch integrations", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchIntegrations()
    }, [])

    const handleSaveAws = async () => {
        // If creds already exist and the form is blank, just (re)activate them.
        if (info.aws.configured && (!awsConfig.accessKeyId || !awsConfig.secretAccessKey)) {
            setAwsDialogOpen(false)
            await setActive("aws", true)
            return
        }
        if (!awsConfig.accessKeyId || !awsConfig.secretAccessKey) {
            toast.error("Access Key ID and Secret Access Key are required")
            return
        }

        setIsSavingAws(true)
        try {
            const res = await fetch("/api/integrations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider: "aws",
                    credentials: awsConfig,
                    isActive: true
                })
            })

            if (!res.ok) throw new Error("Failed to save")

            setAwsDialogOpen(false)
            setAwsConfig({ accessKeyId: "", secretAccessKey: "", region: "us-east-1" })
            await fetchIntegrations()
            toast.success("AWS SES Connected successfully")
        } catch (error) {
            toast.error("Failed to connect AWS SES")
        } finally {
            setIsSavingAws(false)
        }
    }

    const handleSaveResend = async () => {
        if (info.resend.configured && !resendKey) {
            setResendDialogOpen(false)
            await setActive("resend", true)
            return
        }
        if (!resendKey) {
            toast.error("API Key is required")
            return
        }

        setIsSavingResend(true)
        try {
            const res = await fetch("/api/integrations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider: "resend",
                    credentials: { apiKey: resendKey },
                    isActive: true
                })
            })

            if (!res.ok) throw new Error("Failed to save")

            setResendDialogOpen(false)
            setResendKey("")
            await fetchIntegrations()
            toast.success("Resend Connected successfully")
        } catch (error) {
            toast.error("Failed to connect Resend")
        } finally {
            setIsSavingResend(false)
        }
    }

    // Enable/disable an integration. If turning on a provider that has no
    // credentials yet, open the credentials dialog instead.
    const setActive = async (provider: string, nextActive: boolean) => {
        const current = info[provider]

        if (nextActive && !current.configured) {
            if (provider === "aws") setAwsDialogOpen(true)
            if (provider === "resend") setResendDialogOpen(true)
            return
        }

        // Optimistic update
        setInfo(prev => ({ ...prev, [provider]: { ...prev[provider], isActive: nextActive } }))

        try {
            const res = await fetch("/api/integrations", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ provider, isActive: nextActive }),
            })
            if (!res.ok) throw new Error("Failed to update")
            await fetchIntegrations()
            toast.success(nextActive ? `${provider.toUpperCase()} activated` : `${provider.toUpperCase()} deactivated`)
        } catch (error) {
            // Revert on failure
            setInfo(prev => ({ ...prev, [provider]: { ...prev[provider], isActive: current.isActive } }))
            toast.error("Failed to update status")
        }
    }

    return (
        <DashboardShell>
            <div className="flex flex-col gap-8 max-w-5xl mx-auto mt-12 animate-in fade-in duration-700">

                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Cable className="h-8 w-8 text-neutral-500" />
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-neutral-900">Protocol_Connectors</h1>
                    </div>
                    <p className="text-neutral-500 label-mono text-xs max-w-2xl ml-1">
                        Manage external gateway connections and API verifications.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                    {/* AWS SES Integration (Hero Card) */}
                    <div className="editorial-card p-6 border border-neutral-200 bg-white hover:border-neutral-300 transition-all group col-span-1 md:col-span-2 lg:col-span-2 flex flex-col justify-between shadow-sm">
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 flex items-center justify-center rounded bg-[#FF9900]/10 border border-[#FF9900]/20">
                                        <span className="font-bold text-[#FF9900] text-lg">AWS</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-neutral-900 tracking-tight">Amazon SES</h3>
                                        <p className="text-[10px] text-neutral-500 label-mono mt-1">High-Volume Gateway</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-neutral-50 p-1.5 rounded-full border border-neutral-200">
                                    <span className={`label-mono text-[9px] px-2 ${info.aws.isActive ? "text-green-600 font-semibold" : "text-neutral-400"}`}>
                                        {info.aws.isActive ? "ACTIVE" : "INACTIVE"}
                                    </span>
                                    <Switch
                                        checked={info.aws.isActive}
                                        onCheckedChange={(checked) => setActive('aws', checked)}
                                        className="data-[state=checked]:bg-[#FF9900] scale-75"
                                    />
                                </div>
                            </div>

                            <p className="text-sm text-neutral-600 mb-4 font-light leading-relaxed max-w-xl">
                                Direct integration with Amazon Simple Email Service for high-deliverability transactional emails. Supports sandbox and production environments.
                            </p>

                            {info.aws.configured ? (
                                <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 label-mono text-[10px] text-neutral-500">
                                    <span className="flex items-center gap-1.5 text-green-600 font-semibold">
                                        <CheckCircle2 className="h-3 w-3" /> CREDENTIALS_CONFIGURED
                                    </span>
                                    {info.aws.masked?.accessKeyId && <span>KEY {info.aws.masked.accessKeyId}</span>}
                                    {info.aws.masked?.region && <span>REGION {info.aws.masked.region}</span>}
                                    {info.aws.source === "env" && <span className="text-neutral-500">SOURCE ENV</span>}
                                </div>
                            ) : (
                                <p className="mb-6 label-mono text-[10px] text-neutral-400">NO_CREDENTIALS — ADD KEYS TO ACTIVATE</p>
                            )}
                        </div>

                        <div className="flex gap-3 mt-auto">
                            <Dialog open={awsDialogOpen} onOpenChange={setAwsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="label-mono text-[10px] h-9 border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 hover:border-neutral-300 gap-2 transition-all shadow-sm">
                                        <Key className="h-3 w-3" />
                                        Credentials
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-white border-neutral-200 text-neutral-900 sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle className="text-neutral-900 font-bold">AWS Configuration</DialogTitle>
                                        <DialogDescription className="text-neutral-500">
                                            {info.aws.configured
                                                ? "Credentials are already configured. Enter new values to replace them, or leave blank to keep the current ones."
                                                : "Enter your AWS IAM credentials with SES access permissions."}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="aws-access" className="text-neutral-700 font-medium">Access Key ID</Label>
                                            <Input
                                                id="aws-access"
                                                value={awsConfig.accessKeyId}
                                                onChange={(e) => setAwsConfig({ ...awsConfig, accessKeyId: e.target.value })}
                                                placeholder={info.aws.masked?.accessKeyId || "AKIA..."}
                                                className="bg-white border-neutral-200 text-neutral-900 focus-visible:ring-neutral-400"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="aws-secret" className="text-neutral-700 font-medium">Secret Access Key</Label>
                                            <Input
                                                id="aws-secret"
                                                type="password"
                                                value={awsConfig.secretAccessKey}
                                                onChange={(e) => setAwsConfig({ ...awsConfig, secretAccessKey: e.target.value })}
                                                placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                                                className="bg-white border-neutral-200 text-neutral-900 focus-visible:ring-neutral-400"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="aws-region" className="text-neutral-700 font-medium">Region</Label>
                                            <Input
                                                id="aws-region"
                                                value={awsConfig.region}
                                                onChange={(e) => setAwsConfig({ ...awsConfig, region: e.target.value })}
                                                placeholder="us-east-1"
                                                className="bg-white border-neutral-200 text-neutral-900 focus-visible:ring-neutral-400"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            onClick={handleSaveAws}
                                            disabled={isSavingAws}
                                            className="bg-neutral-900 text-white hover:bg-neutral-800"
                                        >
                                            {isSavingAws && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Save_Connection
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Button variant="outline" className="label-mono text-[10px] h-9 border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 hover:border-neutral-300 gap-2 transition-all shadow-sm">
                                <ShieldCheck className="h-3 w-3" />
                                Verify_Domain
                            </Button>
                        </div>
                    </div>

                    {/* Resend Integration */}
                    <div className="editorial-card p-6 border border-neutral-200 bg-white hover:border-neutral-300 transition-all group flex flex-col justify-between shadow-sm">
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 flex items-center justify-center rounded bg-neutral-900 text-white border border-neutral-800">
                                        <span className="font-bold text-lg">R</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-neutral-900 tracking-tight">Resend</h3>
                                        <p className="text-[10px] text-neutral-500 label-mono mt-0.5">Modern API</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`label-mono text-[9px] ${info.resend.isActive ? "text-green-600 font-semibold" : "text-neutral-400"}`}>
                                        {info.resend.isActive ? "ACTIVE" : "INACTIVE"}
                                    </span>
                                    <Switch
                                        checked={info.resend.isActive}
                                        onCheckedChange={(checked) => setActive('resend', checked)}
                                        className="data-[state=checked]:bg-neutral-900 scale-75"
                                    />
                                </div>
                            </div>
                            <p className="text-sm text-neutral-600 mb-6 font-light leading-relaxed">
                                Send emails using the Resend API for developer-first experience.
                            </p>
                        </div>

                        <Dialog open={resendDialogOpen} onOpenChange={setResendDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full btn-handcrafted text-[10px] h-9 mt-4 bg-neutral-900 text-white hover:bg-neutral-800 rounded-md">
                                    {info.resend.configured ? "Update_API_Key" : "Connect_API_Key"}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-white border-neutral-200 text-neutral-900 sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="text-neutral-900 font-bold">Resend Configuration</DialogTitle>
                                    <DialogDescription className="text-neutral-500">
                                        Enter your Resend API Key.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="resend-key" className="text-neutral-700 font-medium">API Key</Label>
                                        <Input
                                            id="resend-key"
                                            type="password"
                                            value={resendKey}
                                            onChange={(e) => setResendKey(e.target.value)}
                                            placeholder="re_123456789"
                                            className="bg-white border-neutral-200 text-neutral-900 focus-visible:ring-neutral-400"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        onClick={handleSaveResend}
                                        disabled={isSavingResend}
                                        className="bg-neutral-900 text-white hover:bg-neutral-800"
                                    >
                                        {isSavingResend && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Connect
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* SendGrid (Coming Soon) */}
                    <div className="editorial-card p-6 border border-neutral-200 bg-neutral-50/50 backdrop-blur-sm grayscale opacity-70 hover:opacity-100 transition-all shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 flex items-center justify-center rounded bg-blue-500/10 border border-blue-500/20">
                                    <span className="font-bold text-blue-500">SG</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-neutral-700">SendGrid</h3>
                                    <p className="text-[10px] text-neutral-500 label-mono mt-0.5">Legacy SMTP</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="border-neutral-200 bg-white text-neutral-400 label-mono text-[9px]">SOON</Badge>
                        </div>
                    </div>

                    {/* Mailgun (Coming Soon) */}
                    <div className="editorial-card p-6 border border-neutral-200 bg-neutral-50/50 backdrop-blur-sm grayscale opacity-70 hover:opacity-100 transition-all shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 flex items-center justify-center rounded bg-red-500/10 border border-red-500/20">
                                    <span className="font-bold text-red-500">MG</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-neutral-700">Mailgun</h3>
                                    <p className="text-[10px] text-neutral-500 label-mono mt-0.5">Enterprise</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="border-neutral-200 bg-white text-neutral-400 label-mono text-[9px]">SOON</Badge>
                        </div>
                    </div>

                    {/* Postmark (Coming Soon) */}
                    <div className="editorial-card p-6 border border-neutral-200 bg-neutral-50/50 backdrop-blur-sm grayscale opacity-70 hover:opacity-100 transition-all shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 flex items-center justify-center rounded bg-yellow-500/10 border border-yellow-500/20">
                                    <span className="font-bold text-yellow-500">PM</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-neutral-700">Postmark</h3>
                                    <p className="text-[10px] text-neutral-500 label-mono mt-0.5">Reliability</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="border-neutral-200 bg-white text-neutral-400 label-mono text-[9px]">SOON</Badge>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardShell>
    )
}
