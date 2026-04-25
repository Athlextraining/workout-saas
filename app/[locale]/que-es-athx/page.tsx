import type { Metadata } from "next";
import { Link } from "@/shared/i18n/routing";
import { JsonLd, faqPageLd } from "@/shared/seo/jsonld";

export const metadata: Metadata = {
  title: "Qué es ATHX: guía del atleta para 2026",
  description:
    "ATHX es la competición fitness de ATHLEX. Aprende qué es ATHX, los 3 eventos (Strength, Endurance, MetCon X), categorías ATHX y ATHX PRO, y cómo preparar ATHX 2026 con programación oficial.",
  alternates: {
    canonical: "/que-es-athx",
    languages: {
      "es-ES": "/que-es-athx",
      "es-419": "/que-es-athx",
      "x-default": "/que-es-athx",
    },
  },
  openGraph: {
    type: "article",
    title: "Qué es ATHX: guía del atleta para 2026",
    description:
      "Qué es ATHX, formato de la competición, categorías, y cómo prepararte.",
    url: "/que-es-athx",
  },
};

const FAQS = [
  {
    question: "¿Qué es ATHX?",
    answer:
      "ATHX es la competición fitness organizada por ATHLEX. Reúne pruebas de fuerza, resistencia y eventos mixtos (MetCon X) en un formato de 3 días. Está abierta a atletas de España y Latinoamérica.",
  },
  {
    question: "¿Cuáles son los eventos de ATHX?",
    answer:
      "ATHX se divide en tres bloques: Strength (fuerza máxima), Endurance (resistencia) y MetCon X (eventos mixtos con movimientos ponderados y gimnásticos). El ciclo culmina con una simulación de los 3 bloques.",
  },
  {
    question: "¿Diferencia entre ATHX y ATHX PRO?",
    answer:
      "ATHX es la categoría abierta. ATHX PRO aumenta volumen e intensidad para atletas competitivos: sesiones más largas, cargas mayores y estándares de movimiento más estrictos.",
  },
  {
    question: "¿Cómo me preparo para ATHX?",
    answer:
      "Con una programación ATHX específica: periodización en BASE, BUILD, PEAK y DELOAD, con calibración por RPE y % de 1RM. ATHLEX Training entrega un plan semanal de lunes a domingo, warmup, fuerza y MetCon por día, y chat con coach.",
  },
  {
    question: "¿Cuándo es ATHX 2026?",
    answer:
      "Las fechas oficiales de ATHX 2026 se anuncian en el canal oficial de ATHLEX. Nuestra programación está alineada al calendario del evento.",
  },
];

export default function Page() {
  return (
    <article className="mx-auto max-w-2xl px-6 py-16 space-y-10">
      <JsonLd data={faqPageLd(FAQS)} />

      <header className="space-y-4">
        <p className="text-sm uppercase tracking-widest text-accent">Guía ATHX</p>
        <h1 className="text-4xl font-bold leading-tight">
          Qué es ATHX y cómo preparar ATHX 2026
        </h1>
        <p className="text-muted text-lg">
          ATHX es la competición fitness de ATHLEX. Esta guía explica el formato,
          las categorías (ATHX y ATHX PRO) y cómo construir una{" "}
          <strong>programación ATHX</strong> que te lleve al podio.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">El formato ATHX</h2>
        <p>
          ATHX combina tres bloques: <strong>Strength</strong>,{" "}
          <strong>Endurance</strong> y <strong>MetCon X</strong>. Cada bloque
          mide una capacidad distinta y se puntúa de forma independiente. Gana
          quien rinda más parejo en los tres.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Cómo es una programación ATHX seria
        </h2>
        <p>
          Una <strong>programación ATHX</strong> bien hecha periodiza en 4 fases:
          BASE, BUILD, PEAK y DELOAD. La carga sube progresivamente por RPE y %
          de 1RM, con semanas de descarga para llegar fresco al evento.
        </p>
        <p>
          El <strong>entrenamiento ATHX</strong> debe incluir los movimientos
          del año desde la semana 1 — si llegas a la competición con técnica
          dudosa, no compensarás con volumen.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Preguntas frecuentes sobre ATHX
        </h2>
        <div className="space-y-3">
          {FAQS.map((item) => (
            <details key={item.question} className="glass rounded-xl px-5 py-4 group">
              <summary className="text-sm font-medium list-none flex items-center justify-between cursor-pointer">
                <span>{item.question}</span>
                <span className="text-accent transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="text-muted text-sm mt-3 leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="space-y-4 border-t border-white/10 pt-10">
        <h2 className="text-2xl font-semibold">Empieza hoy</h2>
        <p>
          ATHLEX Training entrega programación ATHX oficial con plan semanal,
          seguimiento y chat directo con coach. Primera semana gratis.
        </p>
        <Link
          href="/login"
          className="block w-full text-center py-3.5 rounded-xl text-base font-semibold btn-gradient"
        >
          Comienza ahora
        </Link>
      </section>
    </article>
  );
}
