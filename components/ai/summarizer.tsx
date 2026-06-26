"use client"

import { useState } from "react"
import { Loader2, Sparkles, FileText } from "lucide-react"

import { sampleThreadForSummary } from "@/lib/demo-data"

// Calls /api/ai/summarize, which uses the live AI model (with a graceful
// fallback). Pre-filled with a sample thread so it can be run immediately.

export function Summarizer() {
  const [thread, setThread] = useState(sampleThreadForSummary)
  const [summary, setSummary] = useState("")
  const [loading, setLoading] = useState(false)

  const summarize = async () => {
    if (!thread.trim()) return
    setLoading(true)
    setSummary("")
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thread }),
      })
      const data = await res.json()
      setSummary(data.summary || "Could not generate a summary.")
    } catch {
      setSummary("Something went wrong generating the summary.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm text-neutral-600 font-medium">
          <FileText className="h-4 w-4" /> Email thread
        </label>
        <textarea
          value={thread}
          onChange={(e) => setThread(e.target.value)}
          rows={18}
          className="w-full resize-none rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 text-sm leading-relaxed text-neutral-800 outline-none focus:border-neutral-300 focus:bg-white transition-all shadow-sm"
          placeholder="Paste a long email thread here…"
        />
        <button
          onClick={summarize}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-neutral-800 disabled:opacity-60 shadow-sm"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Summarizing…" : "Summarize with AI"}
        </button>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="label-mono mb-3">AI Summary</p>
        {loading ? (
          <div className="flex h-full min-h-[200px] items-center justify-center text-neutral-500 font-medium">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing the conversation…
          </div>
        ) : summary ? (
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">{summary}</div>
        ) : (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center text-neutral-400">
            <Sparkles className="mb-3 h-8 w-8 text-neutral-300" />
            <p className="text-sm font-medium">Your summary will appear here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
