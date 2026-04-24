import { useIsMobile } from "@/hooks/use-mobile";
import { MatchTimeline } from "./MatchTimeline";
import { HorizontalMatchTimeline } from "./HorizontalMatchTimeline";
import type { Tables } from "@/integrations/supabase/types";

interface ResponsiveMatchTimelineProps {
  events: Tables<"match_events">[];
  homeTeam: string;
  totalMinutes?: number;
}

/**
 * Renders the vertical timeline on mobile (<768px) and the horizontal,
 * icon-only timeline (with click-to-reveal popovers) on tablet/desktop.
 */
export function ResponsiveMatchTimeline({
  events,
  homeTeam,
  totalMinutes,
}: ResponsiveMatchTimelineProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MatchTimeline events={events} homeTeam={homeTeam} />;
  }

  return (
    <HorizontalMatchTimeline
      events={events}
      homeTeam={homeTeam}
      totalMinutes={totalMinutes}
    />
  );
}
