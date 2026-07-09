import {
  Bell,
  ChevronRight,
  Home,
  Lightbulb,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

const navigation = [
  { label: "Customers", to: "/customers", icon: Users },
];

const SIDEBAR_STORAGE_KEY = "mockup-studio:sidebar-collapsed";

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const location = useLocation();
  const isGenerating = location.pathname.endsWith("/generate");

  useEffect(() => {
    try {
      window.localStorage.setItem(
        SIDEBAR_STORAGE_KEY,
        String(sidebarCollapsed),
      );
    } catch {
      // The sidebar still works if storage is unavailable.
    }
  }, [sidebarCollapsed]);

  const renderSidebar = (collapsed: boolean, showToggle = false) => (
    <div className="relative flex h-full flex-col">
      <Link
        to="/customers"
        className={`flex h-[88px] items-center gap-3 ${
          collapsed ? "justify-center px-3" : "px-5"
        }`}
        onClick={() => setMobileOpen(false)}
        aria-label={collapsed ? "Monster Pro Wash Mockup Studio" : undefined}
      >
        <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold-300 text-pine-950 shadow-sm">
          <Lightbulb className="h-5 w-5" strokeWidth={2.4} />
          <Sparkles className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-berry-500 p-0.5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-pine-200">
              Monster Pro Wash
            </div>
            <div className="mt-0.5 text-sm font-bold leading-tight text-white">
              Mockup Studio
            </div>
          </div>
        )}
      </Link>

      {showToggle && (
        <button
          type="button"
          onClick={() => setSidebarCollapsed((current) => !current)}
          className="absolute -right-3 top-8 z-10 grid h-7 w-7 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-pine-800 focus:outline-none focus:ring-2 focus:ring-gold-300 focus:ring-offset-2 focus:ring-offset-pine-950"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          aria-controls="desktop-sidebar-navigation"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-3.5 w-3.5" />
          ) : (
            <PanelLeftClose className="h-3.5 w-3.5" />
          )}
        </button>
      )}

      <nav
        id={showToggle ? "desktop-sidebar-navigation" : undefined}
        className="mt-2 flex-1 px-3"
        aria-label="Workspace"
      >
        {!collapsed && (
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-pine-300/70">
            Workspace
          </p>
        )}
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            aria-label={collapsed ? item.label : undefined}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `mb-1 flex items-center rounded-xl py-3 text-sm font-semibold transition-colors ${
                collapsed ? "justify-center px-0" : "gap-3 px-3"
              } ${
                isActive && !isGenerating
                  ? "bg-white/12 text-white"
                  : "text-pine-100/75 hover:bg-white/7 hover:text-white"
              }`
            }
          >
            <item.icon className="h-[18px] w-[18px]" />
            {!collapsed && (
              <>
                {item.label}
                <ChevronRight className="ml-auto h-4 w-4 opacity-40" />
              </>
            )}
          </NavLink>
        ))}
        {isGenerating && (
          <div
            className={`mb-1 flex items-center rounded-xl bg-white/12 py-3 text-sm font-semibold text-white ${
              collapsed ? "justify-center px-0" : "gap-3 px-3"
            }`}
            aria-label={collapsed ? "Generate mockup" : undefined}
            title={collapsed ? "Generate mockup" : undefined}
          >
            <Sparkles className="h-[18px] w-[18px]" />
            {!collapsed && "Generate mockup"}
          </div>
        )}
      </nav>

      {!collapsed && (
        <div className="m-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-pine-100">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.14)]" />
            Internal sales tool
          </div>
          <p className="mt-2 text-xs leading-relaxed text-pine-200/65">
            Create proposal-ready lighting concepts in minutes.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen">
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden bg-pine-950 transition-[width] duration-200 ease-out lg:block ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {renderSidebar(sidebarCollapsed, true)}
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
            {renderSidebar(false)}
          </aside>
        </div>
      )}

      <div
        className={`transition-[padding] duration-200 ease-out ${
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
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
