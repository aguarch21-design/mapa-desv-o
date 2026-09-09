import { useState, useEffect } from 'react';
import { DetourData } from '../types';
import { generateDetourPdf, downloadDetourPdf, GeneratedPdfResult } from '../utils/pdfGenerator';
import { 
  X, 
  Download, 
  Send, 
  Printer, 
  Loader2, 
  FileCheck, 
  AlertCircle,
  ExternalLink,
  Eye,
  FileText,
  CheckCircle2,
  Bus,
  Calendar,
  AlertTriangle,
  MapPin
} from 'lucide-react';

interface PdfPreviewModalProps {
  detour: DetourData;
  isOpen: boolean;
  onClose: () => void;
  onOpenSend: () => void;
  mapElement?: HTMLElement | null;
}

export function PdfPreviewModal({
  detour,
  isOpen,
  onClose,
  onOpenSend,
  mapElement,
}: PdfPreviewModalProps) {
  const [pdfResult, setPdfResult] = useState<GeneratedPdfResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'document' | 'raw_pdf'>('document');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPdfResult(null);
      setDownloadSuccess(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);
    setDownloadSuccess(false);

    generateDetourPdf(detour, mapElement)
      .then((res) => {
        if (isMounted) {
          setPdfResult(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.message || 'Error al compilar el documento PDF.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, detour, mapElement]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const res = await downloadDetourPdf(detour, mapElement);
      if (res.success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenNewTab = () => {
    if (pdfResult?.blobUrl) {
      window.open(pdfResult.blobUrl, '_blank');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const suprimidas = detour.stops.filter((s) => s.type === 'suprimida');
  const provisorias = detour.stops.filter((s) => s.type === 'provisoria');
  const filename = pdfResult?.filename || `Desvio_STM_${detour.code}.pdf`;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 animate-fade-in print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-5xl h-[94vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 print:h-auto print:border-none print:shadow-none">
        
        {/* Top Header Controls (Hidden during print) */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                  Documento Oficial de Desvío STM
                </h3>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                  {detour.code}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-[280px] sm:max-w-md">
                {filename}
              </p>
            </div>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-200/80 p-1 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('document')}
              className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'document'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>Vista Documento (HD)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('raw_pdf')}
              className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'raw_pdf'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>Visor PDF</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Abrir en pestaña nueva */}
            {pdfResult?.blobUrl && (
              <button
                type="button"
                onClick={handleOpenNewTab}
                className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                title="Abrir PDF en pestaña nueva del navegador"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden md:inline">Pestaña Nueva</span>
              </button>
            )}

            {/* Imprimir */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
              title="Imprimir documento oficial o Guardar como PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            {/* Botón principal de Descarga */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold flex items-center gap-2 transition shadow-xs disabled:opacity-50 cursor-pointer active:scale-95"
              title="Descargar archivo PDF directamente a tu dispositivo"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              ) : (
                <Download className="w-4 h-4 text-emerald-400" />
              )}
              <span>{isDownloading ? 'Descargando...' : 'Descargar PDF'}</span>
            </button>

            {/* Enviar */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSend();
              }}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar</span>
            </button>

            {/* Cerrar */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition ml-1 cursor-pointer"
              aria-label="Cerrar vista previa"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Download Success Banner Notification */}
        {downloadSuccess && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between gap-2 shadow-xs transition-all animate-fade-in print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                ¡Descarga iniciada con éxito! El archivo <strong>{filename}</strong> se guardó en tu equipo.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDownloadSuccess(false)}
              className="text-emerald-100 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Body */}
        <div className="flex-1 bg-slate-200/70 relative p-3 sm:p-6 overflow-y-auto flex items-start justify-center print:bg-white print:p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-600">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm font-medium">Preparando documento reglamentario...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-3 max-w-md my-auto">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Aviso de compilación</h4>
                <p className="text-xs mt-1">{error}</p>
              </div>
            </div>
          ) : viewMode === 'document' ? (
            /* Document Preview (A4 styled sheet - 100% visible in any browser/iframe) */
            <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl border border-slate-300 p-6 sm:p-10 font-sans text-slate-900 space-y-6 print:shadow-none print:border-none print:p-0">
              
              {/* STM Official Header */}
              <div className="bg-slate-900 -mx-6 sm:-mx-10 -mt-6 sm:-mt-10 p-6 text-white border-b-4 border-sky-500 rounded-t-xl print:rounded-none">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sky-400 text-xs font-black uppercase tracking-wider mb-1">
                      <Bus className="w-4 h-4" />
                      <span>Sistema de Transporte Metropolitano</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                      INTENDENCIA DE MONTEVIDEO — DIVISIÓN TRANSPORTE
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      COMUNICADO OFICIAL DE DESVÍO DE LÍNEAS DE TRANSPORTE COLECTIVO
                    </p>
                  </div>

                  <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-right">
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                      EXPEDIENTE OFICIAL
                    </span>
                    <span className="font-mono font-black text-sky-400 text-sm">
                      {detour.code}
                    </span>
                  </div>
                </div>
              </div>

              {/* Title & Status */}
              <div className="border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-700 mb-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  <span>AVISO TÉCNICO A EMPRESAS CONCESIONARIAS Y USUARIOS</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                  {detour.title}
                </h1>
              </div>

              {/* Detour Key Info Grid */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {/* Fechas */}
                <div className="space-y-1">
                  <span className="font-bold text-slate-500 uppercase tracking-wide block flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    Vigencia del Desvío:
                  </span>
                  <div className="font-semibold text-slate-800">
                    <div>Desde: <span className="font-bold">{detour.startDate ? new Date(detour.startDate).toLocaleString('es-UY', { dateStyle: 'short', timeStyle: 'short' }) : 'Inmediato'}</span></div>
                    <div>Hasta: <span className="font-bold">{detour.endDate ? new Date(detour.endDate).toLocaleString('es-UY', { dateStyle: 'short', timeStyle: 'short' }) : 'Hasta nuevo aviso'}</span></div>
                  </div>
                </div>

                {/* Causa y Sentido */}
                <div className="space-y-1">
                  <span className="font-bold text-slate-500 uppercase tracking-wide block flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Motivo / Sentido:
                  </span>
                  <p className="font-semibold text-slate-800">{detour.reason || 'Obras viales'}</p>
                  <p className="text-slate-600">
                    Sentido:{' '}
                    <span className="font-bold text-slate-900">
                      {detour.direction === 'hacia_centro'
                        ? 'Hacia el Centro'
                        : detour.direction === 'hacia_afuera'
                        ? 'Hacia Afuera / Periferia'
                        : 'Ambos Sentidos'}
                    </span>
                  </p>
                </div>

                {/* Tramo Interrumpido */}
                <div className="space-y-1">
                  <span className="font-bold text-slate-500 uppercase tracking-wide block flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-600" />
                    Tramo Interrumpido:
                  </span>
                  <p className="font-bold text-red-600 leading-snug">
                    {detour.affectedStreets || 'Sin especificar'}
                  </p>
                </div>
              </div>

              {/* Affected Lines */}
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Líneas de Ómnibus Afectadas ({detour.affectedLines.length}):
                </span>
                <div className="flex flex-wrap gap-2">
                  {detour.affectedLines.map((line) => (
                    <span
                      key={line}
                      className="bg-blue-600 text-white font-black text-xs px-3 py-1 rounded-md shadow-2xs flex items-center gap-1"
                    >
                      <Bus className="w-3 h-3 text-blue-200" />
                      <span>{line}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Cartographic Technical Diagram */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    Plano Cartográfico Técnico — Montevideo
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Coords: {detour.blockedPath.length} cortes • {detour.detourPath.length} puntos ruta
                  </span>
                </div>

                <div className="bg-slate-100 rounded-xl border border-slate-300 p-4 relative overflow-hidden">
                  <div className="h-44 w-full bg-slate-900 rounded-lg flex flex-col items-center justify-center p-4 relative text-white">
                    {/* Visual representation */}
                    <div className="w-full flex flex-col gap-3 max-w-md">
                      {/* Blocked line visual */}
                      <div className="bg-red-950/80 border border-red-500/50 p-2.5 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-red-500 flex items-center justify-center text-[8px] font-bold text-white">✕</span>
                          <span className="text-xs font-bold text-red-200">Tramo Cortado (Obra):</span>
                        </div>
                        <span className="text-xs font-mono font-semibold text-red-300 truncate max-w-[200px]">
                          {detour.affectedStreets || '18 de Julio entre Ejido y Yaguarón'}
                        </span>
                      </div>

                      {/* Detour line visual */}
                      <div className="bg-emerald-950/80 border border-emerald-500/50 p-2.5 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] font-bold text-white">✓</span>
                          <span className="text-xs font-bold text-emerald-200">Ruta de Desvío:</span>
                        </div>
                        <span className="text-xs font-semibold text-emerald-300">
                          {detour.detourPath.length > 0 ? `${detour.detourPath.length} waypoints trazados` : 'Itinerario alternativo por San José'}
                        </span>
                      </div>
                    </div>

                    <div className="absolute bottom-2 right-3 text-[10px] text-slate-400 font-mono">
                      STM Cartografía Oficial • Montevideo
                    </div>
                  </div>

                  {/* Legend below map */}
                  <div className="mt-2.5 pt-2 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-red-500"></span>
                      <span>Tramo Cortado</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
                      <span>Ruta Desvío</span>
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
              </div>

              {/* Itinerary Description */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Descripción Oficial del Recorrido Provisorio:
                </span>
                <div className="bg-amber-50 rounded-xl border border-amber-200 p-3.5 text-xs text-amber-950 leading-relaxed font-medium">
                  {detour.detourDescription || 'Continuar por ruta habitual y respetar la señalización instalada en la zona.'}
                </div>
              </div>

              {/* Paradas Suprimidas y Provisorias */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Suprimidas */}
                <div className="bg-red-50/70 rounded-xl border border-red-200 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-800 uppercase flex items-center gap-1">
                      <span>🚫</span> Paradas Suprimidas
                    </span>
                    <span className="bg-red-200 text-red-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {suprimidas.length}
                    </span>
                  </div>

                  {suprimidas.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">
                      No se registran paradas suprimidas en este tramo.
                    </p>
                  ) : (
                    <ul className="text-xs text-slate-700 space-y-1.5">
                      {suprimidas.map((s) => (
                        <li key={s.id} className="flex items-start gap-1.5">
                          <span className="text-red-500 font-bold">•</span>
                          <span className="font-medium">{s.name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Provisorias */}
                <div className="bg-emerald-50/70 rounded-xl border border-emerald-200 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1">
                      <span>🚏</span> Paradas Provisorias
                    </span>
                    <span className="bg-emerald-200 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {provisorias.length}
                    </span>
                  </div>

                  {provisorias.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">
                      Se utilizarán las paradas habituales del trayecto alternativo.
                    </p>
                  ) : (
                    <ul className="text-xs text-slate-700 space-y-1.5">
                      {provisorias.map((s) => (
                        <li key={s.id} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span className="font-medium">{s.name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Observations */}
              {detour.observations && (
                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-0.5">Observaciones:</span>
                  <p>{detour.observations}</p>
                </div>
              )}

              {/* Footer Signature & Seal */}
              <div className="pt-6 border-t border-slate-300 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-4">
                <div>
                  <p className="font-semibold text-slate-700">
                    Sistema de Transporte Metropolitano — Intendencia de Montevideo
                  </p>
                  <p>
                    Fecha de emisión: {new Date().toLocaleString('es-UY')} • Ref: {detour.code}
                  </p>
                </div>
                <div className="text-right">
                  <div className="border-b border-slate-400 w-44 mb-1"></div>
                  <span className="font-bold text-slate-800 uppercase tracking-wide">
                    DIVISIÓN TRANSPORTE
                  </span>
                </div>
              </div>

            </div>
          ) : (
            /* Raw PDF Viewer */
            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
              {pdfResult?.blobUrl ? (
                <iframe
                  id="pdf-preview-iframe"
                  src={pdfResult.blobUrl}
                  className="w-full h-full min-h-[500px] rounded-lg shadow-md border border-slate-300 bg-white"
                  title="Vista Previa de Desvío STM"
                />
              ) : (
                <div className="text-center p-8 bg-white rounded-xl shadow-xs border border-slate-200">
                  <p className="text-sm text-slate-600 mb-3">
                    El documento está listo. Puedes abrirlo directamente en tu navegador o descargarlo.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenNewTab}
                    className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs flex items-center gap-2 mx-auto cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Abrir PDF en pestaña nueva</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Banner */}
        <div className="px-4 sm:px-6 py-3 bg-white border-t border-slate-200 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-medium text-slate-700">
              Formato reglamentario para CUTCSA, COETC, UCOT, COME e Inspección General.
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownload}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar ({filename})</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
