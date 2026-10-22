import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site";
import { SERVICES } from "@/lib/store";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Treatments & Services · Riva Skin Clinic" },
      { name: "description", content: "Acne, laser hair reduction, pigmentation, PRP, peels and anti-ageing treatments." },
      { property: "og:title", content: "Treatments at Riva Skin Clinic" },
      { property: "og:description", content: "Skin, hair and laser treatments with indicative prices." },
    ],
  }),
  component: Services,
});

function Services() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-14">
        <h1 className="text-5xl text-maroon">Services & treatments</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">Every plan starts with a consultation with Dr. Nahar. Prices are indicative per session.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {SERVICES.map((s, i) => (
            <div key={s.name} className="flex gap-5 rounded-2xl border bg-card p-6">
              <div className="font-display text-4xl text-primary/40">{String(i + 1).padStart(2, "0")}</div>
              <div className="flex-1">
                <h2 className="text-2xl text-maroon">{s.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-secondary">From ₹{s.price.toLocaleString("en-IN")}</span>
                  <Link to="/book" search={{ service: s.name }} className="text-sm font-semibold text-primary">Book →</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
