# Bitácora360

App personal con tres módulos: hábitos y gym, finanzas personales y watchlist
de películas, series y libros. Next.js (App Router) + TypeScript + Tailwind CSS, con
Supabase (Postgres + Auth) como único backend.

## Preparación

```bash
npm install
```

Crea `.env.local` con los datos del proyecto de Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Sin esas variables la app carga, pero el inicio de sesión no funciona.

## Comandos

| Comando             | Qué hace                                             |
| ------------------- | ---------------------------------------------------- |
| `npm run dev`       | Servidor de desarrollo en `http://localhost:3000`    |
| `npm run lint`      | ESLint: reglas de Next.js y frontera entre módulos   |
| `npm run typecheck` | Revisa los tipos de TypeScript                       |
| `npm run build`     | Build de producción                                  |
| `npm run start`     | Sirve el build de producción                         |

`.github/workflows/ci.yml` corre `lint`, `typecheck` y `build` en cada push a
`main` y en cada pull request.

## Estructura

```
app/         Rutas: (auth) sin sesión y (dashboard) con sesión
features/    Un módulo por carpeta (habits, finance, watchlist), autocontenido
core/        Componentes, hooks y clientes de Supabase compartidos
supabase/    Migraciones SQL, configuración de la CLI y plantillas de correo
proxy.ts     Refresco de sesión y protección de rutas
```

Un módulo de `features/` no importa de otro: lo que comparten vive en `core/`.
ESLint hace cumplir esa regla.

## Base de datos

El esquema se versiona en `supabase/migrations/`, un archivo SQL por cambio.
Toda tabla lleva `user_id`, RLS activado y un `grant` a `authenticated`: el
navegador consulta Supabase directo y cada usuario solo ve sus filas.

```bash
npx supabase migration new <nombre>   # crea el archivo de la migración
npx supabase db push                  # la aplica al proyecto enlazado
```

## Pruebas

Las pruebas no viven en este repositorio, sino en dos proyectos hermanos:

- [`../Bitacora360-Automation-testing`](../Bitacora360-Automation-testing): E2E
  con Playwright, por el navegador.
- [`../Bitacora360-API-testing`](../Bitacora360-API-testing): API con
  Playwright, directo contra Supabase.

Un cambio en un texto, una pantalla o una migración casi siempre pide
actualizar alguna de las dos. El detalle de la arquitectura y las convenciones
está en [`CLAUDE.md`](./CLAUDE.md).
