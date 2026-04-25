# Message Namespaces

Keep this file in sync as namespaces are added. It's a navigation aid, not enforced.

## Top-level namespaces

| Namespace | Used by | Notes |
|---|---|---|
| `common` | Shared buttons, generic CTAs, error messages | "Cargar más", "Aceptar", "Cancelar", "Error inesperado" |
| `nav` | `app/[locale]/navbar.tsx`, `nav-menu.tsx` | Brand, menu labels |
| `home` | `app/[locale]/page.tsx` | Landing hero, FAQ, footer |
| `queEsAthx` | `app/[locale]/que-es-athx/page.tsx` | Article copy |
| `privacy` | `app/[locale]/privacidad/page.tsx` | Legal |
| `terms` | `app/[locale]/terminos/page.tsx` | Legal |
| `login` | `app/[locale]/login/page.tsx` | Auth form |
| `onboarding` | `app/[locale]/onboarding/page.tsx` | Wizard steps |
| `bienvenida` | `app/[locale]/bienvenida/page.tsx` | Post-checkout tour |
| `entrenamiento` | `app/[locale]/entrenamiento/page.tsx`, `subscribe-button.tsx`, `week-view.tsx` | Workout UI chrome |
| `perfil` | `app/[locale]/perfil/*.tsx` | Profile labels |
| `preguntanos` | `app/[locale]/preguntanos/**/*.tsx` | Support pages |
| `support` | `src/modules/support/ui/**` | Reusable support UI |
| `admin` | `app/[locale]/admin/**/*.tsx` | Admin labels |
| `language` | `src/shared/i18n/components/language-switcher.tsx` | Switcher labels |
| `emails` | (Phase 3) | Reserved |

## Style rules

- Keys camelCase, segments dot-separated.
- Use ICU plural/select syntax — never string concatenation.
- Reusable cross-route strings → `common.*`.
- ARIA labels under `<ns>.a11y.*`.
- Error messages under `<ns>.errors.*`.
