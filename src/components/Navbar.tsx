import { Bus, FileText, Send, PlusCircle, RotateCcw, History, Download, ShieldCheck, Building2 } from 'lucide-react';
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
    <header className="bg-[#0b192c] text-slate-100 border-b border-slate-800 sticky top-0 z-[1100] shadow-sm">
      {/* Top Municipal Institutional Ribbon */}
      <div className="bg-[#06101e] border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-1 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2 tracking-wide font-medium">
          <Building2 className="w-3 h-3 text-blue-400" />
          <span className="font-semibold text-slate-300">INTENDENCIA DE MONTEVIDEO</span>
          <span className="text-slate-600">•</span>
          <span>Departamento de Movilidad</span>
          <span className="text-slate-600 hidden md:inline">•</span>
          <span className="hidden md:inline">División Transporte</span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">
            EXP: {detour.code || 'STM-DEV-2025'}
          </span>
          <span className="text-emerald-400 hidden sm:inline flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-3 h-3" />
            Sistema Oficial STM
          </span>
        </div>
      </div>

      {/* Main Navbar Workspace Toolbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
        {/* Institutional Title & Coat Emblem */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-700 border border-blue-500/30 flex items-center justify-center text-white shadow-sm shrink-0">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black tracking-tight text-white uppercase">
                STM Desvíos Oficiales
              </h1>
              <span className="bg-blue-900/60 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-700/50 uppercase tracking-wider">
                Montevideo
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Resoluciones técnicas de corte de calzada, trazado de itinerarios y despacho oficial
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Cargar Ejemplo */}
          <button
            type="button"
            onClick={onLoadExample}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            title="Cargar resolución de ejemplo oficial en 18 de Julio"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Cargar Ejemplo</span>
          </button>

          {/* Nuevo Expediente */}
          <button
            type="button"
            onClick={onNewDetour}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            title="Iniciar nuevo expediente administrativo de desvío"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nuevo Expediente</span>
          </button>

          {/* Historial de envíos */}
          {receipts.length > 0 && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition flex items-center gap-1.5 cursor-pointer relative"
              title="Consultar historial de resoluciones y despachos emitidos"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Actas Emitidas</span>
              <span className="w-4 h-4 bg-emerald-500 text-slate-950 rounded-full font-black text-[10px] flex items-center justify-center">
                {receipts.length}
              </span>
            </button>
          )}

          {/* Generar / Ver PDF */}
          <button
            type="button"
            onClick={onOpenPreview}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Visualizar documento oficial del STM con membrete y cartografía"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Ver Documento</span>
          </button>

          {/* Descargar PDF directo */}
          <button
            type="button"
            onClick={onDownloadPdf}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-600 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Descargar archivo PDF oficial directamente a tu ordenador"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Descargar PDF</span>
          </button>

          {/* Enviar / Despachar */}
          <button
            type="button"
            onClick={onOpenSend}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs border border-blue-400/40 transition flex items-center gap-1.5 cursor-pointer"
            title="Despachar notificación oficial a cooperativas y empresas de transporte"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Despachar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
