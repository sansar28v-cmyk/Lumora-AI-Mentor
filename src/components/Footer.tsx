import { Link } from "@tanstack/react-router";
import { Github, Linkedin, Instagram } from "lucide-react";
import { LogoMark } from "@/components/Logo";

const socials = [
  { label: "GitHub", href: "https://github.com/sansar28v-cmyk", icon: Github },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/sandeep-v-5b7351375", icon: Linkedin },
  { label: "Instagram", href: "https://www.instagram.com/peace._.ig?igsh=bTM5dHRqbXBkY3Fi", icon: Instagram },
];

const columns: { title: string; links: { label: string; to?: string; href?: string }[] }[] = [
  {
    title: "Platform",
    links: [
      { label: "Dashboard", to: "/dashboard" },
      { label: "AI Roadmap", to: "/roadmap" },
      { label: "Certifications", to: "/certifications" },
      { label: "Assessments", to: "/assessments" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Project Hub", to: "/projects" },
      { label: "AI Tutors", to: "/tutors" },
      { label: "Profile", to: "/profile" },
      { label: "Get started", to: "/auth" },
    ],
  },
];

export function Footer({ compact = false }: { compact?: boolean }) {
  const year = new Date().getFullYear();

  if (compact) {
    return (
      <footer className="mt-10 border-t border-border/70 pt-5">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-xs text-muted-foreground">
            © {year} Lumora · All rights reserved by <span className="font-medium text-foreground">Sandeep V</span>
          </p>
          <div className="flex items-center gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={s.label}
                className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                <s.icon className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-border/70 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <LogoMark className="h-6 w-6 shrink-0" />
              <span className="font-display text-base font-bold tracking-[0.14em]">LUMORA</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              AI career intelligence — personalized roadmaps, adaptive assessments, real certifications and human tutors
              in one calm workspace.
            </p>
            <div className="mt-5 flex items-center gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={s.label}
                  className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:text-foreground"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title} className="min-w-0">
              <div className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                {col.title}
              </div>
              <ul className="mt-4 space-y-2.5 text-sm">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={(l.to ?? "/") as string}
                      className="text-foreground/80 transition-colors hover:text-primary"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="min-w-0">
            <div className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Start today
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Build your 12-week plan in under 5 minutes. Free to start.
            </p>
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform hover:-translate-y-px"
            >
              Create free account
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 border-t border-border/70 pt-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-xs text-muted-foreground">
            © {year} Lumora · All rights reserved by <span className="font-medium text-foreground">Sandeep V</span>
          </p>
          <p className="text-xs text-muted-foreground">Crafted with care · Privacy · Terms</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
