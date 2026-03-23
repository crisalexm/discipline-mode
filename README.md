# DisciplineMode 💪

Web app de seguimiento de pérdida de peso para grupos de WhatsApp.

**Stack:** React + Vite · Tailwind CSS · Supabase · Recharts · Vercel

---

## Setup local

### 1. Clonar e instalar

```bash
git clone <repo-url>
cd discipline-mode
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de Supabase:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### 3. Crear la base de datos en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto
2. Abre el **SQL Editor**
3. Copia y ejecuta el contenido de `schema.sql`
4. (Opcional) Ejecuta `seed.sql` para cargar datos de prueba

### 4. Ejecutar localmente

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

---

## Deploy en Vercel

### Opción A — CLI

```bash
npm install -g vercel
vercel
```

### Opción B — GitHub

1. Sube el proyecto a GitHub
2. Ve a [vercel.com](https://vercel.com) → **New Project** → importa el repo
3. Agrega las variables de entorno:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy ✓

> El archivo `vercel.json` ya está configurado para manejar rutas SPA.

---

## Estructura del proyecto

```
src/
├── components/
│   ├── Avatar.jsx          # Avatar con iniciales
│   └── Layout.jsx          # Navegación (sidebar + bottom nav)
├── context/
│   └── AuthContext.jsx     # Auth con Supabase
├── hooks/
│   ├── useMembers.js       # CRUD miembros
│   └── useWeighIns.js      # CRUD pesajes
├── lib/
│   ├── supabase.js         # Cliente Supabase
│   └── utils.js            # Cálculos (IMC, progreso, semanas)
└── pages/
    ├── LoginPage.jsx
    ├── DashboardPage.jsx   # Ranking + stats
    ├── ChartPage.jsx       # Gráfico de líneas grupal
    ├── MembersPage.jsx     # Lista + agregar miembros
    ├── MemberDetailPage.jsx # Historial individual
    └── RegisterWeighInPage.jsx
```

---

## Funcionalidades

| Feature | Descripción |
|---|---|
| 🏆 Ranking semanal | Ordenado por kg perdidos, con badges motivacionales |
| 📈 Gráfico grupal | Recharts LineChart con toggle por miembro |
| 👤 Detalle individual | Historial, gráfico, racha, IMC por semana |
| ⚖️ Registro de peso | Formulario con cálculo automático de semana |
| 🎯 Progreso a la meta | Barra de progreso visual con % completado |
| 🔢 IMC | Cálculo automático con categorías |
| 🔐 Auth | Supabase Auth email + password |
| 📱 Mobile-first | Bottom nav en móvil, sidebar en desktop |

---

## Datos del grupo

- **Fecha de inicio:** 09 de marzo de 2026
- **Semana 0:** Pesaje base (09-03-2026)
- **Semana 2:** Primer corte real (23-03-2026)
- **Meta mínima grupal:** -1.8 kg en las primeras 2 semanas
