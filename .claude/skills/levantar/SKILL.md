---
name: levantar
description: Levanta el servidor de desarrollo de Bitácora360 (Next.js) y abre la app en el navegador. Úsala cuando el usuario pida levantar, correr, arrancar, iniciar o abrir el proyecto/la app, o escriba /levantar.
---

# Levantar Bitácora360

Sigue estos pasos en orden. La app corre en http://localhost:3000.

1. **¿Ya está corriendo?** Revisa si algo responde en `http://localhost:3000`
   (por ejemplo con `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`).
   Si responde, NO levantes otro servidor: salta directo al paso 5.

2. **Dependencias.** Si no existe la carpeta `node_modules`, corre `npm install`.

3. **Variables de entorno.** Si no existe `.env.local`, avísale al usuario que
   faltan `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (el login
   no va a funcionar sin ellas), pero continúa.

4. **Arrancar el servidor.** Corre `npm run dev` **en segundo plano**
   (`run_in_background`) y espera a que la salida diga `Ready`. Si aparece un
   error, muéstraselo al usuario y detente.

5. **Abrir el navegador.** Intenta abrir Chrome buscando `chrome.exe` en:
   - `%ProgramFiles%\Google\Chrome\Application\`
   - `%ProgramFiles(x86)%\Google\Chrome\Application\`
   - `%LOCALAPPDATA%\Google\Chrome\Application\`

   Si no está, abre la URL en el navegador predeterminado
   (`Start-Process "http://localhost:3000"` en PowerShell) y díselo al usuario.

6. **Resumen corto** para el usuario: la URL, en qué navegador se abrió y que el
   servidor queda corriendo en segundo plano hasta que pida detenerlo.
