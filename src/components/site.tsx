import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Clock, MapPin, Phone, Mail } from "lucide-react";
import { Logo } from "./shared";
import { Button } from "@/components/ui/button";

export const CLINIC = {
  address: "2nd Floor, Lotus Plaza, FC Road, Shivajinagar, Pune 411005",
  phone: "+91 98765 00000",
  email: "care@rivaskinclinic.in",
  timings: [
    ["Monday – Saturday", "10:00 AM – 8:00 PM"],
    ["Sunday", "Closed"],
  ],
};

export function SiteLayout({ children }: { children: ReactNode }) {
  const nav = "text-sm font-medium text-foreground/80 hover:text-primary";
  const act = { className: "text-primary" };
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/"><Logo /></Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link to="/" className={nav} activeOptions={{ exact: true }} activeProps={act}>Home</Link>
            <Link to="/services" className={nav} activeProps={act}>Services</Link>
            <Link to="/doctor-profile" className={nav} activeProps={act}>Dr. Riva</Link>
            <Link to="/faq" className={nav} activeProps={act}>FAQs & Policies</Link>
            <Link to="/contact" className={nav} activeProps={act}>Contact</Link>
          </nav>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm"><Link to="/portal">My portal</Link></Button>
            <Button asChild size="sm"><Link to="/book">Book visit</Link></Button>
          </div>
        </div>
      </header>
      {children}
      <footer className="mt-20 bg-maroon text-maroon-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
          <div>
            <div className="font-display text-2xl">Riva Skin Hair & Laser Clinic</div>
            <p className="mt-2 text-sm opacity-80">Revitalize your skin.</p>
          </div>
          <div className="space-y-2 text-sm opacity-90">
            <p className="flex gap-2"><MapPin className="h-4 w-4 shrink-0" />{CLINIC.address}</p>
            <p className="flex gap-2"><Phone className="h-4 w-4" />{CLINIC.phone}</p>
            <p className="flex gap-2"><Mail className="h-4 w-4" />{CLINIC.email}</p>
          </div>
          <div className="space-y-1 text-sm opacity-90">
            <p className="flex gap-2 font-semibold"><Clock className="h-4 w-4" />Timings</p>
            {CLINIC.timings.map(([a, b]) => <p key={a}>{a}: {b}</p>)}
          </div>
        </div>
      </footer>
    </div>
  );
}
