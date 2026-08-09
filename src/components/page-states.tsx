import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function PageLoader() {
  return (
    <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card p-10 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      <div className="mt-6 flex justify-center">
        {action ?? (
          <Button asChild className="rounded-xl">
            <Link to="/onboarding">Complete your assessment</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8">
      {eyebrow && (
        <div className="text-xs uppercase tracking-widest text-primary">{eyebrow}</div>
      )}
      <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
      {description && <p className="mt-2 text-sm text-muted-foreground max-w-2xl">{description}</p>}
    </div>
  );
}
