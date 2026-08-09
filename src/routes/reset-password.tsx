import { LogoMark } from "@/components/Logo";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Lock, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set a new password · Lumora" },
      { name: "description", content: "Set a new password for your Lumora account." },
    ],
  }),
  component: ResetPasswordPage,
});

const passwordSchema = z.string().min(8, "At least 8 characters").max(72);

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase parses the recovery token from the URL hash and fires PASSWORD_RECOVERY.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    // If the user is already recovering, session exists.
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { passwordSchema.parse(password); }
    catch (err) { if (err instanceof z.ZodError) return toast.error(err.issues[0].message); }
    if (password !== confirm) return toast.error("Passwords don't match");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    navigate({ to: "/dashboard" as any, replace: true });
  };

  return (
    <div className="min-h-screen grid place-items-center px-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="inline-flex items-center gap-2 mb-6">
          <LogoMark className="h-8 w-8" />
          <span className="font-display font-bold tracking-[0.14em]">LUMORA</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Set a new password</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {ready ? "Choose a strong password you don't use elsewhere." : "Verifying your reset link…"}
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label="New password" value={password} onChange={setPassword} />
          <Field label="Confirm password" value={confirm} onChange={setConfirm} />
          <button
            type="submit"
            disabled={!ready || loading}
            className="w-full h-11 rounded-xl gradient-primary text-white font-medium shadow-lg shadow-primary/25 hover:opacity-95 transition inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Update password
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <div className="text-xs font-medium mb-1.5 text-muted-foreground">{label}</div>
      <div className="relative">
        <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-11 pl-10 pr-3 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary/60 transition"
        />
      </div>
    </label>
  );
}
