export interface Coordinates {
  lat: number;
  lng: number;
}

export type StopType = 'suprimida' | 'provisoria';

export interface DetourStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: StopType;
  notes?: string;
  order?: number;
}

export type DetourDirection = 'ambos' | 'hacia_centro' | 'hacia_afuera';

export interface DetourData {
  id: string;
  code: string;
  title: string;
  reason: string;
  affectedLines: string[];
  direction: DetourDirection;
  startDate: string;
  endDate: string;
  affectedStreets: string;
  detourDescription: string;
  observations: string;
  stops: DetourStop[];
  blockedPath: [number, number][]; // [lat, lng]
  detourPath: [number, number][]; // [lat, lng]
  status: 'borrador' | 'generado' | 'enviado';
  createdAt: string;
  updatedAt: string;
}

export interface SendReceipt {
  id: string;
  detourId: string;
  detourCode: string;
  sentAt: string;
  recipientEmail: string;
  additionalRecipients: string[];
  channel: 'email' | 'whatsapp' | 'download';
  deliveryStatus: 'delivered' | 'pending' | 'failed';
  messagePreview: string;
}

export interface PresetLocation {
  name: string;
  zone: string;
  lat: number;
  lng: number;
  zoom?: number;
}

export interface BusCompany {
  id: string;
  name: string;
  email: string;
  color: string;
}
