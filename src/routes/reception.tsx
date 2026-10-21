import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { addDays, addMonths, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek, eachDayOfInterval, isSameMonth } from "date-fns";
import { ChevronLeft, ChevronRight, Phone, Plus, Receipt, Search, UserPlus } from "lucide-react";
import { StaffShell, Stat } from "@/components/staff";
import { AppointmentDialog, BillDialog, CallDialog, Field, StatusBadge } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { STATUSES, age, billTotal, fmtDate, fmtTime, today, useStore, type Appointment, type Patient, type Status } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reception")({
  head: () => ({
    meta: [
      { title: "Reception Desk · Riva Skin Clinic" },
      { name: "description", content: "Patient registration, appointments, confirmation calls, queue and billing." },
      { property: "og:title", content: "Riva Reception Portal" },
      { property: "og:description", content: "Clinic operations workspace for the front desk." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Reception,
});

const iso = (d: Date) => format(d, "yyyy-MM-dd");

function Reception() {
  const s = useStore();
  const [book, setBook] = useState<{ date?: string; patientId?: string } | null>(null);
  const [resched, setResched] = useState<Appointment | null>(null);
  const [call, setCall] = useState<Appointment | null>(null);
  const [bill, setBill] = useState<Appointment | null>(null);
  const [regOpen, setRegOpen] = useState<Patient | "new" | null>(null);

  const t = today();
  const todays = s.appointments.filter((a) => a.date === t).sort((a, b) => a.time.localeCompare(b.time));
  const collected = s.bills.filter((b) => b.date === t && b.status === "Paid").reduce((x, b) => x + billTotal(b), 0);
  const due = s.bills.filter((b) => b.status === "Due").reduce((x, b) => x + billTotal(b), 0);

  const ctx = { setResched, setCall, setBill };

  return (
    <StaffShell
      role="Reception"
      user="Sonal (Front desk)"
      actions={
        <>
          <Button size="sm" variant="outline" onClick={() => setRegOpen("new")}><UserPlus className="h-4 w-4" />Register</Button>
          <Button size="sm" onClick={() => setBook({})}><Plus className="h-4 w-4" />Book</Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Today's appointments" value={todays.filter((a) => a.status !== "Cancelled").length} />
        <Stat label="To confirm" value={todays.filter((a) => a.status === "Booked").length} tone="text-primary" />
        <Stat label="In clinic now" value={todays.filter((a) => ["Checked In", "Waiting", "In Consultation"].includes(a.status)).length} tone="text-secondary" />
        <Stat label="Collected today" value={`₹${collected.toLocaleString("en-IN")}`} tone="text-success" />
        <Stat label="Pending dues" value={`₹${due.toLocaleString("en-IN")}`} tone="text-destructive" />
      </div>

      <Tabs defaultValue="queue" className="mt-6">
        <TabsList>
          <TabsTrigger value="queue">Today's queue</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="messages">Messages {s.messages.length > 0 && `(${s.messages.length})`}</TabsTrigger>
        </TabsList>
        <TabsContent value="queue"><ApptTable list={todays} {...ctx} /></TabsContent>
        <TabsContent value="calendar"><CalendarView onBook={(date) => setBook({ date })} {...ctx} /></TabsContent>
        <TabsContent value="patients"><Patients onEdit={(p) => setRegOpen(p)} onBook={(id) => setBook({ patientId: id })} /></TabsContent>
        <TabsContent value="billing"><Billing onOpen={setBill} /></TabsContent>
        <TabsContent value="messages">
          <div className="rounded-xl border bg-card">
            {s.messages.length === 0 && <p className="p-6 text-sm text-muted-foreground">No website messages yet. Try the Contact page on the patient website.</p>}
            {s.messages.map((m) => (
              <div key={m.id} className="border-b p-4 text-sm last:border-0"><b>{m.name}</b> · {m.phone} · {fmtDate(m.date)}<p className="mt-1 text-muted-foreground">{m.message}</p></div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {book && <AppointmentDialog open onOpenChange={(o) => !o && setBook(null)} defaultDate={book.date} defaultPatientId={book.patientId} />}
      {resched && <AppointmentDialog open appointment={resched} onOpenChange={(o) => !o && setResched(null)} />}
      <CallDialog appointment={call} onOpenChange={(o) => !o && setCall(null)} />
      <BillDialog appointment={bill} onOpenChange={(o) => !o && setBill(null)} />
      {regOpen && <PatientDialog patient={regOpen === "new" ? undefined : regOpen} onClose={() => setRegOpen(null)} onBook={(id) => setBook({ patientId: id })} />}
    </StaffShell>
  );
}

type Ctx = { setResched: (a: Appointment) => void; setCall: (a: Appointment) => void; setBill: (a: Appointment) => void };

const NEXT: Partial<Record<Status, Status>> = { Booked: "Confirmed", Confirmed: "Checked In", "Checked In": "Waiting" };

function ApptTable({ list, setResched, setCall, setBill, showDate }: { list: Appointment[]; showDate?: boolean } & Ctx) {
  const s = useStore();
  if (list.length === 0) return <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">No appointments.</div>;
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr><th className="p-3">Time</th><th>Patient</th><th>Reason</th><th>Status</th><th>Bill</th><th className="p-3 text-right">Actions</th></tr>
        </thead>
        <tbody>
          {list.map((a) => {
            const p = s.getPatient(a.patientId);
            const b = s.bills.find((x) => x.appointmentId === a.id);
            const nx = NEXT[a.status];
            return (
              <tr key={a.id} className="border-t align-middle">
                <td className="p-3 font-semibold whitespace-nowrap">{showDate && <div className="text-xs font-normal text-muted-foreground">{fmtDate(a.date)}</div>}{fmtTime(a.time)}</td>
                <td>
                  <div className="font-medium">{p?.name}</div>
                  <div className="text-xs text-muted-foreground">{p?.id} · {p?.phone}{a.source !== "Reception" && <span className="ml-1 text-primary">· {a.source}</span>}</div>
                  {a.calls.length > 0 && <div className="text-xs text-secondary">Last call: {a.calls[a.calls.length - 1].outcome}</div>}
                </td>
                <td className="max-w-48 truncate">{a.reason}</td>
                <td>
                  <Select value={a.status} onValueChange={(v) => { s.updateAppointment(a.id, { status: v as Status }); toast.success(`${p?.name}: ${v}`); }}>
                    <SelectTrigger className="h-auto w-auto border-0 bg-transparent p-0 shadow-none"><StatusBadge status={a.status} /></SelectTrigger>
                    <SelectContent>{STATUSES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
                <td>{b ? <span className={cn("text-xs font-semibold", b.status === "Paid" ? "text-success" : "text-destructive")}>₹{billTotal(b)} {b.status}</span> : <span className="text-xs text-muted-foreground">—</span>}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    {nx && <Button size="sm" variant="secondary" onClick={() => { s.updateAppointment(a.id, { status: nx }); toast.success(`${p?.name}: ${nx}`); }}>{nx === "Confirmed" ? "Confirm" : nx === "Checked In" ? "Check in" : "Send to queue"}</Button>}
                    <Button size="icon" variant="ghost" title="Call" onClick={() => setCall(a)}><Phone className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" title="Bill" onClick={() => setBill(a)}><Receipt className="h-4 w-4" /></Button>
                    {!["Completed", "Cancelled"].includes(a.status) && (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => setResched(a)}>Reschedule</Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { s.updateAppointment(a.id, { status: "Cancelled" }); toast.success("Cancelled"); }}>Cancel</Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CalendarView({ onBook, ...ctx }: { onBook: (d: string) => void } & Ctx) {
  const s = useStore();
  const [mode, setMode] = useState<"day" | "week" | "month">("week");
  const [cursor, setCursor] = useState(new Date());
  const [day, setDay] = useState<string | null>(null);
  const step = (n: number) => setCursor(mode === "month" ? addMonths(cursor, n) : addDays(cursor, n * (mode === "week" ? 7 : 1)));
  const byDate = useMemo(() => {
    const m: Record<string, Appointment[]> = {};
    s.appointments.forEach((a) => (m[a.date] ??= []).push(a));
    Object.values(m).forEach((l) => l.sort((a, b) => a.time.localeCompare(b.time)));
    return m;
  }, [s.appointments]);

  const days =
    mode === "week"
      ? eachDayOfInterval({ start: startOfWeek(cursor, { weekStartsOn: 1 }), end: endOfWeek(cursor, { weekStartsOn: 1 }) })
      : eachDayOfInterval({ start: startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 }) });

  const title = mode === "day" ? format(cursor, "EEEE, d MMM yyyy") : mode === "week" ? `Week of ${format(days[0], "d MMM")}` : format(cursor, "MMMM yyyy");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" onClick={() => step(-1)}><ChevronLeft className="h-4 w-4" /></Button>
          <Button size="sm" variant="outline" onClick={() => setCursor(new Date())}>Today</Button>
          <Button size="icon" variant="outline" onClick={() => step(1)}><ChevronRight className="h-4 w-4" /></Button>
          <h2 className="ml-2 text-xl text-maroon">{title}</h2>
        </div>
        <div className="flex gap-1">
          {(["day", "week", "month"] as const).map((m) => <Button key={m} size="sm" variant={mode === m ? "default" : "outline"} onClick={() => setMode(m)} className="capitalize">{m}</Button>)}
        </div>
      </div>
      {mode === "day" ? (
        <div className="space-y-3">
          <Button size="sm" variant="outline" onClick={() => onBook(iso(cursor))}><Plus className="h-4 w-4" />Book on this day</Button>
          <ApptTable list={byDate[iso(cursor)] ?? []} {...ctx} />
        </div>
      ) : (
        <div className={cn("grid gap-2", "grid-cols-7")}>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="text-center text-xs font-semibold uppercase text-muted-foreground">{d}</div>)}
          {days.map((d) => {
            const k = iso(d);
            const l = (byDate[k] ?? []).filter((a) => a.status !== "Cancelled");
            const isToday = k === today();
            return (
              <button
                key={k}
                onClick={() => (mode === "week" ? (setCursor(d), setMode("day")) : setDay(k))}
                className={cn("rounded-lg border bg-card p-2 text-left hover:border-primary", mode === "week" ? "min-h-64" : "min-h-24", mode === "month" && !isSameMonth(d, cursor) && "opacity-40", isToday && "ring-2 ring-primary")}
              >
                <div className="text-sm font-semibold">{format(d, "d")}</div>
                {mode === "week" ? (
                  <div className="mt-1 space-y-1">
                    {l.map((a) => <div key={a.id} className="rounded bg-accent px-1.5 py-1 text-[11px] leading-tight text-accent-foreground"><b>{fmtTime(a.time)}</b> {s.getPatient(a.patientId)?.name}</div>)}
                  </div>
                ) : (
                  l.length > 0 && <div className="mt-1 inline-block rounded-full bg-primary px-2 text-xs font-semibold text-primary-foreground">{l.length}</div>
                )}
              </button>
            );
          })}
        </div>
      )}
      <Dialog open={!!day} onOpenChange={(o) => !o && setDay(null)}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader><DialogTitle>{day && fmtDate(day)}</DialogTitle></DialogHeader>
          {day && <ApptTable list={byDate[day] ?? []} {...ctx} />}
          <DialogFooter><Button onClick={() => { const d = day!; setDay(null); onBook(d); }}>Book on this day</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Patients({ onEdit, onBook }: { onEdit: (p: Patient) => void; onBook: (id: string) => void }) {
  const s = useStore();
  const [q, setQ] = useState("");
  const list = s.patients.filter((p) => (p.name + " " + p.phone + " " + p.id).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-3">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by name, phone or patient ID" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="p-3">ID</th><th>Name</th><th>Phone</th><th>Age / Gender</th><th>Last visit</th><th className="p-3 text-right">Actions</th></tr></thead>
          <tbody>
            {list.map((p) => {
              const last = s.appointments.filter((a) => a.patientId === p.id && a.status === "Completed").map((a) => a.date).sort().pop();
              return (
                <tr key={p.id} className="border-t">
                  <td className="p-3 font-mono text-xs">{p.id}</td>
                  <td className="font-medium">{p.name}</td>
                  <td>{p.phone}</td>
                  <td>{p.dob ? age(p.dob) : "—"} / {p.gender}</td>
                  <td>{last ? fmtDate(last) : "—"}</td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => onEdit(p)}>Edit</Button>
                    <Button size="sm" variant="secondary" onClick={() => onBook(p.id)}>Book</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No patients match "{q}".</p>}
      </div>
    </div>
  );
}

function PatientDialog({ patient, onClose, onBook }: { patient?: Patient; onClose: () => void; onBook: (id: string) => void }) {
  const s = useStore();
  const [f, setF] = useState({ name: "", phone: "", email: "", dob: "", gender: "Female" as Patient["gender"], address: "", allergies: "", medicalHistory: "", ...patient });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const save = (andBook: boolean) => {
    if (!f.name || f.phone.replace(/\D/g, "").length !== 10) return toast.error("Name and a 10-digit phone are required");
    if (patient) {
      // Reception may only edit basic info; clinical fields are doctor-owned
      s.updatePatient(patient.id, { name: f.name, phone: f.phone, email: f.email, dob: f.dob, gender: f.gender, address: f.address });
      toast.success("Patient updated");
      onClose();
    } else {
      const p = s.addPatient(f);
      toast.success(`Registered ${p.name} · ${p.id}`);
      onClose();
      if (andBook) onBook(p.id);
    }
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{patient ? `Edit ${patient.id}` : "Register new patient"}</DialogTitle></DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Full name" className="sm:col-span-2"><Input value={f.name} onChange={set("name")} /></Field>
          <Field label="Mobile"><Input value={f.phone} onChange={set("phone")} /></Field>
          <Field label="Email"><Input value={f.email} onChange={set("email")} /></Field>
          <Field label="Date of birth"><Input type="date" value={f.dob} onChange={set("dob")} /></Field>
          <Field label="Gender">
            <Select value={f.gender} onValueChange={(v) => setF({ ...f, gender: v as Patient["gender"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Female", "Male", "Other"].map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Address" className="sm:col-span-2"><Input value={f.address} onChange={set("address")} /></Field>
          {!patient ? (
            <>
              <Field label="Known allergies"><Input value={f.allergies} onChange={set("allergies")} /></Field>
              <Field label="Medical history"><Textarea rows={1} value={f.medicalHistory} onChange={set("medicalHistory")} /></Field>
            </>
          ) : (
            <p className="text-xs text-muted-foreground sm:col-span-2">Allergies and medical history can only be changed by the doctor.</p>
          )}
        </div>
        <DialogFooter className="gap-2">
          {!patient && <Button variant="outline" onClick={() => save(true)}>Save & book</Button>}
          <Button onClick={() => save(false)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Billing({ onOpen }: { onOpen: (a: Appointment) => void }) {
  const s = useStore();
  const [date, setDate] = useState(today());
  const bills = s.bills.filter((b) => b.date === date);
  const unbilled = s.appointments.filter((a) => a.date === date && ["Completed", "In Consultation", "Waiting", "Checked In"].includes(a.status) && !s.bills.some((b) => b.appointmentId === a.id));
  const paid = bills.filter((b) => b.status === "Paid");
  const byMethod = (["Cash", "UPI", "Card"] as const).map((m) => [m, paid.filter((b) => b.method === m).reduce((x, b) => x + billTotal(b), 0)] as const);
  const allDue = s.bills.filter((b) => b.status === "Due");
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Daily collection for</span>
        <Input type="date" className="w-44" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Total collected" value={`₹${paid.reduce((x, b) => x + billTotal(b), 0).toLocaleString("en-IN")}`} tone="text-success" />
        {byMethod.map(([m, v]) => <Stat key={m} label={m} value={`₹${v.toLocaleString("en-IN")}`} />)}
      </div>
      {unbilled.length > 0 && (
        <div className="rounded-xl border border-warning bg-warning/10 p-4">
          <div className="mb-2 text-sm font-semibold">Visits without a bill</div>
          <div className="flex flex-wrap gap-2">{unbilled.map((a) => <Button key={a.id} size="sm" variant="outline" onClick={() => onOpen(a)}>{s.getPatient(a.patientId)?.name} · {fmtTime(a.time)}</Button>)}</div>
        </div>
      )}
      <BillTable list={bills} onOpen={onOpen} title={`Bills on ${fmtDate(date)}`} />
      <BillTable list={allDue} onOpen={onOpen} title="All outstanding dues" />
    </div>
  );
}

function BillTable({ list, onOpen, title }: { list: ReturnType<typeof useStore>["bills"]; onOpen: (a: Appointment) => void; title: string }) {
  const s = useStore();
  return (
    <div className="rounded-xl border bg-card">
      <div className="border-b p-3 text-sm font-semibold">{title}</div>
      {list.length === 0 && <p className="p-4 text-sm text-muted-foreground">None.</p>}
      {list.map((b) => {
        const a = s.appointments.find((x) => x.id === b.appointmentId);
        return (
          <div key={b.id} className="flex items-center justify-between border-b p-3 text-sm last:border-0">
            <div><b>{s.getPatient(b.patientId)?.name}</b> <span className="text-muted-foreground">· {b.id} · {fmtDate(b.date)} · {b.items.map((i) => i.desc).join(", ")}</span></div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">₹{billTotal(b).toLocaleString("en-IN")}</span>
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", b.status === "Paid" ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive")}>{b.status}{b.method && ` · ${b.method}`}</span>
              {a && <Button size="sm" variant="ghost" onClick={() => onOpen(a)}>{b.status === "Due" ? "Collect" : "View"}</Button>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
