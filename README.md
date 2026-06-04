# Lienzo de Dudas del Gato Araña

Este repositorio contiene un prototipo visual para explorar el espacio-tiempo sin pedirle al explorador que memorice palabras difíciles. La idea principal: mover nodos con la mano, mirar cómo cambia el pulso de los relojes y dejar que Sombra acompañe sin calificar.

## Cómo abrirlo en VS Code

1. Abre esta carpeta en VS Code.
2. Abre una terminal dentro de VS Code.
3. Ejecuta `npm install` si todavía no existe la carpeta `node_modules`.
4. Ejecuta `npm run dev`.
5. Abre el enlace que muestra Vite, normalmente `http://localhost:5173`.

## Qué se puede tocar sin saber programar

- El texto grande de bienvenida está en `src/main.jsx`, dentro de la sección `intro`.
- Los nombres visibles de los nodos están en `src/main.jsx`: `El Jalón`, `Camino`, `Reloj de mis Pies` y `Reloj de mi Cabeza`.
- Los colores, tamaños, brillos y respiraciones visuales están en `src/styles.css`.
- Los términos del `Modo Traductor` están en `translatorLabels`, al inicio de `src/main.jsx`.

## Regla viva del tiempo

Los relojes no dicen “correcto” o “incorrecto”. Solo cambian su pulso. Cuando un reloj se acerca a `El Jalón`, sus manecillas tardan más en dar la vuelta y su color se calienta. Cuando se aleja, su pulso vuelve a sentirse más ligero.

## Para el siguiente agente en VS Code

Si otro agente toma este proyecto, puede continuar por estas rutas:

- Guardar posiciones de nodos para que cada viaje vuelva a abrirse donde quedó.
- Convertir cada descubrimiento en una tarjeta de “Tripulante” más narrativa.
- Añadir un modo “Semilla” para que el explorador escriba una duda y el lienzo proponga un nodo nuevo.
- Conectar Supabase cuando el entorno tenga el CLI de Codex o la configuración MCP disponible.

## Supabase y MCP

Ya quedó instalado el paquete de habilidades para agentes en `.agents/skills` y quedó registrado en `skills-lock.json`. En este contenedor no existe el binario `codex`, por eso el alta del servidor MCP y el login se deben repetir desde el VS Code o terminal donde sí esté instalado Codex:

```bash
codex mcp add supabase --url "https://mcp.supabase.com/mcp?project_ref=nqoinrvvggbatopmtcgu&features=account%2Cfunctions%2Cdevelopment%2Cdebugging%2Cbranching%2Cdatabase%2Cdocs"
codex mcp login supabase
```

También se agregó `remote_mcp_client_enabled = true` en `~/.codex/config.toml` dentro de este contenedor, pero esa configuración vive fuera del repositorio. Si abres el proyecto en otra máquina, hay que repetir ese ajuste allí.
