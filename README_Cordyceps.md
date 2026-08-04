Cordyceps Lingua — Organismo Mutante Unificado

Pruebas y ejecución local

1) Servir el proyecto en un servidor estático (recomendado) y abrir en navegador:

Con Python 3:

```bash
python3 -m http.server 8000
# Abrir http://localhost:8000/organismo_mutante_unificado.html
```

Con Node (http-server):

```bash
npx http-server -c-1 .
# Abrir la URL que imprima (ej. http://127.0.0.1:8080/)
```

2) Qué probar

- Ver nitidez del canvas en pantallas Retina/HiDPI.
- Arrastrar y hacer zoom en 3D.
- Cambiar fases y comprobar restablecimiento y sanitización de texto (acentos, caracteres especiales).
- Abrir modal de ingestión y pegar texto con acentos/diacríticos.
- Activar 2D: Leaflet se cargará dinámicamente (CDN primary → fallback). Si no hay conexión, la app permanece en 3D y muestra aviso en consola.
- Exportar/Importar genoma JSON y verificar que no se dupliquen marcadores ni hifas.
- Activar autocrecimiento y observar límite de hifas/dibujo para mantener rendimiento.

3) Notas técnicas de mejoras aplicadas

- HiDPI canvas: `resizeCanvas()` ajusta backing store según `devicePixelRatio`.
- Pausa de render cuando la pestaña está oculta (Visibility API).
- Throttling del render loop vía `fpsTarget` (por defecto 60).
- Limitación de hifas generadas y dibujadas para evitar sobrecarga gráfica.
- Carga dinámica de Leaflet con fallback CDN y método `updateMapMarkers()` para reconstruir marcadores sin reiniciar el mapa.
- Sanitización Unicode-aware al cambiar fases.

4) Posibles mejoras futuras

- Mover cálculo pesado (p. ej. layout de esporas o colisiones) a WebWorker.
- Soporte offline completo para tiles (caching) y assets locales.
- Añadir controles de UI para `fpsTarget` y `maxHifasToRender`.
- Refactorizar la app en módulos ES para tests unitarios.

Si quieres, implemento alguna de las mejoras futuras (por ejemplo: WebWorker para generar posiciones o UI para ajustar `fpsTarget`).
