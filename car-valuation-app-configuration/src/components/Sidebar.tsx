import type { LucideIcon } from "lucide-react";
import { Activity, Car, Home, Lock, LogOut, Settings, Zap } from "lucide-react";
import { cn } from "../utils/cn";

export type Page = "dashboard" | "valuate" | "reports" | "settings" | "privacy";

export const NAV: { key: Page; label: string; icon: LucideIcon }[] = [
  { key: "dashboard", label: "Dashboard", icon: Home },
  { key: "valuate", label: "Valuate", icon: Car },
  { key: "reports", label: "Reports", icon: Activity },
  { key: "settings", label: "Settings", icon: Settings },
  { key: "privacy", label: "Privacy", icon: Lock },
];

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="relative flex h-9 w-9 items-center justify-center">
        <span className="absolute inset-0 rounded-xl bg-white/15" />
        <Zap size={19} strokeWidth={1.6} fill="currentColor" className="relative text-white" />
      </span>
      {!compact && (
        <span className="text-[15px] leading-none font-semibold tracking-tight text-white">
          AutoValuate
          <span className="ml-1 text-[10px] font-medium text-white/60">AI</span>
        </span>
      )}
    </div>
  );
}

export default function Sidebar({ page, onNavigate }: { page: Page; onNavigate: (p: Page) => void }) {
  return (
    <aside className="hidden w-[228px] shrink-0 flex-col px-6 py-9 text-white lg:flex">
      <div className="px-2">
        <Logo />
      </div>

      <nav className="mt-16 space-y-1">
        {NAV.map((n) => {
          const active = n.key === page;
          return (
            <button
              key={n.key}
              type="button"
              onClick={() => onNavigate(n.key)}
              className={cn(
                "flex w-full items-center gap-3.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition",
                active ? "text-white" : "text-white/75 hover:bg-white/10 hover:text-white",
              )}
            >
              <n.icon size={17} strokeWidth={2.2} />
              <span>{n.label}</span>
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-10">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-full border border-white/70 py-2.5 text-xs font-medium text-white transition hover:bg-white/10"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export function MobileNav({ page, onNavigate }: { page: Page; onNavigate: (p: Page) => void }) {
  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-2 text-white lg:hidden">
      <Logo />
      <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
        {NAV.map((n) => {
          const active = n.key === page;
          return (
            <button
              key={n.key}
              type="button"
              onClick={() => onNavigate(n.key)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-medium transition",
                active ? "bg-white text-forest" : "bg-white/10 text-white/85 hover:bg-white/20",
              )}
            >
              <n.icon size={13} strokeWidth={2.2} />
              {n.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
