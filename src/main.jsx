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
  memory: 'grafo semántico temporal',
  future: 'recordatorio diferido consciente',
};

const themes = [
  { name: 'tiempo', words: ['tiempo', 'reloj', 'ayer', 'mañana', 'futuro', 'pasado', 'años'] },
  { name: 'cuerpo', words: ['pies', 'cabeza', 'mano', 'cuerpo', 'piel', 'cosquillas'] },
  { name: 'lenguaje', words: ['palabra', 'nombre', 'lenguaje', 'etiqueta', 'decir', 'escribir'] },
  { name: 'fuerza', words: ['jalón', 'monstruo', 'fuerza', 'atrae', 'gravedad', 'peso'] },
  { name: 'camino', words: ['camino', 'distancia', 'ruta', 'viaje', 'nave', 'mapa'] },
  { name: 'duda', words: ['duda', 'pregunta', 'curiosidad', 'no sé', 'semilla', 'misterio'] },
];

const seedTexts = [
  {
    id: 'seed-2019',
    year: 2019,
    title: 'La primera semilla',
    text: 'No sé si el tiempo vive igual en mis pies que en mi cabeza. Siento cosquillas cuando la duda jala.',
    explicit: ['seed-2024'],
  },
  {
    id: 'seed-2021',
    year: 2021,
    title: 'Lenguaje de cajas',
    text: 'El mundo pide etiquetas antes de escuchar la intuición. Quiero escribir sin que la palabra me encierre.',
    explicit: [],
  },
  {
    id: 'seed-2024',
    year: 2024,
    title: 'Camino elástico',
    text: 'La distancia no es una carpeta: es un camino que cambia si algo me atrae con más fuerza.',
    explicit: ['seed-2026'],
  },
  {
    id: 'seed-2026',
    year: 2026,
    title: 'Arqueología del futuro',
    text: 'Cada texto puede ser nodo, fósil y brújula. No quiero memoria quieta; quiero hablar con mis versiones sin obedecerlas.',
    explicit: [],
  },
];

function detectThemes(text) {
  const lowered = text.toLowerCase();
  const found = themes.filter((theme) => theme.words.some((word) => lowered.includes(word))).map((theme) => theme.name);
  return found.length ? found : ['eco libre'];
}

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

function ThoughtCapture({ draft, setDraft, onCapture }) {
  return (
    <form className="thought-capture" onSubmit={onCapture}>
      <label htmlFor="thought-input">
        <span className="eyebrow">Captura sin fricción</span>
        <span>Suelta una frase, una duda o una imagen mental. No hay carpeta obligatoria.</span>
      </label>
      <textarea
        id="thought-input"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Ej: La misma duda cambió de máscara, pero sigue jalando desde el futuro..."
      />
      <button type="submit">Volverlo nodo</button>
    </form>
  );
}

function MemoryGraph({ entries, selectedId, setSelectedId, translated }) {
  const graph = useMemo(() => {
    const enriched = entries.map((entry) => ({ ...entry, themes: detectThemes(entry.text) }));
    const links = [];

    enriched.forEach((entry, index) => {
      enriched.slice(index + 1).forEach((other) => {
        const shared = entry.themes.filter((theme) => other.themes.includes(theme));
        if (entry.explicit?.includes(other.id) || other.explicit?.includes(entry.id)) {
          links.push({ from: entry.id, to: other.id, type: 'relación explícita' });
        } else if (shared.length > 1) {
          links.push({ from: entry.id, to: other.id, type: `recurrencia temática: ${shared[0]}` });
        } else if (shared.length === 1) {
          links.push({ from: entry.id, to: other.id, type: `afinidad semántica: ${shared[0]}` });
        } else if (Math.abs(entry.year - other.year) <= 1) {
          links.push({ from: entry.id, to: other.id, type: 'coincidencia temporal' });
        }
      });
    });

    return { entries: enriched, links };
  }, [entries]);

  const selected = graph.entries.find((entry) => entry.id === selectedId) ?? graph.entries[0];

  return (
    <section className="memory-field" aria-labelledby="memory-title">
      <div className="memory-heading">
        <p className="eyebrow">Arqueología + proyección</p>
        <h2 id="memory-title">Campo de fuerzas de la escritura</h2>
        <p>
          Cada texto se vuelve nodo. Las líneas nacen por relación explícita, afinidad de esencia, recurrencia temática o cercanía en el tiempo.
        </p>
        {translated && <span className="translation memory-translation">{translatorLabels.memory}</span>}
      </div>

      <div className="force-board">
        {graph.links.map((link) => (
          <span key={`${link.from}-${link.to}-${link.type}`} className="relation-chip">
            {link.type}
          </span>
        ))}
        <div className="text-node-grid">
          {graph.entries.map((entry, index) => {
            const isSelected = entry.id === selected.id;
            return (
              <button
                key={entry.id}
                className={`text-node ${isSelected ? 'selected' : ''}`}
                style={{ '--float': `${index % 2 ? 14 : 0}px` }}
                onClick={() => setSelectedId(entry.id)}
                type="button"
              >
                <span>{entry.year}</span>
                <strong>{entry.title}</strong>
                <small>{entry.themes.join(' · ')}</small>
              </button>
            );
          })}
        </div>
      </div>

      <PastConversation entry={selected} />
    </section>
  );
}

function PastConversation({ entry }) {
  return (
    <article className="past-dialogue" aria-label="Conversación con una versión pasada">
      <p className="eyebrow">Conversar sin romantizar</p>
      <h3>Versión {entry.year}: {entry.title}</h3>
      <blockquote>{entry.text}</blockquote>
      <div className="dialogue-grid">
        <p>
          <strong>Lo que se repite:</strong> {detectThemes(entry.text).join(', ')}. La misma esencia puede cambiar de máscara sin volverse mandato.
        </p>
        <p>
          <strong>Lo que no obedecemos a ciegas:</strong> esta versión fue una brújula, no una cárcel. Puede ser escuchada y también contradicha.
        </p>
      </div>
    </article>
  );
}

function FutureMessages({ messages, futureDraft, setFutureDraft, futureDate, setFutureDate, onSend, translated }) {
  return (
    <section className="future-panel" aria-labelledby="future-title">
      <div>
        <p className="eyebrow">Mensaje consciente al futuro</p>
        <h2 id="future-title">Enviar una bengala</h2>
        <p>No promete memoria perfecta. Deja una intención con fecha para que otra versión la encuentre.</p>
        {translated && <span className="translation memory-translation">{translatorLabels.future}</span>}
      </div>
      <form className="future-form" onSubmit={onSend}>
        <input type="date" value={futureDate} onChange={(event) => setFutureDate(event.target.value)} aria-label="Fecha futura" />
        <textarea value={futureDraft} onChange={(event) => setFutureDraft(event.target.value)} placeholder="Querida versión futura: mira si esta esencia cambió de forma..." />
        <button type="submit">Guardar bengala</button>
      </form>
      <div className="future-list">
        {messages.map((message) => (
          <article key={message.id}>
            <span>{message.date || 'sin fecha fija'}</span>
            <p>{message.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function App() {
  const canvasRef = useRef(null);
  const size = useCanvasSize(canvasRef);
  const [translated, setTranslated] = useState(false);
  const [mode, setMode] = useState('mirror');
  const [draft, setDraft] = useState('');
  const [entries, setEntries] = useState(seedTexts);
  const [selectedId, setSelectedId] = useState(seedTexts[0].id);
  const [futureDraft, setFutureDraft] = useState('');
  const [futureDate, setFutureDate] = useState('');
  const [futureMessages, setFutureMessages] = useState([
    { id: 'future-1', date: '2027-06-05', text: 'Revisa si la duda del tiempo sigue jalando igual o si encontró otra máscara.' },
  ]);
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

  const captureThought = (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    const nextEntry = {
      id: `entry-${Date.now()}`,
      year: new Date().getFullYear(),
      title: text.split(/[.!?\n]/)[0].slice(0, 48) || 'Nodo sin título',
      text,
      explicit: selectedId ? [selectedId] : [],
    };

    setEntries((current) => [nextEntry, ...current]);
    setSelectedId(nextEntry.id);
    setDraft('');
  };

  const sendFutureMessage = (event) => {
    event.preventDefault();
    const text = futureDraft.trim();
    if (!text) return;

    setFutureMessages((current) => [{ id: `future-${Date.now()}`, date: futureDate, text }, ...current]);
    setFutureDraft('');
  };

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

      <section className="archive-shell" aria-label="Sistema de arqueología y proyección de escritura">
        <ThoughtCapture draft={draft} setDraft={setDraft} onCapture={captureThought} />
        <MemoryGraph entries={entries} selectedId={selectedId} setSelectedId={setSelectedId} translated={translated} />
        <FutureMessages
          messages={futureMessages}
          futureDraft={futureDraft}
          setFutureDraft={setFutureDraft}
          futureDate={futureDate}
          setFutureDate={setFutureDate}
          onSend={sendFutureMessage}
          translated={translated}
        />
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
