export interface STMBusLine {
  id: string;
  name: string;
  company: 'CUTCSA' | 'COETC' | 'UCOT' | 'COME';
  companyColor: string;
  routeColor: string;
  origin: string;
  destination: string;
  corridor: string;
  route: [number, number][];
  keyStops: { name: string; lat: number; lng: number }[];
  frequencyMinutes: number;
}

export const STM_BUS_ROUTES: Record<string, STMBusLine> = {
  '104': {
    id: '104',
    name: 'Línea 104',
    company: 'CUTCSA',
    companyColor: '#1d4ed8',
    routeColor: '#2563eb', // Blue
    origin: 'Costanera / Carrasco',
    destination: 'Plaza Independencia / Aduana',
    corridor: 'Av. 18 de Julio • Bv. España • Av. Rivera • Carrasco',
    frequencyMinutes: 12,
    route: [
      [-34.8821, -56.0641], // Portones Carrasco
      [-34.8890, -56.0820], // Av. Rivera Carrasco
      [-34.8965, -56.1150], // Rivera y Malvín
      [-34.9015, -56.1340], // Rivera y Propios
      [-34.9103, -56.1558], // Rivera y Bv. España
      [-34.9080, -56.1680], // Bv. España y Bv. Artigas
      [-34.9056, -56.1770], // Cordón / 18 de Julio
      [-34.9056, -56.1866], // 18 de Julio y Ejido (Intendencia)
      [-34.9058, -56.1932], // 18 de Julio y Río Negro
      [-34.9064, -56.1998], // Plaza Independencia
      [-34.9040, -56.2110], // Aduana / Ciudad Vieja
    ],
    keyStops: [
      { name: 'Terminal Aduana', lat: -34.9040, lng: -56.2110 },
      { name: 'Plaza Independencia', lat: -34.9064, lng: -56.1998 },
      { name: '18 de Julio y Río Negro', lat: -34.9058, lng: -56.1932 },
      { name: '18 de Julio y Ejido (Intendencia)', lat: -34.9056, lng: -56.1866 },
      { name: 'Rivera y Bv. España', lat: -34.9103, lng: -56.1558 },
      { name: 'Portones de Carrasco', lat: -34.8821, lng: -56.0641 },
    ],
  },
  '180': {
    id: '180',
    name: 'Línea 180',
    company: 'CUTCSA',
    companyColor: '#1d4ed8',
    routeColor: '#0284c7', // Sky blue
    origin: 'Ciudad Vieja',
    destination: 'Brazo Oriental / Cno. Corrales',
    corridor: '18 de Julio • Tres Cruces • Bv. Artigas • Cno. Corrales',
    frequencyMinutes: 10,
    route: [
      [-34.9040, -56.2110], // Ciudad Vieja
      [-34.9064, -56.1998], // Plaza Independencia
      [-34.9058, -56.1932], // 18 de Julio y Río Negro
      [-34.9056, -56.1866], // 18 de Julio y Ejido
      [-34.9030, -56.1770], // 18 de Julio y Arenal Grande
      [-34.8970, -56.1662], // Bv. Artigas y 18 de Julio (Obelisco)
      [-34.8943, -56.1662], // Terminal Tres Cruces
      [-34.8800, -56.1690], // Bv. Artigas y Colorado
      [-34.8680, -56.1710], // Bv. Artigas y San Martín
      [-34.8620, -56.1650], // Brazo Oriental
    ],
    keyStops: [
      { name: 'Ciudad Vieja', lat: -34.9040, lng: -56.2110 },
      { name: 'Plaza Independencia', lat: -34.9064, lng: -56.1998 },
      { name: '18 de Julio y Convención', lat: -34.9061, lng: -56.1965 },
      { name: 'Tres Cruces (Bv. Artigas)', lat: -34.8943, lng: -56.1662 },
      { name: 'Bv. Artigas y San Martín', lat: -34.8680, lng: -56.1710 },
    ],
  },
  '21': {
    id: '21',
    name: 'Línea 21',
    company: 'CUTCSA',
    companyColor: '#1d4ed8',
    routeColor: '#7c3aed', // Purple
    origin: 'Portones de Carrasco / Geant',
    destination: 'Plaza Independencia / Ciudad Vieja',
    corridor: 'Av. Italia • Tres Cruces • Av. 18 de Julio',
    frequencyMinutes: 8,
    route: [
      [-34.8821, -56.0641], // Portones
      [-34.8845, -56.0950], // Av. Italia y Bolivia
      [-34.8885, -56.1320], // Av. Italia y Propios
      [-34.8912, -56.1550], // Av. Italia y Hospital de Clínicas
      [-34.8943, -56.1662], // Tres Cruces
      [-34.8970, -56.1662], // Obelisco
      [-34.9030, -56.1770], // 18 de Julio y Gaboto
      [-34.9056, -56.1866], // 18 de Julio y Ejido
      [-34.9058, -56.1932], // 18 de Julio y Río Negro
      [-34.9064, -56.1998], // Plaza Independencia
    ],
    keyStops: [
      { name: 'Portones Shopping', lat: -34.8821, lng: -56.0641 },
      { name: 'Av. Italia y Batlle y Ordóñez', lat: -34.8885, lng: -56.1320 },
      { name: 'Hospital de Clínicas', lat: -34.8912, lng: -56.1550 },
      { name: 'Tres Cruces', lat: -34.8943, lng: -56.1662 },
      { name: '18 de Julio y Ejido', lat: -34.9056, lng: -56.1866 },
      { name: 'Plaza Independencia', lat: -34.9064, lng: -56.1998 },
    ],
  },
  '60': {
    id: '60',
    name: 'Línea 60',
    company: 'CUTCSA',
    companyColor: '#1d4ed8',
    routeColor: '#059669', // Emerald
    origin: 'Portones de Carrasco',
    destination: 'Plaza Independencia',
    corridor: 'Av. Rivera • Pocitos • Bv. España • Av. 18 de Julio',
    frequencyMinutes: 10,
    route: [
      [-34.8821, -56.0641], // Portones
      [-34.8950, -56.1100], // Rivera y Gallinal
      [-34.9103, -56.1558], // Rivera y Bv. España
      [-34.9170, -56.1480], // Pocitos Playa
      [-34.9103, -56.1558], // Bv. España
      [-34.9080, -56.1680], // Bv. España y Parque Rodó
      [-34.9056, -56.1770], // Cordón
      [-34.9056, -56.1866], // 18 de Julio y Ejido
      [-34.9058, -56.1932], // 18 de Julio y Río Negro
      [-34.9064, -56.1998], // Plaza Independencia
    ],
    keyStops: [
      { name: 'Portones', lat: -34.8821, lng: -56.0641 },
      { name: 'Pocitos (Bv. España)', lat: -34.9103, lng: -56.1558 },
      { name: 'Facultad de Arquitectura', lat: -34.9080, lng: -56.1680 },
      { name: 'Plaza Independencia', lat: -34.9064, lng: -56.1998 },
    ],
  },
  '128': {
    id: '128',
    name: 'Línea 128',
    company: 'CUTCSA',
    companyColor: '#1d4ed8',
    routeColor: '#d97706', // Amber
    origin: 'Pocitos',
    destination: 'Paso Molino',
    corridor: 'Bv. España • Cordón • Centro • Av. Agraciada',
    frequencyMinutes: 14,
    route: [
      [-34.9170, -56.1480], // Pocitos
      [-34.9103, -56.1558], // Bv. España
      [-34.9056, -56.1770], // Cordón
      [-34.9056, -56.1866], // 18 de Julio
      [-34.9058, -56.1932], // 18 de Julio y Río Negro
      [-34.8980, -56.1980], // Rondeau / La Paz
      [-34.8820, -56.1960], // Agraciada y San Martín
      [-34.8631, -56.2162], // Paso Molino / Viaducto
    ],
    keyStops: [
      { name: 'Pocitos', lat: -34.9170, lng: -56.1480 },
      { name: 'Intendencia de Montevideo', lat: -34.9056, lng: -56.1866 },
      { name: 'Palacio Legislativo', lat: -34.8910, lng: -56.1870 },
      { name: 'Paso Molino', lat: -34.8631, lng: -56.2162 },
    ],
  },
  '142': {
    id: '142',
    name: 'Línea 142',
    company: 'CUTCSA',
    companyColor: '#1d4ed8',
    routeColor: '#e11d48', // Rose
    origin: 'Punta Carretas',
    destination: 'Plaza Independencia',
    corridor: '21 de Setiembre • Bv. España • Av. 18 de Julio',
    frequencyMinutes: 11,
    route: [
      [-34.9240, -56.1580], // Punta Carretas Shopping
      [-34.9180, -56.1550], // 21 de Setiembre
      [-34.9103, -56.1558], // Bv. España
      [-34.9056, -56.1770], // Cordón
      [-34.9056, -56.1866], // 18 de Julio y Ejido
      [-34.9058, -56.1932], // 18 de Julio y Río Negro
      [-34.9064, -56.1998], // Plaza Independencia
    ],
    keyStops: [
      { name: 'Punta Carretas Shopping', lat: -34.9240, lng: -56.1580 },
      { name: '21 de Setiembre y Ellauri', lat: -34.9180, lng: -56.1550 },
      { name: '18 de Julio y Ejido', lat: -34.9056, lng: -56.1866 },
      { name: 'Plaza Independencia', lat: -34.9064, lng: -56.1998 },
    ],
  },
  'D1': {
    id: 'D1',
    name: 'Línea Diferencial D1',
    company: 'CUTCSA',
    companyColor: '#1d4ed8',
    routeColor: '#2563eb', // Vivid Blue
    origin: 'Carrasco',
    destination: 'Ciudad Vieja (Servicio Semidirecto)',
    corridor: 'Rambla de Montevideo • 18 de Julio • Ciudad Vieja',
    frequencyMinutes: 15,
    route: [
      [-34.8821, -56.0641], // Carrasco
      [-34.8990, -56.0980], // Rambla Rep. de México
      [-34.9050, -56.1200], // Rambla Malvín
      [-34.9142, -56.1367], // Rambla Pocitos (Kibón)
      [-34.9170, -56.1480], // Rambla y Bv. España
      [-34.9120, -56.1710], // Rambla Rep. Argentina
      [-34.9064, -56.1998], // Plaza Independencia
      [-34.9040, -56.2110], // Ciudad Vieja
    ],
    keyStops: [
      { name: 'Carrasco', lat: -34.8821, lng: -56.0641 },
      { name: 'Kibón / Pocitos', lat: -34.9142, lng: -56.1367 },
      { name: 'Teatro Solís', lat: -34.9068, lng: -56.2005 },
      { name: 'Plaza Zabala', lat: -34.9050, lng: -56.2080 },
    ],
  },
  'G': {
    id: 'G',
    name: 'Línea Troncal G',
    company: 'CUTCSA',
    companyColor: '#1d4ed8',
    routeColor: '#4f46e5', // Indigo
    origin: 'Terminal Colón',
    destination: 'Plaza Independencia / Ciudad Vieja',
    corridor: 'Corredor Garzón • Av. Agraciada • Av. 18 de Julio',
    frequencyMinutes: 6,
    route: [
      [-34.8052, -56.2185], // Terminal Colón
      [-34.8320, -56.2170], // Corredor Garzón y Propios
      [-34.8631, -56.2162], // Paso Molino / Agraciada
      [-34.8820, -56.1960], // Agraciada y San Martín
      [-34.8910, -56.1870], // Palacio Legislativo
      [-34.9056, -56.1866], // 18 de Julio y Ejido
      [-34.9058, -56.1932], // 18 de Julio y Río Negro
      [-34.9064, -56.1998], // Plaza Independencia
    ],
    keyStops: [
      { name: 'Terminal Colón', lat: -34.8052, lng: -56.2185 },
      { name: 'Paso Molino', lat: -34.8631, lng: -56.2162 },
      { name: 'Palacio Legislativo', lat: -34.8910, lng: -56.1870 },
      { name: '18 de Julio y Ejido', lat: -34.9056, lng: -56.1866 },
      { name: 'Plaza Independencia', lat: -34.9064, lng: -56.1998 },
    ],
  },
  '300': {
    id: '300',
    name: 'Línea 300',
    company: 'UCOT',
    companyColor: '#c2410c',
    routeColor: '#ea580c', // Orange
    origin: 'Camino Maldonado / Punta de Rieles',
    destination: 'Instrucciones / Cementerio del Norte',
    corridor: 'Av. 8 de Octubre • Tres Cruces • Propios',
    frequencyMinutes: 12,
    route: [
      [-34.8450, -56.1000], // Cno. Maldonado km 14
      [-34.8680, -56.1240], // Curva de Maroñas
      [-34.8814, -56.1386], // 8 de Octubre y Comercio
      [-34.8875, -56.1585], // 8 de Octubre y Garibaldi
      [-34.8943, -56.1662], // Tres Cruces
      [-34.8800, -56.1690], // Bv. Artigas
      [-34.8550, -56.1800], // Propios y Gral. Flores
      [-34.8400, -56.1900], // Instrucciones
    ],
    keyStops: [
      { name: 'Punta de Rieles', lat: -34.8450, lng: -56.1000 },
      { name: 'Curva de Maroñas', lat: -34.8680, lng: -56.1240 },
      { name: '8 de Octubre y Comercio', lat: -34.8814, lng: -56.1386 },
      { name: 'Tres Cruces', lat: -34.8943, lng: -56.1662 },
    ],
  },
  '405': {
    id: '405',
    name: 'Línea 405',
    company: 'COETC',
    companyColor: '#b91c1c',
    routeColor: '#dc2626', // Red
    origin: 'Parque Rodó',
    destination: 'Peñarol / Mendoza',
    corridor: 'Gonzalo Ramírez • Cordón • Bv. Artigas • Mendoza',
    frequencyMinutes: 12,
    route: [
      [-34.9150, -56.1680], // Parque Rodó
      [-34.9056, -56.1770], // Cordón / Guayabos
      [-34.8970, -56.1662], // Tres Cruces
      [-34.8875, -56.1585], // 8 de Octubre
      [-34.8650, -56.1500], // Hipódromo / Maroñas
      [-34.8400, -56.1600], // Cno. Mendoza
    ],
    keyStops: [
      { name: 'Parque Rodó', lat: -34.9150, lng: -56.1680 },
      { name: 'Facultad de Derecho', lat: -34.9056, lng: -56.1770 },
      { name: 'Tres Cruces', lat: -34.8970, lng: -56.1662 },
      { name: 'Peñarol / Mendoza', lat: -34.8400, lng: -56.1600 },
    ],
  },
  '582': {
    id: '582',
    name: 'Línea 582',
    company: 'COME',
    companyColor: '#047857',
    routeColor: '#16a34a', // Green
    origin: 'Punta Carretas',
    destination: 'Peñarol / Sayago',
    corridor: 'Ellauri • Bv. España • Cordón • San Martín • Millán',
    frequencyMinutes: 14,
    route: [
      [-34.9240, -56.1580], // Punta Carretas
      [-34.9103, -56.1558], // Bv. España
      [-34.9056, -56.1770], // Cordón
      [-34.8980, -56.1850], // Av. del Libertador
      [-34.8820, -56.1960], // San Martín
      [-34.8600, -56.2000], // Av. Millán
      [-34.8350, -56.2050], // Sayago / Peñarol
    ],
    keyStops: [
      { name: 'Punta Carretas', lat: -34.9240, lng: -56.1580 },
      { name: 'Cordón', lat: -34.9056, lng: -56.1770 },
      { name: 'Palacio Legislativo', lat: -34.8980, lng: -56.1850 },
      { name: 'Sayago', lat: -34.8350, lng: -56.2050 },
    ],
  },
  'E14': {
    id: 'E14',
    name: 'Línea Eléctrica E14',
    company: 'CUTCSA',
    companyColor: '#1d4ed8',
    routeColor: '#0891b2', // Cyan
    origin: 'Pocitos',
    destination: 'Ciudad Vieja',
    corridor: 'Rambla • 18 de Julio • Ciudad Vieja (100% Eléctrico STM)',
    frequencyMinutes: 15,
    route: [
      [-34.9170, -56.1480], // Pocitos Playa
      [-34.9120, -56.1710], // Rambla República Argentina
      [-34.9056, -56.1866], // 18 de Julio y Ejido
      [-34.9058, -56.1932], // 18 de Julio y Río Negro
      [-34.9064, -56.1998], // Plaza Independencia
      [-34.9040, -56.2110], // Aduana / Ciudad Vieja
    ],
    keyStops: [
      { name: 'Pocitos (Bv. España)', lat: -34.9170, lng: -56.1480 },
      { name: 'Teatro de Verano', lat: -34.9130, lng: -56.1650 },
      { name: '18 de Julio y Ejido', lat: -34.9056, lng: -56.1866 },
      { name: 'Ciudad Vieja', lat: -34.9040, lng: -56.2110 },
    ],
  },
};

export const STM_COMPANIES_INFO = {
  CUTCSA: { name: 'CUTCSA', color: '#1d4ed8', bgBadge: 'bg-blue-100 text-blue-900 border-blue-300' },
  COETC: { name: 'COETC', color: '#b91c1c', bgBadge: 'bg-red-100 text-red-900 border-red-300' },
  UCOT: { name: 'UCOT', color: '#c2410c', bgBadge: 'bg-orange-100 text-orange-900 border-orange-300' },
  COME: { name: 'COME S.A.', color: '#047857', bgBadge: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
};
