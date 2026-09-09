import { SendReceipt } from '../types';
import { X, CheckCircle, Mail, MessageSquare, Download, Calendar, ArrowRight } from 'lucide-react';

interface HistoryModalProps {
  receipts: SendReceipt[];
  isOpen: boolean;
  onClose: () => void;
}

export function HistoryModal({ receipts, isOpen, onClose }: HistoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 max-h-[85vh]">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-base">
              Historial de Comunicados Despachados
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {receipts.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              Aún no has despachado ningún comunicado de desvío.
            </div>
          ) : (
            receipts.map((receipt) => (
              <div
                key={receipt.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {receipt.detourCode}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(receipt.sentAt).toLocaleString('es-UY')}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-800">
                  {receipt.messagePreview}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    {receipt.channel === 'email' ? (
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                    ) : receipt.channel === 'whatsapp' ? (
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                    )}
                    <span>Para: {receipt.recipientEmail}</span>
                    {receipt.additionalRecipients.length > 0 && (
                      <span className="text-slate-400">
                        (+{receipt.additionalRecipients.length} casillas)
                      </span>
                    )}
                  </div>

                  <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                    Entregado
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
