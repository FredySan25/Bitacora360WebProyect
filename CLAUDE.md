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
`api.ts`, usando un cliente compartido definido en `/core/lib`.

### Variables de entorno (pendientes, no configuradas aún)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Estas variables se agregarán en una sesión futura, junto con la
integración de Supabase Auth. Por ahora el proyecto no tiene backend
conectado.

## Testing

Pruebas automatizadas con Playwright, una spec por módulo, ubicada
dentro del propio módulo:

```
/features/habits/habits.spec.ts
/features/finance/finance.spec.ts
/features/watchlist/watchlist.spec.ts
```
