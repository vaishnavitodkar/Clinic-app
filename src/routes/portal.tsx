import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Bell, CalendarDays, FileText, LogOut } from "lucide-react";
import { SiteLayout } from "@/components/site";
import { Field, SlotPicker, StatusBadge } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { fmtDate, fmtTime, today, useStore, type Appointment, type Visit } from "@/lib/store";

export const Route = createFileRoute("/portal")({
  validateSearch: (s: Record<string, unknown>): { phone?: string } => ({ phone: typeof s.phone === "string" ? s.phone : undefined }),
  head: () => ({
    meta: [
      { title: "My Patient Portal · Riva Skin Clinic" },
      { name: "description", content: "View appointments, prescriptions, visit summaries and aftercare." },
      { property: "og:title", content: "Riva Patient Portal" },
      { property: "og:description", content: "Secure access to your appointments and treatment records." },
    ],
  }),
  component: Portal,
});

function Portal() {
  const { phone: initial } = Route.useSearch();
  const s = useStore();
  const [phone, setPhone] = useState(initial ?? "");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [pid, setPid] = useState<string | null>(null);
  const p = pid ? s.getPatient(pid) : undefined;

  if (!p)
    return (
      <SiteLayout>
        <div className="mx-auto max-w-md px-4 py-16">
          <div className="space-y-5 rounded-3xl border bg-card p-8">
            <h1 className="text-4xl text-maroon">Patient portal</h1>
            <p className="text-sm text-muted-foreground">Sign in with your registered mobile number.</p>
            <Field label="Mobile number"><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" /></Field>
            {otpSent && <Field label="OTP (demo: any 4 digits)"><Input value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={4} /></Field>}
            <Button
              className="w-full"
              onClick={() => {
                const match = s.patients.find((x) => x.phone === phone.replace(/\D/g, "").slice(-10));
                if (!match) return toast.error("No patient found with this number");
                if (!otpSent) { setOtpSent(true); return toast.success("OTP sent (demo)"); }
                if (otp.length !== 4) return toast.error("Enter the 4-digit OTP");
                setPid(match.id);
              }}
            >
              {otpSent ? "Verify & sign in" : "Send OTP"}
            </Button>
            <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              Demo: try <button className="font-semibold text-primary underline" onClick={() => { setPhone("9876543210"); setOtpSent(true); setOtp("1234"); }}>Priya Sharma · 9876543210</button>
            </div>
          </div>
        </div>
      </SiteLayout>
    );

  return <PortalHome pid={p.id} onLogout={() => { setPid(null); setOtp(""); setOtpSent(false); }} />;
}

function PortalHome({ pid, onLogout }: { pid: string; onLogout: () => void }) {
  const s = useStore();
  const p = s.getPatient(pid)!;
  const appts = s.appointments.filter((a) => a.patientId === pid).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const upcoming = appts.filter((a) => a.date >= today() && !["Completed", "Cancelled", "No Show"].includes(a.status));
  const past = appts.filter((a) => !upcoming.includes(a)).reverse();
  const visits = s.visits.filter((v) => v.patientId === pid && v.shared).sort((a, b) => b.date.localeCompare(a.date));
  const [resched, setResched] = useState<Appointment | null>(null);
  const [view, setView] = useState<Visit | null>(null);
  const [fu, setFu] = useState(false);
  const next = upcoming[0];

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Patient ID {p.id}</p>
            <h1 className="text-4xl text-maroon">Hello, {p.name.split(" ")[0]}</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setFu(true)}>Request follow-up</Button>
            <Button variant="outline" asChild><Link to="/book">New booking</Link></Button>
            <Button variant="ghost" onClick={onLogout}><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>

        {next && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/30 bg-accent p-4">
            <Bell className="mt-0.5 h-5 w-5 text-primary" />
            <div className="text-sm">
              <b>Reminder:</b> Your next appointment is on <b>{fmtDate(next.date)} at {fmtTime(next.time)}</b> for {next.reason}. Please arrive 10 minutes early.
            </div>
          </div>
        )}

        <Tabs defaultValue="appts" className="mt-8">
          <TabsList>
            <TabsTrigger value="appts">Appointments</TabsTrigger>
            <TabsTrigger value="records">Prescriptions & summaries</TabsTrigger>
          </TabsList>
          <TabsContent value="appts" className="space-y-6">
            <section>
              <h2 className="mb-3 text-xl text-maroon">Upcoming</h2>
              {upcoming.length === 0 && <p className="text-sm text-muted-foreground">No upcoming appointments.</p>}
              <div className="space-y-3">
                {upcoming.map((a) => (
                  <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-5 w-5 text-secondary" />
                      <div>
                        <div className="font-semibold">{fmtDate(a.date)} · {fmtTime(a.time)}</div>
                        <div className="text-sm text-muted-foreground">{a.reason} · Dr. Nahar</div>
                      </div>
                      <StatusBadge status={a.status} />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setResched(a)}>Reschedule</Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { s.updateAppointment(a.id, { status: "Cancelled" }); toast.success("Appointment cancelled"); }}>Cancel</Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h2 className="mb-3 text-xl text-maroon">Past</h2>
              <div className="divide-y rounded-xl border bg-card">
                {past.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-3 text-sm">
                    <span>{fmtDate(a.date)} · {a.reason}</span>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            </section>
          </TabsContent>
          <TabsContent value="records">
            <div className="grid gap-3 md:grid-cols-2">
              {visits.length === 0 && <p className="text-sm text-muted-foreground">No records shared yet.</p>}
              {visits.map((v) => (
                <button key={v.id} onClick={() => setView(v)} className="rounded-xl border bg-card p-5 text-left hover:border-primary">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><FileText className="h-4 w-4" />{fmtDate(v.date)}</div>
                  <div className="mt-1 font-display text-lg text-maroon">{v.diagnosis}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{v.prescription.length} medicines · {v.followUp}</div>
                </button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader><DialogTitle>Visit summary · {view && fmtDate(view.date)}</DialogTitle></DialogHeader>
          {view && (
            <div className="space-y-4 text-sm">
              <div><b>Diagnosis:</b> {view.diagnosis}</div>
              <div>
                <b>Prescription</b>
                <table className="mt-1 w-full text-left">
                  <tbody>{view.prescription.map((r, i) => <tr key={i} className="border-t"><td className="py-1.5 font-medium">{r.drug}</td><td>{r.dose}</td><td>{r.frequency}</td><td>{r.duration}</td></tr>)}</tbody>
                </table>
              </div>
              <div><b>Treatment plan:</b> {view.plan}</div>
              <div className="rounded-lg bg-accent p-3"><b>Aftercare:</b> {view.aftercare}</div>
              <div><b>Follow-up:</b> {view.followUp}{view.followUpDate && ` (${fmtDate(view.followUpDate)})`}</div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => window.print()}>Print</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <SimpleBook
        open={!!resched || fu}
        title={resched ? "Reschedule appointment" : "Request follow-up"}
        onClose={() => { setResched(null); setFu(false); }}
        ignoreId={resched?.id}
        onSave={(date, time, note) => {
          if (resched) {
            s.updateAppointment(resched.id, { date, time, status: "Booked" });
            toast.success("Appointment rescheduled");
          } else {
            s.addAppointment({ patientId: pid, date, time, reason: note ? `Follow-up: ${note}` : "Follow-up consultation", source: "Follow-up request" });
            toast.success("Follow-up requested. Reception will confirm.");
          }
        }}
        withNote={fu}
      />
    </SiteLayout>
  );
}

function SimpleBook({ open, title, onClose, onSave, ignoreId, withNote }: { open: boolean; title: string; onClose: () => void; onSave: (d: string, t: string, n: string) => void; ignoreId?: string; withNote?: boolean }) {
  const [date, setDate] = useState(today());
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <Field label="Date"><Input type="date" min={today()} value={date} onChange={(e) => { setDate(e.target.value); setTime(""); }} /></Field>
          <Field label="Time"><SlotPicker date={date} value={time} onChange={setTime} ignoreId={ignoreId} /></Field>
          {withNote && <Field label="What would you like to discuss?"><Textarea value={note} onChange={(e) => setNote(e.target.value)} /></Field>}
        </div>
        <DialogFooter>
          <Button onClick={() => { if (!time) return toast.error("Pick a time slot"); onSave(date, time, note); setTime(""); setNote(""); onClose(); }}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
