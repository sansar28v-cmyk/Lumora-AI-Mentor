import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-6 w-6 text-primary", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.2" />
      <path d="M8.4 15.6 L15.6 8.4" />
      <path d="M15.6 8.4 L15.6 12.6" />
      <path d="M15.6 8.4 L11.4 8.4" />
    </svg>
  );
}

export function Logo({
  className,
  markClassName,
  wordClassName,
  showWord = true,
}: {
  className?: string;
  markClassName?: string;
  wordClassName?: string;
  showWord?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={markClassName} />
      {showWord && (
        <span className={cn("font-display text-lg font-bold tracking-[0.14em]", wordClassName)}>
          LUMORA
        </span>
      )}
    </span>
  );
}
