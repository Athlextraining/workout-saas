import Link from "next/link";
import { Reveal } from "./reveal";
import { JsonLd, softwareApplicationLd, faqPageLd } from "@/shared/seo/jsonld";

const FAQ_ITEMS = [
  {
    question: "¿Necesito experiencia previa?",
    answer:
      "Sí, recomendado conocimiento previo. El programa asume dominio de los movimientos incluidos este año.",
  },
  {
    question: "¿Qué material necesito?",
    answer:
      "Box estándar: barra olímpica, mancuernas, sandbag, box jump, ski-erg o remo.",
  },
  {
    question: "¿Cuánto dura cada sesión?",
    answer: "Entre 60 y 90 minutos.",
  },
  {
    question: "¿Diferencia ATHX vs ATHX PRO?",
    answer:
      "PRO tiene una carga de trabajo mayor y los entrenamientos suelen durar un poco más.",
  },
  {
    question: "¿Cómo cancelo?",
    answer:
      "Desde tu perfil, un click. Cancela cuando quieras. Mantienes acceso hasta el final del periodo pagado.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <link
        rel="preload"
        as="image"
        href="/backgroundhero.webp"
        fetchPriority="high"
      />
      <JsonLd data={softwareApplicationLd()} />
      <JsonLd data={faqPageLd(FAQ_ITEMS)} />
      {/* Hero */}
      <section className="hero-shell">
        <p className="sr-only">
          ATHLEX Training — entrenamiento ATHX y programación ATHX para atletas
          preparando ATHX 2026 en España y Latinoamérica.
        </p>
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-image" />
          <div className="hero-vignette" />
          <div className="hero-grid" />
          <div className="hero-grain" />
          <div className="hero-fade" />
        </div>

        <div className="hero-content">
          <span className="hero-eyebrow">
            <span className="hero-dot" />
            ATHX Training by ATHLEX
          </span>

          <h1 className="hero-title">
            ENTRENAMIENTO
            <br />
            <span className="hero-title-accent font-extrabold">ATHX.</span>
          </h1>

          <p className="hero-sub">
            Programación ATHX oficial: plan semanal de entrenamiento para
            preparar <strong>ATHX 2026</strong>, con seguimiento y chat directo
            con tu coach. Para atletas de España y Latinoamérica.
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
          <p className="hero-cta-fineprint">Primera semana gratis</p>
        </div>

        <a href="#programa" className="hero-scroll-cue">
          <span>Programa</span>
          <span className="hero-scroll-arrow" aria-hidden="true">
            ↓
          </span>
        </a>
      </section>

      {/* Tools — phone mockups */}
      <section className="tools-shell">
        <Reveal className="tools-intro">
          <p className="tools-intro-tag">Herramientas</p>
          <h2 className="tools-intro-title">
            Todo lo que necesitas.
            <br />
            <em className="tools-intro-em">En tu bolsillo.</em>
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="tool-row">
            <div className="tool-copy">
              <span className="tool-tag">Chat directo</span>
              <h3 className="tool-title">Tu coach a un mensaje</h3>
              <p className="tool-body">
                Dudas de técnica, escalas, dolores — pregunta sin límites y
                recibe respuesta del equipo ATHLEX en el día.
              </p>
            </div>
            <div className="phone-frame" aria-hidden="true">
              <div className="phone-notch" />
              <div className="phone-screen phone-screen--chat">
                <div className="phone-chat-head">
                  <div className="phone-chat-avatar">A</div>
                  <div>
                    <p className="phone-chat-name">ATHLEX</p>
                    <p className="phone-chat-status">en línea</p>
                  </div>
                </div>
                <div className="phone-chat-body">
                  <div className="phone-bubble phone-bubble--theirs">
                    ¿Cómo fue el Back Squat hoy?
                  </div>
                  <div className="phone-bubble phone-bubble--mine">
                    5×5 a 110 kg, RPE 7. Me sobró uno.
                  </div>
                  <div className="phone-bubble phone-bubble--theirs">
                    Perfecto. Mañana subimos a 115. 🔥
                  </div>
                  <div className="phone-bubble phone-bubble--mine">
                    Vamos!
                  </div>
                </div>
                <div className="phone-chat-input">
                  <span>Escribe un mensaje…</span>
                  <span className="phone-send">→</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="tool-row tool-row--reverse">
            <div className="tool-copy">
              <span className="tool-tag">Cronómetro integrado</span>
              <h3 className="tool-title">AMRAP, EMOM, For Time</h3>
              <p className="tool-body">
                Modos de competición listos en 2 toques. Beeps por round,
                pantalla siempre despierta y control con una mano.
              </p>
            </div>
            <div className="phone-frame" aria-hidden="true">
              <div className="phone-notch" />
              <div className="phone-screen phone-screen--timer">
                <p className="phone-timer-mode">FOR TIME</p>
                <div className="phone-timer-ring">
                  <svg viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      stroke="var(--accent-green)"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray="339"
                      strokeDashoffset="100"
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <div className="phone-timer-time">
                    <span className="phone-timer-big">07:42</span>
                    <span className="phone-timer-small">Round 3 / 4</span>
                  </div>
                </div>
                <div className="phone-timer-ctrl">
                  <span>▐▐</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Features — sticky stack */}
      <section id="programa" className="features-shell">
        <Reveal className="features-intro">
          <p className="features-intro-tag">El programa</p>
          <h2 className="features-intro-title">
            Programación ATHX:
            <br />
            tres pilares, cero relleno.
          </h2>
        </Reveal>

        <div className="features-stack">
          {[
            {
              num: "01",
              tag: "ATHX Specific",
              title: "Pensado para ATHX Games",
              body: "Cada semana y ciclo están pensados para los 3 eventos: Strength, Endurance y MetCon X. Sin relleno.",
              icon: (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 18h6" />
                  <path d="M10 21h4" />
                  <path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1.2 1.5 1.2 2.5h5.6c0-1 .4-1.7 1.2-2.5A6 6 0 0 0 12 3z" />
                </svg>
              ),
              cardClass: "feature-card-1",
            },
            {
              num: "02",
              tag: "Metodología pro",
              title: "Periodización en 4 fases",
              body: "BASE, BUILD, PEAK y DELOAD. Carga progresiva calibrada por RPE y % 1RM. La ciencia hace el trabajo.",
              icon: (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 21h18" />
                  <path d="M3 17h4v4" />
                  <path d="M8 13h4v8" />
                  <path d="M13 9h4v12" />
                  <path d="M18 4h3v17" />
                </svg>
              ),
              cardClass: "feature-card-2",
            },
            {
              num: "03",
              tag: "Día clave",
              title: "Mejor que el resto",
              body: "El ciclo termina con simulación de eventos completos. Test inicial y final para medir progreso real.",
              icon: (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="5" />
                  <circle
                    cx="12"
                    cy="12"
                    r="1.5"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              ),
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

        <Reveal>
          <p className="pricing-eyebrow">Precio simple</p>
          <h2 className="pricing-headline">
            Un programa.
            <br />
            Un precio.
          </h2>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="pricing-card">
            <span className="pricing-badge">Popular</span>

            <p className="pricing-tag">Programa ATHX 2026</p>

            <div className="pricing-price-row">
              <span className="pricing-price">
                14
                <sup className="text-sm align-super">,90</sup>€
              </span>
              <span className="pricing-price-unit">/mes</span>
            </div>
            <p className="pricing-sub">Cancela cuando quieras.</p>

            <div className="pricing-divider" />

            <div>
              {[
                "Programación y seguimiento individual",
                "2 categorías: ATHX y ATHX PRO",
                "Plan semanal de lunes a domingo",
                "Warmup, fuerza y Metcon por día",
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
              Suscríbete
            </Link>
            <p className="pricing-fineprint">Cancela cuando quieras</p>
          </div>
        </Reveal>
      </section>

      {/* Why choose */}
      <section className="px-6 py-20">
        <div className="max-w-md mx-auto space-y-8">
          <Reveal>
            <h2 className="text-3xl font-bold leading-tight text-center">
              Por qué elegir ATHLEX para tu entrenamiento ATHX
            </h2>
          </Reveal>
          <ul className="space-y-5">
            {[
              "Estructura clara y adaptada a ti",
              "Progresión real: las cargas suben, los tiempos bajan.",
              "Movimientos de competición desde la semana 1.",
              "Planificada desde la experiencia",
              "Registro y leaderboard para medir tu progreso",
            ].map((why, i) => (
              <Reveal key={why} delay={i * 0.08} y={24}>
                <li className="flex items-start gap-3 border-l-2 border-accent/40 pl-4">
                  <span className="text-base leading-snug">{why}</span>
                </li>
              </Reveal>
            ))}
          </ul>
          <p className="text-center text-sm text-muted">
            ¿Nuevo en la competición?{" "}
            <Link href="/que-es-athx" className="text-accent underline">
              Empieza por qué es ATHX
            </Link>
            .
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20">
        <div className="max-w-md mx-auto space-y-6">
          <Reveal>
            <h2 className="text-3xl font-bold text-center">FAQ</h2>
          </Reveal>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <Reveal key={item.question} delay={i * 0.06} y={20}>
                <details className="glass rounded-xl px-5 py-4 group">
                  <summary className="text-sm font-medium list-none flex items-center justify-between cursor-pointer">
                    <span>{item.question}</span>
                    <span className="text-accent transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="text-muted text-sm mt-3 leading-relaxed">
                    {item.answer}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-6 py-20">
        <Reveal className="max-w-md mx-auto text-center space-y-6">
          <h2 className="text-4xl font-bold leading-tight">
            Tu próximo PR
            <br />
            empieza el lunes.
          </h2>
          <Link
            href="/login"
            className="inline-block w-full py-3.5 rounded-xl text-base font-semibold btn-gradient"
          >
            Comienza ahora
          </Link>
          <p className="text-muted text-xs">Primera semana gratis</p>
        </Reveal>
      </section>

      {/* Legal footer */}
      <footer className="px-6 pt-6 pb-10 border-t border-white/5">
        <div className="max-w-md mx-auto flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted">
          <Link href="/privacidad" className="hover:text-white transition-colors">
            Privacidad
          </Link>
          <Link href="/terminos" className="hover:text-white transition-colors">
            Términos
          </Link>
          <a
            href="mailto:soporte@athlextraining.com"
            className="hover:text-white transition-colors"
          >
            Soporte
          </a>
          <span className="w-full text-center text-[10px] uppercase tracking-widest opacity-60 mt-2">
            © ATHLEX Training
          </span>
        </div>
      </footer>
    </div>
  );
}
