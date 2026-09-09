import jsPDF from 'jspdf';
import { DetourData } from '../types';

export interface GeneratedPdfResult {
  doc: jsPDF;
  blob: Blob;
  dataUri: string;
  blobUrl: string;
  filename: string;
}

export async function generateDetourPdf(
  detour: DetourData,
  _mapElement?: HTMLElement | null
): Promise<GeneratedPdfResult> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Header Banner - Official STM / Montevideo Transit style
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Accent band (Montevideo blue / turquoise)
  doc.setFillColor(14, 165, 233); // Sky 500
  doc.rect(0, 28, pageWidth, 3, 'F');

  // Title in header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('SISTEMA DE TRANSPORTE METROPOLITANO', margin, 12);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('INTENDENCIA DE MONTEVIDEO — DIVISIÓN TRANSPORTE', margin, 18);
  doc.text('COMUNICADO OFICIAL DE DESVÍO DE LÍNEAS DE TRANSPORTE COLECTIVO', margin, 24);

  // Detour Code Badge (Top Right)
  doc.setFillColor(51, 65, 85);
  doc.roundedRect(pageWidth - margin - 52, 7, 52, 14, 2, 2, 'F');
  doc.setTextColor(241, 245, 249);
  doc.setFontSize(7.5);
  doc.text('EXPEDIENTE / CÓDIGO', pageWidth - margin - 48, 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(56, 189, 248);
  doc.text(detour.code, pageWidth - margin - 48, 18);

  let currentY = 38;

  // Title of the detour
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  const titleLines = doc.splitTextToSize(detour.title, contentWidth);
  doc.text(titleLines, margin, currentY);
  currentY += titleLines.length * 6 + 2;

  // Key details container
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, contentWidth, 34, 2, 2, 'FD');

  // Column 1: Fechas y Vigencia
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('VIGENCIA DEL DESVÍO:', margin + 4, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  const startFmt = detour.startDate ? new Date(detour.startDate).toLocaleString('es-UY', { dateStyle: 'short', timeStyle: 'short' }) : 'Inmediato';
  const endFmt = detour.endDate ? new Date(detour.endDate).toLocaleString('es-UY', { dateStyle: 'short', timeStyle: 'short' }) : 'Hasta nuevo aviso';
  doc.text(`Desde: ${startFmt}`, margin + 4, currentY + 11);
  doc.text(`Hasta: ${endFmt}`, margin + 4, currentY + 16);

  // Column 2: Motivo y Sentido
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('MOTIVO / CAUSA:', margin + 65, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  const reasonLines = doc.splitTextToSize(detour.reason || 'Obras y reparaciones en calzada', 60);
  doc.text(reasonLines.slice(0, 2), margin + 65, currentY + 11);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('SENTIDO:', margin + 65, currentY + 22);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  const directionText = detour.direction === 'hacia_centro' ? 'Hacia el Centro' : detour.direction === 'hacia_afuera' ? 'Hacia Afuera / Periferia' : 'Ambos Sentidos';
  doc.text(directionText, margin + 65, currentY + 27);

  // Column 3: Tramo afectado
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('ZONA / TRAMO INTERRUMPIDO:', margin + 128, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(220, 38, 38); // Red
  const streetLines = doc.splitTextToSize(detour.affectedStreets || 'Sin especificar', 50);
  doc.text(streetLines.slice(0, 3), margin + 128, currentY + 11);

  currentY += 40;

  // Affected Lines Badges
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('LÍNEAS DE TRANSPORTE AFECTADAS:', margin, currentY);
  currentY += 4;

  let badgeX = margin;
  detour.affectedLines.forEach((line) => {
    const textWidth = doc.getTextWidth(line);
    const badgeW = Math.max(textWidth + 8, 14);
    
    // Badge background
    doc.setFillColor(37, 99, 235); // Blue
    doc.roundedRect(badgeX, currentY, badgeW, 7, 1.5, 1.5, 'F');
    
    // Line number
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(line, badgeX + (badgeW - textWidth) / 2, currentY + 5);

    badgeX += badgeW + 3;
    if (badgeX > pageWidth - margin - 20) {
      badgeX = margin;
      currentY += 9;
    }
  });

  currentY += 12;

  // Plano Cartográfico Técnico de Montevideo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('PLANO CARTOGRÁFICO DEL DESVÍO (MONTEVIDEO):', margin, currentY);
  currentY += 4;

  const mapBoxH = 75;

  // Draw crisp, vector-based cartographic schematic that scales perfectly and never freezes
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, mapBoxH, 2, 2, 'FD');

  // Technical map grid background
  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(0.3);
  for (let gx = margin + 15; gx < margin + contentWidth; gx += 20) {
    doc.line(gx, currentY, gx, currentY + mapBoxH);
  }
  for (let gy = currentY + 15; gy < currentY + mapBoxH; gy += 15) {
    doc.line(margin, gy, margin + contentWidth, gy);
  }

  // Header inside map
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Croquis Técnico de Tránsito — STM Montevideo', margin + 6, currentY + 7);

  // Compass / North arrow
  const compassX = margin + contentWidth - 14;
  const compassY = currentY + 8;
  doc.setFillColor(226, 232, 240);
  doc.circle(compassX, compassY, 5, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('N', compassX - 1.5, compassY - 1);
  doc.setDrawColor(239, 68, 68);
  doc.setLineWidth(0.8);
  doc.line(compassX, compassY + 3, compassX, compassY - 2);

  // Collect all coordinates to compute coordinate bounds
  const allCoords: [number, number][] = [
    ...detour.blockedPath,
    ...detour.detourPath,
    ...detour.stops.map((s) => [s.lat, s.lng] as [number, number]),
  ];

  if (allCoords.length >= 2) {
    const lats = allCoords.map((c) => c[0]);
    const lngs = allCoords.map((c) => c[1]);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latSpan = Math.max(maxLat - minLat, 0.003);
    const lngSpan = Math.max(maxLng - minLng, 0.003);

    const padX = 22;
    const padY = 16;
    const drawW = contentWidth - padX * 2;
    const drawH = mapBoxH - padY * 2;

    const toX = (lng: number) => margin + padX + ((lng - minLng) / lngSpan) * drawW;
    const toY = (lat: number) => currentY + mapBoxH - padY - ((lat - minLat) / latSpan) * drawH;

    // 1. Draw Blocked Path (Red dashed line with crosses)
    if (detour.blockedPath.length >= 2) {
      doc.setDrawColor(239, 68, 68);
      doc.setLineWidth(2.2);
      for (let i = 0; i < detour.blockedPath.length - 1; i++) {
        const p1 = detour.blockedPath[i];
        const p2 = detour.blockedPath[i + 1];
        doc.line(toX(p1[1]), toY(p1[0]), toX(p2[1]), toY(p2[0]));
      }

      // Draw red barrier markers on blocked points
      detour.blockedPath.forEach((pt) => {
        const px = toX(pt[1]);
        const py = toY(pt[0]);
        doc.setFillColor(239, 68, 68);
        doc.circle(px, py, 2.2, 'F');
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.6);
        doc.line(px - 1.2, py - 1.2, px + 1.2, py + 1.2);
        doc.line(px - 1.2, py + 1.2, px + 1.2, py - 1.2);
      });
    }

    // 2. Draw Detour Path (Green solid line with waypoints)
    if (detour.detourPath.length >= 2) {
      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(2.2);
      for (let i = 0; i < detour.detourPath.length - 1; i++) {
        const p1 = detour.detourPath[i];
        const p2 = detour.detourPath[i + 1];
        doc.line(toX(p1[1]), toY(p1[0]), toX(p2[1]), toY(p2[0]));
      }

      // Draw green dots on detour points
      detour.detourPath.forEach((pt, idx) => {
        const px = toX(pt[1]);
        const py = toY(pt[0]);
        doc.setFillColor(16, 185, 129);
        doc.circle(px, py, 2, 'F');
        doc.setFillColor(255, 255, 255);
        doc.circle(px, py, 0.8, 'F');

        if (idx === 0) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          doc.setTextColor(4, 120, 87);
          doc.text('Inicio Desvío', px - 8, py - 3);
        } else if (idx === detour.detourPath.length - 1) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          doc.setTextColor(4, 120, 87);
          doc.text('Reintegro Ruta', px - 9, py + 5);
        }
      });
    }

    // 3. Draw Stops
    detour.stops.forEach((stop) => {
      const sx = toX(stop.lng);
      const sy = toY(stop.lat);

      if (stop.type === 'suprimida') {
        doc.setFillColor(220, 38, 38);
        doc.circle(sx, sy, 2.5, 'F');
        doc.setTextColor(220, 38, 38);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        const nameShort = stop.name.slice(0, 18);
        doc.text(`✕ ${nameShort}`, sx + 3.5, sy + 1.5);
      } else {
        doc.setFillColor(37, 99, 235);
        doc.circle(sx, sy, 2.5, 'F');
        doc.setTextColor(37, 99, 235);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        const nameShort = stop.name.slice(0, 18);
        doc.text(`🚏 ${nameShort}`, sx + 3.5, sy + 1.5);
      }
    });
  } else {
    // Default stylized engineering scheme if user hasn't marked coordinates yet
    doc.setDrawColor(239, 68, 68);
    doc.setLineWidth(2.5);
    doc.line(margin + 25, currentY + 36, margin + 95, currentY + 36);

    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(2.5);
    doc.line(margin + 25, currentY + 36, margin + 25, currentY + 54);
    doc.line(margin + 25, currentY + 54, margin + 95, currentY + 54);
    doc.line(margin + 95, currentY + 54, margin + 95, currentY + 36);
    doc.line(margin + 95, currentY + 36, margin + 155, currentY + 36);

    doc.setFontSize(8);
    doc.setTextColor(220, 38, 38);
    doc.setFont('helvetica', 'bold');
    doc.text('TRAMO INTERRUMPIDO (OBRA / CORTE)', margin + 30, currentY + 32);

    doc.setTextColor(5, 150, 105);
    doc.text('ITINERARIO DE DESVÍO HABILITADO', margin + 30, currentY + 60);
  }

  // Legend bar under map
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, currentY + mapBoxH, contentWidth, 8, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, currentY + mapBoxH, contentWidth, 8, 'S');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');

  // Red legend box
  doc.setFillColor(239, 68, 68);
  doc.rect(margin + 4, currentY + mapBoxH + 2.5, 4, 3, 'F');
  doc.setTextColor(71, 85, 105);
  doc.text('Tramo cortado / Obra', margin + 10, currentY + mapBoxH + 5.5);

  // Green detour line
  doc.setFillColor(16, 185, 129);
  doc.rect(margin + 52, currentY + mapBoxH + 2.5, 4, 3, 'F');
  doc.text('Ruta provisoria de desvío', margin + 58, currentY + mapBoxH + 5.5);

  // Crossed stop
  doc.setFillColor(220, 38, 38);
  doc.circle(margin + 106, currentY + mapBoxH + 4, 1.8, 'F');
  doc.text('Parada suprimida', margin + 110, currentY + mapBoxH + 5.5);

  // Blue stop
  doc.setFillColor(37, 99, 235);
  doc.circle(margin + 148, currentY + mapBoxH + 4, 1.8, 'F');
  doc.text('Parada provisoria', margin + 152, currentY + mapBoxH + 5.5);

  currentY += mapBoxH + 13;

  // Itinerary description
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('DESCRIPCIÓN DEL RECORRIDO PROVISORIO:', margin, currentY);
  currentY += 4;

  doc.setFillColor(254, 252, 232); // Amber light
  doc.setDrawColor(254, 240, 138);
  const descLines = doc.splitTextToSize(detour.detourDescription || 'Continuar por ruta habitual hasta la intersección anterior al corte y tomar la señalización indicada.', contentWidth - 8);
  const descBoxH = Math.max(descLines.length * 4.5 + 6, 14);
  doc.roundedRect(margin, currentY, contentWidth, descBoxH, 1.5, 1.5, 'FD');

  doc.setTextColor(113, 63, 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(descLines, margin + 4, currentY + 5);

  currentY += descBoxH + 6;

  // Paradas (Suprimidas y Provisorias)
  const suprimidas = detour.stops.filter((s) => s.type === 'suprimida');
  const provisorias = detour.stops.filter((s) => s.type === 'provisoria');

  const halfColW = (contentWidth - 6) / 2;

  // Box Left: Suprimidas
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(margin, currentY, halfColW, 30, 1.5, 1.5, 'FD');

  doc.setTextColor(185, 28, 28);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`PARADAS SUPRIMIDAS (${suprimidas.length}):`, margin + 3, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  if (suprimidas.length === 0) {
    doc.text('No se registran paradas suprimidas.', margin + 3, currentY + 10);
  } else {
    suprimidas.slice(0, 4).forEach((s, idx) => {
      const stopText = doc.splitTextToSize(`• ${s.name}`, halfColW - 6);
      doc.text(stopText[0], margin + 3, currentY + 10 + idx * 4.5);
    });
  }

  // Box Right: Provisorias
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(margin + halfColW + 6, currentY, halfColW, 30, 1.5, 1.5, 'FD');

  doc.setTextColor(4, 120, 87);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`PARADAS PROVISORIAS HABILITADAS (${provisorias.length}):`, margin + halfColW + 9, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  if (provisorias.length === 0) {
    doc.text('Se utilizan paradas habituales del trayecto alternativo.', margin + halfColW + 9, currentY + 10);
  } else {
    provisorias.slice(0, 4).forEach((s, idx) => {
      const stopText = doc.splitTextToSize(`• ${s.name}`, halfColW - 6);
      doc.text(stopText[0], margin + halfColW + 9, currentY + 10 + idx * 4.5);
    });
  }

  currentY += 34;

  // Observations / Footer note
  if (detour.observations) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('OBSERVACIONES GENERALES:', margin, currentY);
    doc.setFont('helvetica', 'normal');
    const obsLines = doc.splitTextToSize(detour.observations, contentWidth);
    doc.text(obsLines.slice(0, 2), margin, currentY + 3.5);
  }

  // Footer stamp & signature
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Documento oficial emitido para coordinación de tránsito y transporte de Montevideo.', margin, pageHeight - 11);
  doc.text(`Emisión: ${new Date().toLocaleString('es-UY')} | Identificador: ${detour.code}`, margin, pageHeight - 7);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('DIVISIÓN TRANSPORTE STM', pageWidth - margin - 44, pageHeight - 9);

  const cleanTitle = detour.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
  const filename = `Desvio_STM_${detour.code}_${cleanTitle || 'Montevideo'}.pdf`;

  const blob = doc.output('blob');
  const dataUri = doc.output('datauristring');
  const blobUrl = URL.createObjectURL(blob);

  return { doc, blob, dataUri, blobUrl, filename };
}

/**
 * Robust, cross-browser download helper that guarantees file download
 * even in restricted environments, iframes, mobile browsers and sandboxes.
 */
export async function downloadDetourPdf(
  detour: DetourData,
  mapElement?: HTMLElement | null
): Promise<{ success: boolean; filename: string }> {
  try {
    const { doc, blob, filename } = await generateDetourPdf(detour, mapElement);

    // Technique 1: jsPDF native save
    try {
      doc.save(filename);
      return { success: true, filename };
    } catch {
      // ignore and try technique 2
    }

    // Technique 2: standard Blob URL anchor download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 2000);

    return { success: true, filename };
  } catch (error) {
    console.error('Error al generar y descargar el PDF:', error);
    return { success: false, filename: 'desvio_stm.pdf' };
  }
}

