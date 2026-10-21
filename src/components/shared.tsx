import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  CALL_OUTCOMES,
  SERVICES,
  SLOTS,
  billTotal,
  fmtDate,
  fmtTime,
  statusTone,
  today,
  useStore,
  type Appointment,
  type Bill,
  type Status,
} from "@/lib/store";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <img src="/favicon.png" alt="Riva Skin Hair & Laser Clinic logo" className="h-10 w-10 rounded-full bg-card object-cover" />
      <span className="leading-tight">
        <span className="block font-display text-lg font-semibold text-maroon">Riva Skin</span>
        <span className="block text-[11px] uppercase tracking-widest text-secondary">Hair & Laser Clinic</span>
      </span>
    </span>
  );
}

export function DemoBar() {
  const s = useStore();
  const tab = "rounded-full px-3 py-1 text-xs font-medium text-maroon-foreground/80 hover:text-maroon-foreground";
  const active = { className: "bg-maroon-foreground/15 text-maroon-foreground" };
  return (
    <div className="no-print flex flex-wrap items-center justify-center gap-1 bg-maroon px-3 py-1.5 text-maroon-foreground">
      <span className="mr-2 text-[11px] uppercase tracking-widest opacity-70">Demo · switch view</span>
      <Link to="/" className={tab} activeOptions={{ exact: true }} activeProps={active}>Patient website</Link>
      <Link to="/portal" className={tab} activeProps={active}>Patient portal</Link>
      <Link to="/reception" className={tab} activeProps={active}>Reception</Link>
      <Link to="/doctor" className={tab} activeProps={active}>Doctor</Link>
      <button
        className={cn(tab, "ml-2 underline")}
        onClick={() => {
          s.reset();
          toast.success("Demo data reset");
        }}
      >
        Reset demo data
      </button>
    </div>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap", statusTone[status])}>{status}</span>;
}

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export function SlotPicker({ date, value, onChange, ignoreId }: { date: string; value: string; onChange: (t: string) => void; ignoreId?: string }) {
  const s = useStore();
  const taken = new Set(
    s.appointments.filter((a) => a.date === date && a.id !== ignoreId && !["Cancelled", "No Show"].includes(a.status)).map((a) => a.time),
  );
  const sunday = new Date(date + "T00:00:00").getDay() === 0;
  if (sunday) return <p className="text-sm text-muted-foreground">Clinic is closed on Sundays. Please pick another day.</p>;
  return (
    <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5">
      {SLOTS.map((t) => (
        <button
          key={t}
          type="button"
          disabled={taken.has(t)}
          onClick={() => onChange(t)}
          className={cn(
            "rounded-md border px-1 py-1.5 text-xs transition-colors",
            value === t ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary",
            taken.has(t) && "cursor-not-allowed opacity-35 line-through",
          )}
        >
          {fmtTime(t)}
        </button>
      ))}
    </div>
  );
}

/** Book or reschedule from staff side */
export function AppointmentDialog({
  open,
  onOpenChange,
  appointment,
  defaultPatientId,
  defaultDate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  appointment?: Appointment;
  defaultPatientId?: string;
  defaultDate?: string;
}) {
  const s = useStore();
  const [patientId, setPatientId] = useState(appointment?.patientId ?? defaultPatientId ?? "");
  const [date, setDate] = useState(appointment?.date ?? defaultDate ?? today());
  const [time, setTime] = useState(appointment?.time ?? "");
  const [reason, setReason] = useState(appointment?.reason ?? SERVICES[0].name);
  const [q, setQ] = useState("");
  const list = s.patients.filter((p) => (p.name + p.phone + p.id).toLowerCase().includes(q.toLowerCase()));

  const save = () => {
    if (!patientId || !time) return toast.error("Choose a patient and a time slot");
    if (appointment) {
      s.updateAppointment(appointment.id, { date, time, reason, status: "Booked" });
      toast.success(`Rescheduled to ${fmtDate(date)}, ${fmtTime(time)}`);
    } else {
      s.addAppointment({ patientId, date, time, reason, source: "Reception" });
      toast.success(`Booked for ${fmtDate(date)}, ${fmtTime(time)}`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{appointment ? "Reschedule appointment" : "Book appointment"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!appointment && !defaultPatientId ? (
            <Field label="Patient">
              <Input placeholder="Search name, phone or ID" value={q} onChange={(e) => setQ(e.target.value)} />
              <div className="max-h-36 overflow-y-auto rounded-md border">
                {list.map((p) => (
                  <button key={p.id} type="button" onClick={() => setPatientId(p.id)} className={cn("flex w-full justify-between px-3 py-1.5 text-left text-sm hover:bg-muted", patientId === p.id && "bg-accent")}>
                    <span>{p.name}</span>
                    <span className="text-muted-foreground">{p.id} · {p.phone}</span>
                  </button>
                ))}
              </div>
            </Field>
          ) : (
            <p className="text-sm">Patient: <b>{s.getPatient(patientId)?.name}</b></p>
          )}
          <Field label="Reason / service">
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[...SERVICES.map((x) => x.name), "Follow-up consultation", reason].filter((v, i, a) => a.indexOf(v) === i).map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Date">
            <Input type="date" min={today()} value={date} onChange={(e) => { setDate(e.target.value); setTime(""); }} />
          </Field>
          <Field label="Time slot">
            <SlotPicker date={date} value={time} onChange={setTime} ignoreId={appointment?.id} />
          </Field>
        </div>
        <DialogFooter>
          <Button onClick={save}>{appointment ? "Save new time" : "Book appointment"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CallDialog({ appointment, onOpenChange }: { appointment: Appointment | null; onOpenChange: (o: boolean) => void }) {
  const s = useStore();
  const [outcome, setOutcome] = useState<string>(CALL_OUTCOMES[0]);
  const [note, setNote] = useState("");
  const p = appointment ? s.getPatient(appointment.patientId) : undefined;
  const save = () => {
    if (!appointment) return;
    const status: Status | undefined = outcome === "Confirmed attendance" ? "Confirmed" : outcome === "Wants to cancel" ? "Cancelled" : undefined;
    s.logCall(appointment.id, { at: new Date().toISOString(), outcome, note }, status);
    toast.success(`Call logged: ${outcome}`);
    setNote("");
    onOpenChange(false);
  };
  return (
    <Dialog open={!!appointment} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmation call</DialogTitle>
        </DialogHeader>
        {appointment && p && (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-3 text-sm">
              <div className="font-semibold">{p.name}</div>
              <a href={`tel:${p.phone}`} className="text-secondary underline">{p.phone}</a>
              <div className="text-muted-foreground">{fmtDate(appointment.date)} · {fmtTime(appointment.time)} · {appointment.reason}</div>
            </div>
            <Field label="Call outcome">
              <Select value={outcome} onValueChange={setOutcome}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CALL_OUTCOMES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Note">
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Will come 15 min late" />
            </Field>
            {appointment.calls.length > 0 && (
              <div className="space-y-1 text-xs">
                <div className="font-semibold text-muted-foreground">Previous calls</div>
                {appointment.calls.map((c, i) => (
                  <div key={i}>{new Date(c.at).toLocaleString()} — {c.outcome}{c.note && `: ${c.note}`}</div>
                ))}
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button onClick={save}>Save call outcome</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BillDialog({ appointment, onOpenChange }: { appointment: Appointment | null; onOpenChange: (o: boolean) => void }) {
  const s = useStore();
  const existing = appointment ? s.bills.find((b) => b.appointmentId === appointment.id) : undefined;
  return (
    <Dialog open={!!appointment} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Visit bill</DialogTitle>
        </DialogHeader>
        {appointment && <BillForm key={appointment.id} appointment={appointment} existing={existing} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function BillForm({ appointment, existing, onDone }: { appointment: Appointment; existing?: Bill; onDone: () => void }) {
  const s = useStore();
  const p = s.getPatient(appointment.patientId);
  const [items, setItems] = useState(existing?.items ?? [{ desc: "Consultation", amount: 800 }]);
  const [status, setStatus] = useState<Bill["status"]>(existing?.status ?? "Due");
  const [method, setMethod] = useState<NonNullable<Bill["method"]>>(existing?.method ?? "UPI");
  const total = items.reduce((t, i) => t + (Number(i.amount) || 0), 0);
  const save = () => {
    s.saveBill({ id: existing?.id, appointmentId: appointment.id, patientId: appointment.patientId, date: appointment.date, items, status, method: status === "Paid" ? method : undefined });
    toast.success(`Bill saved · ₹${total} ${status}`);
    onDone();
  };
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{p?.name} · {fmtDate(appointment.date)} · {appointment.reason}</p>
      {items.map((it, i) => (
        <div key={i} className="flex gap-2">
          <Input value={it.desc} onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, desc: e.target.value } : x)))} />
          <Input className="w-28" type="number" value={it.amount} onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, amount: Number(e.target.value) } : x)))} />
          <Button variant="ghost" size="sm" onClick={() => setItems(items.filter((_, j) => j !== i))}>✕</Button>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setItems([...items, { desc: "", amount: 0 }])}>+ Add item</Button>
        {SERVICES.slice(0, 4).map((sv) => (
          <Button key={sv.name} variant="ghost" size="sm" onClick={() => setItems([...items, { desc: sv.name, amount: sv.price }])}>+ {sv.name.split(" ")[0]} ₹{sv.price}</Button>
        ))}
      </div>
      <div className="flex items-center justify-between border-t pt-3">
        <span className="font-display text-2xl text-maroon">₹{total.toLocaleString("en-IN")}</span>
        <div className="flex gap-2">
          {(["Due", "Paid"] as const).map((x) => (
            <Button key={x} size="sm" variant={status === x ? "default" : "outline"} onClick={() => setStatus(x)}>{x}</Button>
          ))}
        </div>
      </div>
      {status === "Paid" && (
        <div className="flex gap-2">
          {(["Cash", "UPI", "Card"] as const).map((m) => (
            <Button key={m} size="sm" variant={method === m ? "secondary" : "outline"} onClick={() => setMethod(m)}>{m}</Button>
          ))}
        </div>
      )}
      <Button className="w-full" onClick={save}>Save bill</Button>
    </div>
  );
}

export { billTotal };
