# Bitácora360

App personal con tres módulos independientes: hábitos/gym, finanzas
personales y watchlist de películas, series y libros. Next.js (App Router) +
TypeScript + Tailwind CSS, con Supabase como backend.

## Arquitectura modular

Cada carpeta dentro de `/features` (`habits`, `finance`, `watchlist`) es
**autocontenida**: agrupa sus propios componentes, hooks, tipos y
llamadas a datos. Un módulo de `/features` **no depende de otro módulo**
de `/features` — solo puede importar desde `/core`.

```
/app
  /(auth)/login
  /(auth)/register
  /(dashboard)/habits
  /(dashboard)/finance
  /(dashboard)/watchlist
/features
  /habits/{components,hooks}
  /finance/{components,hooks}
  /watchlist/{components,hooks}
/core
  /components   -> UI compartida entre módulos
  /lib          -> utilidades y clientes compartidos (cliente Supabase, fechas)
  /hooks        -> hooks compartidos entre módulos
```

`/app` solo contiene rutas (páginas y layouts) y compone lo que exponen
los módulos de `/features`; no debería contener lógica de negocio.

La frontera entre módulos la hace cumplir ESLint (`no-restricted-imports`
en `eslint.config.mjs`): un import de `features/habits` a `features/finance`,
o de `core` a cualquier módulo, hace fallar `npm run lint`. Los módulos se
leen de las carpetas de `/features`, así que uno nuevo queda cubierto solo.

## Comandos

```bash
npm run dev          # servidor de desarrollo en http://localhost:3000
npm run lint         # ESLint: reglas de Next.js y frontera entre módulos
npm run typecheck    # next typegen && tsc --noEmit: genera los tipos de rutas y revisa
npm run build        # build de producción
```

Antes de dar por terminado un cambio pasan los tres últimos.

## Convenciones de nombres

- Componentes: `PascalCase` (`HabitCard.tsx`).
- Hooks: prefijo `use` (`useHabits.ts`).
- Tipos de cada módulo: archivo `types.ts` dentro de ese módulo
  (`features/habits/types.ts`).
- Llamadas a datos de cada módulo: archivo `api.ts` dentro de ese módulo
  (`features/habits/api.ts`), que encapsula las queries a Supabase para
  ese módulo. Ningún otro módulo debe importar el `api.ts` de otro.

## Módulo de hábitos

Rutas: `/habits` (checklist diario y gestión de hábitos), `/habits/progress`
(rachas y gráficas) y `/habits/gym` (log de entrenamientos: series/reps/peso).
Los datos se cargan en el cliente con los hooks `useHabits` y `useWorkouts`.
Los días se manejan como strings `YYYY-MM-DD` en la zona horaria del usuario
(`core/lib/dates.ts`, compartido con finanzas), nunca como instantes UTC. Las
gráficas son SVG/CSS propios, sin librería de charts.

## Módulo de finanzas

Rutas: `/finance` (movimientos del mes: tarjetas, filtros y CRUD),
`/finance/budgets` (presupuestos por categoría con su barra de avance),
`/finance/summary` (comparativa con el mes anterior, gastos por categoría,
tendencia de 6 meses y regla 50/30/20) y `/finance/goals` (metas de ahorro y
sus aportes). Los datos se cargan en el cliente con `useTransactions`,
`useBudgets` y `useSavingsGoals`; los cálculos son funciones puras en
`features/finance/stats.ts`.

- **Mes seleccionado**: vive en la URL (`?month=YYYY-MM`, `useSelectedMonth`) y
  se conserva entre pestañas. Sin el parámetro, o con un mes futuro, es el mes
  actual. Como usa `useSearchParams`, el layout envuelve las pestañas y las
  páginas en `Suspense`.
- **Moneda y categorías**: una sola moneda (`CURRENCY`) y categorías fijas en
  `features/finance/constants.ts`. Se guarda la clave en inglés (`food`) y la
  migración la valida con un `check`; agregar una categoría requiere una
  migración además del cambio en `constants.ts`.
- **Presupuestos versionados**: cada fila de `budgets` rige desde su
  `effective_from` (día 1 de un mes) hasta que otra fila de la misma categoría
  la reemplaza. Editar el límite viendo un mes crea o actualiza la fila de ese
  mes, así que los meses anteriores conservan el suyo (`activeBudgets`).
  Eliminar un presupuesto borra todas sus versiones.
- **Estados de la barra**: "Cerca del límite" desde el 80 % y "Excedido" al
  pasar del 100 % (`budgetState`); el estado se muestra con ícono y texto, no
  solo con color.
- **Regla 50/30/20**: cada categoría de gasto es necesidad o gusto
  (`group` en `constants.ts`); el ahorro es lo que queda del ingreso. Las metas
  de ahorro se llevan aparte y un aporte no genera un movimiento.
- **Eliminar** siempre pasa por `core/components/ConfirmDialog.tsx` (un
  `<dialog>` nativo), nunca por `window.confirm`.

## Módulo de watchlist

Ruta: `/watchlist`. Películas, series y libros en una sola tabla
(`watchlist_items`, con `media_type`), cargados en el cliente con
`useWatchlist`; las funciones puras están en `features/watchlist/items.ts`.

- **Estados**: `pending` → `in_progress` → `done`, que se leen según el tipo
  ("Por ver / Viendo / Vista", "Por leer / Leyendo / Leído", en
  `constants.ts`). La lista se agrupa por estado y se filtra por tipo.
- **Terminado y calificación**: como un diario de Letterboxd simplificado. Solo
  un item terminado tiene `finished_on` (y todo terminado lo tiene) y solo él
  puede tener `rating`, de 1 a 5 estrellas enteras; la migración lo exige con
  dos `check`. Al cambiar de estado, `statusChange` pone la fecha de hoy o
  borra fecha y calificación.
- **Calificar** se hace desde la lista con `StarRating`, un grupo de radios
  ("3 estrellas"), y "Quitar" la borra.
- Los títulos repetidos se permiten a propósito (remakes, ediciones).

## Backend

Supabase (Postgres + Auth) es el único backend — no hay backend propio
(sin API routes de servidor propias salvo que sea estrictamente
necesario). Cada módulo habla con Supabase a través de su propio
`api.ts`, usando los clientes compartidos definidos en `/core/lib`:

- `core/lib/supabase-client.ts` — cliente para Client Components (browser).
- `core/lib/supabase-server.ts` — cliente para Server Components / route handlers.
- `core/lib/supabase-middleware.ts` — refresco de sesión y protección de rutas,
  usado desde `proxy.ts` en la raíz (el nombre que esta versión de Next.js da
  al antiguo `middleware.ts`).
- `core/lib/auth.ts` — helpers de autenticación (`signInWithPassword`,
  `signUpWithPassword`, `verifySignUpCode`, `resendSignUpCode`, `signOut`)
  usados por `/(auth)/login` y `/(auth)/register`.

### Confirmación de email al registrarse

El correo de confirmación lleva un código numérico y un enlace; cualquiera
de los dos activa la cuenta e inicia sesión. El largo del código (6 a 10
dígitos, hoy 8) se define en cada proyecto de Supabase, no en la app:

- Código: se escribe en el segundo paso de `/register` (`verifySignUpCode`).
- Enlace: apunta a `app/auth/confirm/route.ts`, el único route handler propio.
  Canjea el `token_hash` por una sesión en cookies y redirige a `/today`; si el
  enlace ya no sirve, redirige a `/login?error=confirmation_link`.

La plantilla del correo está en `supabase/templates/confirmation.html`
(referenciada desde `supabase/config.toml`). En los proyectos alojados no se
aplica sola: hay que pegarla en el dashboard (Authentication → Emails →
Confirm signup). El enlace usa `{{ .SiteURL }}`, así que el Site URL de cada
proyecto de Supabase debe apuntar a la URL de la app de ese entorno.

### Esquema de base de datos

Los cambios de esquema (tablas, políticas RLS) se versionan como archivos
SQL en `supabase/migrations/`, uno por cambio, con el prefijo de versión
que Supabase registra al aplicarlo (`20261001021358_habits_module.sql`).
Toda tabla lleva `user_id` y RLS activado: cada usuario solo ve y modifica
sus propias filas. Además de la política RLS, cada tabla necesita un
`grant select, insert, update, delete ... to authenticated`; sin él la
API responde "permission denied" aunque la política exista.

### Variables de entorno

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Configuradas en `.env.local` (excluido de git). Auth ya está conectado:
`/login` y `/register` usan Supabase Auth (email + password) y las rutas
de `/(dashboard)` (`/today`, `/habits`, `/finance`, `/watchlist`) están
protegidas por `proxy.ts` — redirigen a `/login` si no hay sesión.

## Testing

Las pruebas automatizadas **no viven en este repo**: están en dos
proyectos independientes, hermanos de esta carpeta. No agregues specs ni
dependencias de Playwright aquí.

- `../Bitacora360-Automation-testing` — E2E: prueba la app por el navegador.
- `../Bitacora360-API-testing` — API: prueba Supabase directo, sin navegador
  ni la app levantada.

### E2E

Hay una spec por módulo, agrupadas igual que las rutas de `/app`:

```
tests/auth/        -> app/(auth): login, registro, protección de rutas
tests/dashboard/   -> app/(dashboard): today, habits, finance, watchlist
tests/session/     -> logout
```

Los locators de esas pruebas usan roles y textos visibles (`getByRole`,
`getByLabel`), así que al cambiar un label, un `aria-label`, el texto de
un botón o un título de página hay que actualizar el page object
correspondiente en `../Bitacora360-Automation-testing/pages`. Las
convenciones y comandos están en el `README.md` de ese proyecto.

### API

Esas pruebas verifican el contrato que definen las migraciones de
`supabase/migrations/`: los `grant`, las políticas RLS y las restricciones
(`check`, llaves foráneas, índices únicos). Hay una carpeta por módulo de
`/features` y una spec por tabla (`tests/habits/habits.spec.ts`).

Al agregar o cambiar una migración hay que actualizar la spec de esa tabla
en `../Bitacora360-API-testing/tests`, y agregar cada tabla nueva a la
lista de `tests/auth/visitor-access.spec.ts`, que comprueba que ninguna se
puede leer sin sesión. Un módulo nuevo con tablas lleva además su carpeta y
su proyecto de Playwright; los pasos están en el `README.md` de ese
proyecto.
