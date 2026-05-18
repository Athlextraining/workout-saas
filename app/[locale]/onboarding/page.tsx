"use client";

import {
  useState,
  useRef,
  useEffect,
  useTransition,
  ViewTransition,
} from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "@/shared/i18n/routing";
import { saveBasicInfo } from "@/modules/onboarding/application/save-basic-info";
import { saveCategory } from "@/modules/onboarding/application/save-category";
import { saveFitnessData } from "@/modules/onboarding/application/save-fitness-data";
import { completeOnboarding } from "@/modules/onboarding/application/complete-onboarding";
import { updateAvatar } from "@/modules/identity/application/update-avatar";
import { createSupabaseBrowserClient } from "@/shared/infra/supabase/client";
import { Reveal } from "../reveal";

const STEP_BACKGROUNDS: Record<number, string> = {
  1: "/nombrebackground.webp",
  2: "/edadbackground.webp",
  3: "/pesobackground.webp",
};

type RMField = "strictPress" | "backSquat" | "deadlift";

const RM_BACKGROUNDS: Record<RMField, string> = {
  strictPress: "/strictpressbackground.webp",
  backSquat: "/backsquatbackground.webp",
  deadlift: "/deadliftbackground.webp",
};

const TOTAL_STEPS = 9;

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i === current
              ? "w-8 bg-accent"
              : i < current
                ? "w-2 bg-accent/50"
                : "w-2 bg-white/20"
          }`}
        />
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const t = useTranslations("onboarding");
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeRMField, setActiveRMField] = useState<RMField | null>(null);

  // Preload upcoming images so the crossfade has them in cache.
  useEffect(() => {
    const next = STEP_BACKGROUNDS[step + 1];
    if (next) {
      const img = new Image();
      img.src = next;
    }
    if (step === 5) {
      // Entering step 6 next: warm all 3 movement images.
      Object.values(RM_BACKGROUNDS).forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    }
  }, [step]);

  const [data, setData] = useState({
    fullName: "",
    age: "",
    weight: "",
    sex: "",
    category: "",
    rmStrictPress: "",
    rmBackSquat: "",
    rmDeadlift: "",
  });

  function goNext() {
    setError(null);
    setDirection("forward");
    setActiveRMField(null);
    startTransition(() => {
      setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
    });
  }

  function goBack() {
    setError(null);
    setDirection("back");
    setActiveRMField(null);
    startTransition(() => {
      setStep((s) => Math.max(s - 1, 0));
    });
  }

  function updateField(field: string, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSaveAndContinue() {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("fullName", data.fullName);
    formData.set("age", data.age);
    formData.set("weight", data.weight);
    formData.set("sex", data.sex);

    const result = await saveBasicInfo(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setLoading(false);
    goNext();
  }

  async function handleSaveCategory() {
    setLoading(true);
    setError(null);

    const result = await saveCategory(data.category);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setLoading(false);
    goNext();
  }

  async function handleSaveFitness() {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("rmStrictPress", data.rmStrictPress);
    formData.set("rmBackSquat", data.rmBackSquat);
    formData.set("rmDeadlift", data.rmDeadlift);

    const result = await saveFitnessData(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setLoading(false);
    goNext();
  }

  async function handleSubscribe(t: any) {
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.dispatchEvent(new Event("nav-progress:start"));
        window.location.href = data.url;
      } else {
        console.error("Checkout error:", data.error);
        alert(data.error || t("errors.checkoutError"));
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert(t("errors.connectionError"));
    }
  }

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return data.fullName.trim().length > 0;
      case 2:
        return (
          data.age !== "" &&
          parseInt(data.age) >= 14 &&
          parseInt(data.age) <= 100
        );
      case 3:
        return (
          data.weight !== "" &&
          parseFloat(data.weight) >= 30 &&
          parseFloat(data.weight) <= 300
        );
      case 4:
        return data.sex !== "";
      case 5:
        return data.category !== "";
      default:
        return true;
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[var(--bg-primary)] overflow-hidden">
      {/* Cinematic background per step */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <AnimatePresence>
          {STEP_BACKGROUNDS[step] && (
            <motion.div
              key={step}
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${STEP_BACKGROUNDS[step]})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "contrast(1.1) brightness(0.45) saturate(0.85)",
              }}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1.14 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
                scale: { duration: 8, ease: "linear" },
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {step === 4 && (
            <motion.div
              key="sex-bg"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="absolute inset-0 hero-grid" />
              <motion.div
                className="absolute inset-0 onboarding-glow-blue"
                animate={{ opacity: data.sex === "male" ? 1 : 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.div
                className="absolute inset-0 onboarding-glow-pink"
                animate={{ opacity: data.sex === "female" ? 1 : 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {step === 6 && (
            <motion.div
              key="rm-bg"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="absolute inset-0 hero-grid" />
              <AnimatePresence>
                {activeRMField && (
                  <motion.div
                    key={activeRMField}
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${RM_BACKGROUNDS[activeRMField]})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      filter: "contrast(1.1) brightness(0.4) saturate(0.85)",
                    }}
                    initial={{ opacity: 0, scale: 1.06 }}
                    animate={{ opacity: 1, scale: 1.12 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      opacity: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                      scale: { duration: 8, ease: "linear" },
                    }}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {step === 7 && (
            <motion.div
              key="avatar-bg"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="absolute inset-0 hero-grid" />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {step === 5 && (
            <motion.div
              key="category-bg"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="absolute inset-0 hero-grid" />
              <motion.div
                className="absolute inset-0 onboarding-glow-green"
                animate={{ opacity: data.category === "athx" ? 1 : 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.div
                className="absolute inset-0 onboarding-glow-amber"
                animate={{ opacity: data.category === "athx_pro" ? 1 : 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute inset-0 onboarding-vignette" />
        <div className="absolute inset-0 onboarding-fade" />
      </div>

      {/* Header */}
      <div
        className="px-4 pt-safe-top relative z-10"
        style={{ viewTransitionName: "onboarding-header" }}
      >
        <div className="flex items-center justify-between h-14">
          {step > 0 && step < TOTAL_STEPS - 1 ? (
            <button onClick={goBack} className="text-sm text-muted">
              {t("header.back")}
            </button>
          ) : (
            <div />
          )}
          {step > 0 && step < TOTAL_STEPS - 1 && (
            <span className="text-sm text-muted">
              {t("header.progress", { step, total: TOTAL_STEPS - 2 })}
            </span>
          )}
        </div>
        {step > 0 && step < TOTAL_STEPS - 1 && (
          <ProgressDots current={step - 1} total={TOTAL_STEPS - 2} />
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
            {step === 0 && <StepWelcome onNext={goNext} t={t} />}
            {step === 1 && (
              <StepInput
                label={t("steps.basicInfo.nameLabel")}
                subtitle={t("steps.basicInfo.nameSubtitle")}
                type="text"
                placeholder={t("steps.basicInfo.namePlaceholder")}
                value={data.fullName}
                onChange={(v) => updateField("fullName", v)}
                onNext={goNext}
                canProceed={canProceed()}
                t={t}
              />
            )}
            {step === 2 && (
              <StepInput
                label={t("steps.basicInfo.ageLabel")}
                subtitle={t("steps.basicInfo.ageSubtitle")}
                type="number"
                placeholder={t("steps.basicInfo.agePlaceholder")}
                value={data.age}
                onChange={(v) => updateField("age", v)}
                onNext={goNext}
                canProceed={canProceed()}
                min={14}
                max={100}
                t={t}
              />
            )}
            {step === 3 && (
              <StepInput
                label={t("steps.basicInfo.weightLabel")}
                subtitle={t("steps.basicInfo.weightSubtitle")}
                type="number"
                placeholder={t("steps.basicInfo.weightPlaceholder")}
                value={data.weight}
                onChange={(v) => updateField("weight", v)}
                onNext={goNext}
                canProceed={canProceed()}
                min={30}
                max={300}
                step={0.1}
                suffix={t("steps.basicInfo.weightSuffix")}
                t={t}
              />
            )}
            {step === 4 && (
              <StepSex
                value={data.sex}
                onChange={(v) => updateField("sex", v)}
                onNext={handleSaveAndContinue}
                canProceed={canProceed()}
                loading={loading}
                error={error}
                t={t}
              />
            )}
            {step === 5 && (
              <StepCategory
                value={data.category}
                onChange={(v) => updateField("category", v)}
                onNext={handleSaveCategory}
                canProceed={canProceed()}
                loading={loading}
                error={error}
                t={t}
              />
            )}
            {step === 6 && (
              <StepRM
                values={{
                  strictPress: data.rmStrictPress,
                  backSquat: data.rmBackSquat,
                  deadlift: data.rmDeadlift,
                }}
                onChange={(field, v) => {
                  const map: Record<string, string> = {
                    strictPress: "rmStrictPress",
                    backSquat: "rmBackSquat",
                    deadlift: "rmDeadlift",
                  };
                  updateField(map[field], v);
                }}
                onFieldFocus={setActiveRMField}
                onNext={handleSaveFitness}
                onSkip={handleSaveFitness}
                loading={loading}
                t={t}
              />
            )}
            {step === 7 && <StepAvatar onNext={goNext} onSkip={goNext} t={t} />}
            {step === 8 && (
              <StepPayment
                onSubscribe={() => handleSubscribe(t)}
                t={t}
              />
            )}
          </div>
        </ViewTransition>
      </div>
    </div>
  );
}

function StepWelcome({ onNext, t }: { onNext: () => void; t: any }) {
  return (
    <div className="flex flex-col items-center text-center gap-7">
      <span className="hero-eyebrow">
        <span className="hero-dot" />
        ATHLEX training
      </span>

      <Reveal delay={0.05}>
        <h1 className="onboarding-welcome-title">
          {t("steps.welcome.title")}
          <br />
          <span className="hero-title-accent font-extrabold">
            {t("steps.welcome.titleAccent")}
          </span>
        </h1>
      </Reveal>

      <Reveal delay={0.15}>
        <p className="hero-sub">
          {t("steps.welcome.subtitle")}
        </p>
      </Reveal>

      <Reveal delay={0.25} className="w-full">
        <button onClick={onNext} className="hero-cta-primary">
          {t("steps.welcome.button")}
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
        </button>
      </Reveal>
    </div>
  );
}

function StepInput({
  label,
  subtitle,
  type,
  placeholder,
  value,
  onChange,
  onNext,
  canProceed,
  min,
  max,
  step,
  suffix,
  t,
}: {
  label: string;
  subtitle: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  canProceed: boolean;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  t: any;
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{label}</h2>
        <p className="text-muted text-sm">{subtitle}</p>
      </div>

      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && canProceed && onNext()}
          min={min}
          max={max}
          step={step}
          autoComplete="off"
          className="w-full px-4 py-3.5 rounded-xl text-base input-glass"
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted text-sm">
            {suffix}
          </span>
        )}
      </div>

      <button
        onClick={onNext}
        disabled={!canProceed}
        className="w-full h-[60px] rounded-xl text-base font-semibold btn-gradient"
      >
        {t("buttons.next")}
      </button>
    </div>
  );
}

function StepSex({
  value,
  onChange,
  onNext,
  canProceed,
  loading,
  error,
  t,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  canProceed: boolean;
  loading: boolean;
  error: string | null;
  t: any;
}) {
  const options = [
    { value: "male", label: t("steps.sex.male") },
    { value: "female", label: t("steps.sex.female") },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{t("steps.sex.label")}</h2>
        <p className="text-muted text-sm">
          {t("steps.sex.subtitle")}
        </p>
      </div>

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}

      <div className="space-y-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`w-full px-4 py-3.5 rounded-xl text-base text-left transition-all ${
              value === opt.value
                ? "glass border-accent/50 text-white"
                : "glass text-muted hover:text-white"
            }`}
            style={
              value === opt.value
                ? { borderColor: "var(--accent-orange)" }
                : undefined
            }
          >
            {opt.label}
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!canProceed || loading}
        className="w-full h-[60px] rounded-xl text-base font-semibold btn-gradient"
      >
        {loading ? t("buttons.nextSaving") : t("buttons.next")}
      </button>
    </div>
  );
}

function StepCategory({
  value,
  onChange,
  onNext,
  canProceed,
  loading,
  error,
  t,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  canProceed: boolean;
  loading: boolean;
  error: string | null;
  t: any;
}) {
  const options = [
    {
      value: "athx",
      label: t("steps.category.athx.label"),
      desc: t("steps.category.athx.desc"),
    },
    {
      value: "athx_pro",
      label: t("steps.category.athxPro.label"),
      desc: t("steps.category.athxPro.desc"),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{t("steps.category.label")}</h2>
        <p className="text-muted text-sm">{t("steps.category.subtitle")}</p>
      </div>

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}

      <div className="space-y-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`w-full px-4 py-4 rounded-xl text-left transition-all ${
              value === opt.value
                ? "glass border-accent/50 text-white"
                : "glass text-muted hover:text-white"
            }`}
            style={
              value === opt.value
                ? { borderColor: "var(--accent-orange)" }
                : undefined
            }
          >
            <p className="text-base font-semibold">{opt.label}</p>
            <p className="text-xs text-muted mt-0.5">{opt.desc}</p>
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!canProceed || loading}
        className="w-full h-[60px] rounded-xl text-base font-semibold btn-gradient"
      >
        {loading ? t("buttons.nextSaving") : t("buttons.next")}
      </button>
    </div>
  );
}

function StepRM({
  values,
  onChange,
  onFieldFocus,
  onNext,
  onSkip,
  loading,
  t,
}: {
  values: { strictPress: string; backSquat: string; deadlift: string };
  onChange: (field: string, v: string) => void;
  onFieldFocus: (field: RMField) => void;
  onNext: () => void;
  onSkip: () => void;
  loading: boolean;
  t: any;
}) {
  const fields: { key: RMField; label: string }[] = [
    { key: "strictPress", label: t("steps.fitness.strictPress") },
    { key: "backSquat", label: t("steps.fitness.backSquat") },
    { key: "deadlift", label: t("steps.fitness.deadlift") },
  ];

  const hasAny = Object.values(values).some((v) => v !== "");

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{t("steps.fitness.label")}</h2>
        <p className="text-muted text-sm">
          {t("steps.fitness.subtitle")}
        </p>
      </div>

      <div className="space-y-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="text-sm text-muted mb-1 block">{f.label}</label>
            <div className="relative">
              <input
                type="number"
                placeholder="0"
                value={values[f.key]}
                onChange={(e) => onChange(f.key, e.target.value)}
                onFocus={() => onFieldFocus(f.key)}
                min={0}
                max={500}
                autoComplete="off"
                className="w-full px-4 py-3.5 rounded-xl text-base input-glass"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted text-sm">
                {t("steps.fitness.unitSuffix")}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <button
          onClick={onNext}
          disabled={!hasAny || loading}
          className="w-full h-[60px] rounded-xl text-base font-semibold btn-gradient"
        >
          {loading ? t("buttons.nextSaving") : t("buttons.next")}
        </button>
        <button
          onClick={onSkip}
          disabled={loading}
          className="w-full py-3 text-sm text-muted hover:text-white transition-colors"
        >
          {t("buttons.skip")}
        </button>
      </div>
    </div>
  );
}

function StepAvatar({
  onNext,
  onSkip,
  t,
}: {
  onNext: () => void;
  onSkip: () => void;
  t: any;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError(t("errors.selectImage"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(t("errors.maxFileSize"));
      return;
    }

    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError(t("errors.notAuthenticated"));
      setUploading(false);
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setPreview(null);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);

    const result = await updateAvatar(publicUrl);
    if (result?.error) {
      setError(result.error);
      setPreview(null);
    } else {
      setUploaded(true);
    }
    setUploading(false);
  }

  async function handleNext() {
    await completeOnboarding();
    onNext();
  }

  async function handleSkip() {
    await completeOnboarding();
    onSkip();
  }

  return (
    <div className="space-y-8 text-center">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{t("steps.avatar.label")}</h2>
        <p className="text-muted text-sm">{t("steps.avatar.subtitle")}</p>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-28 h-28 rounded-full glass flex items-center justify-center overflow-hidden"
        >
          {preview ? (
            <img
              src={preview}
              alt={t("steps.avatar.altText")}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg
              className="w-10 h-10 text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={handleNext}
          disabled={uploading}
          className="w-full h-[60px] rounded-xl text-base font-semibold btn-gradient"
        >
          {uploading ? t("buttons.uploading") : t("buttons.next")}
        </button>
        {!uploaded && (
          <button
            type="button"
            onClick={handleSkip}
            className="w-full py-3 text-sm text-muted hover:text-white transition-colors"
          >
            {t("buttons.skip")}
          </button>
        )}
      </div>
    </div>
  );
}

function StepPayment({
  onSubscribe,
  t,
}: {
  onSubscribe: () => void;
  t: any;
}) {
  const features = [
    t("steps.payment.feature1"),
    t("steps.payment.feature2"),
    t("steps.payment.feature3"),
    t("steps.payment.feature4"),
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{t("steps.payment.label")}</h2>
        <p className="text-muted text-sm">
          {t("steps.payment.subtitle")}
        </p>
      </div>

      <div className="glass rounded-xl p-5 space-y-4">
        {features.map((item) => (
          <div key={item} className="flex items-center gap-3">
            <span className="text-accent text-sm">✓</span>
            <span className="text-sm">{item}</span>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <button
          onClick={onSubscribe}
          className="w-full h-[60px] rounded-xl text-base font-semibold btn-gradient"
        >
          {t("steps.payment.subscribe")}
        </button>
        <Link
          href="/entrenamiento"
          className="block w-full h-[52px] rounded-xl text-sm font-medium text-muted hover:text-white glass flex items-center justify-center transition-colors"
        >
          {t("steps.payment.skipLink")}
        </Link>
      </div>
    </div>
  );
}
