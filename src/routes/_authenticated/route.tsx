import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location, context }) => {
    // Always get fresh session to avoid stale cache bouncing logged-in users back to /auth
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user ?? null;

    if (!user) {
      context.queryClient.setQueryData(["auth-gate"], { user: null, onboarded: false });
      throw redirect({ to: "/auth", search: { redirect: location.href } });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    const onboarded = !!profile?.onboarding_completed;
    context.queryClient.setQueryData(["auth-gate"], { user, onboarded });

    if (!onboarded) {
      throw redirect({ to: "/onboarding" });
    }
    return { user };
  },

  component: () => <Outlet />,
});
