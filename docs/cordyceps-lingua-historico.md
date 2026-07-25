# Respaldo histórico del proyecto: Cordyceps Lingua y Organismo Mutante 3D/2D

Documento de registro histórico, ontología matemática, arquitectura conceptual y evolución del sistema **Cordyceps Lingua**.

> Nota de ubicación: este documento preserva la memoria del proyecto dentro del repositorio actual sin introducir el prototipo HTML autónomo como artefacto ejecutable en la raíz. El archivo ejecutable `organismo_mutante_unificado.html` deberá vivir en el repositorio nuevo o dedicado al organismo visual.

## 1. Bitácora del proyecto

### Fase 1: concepción del organismo y mapa terrestre 2D

Se concibe **Cordyceps Lingua** como un organismo lingüístico mutante que infecta textos y poemas. Cada palabra se interpreta como una espora bioluminiscente mapeada sobre una superficie terrestre mediante coordenadas geográficas de latitud y longitud.

La primera interfaz interactiva, `mapa_organismo.html`, renderizaba las esporas como marcadores circulares brillantes y conectaba las palabras del poema mediante hifas: polilíneas de neón rosa y cian. La experiencia incluía controles de reproducción animada del verso: **Sembrar**, **Pausar** y **Reiniciar**.

### Fase 2: expansión al cosmos 3D y colapso dimensional

La simulación se expande a un motor vectorial 3D autónomo, `mapa_3d_cosmos.html`, capaz de proyectar una esfera terrestre y una red de esporas en un espacio cósmico.

El sistema se organiza en cinco fases evolutivas:

1. **Fase I · Normal**: red de esporas estable en 3D sobre la esfera cósmica.
2. **Fase II · Caos Glitch**: los puntos tiemblan, el texto muta en caracteres corruptos y la gravedad del centro empieza a curvar el espacio, tirando de las hifas.
3. **Fase III · Enana Blanca Implosiva**: el organismo implosiona hacia el origen `(0, 0, 0)`, pierde color y forma una estrella densa.
4. **Fase IV · Agujero Negro y Chorros Polares**: la implosión produce un agujero negro central, un disco de acreción en espiral y chorros polares de partículas espaguetizadas.
5. **Fase V · Criaturas Fractales**: emergen dragones de código —serpientes IK con alas de ecuaciones— y un planeta caníbal devorador de letras.

### Fase 3: depuración de dependencias Leaflet

Se detectó que los navegadores locales podían bloquear o ralentizar las hojas de estilo CDN de Leaflet, especialmente desde `unpkg.com`, generando falsos positivos de error como **Leaflet CSS: FALLÓ**.

La solución definida para el prototipo consistió en:

- Incorporar estilos estructurales de Leaflet directamente en el bloque local `<style>`.
- Configurar failover multi-CDN de `unpkg` hacia `cdnjs`.
- Eliminar cuadros emergentes de error que bloqueaban la ejecución limpia de la experiencia local.

### Fase 4: unificación autónoma y motor de autocrecimiento

El requerimiento de unificación fue combinar los estados del organismo, el visor 3D, el mapa 2D, las cinco fases de implosión y el sistema de ingesta de texto libre en un solo archivo HTML: `organismo_mutante_unificado.html`.

La intención funcional del archivo unificado era permitir una experiencia local, compartible y autosuficiente con:

- **Ingesta de texto libre** mediante un modal o panel para pegar cualquier texto o poema.
- **Persistencia en `localStorage`** para guardar estado y biomasa lingüística.
- **Mutador silábico** mediante un botón `🧬 Mutar Ahora`.
- **Autocrecimiento** mediante un temporizador `🌱 Autocrecimiento` que germina palabras mutantes combinando sílabas.
- **Exportación de genoma JSON** para compartir copias exactas del organismo.

Ejemplo conceptual de mutación:

```text
ESPORA + LENGUA → ESPOGUA
```

### Fase 5: corrección de física 3D

A partir de diagnóstico visual por captura de pantalla se identificó que, durante la Fase IV, las coordenadas `Y` permanecían estáticas mientras `X` y `Z` se comprimían. Esto hacía que las palabras se aglutinaran en una columna vertical.

La corrección matemática definida fue usar una distribución de espiral áurea de Fibonacci —también conocida como **Fibonacci Sphere Algorithm**— para garantizar una separación tridimensional uniforme de las palabras.

Además, se propuso:

- Renderizado por lotes mediante una pasada agrupada de `ctx.stroke()` para mejorar rendimiento.
- Chorros polares verdaderos en la Fase IV, emitidos desde ambos polos del eje `Y`.
- Conservación de fluidez visual cercana a 60 FPS en escenas con muchas esporas.

## 2. Ontología del organismo

| Concepto | Definición dentro del sistema |
| --- | --- |
| Espora | Palabra o unidad lingüística visible como partícula bioluminiscente. |
| Hifa | Conexión entre esporas; representa continuidad poética, sintáctica o semántica. |
| Biomasa lingüística | Conjunto total de palabras ingeridas y mutadas por el organismo. |
| Genoma | Estado serializable del organismo, exportable como JSON. |
| Mutación | Recombinación de sílabas, prefijos o fragmentos de palabras. |
| Autocrecimiento | Ciclo temporal que genera nuevas mutaciones sin intervención manual. |
| Colapso | Fase gravitacional donde el sistema se contrae hacia el origen 3D. |
| Criatura fractal | Entidad emergente de la red lingüística durante la fase final. |

## 3. Algoritmo de distribución 3D de Fibonacci

Para evitar que las palabras se aglutinen en un solo eje y garantizar una esfera tridimensional equilibrada, se usa el siguiente modelo:

```text
φ = (1 + √5) / 2

yᵢ = 1 - (i / (N - 1)) · 2

rᵢ = √(1 - yᵢ²)

θᵢ = 2π · i / φ

xᵢ = rᵢ · cos(θᵢ) · R
yᵢ = yᵢ · R
zᵢ = rᵢ · sin(θᵢ) · R
```

Donde:

- `N` es el número total de palabras o esporas.
- `i` es el índice de la palabra actual.
- `φ` es la proporción áurea.
- `R` es el radio del universo del organismo; en el prototipo se usa `R = 180`.

Este método permite que, sin importar cuántas palabras se agreguen, la separación tridimensional sea estable, uniforme y resistente a la formación de columnas visuales.

## 4. Estado de preservación

El contenido histórico del proyecto queda preservado aquí como documentación. El prototipo ejecutable unificado no debe mantenerse en la raíz de este repositorio Micelio si el destino correcto es un repositorio nuevo o especializado para Cordyceps Lingua.

