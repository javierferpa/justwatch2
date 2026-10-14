# JustWatch2

Una aplicación personal para descubrir películas y series, consultar dónde verlas por país y guardar una lista para después. Interfaz en español, adaptable a móvil y escritorio, construida con Angular 22.

**Web:** [javierferpa.github.io/justwatch2](https://javierferpa.github.io/justwatch2/)

## Qué puedes hacer

- Explorar tendencias semanales, películas y series con sus rutas y fichas propias.
- Buscar por título y compartir la búsqueda mediante la URL.
- Filtrar películas y series por género y plataforma, y ordenar por popularidad, valoración o fecha.
- Consultar suscripción, opciones gratuitas, alquiler y compra en el país elegido.
- Ver sinopsis, reparto, puntuación y tráiler oficial cuando esté disponible.
- Guardar títulos en «Mi lista», conservada en el navegador.
- Recuperarte de errores de conexión, token inválido, datos ausentes y enlaces incorrectos.

## Empezar

Necesitas una versión compatible de Node.js: **24.15 o superior dentro de Node 24**, **22.22.3 o superior dentro de Node 22**, o Node 26+. Recomendado: Node 24 LTS.

```sh
npm ci
npm start
```

Abre `http://127.0.0.1:4200`.

La aplicación arranca con una selección de **20 títulos de ejemplo**, obtenida de TMDB el 14 de octubre de 2026. La búsqueda y los filtros del modo de ejemplo se limitan a esa selección. Nunca simula disponibilidad de streaming.

Para usar el catálogo y la disponibilidad reales:

1. Abre **Ajustes** en la aplicación.
2. Obtén tu **API Read Access Token** en los [ajustes de TMDB](https://www.themoviedb.org/settings/api).
3. Pégalo y pulsa **Conectar TMDB**. La aplicación valida el token antes de cambiar la conexión.
4. Selecciona tu país. España es la selección inicial.

El token solo se guarda en `sessionStorage` de esa pestaña hasta cerrarla, y se envía mediante el encabezado Authorization directamente a `api.themoviedb.org`. La lista y el país se guardan en `localStorage`. No hay servidor propio, cuentas, sincronización ni telemetría de JustWatch2. El navegador solicita imágenes a TMDB, tipografías a Google Fonts y datos a TMDB al conectar; sus políticas de privacidad siguen siendo aplicables.

**Credencial histórica:** la versión antigua contenía un token de TMDB en el código y en los paquetes publicados. La versión actual lo elimina, pero sigue presente en el historial de Git. El propietario debe revocarlo o regenerarlo en TMDB. No reutilices esa credencial; eliminarla del último commit no la revoca.

## Verificación

```sh
npm run check
npm audit
```

`check` ejecuta las pruebas de integración/unidad, compila producción y comprueba que no haya JWT ni credenciales de GitHub en los archivos fuente o generados. El control de credenciales es una comprobación acotada, no una auditoría completa de secretos.

Las pruebas cubren identidades de películas/series, normalización de datos, filtros y endpoints, errores de API, almacenamiento bloqueado o corrupto, paginación, navegación, búsqueda y cambios de ficha. No necesitan un token real ni usan la red. Para iterar con las pruebas: `npm run test:watch`.

Para comprobación manual en navegador:

- Inicio → guardar un título → Mi lista → recargar → quitarlo.
- Películas/Series → género/ordenación → ficha → volver.
- Buscar `Dune`, una búsqueda vacía y una sin resultados.
- Conectar TMDB → buscar → cambiar país → comprobar proveedores y enlaces.
- Probar error de token, desconexión y un enlace inválido.
- Repetir en móvil, usando teclado y con movimiento reducido.

## Publicación existente en GitHub Pages

GitHub Pages sirve la carpeta **docs** de **master**. El proyecto usa rutas con `#` para que la recarga y los enlaces directos funcionen en hosting estático, también bajo `/justwatch2/`.

```sh
npm run build:pages
```

Este comando compila con la base correcta y sustituye exclusivamente la carpeta generada `docs/`. El resultado incluye `.nojekyll` y `404.html`; no contiene un servidor SSR. Incluye los cambios en `docs/` en el mismo commit que el código fuente antes de hacer push. La CI ejecuta pruebas, compilación y comprobación de que el paquete publicado corresponde al código.

## Arquitectura y límites

- Componentes autónomos, señales de Angular y rutas cargadas bajo demanda.
- `core/catalog.service.ts`: acceso a TMDB, normalización y catálogo de ejemplo.
- `core/preferences.service.ts`: conexión de sesión, país y lista local validada.
- Las peticiones se cancelan al cambiar filtros/ruta o salir de la página; el botón «Descubrir más» tiene final y evita cargas simultáneas.
- Los filtros de plataforma consultan streaming por suscripción/gratis/anuncios; las fichas separan además alquiler y compra.
- La búsqueda utiliza los endpoints de búsqueda, por lo que se muestra sin filtros de descubrimiento.
- La disponibilidad es información proporcionada por JustWatch a través de TMDB, no una garantía de precios o acceso. Se enlaza al resultado del país, sin inventar enlaces a las plataformas.
- No se añaden datos de disponibilidad al catálogo de ejemplo. Un fallo al consultar proveedores no oculta la ficha.
- La lista admite hasta 500 títulos en este navegador. Borrar los datos del sitio borra la lista; no hay sincronización entre dispositivos.
- Una aplicación estática no puede ocultar una credencial al navegador. Para ofrecer acceso compartido a todos los visitantes sin token por sesión, hace falta un backend que custodie su propia credencial; ese servicio no forma parte de este proyecto.

## Fuentes y créditos

Proyecto personal independiente, sin afiliación con JustWatch ni TMDB.

Datos e imágenes de [The Movie Database](https://www.themoviedb.org). Esta aplicación utiliza la API de TMDB, pero no está respaldada ni certificada por TMDB. Disponibilidad proporcionada por [JustWatch](https://www.justwatch.com), según los [requisitos de atribución de TMDB](https://developer.themoviedb.org/reference/movie-watch-providers).

Referencias de implementación: [compatibilidad de Angular](https://angular.dev/reference/versions), [autenticación de TMDB](https://developer.themoviedb.org/v4/docs/authentication-application) y [búsqueda múltiple de TMDB](https://developer.themoviedb.org/reference/search-multi).
