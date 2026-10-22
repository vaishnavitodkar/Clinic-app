import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site";
import { Button } from "@/components/ui/button";
import drRiva from "@/assets/dr-riva.jpg";

export const Route = createFileRoute("/doctor-profile")({
  head: () => ({
    meta: [
      { title: "Dr. Nahar · Consultant Dermatologist" },
      { name: "description", content: "Qualifications, specialties and experience of Dr. Nahar." },
      { property: "og:title", content: "Meet Dr. Nahar" },
      { property: "og:description", content: "Consultant dermatologist, trichologist and laser specialist." },
    ],
  }),
  component: Profile,
});

function Profile() {
  return (
    <SiteLayout>
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 md:grid-cols-[1fr_1.4fr]">
        <img src={drRiva} alt="Dr. Nahar" width={768} height={960} className="aspect-[4/5] w-full rounded-3xl object-cover object-top" />
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-secondary">Founder & Consultant Dermatologist</p>
          <h1 className="mt-2 text-5xl text-maroon">Dr. Nahar</h1>
          <p className="mt-2 text-muted-foreground">MBBS, MD (Dermatology, Venereology & Leprosy) · Fellowship in Aesthetic Medicine</p>
          <p className="mt-6 leading-relaxed">
            With over 12 years of experience, Dr. Nahar combines evidence-based dermatology with modern laser and aesthetic procedures. She believes in honest
            consultations, realistic outcomes and carefully tracked progress — every visit is photographed and documented so you can see your journey.
          </p>
          <h2 className="mt-8 text-2xl text-maroon">Specialties</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Acne & scars", "Pigmentation & melasma", "Hair fall & PRP", "Laser hair reduction", "Anti-ageing", "Eczema & psoriasis", "Paediatric dermatology"].map((s) => (
              <span key={s} className="rounded-full bg-accent px-3 py-1 text-sm text-accent-foreground">{s}</span>
            ))}
          </div>
          <h2 className="mt-8 text-2xl text-maroon">Memberships</h2>
          <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
            <li>Indian Association of Dermatologists, Venereologists and Leprologists (IADVL)</li>
            <li>Association of Cutaneous Surgeons of India (ACSI)</li>
          </ul>
          <Button asChild size="lg" className="mt-8"><Link to="/book">Book with Dr. Nahar</Link></Button>
        </div>
      </div>
    </SiteLayout>
  );
}
