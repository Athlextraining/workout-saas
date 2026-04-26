"use client";

import { useState, useEffect } from "react";
import CookieConsent, { getCookieConsentValue } from "react-cookie-consent";
import { GoogleAnalytics } from "@next/third-parties/google";
import { useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/routing";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
export const CONSENT_COOKIE = "athlex_analytics_consent";

export function CookieBanner() {
  const t = useTranslations("cookies.banner");
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    setConsented(getCookieConsentValue(CONSENT_COOKIE) === "true");
  }, []);

  return (
    <>
      {GA_ID && consented && <GoogleAnalytics gaId={GA_ID} />}
      <CookieConsent
        cookieName={CONSENT_COOKIE}
        cookieValue="true"
        enableDeclineButton
        buttonText={t("accept")}
        declineButtonText={t("decline")}
        onAccept={() => setConsented(true)}
        onDecline={() => setConsented(false)}
        disableStyles
        containerClasses="cookie-banner"
        contentClasses="cookie-banner__content"
        buttonWrapperClasses="cookie-banner__actions"
        buttonClasses="cookie-banner__btn cookie-banner__btn--accept"
        declineButtonClasses="cookie-banner__btn cookie-banner__btn--decline"
      >
        <span>
          {t("message")}{" "}
          <Link href="/cookies" className="underline opacity-70 hover:opacity-100">
            {t("learnMore")}
          </Link>
        </span>
      </CookieConsent>
    </>
  );
}
