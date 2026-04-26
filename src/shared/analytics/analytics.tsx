import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { sendGAEvent } from "@next/third-parties/google";

export function Analytics() {
  return <VercelAnalytics />;
}

export function trackEvent(
  name: string,
  params: Record<string, string | number> = {},
) {
  sendGAEvent("event", name, params);
}
