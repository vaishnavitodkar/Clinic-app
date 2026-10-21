import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout, CLINIC } from "@/components/site";
import { Field } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Timings · Riva Skin Clinic" },
      { name: "description", content: "Address, phone, timings and a message form for Riva Skin Hair & Laser Clinic." },
      { property: "og:title", content: "Contact Riva Skin Clinic" },
      { property: "og:description", content: "Find us on FC Road, Pune. Mon–Sat 10 AM – 8 PM." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const s = useStore();
  const [f, setF] = useState({ name: "", phone: "", message: "" });
  return (
    <SiteLayout>
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 md:grid-cols-2">
        <div>
          <h1 className="text-5xl text-maroon">Visit us</h1>
          <p className="mt-6 text-lg">{CLINIC.address}</p>
          <p className="mt-4"><a className="text-secondary underline" href="tel:+919876500000">{CLINIC.phone}</a></p>
          <p>{CLINIC.email}</p>
          <div className="mt-6 rounded-2xl bg-muted p-5">
            {CLINIC.timings.map(([a, b]) => (
              <div key={a} className="flex justify-between py-1"><span>{a}</span><b>{b}</b></div>
            ))}
          </div>
        </div>
        <form
          className="space-y-4 rounded-3xl border bg-card p-8"
          onSubmit={(e) => {
            e.preventDefault();
            if (!f.name || !f.phone || !f.message) return toast.error("Please fill all fields");
            s.addMessage(f);
            setF({ name: "", phone: "", message: "" });
            toast.success("Message sent. The clinic will call you back.");
          }}
        >
          <h2 className="text-2xl text-maroon">Send a message</h2>
          <Field label="Name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="Phone"><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
          <Field label="Message"><Textarea rows={5} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></Field>
          <Button type="submit" className="w-full">Send</Button>
        </form>
      </div>
    </SiteLayout>
  );
}
