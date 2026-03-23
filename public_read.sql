-- =============================================================
-- DisciplineMode — Lectura pública anónima
-- Ejecuta esto en Supabase → SQL Editor
-- Permite que cualquiera con el link /publico vea los datos
-- SIN poder escribir, editar ni eliminar nada.
-- =============================================================

-- Lectura anónima en la tabla members
create policy "Lectura pública de members"
  on public.members for select
  to anon
  using (true);

-- Lectura anónima en la tabla weigh_ins
create policy "Lectura pública de weigh_ins"
  on public.weigh_ins for select
  to anon
  using (true);

-- ⚠️  NOTA: Las políticas de INSERT/UPDATE solo aplican
--     al rol "authenticated", así que los anónimos
--     jamás podrán escribir aunque lo intenten.
