import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getOnboarding } from "./onboarding.functions";

export function useOnboarding() {
  const fetchOnboarding = useServerFn(getOnboarding);
  const query = useQuery({
    queryKey: ["onboarding"],
    queryFn: () => fetchOnboarding({}),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  return {
    isLoading: query.isLoading,
    profile: query.data?.profile ?? null,
    result: query.data?.result ?? null,
  };
}
