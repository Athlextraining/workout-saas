-- 010_workout_templates_localized.sql
-- Wrap existing content under .es; .en starts null.
update public.workout_templates
set content = jsonb_build_object('es', content, 'en', null);

-- Document the new shape.
comment on column public.workout_templates.content is
  'JSONB shape: { es: WeekContent, en: WeekContent | null }. ES is canonical/required; EN may be null until seeded.';
