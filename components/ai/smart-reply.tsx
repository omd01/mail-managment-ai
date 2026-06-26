"use client"

import { useState } from "react"
import { Loader2, Sparkles, Copy, Check, Mail } from "lucide-react"

import { sampleMessageForReply } from "@/lib/demo-data"

interface Reply {
  tone: string
  text: string
}

// Calls /api/ai/smart-reply, which uses the live AI model (with a graceful
// fallback) to suggest three replies to an incoming message.

export function SmartReply() {
  const [message, setMessage] = useState(sampleMessageForReply.body)
  const [replies, setReplies] = useState<Reply[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)

  const generate = async () => {
    if (!message.trim()) return
    setLoading(true)
    setReplies([])
    try {
      const res = await fetch("/api/ai/smart-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })
      const data = await res.json()
      setReplies(Array.isArray(data.replies) ? data.replies : [])
    } catch {
      setReplies([])
    } finally {
      setLoading(false)
    }
  }

  const copy = (text: string, index: number) => {
    navigator.clipboard?.writeText(text)
    setCopied(index)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <p className="flex items-center gap-2 text-sm text-neutral-600 font-medium">
          <Mail className="h-4 w-4" /> Incoming message
        </p>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={9}
          className="mt-3 w-full resize-none rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 text-sm leading-relaxed text-neutral-800 outline-none focus:border-neutral-300 focus:bg-white transition-all"
          placeholder="Paste the message you want to reply to…"
        />
        <button
          onClick={generate}
          disabled={loading}
          className="mt-3 inline-flex items-center gap-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-neutral-800 disabled:opacity-60 shadow-sm"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Generating replies…" : "Generate smart replies"}
        </button>
      </div>

      {replies.length > 0 && (
        <div className="grid gap-3 md:grid-cols-3">
          {replies.map((reply, i) => (
            <div key={i} className="flex flex-col rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-700 border border-neutral-200/50">
                  {reply.tone}
                </span>
                <button
                  onClick={() => copy(reply.text, i)}
                  className="text-neutral-400 transition-colors hover:text-neutral-900"
                  title="Copy reply"
                >
                  {copied === i ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">{reply.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
