import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "How do I track my order?",
    a: "Use the Track order page with your order number (starts with FE-) and the email used at checkout.",
  },
  {
    q: "Do you ship internationally?",
    a: "This is a demo storefront. Shipping rules would be configured for a production deployment.",
  },
  {
    q: "How do freelancer inquiries work?",
    a: "Create an account, open a service, and use Contact freelancer. Your messages appear under Contact history.",
  },
];

export default function Support() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="section-padding py-12 flex-1 max-w-2xl mx-auto w-full">
        <h1 className="font-display text-3xl font-bold mb-2">Support</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Answers to common questions. For account issues, sign in and check your contact history.
        </p>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <Footer />
    </div>
  );
}
