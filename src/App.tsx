import { useState, useRef, useEffect, useCallback } from 'react';
import { DetourData, SendReceipt } from './types';
import { SAMPLE_DETOUR } from './data/montevideo';
import { Navbar } from './components/Navbar';
import { MapEditor } from './components/MapEditor';
import { DetourForm } from './components/DetourForm';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { SendModal } from './components/SendModal';
import { HistoryModal } from './components/HistoryModal';
import { downloadDetourPdf } from './utils/pdfGenerator';
import { 
  FileText, 
  Send, 
  Info, 
  MapPin, 
  Bus, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Download,
  Loader2,
  X
} from 'lucide-react';

export default function App() {
  const [detour, setDetour] = useState<DetourData>(() => {
    const saved = localStorage.getItem('stm_current_detour');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return SAMPLE_DETOUR;
  });

  const [receipts, setReceipts] = useState<SendReceipt[]>(() => {
    const saved = localStorage.getItem('stm_send_receipts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [];
  });

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'both' | 'map' | 'form'>('both');
  const [mapContainerElement, setMapContainerElement] = useState<HTMLElement | null>(null);
  const [isDirectDownloading, setIsDirectDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save current detour to localStorage
  useEffect(() => {
    localStorage.setItem('stm_current_detour', JSON.stringify(detour));
  }, [detour]);

  // Save receipts to localStorage
  useEffect(() => {
    localStorage.setItem('stm_send_receipts', JSON.stringify(receipts));
  }, [receipts]);

  const handleUpdateDetour = useCallback((updated: Partial<DetourData>) => {
    setDetour((prev) => ({
      ...prev,
      ...updated,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const handleDownloadPdfDirectly = async () => {
    setIsDirectDownloading(true);
    setToastMessage('Generando documento PDF reglamentario...');
    try {
      const res = await downloadDetourPdf(detour, mapContainerElement);
      if (res.success) {
        setToastMessage(`¡Descarga lista! Se guardó: ${res.filename}`);
        setTimeout(() => setToastMessage(null), 5000);
      } else {
        setToastMessage('Abre la vista previa para ver o imprimir el documento.');
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch {
      setToastMessage('Se completó el proceso.');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsDirectDownloading(false);
    }
  };

  const handleNewDetour = () => {
    const randomCode = `STM-DEV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    setDetour({
      id: `dev-${Date.now()}`,
      code: randomCode,
      title: 'Nuevo Desvío de Buses en Montevideo',
      reason: 'Reparación de calzada / Obras viales',
      affectedLines: ['104', '180'],
      direction: 'hacia_centro',
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16),
      affectedStreets: '',
      detourDescription: '',
      observations: 'Operación coordinada con empresas concesionarias del STM.',
      stops: [],
      blockedPath: [],
      detourPath: [],
      status: 'borrador',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleLoadExample = () => {
    setDetour(SAMPLE_DETOUR);
  };

  const handleSentSuccess = (receipt: SendReceipt) => {
    setReceipts((prev) => [receipt, ...prev]);
    setDetour((prev) => ({ ...prev, status: 'enviado' }));
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans">
      {/* Top Navigation */}
      <Navbar
        detour={detour}
        receipts={receipts}
        onNewDetour={handleNewDetour}
        onLoadExample={handleLoadExample}
        onOpenPreview={() => setIsPreviewOpen(true)}
        onDownloadPdf={handleDownloadPdfDirectly}
        onOpenSend={() => setIsSendOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-[2200] max-w-md bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Quick Instructions & Stats Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Bus className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  Desvío Activo:
                </span>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {detour.title || 'Sin título'}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  {detour.code}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Traza en el mapa el corte y la ruta de desvío; visualiza la hoja oficial y descarga el PDF al instante.
              </p>
            </div>
          </div>

          {/* Quick Metrics & Direct Download */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <div className="bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="text-slate-600">Corte:</span>
              <span className="font-bold text-slate-900">{detour.blockedPath.length}</span>
            </div>

            <div className="bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600">Desvío:</span>
              <span className="font-bold text-slate-900">{detour.detourPath.length}</span>
            </div>

            <div className="bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-slate-600">Paradas:</span>
              <span className="font-bold text-slate-900">{detour.stops.length}</span>
            </div>

            {/* Direct Download in bar */}
            <button
              type="button"
              onClick={handleDownloadPdfDirectly}
              disabled={isDirectDownloading}
              className="bg-slate-800 hover:bg-slate-900 text-emerald-400 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
              title="Descargar archivo PDF directamente a tu equipo"
            >
              {isDirectDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Descargar PDF</span>
            </button>

            {/* Direct Send button in bar */}
            <button
              type="button"
              onClick={() => setIsSendOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar</span>
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Montevideo Interactive Map (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                Mapa Interactivo de Montevideo (STM)
              </h2>
              <span className="text-xs text-slate-500">
                Selecciona la herramienta y haz clic sobre el mapa
              </span>
            </div>

            <MapEditor
              detour={detour}
              onChange={handleUpdateDetour}
              mapRefProp={(el) => setMapContainerElement(el)}
            />

            {/* Helpful legend under map */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-600 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-600 flex items-center justify-center text-white text-[9px] font-bold">✕</span>
                <span>Tramo Cortado (Obra)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[9px] font-bold">✓</span>
                <span>Ruta de Desvío</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>🚫</span>
                <span>Parada Suprimida</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>🚏</span>
                <span>Parada Provisoria</span>
              </div>
            </div>
          </div>

          {/* Right Column: Detour Specification Form (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <DetourForm detour={detour} onChange={handleUpdateDetour} />

            {/* Quick Action Box */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Acción Final
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Listo para emitir
                </span>
              </div>

              <h3 className="font-bold text-base text-white">
                Generar Documento Oficial y Enviar
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Crea automáticamente el PDF formal del Sistema de Transporte Metropolitano con el plano cartográfico, las paradas suprimidas y provisorias, y notifica a las cooperativas de Montevideo.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  title="Ver documento oficial en alta definición y visor"
                >
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>Ver Documento</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdfDirectly}
                  disabled={isDirectDownloading}
                  className="w-full bg-emerald-700 hover:bg-emerald-600 text-white py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
                  title="Descargar PDF inmediatamente"
                >
                  {isDirectDownloading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Download className="w-4 h-4 text-emerald-200" />
                  )}
                  <span>Descargar PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSendOpen(true)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Ahora</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <PdfPreviewModal
        detour={detour}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onOpenSend={() => setIsSendOpen(true)}
        mapElement={mapContainerElement}
      />

      <SendModal
        detour={detour}
        isOpen={isSendOpen}
        onClose={() => setIsSendOpen(false)}
        onSentSuccess={handleSentSuccess}
        mapElement={mapContainerElement}
      />

      <HistoryModal
        receipts={receipts}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
}
