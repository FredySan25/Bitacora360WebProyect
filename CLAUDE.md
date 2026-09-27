# Bitácora360

App personal con tres módulos independientes: hábitos/gym, finanzas
personales y watchlist de películas/series. Next.js (App Router) +
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
  /lib          -> utilidades y clientes compartidos (p. ej. cliente Supabase)
  /hooks        -> hooks compartidos entre módulos
```

`/app` solo contiene rutas (páginas y layouts) y compone lo que exponen
los módulos de `/features`; no debería contener lógica de negocio.

## Convenciones de nombres

- Componentes: `PascalCase` (`HabitCard.tsx`).
- Hooks: prefijo `use` (`useHabits.ts`).
- Tipos de cada módulo: archivo `types.ts` dentro de ese módulo
  (`features/habits/types.ts`).
- Llamadas a datos de cada módulo: archivo `api.ts` dentro de ese módulo
  (`features/habits/api.ts`), que encapsula las queries a Supabase para
  ese módulo. Ningún otro módulo debe importar el `api.ts` de otro.

## Backend

Supabase (Postgres + Auth) es el único backend — no hay backend propio
(sin API routes de servidor propias salvo que sea estrictamente
necesario). Cada módulo habla con Supabase a través de su propio
`api.ts`, usando los clientes compartidos definidos en `/core/lib`:

- `core/lib/supabase-client.ts` — cliente para Client Components (browser).
- `core/lib/supabase-server.ts` — cliente para Server Components / route handlers.
- `core/lib/supabase-middleware.ts` — refresco de sesión y protección de rutas,
  usado desde `middleware.ts` en la raíz.
- `core/lib/auth.ts` — helpers de autenticación (`signInWithPassword`,
  `signUpWithPassword`, `signOut`) usados por `/(auth)/login` y `/(auth)/register`.

### Variables de entorno

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Configuradas en `.env.local` (excluido de git). Auth ya está conectado:
`/login` y `/register` usan Supabase Auth (email + password) y las rutas
de `/(dashboard)` (`/habits`, `/finance`, `/watchlist`) están protegidas
por el middleware — redirigen a `/login` si no hay sesión.

## Testing

Pruebas automatizadas con Playwright, una spec por módulo, ubicada
dentro del propio módulo:

```
/features/habits/habits.spec.ts
/features/finance/finance.spec.ts
/features/watchlist/watchlist.spec.ts
```
