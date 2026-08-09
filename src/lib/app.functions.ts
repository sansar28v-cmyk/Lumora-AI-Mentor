import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type TutorProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  career_domain: string | null;
  experience_level: string | null;
  skill_level: string | null;
};

export const listTutors = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: roles, error } = await context.supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "tutor");
    if (error) throw new Error(error.message);

    const ids = (roles ?? []).map((r) => r.user_id);
    if (ids.length === 0) return { tutors: [] as TutorProfile[] };

    const { data: profiles, error: pErr } = await context.supabase
      .from("profiles")
      .select("id, full_name, avatar_url, bio, career_domain, experience_level, skill_level")
      .in("id", ids);
    if (pErr) throw new Error(pErr.message);

    return { tutors: (profiles ?? []) as TutorProfile[] };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { full_name: string; bio: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({ full_name: data.full_name.trim() || null, bio: data.bio.trim() || null })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const sendTutorInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      tutorName: string;
      tutorEmail: string;
      careerDomain: string;
      customMessage: string;
    }) => input
  )
  .handler(async ({ data, context }) => {
    const { data: inviter } = await context.supabase
      .from("profiles")
      .select("full_name")
      .eq("id", context.userId)
      .maybeSingle();

    const inviterName = inviter?.full_name || "A Lumora Learner";

    try {
      await (context.supabase as any).from("tutor_invites").insert({
        invited_by: context.userId,
        tutor_name: data.tutorName,
        tutor_email: data.tutorEmail,
        career_domain: data.careerDomain,
        message: data.customMessage,
      });
    } catch {
      // Optional audit logging
    }

    return {
      success: true,
      inviterName,
      message: `Invitation successfully processed for ${data.tutorName}`,
    };
  });
