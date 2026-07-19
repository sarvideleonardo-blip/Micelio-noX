import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles,
  Share2,
  History,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Layout,
  FileText,
  Settings2,
  Upload,
  Network,
  Zap,
  Calendar,
  Layers,
  Search,
  MessageCircle,
  Send
} from 'lucide-react';

const NoXcuroApp = () => {
  // VISTAS PRINCIPALES
  const [currentView, setCurrentView] = useState('capture'); // capture, micelio, temporalChat, carousel, archive
  const [text, setText] = useState('');
  const [processedText, setProcessedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFont, setSelectedFont] = useState('sans');
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const fileInputRef = useRef(null);

  // SIMBOLOS Y CONSTANTES
  const SIMBOLOS_CLAVE = [
    "Árbol Invertido", "Rayo Rosa", "Murciélago Rosa", "Calcetín Verde", 
    "Nave de Preguntas", "Guardián de Plumas Metálicas"
  ];

  const CATEGORIES = ["Método", "Cosmogonía", "Museo", "Escritura", "Identidad", "Leyes"];

  // SISTEMA DE NODOS (Micelio)
  const [nodes, setNodes] = useState([]);

  // FETCH NODOS REALES DESDE EL VAULT
  useEffect(() => {
    fetchNodes();
  }, []);

  const fetchNodes = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/nodes');
      const data = await response.json();
      const formattedNodes = data.map(node => ({
        ...node,
        timestamp: new Date(node.id.substring(0, 4), node.id.substring(4, 6) - 1, node.id.substring(6, 8)),
        connections: [], // En una versión futura, parsearíamos los links [[ ]] del texto
        temporal_anchor: { period: `${node.id.substring(0, 4)}-Q${Math.floor((parseInt(node.id.substring(4, 6)) + 2) / 3)}` },
        relations_explicit: [], // Extraer de mentions
        relations_semantic: [],
        recurrence_topics: []
      }));
      setNodes(formattedNodes);
    } catch (error) {
      console.error('Error cargando micelio real:', error);
    }
  };

  const [selectedNode, setSelectedNode] = useState(null);
  const [intertemporalChat, setIntertemporalChat] = useState([]);
  const [chatInput, setChatInput] = useState('');
  
  // Tipografías
  const fonts = {
    sans: 'font-sans font-normal tracking-tight',
    serif: 'font-serif italic tracking-tight',
    modern: 'font-sans font-bold uppercase tracking-widest',
    classic: 'font-serif font-normal'
  };

  // FUNCIONES: Captura y procesamiento con Pipeline Real
  const handleCapture = async () => {
    if (!text.trim()) return;
    setIsProcessing(true);
    
    try {
      // 1. Enviar al puente API para procesar con Python Pipeline
      const response = await fetch('http://localhost:3001/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (response.ok) {
        // 2. Recargar nodos para ver el nuevo nodo procesado
        await fetchNodes();
        setProcessedText(text);
        setText('');
        setCurrentView('micelio');
      }
    } catch (error) {
      console.error('Error en el pipeline del micelio:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const detectCategory = (text) => {
    const lower = text.toLowerCase();
    
    // Prioridad por sugerencia explícita (como en el pipeline)
    const suggestionMatch = text.match(/sugiero categoria:\s*([A-Za-z]+)/i);
    if (suggestionMatch) {
      const suggested = suggestionMatch[1].charAt(0).toUpperCase() + suggestionMatch[1].slice(1).toLowerCase();
      if (CATEGORIES.includes(suggested)) return suggested;
    }

    // Heurísticas por palabras clave
    const scores = {
      'Método': [/paso/g, /proceso/g, /guía/g, /iterar/g, /objetivo/g, /protocolo/g],
      'Cosmogonía': [/origen/g, /caos/g, /universo/g, /mito/g, /tiempo/g, /principio/g, /árbol/g, /rayo/g],
      'Museo': [/museo/g, /obra/g, /artista/g, /colección/g, /curador/g, /galería/g],
      'Escritura': [/escribir/g, /narrativa/g, /poema/g, /personaje/g, /estilo/g, /fragmento/g],
      'Identidad': [/yo/g, /identidad/g, /ser/g, /persona/g, /historia/g, /cambio/g, /dualidad/g],
      'Leyes': [/ley/g, /norma/g, /regla/g, /código/g, /legal/g, /obligación/g]
    };

    let bestCategory = 'Método';
    let maxScore = -1;

    Object.entries(scores).forEach(([cat, regexes]) => {
      let score = 0;
      regexes.forEach(re => {
        const matches = lower.match(re);
        if (matches) score += matches.length;
      });
      if (score > maxScore) {
        maxScore = score;
        bestCategory = cat;
      }
    });

    return bestCategory;
  };

  const runAgentEnrichment = (text, category) => {
    const lower = text.toLowerCase();
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    
    // Core Nucleus (primeras 60 letras del resumen)
    const core_nucleus = sentences[0] ? (sentences[0].substring(0, 60) + (sentences[0].length > 60 ? '...' : '')) : 'Sin núcleo';

    // Tags
    const tags = Array.from(new Set(text.match(/\b[a-záéíóúñ]{5,}\b/gi) || []))
      .slice(0, 5)
      .map(t => t.toLowerCase());

    // Símbolos
    const relations_explicit = SIMBOLOS_CLAVE.filter(s => lower.includes(s.toLowerCase())).map(s => `[[${s}]]`);

    // Temporal Anchor
    const now = new Date();
    const quarter = Math.floor((now.getMonth() + 3) / 3);
    const temporal_anchor = {
      period: `${now.getFullYear()}-Q${quarter}`,
      mood: '' // Podría extraerse con análisis de sentimiento simple
    };

    // Especialización por Agente (basado en el pipeline)
    let enrichment = {
      core_nucleus,
      tags,
      relations_explicit,
      relations_semantic: [],
      recurrence_topics: [],
      stage_cognitive: category.toLowerCase(),
      temporal_anchor,
      future_letter: { enabled: false, review_on: null }
    };

    if (category === 'Cosmogonía') {
      enrichment.recurrence_topics = ['origen', 'incertidumbre', 'transformación'];
      enrichment.relations_semantic = ['mitología-personal', 'caos-estructurado'];
    } else if (category === 'Identidad') {
      enrichment.recurrence_topics = ['persistencia', 'mutación', 'vínculos'];
      enrichment.relations_semantic = ['arqueología-del-yo'];
    }

    return enrichment;
  };

  const findConnections = (text, enrichment) => {
    const lower = text.toLowerCase();
    return nodes
      .filter(n => {
        // Similitud por tags
        const commonTags = n.tags.filter(t => enrichment.tags.includes(t));
        if (commonTags.length >= 2) return true;
        
        // Similitud por símbolos
        const commonSymbols = n.relations_explicit.filter(s => enrichment.relations_explicit.includes(s));
        if (commonSymbols.length >= 1) return true;

        // Similitud por categoría
        if (n.category === enrichment.category && Math.random() > 0.7) return true;

        return false;
      })
      .map(n => n.id);
  };

  // FUNCIONES: Micelio interactivo
  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setIntertemporalChat([
      {
        role: 'agent',
        message: `Detecté un núcleo central: "${node.semanticCore}". ¿Quieres explorar sus mutaciones en el tiempo?`
      }
    ]);
  };

  const handleIntertemporalMessage = () => {
    if (!chatInput.trim() || !selectedNode) return;

    const newChat = [
      ...intertemporalChat,
      { role: 'user', message: chatInput },
      {
        role: 'agent',
        message: generateAgentResponse(chatInput, selectedNode)
      }
    ];
    setIntertemporalChat(newChat);
    setChatInput('');
  };

  const generateAgentResponse = (userMessage, node) => {
    const responses = [
      `En el periodo ${node.temporal_anchor.period}, tu núcleo central era "${node.core_nucleus}". Hoy preguntas: "${userMessage}". Observa cómo la inestabilidad de tu identidad ha mutado este pensamiento.`,
      `Detecto una recurrencia en los temas: ${node.recurrence_topics.join(', ')}. ¿Sientes que esta pregunta actual es una iteración de esa misma obsesión?`,
      `Al escribir esto, tu "yo" estaba anclado en la categoría ${node.category}. Si respondiéramos desde la perspectiva de "Leyes", ¿qué cambiaría?`,
      `El símbolo ${node.relations_explicit[0] || 'del Árbol Invertido'} parece estar presente en tu inquietud. En arqueología cognitiva, esto sugiere una raíz profunda que aún no has desenterrado.`,
      `Esta versión tuya del ${node.timestamp.toLocaleDateString()} no buscaba respuestas, sino construir el espacio para lo inesperado. ¿Sigue siendo ese tu objetivo hoy?`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleFutureLetterToggle = (nodeId) => {
    setNodes(nodes.map(n => {
      if (n.id === nodeId) {
        return { 
          ...n, 
          future_letter: { 
            ...n.future_letter, 
            enabled: !n.future_letter.enabled,
            review_on: !n.future_letter.enabled ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 6).toISOString() : null // +6 meses
          } 
        };
      }
      return n;
    }));
  };

  // FUNCIONES: Carrusel
  const getSlides = (fullText) => {
    const lines = fullText.split('\n');
    const groupedSlides = [];
    let currentChunk = [];

    lines.forEach((line) => {
      currentChunk.push(line);
      if (currentChunk.length >= 15) {
        groupedSlides.push(currentChunk.join('\n'));
        currentChunk = [];
      }
    });

    if (currentChunk.length > 0) {
      groupedSlides.push(currentChunk.join('\n'));
    }

    return groupedSlides.length > 0 ? groupedSlides : [fullText];
  };

  const slides = getSlides(processedText);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setBackgroundImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // VISTAS
  const renderCapture = () => (
    <div className="max-w-4xl mx-auto space-y-8 p-4 animate-in fade-in duration-700">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="relative">
            <Network className="text-purple-600 animate-pulse" size={48} />
            <Sparkles className="absolute -top-2 -right-2 text-amber-400" size={20} />
          </div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter">noXcuro</h1>
        </div>
        <p className="text-slate-500 italic text-xl font-serif">"No es memoria estática. Es arqueología + proyección."</p>
        <div className="flex justify-center gap-4 mt-6">
          {CATEGORIES.map(cat => (
            <span key={cat} className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">
              {cat}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all hover:shadow-purple-100/50">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
            <span className="text-xs font-black text-purple-100 uppercase tracking-widest">Captura de Pensamiento Vivo</span>
          </div>
          <div className="flex gap-4">
            <button className="text-slate-400 hover:text-white transition-colors"><Layers size={18} /></button>
            <button className="text-slate-400 hover:text-white transition-colors"><Settings2 size={18} /></button>
          </div>
        </div>
        <textarea
          className="w-full h-[32rem] p-10 focus:outline-none text-xl text-slate-700 placeholder:text-slate-300 resize-none leading-relaxed font-serif"
          placeholder="Vierte aquí el fragmento, la paradoja o el mito... El micelio se encargará de tejerlo."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Métricas</p>
              <p className="text-sm font-bold text-slate-600">{text.length} caracteres</p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estado</p>
              <p className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 size={14} /> Listo
              </p>
            </div>
          </div>
          <button
            onClick={handleCapture}
            disabled={!text || isProcessing}
            className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-black transition-all transform active:scale-95 ${
              isProcessing 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-purple-600 text-white hover:bg-slate-900 shadow-xl shadow-purple-200'
            }`}
          >
            {isProcessing ? <Sparkles className="animate-spin" size={20} /> : <Zap size={20} />}
            {isProcessing ? 'PROCESANDO NÚCLEO...' : 'ENVIAR AL MICELIO'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Nodos Tejidos', value: nodes.length, icon: FileText, color: 'text-purple-600' },
          { label: 'Ciclo Actual', value: '2026-Q3', icon: Calendar, color: 'text-blue-600' },
          { label: 'Conexiones', value: nodes.reduce((acc, n) => acc + n.connections.length, 0), icon: Network, color: 'text-emerald-600' },
          { label: 'Símbolos', value: nodes.reduce((acc, n) => acc + n.relations_explicit.length, 0), icon: Sparkles, color: 'text-amber-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-purple-200 transition-colors">
            <stat.icon size={24} className={`${stat.color} mb-3`} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-slate-800">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMicelio = () => (
    <div className="max-w-[90rem] mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-4xl font-black tracking-tighter flex items-center gap-4 text-slate-900">
            <div className="p-2 bg-purple-600 rounded-xl text-white">
              <Network size={32} />
            </div>
            Micelio Radial
          </h2>
          <p className="text-slate-500 font-serif italic mt-2 text-lg">Observando la inestabilidad del pensamiento.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setCurrentView('capture')}
            className="flex items-center gap-2 bg-white border border-slate-200 px-8 py-3 rounded-2xl font-black hover:bg-slate-50 transition-all shadow-sm"
          >
            <Zap size={18} className="text-purple-600" /> Capturar nuevo
          </button>
          <button
            onClick={() => setCurrentView('carousel')}
            className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-2xl font-black hover:bg-purple-700 transition-all shadow-lg"
          >
            <Layout size={18} /> Proyectar Carrusel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Grafo visual mejorado */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-200 p-12 min-h-[700px] flex items-center justify-center relative overflow-hidden shadow-inner bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px]">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-transparent to-blue-50/50 pointer-events-none"></div>
          
          <svg className="w-full h-full absolute inset-0" viewBox="0 0 800 600">
            {/* El Centro: El Niño + Árbol Invertido */}
            <g transform="translate(400, 300)">
              <circle r="60" fill="white" stroke="#a855f7" strokeWidth="2" strokeDasharray="4 4" className="animate-[spin_20s_linear_infinite]" />
              <circle r="45" fill="#faf5ff" stroke="#a855f7" strokeWidth="1" />
              <text textAnchor="middle" dy="5" fontSize="10" fontWeight="900" fill="#7e22ce" className="uppercase tracking-widest">Origen</text>
              <Sparkles className="text-purple-400" x="-12" y="-30" size={24} />
            </g>

            {/* Líneas de conexión */}
            {nodes.map((node, i) => {
              const angle = (i / nodes.length) * 2 * Math.PI;
              const radius = 200 + (i % 3) * 40;
              const x1 = 400 + Math.cos(angle) * radius;
              const y1 = 300 + Math.sin(angle) * radius;

              // Conexión al origen
              return (
                <line
                  key={`origin-${node.id}`}
                  x1="400" y1="300"
                  x2={x1} y2={y1}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              );
            })}

            {/* Conexiones entre nodos */}
            {nodes.map((node, i) => {
              const angle1 = (i / nodes.length) * 2 * Math.PI;
              const radius1 = 200 + (i % 3) * 40;
              const x1 = 400 + Math.cos(angle1) * radius1;
              const y1 = 300 + Math.sin(angle1) * radius1;

              return node.connections.map(connId => {
                const targetIdx = nodes.findIndex(n => n.id === connId);
                if (targetIdx === -1) return null;
                const angle2 = (targetIdx / nodes.length) * 2 * Math.PI;
                const radius2 = 200 + (targetIdx % 3) * 40;
                const x2 = 400 + Math.cos(angle2) * radius2;
                const y2 = 300 + Math.sin(angle2) * radius2;

                return (
                  <path
                    key={`conn-${node.id}-${connId}`}
                    d={`M ${x1} ${y1} Q 400 300 ${x2} ${y2}`}
                    fill="none"
                    stroke={selectedNode?.id === node.id || selectedNode?.id === connId ? '#a855f7' : '#cbd5e1'}
                    strokeWidth={selectedNode?.id === node.id || selectedNode?.id === connId ? '2' : '1'}
                    opacity={selectedNode?.id === node.id || selectedNode?.id === connId ? '0.8' : '0.3'}
                    className="transition-all duration-500"
                  />
                );
              });
            })}

            {/* Nodos */}
            {nodes.map((node, i) => {
              const angle = (i / nodes.length) * 2 * Math.PI;
              const radius = 200 + (i % 3) * 40;
              const x = 400 + Math.cos(angle) * radius;
              const y = 300 + Math.sin(angle) * radius;

              return (
                <g key={node.id} className="cursor-pointer" onClick={() => handleNodeClick(node)}>
                  <circle
                    cx={x} cy={y}
                    r={selectedNode?.id === node.id ? "18" : "12"}
                    fill={selectedNode?.id === node.id ? '#a855f7' : '#ffffff'}
                    stroke={selectedNode?.id === node.id ? '#ffffff' : '#cbd5e1'}
                    strokeWidth="3"
                    className="transition-all duration-300 shadow-lg"
                  />
                  {selectedNode?.id === node.id && (
                    <circle cx={x} cy={y} r="25" fill="none" stroke="#a855f7" strokeWidth="1" className="animate-ping" />
                  )}
                  <text
                    x={x} y={y + 30}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill={selectedNode?.id === node.id ? '#7e22ce' : '#94a3b8'}
                    className="uppercase tracking-widest pointer-events-none"
                  >
                    {node.category}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="absolute bottom-10 left-10 flex gap-4">
            <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
              <div className="w-3 h-3 rounded-full bg-purple-600" /> Selección
            </div>
            <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
              <div className="w-3 h-3 rounded-full bg-slate-200 border border-slate-300" /> Nodo
            </div>
          </div>
        </div>

        {/* Panel lateral: Arqueología del Pensamiento */}
        <div className="lg:col-span-4 space-y-6 overflow-y-auto max-h-[700px] pr-2 custom-scrollbar">
          {selectedNode ? (
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="px-4 py-1.5 bg-purple-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                    {selectedNode.category}
                  </span>
                  <div className="flex items-center gap-2 mt-3 text-slate-400">
                    <Calendar size={14} />
                    <p className="text-xs font-bold">
                      {selectedNode.timestamp.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
                  <Share2 size={18} />
                </div>
              </div>

              <h3 className="text-2xl font-black text-slate-900 leading-tight mb-4 font-serif italic">
                "{selectedNode.core_nucleus}"
              </h3>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                <p className="text-lg text-slate-700 leading-relaxed font-serif italic">
                  {selectedNode.text}
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Símbolos Detectados</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedNode.relations_explicit.length > 0 ? selectedNode.relations_explicit.map(s => (
                      <span key={s} className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg text-xs font-black">
                        {s}
                      </span>
                    )) : <p className="text-xs text-slate-400 italic">Ningún símbolo detectado.</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Afinidad Semántica</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedNode.relations_semantic.map(r => (
                        <span key={r} className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">#{r}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ancla Temporal</p>
                    <p className="text-xs font-black text-slate-600 flex items-center gap-1">
                      <History size={12} /> {selectedNode.temporal_anchor.period}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex gap-3">
                  <button
                    onClick={() => setCurrentView('temporalChat')}
                    className="flex-1 bg-purple-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-lg shadow-purple-100"
                  >
                    <MessageCircle size={18} /> Conversar
                  </button>
                  <button
                    className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all"
                    title="Marcar para revisión futura"
                  >
                    <Calendar size={18} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-[2.5rem] p-12 border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center h-full">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6">
                <Search className="text-slate-200" size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Arqueología Activa</h3>
              <p className="text-slate-400 text-sm mt-4 font-serif italic max-w-[200px]">
                Selecciona un nodo del micelio para explorar su estructura profunda.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTemporalChat = () => (
    <div className="max-w-4xl mx-auto p-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => setCurrentView('micelio')}
          className="flex items-center gap-2 text-slate-500 font-black text-xs uppercase tracking-widest hover:text-purple-600 transition-colors"
        >
          <ChevronLeft size={20} /> Volver al Micelio
        </button>
        <div className="flex items-center gap-3 bg-purple-50 px-4 py-2 rounded-full border border-purple-100">
          <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
          <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest">Sincronía Intertemporal Activa</span>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[750px]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-10 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center text-3xl">
              {selectedNode?.category === 'Cosmogonía' ? '🌌' : '🧠'}
            </div>
            <div>
              <h3 className="font-black text-2xl tracking-tighter">Conversación con tu versión {selectedNode?.temporal_anchor.period}</h3>
              <p className="text-purple-300 font-serif italic text-sm">"Lo que escribiste persiste, lo que eres hoy muta."</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Núcleo de Referencia</p>
            <p className="text-xs font-bold text-slate-300 italic">"{selectedNode?.core_nucleus}"</p>
          </div>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-[radial-gradient(#f1f5f9_1px,transparent_1px)] [background-size:20px_20px]">
          {intertemporalChat.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xl px-8 py-6 rounded-[2rem] shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white rounded-br-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none font-serif italic text-lg leading-relaxed'
                }`}
              >
                <p>{msg.message}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-8 border-t border-slate-100 bg-white flex gap-4">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleIntertemporalMessage()}
            placeholder="Pregunta a tu yo del pasado sobre este pensamiento..."
            className="flex-1 px-8 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-lg"
          />
          <button
            onClick={handleIntertemporalMessage}
            className="bg-purple-600 text-white px-8 py-5 rounded-2xl font-black hover:bg-slate-900 transition-all flex items-center gap-3 shadow-xl shadow-purple-100"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderCarousel = () => (
    <div className="max-w-5xl mx-auto p-4 animate-in zoom-in-95">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => setCurrentView('micelio')} className="flex items-center gap-1 text-slate-500 font-bold">
          <ChevronLeft size={20} /> Volver
        </button>
        
        <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200">
          {Object.keys(fonts).map(f => (
            <button
              key={f}
              onClick={() => setSelectedFont(f)}
              className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${
                selectedFont === f ? 'bg-slate-900 text-white' : 'text-slate-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Carrusel */}
        <div className="lg:col-span-7">
          <div
            className="relative aspect-square rounded-xl shadow-2xl flex flex-col justify-start p-10 md:p-14 group transition-all bg-white border border-slate-200 overflow-hidden"
            style={{
              backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {backgroundImage && <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>}

            <div className={`relative z-10 text-left ${fonts[selectedFont]} text-slate-800`}>
              <p className="text-xl md:text-2xl leading-relaxed whitespace-pre-wrap">
                {slides[currentSlide]}
              </p>
            </div>

            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all ${
                    i === currentSlide ? 'w-8 bg-purple-600' : 'w-2 bg-slate-300'
                  }`}
                />
              ))}
            </div>

            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                disabled={currentSlide === 0}
                onClick={() => setCurrentSlide(p => p - 1)}
                className="p-3 bg-white/90 rounded-full shadow-xl disabled:opacity-0"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                disabled={currentSlide === slides.length - 1}
                onClick={() => setCurrentSlide(p => p + 1)}
                className="p-3 bg-white/90 rounded-full shadow-xl disabled:opacity-0"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 font-bold uppercase tracking-widest mt-3">
            Slide {currentSlide + 1} de {slides.length}
          </p>
        </div>

        {/* Controles */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-black flex items-center gap-2">
              <Settings2 size={18} className="text-purple-600" /> Diseño
            </h3>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3">
                Fondo personalizado
              </label>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-lg hover:border-purple-400 hover:bg-purple-50"
              >
                <Upload className="text-slate-300" size={20} />
                <span className="text-xs font-bold">Subir imagen</span>
              </button>
            </div>

            <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-purple-700">
              <Download size={18} /> Descargar {slides.length} Imágenes
            </button>
          </div>

          <div className="bg-slate-900 p-4 rounded-lg text-xs text-slate-300 leading-relaxed">
            <p>
              Tu texto ha sido dividido en {slides.length} slides optimizados para visualización. Cada fragmento mantiene la integridad semántica.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 font-sans text-slate-900">
      <nav className="p-6 border-b border-slate-200 bg-white/70 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-black">
              nX
            </div>
            <div>
              <p className="font-black text-sm uppercase tracking-tighter">noXcuro</p>
              <p className="text-[10px] text-slate-500">Micelio Cognitivo</p>
            </div>
          </div>

          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setCurrentView('capture')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                currentView === 'capture'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Capturar
            </button>
            <button
              onClick={() => setCurrentView('micelio')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                currentView === 'micelio'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Micelio
            </button>
          </div>
        </div>
      </nav>

      <main className="py-8 px-4">
        {currentView === 'capture' && renderCapture()}
        {currentView === 'micelio' && renderMicelio()}
        {currentView === 'temporalChat' && renderTemporalChat()}
        {currentView === 'carousel' && renderCarousel()}
      </main>
    </div>
  );
};

export default NoXcuroApp;
