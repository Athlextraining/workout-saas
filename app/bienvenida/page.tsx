"use client";

import { useEffect, useState, useTransition, ViewTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Reveal } from "../reveal";

type Step = {
  bg: string;
  eyebrow: string;
  title: string;
  description: string;
};

const STEPS: Step[] = [
  {
    bg: "/backsquatbackground.webp",
    eyebrow: "Metodología",
    title: "Ciencia, no azar",
    description: "Cada semana sigue periodización y progresión calculados.",
  },
  {
    bg: "/strictpressbackground.webp",
    eyebrow: "Sesiones",
    title: "60 a 90 minutos",
    description:
      "Entrenamientos densos, sin relleno. Cada ejercicio, cada rep, tiene un proposito.",
  },
  {
    bg: "/deadliftbackground.webp",
    eyebrow: "Progresion",
    title: "Cargas que escalan",
    description:
      "Empieza con lo que puedas manejar. El plan se ajusta semana a semana para que progreses lo máximo posible.",
  },
];

export default function BienvenidaPage() {
  // step 0 = celebration, 1..STEPS.length = info, STEPS.length+1 = final CTA
  const TOTAL = STEPS.length + 2;
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [, startTransition] = useTransition();

  // Preload next bg so crossfade feels instant.
  useEffect(() => {
    const next = STEPS[step];
    if (next) {
      const img = new Image();
      img.src = next.bg;
    }
    if (step === 0) {
      const img = new Image();
      img.src = "/backgroundctatraining.webp";
    }
  }, [step]);

  function goNext() {
    setDirection("forward");
    startTransition(() => setStep((s) => Math.min(s + 1, TOTAL - 1)));
  }

  function goBack() {
    setDirection("back");
    startTransition(() => setStep((s) => Math.max(s - 1, 0)));
  }

  const isWelcome = step === 0;
  const isFinal = step === TOTAL - 1;
  const infoStep = !isWelcome && !isFinal ? STEPS[step - 1] : null;

  // Background image for current step
  const currentBg = isWelcome
    ? "/backgroundhero.webp"
    : isFinal
    ? "/backgroundctatraining.webp"
    : infoStep!.bg;

  return (
    <div className="fixed inset-0 flex flex-col bg-[var(--bg-primary)] overflow-hidden">
      {/* Cinematic background */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <AnimatePresence>
          <motion.div
            key={currentBg}
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${currentBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "contrast(1.1) brightness(0.42) saturate(0.85)",
            }}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1.14 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
              scale: { duration: 8, ease: "linear" },
            }}
          />
        </AnimatePresence>

        {/* Celebration glow on welcome + final */}
        <AnimatePresence>
          {(isWelcome || isFinal) && (
            <motion.div
              key={isWelcome ? "welcome-glow" : "final-glow"}
              className="absolute inset-0 onboarding-glow-amber"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
        </AnimatePresence>

        <div className="absolute inset-0 hero-grid" />
        <div className="absolute inset-0 onboarding-vignette" />
        <div className="absolute inset-0 onboarding-fade" />
      </div>

      {/* Header */}
      <div className="px-4 pt-safe-top relative z-10">
        <div className="flex items-center justify-between h-14">
          {step > 0 && !isFinal ? (
            <button onClick={goBack} className="text-sm text-muted">
              Atras
            </button>
          ) : (
            <div />
          )}
          {!isWelcome && !isFinal && (
            <span className="text-sm text-muted">
              {step}/{STEPS.length}
            </span>
          )}
          <div className="w-10" />
        </div>
        {!isWelcome && !isFinal && (
          <div className="flex gap-2 justify-center">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step - 1
                    ? "w-8 bg-accent"
                    : i < step - 1
                    ? "w-2 bg-accent/50"
                    : "w-2 bg-white/20"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 relative z-10">
        <ViewTransition
          key={step}
          enter={direction === "forward" ? "slide-forward" : "slide-back"}
          exit={direction === "forward" ? "slide-forward" : "slide-back"}
          default="none"
        >
          <div className="w-full max-w-sm">
            {isWelcome && <StepWelcome onNext={goNext} />}
            {infoStep && <StepInfo step={infoStep} onNext={goNext} />}
            {isFinal && <StepFinal />}
          </div>
        </ViewTransition>
      </div>
    </div>
  );
}

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-7">
      <Reveal delay={0}>
        <span className="hero-eyebrow">
          <span className="hero-dot" />
          Suscripcion activa
        </span>
      </Reveal>

      <Reveal delay={0.08}>
        <h1 className="onboarding-welcome-title">
          YA ERES
          <br />
          <span className="hero-title-accent font-extrabold">ATHLEX.</span>
        </h1>
      </Reveal>

      <Reveal delay={0.18}>
        <p className="hero-sub">
          Bienvenido. En 3 pantallas te contamos <strong>como funciona</strong>{" "}
          tu programación.
        </p>
      </Reveal>

      <Reveal delay={0.28} className="w-full">
        <button onClick={onNext} className="hero-cta-primary">
          Adelante
          <Arrow />
        </button>
      </Reveal>
    </div>
  );
}

function StepInfo({ step, onNext }: { step: Step; onNext: () => void }) {
  return (
    <div className="space-y-8 text-center">
      <Reveal delay={0.05}>
        <span className="hero-eyebrow">
          <span className="hero-dot" />
          {step.eyebrow}
        </span>
      </Reveal>

      <Reveal delay={0.15}>
        <h2 className="onboarding-welcome-title">{step.title}</h2>
      </Reveal>

      <Reveal delay={0.25}>
        <p className="hero-sub mx-auto">{step.description}</p>
      </Reveal>

      <Reveal delay={0.35}>
        <button
          onClick={onNext}
          className="w-full py-3.5 rounded-xl text-base font-semibold btn-gradient"
        >
          Siguiente
        </button>
      </Reveal>
    </div>
  );
}

function StepFinal() {
  return (
    <div className="flex flex-col items-center text-center gap-7">
      <Reveal delay={0}>
        <span className="hero-eyebrow">
          <span className="hero-dot" />
          Todo listo
        </span>
      </Reveal>

      <Reveal delay={0.08}>
        <h1 className="onboarding-welcome-title">
          TU PLAN
          <br />
          <span className="hero-title-accent font-extrabold">TE ESPERA.</span>
        </h1>
      </Reveal>

      <Reveal delay={0.18}>
        <p className="hero-sub">
          Cada <strong>lunes</strong> se desbloquea la siguiente semana.
        </p>
      </Reveal>

      <Reveal delay={0.28} className="w-full">
        <a href="/entrenamiento" className="hero-cta-primary">
          VER MI ENTRENAMIENTO
          <Arrow />
        </a>
      </Reveal>
    </div>
  );
}

function Arrow() {
  return (
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
  );
}
