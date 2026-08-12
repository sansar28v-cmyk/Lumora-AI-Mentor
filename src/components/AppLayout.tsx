import { LogoMark } from "@/components/Logo";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Map, Award, ClipboardCheck, FolderKanban, Users, UserCircle,
  Sparkles, Bell, Search, Command, LogOut, Settings, ChevronRight,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "@/lib/use-onboarding";


const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Learn" },
  { to: "/roadmap", label: "AI Roadmap", icon: Map, group: "Learn" },
  { to: "/certifications", label: "Certifications", icon: Award, group: "Learn" },
  { to: "/assessments", label: "Assessments", icon: ClipboardCheck, group: "Practice" },
  { to: "/projects", label: "Project Hub", icon: FolderKanban, group: "Practice" },
  { to: "/tutors", label: "AI Tutors", icon: Users, group: "Community" },
  { to: "/profile", label: "Profile", icon: UserCircle, group: "Account" },
] as const;

export function AppLayout({ children, title }: { children: ReactNode; title?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string>("You");
  const [email, setEmail] = useState<string>("");
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const onboarding = useOnboarding();
  const readiness = Math.round(
    onboarding.profile?.readiness_score ?? onboarding.result?.percentage ?? 0,
  );


  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) return;
      setEmail(u.email ?? "");
      const meta = (u.user_metadata ?? {}) as { full_name?: string; name?: string };
      setDisplayName(meta.full_name || meta.name || u.email?.split("@")[0] || "You");
    });
  }, []);

  // ⌘K palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close popovers on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  };

  const groups = Array.from(new Set(nav.map((n) => n.group)));
  const initials = displayName.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase() || "U";
  const activeItem = nav.find((n) => n.to === pathname);

  return (
    <div className="min-h-screen flex w-full max-w-full overflow-x-hidden text-foreground">
      {/* Sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col bg-sidebar border-r border-sidebar-border z-30">
        <Link to="/dashboard" className="px-6 py-6 flex items-center gap-2.5">
          <LogoMark className="h-8 w-8" />
          <div>
            <div className="font-display font-bold tracking-[0.14em] text-[15px]">LUMORA</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Career Intelligence</div>
          </div>
        </Link>

        <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto">
          {groups.map((group) => (
            <div key={group}>
              <div className="px-3 mb-1 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{group}</div>
              <div className="space-y-1">
                {nav.filter((n) => n.group === group).map((item) => {
                  const active = pathname === item.to;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                        active
                          ? "gradient-primary text-white shadow-lg shadow-primary/25"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4">
          <div className="glass rounded-2xl p-4 relative overflow-hidden">
            <div className="text-xs text-muted-foreground">Industry Readiness</div>
            <div className="mt-1 text-2xl font-bold gradient-text">
              {onboarding.isLoading ? "—" : `${readiness}%`}
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full gradient-primary" style={{ width: `${readiness}%` }} />
            </div>
            <div className="text-[11px] text-muted-foreground mt-2">
              {readiness === 0
                ? "Complete your assessment to unlock your score."
                : readiness >= 80
                  ? "Keep going, you're almost job-ready."
                  : "Keep building — your roadmap will lift this score."}
            </div>
          </div>
        </div>

      </aside>

      {/* Main */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0 max-w-full overflow-x-hidden">
        {/* Topbar */}
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/70 border-b border-border w-full">
          <div className="flex items-center justify-between gap-2 sm:gap-3 px-4 md:px-8 h-16 max-w-full">
            {/* Mobile brand */}
            <Link to="/dashboard" className="flex md:hidden items-center gap-2 shrink-0">
              <LogoMark className="h-7 w-7" />
              <span className="font-display font-bold tracking-[0.14em] text-[13px]">LUMORA</span>
            </Link>

            {/* Breadcrumb */}
            <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground min-w-0">
              <span>LUMORA</span>
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              <span className="text-foreground font-medium truncate">{activeItem?.label ?? "Home"}</span>
            </div>

            {/* Desktop search */}
            <div className="hidden md:block flex-1 max-w-xl ml-auto min-w-0">
              <button
                onClick={() => setPaletteOpen(true)}
                className="w-full h-10 pl-9 pr-16 rounded-xl bg-muted/70 hover:bg-muted transition text-sm text-muted-foreground relative text-left truncate"
              >
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2" />
                Search skills, courses, tutors…
                <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] bg-background/70 px-1.5 py-0.5 rounded border border-border">
                  <Command className="h-3 w-3" /> K
                </span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Mobile search icon */}
              <button
                onClick={() => setPaletteOpen(true)}
                aria-label="Search"
                className="md:hidden h-9 w-9 grid place-items-center rounded-xl bg-muted/70 hover:bg-muted transition"
              >
                <Search className="h-4 w-4" />
              </button>

              <div ref={notifRef} className="relative">
                <button
                  onClick={() => setNotifOpen((v) => !v)}
                  className="h-9 w-9 md:h-10 md:w-10 grid place-items-center rounded-xl bg-muted/70 hover:bg-muted transition relative"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full gradient-primary" />
                </button>
                {notifOpen && (
                  <div className="absolute -right-11 sm:right-0 mt-2 w-[min(20rem,calc(100vw-1.5rem))] bg-card border border-border rounded-2xl p-2 shadow-2xl animate-in-up z-50">
                    <div className="px-3 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Notifications</div>
                    {[
                      { t: "New AI Roadmap step unlocked", s: "React advanced patterns", ago: "2m" },
                      { t: "Weekly assessment ready", s: "Adaptive quiz · 12 questions", ago: "1h" },
                      { t: "Tutor accepted your booking", s: "Session Fri at 4pm", ago: "yesterday" },
                    ].map((n, i) => (
                      <div key={i} className="px-3 py-2.5 rounded-xl hover:bg-muted cursor-pointer">
                        <div className="text-sm font-medium">{n.t}</div>
                        <div className="text-xs text-muted-foreground">{n.s} · {n.ago}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="h-9 w-9 md:h-10 md:w-10 rounded-xl gradient-primary flex items-center justify-center text-white font-semibold text-xs md:text-sm shadow-md shadow-primary/25"
                  aria-label="Account"
                >
                  {initials}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-[min(16rem,calc(100vw-1.5rem))] bg-card border border-border rounded-2xl p-2 shadow-2xl animate-in-up z-50">
                    <div className="px-3 py-2">
                      <div className="text-sm font-semibold truncate">{displayName}</div>
                      <div className="text-xs text-muted-foreground truncate">{email}</div>
                    </div>
                    <div className="h-px bg-border my-1" />
                    <MenuItem icon={UserCircle} label="Profile" onClick={() => { setMenuOpen(false); navigate({ to: "/profile" }); }} />
                    <MenuItem icon={Settings} label="Settings" onClick={() => { setMenuOpen(false); toast("Settings coming soon"); }} />
                    <div className="h-px bg-border my-1" />
                    <MenuItem icon={LogOut} label="Sign out" onClick={signOut} destructive />
                  </div>
                )}
              </div>
            </div>
          </div>
          {title && (
            <div className="px-4 md:px-8 pb-4">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
            </div>
          )}
        </header>

        <main className="flex-1 px-4 md:px-8 py-6 md:py-8 pb-24 md:pb-8 min-w-0">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border bg-background/90 backdrop-blur-xl">
          <div className="grid grid-cols-5">
            {nav.filter((n) => ["/dashboard", "/roadmap", "/certifications", "/assessments", "/profile"].includes(n.to)).map((item) => {
              const active = pathname === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex flex-col items-center gap-1 py-2.5 text-[10px] ${active ? "text-primary" : "text-muted-foreground"}`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="truncate max-w-full px-1">{item.label.replace("AI ", "")}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>


      {/* Command Palette */}
      {paletteOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-start pt-24 px-4" onClick={() => setPaletteOpen(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-card border border-border rounded-2xl overflow-hidden shadow-2xl animate-in-up"
          >
            <div className="flex items-center gap-2 px-4 h-12 border-b border-border">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                placeholder="Jump to a page…"
                className="flex-1 bg-transparent outline-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Escape") setPaletteOpen(false);
                }}
              />
              <kbd className="text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border">ESC</kbd>
            </div>
            <div className="p-2 max-h-80 overflow-y-auto">
              {nav.map((n) => (
                <button
                  key={n.to}
                  onClick={() => { setPaletteOpen(false); navigate({ to: n.to }); }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-muted flex items-center gap-3 text-sm"
                >
                  <n.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{n.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{n.group}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, destructive }: { icon: React.ComponentType<any>; label: string; onClick: () => void; destructive?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-muted transition ${destructive ? "text-destructive" : ""}`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
