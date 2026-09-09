import { DetourData, PresetLocation, BusCompany } from '../types';

export const MONTEVIDEO_CENTER = {
  lat: -34.9056,
  lng: -56.1915, // Centro / 18 de Julio
  zoom: 14,
};

export const MONTEVIDEO_PRESETS: PresetLocation[] = [
  { name: '18 de Julio / Plaza del Entrevero', zone: 'Centro', lat: -34.9058, lng: -56.1932, zoom: 16 },
  { name: 'Plaza Independencia / Ciudad Vieja', zone: 'Centro', lat: -34.9064, lng: -56.1998, zoom: 16 },
  { name: 'Tres Cruces / Bv. Artigas y 8 de Octubre', zone: 'Tres Cruces', lat: -34.8943, lng: -56.1662, zoom: 16 },
  { name: 'Av. Rivera y Bv. España', zone: 'Pocitos', lat: -34.9103, lng: -56.1558, zoom: 16 },
  { name: 'Rambla República del Perú y Kibón', zone: 'Pocitos', lat: -34.9142, lng: -56.1367, zoom: 15 },
  { name: 'Av. 8 de Octubre y Comercio', zone: 'La Unión', lat: -34.8814, lng: -56.1386, zoom: 16 },
  { name: 'Paso Molino / Av. Agraciada', zone: 'Paso Molino', lat: -34.8631, lng: -56.2162, zoom: 16 },
  { name: 'Terminal Colón / Garzón', zone: 'Colón', lat: -34.8052, lng: -56.2185, zoom: 15 },
  { name: 'Portones de Carrasco / Av. Italia', zone: 'Carrasco', lat: -34.8821, lng: -56.0641, zoom: 15 },
];

export const POPULAR_STM_LINES = [
  '104', '180', '128', '142', '21', '60', '185', '300', 
  '405', '582', 'D1', 'G', '116', '121', '149', '181', 
  '183', '370', '522', 'E14'
];

export const BUS_COMPANIES: BusCompany[] = [
  { id: 'cutcsa', name: 'CUTCSA (Tránsito y Operaciones)', email: 'operaciones@cutcsa.com.uy', color: '#1d4ed8' },
  { id: 'coetc', name: 'COETC Cooperativa', email: 'trafico@coetc.com.uy', color: '#b91c1c' },
  { id: 'ucot', name: 'UCOT Transporte', email: 'despacho@ucot.com.uy', color: '#c2410c' },
  { id: 'come', name: 'COME S.A.', email: 'servicios@come.com.uy', color: '#047857' },
  { id: 'im_transito', name: 'Intendencia de Montevideo - Tránsito', email: 'transporte.movilidad@imm.gub.uy', color: '#4338ca' }
];

export const SAMPLE_DETOUR: DetourData = {
  id: 'dev-001-mvd',
  code: 'STM-DEV-2025-042',
  title: 'Desvío en Av. 18 de Julio por Reparación de Calzada',
  reason: 'Obras de fresado y pavimentación asfáltica por parte de la Intendencia de Montevideo',
  affectedLines: ['104', '180', '21', '60', 'D1'],
  direction: 'hacia_centro',
  startDate: new Date().toISOString().slice(0, 16),
  endDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16),
  affectedStreets: 'Av. 18 de Julio entre Río Negro y Julio Herrera y Obes',
  detourDescription: 'Hacia Plaza Independencia: Av. 18 de Julio -> Río Negro -> San José -> Paraguay -> retoma Av. 18 de Julio a su ruta habitual.',
  observations: 'Se habilitan paradas provisorias en San José e/ Río Negro y San José e/ Paraguay. Se solicita a los conductores extremar precauciones.',
  blockedPath: [
    [-34.9058, -56.1945],
    [-34.9059, -56.1925],
    [-34.9061, -56.1905],
  ],
  detourPath: [
    [-34.9058, -56.1945],
    [-34.9068, -56.1944], // desvío por Río Negro
    [-34.9073, -56.1918], // San José
    [-34.9063, -56.1903], // Paraguay
    [-34.9061, -56.1905], // retoma 18 de Julio
  ],
  stops: [
    {
      id: 'stop-sup-1',
      name: '18 de Julio y Río Negro (Suprimida)',
      lat: -34.9059,
      lng: -56.1935,
      type: 'suprimida',
      notes: 'Parada habitual inhabilitada por maquinaria pesada.',
      order: 1
    },
    {
      id: 'stop-sup-2',
      name: '18 de Julio y Julio Herrera y Obes (Suprimida)',
      lat: -34.9060,
      lng: -56.1916,
      type: 'suprimida',
      notes: 'Parada habitual inhabilitada.',
      order: 2
    },
    {
      id: 'stop-prov-1',
      name: 'San José y Río Negro (Provisoria)',
      lat: -34.9071,
      lng: -56.1938,
      type: 'provisoria',
      notes: 'Parada provisoria debidamente señalizada.',
      order: 1
    },
    {
      id: 'stop-prov-2',
      name: 'San José y Paraguay (Provisoria)',
      lat: -34.9074,
      lng: -56.1915,
      type: 'provisoria',
      notes: 'Parada provisoria antes de doblar hacia 18 de Julio.',
      order: 2
    }
  ],
  status: 'borrador',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
