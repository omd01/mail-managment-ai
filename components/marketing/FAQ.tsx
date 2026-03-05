import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export function FAQ() {
    const faqs = [
        {
            q: "How accurate is the verification?",
            a: "NoBounce boasts a 99.9% accuracy rate. We use a multi-step verification process including syntax checks, DNS validation, and direct SMTP handshakes.",
        },
        {
            q: "Do you offer a free trial?",
            a: "Yes! Every new account gets 100 free credits renewed monthly to test our service.",
        },
        {
            q: "Can I integrate this with my CRM?",
            a: "Absolutely. We offer native integrations for HubSpot, Salesforce, and Mailchimp, plus a robust API for custom solutions.",
        },
        {
            q: "What happens if I run out of credits?",
            a: "We'll notify you when you're low. You can upgrade your plan or purchase a one-time credit pack instantly.",
        },
    ]

    return (
        <section id="faq" className="py-24 bg-black/40 border-t border-white/5">
            <div className="container px-4 md:px-6 max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, i) => (
                        <AccordionItem key={i} value={`item-${i}`} className="border-b border-white/10">
                            <AccordionTrigger className="text-left text-lg hover:text-primary transition-colors">{faq.q}</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground text-base">
                                {faq.a}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    )
}
