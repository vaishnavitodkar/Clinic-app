import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { addDays, format } from "date-fns";
import skin1 from "@/assets/skin-1.jpg";
import skin2 from "@/assets/skin-2.jpg";
import skin3 from "@/assets/skin-3.jpg";

export const STATUSES = [
  "Booked",
  "Confirmed",
  "Checked In",
  "Waiting",
  "In Consultation",
  "Completed",
  "Cancelled",
  "No Show",
] as const;
export type Status = (typeof STATUSES)[number];

export const CALL_OUTCOMES = [
  "Confirmed attendance",
  "Requested reschedule",
  "Wants to cancel",
  "No answer",
  "Switched off / unreachable",
  "Left message",
] as const;

export const SERVICES = [
  { name: "Acne & Acne Scar Treatment", price: 800, desc: "Medical management, peels and scar revision for active acne and marks." },
  { name: "Laser Hair Reduction", price: 2500, desc: "US-FDA approved diode laser sessions for face and body." },
  { name: "Pigmentation & Melasma", price: 1200, desc: "Targeted creams, peels and Q-switch laser for uneven tone." },
  { name: "Hair Fall & PRP Therapy", price: 3000, desc: "Scalp evaluation, PRP and GFC therapy for thinning hair." },
  { name: "Chemical Peels", price: 1500, desc: "Glycolic, salicylic and combination peels for glow and texture." },
  { name: "Anti-ageing & Skin Rejuvenation", price: 3500, desc: "Botox, fillers, microneedling and skin boosters." },
];

export const SLOTS = Array.from({ length: 20 }, (_, i) => {
  const m = 10 * 60 + i * 30;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${m % 60 ? "30" : "00"}`;
});

export type Patient = {
  id: string;
  name: string;
  phone: string;
  email: string;
  dob: string;
  gender: "Female" | "Male" | "Other";
  address: string;
  allergies: string;
  medicalHistory: string;
  createdAt: string;
};
export type CallLog = { at: string; outcome: string; note: string };
export type Appointment = {
  id: string;
  patientId: string;
  date: string;
  time: string;
  reason: string;
  status: Status;
  calls: CallLog[];
  source: "Reception" | "Website" | "Follow-up request";
};
export type RxItem = { drug: string; dose: string; frequency: string; duration: string };
export type Photo = { url: string; label: string };
export type Visit = {
  id: string;
  patientId: string;
  appointmentId?: string;
  date: string;
  symptoms: string;
  history: string;
  allergies: string;
  findings: string;
  diagnosis: string;
  sideEffects: string;
  prescription: RxItem[];
  plan: string;
  followUp: string;
  followUpDate: string;
  aftercare: string;
  photos: Photo[];
  shared: boolean;
};
export type BillItem = { desc: string; amount: number };
export type Bill = {
  id: string;
  appointmentId: string;
  patientId: string;
  date: string;
  items: BillItem[];
  status: "Paid" | "Due";
  method?: "Cash" | "UPI" | "Card";
};
export type Message = { id: string; name: string; phone: string; message: string; date: string };

type Data = {
  patients: Patient[];
  appointments: Appointment[];
  visits: Visit[];
  bills: Bill[];
  messages: Message[];
};

const d = (n: number) => format(addDays(new Date(), n), "yyyy-MM-dd");

function seed(): Data {
  const patients: Patient[] = [
    { id: "RS-1001", name: "Priya Sharma", phone: "9876543210", email: "priya@example.com", dob: "1996-04-12", gender: "Female", address: "Kothrud, Pune", allergies: "Sulfa drugs", medicalHistory: "PCOS, on metformin", createdAt: d(-120) },
    { id: "RS-1002", name: "Rahul Mehta", phone: "9822011223", email: "rahul@example.com", dob: "1988-09-03", gender: "Male", address: "Baner, Pune", allergies: "None", medicalHistory: "Mild hypertension", createdAt: d(-90) },
    { id: "RS-1003", name: "Ananya Kulkarni", phone: "9765432109", email: "ananya@example.com", dob: "2001-01-22", gender: "Female", address: "Aundh, Pune", allergies: "None", medicalHistory: "None", createdAt: d(-60) },
    { id: "RS-1004", name: "Sneha Patil", phone: "9890123456", email: "sneha@example.com", dob: "1992-11-08", gender: "Female", address: "Viman Nagar, Pune", allergies: "Penicillin", medicalHistory: "Hypothyroidism", createdAt: d(-45) },
    { id: "RS-1005", name: "Vikram Joshi", phone: "9811122233", email: "vikram@example.com", dob: "1985-06-30", gender: "Male", address: "Wakad, Pune", allergies: "None", medicalHistory: "Type 2 diabetes", createdAt: d(-30) },
    { id: "RS-1006", name: "Meera Iyer", phone: "9900887766", email: "meera@example.com", dob: "1979-02-14", gender: "Female", address: "Koregaon Park, Pune", allergies: "Latex", medicalHistory: "None", createdAt: d(-20) },
    { id: "RS-1007", name: "Arjun Desai", phone: "9845098450", email: "arjun@example.com", dob: "1999-07-19", gender: "Male", address: "Hadapsar, Pune", allergies: "None", medicalHistory: "None", createdAt: d(-10) },
    { id: "RS-1008", name: "Kavya Nair", phone: "9767676767", email: "kavya@example.com", dob: "1994-12-01", gender: "Female", address: "Shivajinagar, Pune", allergies: "None", medicalHistory: "Seasonal asthma", createdAt: d(-5) },
  ];
  const a = (id: string, patientId: string, date: string, time: string, reason: string, status: Status, source: Appointment["source"] = "Reception"): Appointment => ({ id, patientId, date, time, reason, status, calls: [], source });
  const appointments: Appointment[] = [
    a("AP-501", "RS-1001", d(-84), "11:00", "Acne & Acne Scar Treatment", "Completed"),
    a("AP-502", "RS-1001", d(-42), "11:30", "Acne follow-up", "Completed"),
    a("AP-503", "RS-1002", d(-30), "16:00", "Hair Fall & PRP Therapy", "Completed"),
    a("AP-504", "RS-1004", d(-14), "12:00", "Pigmentation & Melasma", "Completed"),
    a("AP-505", "RS-1001", d(0), "10:30", "Acne follow-up", "Completed"),
    a("AP-506", "RS-1002", d(0), "11:00", "PRP session 2", "In Consultation"),
    a("AP-507", "RS-1003", d(0), "11:30", "Chemical Peels", "Waiting"),
    a("AP-508", "RS-1004", d(0), "12:00", "Melasma follow-up", "Checked In"),
    a("AP-509", "RS-1005", d(0), "15:00", "Fungal infection", "Confirmed"),
    a("AP-510", "RS-1006", d(0), "16:30", "Anti-ageing & Skin Rejuvenation", "Booked", "Website"),
    a("AP-511", "RS-1007", d(0), "17:00", "Laser Hair Reduction", "Booked"),
    a("AP-512", "RS-1008", d(-1), "18:00", "Eczema consult", "No Show"),
    a("AP-513", "RS-1003", d(1), "10:00", "Peel review", "Booked"),
    a("AP-514", "RS-1006", d(2), "12:30", "Botox consult", "Confirmed"),
    a("AP-515", "RS-1008", d(3), "17:30", "Eczema consult", "Booked", "Website"),
    a("AP-516", "RS-1001", d(28), "11:00", "Acne follow-up", "Booked"),
    a("AP-517", "RS-1007", d(5), "15:30", "Laser session 2", "Booked"),
  ];
  const visits: Visit[] = [
    { id: "V-301", patientId: "RS-1001", appointmentId: "AP-501", date: d(-84), symptoms: "Painful red bumps on both cheeks for 6 months, worse before periods.", history: "PCOS, on metformin", allergies: "Sulfa drugs", findings: "Grade III inflammatory acne on cheeks, multiple papules and pustules, few nodules.", diagnosis: "Acne vulgaris – Grade III", sideEffects: "", prescription: [{ drug: "Doxycycline 100mg", dose: "1 tab", frequency: "Once daily after food", duration: "6 weeks" }, { drug: "Adapalene 0.1% gel", dose: "Pea size", frequency: "At night", duration: "12 weeks" }], plan: "Oral antibiotic + topical retinoid. Gentle cleanser, oil-free moisturizer.", followUp: "Review in 6 weeks", followUpDate: d(-42), aftercare: "Use sunscreen SPF 50 daily. Do not pick or squeeze lesions. Expect mild dryness in first 2 weeks.", photos: [{ url: skin1, label: "Right cheek" }], shared: true },
    { id: "V-302", patientId: "RS-1001", appointmentId: "AP-502", date: d(-42), symptoms: "Fewer new pimples, mild dryness.", history: "PCOS", allergies: "Sulfa drugs", findings: "Grade I–II acne, post-inflammatory erythema.", diagnosis: "Acne vulgaris – improving", sideEffects: "Mild dryness and peeling with adapalene", prescription: [{ drug: "Adapalene 0.1% gel", dose: "Pea size", frequency: "Alternate nights", duration: "8 weeks" }, { drug: "Niacinamide 5% serum", dose: "2 drops", frequency: "Morning", duration: "8 weeks" }], plan: "Stop doxycycline. Continue topical. Plan 2 salicylic peels.", followUp: "Review in 6 weeks", followUpDate: d(0), aftercare: "Reduce adapalene to alternate nights. Moisturize twice daily.", photos: [{ url: skin2, label: "Right cheek" }], shared: true },
    { id: "V-303", patientId: "RS-1001", appointmentId: "AP-505", date: d(0), symptoms: "Skin much clearer, occasional single pimple.", history: "PCOS", allergies: "Sulfa drugs", findings: "Near-clear skin, faint marks only.", diagnosis: "Acne vulgaris – in remission", sideEffects: "None", prescription: [{ drug: "Adapalene 0.1% gel", dose: "Pea size", frequency: "Twice weekly", duration: "Maintenance" }], plan: "Maintenance therapy. Consider one brightening peel for marks.", followUp: "Review in 4 weeks", followUpDate: d(28), aftercare: "Continue sunscreen. Maintenance retinoid twice a week.", photos: [{ url: skin3, label: "Right cheek" }], shared: true },
    { id: "V-304", patientId: "RS-1002", appointmentId: "AP-503", date: d(-30), symptoms: "Hair thinning at crown for 1 year.", history: "Mild hypertension", allergies: "None", findings: "Androgenetic alopecia, Norwood grade III vertex.", diagnosis: "Androgenetic alopecia", sideEffects: "", prescription: [{ drug: "Minoxidil 5% solution", dose: "1 ml", frequency: "Twice daily", duration: "6 months" }], plan: "PRP sessions monthly x 4.", followUp: "PRP session 2 in 4 weeks", followUpDate: d(0), aftercare: "Do not wash hair for 24 hours after PRP.", photos: [], shared: true },
    { id: "V-305", patientId: "RS-1004", appointmentId: "AP-504", date: d(-14), symptoms: "Brown patches on cheeks, worse in summer.", history: "Hypothyroidism", allergies: "Penicillin", findings: "Centrofacial melasma, epidermal type on Wood's lamp.", diagnosis: "Melasma", sideEffects: "", prescription: [{ drug: "Tranexamic acid 250mg", dose: "1 tab", frequency: "Twice daily", duration: "8 weeks" }, { drug: "Triple combination cream", dose: "Thin layer", frequency: "At night", duration: "4 weeks" }], plan: "Strict photoprotection. Glycolic peel after 4 weeks.", followUp: "Review in 2 weeks", followUpDate: d(0), aftercare: "Reapply sunscreen every 3 hours outdoors.", photos: [], shared: true },
  ];
  const bills: Bill[] = [
    { id: "B-801", appointmentId: "AP-501", patientId: "RS-1001", date: d(-84), items: [{ desc: "Consultation", amount: 800 }], status: "Paid", method: "UPI" },
    { id: "B-802", appointmentId: "AP-502", patientId: "RS-1001", date: d(-42), items: [{ desc: "Consultation", amount: 500 }], status: "Paid", method: "Cash" },
    { id: "B-803", appointmentId: "AP-503", patientId: "RS-1002", date: d(-30), items: [{ desc: "Consultation", amount: 800 }, { desc: "PRP session", amount: 3000 }], status: "Paid", method: "Card" },
    { id: "B-804", appointmentId: "AP-504", patientId: "RS-1004", date: d(-14), items: [{ desc: "Consultation", amount: 800 }], status: "Paid", method: "UPI" },
    { id: "B-805", appointmentId: "AP-505", patientId: "RS-1001", date: d(0), items: [{ desc: "Follow-up consultation", amount: 500 }], status: "Paid", method: "UPI" },
    { id: "B-806", appointmentId: "AP-506", patientId: "RS-1002", date: d(0), items: [{ desc: "PRP session", amount: 3000 }], status: "Due" },
  ];
  return { patients, appointments, visits, bills, messages: [] };
}

const KEY = "riva-demo-v1";
const uid = (p: string) => `${p}-${Math.floor(1000 + Math.random() * 9000)}`;

function useStoreState() {
  const [data, setData] = useState<Data>(seed);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setData(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(data));
  }, [data, loaded]);

  const up = (fn: (d: Data) => Data) => setData((x) => fn(x));

  return {
    ...data,
    getPatient: (id: string) => data.patients.find((p) => p.id === id),
    addPatient(p: Omit<Patient, "id" | "createdAt">) {
      const n = Math.max(1000, ...data.patients.map((x) => Number(x.id.split("-")[1]))) + 1;
      const patient = { ...p, id: `RS-${n}`, createdAt: d(0) };
      up((x) => ({ ...x, patients: [...x.patients, patient] }));
      return patient;
    },
    updatePatient(id: string, patch: Partial<Patient>) {
      up((x) => ({ ...x, patients: x.patients.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
    },
    addAppointment(ap: Omit<Appointment, "id" | "calls" | "status"> & { status?: Status }) {
      const appt: Appointment = { status: "Booked", ...ap, id: uid("AP"), calls: [] };
      up((x) => ({ ...x, appointments: [...x.appointments, appt] }));
      return appt;
    },
    updateAppointment(id: string, patch: Partial<Appointment>) {
      up((x) => ({ ...x, appointments: x.appointments.map((a) => (a.id === id ? { ...a, ...patch } : a)) }));
    },
    logCall(id: string, call: CallLog, status?: Status) {
      up((x) => ({
        ...x,
        appointments: x.appointments.map((a) => (a.id === id ? { ...a, calls: [...a.calls, call], status: status ?? a.status } : a)),
      }));
    },
    saveVisit(v: Omit<Visit, "id">) {
      const visit = { ...v, id: uid("V") };
      up((x) => ({
        ...x,
        visits: [...x.visits, visit],
        appointments: x.appointments.map((a) => (a.id === v.appointmentId ? { ...a, status: "Completed" as Status } : a)),
      }));
      return visit;
    },
    saveBill(b: Omit<Bill, "id"> & { id?: string }) {
      up((x) => {
        const exists = b.id && x.bills.some((y) => y.id === b.id);
        const bill = { ...b, id: b.id ?? uid("B") } as Bill;
        return { ...x, bills: exists ? x.bills.map((y) => (y.id === b.id ? bill : y)) : [...x.bills, bill] };
      });
    },
    addMessage(m: Omit<Message, "id" | "date">) {
      up((x) => ({ ...x, messages: [...x.messages, { ...m, id: uid("M"), date: d(0) }] }));
    },
    reset() {
      setData(seed());
    },
  };
}

type Store = ReturnType<typeof useStoreState>;
const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const s = useStoreState();
  return <Ctx.Provider value={s}>{children}</Ctx.Provider>;
}
export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside provider");
  return s;
}

export const today = () => d(0);
export const billTotal = (b: Bill) => b.items.reduce((s, i) => s + i.amount, 0);
export const age = (dob: string) => Math.floor((Date.now() - new Date(dob).getTime()) / 3.15576e10);
export const fmtDate = (s: string) => format(new Date(s + "T00:00:00"), "d MMM yyyy");
export const fmtTime = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};
export const statusTone: Record<Status, string> = {
  Booked: "bg-muted text-foreground",
  Confirmed: "bg-secondary/15 text-secondary",
  "Checked In": "bg-accent text-accent-foreground",
  Waiting: "bg-warning/20 text-maroon",
  "In Consultation": "bg-primary text-primary-foreground",
  Completed: "bg-success/15 text-success",
  Cancelled: "bg-destructive/10 text-destructive",
  "No Show": "bg-maroon/10 text-maroon",
};
