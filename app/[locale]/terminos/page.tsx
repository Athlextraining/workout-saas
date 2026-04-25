import type { Metadata } from 'next'
import { Link } from '@/shared/i18n/routing'

export const metadata: Metadata = {
  title: 'Términos y condiciones',
  description:
    'Términos y condiciones de ATHLEX Training. Condiciones de uso, suscripción y cancelación del servicio.',
  alternates: { canonical: '/terminos' },
  robots: { index: true, follow: true },
}

const LAST_UPDATED = '24 de abril de 2026'

export default function TerminosPage() {
  return (
    <div className="min-h-screen px-5 py-12 sm:py-16">
      <article className="mx-auto w-full max-w-2xl space-y-8 text-sm leading-relaxed text-[var(--text-secondary)]">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Términos y Condiciones</h1>
          <p className="text-xs uppercase tracking-wider opacity-70">
            Última actualización: {LAST_UPDATED}
          </p>
        </header>

        <Section title="1. Quiénes somos">
          <p>
            ATHLEX Training («el servicio», «nosotros») es una plataforma de
            entrenamiento online. Contacto:{' '}
            <a
              href="mailto:soporte@athlextraining.com"
              className="text-[var(--accent-green)] underline"
            >
              soporte@athlextraining.com
            </a>
            .
          </p>
        </Section>

        <Section title="2. Aceptación">
          <p>
            Al crear una cuenta o suscribirte aceptas estos términos y nuestra{' '}
            <Link href="/privacidad" className="text-[var(--accent-green)] underline">
              Política de Privacidad
            </Link>
            . Si no estás de acuerdo, no uses el servicio.
          </p>
        </Section>

        <Section title="3. Edad mínima">
          <p>
            Debes tener al menos 14 años para usar el servicio. Si eres menor de 18,
            necesitas el consentimiento de tu padre, madre o tutor legal.
          </p>
        </Section>

        <Section title="4. Suscripción y pagos">
          <ul className="list-disc space-y-1 pl-5">
            <li>El acceso al contenido completo requiere una suscripción activa, gestionada mediante Stripe.</li>
            <li>El cobro se realiza de forma recurrente según el plan elegido.</li>
            <li>Puedes cancelar en cualquier momento desde tu perfil. La cancelación es efectiva al final del periodo pagado.</li>
            <li>No se realizan reembolsos proporcionales de periodos ya iniciados, salvo obligación legal.</li>
          </ul>
        </Section>

        <Section title="5. Uso del contenido">
          <p>
            El contenido (rutinas, métodos, textos, imágenes, vídeos) es propiedad de
            ATHLEX Training. Te concedemos una licencia personal, no exclusiva e
            intransferible para tu uso individual. Queda prohibido redistribuir,
            republicar o usarlo con fines comerciales sin autorización.
          </p>
        </Section>

        <Section title="6. Riesgos del entrenamiento físico">
          <p>
            El entrenamiento físico conlleva riesgos. Consulta a un médico antes de
            iniciar cualquier programa si tienes condiciones médicas preexistentes,
            estás embarazada o te recuperas de una lesión. No somos responsables de
            lesiones derivadas del uso del contenido; actúas bajo tu propio criterio y
            responsabilidad.
          </p>
        </Section>

        <Section title="7. Conducta del usuario">
          <p>
            Te comprometes a no compartir tu cuenta, no intentar acceder a otras
            cuentas, no realizar ingeniería inversa del servicio y no subir contenido
            ilegal, ofensivo o que vulnere derechos de terceros.
          </p>
        </Section>

        <Section title="8. Suspensión y cancelación">
          <p>
            Podemos suspender o cancelar tu cuenta si incumples estos términos, si
            detectamos actividad fraudulenta o si dejas de pagar la suscripción.
          </p>
        </Section>

        <Section title="9. Disponibilidad">
          <p>
            Hacemos lo posible por mantener el servicio disponible, pero no
            garantizamos uptime al 100%. Podemos realizar mantenimientos puntuales.
          </p>
        </Section>

        <Section title="10. Limitación de responsabilidad">
          <p>
            El servicio se ofrece «tal cual». En la medida permitida por la ley, no
            somos responsables de daños indirectos, lucro cesante ni pérdida de datos
            derivados del uso del servicio.
          </p>
        </Section>

        <Section title="11. Cambios en los términos">
          <p>
            Podemos actualizar estos términos. Te avisaremos con antelación razonable
            de cambios materiales. El uso continuado tras la notificación implica tu
            aceptación.
          </p>
        </Section>

        <Section title="12. Ley aplicable">
          <p>
            Estos términos se rigen por la legislación española. Para cualquier
            disputa son competentes los juzgados de tu domicilio como consumidor.
          </p>
        </Section>
      </article>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      {children}
    </section>
  )
}
