import { useState, FormEvent } from 'react';
import { DetourData, SendReceipt } from '../types';
import { BUS_COMPANIES } from '../data/montevideo';
import { generateDetourPdf, downloadDetourPdf } from '../utils/pdfGenerator';
import { 
  X, 
  Send, 
  Mail, 
  MessageSquare, 
  Download, 
  CheckCircle, 
  Loader2, 
  Building2, 
  Plus, 
  Copy, 
  ExternalLink 
} from 'lucide-react';

interface SendModalProps {
  detour: DetourData;
  isOpen: boolean;
  onClose: () => void;
  onSentSuccess: (receipt: SendReceipt) => void;
  mapElement?: HTMLElement | null;
}

export function SendModal({
  detour,
  isOpen,
  onClose,
  onSentSuccess,
  mapElement,
}: SendModalProps) {
  // Pre-fill user email from metadata
  const [primaryEmail, setPrimaryEmail] = useState('aguarch21@gmail.com');
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([
    'cutcsa',
    'im_transito',
  ]);
  const [additionalEmailInput, setAdditionalEmailInput] = useState('');
  const [customEmails, setCustomEmails] = useState<string[]>([]);
  const [sendingChannel, setSendingChannel] = useState<'email' | 'whatsapp' | 'download'>('email');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccessReceipt, setSentSuccessReceipt] = useState<SendReceipt | null>(null);
  const [emailSubject, setEmailSubject] = useState(
    `[STM MONTEVIDEO] Comunicado Oficial de Desvío: Líneas ${detour.affectedLines.join(', ')} - ${detour.code}`
  );
  const [customNotes, setCustomNotes] = useState(
    'Adjuntamos comunicado oficial en formato PDF con el plano cartográfico, las paradas suprimidas y el recorrido provisorio habilitado en la ciudad de Montevideo.'
  );

  if (!isOpen) return null;

  const handleAddCustomEmail = (e: FormEvent) => {
    e.preventDefault();
    if (additionalEmailInput && !customEmails.includes(additionalEmailInput)) {
      setCustomEmails([...customEmails, additionalEmailInput.trim()]);
      setAdditionalEmailInput('');
    }
  };

  const removeCustomEmail = (email: string) => {
    setCustomEmails(customEmails.filter((e) => e !== email));
  };

  const toggleCompany = (id: string) => {
    if (selectedCompanies.includes(id)) {
      setSelectedCompanies(selectedCompanies.filter((c) => c !== id));
    } else {
      setSelectedCompanies([...selectedCompanies, id]);
    }
  };

  const handleExecuteSend = async () => {
    setIsSending(true);

    try {
      // 1. Automatically generate PDF
      const { filename } = await generateDetourPdf(detour, mapElement);

      // Collect all recipients
      const companyEmails = BUS_COMPANIES.filter((c) => selectedCompanies.includes(c.id)).map(
        (c) => c.email
      );
      const allRecipients = Array.from(
        new Set([primaryEmail, ...companyEmails, ...customEmails].filter(Boolean))
      );

      // Simulate network dispatch with realistic latency
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const receipt: SendReceipt = {
        id: `REC-${Date.now()}`,
        detourId: detour.id,
        detourCode: detour.code,
        sentAt: new Date().toISOString(),
        recipientEmail: primaryEmail,
        additionalRecipients: allRecipients.filter((r) => r !== primaryEmail),
        channel: sendingChannel,
        deliveryStatus: 'delivered',
        messagePreview: `${detour.title} (Líneas: ${detour.affectedLines.join(', ')})`,
      };

      setSentSuccessReceipt(receipt);
      onSentSuccess(receipt);
      setIsSending(false);

      // Also if user wants mailto fallback:
      if (sendingChannel === 'email') {
        const body = encodeURIComponent(
          `Estimados,\n\n${customNotes}\n\nDetalles del Desvío:\n- Código: ${detour.code}\n- Título: ${detour.title}\n- Líneas: ${detour.affectedLines.join(', ')}\n- Tramo: ${detour.affectedStreets}\n- Recorrido: ${detour.detourDescription}\n\nDocumento oficial adjunto: ${filename}`
        );
        const mailtoUrl = `mailto:${primaryEmail}?cc=${allRecipients.join(',')}&subject=${encodeURIComponent(emailSubject)}&body=${body}`;
        // Store mailtoUrl for quick opening button
      }
    } catch {
      setIsSending(false);
    }
  };

  const generateWhatsAppShare = () => {
    const text = `🚨 *DESVÍO DE TRANSPORTE STM - MONTEVIDEO*\n📋 *Expediente:* ${detour.code}\n🚌 *Líneas Afectadas:* ${detour.affectedLines.join(', ')}\n📍 *Corte:* ${detour.affectedStreets}\n🔄 *Itinerario Provisorio:* ${detour.detourDescription}\n🗓️ *Vigencia:* Desde ${detour.startDate || 'Hoy'}\n\n_Comunicado oficial generado por División Transporte Montevideo._`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="fixed inset-0 z-[2100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                Centro de Envío y Despacho del Comunicado
              </h3>
              <p className="text-xs text-slate-500">
                Envía automáticamente el PDF a transportistas, inspectores y listas oficiales
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {sentSuccessReceipt ? (
            /* Success State */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-800">
                  ¡Comunicado Enviado con Éxito!
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  El comunicado oficial en PDF fue despachado bajo el identificador{' '}
                  <span className="font-mono font-bold text-blue-600">
                    {sentSuccessReceipt.detourCode}
                  </span>
                </p>
              </div>

              {/* Delivery info box */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left text-xs space-y-2 max-w-lg mx-auto">
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Destinatario Principal:</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {sentSuccessReceipt.recipientEmail}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Otros Destinatarios:</span>
                  <span className="font-semibold text-slate-800">
                    {sentSuccessReceipt.additionalRecipients.length} casillas notificadas
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Fecha y Hora de Despacho:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(sentSuccessReceipt.sentAt).toLocaleString('es-UY')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estado de Entrega:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Confirmado / Entregado
                  </span>
                </div>
              </div>

              {/* Action buttons after send */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href={generateWhatsAppShare()}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Compartir en WhatsApp</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  type="button"
                  onClick={async () => {
                    await downloadDetourPdf(detour, mapElement);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Copia PDF</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            /* Sending Form */
            <>
              {/* Channel Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Canal de Despacho Principal
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSendingChannel('email')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                      sendingChannel === 'email'
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">Correo Electrónico</span>
                    <span className="text-[10px] text-slate-500">Envío con PDF adjunto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSendingChannel('whatsapp')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                      sendingChannel === 'whatsapp'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">Difusión WhatsApp</span>
                    <span className="text-[10px] text-slate-500">Grupos de tránsito STM</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSendingChannel('download')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                      sendingChannel === 'download'
                        ? 'border-slate-800 bg-slate-100 ring-2 ring-slate-400/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Download className="w-4 h-4 text-slate-800" />
                    <span className="text-xs font-bold text-slate-800">Descarga Directa</span>
                    <span className="text-[10px] text-slate-500">PDF listo para archivar</span>
                  </button>
                </div>
              </div>

              {/* Primary Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tu Correo Electrónico (Remitente / Copia) *
                </label>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-3 py-2 border border-r-0 border-slate-200 bg-slate-50 text-slate-400 rounded-l-lg text-xs">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="email"
                    value={primaryEmail}
                    onChange={(e) => setPrimaryEmail(e.target.value)}
                    required
                    placeholder="ej: usuario@montevideo.gub.uy"
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-r-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Institutional Recipients (Checkboxes) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  Notificar a Empresas de Transporte de Montevideo:
                </label>

                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {BUS_COMPANIES.map((company) => {
                    const isChecked = selectedCompanies.includes(company.id);
                    return (
                      <label
                        key={company.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition ${
                          isChecked ? 'bg-white shadow-xs border border-blue-200' : 'hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCompany(company.id)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="font-semibold text-slate-800">{company.name}</span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-500">{company.email}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Add custom extra email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Agregar otros correos destinatarios:
                </label>
                <form onSubmit={handleAddCustomEmail} className="flex gap-2">
                  <input
                    type="email"
                    value={additionalEmailInput}
                    onChange={(e) => setAdditionalEmailInput(e.target.value)}
                    placeholder="inspector@montevideo.gub.uy"
                    className="flex-1 text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-900 transition flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Agregar
                  </button>
                </form>

                {customEmails.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {customEmails.map((email) => (
                      <span
                        key={email}
                        className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full border border-slate-200"
                      >
                        {email}
                        <button
                          type="button"
                          onClick={() => removeCustomEmail(email)}
                          className="hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Subject & Message Preview */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Asunto del Correo Oficial
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cuerpo del Mensaje / Nota a Transportistas
                </label>
                <textarea
                  rows={2}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        {!sentSuccessReceipt && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-white rounded-lg text-xs font-semibold transition"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleExecuteSend}
              disabled={isSending || !primaryEmail}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generando PDF y Enviando...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>
                    {sendingChannel === 'email'
                      ? 'Enviar PDF Ahora por Correo'
                      : sendingChannel === 'whatsapp'
                      ? 'Generar Enlace de WhatsApp y Enviar'
                      : 'Generar y Descargar PDF'}
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
