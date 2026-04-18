import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="reveal min-h-[88vh] flex flex-col justify-center px-6 pt-12 pb-16">
        <div className="max-w-md mx-auto w-full space-y-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-accent">
            ATHX Training
          </p>
          <h1 className="text-5xl font-bold tracking-tight leading-[1.05]">
            Entrena.
            <br />
            Potencia.
            <br />
            <span className="bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-purple)] bg-clip-text text-transparent">
              Compite.
            </span>
          </h1>
          <p className="text-muted text-base leading-relaxed">
            Programa de 6 semanas diseñado para llevarte al pico de forma justo
            en ATHX Games 2026.
          </p>
          <div className="flex flex-col gap-3 pt-2">
            <Link
              href="/login"
              className="w-full py-3.5 rounded-xl text-base font-semibold text-center btn-gradient"
            >
              Comienza tu entrenamiento
            </Link>
            <Link
              href="#programa"
              className="w-full py-3 text-sm text-muted hover:text-white transition-colors"
            >
              Ver programa ↓
            </Link>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="reveal px-6 py-20">
        <div className="max-w-md mx-auto space-y-10 text-center">
          <div className="space-y-2">
            <div className="text-accent text-lg">★★★★★</div>
            <p className="text-xs uppercase tracking-wider text-muted">
              Atletas confían en ATHX
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { stat: "91%", label: "Completan el ciclo" },
              { stat: "88%", label: "Mejoran su PR" },
              { stat: "83%", label: "Repiten el plan" },
            ].map((s) => (
              <div key={s.stat} className="space-y-1">
                <p className="text-2xl font-bold">{s.stat}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted leading-tight">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="programa" className="px-6 py-20 space-y-20">
        {[
          {
            tag: "ATHX Specific",
            title: "Pensado para ATHX Games",
            body: "Cada sesion está alineada con los 3 eventos de la competición: Strength, Endurance y MetCon X. Sin relleno.",
          },
          {
            tag: "Diseñado por atletas",
            title: "Metodología profesional",
            body: "Periodización en 4 fases: BASE, BUILD, PEAK y DELOAD. Carga progresiva calibrada por RPE y % 1RM.",
          },
          {
            tag: "Preparación competición",
            title: "Llegas afilado al día clave",
            body: "El ciclo termina con simulación de eventos completos. Test inicial y final para medir progreso real.",
          },
        ].map((f) => (
          <div key={f.tag} className="reveal max-w-md mx-auto space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-accent">
              {f.tag}
            </p>
            <h2 className="text-3xl font-bold leading-tight">{f.title}</h2>
            <p className="text-muted text-base leading-relaxed">{f.body}</p>
          </div>
        ))}
      </section>

      {/* Pricing */}
      <section className="reveal px-6 py-20">
        <div className="max-w-md mx-auto glass rounded-3xl p-8 space-y-6">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-accent">
              Programa ATHX 2026
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">9,99€</span>
              <span className="text-muted text-sm">/mes</span>
            </div>
            <p className="text-muted text-sm">Cancela cuando quieras.</p>
          </div>

          <div className="border-t border-white/10" />

          <div className="space-y-3">
            {[
              "Ciclo completo de 6 semanas",
              "2 categorías: ATHX y ATHX PRO",
              "Plan semanal de lunes a domingo",
              "Warmup, fuerza y WOD por día",
              "Primera semana gratis",
            ].map((b) => (
              <div key={b} className="flex items-start gap-3">
                <span className="text-accent text-sm mt-0.5">✓</span>
                <span className="text-sm">{b}</span>
              </div>
            ))}
          </div>

          <Link
            href="/login"
            className="block w-full py-3.5 rounded-xl text-base font-semibold text-center btn-gradient"
          >
            Empezar ahora
          </Link>
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
