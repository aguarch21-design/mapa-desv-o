import { Bus, FileText, Send, PlusCircle, RotateCcw, History, Download } from 'lucide-react';
import { DetourData, SendReceipt } from '../types';

interface NavbarProps {
  detour: DetourData;
  receipts: SendReceipt[];
  onNewDetour: () => void;
  onLoadExample: () => void;
  onOpenPreview: () => void;
  onDownloadPdf: () => void;
  onOpenSend: () => void;
  onOpenHistory: () => void;
}

export function Navbar({
  detour,
  receipts,
  onNewDetour,
  onLoadExample,
  onOpenPreview,
  onDownloadPdf,
  onOpenSend,
  onOpenHistory,
}: NavbarProps) {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-[1100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight text-white">
                STM Desvíos
              </h1>
              <span className="bg-blue-900/70 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-700/50 uppercase tracking-wide">
                Montevideo
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Generador oficial de avisos cartográficos y despacho de desvíos
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Cargar Ejemplo */}
          <button
            type="button"
            onClick={onLoadExample}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
            title="Cargar desvío de ejemplo en 18 de Julio"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Ejemplo</span>
          </button>

          {/* Nuevo */}
          <button
            type="button"
            onClick={onNewDetour}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
            title="Iniciar nuevo desvío desde cero"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nuevo</span>
          </button>

          {/* Historial de envíos */}
          {receipts.length > 0 && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer relative"
              title="Ver historial de comunicados enviados"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Envíos</span>
              <span className="w-4 h-4 bg-emerald-500 text-slate-900 rounded-full font-bold text-[10px] flex items-center justify-center">
                {receipts.length}
              </span>
            </button>
          )}

          {/* Generar / Ver PDF */}
          <button
            type="button"
            onClick={onOpenPreview}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            title="Ver comunicado oficial y mapa"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Ver Documento</span>
          </button>

          {/* Descargar PDF directo */}
          <button
            type="button"
            onClick={onDownloadPdf}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Descargar archivo PDF directamente"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Descargar PDF</span>
          </button>

          {/* Enviar */}
          <button
            type="button"
            onClick={onOpenSend}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/30 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Enviar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
