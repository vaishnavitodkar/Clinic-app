import type { ReactNode } from "react";
import { Logo } from "./shared";

export function StaffShell({ role, user, children, actions }: { role: string; user: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/40">
      <header className="no-print border-b bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">{role}</span>
          </div>
          <div className="flex items-center gap-3">
            {actions}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-primary-foreground">{user[0]}</div>
            <span className="hidden text-sm font-medium sm:block">{user}</span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}

export function Stat({ label, value, tone = "text-maroon" }: { label: string; value: ReactNode; tone?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display text-3xl ${tone}`}>{value}</div>
    </div>
  );
}
