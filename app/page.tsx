import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="hero-shell">
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-grid" />
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2 " />
          <div className="hero-grain" />
          <div className="hero-fade" />
        </div>

        <div className="hero-content">
          <span className="hero-eyebrow">
            <span className="hero-dot" />
            ATHX Coaching
          </span>

          <h1 className="hero-title">
            ENTRENA
            <br />
            MEJORA
            <br />
            <span className="hero-title-accent font-extrabold">COMPITE.</span>
          </h1>

          <p className="hero-sub">
            Programa de 6 semanas para llegar al pico justo en{" "}
            <strong>ATHX Games 2026</strong>.
          </p>

          <Link href="/login" className="hero-cta-primary">
            COMIENZA AHORA
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
        </div>

        <a href="#programa" className="hero-scroll-cue">
          <span>Programa</span>
          <span className="hero-scroll-arrow" aria-hidden="true">
            ↓
          </span>
        </a>
      </section>

      {/* Social proof */}
      <section className="proof-shell">
        <div className="proof-bg" aria-hidden="true" />

        <div className="proof-eyebrow-row">
          <div className="proof-stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className="proof-star"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 2l2.9 7h7.1l-5.7 4.3 2.2 7-6.5-4.7L5.5 20.3l2.2-7L2 9h7.1z" />
              </svg>
            ))}
            <span className="proof-rating">4.9 · +1.200 atletas</span>
          </div>
        </div>

        <h2 className="proof-headline">
          Atletas que <em>compiten de verdad</em> confían en ATHX.
        </h2>

        <div className="proof-stats">
          {[
            { stat: "91%", label: "Completan el ciclo" },
            { stat: "88%", label: "Mejoran su PR" },
            { stat: "83%", label: "Repiten el plan" },
          ].map((s) => (
            <div key={s.stat} className="proof-stat">
              <span className="proof-stat-num">{s.stat}</span>
              <span className="proof-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features — sticky stack */}
      <section id="programa" className="features-shell">
        <div className="features-intro reveal">
          <p className="features-intro-tag">El programa</p>
          <h2 className="features-intro-title">
            Tres pilares.
            <br />
            Cero relleno.
          </h2>
        </div>

        <div className="features-stack">
          {[
            {
              num: "01",
              tag: "ATHX Specific",
              title: "Pensado para ATHX Games",
              body: "Cada sesión está alineada con los 3 eventos de la competición: Strength, Endurance y MetCon X. Sin relleno.",
              icon: "◎",
              cardClass: "feature-card-1",
            },
            {
              num: "02",
              tag: "Metodología pro",
              title: "Periodización en 4 fases",
              body: "BASE, BUILD, PEAK y DELOAD. Carga progresiva calibrada por RPE y % 1RM. La ciencia hace el trabajo.",
              icon: "△",
              cardClass: "feature-card-2",
            },
            {
              num: "03",
              tag: "Día clave",
              title: "Llegas afilado al pico",
              body: "El ciclo termina con simulación de eventos completos. Test inicial y final para medir progreso real.",
              icon: "✦",
              cardClass: "feature-card-3",
            },
          ].map((f) => (
            <article key={f.num} className={`feature-card ${f.cardClass}`}>
              <div>
                <div className="feature-num">{f.num} / 03</div>
                <span className="feature-tag">{f.tag}</span>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-body">{f.body}</p>
              </div>
              <div className="feature-icon" aria-hidden="true">
                {f.icon}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing-shell">
        <div className="pricing-bg" aria-hidden="true" />

        <p className="pricing-eyebrow reveal">Precio simple</p>
        <h2 className="pricing-headline reveal">
          Un programa.
          <br />
          Un precio.
        </h2>

        <div className="pricing-card reveal">
          <span className="pricing-badge">Popular</span>

          <p className="pricing-tag">Programa ATHX 2026</p>

          <div className="pricing-price-row">
            <span className="pricing-price">9,99€</span>
            <span className="pricing-price-unit">/mes</span>
          </div>
          <p className="pricing-sub">Cancela cuando quieras.</p>

          <div className="pricing-divider" />

          <div>
            {[
              "Ciclo completo de 6 semanas",
              "2 categorías: ATHX y ATHX PRO",
              "Plan semanal de lunes a domingo",
              "Warmup, fuerza y WOD por día",
              "Primera semana gratis",
            ].map((b) => (
              <div key={b} className="pricing-feature">
                <span className="pricing-check" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <polyline points="5 12 10 17 19 8" />
                  </svg>
                </span>
                <span className="pricing-feature-text">{b}</span>
              </div>
            ))}
          </div>

          <Link href="/login" className="pricing-cta">
            Empezar ahora
          </Link>
          <p className="pricing-fineprint">Sin tarjeta. Sin compromiso.</p>
        </div>
      </section>

      {/* Why choose */}
      <section className="reveal px-6 py-20">
        <div className="max-w-md mx-auto space-y-8">
          <h2 className="text-3xl font-bold leading-tight text-center">
            Por qué ATHX Coaching
          </h2>
          <ul className="space-y-5">
            {[
              "Estructura clara: nunca te preguntas qué tocaba hoy.",
              "Progresión real: las cargas suben, los tiempos bajan.",
              "Movimientos de competición desde la semana 1.",
              "Diseñado para móvil: planifica desde el box.",
              "Sin contratos. Suscripción mensual.",
            ].map((why) => (
              <li
                key={why}
                className="reveal flex items-start gap-3 border-l-2 border-accent/40 pl-4"
              >
                <span className="text-base leading-snug">{why}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="reveal px-6 py-20">
        <div className="max-w-md mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-center">FAQ</h2>
          <div className="space-y-3">
            {[
              {
                q: "¿Necesito experiencia previa?",
                a: "Sí, recomendado nivel intermedio en CrossFit. El programa asume dominio básico de barra, gimnásticos y monoestructurales.",
              },
              {
                q: "¿Qué material necesito?",
                a: "Box estándar: barra olímpica, mancuernas, sandbag, box jump, ski-erg o remo. ATHX PRO añade peso adicional.",
              },
              {
                q: "¿Cuánto dura cada sesión?",
                a: "Entre 60 y 90 minutos. Días de fuerza más metcon. Jueves y domingo son recuperación.",
              },
              {
                q: "¿Diferencia ATHX vs ATHX PRO?",
                a: "PRO trabaja con cargas mayores (sandbag 70/50, DB 22.5/15), dual dumbbell y switches de 1000m en endurance.",
              },
              {
                q: "¿Cómo cancelo?",
                a: "Desde tu perfil, un click. Cancela cuando quieras. Mantienes acceso hasta el final del periodo pagado.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="glass rounded-xl px-5 py-4 group"
              >
                <summary className="text-sm font-medium list-none flex items-center justify-between cursor-pointer">
                  <span>{item.q}</span>
                  <span className="text-accent transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="text-muted text-sm mt-3 leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="reveal px-6 py-20">
        <div className="max-w-md mx-auto text-center space-y-6">
          <h2 className="text-4xl font-bold leading-tight">
            Tu próximo PR
            <br />
            empieza el lunes.
          </h2>
          <Link
            href="/login"
            className="inline-block w-full py-3.5 rounded-xl text-base font-semibold btn-gradient"
          >
            Empezar ahora
          </Link>
          <p className="text-muted text-xs">
            Primera semana gratis · Sin tarjeta
          </p>
        </div>
      </section>
    </div>
  );
}
