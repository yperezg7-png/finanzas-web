# Finanzas Web

Frontend del sistema de finanzas personales, desarrollado con React y JavaScript. Permite registrarse, iniciar sesión y administrar egresos con filtros por año y mes, categorías, subcategorías y validaciones del backend.

Este repositorio contiene exclusivamente el frontend. El backend Laravel se administra en **otro repositorio**, con sus propios requisitos, instalación y README. No ejecutes Composer ni migraciones dentro de este proyecto.

## Requisitos y versiones

Entorno comprobado:

- Node.js **24.19.0**.
- npm **11.17.0**.
- Git para clonar el repositorio.
- Backend Laravel instalado y ejecutándose según el README de su repositorio.

Dependencias instaladas: React y React DOM **19.3.1**, Vite **8.3.5**, Tailwind CSS **4.3.3**, React Router DOM **7.18.4** y componentes shadcn/ui (CLI **4.22.1**). `package-lock.json` fija las versiones reproducibles; usa `npm ci`.

Vite requiere Node.js `^20.19.0 || >=22.12.0`; para reproducir el entorno utiliza la versión de Node.js indicada arriba.

Comprueba tu instalación:

```powershell
node --version
npm --version
git --version
```

## Instalación desde cero

Sustituye todos los marcadores entre `<` y `>` antes de ejecutar los ejemplos.

```powershell
git clone <URL_REPOSITORIO_FRONTEND> finanzas-web
cd finanzas-web
npm ci
```

Instala y arranca el backend por separado siguiendo su README. Ambos servidores deben estar disponibles para probar la aplicación completa.

## Configurar la URL de la API

Desde la raíz del frontend, junto a `package.json`, copia la plantilla:

```powershell
Copy-Item .env.example .env.local
```

En macOS o Linux, el comando equivalente es `cp .env.example .env.local`.

Edita `.env.local` y reemplaza el marcador por la URL pública de tu backend, incluyendo el prefijo `/api`:

```dotenv
VITE_API_URL=<URL_BASE_BACKEND_CON_PREFIJO_API>
```

No agregues `/egresos`, `/login` u otro endpoint al valor: el cliente agrega cada ruta. El `.env.local` del frontend es independiente del `.env` de Laravel y está excluido de Git mediante `*.local`.

Vite expone las variables con prefijo `VITE_` a través de:

```js
import.meta.env.VITE_API_URL
```

No se utiliza `process.env` en el código del navegador. Los valores se leen como texto. Reinicia el servidor de desarrollo después de cambiar `.env.local`.

**ADVERTENCIA: las variables `VITE_` se incrustan en los archivos del build y son públicas para cualquiera que descargue la aplicación. Nunca incluyas contraseñas, claves privadas, credenciales de base de datos, tokens ni otros secretos.** Cambiar estas variables después de generar el build requiere volver a compilar y desplegar los archivos nuevos.

La URL de la API es configuración pública. En un despliegue HTTPS, utiliza también HTTPS para la API. Laravel debe permitir mediante CORS el origen del frontend y las solicitudes con `Authorization` y `Content-Type`.

## Servidor de desarrollo

```powershell
npm run dev
```

Abre la dirección que Vite imprime junto a `Local` y mantén la terminal abierta. Para detenerlo, presiona `Ctrl+C`.

La interfaz se abre en el servidor de Vite, no en la ruta `/api` de Laravel. Esa ruta base puede devolver 404 aunque los endpoints funcionen.

Rutas disponibles:

| Ruta | Acceso | Contenido |
| --- | --- | --- |
| `/login` | Público | Inicio de sesión |
| `/registro` | Público | Registro |
| `/` | Protegido | Pantalla inicial del dashboard |
| `/ingresos` | Protegido | Pantalla base; gestión pendiente |
| `/egresos` | Protegido | Listado, filtros, creación, edición y eliminación |

Registra una cuenta o inicia sesión con un usuario del backend configurado. Durante la recuperación de sesión se muestra un indicador de carga hasta validar el token con `/api/user`.

El cliente centralizado está en `src/lib/api.js`. Usa un token Bearer guardado como `auth_token` en `localStorage` y lo elimina al recibir 401. Este almacenamiento persiste al recargar, pero puede ser leído por JavaScript y es vulnerable ante XSS. No lo uses para almacenar contraseñas.

## Verificación

```powershell
npm run lint
npm run build
```

Para comprobar la integración, con el backend activo:

1. Registra una cuenta o inicia sesión.
2. Recarga una ruta protegida y comprueba que se conserva la sesión sin mostrar brevemente el login.
3. Abre egresos, crea un registro usando una categoría disponible y prueba sus filtros.
4. Edita un registro y verifica los errores por campo que devuelve Laravel al enviar datos inválidos.
5. Cancela una eliminación para comprobar que se conserva el registro; confirma solo sobre un registro de prueba.
6. Cierra sesión y verifica que las rutas protegidas redirigen al login.

Las categorías y subcategorías proceden del backend. Si no existen categorías de egreso disponibles, configúralas desde el backend antes de registrar movimientos.

## Build de producción

Configura `VITE_API_URL` con la dirección pública del backend de producción antes de compilar. Puedes definirla en el entorno de tu plataforma de compilación o en `.env.production.local`. No incluyas secretos.

```powershell
npm ci
npm run build
```

Los archivos listos para publicar se generan en `dist/`. Para revisarlos localmente:

```powershell
npm run preview
```

Abre la dirección que imprime la terminal. `preview` sirve para revisar el build; no sustituye un servidor de producción.

Publica el contenido de `dist/` en un alojamiento de archivos estáticos. Como se usa `BrowserRouter`, configura el servidor para devolver `index.html` en las rutas del frontend que no correspondan a archivos, como `/egresos` o `/registro`. Sin esta regla, recargar una ruta interna puede producir un 404. Conserva el servicio del backend por separado.

## Problemas frecuentes

- **No se puede acceder al frontend:** ejecuta `npm run dev` en este repositorio y utiliza la dirección exacta que imprime Vite.
- **No se pudo conectar con el servidor:** comprueba que Laravel esté activo, la URL configurada sea correcta y CORS permita el origen del frontend.
- **Cambiaste la URL y sigue usando la anterior:** reinicia Vite; si publicaste un build, vuelve a compilarlo y desplegarlo.
- **401:** la sesión no es válida o expiró; inicia sesión de nuevo.
- **422:** revisa los mensajes debajo de los campos; las reglas de validación pertenecen a Laravel.
