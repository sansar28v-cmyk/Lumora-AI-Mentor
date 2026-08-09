import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function SelectCard({
  selected,
  onSelect,
  icon,
  title,
  description,
  meta,
}: {
  selected: boolean;
  onSelect: () => void;
  icon?: ReactNode;
  title: string;
  description?: string;
  meta?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group relative text-left rounded-2xl border bg-card p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
        selected ? "border-primary ring-2 ring-primary/25 shadow-lg" : "border-border hover:border-primary/40",
      )}
    >
      {selected && (
        <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-3.5 w-3.5" />
        </span>
      )}
      {icon && (
        <span
          className={cn(
            "mb-4 flex h-11 w-11 items-center justify-center rounded-xl border transition-colors",
            selected ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-foreground/80 border-transparent",
          )}
        >
          {icon}
        </span>
      )}
      <div className="font-semibold tracking-tight pr-7">{title}</div>
      {description && <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{description}</p>}
      {meta && <div className="mt-3 text-xs font-medium text-primary">{meta}</div>}
    </button>
  );
}
