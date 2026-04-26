export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'es';

export const pathnames = {
  '/': '/',
  '/entrenamiento': {
    es: '/entrenamiento',
    en: '/training',
  },
  '/perfil': {
    es: '/perfil',
    en: '/profile',
  },
  '/preguntanos': {
    es: '/preguntanos',
    en: '/contact',
  },
  '/preguntanos/nuevo': {
    es: '/preguntanos/nuevo',
    en: '/contact/new',
  },
  '/preguntanos/[id]': {
    es: '/preguntanos/[id]',
    en: '/contact/[id]',
  },
  '/que-es-athx': {
    es: '/que-es-athx',
    en: '/what-is-athx',
  },
  '/privacidad': {
    es: '/privacidad',
    en: '/privacy',
  },
  '/terminos': {
    es: '/terminos',
    en: '/terms',
  },
  '/cookies': '/cookies',
  '/bienvenida': {
    es: '/bienvenida',
    en: '/welcome',
  },
  '/login': '/login',
  '/onboarding': '/onboarding',
  '/admin/mensajes': {
    es: '/admin/mensajes',
    en: '/admin/messages',
  },
  '/admin/mensajes/[id]': {
    es: '/admin/mensajes/[id]',
    en: '/admin/messages/[id]',
  },
} as const;

export type AppPathname = keyof typeof pathnames;
