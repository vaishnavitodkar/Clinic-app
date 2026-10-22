import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import { StaffShell } from "@/components/staff";
import { Field } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { age, fmtDate, today, useStore, type Photo, type RxItem, type Visit } from "@/lib/store";

export const Route = createFileRoute("/doctor/patient/$id")({
  validateSearch: (s: Record<string, unknown>): { appt?: string } => ({ appt: typeof s.appt === "string" ? s.appt : undefined }),
  head: () => ({ meta: [{ title: "Patient Chart · Riva" }, { name: "description", content: "Patient clinical chart." }, { property: "og:title", content: "Patient Chart" }, { property: "og:description", content: "Patient clinical chart." }, { name: "robots", content: "noindex" }] }),
  component: Chart,
});

function Chart() {
  const { id } = Route.useParams();
  const { appt } = Route.useSearch();
  const s = useStore();
  const p = s.getPatient(id);
  const [tab, setTab] = useState(appt ? "new" : "history");
  if (!p) return <StaffShell role="Doctor" user="Dr. Nahar"><p>Patient not found.</p></StaffShell>;
  const visits = s.visits.filter((v) => v.patientId === id).sort((a, b) => a.date.localeCompare(b.date));
  const photos = visits.filter((v) => v.photos.length);
  const cmp = [["First visit", photos[0]], ["Previous visit", photos.length > 2 ? photos[photos.length - 2] : undefined], ["Latest visit", photos.length > 1 ? photos[photos.length - 1] : undefined]] as const;

  return (
    <StaffShell role="Doctor" user="Dr. Nahar" actions={<Button size="sm" variant="outline" asChild><Link to="/doctor">Back to queue</Link></Button>}>
      <div className="rounded-xl border bg-card p-5">
        <h1 className="text-3xl text-maroon">{p.name}</h1>
        <p className="text-sm text-muted-foreground">{p.id} · {p.dob ? `${age(p.dob)} yrs` : ""} · {p.gender} · {p.phone}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-destructive/10 px-3 py-1 text-destructive">Allergies: {p.allergies || "None recorded"}</span>
          <span className="rounded-full bg-muted px-3 py-1">History: {p.medicalHistory || "None"}</span>
        </div>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="mt-5">
        <TabsList><TabsTrigger value="history">Visit history ({visits.length})</TabsTrigger><TabsTrigger value="photos">Photo comparison</TabsTrigger><TabsTrigger value="new">New visit</TabsTrigger></TabsList>
        <TabsContent value="history" className="space-y-3">
          {visits.length === 0 && <p className="text-sm text-muted-foreground">No visits yet.</p>}
          {[...visits].reverse().map((v) => <VisitCard key={v.id} v={v} />)}
        </TabsContent>
        <TabsContent value="photos">
          <div className="grid gap-4 md:grid-cols-3">
            {cmp.map(([label, v]) => (
              <div key={label} className="rounded-xl border bg-card p-3">
                <div className="mb-2 text-sm font-semibold">{label}{v && <span className="font-normal text-muted-foreground"> · {fmtDate(v.date)}</span>}</div>
                {v ? <img src={v.photos[0].url} alt={label} className="aspect-square w-full rounded-lg object-cover" /> : <div className="flex aspect-square items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">No photo</div>}
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="new"><NewVisit pid={id} appt={appt} onSaved={() => setTab("history")} /></TabsContent>
      </Tabs>
    </StaffShell>
  );
}

function VisitCard({ v }: { v: Visit }) {
  return (
    <div className="rounded-xl border bg-card p-5 text-sm">
      <div className="flex justify-between"><b className="font-display text-lg text-maroon">{fmtDate(v.date)} · {v.diagnosis}</b><Button size="sm" variant="ghost" className="no-print" onClick={() => window.print()}>Print summary</Button></div>
      <div className="mt-2 grid gap-2 md:grid-cols-2">
        <div><b>Symptoms:</b> {v.symptoms}</div><div><b>Findings:</b> {v.findings}</div>
        {v.sideEffects && <div><b>Side effects:</b> {v.sideEffects}</div>}
        <div><b>Plan:</b> {v.plan}</div><div><b>Follow-up:</b> {v.followUp}</div>
      </div>
      <div className="mt-2"><b>Rx:</b> {v.prescription.map((r) => `${r.drug} – ${r.dose}, ${r.frequency}, ${r.duration}`).join("; ")}</div>
      {v.photos.length > 0 && <div className="mt-3 flex gap-2">{v.photos.map((ph, i) => <img key={i} src={ph.url} alt={ph.label} className="h-20 w-20 rounded object-cover" />)}</div>}
    </div>
  );
}

function NewVisit({ pid, appt, onSaved }: { pid: string; appt?: string; onSaved: () => void }) {
  const s = useStore();
  const p = s.getPatient(pid)!;
  const [f, setF] = useState({ symptoms: "", history: p.medicalHistory, allergies: p.allergies, findings: "", diagnosis: "", sideEffects: "", plan: "", followUp: "", followUpDate: "", aftercare: "" });
  const [rx, setRx] = useState<RxItem[]>([{ drug: "", dose: "", frequency: "", duration: "" }]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const onFiles = (files: FileList | null) => {
    Array.from(files ?? []).forEach((file) => {
      const r = new FileReader();
      r.onload = () => setPhotos((x) => [...x, { url: String(r.result), label: file.name }]);
      r.readAsDataURL(file);
    });
  };
  const save = () => {
    if (!f.diagnosis) return toast.error("Diagnosis is required");
    s.saveVisit({ ...f, patientId: pid, appointmentId: appt, date: today(), prescription: rx.filter((r) => r.drug), photos, shared: true });
    s.updatePatient(pid, { allergies: f.allergies, medicalHistory: f.history });
    if (f.followUpDate) s.addAppointment({ patientId: pid, date: f.followUpDate, time: "11:00", reason: "Follow-up consultation", source: "Reception" });
    toast.success("Visit saved and shared to patient portal");
    onSaved();
  };
  return (
    <div className="space-y-4 rounded-xl border bg-card p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Symptoms / chief complaint"><Textarea value={f.symptoms} onChange={set("symptoms")} /></Field>
        <Field label="Examination findings"><Textarea value={f.findings} onChange={set("findings")} /></Field>
        <Field label="Relevant medical history"><Input value={f.history} onChange={set("history")} /></Field>
        <Field label="Allergies"><Input value={f.allergies} onChange={set("allergies")} /></Field>
        <Field label="Reported side effects"><Input value={f.sideEffects} onChange={set("sideEffects")} /></Field>
        <Field label="Diagnosis"><Input value={f.diagnosis} onChange={set("diagnosis")} /></Field>
      </div>
      <Field label="Prescription">
        {rx.map((r, i) => (
          <div key={i} className="grid grid-cols-4 gap-2">
            {(["drug", "dose", "frequency", "duration"] as const).map((k) => <Input key={k} placeholder={k} value={r[k]} onChange={(e) => setRx(rx.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)))} />)}
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => setRx([...rx, { drug: "", dose: "", frequency: "", duration: "" }])}>+ Add medicine</Button>
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Treatment plan"><Textarea value={f.plan} onChange={set("plan")} /></Field>
        <Field label="Aftercare instructions"><Textarea value={f.aftercare} onChange={set("aftercare")} /></Field>
        <Field label="Follow-up instructions"><Input value={f.followUp} onChange={set("followUp")} /></Field>
        <Field label="Follow-up date (auto-books)"><Input type="date" min={today()} value={f.followUpDate} onChange={set("followUpDate")} /></Field>
      </div>
      <Field label="Clinical photographs">
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed p-4 text-sm hover:border-primary">
          <Camera className="h-5 w-5 text-primary" />Capture or upload photos
          <input type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
        </label>
        <div className="flex gap-2">{photos.map((ph, i) => <img key={i} src={ph.url} alt={ph.label} className="h-20 w-20 rounded object-cover" />)}</div>
      </Field>
      <Button size="lg" onClick={save}>Save visit</Button>
    </div>
  );
}
