import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { StaffShell, Stat } from "@/components/staff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { billTotal, fmtDate, today, useStore } from "@/lib/store";

export const Route = createFileRoute("/doctor/report")({
  head: () => ({ meta: [{ title: "Monthly Treatment Report · Riva" }, { name: "description", content: "Monthly treatment-history report." }, { property: "og:title", content: "Monthly Report" }, { property: "og:description", content: "Monthly treatment-history report." }, { name: "robots", content: "noindex" }] }),
  component: Report,
});

function Report() {
  const s = useStore();
  const [month, setMonth] = useState(today().slice(0, 7));
  const visits = s.visits.filter((v) => v.date.startsWith(month)).sort((a, b) => a.date.localeCompare(b.date));
  const revenue = s.bills.filter((b) => b.date.startsWith(month) && b.status === "Paid").reduce((x, b) => x + billTotal(b), 0);
  return (
    <StaffShell role="Doctor" user="Dr. Riva" actions={<Button size="sm" variant="outline" asChild><Link to="/doctor">Back</Link></Button>}>
      <div className="no-print mb-4 flex gap-3"><Input type="month" className="w-48" value={month} onChange={(e) => setMonth(e.target.value)} /><Button onClick={() => window.print()}>Print report</Button></div>
      <h1 className="text-3xl text-maroon">Treatment history · {month}</h1>
      <div className="my-4 grid gap-3 sm:grid-cols-3">
        <Stat label="Visits" value={visits.length} />
        <Stat label="Unique patients" value={new Set(visits.map((v) => v.patientId)).size} />
        <Stat label="Collected" value={`₹${revenue.toLocaleString("en-IN")}`} tone="text-success" />
      </div>
      <div className="rounded-xl border bg-card">
        {visits.length === 0 && <p className="p-6 text-sm text-muted-foreground">No visits this month.</p>}
        {visits.map((v) => (
          <div key={v.id} className="border-b p-4 text-sm last:border-0">
            <b>{fmtDate(v.date)} · {s.getPatient(v.patientId)?.name}</b> — {v.diagnosis}
            <div className="text-muted-foreground">Rx: {v.prescription.map((r) => r.drug).join(", ")} · {v.plan}</div>
          </div>
        ))}
      </div>
    </StaffShell>
  );
}
