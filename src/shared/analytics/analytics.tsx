import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { GoogleAnalytics, sendGAEvent } from "@next/third-parties/google";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export function Analytics() {
  return (
    <>
      <VercelAnalytics />
      {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
    </>
  );
}

export function trackEvent(
  name: string,
  params: Record<string, string | number> = {},
) {
  sendGAEvent("event", name, params);
}
