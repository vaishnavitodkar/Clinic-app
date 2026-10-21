import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, FileText, ShieldCheck, Sparkles } from "lucide-react";
import { SiteLayout, CLINIC } from "@/components/site";
import { Button } from "@/components/ui/button";
import { SERVICES } from "@/lib/store";
import drRiva from "@/assets/dr-riva.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Riva Skin Hair & Laser Clinic · Dermatologist in Pune" },
      { name: "description", content: "Acne, pigmentation, hair fall and laser treatments by Dr. Riva. Book appointments online." },
      { property: "og:title", content: "Riva Skin Hair & Laser Clinic" },
      { property: "og:description", content: "Revitalize your skin with Dr. Riva. Book online, view prescriptions and aftercare." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <SiteLayout>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[1.2fr_1fr] md:py-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-secondary">Revitalize your skin</p>
            <h1 className="mt-4 text-5xl leading-[1.05] text-maroon md:text-6xl">
              Clear, confident skin — <em className="text-primary">guided by science.</em>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Personalised skin, hair and laser treatments with Dr. Riva. Track every visit, photo and prescription in your own secure portal.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link to="/book">Book an appointment</Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/services">Explore treatments</Link></Button>
            </div>
            <div className="mt-8 text-sm text-muted-foreground">{CLINIC.timings[0][0]} · {CLINIC.timings[0][1]}</div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-brand-gradient opacity-90 rotate-3" />
            <img src={drRiva} alt="Dr. Riva, dermatologist" width={768} height={960} className="relative aspect-[4/5] w-full rounded-[2rem] object-cover object-top" />
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/50">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
          {[
            [CalendarCheck, "Book in 60 seconds", "Pick a slot and get reminders"],
            [FileText, "Your records online", "Prescriptions & aftercare anytime"],
            [Sparkles, "US-FDA lasers", "Safe for Indian skin types"],
            [ShieldCheck, "Private & secure", "Only you and your doctor see your data"],
          ].map(([Icon, t, d]: any) => (
            <div key={t} className="flex gap-3">
              <Icon className="h-6 w-6 shrink-0 text-primary" />
              <div><div className="font-semibold">{t}</div><div className="text-sm text-muted-foreground">{d}</div></div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between">
          <h2 className="text-4xl text-maroon">Treatments</h2>
          <Link to="/services" className="text-sm font-semibold text-secondary">All services →</Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {SERVICES.slice(0, 3).map((s) => (
            <div key={s.name} className="rounded-2xl border bg-card p-6">
              <h3 className="text-xl text-maroon">{s.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              <Link to="/book" search={{ service: s.name }} className="mt-4 inline-block text-sm font-semibold text-primary">Book this →</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="grid gap-6 rounded-3xl bg-brand-gradient p-10 text-primary-foreground md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-3xl">Already a patient?</h2>
            <p className="mt-2 opacity-90">View appointments, prescriptions, visit summaries and request a follow-up.</p>
          </div>
          <Button asChild size="lg" variant="secondary" className="bg-card text-maroon hover:bg-card/90"><Link to="/portal">Open my portal</Link></Button>
        </div>
      </section>
    </SiteLayout>
  );
}
