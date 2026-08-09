import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let handled = false;

    const processSession = async (user: any) => {
      if (handled || !user) return;
      handled = true;

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.onboarding_completed) {
          navigate({ to: "/dashboard", replace: true });
        } else {
          navigate({ to: "/onboarding", replace: true });
        }
      } catch (e) {
        navigate({ to: "/onboarding", replace: true });
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        processSession(data.session.user);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED")) {
        processSession(session.user);
      }
    });

    const timeout = setTimeout(() => {
      if (!handled) {
        setErrorMsg("Sign in timed out. Redirecting back...");
        setTimeout(() => navigate({ to: "/auth", replace: true }), 1500);
      }
    }, 10000);

    return () => {
      clearTimeout(timeout);
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        <h2 className="mt-4 text-xl font-semibold">Completing sign in...</h2>
        {errorMsg && <p className="mt-2 text-sm text-destructive">{errorMsg}</p>}
      </div>
    </div>
  );
}
