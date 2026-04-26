import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import createMiddleware from 'next-intl/middleware';
import { routing, getPathname } from '@/shared/i18n/routing';
import { detectLocaleFromAcceptLanguage, isBot } from '@/shared/i18n/locale-detect';

const intlMiddleware = createMiddleware({
  ...routing,
  localeDetection: false,
});

function buildLocalizedUrl(
  href: '/login' | '/entrenamiento' | '/onboarding',
  locale: 'es' | 'en',
  origin: string,
) {
  const path = getPathname({ href, locale });
  return new URL(path, origin);
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isApi = path.startsWith('/api');
  const isAuth = path.startsWith('/auth');
  const isAsset = path.startsWith('/_next') || path.includes('.');

  if (isApi || isAuth || isAsset) {
    return NextResponse.next();
  }

  const url = request.nextUrl;
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  const ua = request.headers.get('user-agent');
  const acceptLang = request.headers.get('accept-language');

  const urlHasEnPrefix = url.pathname === '/en' || url.pathname.startsWith('/en/');
  let effectiveLocale: 'es' | 'en';
  if (urlHasEnPrefix) {
    effectiveLocale = 'en';
  } else if (cookieLocale === 'es' || cookieLocale === 'en') {
    effectiveLocale = cookieLocale;
  } else if (isBot(ua)) {
    effectiveLocale = 'es';
  } else {
    effectiveLocale = detectLocaleFromAcceptLanguage(acceptLang);
  }

  if (
    !urlHasEnPrefix &&
    !cookieLocale &&
    !isBot(ua) &&
    effectiveLocale === 'en'
  ) {
    const newUrl = new URL(url);
    newUrl.pathname = '/en' + (url.pathname === '/' ? '' : url.pathname);
    const redirect = NextResponse.redirect(newUrl);
    redirect.cookies.set('NEXT_LOCALE', 'en', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
    return redirect;
  }

  const intlResponse = intlMiddleware(request);
  if (intlResponse.headers.get('location')) {
    return intlResponse;
  }

  if (!cookieLocale) {
    intlResponse.cookies.set('NEXT_LOCALE', effectiveLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }

  let response = intlResponse;
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          // Do NOT replace response — intlResponse carries the locale rewrite
          // headers that Next.js needs to resolve /  → app/[locale]/page.tsx.
          // Just set the new auth cookies on the existing response.
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const onboardingCompleted = user?.user_metadata?.onboarding_completed === true;
  const origin = request.nextUrl.origin;

  const canonicalPath = urlHasEnPrefix
    ? path.replace(/^\/en/, '') || '/'
    : path;

  if (!user) {
    if (canonicalPath.startsWith('/perfil') || canonicalPath.startsWith('/onboarding')) {
      return NextResponse.redirect(buildLocalizedUrl('/login', effectiveLocale, origin));
    }
    return response;
  }

  if (canonicalPath === '/login') {
    const dest = onboardingCompleted ? '/entrenamiento' : '/onboarding';
    return NextResponse.redirect(buildLocalizedUrl(dest, effectiveLocale, origin));
  }
  if (!onboardingCompleted && !canonicalPath.startsWith('/onboarding')) {
    return NextResponse.redirect(buildLocalizedUrl('/onboarding', effectiveLocale, origin));
  }
  if (onboardingCompleted && canonicalPath.startsWith('/onboarding')) {
    return NextResponse.redirect(buildLocalizedUrl('/entrenamiento', effectiveLocale, origin));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|auth|_next|.*\\..*).*)'],
};
