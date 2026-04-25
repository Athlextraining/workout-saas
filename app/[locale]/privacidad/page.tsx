import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description:
    'Política de privacidad de ATHLEX Training. Cómo tratamos tus datos personales en el servicio de programación ATHX.',
  alternates: { canonical: '/privacidad' },
  robots: { index: true, follow: true },
}

const LAST_UPDATED = '24 de abril de 2026'

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen px-5 py-12 sm:py-16">
      <article className="mx-auto w-full max-w-2xl space-y-8 text-sm leading-relaxed text-[var(--text-secondary)]">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Política de Privacidad</h1>
          <p className="text-xs uppercase tracking-wider opacity-70">
            Última actualización: {LAST_UPDATED}
          </p>
        </header>

        <Section title="1. Responsable del tratamiento">
          <p>
            El responsable del tratamiento de los datos es ATHLEX Training
            («nosotros»). Para cualquier consulta relacionada con esta política
            puedes escribir a{' '}
            <a
              href="mailto:soporte@athlextraining.com"
              className="text-[var(--accent-green)] underline"
            >
              soporte@athlextraining.com
            </a>
            .
          </p>
        </Section>

        <Section title="2. Datos que recogemos">
          <ul className="list-disc space-y-1 pl-5">
            <li>Datos de registro: nombre, correo electrónico, contraseña (hasheada).</li>
            <li>Datos del perfil deportivo: edad, peso, sexo, categoría, fotos de perfil y máximos de fuerza opcionales.</li>
            <li>Datos de suscripción: identificadores de cliente y estado de pago gestionados por Stripe.</li>
            <li>Datos técnicos: dirección IP, navegador, sistema operativo y logs básicos.</li>
          </ul>
        </Section>

        <Section title="3. Finalidades">
          <ul className="list-disc space-y-1 pl-5">
            <li>Prestarte el servicio de entrenamiento y personalizar los planes.</li>
            <li>Gestionar la autenticación (email o Google), la suscripción y el soporte.</li>
            <li>Enviar comunicaciones operativas (confirmaciones, avisos de soporte, cambios de suscripción).</li>
          </ul>
        </Section>

        <Section title="4. Base legal">
          <p>
            Tratamos tus datos para ejecutar el contrato (acceso al servicio), cumplir
            obligaciones legales (facturación), y en tu consentimiento cuando aplica
            (p.ej. inicio de sesión con Google).
          </p>
        </Section>

        <Section title="5. Proveedores que procesan tus datos">
          <ul className="list-disc space-y-1 pl-5">
            <li><strong>Supabase</strong> — autenticación, base de datos y almacenamiento de avatares.</li>
            <li><strong>Stripe</strong> — procesamiento de pagos y suscripciones.</li>
            <li><strong>Resend</strong> — envío de emails transaccionales.</li>
            <li><strong>Vercel</strong> — hosting de la aplicación.</li>
            <li><strong>Google</strong> — inicio de sesión (si eliges esa opción).</li>
          </ul>
          <p className="mt-2">
            Estos proveedores actúan como encargados del tratamiento y aplican sus
            propias garantías de seguridad y cumplimiento.
          </p>
        </Section>

        <Section title="6. Conservación">
          <p>
            Conservamos tus datos mientras mantengas la cuenta activa. Al eliminar la
            cuenta borramos tu perfil en un plazo máximo de 30 días, salvo los datos
            que la ley obliga a conservar (facturación, fiscal).
          </p>
        </Section>

        <Section title="7. Tus derechos">
          <p>
            Puedes ejercer los derechos de acceso, rectificación, supresión, oposición,
            limitación y portabilidad escribiendo a{' '}
            <a
              href="mailto:soporte@athlextraining.com"
              className="text-[var(--accent-green)] underline"
            >
              soporte@athlextraining.com
            </a>
            . También puedes reclamar ante la autoridad de control competente (en
            España, la AEPD).
          </p>
        </Section>

        <Section title="8. Cookies">
          <p>
            Usamos cookies técnicas necesarias para mantener la sesión iniciada. No
            usamos cookies publicitarias ni de análisis de terceros.
          </p>
        </Section>

        <Section title="9. Cambios">
          <p>
            Podemos actualizar esta política. Si hay cambios sustanciales te lo
            notificaremos por email o desde la app.
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
