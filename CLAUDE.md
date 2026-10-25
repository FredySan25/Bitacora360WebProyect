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
  /about                  -> créditos y atribución de TMDB (pública)
  /api/watchlist/search   -> búsqueda del catálogo (route handler)
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

## Sistema de diseño

La dirección visual ya está fijada y toda pantalla nueva la sigue. No se
cambian paleta, tipografía, radios ni sombras salvo que se pida un rediseño
explícitamente.

- **Tokens**: la paleta "clean board" (neutros fríos y acento teal, con modo
  oscuro) vive en `app/globals.css` y se expone a Tailwind con `@theme`. Los
  colores se usan solo por token (`bg-paper`, `bg-paper-elevated`, `text-ink`,
  `text-ink-muted`, `text-accent`, `border-border`, `text-positive`,
  `text-warning`, `text-danger`, `series-income`/`series-expense`), nunca con hex
  sueltos ni la paleta por defecto de Tailwind (`gray-*`, `teal-*`…).
- **Tipografía**: Geist y Geist Mono, cargadas en `app/layout.tsx`.
- **Superficies**: las tarjetas usan `rounded-2xl`, `bg-paper-elevated` y
  `shadow-card`; los fondos de bitácora, `.bg-notebook-lines`.
- **Componentes**: antes de crear estilos se reutiliza lo de `core/components/`
  (`PageHeader`, `ModuleCard`, `TextField`, `SelectField`, `SubmitButton`,
  `FormAlert`, `ConfirmDialog`, `icons.tsx` y las clases de `buttonStyles.ts`).
- **Accesibilidad**: un estado se comunica con ícono y texto, no solo con color;
  todo control conserva el foco visible de `globals.css`.
- **Skill `frontend-design`**: está habilitado para este proyecto. Sus criterios
  (jerarquía, espaciado, movimiento con moderación) se aplican dentro de este
  sistema; su búsqueda de una identidad visual nueva solo aplica a un
  rediseño pedido explícitamente. Puede cambiar clases de Tailwind, layout,
  espaciado y animaciones, pero no los textos visibles (su consejo de
  redacción no aplica al pulido visual) ni lo que lista la sección E2E de
  Testing.

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
- **Catálogo**: el campo de título (`TitleCombobox`) sugiere resultados de TMDB
  (películas y series) o de Google Books, con Open Library de respaldo cuando
  Google falla o no encuentra nada (libros). Elegir uno guarda `poster_url`,
  `release_year`, `catalog_source` y `catalog_id`. Es opcional: un título escrito a
  mano no tiene ninguna de las cuatro. Cambiar el tipo o "Quitar del catálogo" borra el
  vínculo. La migración exige que el `source` y el `id` vayan juntos, que el
  catálogo corresponda al tipo y que el póster sea https de uno de los tres hosts
  de imágenes (los mismos de `images.remotePatterns` en `next.config.ts` y de
  `catalog/normalize.ts`). Agregar un catálogo requiere migración.
- **Búsqueda**: el navegador llama a `app/api/watchlist/search/route.ts`, que
  exige sesión y delega en `features/watchlist/catalog/search.ts`. Ese código es
  solo de servidor porque lee las keys; ningún componente de cliente lo importa.
  El idioma de los resultados es `CATALOG_LANGUAGE` (`es-MX`) en `constants.ts`.
- **Pósters**: `Poster` usa `next/image` con `unoptimized`, porque los catálogos
  ya sirven el tamaño justo. Sin póster, o si la imagen falla, muestra un marcador.
  La lista es una cuadrícula de tarjetas.
- **Atribución**: TMDB es gratis para uso no comercial si se muestra su logo y su
  aviso. Los dos están en `/about` (`app/about/page.tsx`, pública), enlazada desde
  la barra lateral, el pie del dashboard en el celular y el pie de la watchlist.
  No se quitan: si la app llegara a cobrar o a mostrar anuncios, haría falta una
  licencia comercial de TMDB.

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
- Enlace: apunta a `app/auth/confirm/route.ts`, uno de los dos route handlers
  propios (el otro es la búsqueda del catálogo de la watchlist).
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
- `TMDB_READ_ACCESS_TOKEN`: solo de servidor, para la búsqueda de películas y series.
- `GOOGLE_BOOKS_API_KEY`: solo de servidor y opcional. Sin restricción de
  referer, porque la consulta sale del servidor.

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

Los page objects de `../Bitacora360-Automation-testing/pages` ubican la
interfaz por roles, textos y estructura HTML. Estas cosas no se cambian
salvo que se pida, venga el cambio de donde venga:

- Textos visibles, `label`, `aria-label` y el `alt` de las imágenes. Viven en
  `support/locales/es.ts` del proyecto E2E; si un cambio pedido los toca, se
  actualizan ahí.
- Roles y elementos nativos: `form`, `section`, `details/summary`,
  `figcaption`, `dialog`, `button[type="submit"]`, el `label` que envuelve
  cada estrella de la watchlist, `optgroup`, y los headings con su nivel.
  También `aside` (la barra lateral), `nav` con su `aria-label`,
  `fieldset/legend` (los grupos se ubican por su leyenda), `select` nativo,
  `ul/li` en las listas, `dl/dt/dd` en las tarjetas de `/today`, `table` con
  `th scope="row"`, los `role` explícitos (`group`, `img`, `progressbar`,
  `status`, `alert`) y los `<p>` que se ubican como párrafo: el mes del
  selector de finanzas y las etiquetas de las cifras de `/habits/progress`.
- Orden y cantidad: en `/habits`, `/login` y cada paso de `/register` hay un
  solo `<form>`, y en `/habits` un solo `<details>`; las tarjetas de resumen
  de finanzas son un `group` con sus párrafos en este orden: etiqueta, monto
  y, si la vista lo muestra, detalle; el `dialog` de confirmación tiene un
  solo heading y un solo párrafo; en la tarjeta de watchlist de `/today`, la
  línea "y N más" es un `li` más de la lista; las columnas de la tabla de
  progreso de hábitos y el orden de las filas de las listas se mantienen.

Si un cambio pedido rompe algo de esta lista, se actualiza el page object en
el mismo cambio. Después de tocar una pantalla se corre su spec desde ese
proyecto (por ejemplo `npx playwright test tests/dashboard/habits.spec.ts`)
y se informa el resultado. Las convenciones y comandos están en el
`README.md` de ese proyecto.

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
