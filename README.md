# Ecos del tiempo - Pausa (Firefox)

Adaptación del proyecto de p5.js "Ecos del tiempo" a una extensión "Manifest V3" de Firefox.

## Cómo instalarla para probarla

1. Descomprime el ZIP.
2. Abre "Firefox" y escribe `about:debugging` en la barra de direcciones.
3. Entra en "Este Firefox" y pulsa "Cargar complemento temporal".
4. Selecciona `manifest.json` de la carpeta de la extensión.
5. Pulsa el icono de la extensión en la barra de Firefox (puede estar en el menú de extensiones).

> No hace falta Node.js, npm, Vite, Electron ni un servidor. La biblioteca p5.js está incluida localmente.

La instalación temporal desaparece al reiniciar Firefox, por lo que para continuar las pruebas puede ser necesario volver a cargarla. No está publicada ni firmada por Mozilla.

## Cómo usarla

- Elige una duración de 1 a 30 minutos con el slider.
- Pulsa "Iniciar pausa".
- Puedes cerrar el popup y volver a abrirlo. El tiempo restante se recuperará automáticamente.
- Pulsa "Pausar" y "Continuar" si lo necesitas.
- Pulsa "Reiniciar" para comenzar desde la duración seleccionada.

## Relación con el reloj creativo

- "Horas:" se conserva la paleta de 24 colores del trabajo original. El color representa la hora actual.
- "Minutos:" el núcleo aumenta de tamaño conforme transcurre la pausa.
- "Segundos:" mientras está activo el temporizador, cada segundo se crea una onda.
- "Partículas:" ocho puntos se mueven alrededor del núcleo, como en el proyecto de partida.

El canvas ha pasado de ocupar toda la ventana a medir "300 x 150 píxeles".

## Persistencia con p5.js

En `sketch.js`, las funciones `guardarDatos()` y `recuperarDatos()` usan:

```javascript
storeItem('ecosDelTiempoPausa', datos);
const datos = getItem('ecosDelTiempoPausa');
```

Guardamos la duración elegida, el estado, el tiempo restante y, cuando está en marcha, el momento exacto en que debe terminar (`horaFinal`).

Importante: un popup no continúa ejecutándose después de cerrarlo. Al abrirlo otra vez, calculamos cuánto falta usando `horaFinal - Date.now()`. Si el descanso terminó mientras estaba cerrado, lo mostramos como completado al volver a abrirlo.

## Sobre el permiso storage

Hemos declarado `"permissions": ["storage"]` en `manifest.json` porque lo solicita el enunciado y porque sería necesario para utilizar `browser.storage.local`. Pero "las funciones `storeItem()` y `getItem()` de p5.js funcionan sobre `window.localStorage`, que no necesita este permiso". Es una diferencia que conviene documentar.

En un producto real sería preferible estudiar `browser.storage.local`, porque Mozilla lo recomienda para guardar datos de extensiones. En esta PEC usamos las funciones de p5.js exigidas.

## Posible mejora extra (no implementada)

Una notificación del sistema cuando termine el descanso sin tener el popup abierto. La implementaría con:

- `browser.alarms`: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/alarms
- `browser.notifications`: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/notifications

También habría que añadir los permisos `alarms` y `notifications` y un script de fondo para escuchar la alarma.

## Cómo comprobar el funcionamiento

1. Selecciona un minuto y pulsa Iniciar.
2. Cierra el popup y vuelve a abrirlo después de unos segundos. El tiempo debe haber disminuido.
3. Pulsa Pausar; cierra y abre. El tiempo no debe haber disminuido.
4. Pulsa Continuar. El contador debe seguir desde el mismo valor.
5. Pulsa Reiniciar. Debe mostrar la duración configurada.
6. Deja que termine con el popup cerrado y comprueba que aparece "Completado" al volver a abrirlo.

Limitaciones: no muestra notificaciones al terminar si el popup está cerrado. Si el usuario modifica manualmente el reloj del sistema, cambiará el cálculo de la hora final. Los datos pueden desaparecer al borrar el almacenamiento del navegador o según las condiciones de instalación temporal.

## Archivos

- `manifest.json`: configuración de Firefox MV3.
- `popup.html`: interfaz de la extensión.
- `style.css`: estilo de botones, slider y textos.
- `sketch.js`: adaptación comentada del proyecto original y persistencia.
- `lib/p5.min.js`: p5.js 2.3.4.
- `icons/`: iconos locales.

## Documentación consultada

- p5.js `storeItem`: https://p5js.org/reference/p5/storeItem/
- p5.js `getItem`: https://p5js.org/reference/p5/getItem/
- Mozilla `action`: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/action
- Mozilla `storage`: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage
- Instalación temporal: https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/
- Mozilla CSP: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/content_security_policy

## Licencias y atribuciones

- Código de adaptación: PEC 1 de Sergio Núñez.
- p5.js: biblioteca de terceros bajo LGPL-2.1, desarrollada por Processing Foundation y colaboradores. Se adjunta `LICENCIA-P5-LGPL-2.1.txt` y puede consultarse el código fuente original en https://github.com/processing/p5.js . La copia `lib/p5.min.js` .
- No se utiliza ningún recurso remoto, cuenta, registro ni seguimiento de usuarios.
