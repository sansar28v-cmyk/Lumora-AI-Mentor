import type { ReactNode } from "react";

export function GlassCard({
  children,
  className = "",
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`glass rounded-2xl p-6 relative overflow-hidden transition-all hover:border-white/15 ${
        glow ? "glow" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = "primary",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  accent?: "primary" | "cyan" | "purple";
}) {
  const grads: Record<string, string> = {
    primary: "from-brand-blue/30 to-brand-purple/20",
    cyan: "from-brand-cyan/30 to-brand-blue/20",
    purple: "from-brand-purple/30 to-brand-blue/20",
  };
  return (
    <GlassCard className="group">
      <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br ${grads[accent]} blur-2xl opacity-60`} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
          <div className="mt-2 text-3xl font-bold tracking-tight">{value}</div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        {icon && (
          <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary-foreground">
            {icon}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

export function CircularProgress({
  value,
  size = 120,
  stroke = 10,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;
  const id = `grad-${label ?? Math.random().toString(36).slice(2)}`;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.82 0.14 200)" />
            <stop offset="50%" stopColor="oklch(0.68 0.19 265)" />
            <stop offset="100%" stopColor="oklch(0.65 0.24 300)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="oklch(1 0 0 / 0.08)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 800ms ease" }}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          transform={`rotate(90 ${size / 2} ${size / 2})`}
          className="fill-foreground text-xl font-bold"
        >
          {value}%
        </text>
      </svg>
      {label && <div className="text-xs text-muted-foreground">{label}</div>}
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <div>
        <h2 className="text-lg md:text-xl font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
