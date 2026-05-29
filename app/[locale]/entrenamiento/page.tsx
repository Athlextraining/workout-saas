import type { Metadata } from 'next'
import { getTranslations, getLocale } from 'next-intl/server'
import { Link } from "@/shared/i18n/routing";
import { getCurrentUser } from "@/modules/identity/application/get-current-user";
import { getCurrentProfile } from "@/modules/identity/application/get-current-profile";
import { isUserSubscribed } from "@/modules/billing/application/get-subscription-status";
import { getWeekWorkout } from "@/modules/training/application/get-week-workout";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};
import {
  isFreeWeek as isFreeCycleWeek,
  getCyclePhase,
} from "@/modules/training/domain/cycle";
import type { WeekContent } from "@/modules/training/domain/workout";
import { Reveal } from "../reveal";
import { SubscribeButton } from "./subscribe-button";
import { WeekView } from "./week-view";
import { AdminWeekBadge } from "./admin-week-badge";
import { WorkoutTimer } from "@/modules/training/ui/workout-timer";

const DAY_KEYS: (keyof WeekContent)[] = [
  "domingo",
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
];

export default async function EntrenamientoPage({
  searchParams,
}: {
  searchParams?: Promise<{ week?: string }>
}) {
  const user = await getCurrentUser();
  const locale = await getLocale();
  const t = await getTranslations('entrenamiento');

  // Not registered: CTA to sign up
  if (!user) {
    return (
      <section className="train-cta-shell">
        <div className="train-cta-bg" aria-hidden="true">
          <div className="train-cta-image" />
          <div className="train-cta-vignette" />
          <div className="train-cta-grain" />
          <div className="train-cta-fade" />
        </div>

        <div className="train-cta-content">
          <span className="hero-eyebrow">
            <span className="hero-dot" />
            {t('ctaUnregistered.eyebrow')}
          </span>

          <Reveal delay={0.1}>
            <h1 className="train-cta-title">
              {t('ctaUnregistered.title')}
              <br />
              <span className="train-cta-title-accent font-extrabold">
                {t('ctaUnregistered.title').split('\n')[2]}
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="train-cta-sub">
              {t('ctaUnregistered.subtitle')}
            </p>
          </Reveal>

          <Reveal delay={0.3} className="w-full">
            <Link href="/login" className="hero-cta-primary">
              {t('ctaUnregistered.button')}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M5 12h14M13 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </Reveal>

          <Reveal delay={0.4}>
            <p className="train-cta-fineprint">{t('ctaUnregistered.fineprint')}</p>
          </Reveal>
        </div>
      </section>
    );
  }

  const resolvedParams = await searchParams;
  const profile = await getCurrentProfile();
  const isAdmin = profile?.is_admin ?? false;
  const adminWeekOverride = isAdmin && resolvedParams?.week
    ? parseInt(resolvedParams.week)
    : undefined;

  const [subscribed, workout] = await Promise.all([
    isUserSubscribed(user.id),
    getWeekWorkout(locale as 'es' | 'en', adminWeekOverride),
  ]);

  if (!workout) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
        <div className="glass rounded-xl p-6 text-center">
          <p className="text-muted">
            {t('subtitle')}
          </p>
        </div>
      </div>
    );
  }

  const cycleNumber = workout.cycle_number;
  const weekNumber = workout.week_number;

  const isBlocked =
    !subscribed && !isFreeCycleWeek({ cycleNumber, weekNumber });

  // Blocked: paywall for week 2+ without subscription
  if (isBlocked) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4">
        <div className="glass rounded-xl p-8 text-center space-y-6">
          <div className="text-5xl">🔒</div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{t('paywall.title')}</h1>
            <p className="text-muted text-sm">
              {t('paywall.subtitle')}
            </p>
          </div>
          <SubscribeButton
            className="block w-full py-3.5 rounded-xl text-base font-semibold btn-gradient"
            label={t('paywall.button')}
          />
        </div>
      </div>
    );
  }

  const phase = getCyclePhase(weekNumber);
  const todayKey = DAY_KEYS[new Date().getDay()];
  const maxes = {
    strictPress: profile?.rm_strict_press ?? null,
    backSquat: profile?.rm_back_squat ?? null,
    deadlift: profile?.rm_deadlift ?? null,
  };

  return (
    <div className="train-page">
      <header className="train-header">
        <div className="train-header-bg" aria-hidden="true">
          <div className="hero-grid" />
          <div className="train-header-fade" />
        </div>
        <div className="train-header-content">
          <div className="train-header-row">
            {isAdmin ? (
              <AdminWeekBadge
                categoryLabel={profile?.category === "athx_pro" ? "ATHX PRO" : "ATHX"}
                weekNumber={weekNumber}
                phaseLabel={t('week.phase')}
              />
            ) : (
              <span
                className={`badge badge--pill badge--glass phase-${phase.code.toLowerCase()}`}
              >
                <span className="badge-dot phase-chip-dot" />
                {profile?.category === "athx_pro" ? "ATHX PRO" : "ATHX"} · {t('week.phase')}{" "}
                {weekNumber}
              </span>
            )}
            <WorkoutTimer compact />
          </div>
        </div>
      </header>

      <div className="w-full max-w-md mx-auto px-6 pb-12 -mt-6 relative z-10">
        <WeekView
          content={workout.content}
          todayKey={todayKey}
          cycleNumber={cycleNumber}
          weekNumber={weekNumber}
          maxes={maxes}
        />
        {!subscribed && (
          <div className="mt-6 glass rounded-xl p-5 text-center space-y-3">
            <p className="text-sm text-muted">{t('paywall.subtitle')}</p>
            <SubscribeButton
              className="block w-full py-3.5 rounded-xl text-base font-semibold btn-gradient"
              label={t('paywall.button')}
            />
          </div>
        )}
      </div>
    </div>
  );
}
