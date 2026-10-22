import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQs & Clinic Policies · Riva Skin Clinic" },
      { name: "description", content: "Answers about appointments, treatments, payments, cancellations and privacy." },
      { property: "og:title", content: "FAQs & Policies · Riva Skin Clinic" },
      { property: "og:description", content: "Appointments, cancellations, payments and privacy at Riva." },
    ],
  }),
  component: Faq,
});

const FAQS = [
  ["How long is a consultation?", "First consultations take about 20–30 minutes. Follow-ups are usually 10–15 minutes."],
  ["Do I need to stop products before a laser or peel?", "Yes — stop retinoids and exfoliating acids 5 days before. Dr. Nahar will share a personalised checklist."],
  ["Is laser hair reduction safe for Indian skin?", "Our diode laser is designed for darker skin types. A patch test is done before the first session."],
  ["How do I see my prescription?", "Open 'My portal', enter your registered phone number, and view prescriptions and aftercare for each visit."],
  ["Which payment methods are accepted?", "Cash, UPI and all major cards."],
];
const POLICIES = [
  ["Cancellation & rescheduling", "Please cancel or reschedule at least 4 hours before your slot. You can do this from your portal or by calling us."],
  ["Late arrival", "If you arrive more than 15 minutes late, we may need to move you to the next available slot."],
  ["No-show", "Two consecutive no-shows may require prepayment for future procedure bookings."],
  ["Clinical photographs", "Photos are taken only with consent, used solely to track your treatment, and never shared publicly."],
  ["Privacy", "Your medical records are visible only to you, Dr. Nahar and authorised clinic staff."],
];

function Faq() {
  return (
    <SiteLayout>
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 md:grid-cols-2">
        {[["Frequently asked questions", FAQS], ["Clinic policies", POLICIES]].map(([title, list]: any) => (
          <div key={title}>
            <h1 className="text-4xl text-maroon">{title}</h1>
            <Accordion type="single" collapsible className="mt-6">
              {list.map(([q, a]: string[]) => (
                <AccordionItem key={q} value={q}>
                  <AccordionTrigger className="text-left">{q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </SiteLayout>
  );
}
