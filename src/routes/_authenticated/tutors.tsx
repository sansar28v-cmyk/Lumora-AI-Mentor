import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Check, Copy, GraduationCap, Loader2, Mail, Send, Sparkles, UserPlus
} from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { EmptyState, PageIntro, PageLoader } from "@/components/page-states";
import { listTutors, sendTutorInvite } from "@/lib/app.functions";
import { useOnboarding } from "@/lib/use-onboarding";
import { CAREER_DOMAINS, domainById } from "@/lib/domains";

export const Route = createFileRoute("/_authenticated/tutors")({
  head: () => ({
    meta: [
      { title: "Tutor Connect · Lumora" },
      { name: "description", content: "Browse real Lumora tutors and invite verified industry mentors to your learning track." },
      { property: "og:title", content: "Tutor Connect · Lumora" },
      { property: "og:description", content: "Connect with tutors and invite mentors to guide your career roadmap." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Tutors,
});

function Tutors() {
  const { profile } = useOnboarding();
  const fetchTutors = useServerFn(listTutors);
  const { data, isLoading } = useQuery({ queryKey: ["tutors"], queryFn: () => fetchTutors({}) });
  const [inviteOpen, setInviteOpen] = useState(false);

  if (isLoading)
    return (
      <AppLayout title="Tutor Connect">
        <PageLoader />
      </AppLayout>
    );

  const tutors = data?.tutors ?? [];
  const domain = domainById(profile?.career_domain);
  const matched = tutors.filter((t) => t.career_domain && t.career_domain === profile?.career_domain);
  const others = tutors.filter((t) => !matched.includes(t));

  return (
    <AppLayout title="Tutor Connect">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
        <PageIntro
          eyebrow={domain?.name ?? "Your Track"}
          title="Tutors on Lumora"
          description={
            tutors.length
              ? `${tutors.length} registered tutors — ${matched.length} teach ${domain?.name ?? "your domain"}.`
              : "Lumora connects you with verified industry tutors and mentors."
          }
        />
        <div className="shrink-0">
          <InviteTutorModal
            open={inviteOpen}
            onOpenChange={setInviteOpen}
            userDomain={profile?.career_domain ?? "full-stack"}
            userName={profile?.full_name ?? "A Lumora Student"}
          />
        </div>
      </div>

      {tutors.length === 0 ? (
        <EmptyState
          title="No tutors registered in your track yet"
          description="Lumora lists real mentors who have joined as tutors. Invite a professor, colleague, or mentor to join Lumora and they will show up here instantly."
          action={
            <Button className="rounded-xl gap-2 gradient-primary text-white shadow-md shadow-primary/20" onClick={() => setInviteOpen(true)}>
              <UserPlus className="h-4 w-4" /> Send Professional Invitation
            </Button>
          }
        />
      ) : (
        <div className="space-y-10 mt-6">
          {matched.length > 0 && <TutorGrid title={`Matched to ${domain?.name ?? "your domain"}`} tutors={matched} />}
          {others.length > 0 && <TutorGrid title="All Tutors" tutors={others} />}
        </div>
      )}
    </AppLayout>
  );
}

function InviteTutorModal({
  open,
  onOpenChange,
  userDomain,
  userName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userDomain: string;
  userName: string;
}) {
  const queryClient = useQueryClient();
  const sendInviteFn = useServerFn(sendTutorInvite);

  const [tutorName, setTutorName] = useState("");
  const [tutorEmail, setTutorEmail] = useState("");
  const [careerDomain, setCareerDomain] = useState(userDomain || "full-stack");
  const [customMessage, setCustomMessage] = useState(
    `I'm using Lumora to accelerate my learning. I would love for you to join Lumora as a registered mentor and tutor to guide my roadmap and review my progress.`
  );
  const [copied, setCopied] = useState(false);

  const selectedDomain = domainById(careerDomain);
  const inviteUrl = typeof window !== "undefined"
    ? `${window.location.origin}/auth?mode=signup&role=tutor&domain=${encodeURIComponent(careerDomain)}`
    : `https://lumora.app/auth?mode=signup&role=tutor&domain=${encodeURIComponent(careerDomain)}`;

  const emailSubject = `Invitation: Join Lumora as a Tutor & Mentor for ${userName}`;

  const fullEmailBody = `Dear ${tutorName || "Mentor"},\n\n` +
    `${userName} has invited you to join Lumora as a Tutor & Mentor in ${selectedDomain?.name ?? "Tech"}.\n\n` +
    `Note from ${userName}:\n"${customMessage}"\n\n` +
    `As a Lumora tutor, you can:\n` +
    `- Guide personalized AI learning roadmaps\n` +
    `- Review real project submissions\n` +
    `- Host 1-on-1 mentoring sessions\n\n` +
    `Accept your invitation & create your tutor account here:\n` +
    `${inviteUrl}\n\n` +
    `Best regards,\n` +
    `The Lumora Team`;

  const mailtoUrl = `mailto:${encodeURIComponent(tutorEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(fullEmailBody)}`;

  const mutation = useMutation({
    mutationFn: () =>
      sendInviteFn({
        data: {
          tutorName: tutorName.trim() || "Mentor",
          tutorEmail: tutorEmail.trim(),
          careerDomain,
          customMessage: customMessage.trim(),
        },
      }),
    onSuccess: (res) => {
      toast.success(res.message || "Invitation created!");
      window.open(mailtoUrl, "_blank");
      queryClient.invalidateQueries({ queryKey: ["tutors"] });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast.success("Tutor invitation link copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorEmail || !tutorEmail.includes("@")) {
      return toast.error("Please enter a valid tutor email address");
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="rounded-xl gap-2 gradient-primary text-white shadow-md shadow-primary/20 cursor-pointer">
          <UserPlus className="h-4 w-4" /> Invite a Tutor
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl rounded-2xl p-6 overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <Badge variant="outline">Tutor Referral Program</Badge>
          </div>
          <DialogTitle className="text-xl font-bold">Invite a Mentor to Lumora</DialogTitle>
          <DialogDescription>
            Send an invitation to your professor, colleague, or industry mentor to join Lumora.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSendInvite} className="space-y-4 mt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/80" htmlFor="tutor-name">
                Tutor's Full Name
              </label>
              <Input
                id="tutor-name"
                value={tutorName}
                onChange={(e) => setTutorName(e.target.value)}
                placeholder="e.g. Dr. Sarah Jenkins"
                className="rounded-xl text-sm"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/80" htmlFor="tutor-email">
                Tutor's Email Address <span className="text-destructive">*</span>
              </label>
              <Input
                id="tutor-email"
                type="email"
                value={tutorEmail}
                onChange={(e) => setTutorEmail(e.target.value)}
                placeholder="e.g. sarah.jenkins@university.edu"
                className="rounded-xl text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground/80">
              Specialization Track
            </label>
            <Select value={careerDomain} onValueChange={setCareerDomain}>
              <SelectTrigger className="h-10 rounded-xl bg-background border-input text-sm focus:ring-2 focus:ring-primary/20">
                <SelectValue placeholder="Select a domain track..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-border bg-popover/95 backdrop-blur-xl shadow-2xl max-h-64 z-[100]">
                {CAREER_DOMAINS.map((d) => (
                  <SelectItem key={d.id} value={d.id} className="rounded-lg cursor-pointer py-2 text-xs sm:text-sm focus:bg-primary/10 focus:text-primary">
                    <div className="flex items-center justify-between gap-3 w-full">
                      <span className="font-medium">{d.name}</span>
                      <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border/60 font-mono">{d.time}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground/80" htmlFor="message">
              Personalized Note
            </label>
            <Textarea
              id="message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
              className="rounded-xl text-sm"
              placeholder="Add a personal message to your tutor..."
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyLink}
              className="w-full sm:w-auto rounded-xl gap-2 text-xs"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied Link!" : "Copy Invite Link"}
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full sm:w-auto rounded-xl gap-2 gradient-primary text-white text-xs font-medium shadow-md shadow-primary/20"
              >
                {mutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Send Email Invitation
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TutorGrid({
  title,
  tutors,
}: {
  title: string;
  tutors: { id: string; full_name: string | null; bio: string | null; career_domain: string | null; skill_level: string | null; experience_level: string | null }[];
}) {
  return (
    <section>
      <h2 className="mb-4 font-semibold text-base">{title}</h2>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {tutors.map((t) => {
          const name = t.full_name ?? "Lumora tutor";
          const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
          return (
            <div key={t.id} className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 font-semibold text-primary text-base">
                  {initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-foreground">{name}</div>
                  <div className="text-xs text-muted-foreground font-medium">
                    {domainById(t.career_domain)?.name ?? "Domain not set"}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                {t.bio ?? "Verified Lumora tutor ready to guide your career roadmap and conduct code reviews."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {t.experience_level && <Badge variant="secondary" className="capitalize text-[11px]">{t.experience_level}</Badge>}
                {t.skill_level && <Badge variant="outline" className="text-[11px]">{t.skill_level}</Badge>}
              </div>
              <Button variant="outline" className="mt-5 w-full rounded-xl gap-2 text-xs font-medium" asChild>
                <a href={`mailto:?subject=Mentoring%20session%20request%20via%20Lumora`}>
                  <Mail className="h-4 w-4" /> Request a Session
                </a>
              </Button>
            </div>
          );
        })}
      </div>
      {tutors.length === 0 && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <GraduationCap className="h-4 w-4" /> No tutors here yet.
        </p>
      )}
    </section>
  );
}
