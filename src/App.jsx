import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Copy, 
  Share2, 
  History, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Download,
  Layout,
  FileText,
  AlertCircle,
  Settings2,
  Image as ImageIcon,
  Upload,
  Network,
  Zap,
  Calendar,
  Layers,
  Search,
  MessageCircle,
  Send,
  BookOpen
} from 'lucide-react';

const NoXcuroApp = () => {
  // VISTAS PRINCIPALES
  const [currentView, setCurrentView] = useState('capture'); // capture, micelio, temporalChat, carousel
  const [text, setText] = useState('');
  const [processedText, setProcessedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFont, setSelectedFont] = useState('sans');
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const fileInputRef = useRef(null);

  // SISTEMA DE NODOS (Micelio)
  const [nodes, setNodes] = useState([
    {
      id: '0',
      text: 'Tengo tu lámpara en el buró, tu libro de incertidumbre cuántica, tus playeras para dormir, la piedra que me dejaste. Estoy rodeado de ti.',
      category: 'Identidad',
      tags: ['ausencia', 'presencia', 'objeto', 'memoria'],
      timestamp: new Date('2024-01-15'),
      semanticCore: 'La presencia del ausente',
      connections: ['1']
    },
    {
      id: '1',
      text: 'Y sin embargo, tu no estar es lo más presente que tengo. No existe nada que puedas hacer para perderme.',
      category: 'Cosmogonía',
      tags: ['paradoja', 'tiempo', 'gravitación'],
      timestamp: new Date('2024-01-16'),
      semanticCore: 'Orbita sin sol',
      connections: ['0']
    }
  ]);

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

  // FUNCIONES: Captura y procesamiento
  const handleCapture = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const metadata = {
        category: detectCategory(text),
        tags: extractTags(text),
        semanticCore: extractCore(text),
        connections: findConnections(text)
      };

      const newNode = {
        id: String(nodes.length),
        text: text,
        ...metadata,
        timestamp: new Date(),
        connections: []
      };

      setNodes([...nodes, newNode]);
      setProcessedText(text);
      setText('');
      setIsProcessing(false);
      setCurrentView('micelio');
    }, 1200);
  };

  const detectCategory = (text) => {
    const categories = ['Método', 'Cosmogonía', 'Museo', 'Escritura', 'Identidad', 'Leyes'];
    if (text.includes('tiempo') || text.includes('pasado') || text.includes('futuro')) return 'Cosmogonía';
    if (text.includes('yo') || text.includes('identidad') || text.includes('ser')) return 'Identidad';
    if (text.includes('escribir') || text.includes('palabra') || text.includes('lenguaje')) return 'Escritura';
    return categories[Math.floor(Math.random() * categories.length)];
  };

  const extractTags = (text) => {
    const keywords = text.match(/\b[a-záéíóú]{4,}\b/gi) || [];
    return [...new Set(keywords.slice(0, 5).map(k => k.toLowerCase()))];
  };

  const extractCore = (text) => {
    const sentences = text.split('.');
    return sentences[0].substring(0, 50) + '...';
  };

  const findConnections = (text) => {
    return nodes
      .filter(n => {
        const similarity = n.text.split(' ').filter(word => text.includes(word)).length;
        return similarity > 3;
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
      `En ${node.timestamp.toLocaleDateString('es-ES')}, escribiste: "${node.text.substring(0, 30)}...". Hoy tu pregunta es: "${userMessage}". ¿Ves la mutación?`,
      `Este núcleo ("${node.semanticCore}") ha reaparecido ${Math.floor(Math.random() * 5) + 1} veces en diferentes formas.`,
      `La esencia persiste pero se transforma. ¿Qué cambió entre entonces y ahora?`,
      `Encontré ${node.connections.length} textos conectados. ¿Quieres ver cómo evolucionó esta idea?`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
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
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Network className="text-purple-600" size={32} />
          <h1 className="text-4xl font-black text-slate-900">noXcuro</h1>
        </div>
        <p className="text-slate-600 italic text-lg">Sistema de Micelio Cognitivo</p>
        <p className="text-slate-500 text-sm mt-2">Arqueología + Proyección del pensamiento</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Captura sin fricción</span>
          <Zap size={16} className="text-purple-600" />
        </div>
        <textarea
          className="w-full h-96 p-6 focus:outline-none text-lg text-slate-700 placeholder:text-slate-300 resize-none leading-relaxed"
          placeholder="Escribe tu pensamiento. Puede ser fragmento, poema, observación, paradoja..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center">
          <p className="text-xs text-slate-400">{text.length} caracteres</p>
          <button
            onClick={handleCapture}
            disabled={!text || isProcessing}
            className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all ${
              isProcessing 
                ? 'bg-slate-100 text-slate-400' 
                : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg'
            }`}
          >
            {isProcessing ? <Sparkles className="animate-spin" size={18} /> : <Sparkles size={18} />}
            {isProcessing ? 'Tejiendo...' : 'Guardar al Micelio'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-white p-4 rounded-xl border border-slate-100">
          <FileText size={20} className="mx-auto text-purple-600 mb-2" />
          <p className="text-xs font-bold text-slate-600">{nodes.length} Nodos</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100">
          <Calendar size={20} className="mx-auto text-blue-600 mb-2" />
          <p className="text-xs font-bold text-slate-600">
            {new Date().toLocaleDateString('es-ES', { month: 'short' })}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100">
          <Network size={20} className="mx-auto text-emerald-600 mb-2" />
          <p className="text-xs font-bold text-slate-600">Conexiones activas</p>
        </div>
      </div>
    </div>
  );

  const renderMicelio = () => (
    <div className="max-w-6xl mx-auto p-4 animate-in fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black flex items-center gap-3">
            <Network className="text-purple-600" size={32} />
            Micelio Radial
          </h2>
          <p className="text-slate-500 text-sm mt-1">{nodes.length} nodos tejidos</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentView('capture')}
            className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-2 rounded-xl font-bold hover:bg-slate-50"
          >
            <Zap size={16} /> Capturar
          </button>
          <button
            onClick={() => setCurrentView('carousel')}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-purple-700"
          >
            <Layout size={16} /> Carrusel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grafo visual (simplificado) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-8 min-h-96 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-transparent to-blue-50 opacity-50"></div>
          
          <svg className="w-full h-full absolute inset-0" viewBox="0 0 500 400">
            {/* Líneas de conexión */}
            {nodes.map((node, i) =>
              node.connections.map(connId => (
                <line
                  key={`${node.id}-${connId}`}
                  x1={150 + (i * 80) % 300}
                  y1={150 + (i * 60) % 200}
                  x2={150 + (parseInt(connId) * 80) % 300}
                  y2={150 + (parseInt(connId) * 60) % 200}
                  stroke="#e5e7eb"
                  strokeWidth="2"
                  opacity="0.5"
                />
              ))
            )}

            {/* Nodos */}
            {nodes.map((node, i) => (
              <g key={node.id}>
                <circle
                  cx={150 + (i * 80) % 300}
                  cy={150 + (i * 60) % 200}
                  r="20"
                  fill={selectedNode?.id === node.id ? '#a855f7' : '#3b82f6'}
                  opacity="0.8"
                  style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                  onClick={() => handleNodeClick(node)}
                />
                <text
                  x={150 + (i * 80) % 300}
                  y={155 + (i * 60) % 200}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="white"
                  style={{ cursor: 'pointer', pointerEvents: 'none' }}
                >
                  {node.id}
                </text>
              </g>
            ))}
          </svg>

          <div className="relative z-10 text-center text-slate-400">
            <p className="text-sm">Haz clic en un nodo para explorar</p>
          </div>
        </div>

        {/* Panel lateral: Detalles del nodo */}
        <div className="space-y-4">
          {selectedNode ? (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-xs font-black">
                    {selectedNode.category}
                  </span>
                  <p className="text-xs text-slate-500 mt-2">
                    {selectedNode.timestamp.toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>

              <p className="text-sm font-bold text-purple-900 mb-3 italic">
                "{selectedNode.semanticCore}"
              </p>

              <p className="text-sm text-slate-700 mb-4 leading-relaxed">
                {selectedNode.text}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {selectedNode.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-white text-slate-600 rounded-full text-xs font-semibold">
                    #{tag}
                  </span>
                ))}
              </div>

              <button
                onClick={() => setCurrentView('temporalChat')}
                className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-purple-700"
              >
                <MessageCircle size={16} /> Conversar con esta versión
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center">
              <Network className="mx-auto text-slate-300 mb-3" size={32} />
              <p className="text-sm text-slate-500">Selecciona un nodo para ver sus detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTemporalChat = () => (
    <div className="max-w-2xl mx-auto p-4 animate-in fade-in">
      <button
        onClick={() => setCurrentView('micelio')}
        className="flex items-center gap-1 text-slate-500 font-bold mb-6"
      >
        <ChevronLeft size={20} /> Volver al Micelio
      </button>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-[600px]">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 border-b border-slate-200">
          <h3 className="font-black text-lg">Conversación Intertemporal</h3>
          <p className="text-purple-100 text-sm">Hablando con tu yo del {selectedNode?.timestamp.toLocaleDateString('es-ES')}</p>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
          {intertemporalChat.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs px-4 py-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                }`}
              >
                <p className="text-sm">{msg.message}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-200 bg-white flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleIntertemporalMessage()}
            placeholder="Pregunta a esta versión..."
            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <button
            onClick={handleIntertemporalMessage}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700 flex items-center gap-2"
          >
            <Send size={16} />
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