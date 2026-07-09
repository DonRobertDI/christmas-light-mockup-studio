import {
  Bell,
  ChevronRight,
  Home,
  Lightbulb,
  Menu,
  Plus,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

const navigation = [
  { label: "Customers", to: "/customers", icon: Users },
];

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isGenerating = location.pathname.endsWith("/generate");

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link
        to="/customers"
        className="flex items-center gap-3 px-5 py-6"
        onClick={() => setMobileOpen(false)}
      >
        <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold-300 text-pine-950 shadow-sm">
          <Lightbulb className="h-5 w-5" strokeWidth={2.4} />
          <Sparkles className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-berry-500 p-0.5 text-white" />
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-pine-200">
            Monster Pro Wash
          </div>
          <div className="mt-0.5 text-sm font-bold leading-tight text-white">
            Mockup Studio
          </div>
        </div>
      </Link>

      <nav className="mt-2 flex-1 px-3">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-pine-300/70">
          Workspace
        </p>
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                isActive && !isGenerating
                  ? "bg-white/12 text-white"
                  : "text-pine-100/75 hover:bg-white/7 hover:text-white"
              }`
            }
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
            <ChevronRight className="ml-auto h-4 w-4 opacity-40" />
          </NavLink>
        ))}
        {isGenerating && (
          <div className="mb-1 flex items-center gap-3 rounded-xl bg-white/12 px-3 py-3 text-sm font-semibold text-white">
            <Sparkles className="h-[18px] w-[18px]" />
            Generate mockup
          </div>
        )}
      </nav>

      <div className="m-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-pine-100">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.14)]" />
          Internal sales tool
        </div>
        <p className="mt-2 text-xs leading-relaxed text-pine-200/65">
          Create proposal-ready lighting concepts in minutes.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-pine-950 lg:block">
        {sidebar}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-slate-950/55"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          />
          <aside className="relative h-full w-72 bg-pine-950 shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-2 text-pine-100 hover:bg-white/10"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Home className="hidden h-4 w-4 text-slate-400 sm:block" />
            <span className="hidden text-sm text-slate-400 sm:block">Sales tools</span>
            <ChevronRight className="hidden h-4 w-4 text-slate-300 sm:block" />
            <span className="text-sm font-semibold text-slate-700">
              {isGenerating ? "New mockup" : "Christmas lights"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/customers?new=1"
              className="hidden items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:flex"
            >
              <Plus className="h-4 w-4" />
              New customer
            </Link>
            <button
              className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100"
              aria-label="Notifications"
            >
              <Bell className="h-[18px] w-[18px]" />
            </button>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-pine-100 text-xs font-bold text-pine-800">
              MPW
            </div>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto max-w-[1440px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
