import React, { useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'cordyceps-lingua-genome-v2';
const RADIUS = 180;
const GLITCH_CHARS = '░▒▓█∆∇◇◆◎◉⟁⌁⌬⍟λψЖ҉';
const DEFAULT_TEXT = `Sembrar lengua espora bioluminiscente hifa mapa tierra cosmos colapso enana blanca agujero negro dragon codigo planeta canibal mutacion memoria organismo`;

const PHASES = [
  { id: 0, label: 'I · Normal', description: 'La red de esporas respira estable sobre la esfera.' },
  { id: 1, label: 'II · Caos Glitch', description: 'Las palabras tiemblan y se contaminan con signos corruptos.' },
  { id: 2, label: 'III · Enana Blanca', description: 'La biomasa implosiona hacia un núcleo denso.' },
  { id: 3, label: 'IV · Agujero Negro', description: 'El centro devora luz y dispara chorros polares.' },
  { id: 4, label: 'V · Criaturas Fractales', description: 'Dragones de código emergen de las hifas.' },
];

function tokenize(text) {
  return [...new Set(text.toUpperCase().normalize('NFC').match(/[A-ZÁÉÍÓÚÜÑ]{3,}/g) || [])];
}

function loadGenome() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    if (saved?.words?.length) return saved;
  } catch {
    // LocalStorage can be unavailable in some previews; fall back to seed text.
  }

  return {
    words: tokenize(DEFAULT_TEXT),
    mutations: 0,
    createdAt: new Date().toISOString(),
  };
}

function fibonacciPoint(index, total) {
  if (total <= 1) return { x: 0, y: 0, z: RADIUS };

  const phi = (1 + Math.sqrt(5)) / 2;
  const yUnit = 1 - (index / (total - 1)) * 2;
  const radial = Math.sqrt(Math.max(0, 1 - yUnit * yUnit));
  const theta = (2 * Math.PI * index) / phi;

  return {
    x: radial * Math.cos(theta) * RADIUS,
    y: yUnit * RADIUS,
    z: radial * Math.sin(theta) * RADIUS,
  };
}

function wordToGeo(word, index, width, height) {
  const hash = [...word].reduce((acc, char) => acc + char.charCodeAt(0) * 17, index * 23);
  const lon = ((hash * 37) % 360) - 180;
  const lat = ((hash * 19) % 160) - 80;

  return {
    x: ((lon + 180) / 360) * width,
    y: ((90 - lat) / 180) * height,
  };
}

function mutateGlyph(word, time) {
  return word
    .split('')
    .map((char, index) => (index % 3 === 0 ? GLITCH_CHARS[(time + index + word.length) % GLITCH_CHARS.length] : char))
    .join('');
}

export default function CordycepsLinguaApp() {
  const [genome, setGenome] = useState(loadGenome);
  const [phase, setPhase] = useState(0);
  const [view, setView] = useState('3d');
  const [inputText, setInputText] = useState('');
  const [autogrow, setAutogrow] = useState(false);
  const [toast, setToast] = useState('');
  const canvasRef = useRef(null);
  const mapRef = useRef(null);
  const animationRef = useRef(null);
  const phaseInfo = PHASES[phase];

  const latestWords = useMemo(() => genome.words.slice(-42), [genome.words]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(genome));
    } catch {
      // Ignore persistence errors in restricted browser contexts.
    }
  }, [genome]);

  useEffect(() => {
    if (!autogrow) return undefined;
    const interval = window.setInterval(() => mutateNow(), 3200);
    return () => window.clearInterval(interval);
  }, [autogrow, genome.words]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const mapCanvas = mapRef.current;
    const ctx = canvas.getContext('2d');
    const mapCtx = mapCanvas.getContext('2d');
    let time = 0;

    const resize = () => {
      [canvas, mapCanvas].forEach((item) => {
        const rect = item.getBoundingClientRect();
        item.width = rect.width * window.devicePixelRatio;
        item.height = rect.height * window.devicePixelRatio;
        item.getContext('2d').setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      });
    };

    const project = (point) => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      const camera = 520;
      const z = point.z + 300;
      const scale = camera / (camera + z);

      return {
        x: width / 2 + point.x * scale,
        y: height / 2 + point.y * scale,
        scale,
      };
    };

    const pointFor = (index, total) => {
      const base = fibonacciPoint(index, total);
      const wobble = phase >= 1 ? Math.sin(time * 0.06 + index * 1.7) * 9 : 0;
      const collapse = phase === 2 ? 0.32 + 0.08 * Math.sin(time * 0.04) : phase === 3 ? 0.16 : 1;
      const creature = phase === 4 ? 1 + 0.25 * Math.sin(index * 0.4 + time * 0.045) : 1;

      return {
        x: (base.x + wobble) * collapse * creature,
        y: (base.y + wobble * 0.55) * collapse,
        z: (base.z - wobble) * collapse * creature,
      };
    };

    const drawStars = (width, height) => {
      ctx.fillStyle = 'rgba(255,255,255,0.52)';
      for (let index = 0; index < 95; index += 1) {
        const x = (Math.sin(index * 97.13) * 0.5 + 0.5) * width;
        const y = (Math.cos(index * 43.71) * 0.5 + 0.5) * height;
        ctx.globalAlpha = 0.25 + 0.5 * Math.sin(time * 0.015 + index);
        ctx.fillRect(x, y, 1.2, 1.2);
      }
      ctx.globalAlpha = 1;
    };

    const drawCore = (width, height) => {
      const gradient = ctx.createRadialGradient(width / 2, height / 2, 4, width / 2, height / 2, phase >= 3 ? 96 : 180);
      gradient.addColorStop(0, phase >= 3 ? '#000000' : 'rgba(8,217,214,0.18)');
      gradient.addColorStop(0.45, phase >= 3 ? 'rgba(255,46,99,0.62)' : 'rgba(157,78,221,0.10)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, phase >= 3 ? 100 : 190, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawSpore = (point, word, index) => {
      const glitched = phase >= 1 && index % 5 === 0 ? mutateGlyph(word, time) : word;
      const size = Math.max(2, 4.5 * point.scale);
      ctx.fillStyle = phase === 2 ? '#f3f4f6' : phase >= 3 ? '#d4af37' : index % 2 ? '#08d9d6' : '#ff2e63';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      if (point.scale > 0.56 || index % 3 === 0) {
        ctx.font = `${Math.max(9, 13 * point.scale)}px Space Grotesk, system-ui, sans-serif`;
        ctx.fillText(glitched, point.x + 7, point.y - 7);
      }
    };

    const drawPolarJets = (width, height) => {
      ctx.strokeStyle = 'rgba(8,217,214,0.56)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let index = 0; index < 38; index += 1) {
        const offset = Math.sin(time * 0.06 + index) * 38;
        ctx.moveTo(width / 2 + offset, height / 2 - 40);
        ctx.lineTo(width / 2 + offset * 0.35, 20 + index * 2);
        ctx.moveTo(width / 2 - offset, height / 2 + 40);
        ctx.lineTo(width / 2 - offset * 0.35, height - 20 - index * 2);
      }
      ctx.stroke();
    };

    const drawCreatures = (width, height) => {
      ctx.strokeStyle = 'rgba(157,78,221,0.8)';
      ctx.lineWidth = 3;
      for (let dragon = 0; dragon < 3; dragon += 1) {
        ctx.beginPath();
        for (let index = 0; index < 44; index += 1) {
          const angle = time * 0.025 + index * 0.28 + dragon * 2.2;
          const x = width / 2 + Math.cos(angle) * (150 + dragon * 36) + index * 2 - 42;
          const y = height / 2 + Math.sin(angle * 1.3) * (80 + dragon * 18);
          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };

    const drawMap = () => {
      const width = mapCanvas.width / window.devicePixelRatio;
      const height = mapCanvas.height / window.devicePixelRatio;
      mapCtx.clearRect(0, 0, width, height);
      mapCtx.fillStyle = '#050508';
      mapCtx.fillRect(0, 0, width, height);
      mapCtx.strokeStyle = 'rgba(8,217,214,0.12)';
      mapCtx.lineWidth = 1;

      for (let lon = -180; lon <= 180; lon += 30) {
        const x = ((lon + 180) / 360) * width;
        mapCtx.beginPath();
        mapCtx.moveTo(x, 0);
        mapCtx.lineTo(x, height);
        mapCtx.stroke();
      }

      for (let lat = -90; lat <= 90; lat += 15) {
        const y = ((90 - lat) / 180) * height;
        mapCtx.beginPath();
        mapCtx.moveTo(0, y);
        mapCtx.lineTo(width, y);
        mapCtx.stroke();
      }

      const coords = genome.words.map((word, index) => wordToGeo(word, index, width, height));
      mapCtx.beginPath();
      coords.forEach((point, index) => {
        if (index === 0) mapCtx.moveTo(point.x, point.y);
        else mapCtx.lineTo(point.x, point.y);
      });
      mapCtx.strokeStyle = 'rgba(255,46,99,0.5)';
      mapCtx.lineWidth = 1.5;
      mapCtx.stroke();

      coords.forEach((point, index) => {
        mapCtx.fillStyle = index % 2 ? '#08d9d6' : '#ff2e63';
        mapCtx.beginPath();
        mapCtx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        mapCtx.fill();
        if (index % 4 === 0) mapCtx.fillText(genome.words[index], point.x + 7, point.y - 5);
      });
    };

    const draw = () => {
      time += 1;
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      ctx.clearRect(0, 0, width, height);
      drawStars(width, height);
      drawCore(width, height);

      const points = genome.words.map((_, index) => project(pointFor(index, genome.words.length)));
      ctx.beginPath();
      points.forEach((point, index) => {
        const next = points[(index + 1) % points.length];
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(next.x, next.y);
      });
      ctx.strokeStyle = phase >= 3 ? 'rgba(212,175,55,0.35)' : 'rgba(255,46,99,0.32)';
      ctx.lineWidth = 1;
      ctx.stroke();

      points.forEach((point, index) => drawSpore(point, genome.words[index], index));
      if (phase >= 3) drawPolarJets(width, height);
      if (phase === 4) drawCreatures(width, height);
      drawMap();
      animationRef.current = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(animationRef.current);
    };
  }, [genome.words, phase]);

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  };

  const mutateNow = () => {
    setGenome((current) => {
      if (current.words.length < 2) return current;
      const a = current.words[Math.floor(Math.random() * current.words.length)];
      const b = current.words[Math.floor(Math.random() * current.words.length)];
      const child = (a.slice(0, Math.ceil(a.length / 2)) + b.slice(Math.floor(b.length / 2))).slice(0, 16);
      const words = current.words.includes(child) ? current.words : [...current.words, child];
      showToast(`Mutación germinada: ${child}`);
      return { ...current, words, mutations: current.mutations + 1 };
    });
  };

  const ingestText = () => {
    const incoming = tokenize(inputText);
    if (!incoming.length) {
      showToast('No se detectaron nuevas esporas');
      return;
    }

    setGenome((current) => ({ ...current, words: [...new Set([...current.words, ...incoming])] }));
    setInputText('');
    showToast(`Texto ingerido: ${incoming.length} esporas`);
  };

  const resetGenome = () => {
    setGenome({ words: tokenize(DEFAULT_TEXT), mutations: 0, createdAt: new Date().toISOString() });
    showToast('Organismo reiniciado');
  };

  const exportGenome = () => {
    const blob = new Blob([JSON.stringify(genome, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = Object.assign(document.createElement('a'), { href: url, download: 'cordyceps-lingua-genoma.json' });
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-shell" data-view={view}>
      <header className="topbar">
        <div>
          <p className="eyebrow">Organismo mutante 3D/2D</p>
          <h1>Cordyceps <span>Lingua</span></h1>
        </div>

        <nav className="toolbar" aria-label="Controles del organismo">
          <button className={view === '3d' ? 'active' : ''} onClick={() => setView('3d')}>🌌 3D</button>
          <button className={view === '2d' ? 'active' : ''} onClick={() => setView('2d')}>🗺️ 2D</button>
          <select value={phase} onChange={(event) => setPhase(Number(event.target.value))} aria-label="Fase evolutiva">
            {PHASES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
          <button onClick={mutateNow}>🧬 Mutar Ahora</button>
          <button className={autogrow ? 'active' : ''} onClick={() => setAutogrow((value) => !value)}>🌱 Autocrecimiento</button>
          <button onClick={exportGenome}>⬇️ Genoma JSON</button>
        </nav>
      </header>

      <main className="stage">
        <canvas ref={canvasRef} className="cosmos" aria-label="Vista 3D del organismo Cordyceps Lingua" />
        <canvas ref={mapRef} className="map2d" aria-label="Mapa 2D de esporas lingüísticas" />

        <aside className="sidepanel">
          <h2>Biomasa lingüística</h2>
          <div className="stat"><span>Fase activa</span><strong>{phaseInfo.label}</strong></div>
          <div className="stat"><span>Descripción</span><strong>{phaseInfo.description}</strong></div>
          <div className="stat"><span>Esporas</span><strong>{genome.words.length}</strong></div>
          <div className="stat"><span>Mutaciones</span><strong>{genome.mutations}</strong></div>
          <div className="stat"><span>Autocrecimiento</span><strong>{autogrow ? 'Activo' : 'Inactivo'}</strong></div>

          <textarea
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            placeholder="Pega un poema, bitácora o texto para infectarlo con el Cordyceps Lingua..."
          />

          <div className="panel-actions">
            <button className="primary" onClick={ingestText}>🌱 Ingerir texto</button>
            <button onClick={resetGenome}>↺ Reiniciar</button>
          </div>

          <p className="hint">La distribución 3D usa una esfera Fibonacci para evitar columnas de palabras y conservar separación uniforme al crecer.</p>
          <div className="word-list" aria-live="polite">
            {latestWords.map((word) => <span className="word-chip" key={word}>{word}</span>)}
          </div>
        </aside>
      </main>

      {toast && <div className="toast" role="status" aria-live="polite">{toast}</div>}
    </div>
  );
}
