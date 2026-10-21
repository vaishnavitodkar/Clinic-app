import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/site";
import { Field, SlotPicker } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SERVICES, fmtDate, fmtTime, today, useStore, type Appointment } from "@/lib/store";

export const Route = createFileRoute("/book")({
  validateSearch: (s: Record<string, unknown>): { service?: string } => ({ service: typeof s.service === "string" ? s.service : undefined }),
  head: () => ({
    meta: [
      { title: "Book an Appointment · Riva Skin Clinic" },
      { name: "description", content: "Choose a treatment, date and time slot with Dr. Riva." },
      { property: "og:title", content: "Book with Dr. Riva" },
      { property: "og:description", content: "Online appointment booking for Riva Skin Hair & Laser Clinic." },
    ],
  }),
  component: Book,
});

function Book() {
  const { service } = Route.useSearch();
  const s = useStore();
  const [reason, setReason] = useState(service ?? SERVICES[0].name);
  const [date, setDate] = useState(today());
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [done, setDone] = useState<Appointment | null>(null);

  const submit = () => {
    if (!name || phone.replace(/\D/g, "").length < 10 || !time) return toast.error("Enter your name, a 10-digit phone and pick a slot");
    const ph = phone.replace(/\D/g, "").slice(-10);
    let p = s.patients.find((x) => x.phone === ph);
    if (!p) p = s.addPatient({ name, phone: ph, email: "", dob: "", gender: "Female", address: "", allergies: "", medicalHistory: "" });
    setDone(s.addAppointment({ patientId: p.id, date, time, reason, source: "Website" }));
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-14">
        {done ? (
          <div className="rounded-3xl border bg-card p-10 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
            <h1 className="mt-4 text-4xl text-maroon">You're booked!</h1>
            <p className="mt-3 text-lg">{fmtDate(done.date)} at {fmtTime(done.time)}</p>
            <p className="text-muted-foreground">{done.reason} · with Dr. Riva</p>
            <p className="mt-4 text-sm text-muted-foreground">Our reception team will call to confirm. You'll get an SMS reminder a day before (demo).</p>
            <div className="mt-6 flex justify-center gap-3">
              <Button asChild><Link to="/portal" search={{ phone: phone.replace(/\D/g, "").slice(-10) }}>View in my portal</Link></Button>
              <Button variant="outline" onClick={() => { setDone(null); setTime(""); }}>Book another</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 rounded-3xl border bg-card p-8">
            <h1 className="text-4xl text-maroon">Book an appointment</h1>
            <Field label="Treatment">
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[...SERVICES.map((x) => x.name), "Follow-up consultation", "General skin consultation"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Date"><Input type="date" min={today()} value={date} onChange={(e) => { setDate(e.target.value); setTime(""); }} /></Field>
            <Field label="Available slots"><SlotPicker date={date} value={time} onChange={setTime} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
              <Field label="Mobile number"><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile" /></Field>
            </div>
            <Button size="lg" className="w-full" onClick={submit}>Confirm booking</Button>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
