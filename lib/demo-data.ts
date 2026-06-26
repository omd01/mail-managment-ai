// Demo/sample data used by the AI-assist screens (Inbox, Spam Detection,
// Summarization and Smart Reply). These features showcase the AI side of the
// platform described in the project report. The inbox and spam classifier use
// this seeded data; summarization and smart-reply call the live AI model and
// fall back to representative output when the model is unavailable.

export type InboxCategory = "primary" | "promotions" | "updates" | "spam"

export interface DemoEmail {
  id: string
  from: string
  fromEmail: string
  subject: string
  preview: string
  body: string
  date: string
  unread: boolean
  category: InboxCategory
  // Confidence (0-100) of the spam classifier for this message.
  spamScore: number
}

export const demoEmails: DemoEmail[] = [
  {
    id: "1",
    from: "Priya Sharma",
    fromEmail: "priya.sharma@acmecorp.com",
    subject: "Q3 Campaign performance review — action needed",
    preview: "Hi, sharing the numbers from last quarter's campaign. Open rate is up 18% but we should talk about...",
    body: "Hi team,\n\nSharing the numbers from last quarter's campaign. Open rate is up 18% but the click-through rate dropped slightly in the second half. I think the subject lines got repetitive.\n\nCan we schedule 30 minutes this week to plan the next sequence? I'd like to test two new templates and segment the list by engagement.\n\nThanks,\nPriya",
    date: "9:24 AM",
    unread: true,
    category: "primary",
    spamScore: 2,
  },
  {
    id: "2",
    from: "AWS Notifications",
    fromEmail: "no-reply@sns.amazonaws.com",
    subject: "Your SES sending quota was increased",
    preview: "Congratulations — your account has been moved out of the sandbox. Your new daily sending quota is...",
    body: "Hello,\n\nYour request to increase your Amazon SES sending limits has been approved. Your account has been moved out of the sandbox.\n\nNew daily sending quota: 50,000 emails\nMaximum send rate: 14 emails/second\n\nYou can now send to unverified recipients.\n\n— The Amazon SES Team",
    date: "8:02 AM",
    unread: true,
    category: "updates",
    spamScore: 4,
  },
  {
    id: "3",
    from: "Rahul Mehta",
    fromEmail: "rahul@startuphub.in",
    subject: "Re: Partnership proposal",
    preview: "Thanks for the deck. The pricing looks reasonable. A couple of questions before we move forward...",
    body: "Hi,\n\nThanks for the deck. The pricing looks reasonable. A couple of questions before we move forward:\n\n1. Do you support custom domains for sending?\n2. What's the typical onboarding time?\n3. Can we get a trial for our marketing team?\n\nLooking forward to your reply.\n\nBest,\nRahul",
    date: "Yesterday",
    unread: false,
    category: "primary",
    spamScore: 3,
  },
  {
    id: "4",
    from: "MegaDeals",
    fromEmail: "offers@megadeals-promo.biz",
    subject: "🔥 90% OFF everything — TODAY ONLY!! Claim now",
    preview: "CONGRATULATIONS!!! You have been selected for an EXCLUSIVE deal. Click here immediately to claim your...",
    body: "CONGRATULATIONS!!!\n\nYou have been SELECTED for an EXCLUSIVE 90% discount on ALL products. This offer expires in 10 minutes!\n\nCLICK HERE NOW >>> http://megadeals-promo.biz/claim?id=4421\n\nDon't miss this once-in-a-lifetime opportunity! Limited stock!!! Act fast!!!",
    date: "Yesterday",
    unread: true,
    category: "spam",
    spamScore: 97,
  },
  {
    id: "5",
    from: "Figma",
    fromEmail: "updates@figma.com",
    subject: "New comment on 'Email Template — Welcome'",
    preview: "Anjali left a comment: 'Can we make the CTA button a bit larger on mobile?' View the thread to reply...",
    body: "Anjali left a comment on your file 'Email Template — Welcome':\n\n\"Can we make the CTA button a bit larger on mobile? It's hard to tap.\"\n\nView and reply in Figma.",
    date: "Mon",
    unread: false,
    category: "updates",
    spamScore: 5,
  },
  {
    id: "6",
    from: "Weekly Marketing Digest",
    fromEmail: "newsletter@marketingweekly.com",
    subject: "5 cold-email frameworks that actually convert in 2026",
    preview: "This week: subject-line psychology, the 3-sentence follow-up, and how one SaaS doubled reply rates...",
    body: "This week's digest:\n\n• Subject-line psychology — the words that lift opens\n• The 3-sentence follow-up that gets replies\n• Case study: how one SaaS doubled reply rates with segmentation\n\nRead online or manage your subscription.",
    date: "Mon",
    unread: false,
    category: "promotions",
    spamScore: 22,
  },
  {
    id: "7",
    from: "WIN A FREE iPHONE",
    fromEmail: "rewards@prize-winner-247.net",
    subject: "You are our 1,000,000th visitor — claim your reward",
    preview: "Dear user, you have WON a brand new iPhone. To claim your prize, confirm your bank details within 24...",
    body: "Dear Winner,\n\nYou are our 1,000,000th visitor and you have WON a brand new iPhone 16 Pro!\n\nTo claim your FREE prize, please confirm your bank account details and pay a small processing fee of $2 within 24 hours.\n\nClick: http://prize-winner-247.net/claim\n\nReply STOP to unsubscribe.",
    date: "Sun",
    unread: true,
    category: "spam",
    spamScore: 99,
  },
  {
    id: "8",
    from: "Stripe",
    fromEmail: "receipts@stripe.com",
    subject: "Your receipt from AiMailer Pro [#1042-2291]",
    preview: "Thanks for your payment. This is the receipt for your AiMailer Pro subscription, billed monthly...",
    body: "Receipt from AiMailer\n\nAmount paid: $29.00\nDate: June 24, 2026\nPlan: AiMailer Pro (monthly)\n\nThanks for your business.",
    date: "Sun",
    unread: false,
    category: "updates",
    spamScore: 2,
  },
]

export const categoryLabels: Record<InboxCategory, string> = {
  primary: "Primary",
  promotions: "Promotions",
  updates: "Updates",
  spam: "Spam",
}

// A representative long email thread, pre-filled on the Summarization screen so
// an examiner can run the feature immediately (they can also paste their own).
export const sampleThreadForSummary = `From: Priya Sharma <priya.sharma@acmecorp.com>
Subject: Q3 Campaign performance review

Hi team, sharing the numbers from last quarter's campaign. Open rate is up 18% but the click-through rate dropped in the second half. I think the subject lines got repetitive. Can we plan the next sequence?

From: Arjun Nair <arjun@acmecorp.com>
Re: Q3 Campaign performance review

Agreed on the subject lines. I pulled the data — CTR fell from 4.2% to 2.9% after week 3. The drop lines up with when we reused the "Last chance" subject three times. We also saw unsubscribes tick up 0.4%.

From: Priya Sharma <priya.sharma@acmecorp.com>
Re: Q3 Campaign performance review

Good catch. Proposal for Q4: (1) cap any subject-line variant at one use per fortnight, (2) segment the list into engaged / dormant and send different cadences, (3) A/B test two new templates the design team is finishing. Target: recover CTR to 4% and keep unsubscribes under 0.2%.

From: Arjun Nair <arjun@acmecorp.com>
Re: Q3 Campaign performance review

Works for me. I'll set up the segments in the platform and prepare the A/B test. Can you get the two templates approved by Friday so we launch Monday?`

// A sample incoming message, pre-filled on the Smart Reply screen.
export const sampleMessageForReply = {
  from: "Rahul Mehta",
  subject: "Re: Partnership proposal",
  body: `Hi,

Thanks for the deck. The pricing looks reasonable. A couple of questions before we move forward:

1. Do you support custom domains for sending?
2. What's the typical onboarding time?
3. Can we get a trial for our marketing team?

Looking forward to your reply.

Best,
Rahul`,
}
