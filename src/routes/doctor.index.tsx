import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { StaffShell, Stat } from "@/components/staff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { age, fmtDate, fmtTime, today, useStore } from "@/lib/store";

export const Route = createFileRoute("/doctor/")({
  head: () => ({
    meta: [
      { title: "Doctor Workspace · Riva Skin Clinic" },
      { name: "description", content: "Dr. Nahar's daily queue, appointments and patient records." },
      { property: "og:title", content: "Riva Doctor Portal" },
      { property: "og:description", content: "Clinical workspace for Dr. Nahar." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DoctorHome,
});

function DoctorHome() {
  const s = useStore();
  const [q, setQ] = useState("");
  const t = today();
  const todays = s.appointments.filter((a) => a.date === t && a.status !== "Cancelled").sort((a, b) => a.time.localeCompare(b.time));
  const queue = todays.filter((a) => ["Checked In", "Waiting", "In Consultation"].includes(a.status));
  const patients = s.patients.filter((p) => (p.name + p.phone + p.id).toLowerCase().includes(q.toLowerCase()));

  return (
    <StaffShell role="Doctor" user="Dr. Nahar">
      <h1 className="text-3xl text-maroon">Good day, Dr. Nahar</h1>
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <Stat label="Appointments today" value={todays.length} />
        <Stat label="In queue" value={queue.length} tone="text-primary" />
        <Stat label="Seen today" value={todays.filter((a) => a.status === "Completed").length} tone="text-success" />
        <Stat label="Visits this month" value={s.visits.filter((v) => v.date.slice(0, 7) === t.slice(0, 7)).length} tone="text-secondary" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-xl border bg-card">
          <div className="border-b p-4"><h2 className="text-xl text-maroon">Today's schedule & queue</h2></div>
          {todays.map((a) => {
            const p = s.getPatient(a.patientId)!;
            return (
              <div key={a.id} className={`flex flex-wrap items-center justify-between gap-2 border-b p-4 last:border-0 ${a.status === "In Consultation" ? "bg-accent" : ""}`}>
                <div className="flex items-center gap-4">
                  <div className="w-16 text-sm font-semibold">{fmtTime(a.time)}</div>
                  <div>
                    <div className="font-medium">{p.name} <span className="text-xs text-muted-foreground">{p.dob && `${age(p.dob)}y`} {p.gender[0]}</span></div>
                    <div className="text-xs text-muted-foreground">{a.reason}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {a.status === "Completed" ? (
                    <Button size="sm" className="doctor-appointment-action doctor-appointment-action-view" asChild>
                      <Link to="/doctor/patient/$id" params={{ id: p.id }} search={{ appt: a.id }}>View</Link>
                    </Button>
                  ) : (
                    <Button size="sm" className="doctor-appointment-action doctor-appointment-action-record" asChild>
                      <Link to="/doctor/patient/$id" params={{ id: p.id }} search={{ appt: undefined }}>View Patient Record</Link>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        <section className="rounded-xl border bg-card">
          <div className="flex items-center justify-between gap-2 border-b p-4">
            <h2 className="text-xl text-maroon">Patients</h2>
            <Button size="sm" variant="outline" asChild><Link to="/doctor/report">Monthly report</Link></Button>
          </div>
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search patients" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="mt-3 divide-y">
              {patients.map((p) => {
                const n = s.visits.filter((v) => v.patientId === p.id).length;
                const last = s.visits.filter((v) => v.patientId === p.id).map((v) => v.date).sort().pop();
                return (
                  <Link key={p.id} to="/doctor/patient/$id" params={{ id: p.id }} search={{ appt: undefined }} className="flex items-center justify-between py-2.5 text-sm hover:text-primary">
                    <span><b>{p.name}</b> <span className="text-muted-foreground">· {p.id}</span></span>
                    <span className="text-xs text-muted-foreground">{n} visits{last && ` · ${fmtDate(last)}`}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </StaffShell>
  );
}
