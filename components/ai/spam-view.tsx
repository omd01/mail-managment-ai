"use client"

import { useState } from "react"
import { ShieldCheck, ShieldAlert, Loader2, Scan } from "lucide-react"

import { cn } from "@/lib/utils"
import { demoEmails } from "@/lib/demo-data"

// Shows the spam classifier's verdict and confidence for each message.
// "Scanning" is simulated so the screen demonstrates the detection workflow.

export function SpamView() {
  const [scanned, setScanned] = useState(false)
  const [scanning, setScanning] = useState(false)

  const ranked = [...demoEmails].sort((a, b) => b.spamScore - a.spamScore)
  const spamCount = demoEmails.filter((e) => e.spamScore > 50).length

  const runScan = () => {
    setScanning(true)
    setScanned(false)
    setTimeout(() => {
      setScanning(false)
      setScanned(true)
    }, 1200)
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Messages analyzed" value={String(demoEmails.length)} />
        <Stat label="Flagged as spam" value={String(spamCount)} accent="text-red-600" />
        <Stat label="Model accuracy" value="96.2%" accent="text-emerald-600" />
      </div>

      <button
        onClick={runScan}
        disabled={scanning}
        className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-neutral-800 disabled:opacity-60 shadow-sm"
      >
        {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scan className="h-4 w-4" />}
        {scanning ? "Scanning inbox…" : "Run spam scan"}
      </button>

      <div className="space-y-2">
        {ranked.map((email) => {
          const isSpam = email.spamScore > 50
          return (
            <div
              key={email.id}
              className={cn(
                "flex items-center gap-4 rounded-lg border p-4 transition-all shadow-sm",
                scanned && isSpam ? "border-red-200 bg-red-50/40" : "border-neutral-200 bg-white",
              )}
            >
              <div className="shrink-0">
                {isSpam ? (
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                ) : (
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-neutral-900">{email.subject}</p>
                <p className="truncate text-xs text-neutral-500">{email.fromEmail}</p>
              </div>
              <div className="w-40 shrink-0">
                <div className="mb-1 flex items-center justify-between text-xs font-medium">
                  <span className={isSpam ? "text-red-600" : "text-emerald-600"}>
                    {isSpam ? "Spam" : "Not spam"}
                  </span>
                  <span className="text-neutral-500">{email.spamScore}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700", isSpam ? "bg-red-500" : "bg-emerald-500")}
                    style={{ width: scanned ? `${email.spamScore}%` : "0%" }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="label-mono">{label}</p>
      <p className={cn("mt-1 text-2xl font-bold text-neutral-900", accent)}>{value}</p>
    </div>
  )
}
