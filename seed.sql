-- =============================================================
-- DisciplineMode - Seed Data (6 miembros ficticios)
-- Fecha de inicio del grupo: 09-03-2026
-- Semana 0 = 09-03-2026 (pesaje base)
-- Semana 2 = 23-03-2026 (primer corte real)
-- =============================================================

-- IMPORTANTE: Ejecuta esto en el SQL Editor de Supabase DESPUÉS
-- de haber corrido schema.sql y haber creado al menos un usuario.

-- -------------------------------------------------------
-- Insert members
-- -------------------------------------------------------
insert into public.members (id, name, height_cm, initial_weight_kg, goal_weight_kg) values
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Carlos Mendoza',  175.0, 98.5,  80.0),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Miguel Torres',   172.0, 102.0, 85.0),
  ('a1b2c3d4-0003-0003-0003-000000000003', 'Andrés Ríos',     170.0, 95.0,  78.0),
  ('a1b2c3d4-0004-0004-0004-000000000004', 'Juan Vásquez',    168.0, 91.5,  75.0),
  ('a1b2c3d4-0005-0005-0005-000000000005', 'Diego Castillo',  173.0, 105.0, 88.0),
  ('a1b2c3d4-0006-0006-0006-000000000006', 'Sebastián Luna',  169.0, 93.0,  77.0)
on conflict (id) do nothing;

-- -------------------------------------------------------
-- Semana 0 — pesaje inicial (09-03-2026)
-- -------------------------------------------------------
insert into public.weigh_ins (member_id, weight_kg, weigh_in_date, week_number, notes) values
  ('a1b2c3d4-0001-0001-0001-000000000001', 98.5,  '2026-03-09', 0, 'Pesaje inicial'),
  ('a1b2c3d4-0002-0002-0002-000000000002', 102.0, '2026-03-09', 0, 'Pesaje inicial'),
  ('a1b2c3d4-0003-0003-0003-000000000003', 95.0,  '2026-03-09', 0, 'Pesaje inicial'),
  ('a1b2c3d4-0004-0004-0004-000000000004', 91.5,  '2026-03-09', 0, 'Pesaje inicial'),
  ('a1b2c3d4-0005-0005-0005-000000000005', 105.0, '2026-03-09', 0, 'Pesaje inicial'),
  ('a1b2c3d4-0006-0006-0006-000000000006', 93.0,  '2026-03-09', 0, 'Pesaje inicial');

-- -------------------------------------------------------
-- Semana 2 — primer corte real (23-03-2026)
-- -------------------------------------------------------
insert into public.weigh_ins (member_id, weight_kg, weigh_in_date, week_number, notes) values
  ('a1b2c3d4-0001-0001-0001-000000000001', 96.3,  '2026-03-23', 2, 'Buen inicio, mucho cardio'),
  ('a1b2c3d4-0002-0002-0002-000000000002', 100.0, '2026-03-23', 2, 'Complicado con el trabajo'),
  ('a1b2c3d4-0003-0003-0003-000000000003', 93.1,  '2026-03-23', 2, null),
  ('a1b2c3d4-0004-0004-0004-000000000004', 89.5,  '2026-03-23', 2, 'Bajé bien!'),
  ('a1b2c3d4-0005-0005-0005-000000000005', 103.2, '2026-03-23', 2, null),
  ('a1b2c3d4-0006-0006-0006-000000000006', 91.4,  '2026-03-23', 2, 'Salidas el fin de semana');
