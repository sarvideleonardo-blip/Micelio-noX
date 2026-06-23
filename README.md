# Lienzo de Dudas del Gato Araña

Este repositorio contiene un prototipo visual para explorar el espacio-tiempo, la escritura y NUSCURIA sin pedirle al explorador que memorice palabras difíciles. La idea principal: mover nodos con la mano, mirar cómo cambia el pulso de los relojes, capturar pensamiento sin fricción y dejar que Sombra acompañe sin calificar.

## Cómo abrirlo en VS Code

1. Abre esta carpeta en VS Code.
2. Abre una terminal dentro de VS Code.
3. Ejecuta `npm install` si todavía no existe la carpeta `node_modules`.
4. Ejecuta `npm run dev`.
5. Abre el enlace que muestra Vite, normalmente `http://localhost:5173`.

## Qué se puede tocar sin saber programar

- El texto grande de bienvenida está en `src/main.jsx`, dentro de la sección `intro`.
- Los nombres visibles de los nodos están en `src/main.jsx`: `El Jalón`, `Camino`, `Reloj de mis Pies` y `Reloj de mi Cabeza`.
- Las semillas iniciales de escritura están en `seedTexts`, al inicio de `src/main.jsx`.
- Las palabras que detectan patrones están en `themes`, al inicio de `src/main.jsx`.
- Los colores, tamaños, brillos y respiraciones visuales están en `src/styles.css`.
- Los términos del `Modo Traductor` están en `translatorLabels`, al inicio de `src/main.jsx`.
- Las criaturas, órganos, emociones, personajes y modos de NUSCURIA están en `translationModes`, `emotionLexicon`, `organLibrary`, `bestiary` y `characterWeb`.

## Regla viva del tiempo

Los relojes no dicen “correcto” o “incorrecto”. Solo cambian su pulso. Cuando un reloj se acerca a `El Jalón`, sus manecillas tardan más en dar la vuelta y su color se calienta. Cuando se aleja, su pulso vuelve a sentirse más ligero.

## Arqueología + proyección

El segundo motor convierte la escritura en campo de fuerzas:

- Captura pensamientos sin obligar carpetas ni formularios largos.
- Convierte cada texto en un nodo.
- Detecta patrones por palabras recurrentes y temas compartidos.
- Une nodos por relación explícita, afinidad semántica, recurrencia temática o coincidencia temporal.
- Permite conversar con una versión pasada como brújula, no como mandato.
- Guarda bengalas para versiones futuras.

## NUSCURIA

La app es solo un órgano del organismo. NUSCURIA funciona como biblioteca de traducción expandida:

- Traduce una entrada como `CARBÓN QUE RESPIRA` por capas: letras, valores, geometría, emociones, órganos, animalidad, comportamiento, color, sonido y organismo.
- Permite cambiar de modo: VECTOR, CONSTELACIÓN, ORGANISMO, MÚSICA, TOPOGRAFÍA, ADN, ECOSISTEMA, BESTIARIO y SUEÑO.
- Genera una salida visual en SVG con cuerpo, corazón y tentáculos animados.
- Muestra fichas de bestiario para Pulpo de Tentáculos Ontológicos, Carbón que Respira, Abductor Amor y Menos Rechazo.
- Cruza órganos conceptuales y personajes para que Renata, Ratnah o El Niño Amputado parezcan habitantes de un bosque relacional, no filas de una base de datos.

## Para el siguiente agente en VS Code

Si otro agente toma este proyecto, puede continuar por estas rutas:

- Persistir nodos, criaturas, órganos, relaciones y bengalas en Supabase para que cada viaje vuelva a abrirse donde quedó.
- Convertir cada descubrimiento en una tarjeta de “Tripulante” más narrativa.
- Añadir embeddings para que la afinidad semántica no dependa solo de palabras clave.
- Convertir salidas SVG de NUSCURIA en PNG, sonido, constelación o criatura animada exportable.
- Añadir un modo “Semilla” para que el explorador escriba una duda y el lienzo proponga un nodo nuevo.
- Conectar Supabase cuando el entorno tenga el CLI de Codex o la configuración MCP disponible.

## Supabase y MCP

Ya quedó instalado el paquete de habilidades para agentes en `.agents/skills` y quedó registrado en `skills-lock.json`. En este contenedor no existe el binario `codex`, por eso el alta del servidor MCP y el login se deben repetir desde el VS Code o terminal donde sí esté instalado Codex:

```bash
codex mcp add supabase --url "https://mcp.supabase.com/mcp?project_ref=nqoinrvvggbatopmtcgu&features=account%2Cfunctions%2Cdevelopment%2Cdebugging%2Cbranching%2Cdatabase%2Cdocs"
codex mcp login supabase
```

También se agregó `remote_mcp_client_enabled = true` en `~/.codex/config.toml` dentro de este contenedor, pero esa configuración vive fuera del repositorio. Si abres el proyecto en otra máquina, hay que repetir ese ajuste allí.
