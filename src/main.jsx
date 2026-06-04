import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const closenessToPull = (node, pull) => clamp(1 - distance(node, pull) / 82, 0, 1);

const translatorLabels = {
  pull: 'fuerza gravitatoria',
  path: 'distancia espacial',
  clock: 'dilatación temporal local',
};

function describePulse(closeness) {
  if (closeness > 0.78) return 'casi quieto';
  if (closeness > 0.52) return 'muy lento';
  if (closeness > 0.28) return 'suave';
  return 'ligero';
}

function useCanvasSize(ref) {
  const [size, setSize] = useState({ width: 1000, height: 680 });

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const update = () => {
      const rect = node.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}

function useDraggableNode(id, setNodes, size) {
  return (event) => {
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;

    setNodes((nodes) => ({
      ...nodes,
      [id]: { ...nodes[id], dragging: true, startX: nodes[id].x, startY: nodes[id].y },
    }));

    const move = (moveEvent) => {
      const dx = ((moveEvent.clientX - startX) / size.width) * 100;
      const dy = ((moveEvent.clientY - startY) / size.height) * 100;

      setNodes((nodes) => ({
        ...nodes,
        [id]: {
          ...nodes[id],
          x: clamp(nodes[id].startX + dx, 7, 93),
          y: clamp(nodes[id].startY + dy, 10, 88),
        },
      }));
    };

    const end = () => {
      setNodes((nodes) => ({
        ...nodes,
        [id]: {
          ...nodes[id],
          startX: nodes[id].x,
          startY: nodes[id].y,
          dragging: false,
        },
      }));
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
  };
}

function translatePoint(node, size) {
  return { x: (node.x / 100) * size.width, y: (node.y / 100) * size.height };
}

function StarField() {
  const stars = useMemo(
    () =>
      Array.from({ length: 80 }, (_, index) => ({
        id: index,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        '--size': `${Math.random() * 2.2 + 0.8}px`,
        '--delay': `${Math.random() * 6}s`,
        '--duration': `${Math.random() * 5 + 4}s`,
      })),
    [],
  );

  return (
    <div className="stars" aria-hidden="true">
      {stars.map((star) => (
        <span key={star.id} style={star} />
      ))}
    </div>
  );
}

function ElasticLines({ nodes, size }) {
  const pull = translatePoint(nodes.pull, size);
  const clockOne = translatePoint(nodes.clockOne, size);
  const clockTwo = translatePoint(nodes.clockTwo, size);
  const path = translatePoint(nodes.path, size);
  const midClock = { x: (clockOne.x + clockTwo.x) / 2, y: (clockOne.y + clockTwo.y) / 2 };

  return (
    <svg className="elastic-map" viewBox={`0 0 ${size.width} ${size.height}`} aria-hidden="true">
      <defs>
        <radialGradient id="bend" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255, 111, 97, .5)" />
          <stop offset="55%" stopColor="rgba(94, 234, 212, .14)" />
          <stop offset="100%" stopColor="rgba(94, 234, 212, 0)" />
        </radialGradient>
      </defs>
      <circle cx={pull.x} cy={pull.y} r="170" fill="url(#bend)" className="gravity-halo" />
      <path d={`M ${clockOne.x} ${clockOne.y} Q ${path.x} ${path.y} ${clockTwo.x} ${clockTwo.y}`} className="path-line" />
      <path d={`M ${pull.x} ${pull.y} Q ${path.x} ${path.y} ${midClock.x} ${midClock.y}`} className="whisper-line" />
    </svg>
  );
}

function ClockNode({ node, label, translated, pull, onPointerDown }) {
  const closeness = closenessToPull(node, pull);
  const handDuration = 1.4 + closeness * 7.6;
  const warmth = Math.round(184 + closeness * 68);
  const pulse = describePulse(closeness);

  return (
    <button
      className={`node clock ${node.dragging ? 'dragging' : ''}`}
      style={{ left: `${node.x}%`, top: `${node.y}%`, '--speed': `${handDuration}s`, '--warmth': warmth }}
      onPointerDown={onPointerDown}
      type="button"
      aria-label={`${label}. Pulso ${pulse}. Arrástrame para ver cómo respira mi tiempo.`}
    >
      <span className="clock-face">
        <span className="hand minute" />
        <span className="hand second" />
      </span>
      <span className="node-label">{label}</span>
      <span className="pulse-label">pulso {pulse}</span>
      {translated && <span className="translation">{translatorLabels.clock}</span>}
    </button>
  );
}

function SimpleNode({ node, label, kind, translated, onPointerDown }) {
  return (
    <button
      className={`node ${kind} ${node.dragging ? 'dragging' : ''}`}
      style={{ left: `${node.x}%`, top: `${node.y}%` }}
      onPointerDown={onPointerDown}
      type="button"
      aria-label={`${label}. Puedes moverme por el lienzo.`}
    >
      <span className="node-orb" />
      <span className="node-label">{label}</span>
      {translated && <span className="translation">{translatorLabels[kind === 'pull' ? 'pull' : 'path']}</span>}
    </button>
  );
}

function Companion({ mode, setMode, translated, setTranslated, crew }) {
  const messages = {
    silence: 'Sombra guarda silencio. El lienzo escucha tus manos.',
    mirror: 'Sombra refleja: si acercas un reloj al Jalón, su pulso se vuelve más lento.',
    copilot: 'Sombra pregunta: ¿qué pasa si el Camino se estira entre dos relojes distintos?',
  };

  return (
    <aside className="companion-panel" aria-label="Controles de acompañamiento">
      <div className="companion-copy">
        <p className="eyebrow">Co-capitán Sombra</p>
        <p>{messages[mode]}</p>
        <div className="crew-row" aria-label="Tripulantes despiertos">
          {crew.map((member) => (
            <span key={member}>{member}</span>
          ))}
        </div>
      </div>
      <div className="controls-stack">
        <div className="mode-row" role="group" aria-label="Ritmo del viaje">
          {[
            ['silence', 'Silencio'],
            ['mirror', 'Espejo'],
            ['copilot', 'Co-piloto'],
          ].map(([value, label]) => (
            <button key={value} className={mode === value ? 'active' : ''} onClick={() => setMode(value)} type="button">
              {label}
            </button>
          ))}
        </div>
        <button className={`translator-toggle ${translated ? 'active' : ''}`} onClick={() => setTranslated((value) => !value)} type="button">
          {translated ? 'Guardar traductor' : 'Modo Traductor'}
        </button>
      </div>
    </aside>
  );
}

function App() {
  const canvasRef = useRef(null);
  const size = useCanvasSize(canvasRef);
  const [translated, setTranslated] = useState(false);
  const [mode, setMode] = useState('mirror');
  const [nodes, setNodes] = useState({
    pull: { x: 48, y: 48, startX: 48, startY: 48 },
    path: { x: 51, y: 24, startX: 51, startY: 24 },
    clockOne: { x: 23, y: 64, startX: 23, startY: 64 },
    clockTwo: { x: 77, y: 37, startX: 77, startY: 37 },
  });

  const crew = useMemo(() => {
    const feetPulse = describePulse(closenessToPull(nodes.clockOne, nodes.pull));
    const headPulse = describePulse(closenessToPull(nodes.clockTwo, nodes.pull));
    return [`Pies: ${feetPulse}`, `Cabeza: ${headPulse}`, 'Camino elástico'];
  }, [nodes]);

  const dragPull = useDraggableNode('pull', setNodes, size);
  const dragPath = useDraggableNode('path', setNodes, size);
  const dragClockOne = useDraggableNode('clockOne', setNodes, size);
  const dragClockTwo = useDraggableNode('clockTwo', setNodes, size);

  return (
    <main className="cosmos-shell">
      <section className="intro" aria-labelledby="title">
        <p className="eyebrow">Bitácora Zero · motores encendidos</p>
        <h1 id="title">Lienzo de Dudas del Gato Araña</h1>
        <p>
          Mueve el Jalón, curva el Camino y acerca los Relojes. Aquí nadie califica: el tiempo solo cambia de color y pulso mientras exploras.
        </p>
      </section>

      <section ref={canvasRef} className="canvas" aria-label="Simulador intuitivo del espacio-tiempo">
        <StarField />
        <ElasticLines nodes={nodes} size={size} />
        <SimpleNode node={nodes.pull} label="El Jalón" kind="pull" translated={translated} onPointerDown={dragPull} />
        <SimpleNode node={nodes.path} label="Camino" kind="path" translated={translated} onPointerDown={dragPath} />
        <ClockNode node={nodes.clockOne} label="Reloj de mis Pies" translated={translated} pull={nodes.pull} onPointerDown={dragClockOne} />
        <ClockNode node={nodes.clockTwo} label="Reloj de mi Cabeza" translated={translated} pull={nodes.pull} onPointerDown={dragClockTwo} />
        <Companion mode={mode} setMode={setMode} translated={translated} setTranslated={setTranslated} crew={crew} />
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
