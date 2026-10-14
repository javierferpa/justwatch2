# JustWatch2

Aplicación personal y no comercial para descubrir películas y series, consultar dónde verlas por país y guardar una lista para después. Interfaz en español, adaptable a móvil y escritorio, construida con Angular 22.

**Web:** [javierferpa.github.io/justwatch2](https://javierferpa.github.io/justwatch2/)

## Qué puedes hacer

- Explorar el catálogo completo de TMDB, tendencias semanales, películas y series.
- Buscar por título y compartir la búsqueda mediante la URL.
- Filtrar películas y series por género y plataforma, y ordenar por popularidad, valoración o fecha.
- Consultar suscripción, opciones gratuitas, alquiler y compra en el país elegido.
- Ver sinopsis, reparto, puntuación y tráiler oficial cuando esté disponible.
- Guardar títulos en «Mi lista», conservada en el navegador.
- Recuperarte de errores de conexión, datos ausentes y enlaces incorrectos.

El catálogo completo está activo al abrir la web. Los visitantes no necesitan cuenta ni token. España es el país inicial. En Ajustes puedes elegir otro país, comprobar una consulta real al catálogo o activar una selección de ejemplo de 20 títulos, sin disponibilidad simulada.

## Arquitectura y credenciales

    Navegador → servidor de catálogo de JustWatch2 → API de TMDB
                    secreto en el servidor

GitHub Pages sirve únicamente la interfaz estática. El navegador solicita metadatos al [servidor de catálogo](https://justwatch2-catalog-api.politewasp1025.chatgpt.site) alojado en Sites. El servidor añade el token al consultar TMDB; nunca lo entrega al navegador ni lo incorpora al paquete de Pages.

- **TMDB_READ_ACCESS_TOKEN** está guardado como **GitHub Actions repository secret** y como **runtime secret de Sites**. GitHub conserva la copia; el servidor utiliza la de Sites. GitHub Secrets no ofrece ejecución de servidor a Pages.
- La CI no lee el secreto ni lo inserta en el build. **core/api.config.ts** contiene exclusivamente la URL pública del servidor.
- **api/worker/index.js** contiene el código del servidor. Solo permite GET de descubrimiento, búsqueda, fichas y proveedores; rechaza operaciones de cuenta, autenticación, escrituras, URL arbitrarias y credenciales suministradas por visitantes.
- Valida las consultas, limita tiempos y tamaños de respuesta y rechaza redirecciones antes de reenviar la credencial.
- La caché de metadatos dura 5 minutos y la de proveedores 15. No conserva las búsquedas en esa caché. Sus límites por IP y concurrencia son por instancia del servidor, no una cuota global ni autenticación. El encabezado Origin puede falsificarse fuera de un navegador.
- Los errores entregan mensajes genéricos. Los diagnósticos de aplicación no registran credenciales ni el texto de excepciones. El proveedor de alojamiento puede conservar registros de peticiones, incluida la URL de búsqueda.
- La versión nueva elimina valores antiguos de **jw2.token** del almacenamiento del navegador, conservando la lista y el país.

**Credencial histórica:** el proyecto original ya incluía una credencial en el código y los paquetes publicados. Se ha eliminado del código y del build actuales y se ha regenerado para esta publicación. La copia histórica permanece en commits antiguos, pero TMDB la rechaza con 401. La nueva credencial está únicamente en los almacenes de secretos. Para futuras rotaciones, renueva la clave en los [ajustes de TMDB](https://www.themoviedb.org/settings/api), actualiza ambos secretos y vuelve a desplegar el servidor. No copies una clave nueva en un archivo, commit, formulario de la app o conversación.

La lista y el país se guardan localmente. No hay cuentas, sincronización ni telemetría propia de JustWatch2. El navegador solicita imágenes a TMDB y tipografías a Google Fonts; la búsqueda pasa por Sites y TMDB. Sus políticas de privacidad siguen siendo aplicables.

## Coste y límites

Esta configuración usa servicios incluidos o gratuitos, sin contratar alojamiento, dominio ni plan adicional:

- [TMDB](https://developer.themoviedb.org/docs/faq): API gratuita para uso no comercial con atribución. No equivale a una licencia comercial ni a peticiones ilimitadas.
- [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages) y [Actions](https://docs.github.com/en/billing/concepts/product-billing/github-actions): repositorio público y runners estándar. La CI no usa runners grandes, caché de Actions ni sube artefactos adicionales.
- [Sites](https://help.openai.com/en/articles/20001339-creating-and-using-chatgpt-sites): durante la beta pública, el uso está incluido en el plan de ChatGPT hasta sus límites. Al alcanzarlos puede limitarse la publicación; las condiciones pueden cambiar. Se utiliza el plan ya disponible, sin activar ampliaciones de pago.

Condiciones consultadas el 14 de octubre de 2026. No se garantiza gratuidad perpetua, disponibilidad ilimitada ni una cuota numérica de Sites que su documentación no publica.

## Desarrollo y verificación

Recomendado: Node 24 LTS, versión 24.15 o superior. También son compatibles Node 22.22.3+ dentro de Node 22 y Node 26+.

    npm ci
    npm start

Abre http://127.0.0.1:4200. El servidor público restringe CORS al origen de Pages; en local usa la selección de ejemplo desde Ajustes o un proxy local. Para desarrollo contra datos reales puedes sustituir **CATALOG_API_BASE** por un servidor local de confianza que ejecute el Worker con su secreto en el entorno; no insertes el token en Angular. No amplíes la audiencia de producción para pruebas locales.

    npm run check
    npm audit

**check** ejecuta las pruebas Angular y del servidor, compila producción y comprueba que no haya JWT ni credenciales de GitHub en los archivos fuente o generados. Este control es acotado, no una auditoría completa de secretos.

Las pruebas no usan claves reales ni la red. Cubren navegación, identidades de películas/series, filtros, paginación, errores, almacenamiento bloqueado o corrupto, migración de credenciales y las fronteras del servidor: secreto, endpoints, CORS, consultas, redirecciones, caché, concurrencia y límites. Para iterar: **npm run test:watch** o **npm run test:api**.

Comprobación en la web publicada:

- Inicio → guardar un título → Mi lista → recargar → quitarlo.
- Películas/Series → género/plataforma/ordenación → ficha → volver.
- Buscar un título fuera de los ejemplos y una búsqueda sin resultados.
- Cambiar el país → comprobar proveedores y enlaces del país.
- Ajustes → Comprobar conexión; probar fallo de servicio y ruta inválida.
- Verificar en la red del navegador que ninguna petición lleva Authorization ni api_key.
- Repetir en móvil, con teclado y movimiento reducido.

## Publicación y mantenimiento

GitHub Pages sirve **docs** de **master**. Las rutas con # permiten recargas y enlaces directos bajo /justwatch2/.

    npm run build:pages

El comando sustituye exclusivamente **docs/**, incluye .nojekyll y 404.html y no genera SSR. Incluye el build en el mismo commit que el código antes del push. La CI comprueba que el paquete corresponde al código, sin acceder al secreto.

El backend se publica por separado con Sites. Su proyecto existente es **appgprj_6acf47fcca7c819190d120bcb8eb4c28**. Reutilízalo: copia el Worker revisado al checkout de fuente de ese Site, valida el artefacto ESM, guarda y publica exactamente el commit subido. Un push a este repositorio GitHub no despliega por sí solo el backend. Después de cambiar el secreto de Sites, despliega una versión guardada para aplicar la revisión del entorno. Verifica una consulta anónima de catálogo desde el origen de Pages; **/api/health** solo informa de que el secreto está configurado.

## Límites del producto y créditos

- Las peticiones del cliente se cancelan al cambiar filtros o ruta. «Descubrir más» evita cargas simultáneas y termina al agotar páginas.
- Los filtros de plataforma consultan suscripción/gratis/anuncios; las fichas separan además alquiler y compra.
- La búsqueda utiliza los endpoints de búsqueda, por lo que no muestra filtros de descubrimiento.
- La disponibilidad procede de JustWatch a través de TMDB. No garantiza precios ni acceso. Los enlaces apuntan al resultado oficial del país.
- Un fallo de proveedores no oculta la ficha. La selección de ejemplo es una instantánea del 14 de octubre de 2026 sin disponibilidad.
- La lista admite 500 títulos. Borrar los datos del sitio borra la lista; no se sincroniza entre dispositivos.

Proyecto personal independiente, sin afiliación con JustWatch ni TMDB. Datos e imágenes de [The Movie Database](https://www.themoviedb.org). This product uses the TMDB API but is not endorsed or certified by TMDB. Disponibilidad proporcionada por [JustWatch](https://www.justwatch.com), según los [requisitos de atribución de TMDB](https://developer.themoviedb.org/reference/movie-watch-providers).
