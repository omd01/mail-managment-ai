"use client"

import { useState } from "react"
import { Inbox, Tag, Bell, ShieldAlert, Circle, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"
import { demoEmails, categoryLabels, type DemoEmail, type InboxCategory } from "@/lib/demo-data"

const categoryMeta: Record<InboxCategory, { icon: typeof Inbox; color: string }> = {
  primary: { icon: Inbox, color: "text-sky-400" },
  promotions: { icon: Tag, color: "text-emerald-400" },
  updates: { icon: Bell, color: "text-violet-400" },
  spam: { icon: ShieldAlert, color: "text-red-400" },
}

export function InboxView() {
  const [active, setActive] = useState<InboxCategory>("primary")
  const [selected, setSelected] = useState<DemoEmail | null>(null)

  const categories = Object.keys(categoryLabels) as InboxCategory[]
  const emails = demoEmails.filter((e) => e.category === active)

  return (
    <div className="space-y-4">
      {/* Category tabs — the AI auto-categorizes every incoming message. */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const Meta = categoryMeta[cat]
          const count = demoEmails.filter((e) => e.category === cat && e.unread).length
          return (
            <button
              key={cat}
              onClick={() => {
                setActive(cat)
                setSelected(null)
              }}
              className={cn(
                "flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all shadow-sm",
                active === cat
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
              )}
            >
              <Meta.icon className={cn("h-4 w-4", active === cat ? "text-white" : Meta.color)} />
              {categoryLabels[cat]}
              {count > 0 && (
                <span
                  className={cn(
                    "rounded-full px-1.5 text-xs font-semibold",
                    active === cat ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-700",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        {/* Email list */}
        <div className="space-y-2">
          {emails.map((email) => (
            <button
              key={email.id}
              onClick={() => setSelected(email)}
              className={cn(
                "w-full rounded-lg border p-4 text-left transition-all shadow-sm",
                selected?.id === email.id
                  ? "border-neutral-300 bg-neutral-100/80"
                  : "border-neutral-200 bg-white hover:bg-neutral-50/80",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 truncate text-sm font-semibold text-neutral-900">
                  {email.unread && <Circle className="h-2 w-2 shrink-0 fill-sky-500 text-sky-500" />}
                  {email.from}
                </span>
                <span className="shrink-0 text-xs text-neutral-500">{email.date}</span>
              </div>
              <p className="mt-1 truncate text-sm font-medium text-neutral-800">{email.subject}</p>
              <p className="mt-1 truncate text-xs text-neutral-500">{email.preview}</p>
              {email.category === "spam" && (
                <span className="mt-2 inline-flex items-center gap-1 rounded bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600 border border-red-100">
                  <ShieldAlert className="h-3 w-3" /> Spam {email.spamScore}%
                </span>
              )}
            </button>
          ))}
          {emails.length === 0 && (
            <p className="rounded-lg border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500 shadow-sm">
              No messages in {categoryLabels[active]}.
            </p>
          )}
        </div>

        {/* Reading pane */}
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          {selected ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">{selected.subject}</h2>
                <p className="mt-1 text-sm text-neutral-500 font-medium">
                  {selected.from} &lt;{selected.fromEmail}&gt;
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded bg-neutral-100 px-2 py-1 text-neutral-600 font-medium">
                  Category: {categoryLabels[selected.category]}
                </span>
                <span
                  className={cn(
                    "rounded px-2 py-1 font-medium",
                    selected.spamScore > 50 ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100",
                  )}
                >
                  Spam score: {selected.spamScore}%
                </span>
              </div>
              <div className="line-accent !my-2" />
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-neutral-800">
                {selected.body}
              </pre>
            </div>
          ) : (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center text-neutral-400">
              <Sparkles className="mb-3 h-8 w-8 text-neutral-300" />
              <p className="text-sm font-medium">Select a message to read it.</p>
              <p className="mt-1 text-xs">Messages are auto-sorted into categories by the AI classifier.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
