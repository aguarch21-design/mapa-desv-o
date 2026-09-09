import { DetourDirection } from '../types';

// In-memory cache for coordinates to avoid redundant network calls
const geocodeCache = new Map<string, { street: string; suburb?: string; corner?: string }>();

// High-frequency known streets and arterial corridors in Montevideo for instant offline resolution
const MONTEVIDEO_KNOWN_STREETS = [
  { name: 'Avenida 18 de Julio', bounds: { minLat: -34.908, maxLat: -34.898, minLng: -56.202, maxLng: -56.160 } },
  { name: 'San José', bounds: { minLat: -34.909, maxLat: -34.904, minLng: -56.202, maxLng: -56.185 } },
  { name: 'Soriano', bounds: { minLat: -34.910, maxLat: -34.905, minLng: -56.202, maxLng: -56.180 } },
  { name: 'Colonia', bounds: { minLat: -34.907, maxLat: -34.898, minLng: -56.200, maxLng: -56.165 } },
  { name: 'Mercedes', bounds: { minLat: -34.906, maxLat: -34.896, minLng: -56.200, maxLng: -56.165 } },
  { name: 'Paraguay', bounds: { minLat: -34.915, maxLat: -34.900, minLng: -56.195, maxLng: -56.190 } },
  { name: 'Río Negro', bounds: { minLat: -34.915, maxLat: -34.902, minLng: -56.198, maxLng: -56.193 } },
  { name: 'Río Branco', bounds: { minLat: -34.915, maxLat: -34.902, minLng: -56.200, maxLng: -56.196 } },
  { name: 'Ejido', bounds: { minLat: -34.915, maxLat: -34.900, minLng: -56.190, maxLng: -56.185 } },
  { name: 'Yaguarón', bounds: { minLat: -34.915, maxLat: -34.900, minLng: -56.188, maxLng: -56.183 } },
  { name: 'Andes', bounds: { minLat: -34.912, maxLat: -34.903, minLng: -56.202, maxLng: -56.198 } },
  { name: 'Convención', bounds: { minLat: -34.912, maxLat: -34.903, minLng: -56.201, maxLng: -56.197 } },
  { name: 'Florida', bounds: { minLat: -34.910, maxLat: -34.903, minLng: -56.203, maxLng: -56.199 } },
  { name: 'Ciudadela', bounds: { minLat: -34.910, maxLat: -34.902, minLng: -56.205, maxLng: -56.200 } },
  { name: 'Bulevar Artigas', bounds: { minLat: -34.930, maxLat: -34.860, minLng: -56.190, maxLng: -56.150 } },
  { name: 'Avenida Italia', bounds: { minLat: -34.895, maxLat: -34.870, minLng: -56.160, maxLng: -56.050 } },
  { name: 'Avenida 8 de Octubre', bounds: { minLat: -34.890, maxLat: -34.850, minLng: -56.160, maxLng: -56.120 } },
  { name: 'Avenida Rivera', bounds: { minLat: -34.915, maxLat: -34.890, minLng: -56.170, maxLng: -56.120 } },
  { name: 'Avenida Brasil', bounds: { minLat: -34.925, maxLat: -34.900, minLng: -56.165, maxLng: -56.145 } },
  { name: 'Avenida Agraciada', bounds: { minLat: -34.890, maxLat: -34.850, minLng: -56.210, maxLng: -56.190 } },
];

/**
 * Clean up road names to standard readable format in Montevideo
 */
function cleanStreetName(name: string): string {
  if (!name) return '';
  return name
    .trim()
    .replace(/^Calle\s+/i, '')
    .replace(/^Avenida\s+/i, 'Av. ')
    .replace(/^Bulevar\s+/i, 'Bv. ')
    .replace(/^Rambla\s+/i, 'Rambla ');
}

/**
 * Reverse geocodes a single coordinate [lat, lng] to get street and neighborhood.
 */
export async function reverseGeocodeCoordinate(
  lat: number,
  lng: number
): Promise<{ street: string; suburb?: string; fullAddress?: string }> {
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  // Try OpenStreetMap Nominatim reverse geocoding
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s timeout

    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const rawRoad = data.address?.road || data.address?.pedestrian || data.address?.path || '';
      const suburb = data.address?.suburb || data.address?.neighbourhood || data.address?.city_district || 'Montevideo';
      
      let street = cleanStreetName(rawRoad);
      
      // If road was not found by OSM, check our Montevideo corridor dictionary
      if (!street) {
        for (const item of MONTEVIDEO_KNOWN_STREETS) {
          if (
            lat >= item.bounds.minLat &&
            lat <= item.bounds.maxLat &&
            lng >= item.bounds.minLng &&
            lng <= item.bounds.maxLng
          ) {
            street = cleanStreetName(item.name);
            break;
          }
        }
      }

      if (!street) {
        street = `Punto (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      }

      const result = {
        street,
        suburb,
        fullAddress: data.display_name,
      };

      geocodeCache.set(cacheKey, result);
      return result;
    }
  } catch {
    // Network or timeout failure: fallback to spatial heuristic
  }

  // Fallback: search known streets
  for (const item of MONTEVIDEO_KNOWN_STREETS) {
    if (
      lat >= item.bounds.minLat &&
      lat <= item.bounds.maxLat &&
      lng >= item.bounds.minLng &&
      lng <= item.bounds.maxLng
    ) {
      const res = { street: cleanStreetName(item.name), suburb: 'Centro' };
      geocodeCache.set(cacheKey, res);
      return res;
    }
  }

  const fallback = { street: `Punto (${lat.toFixed(4)}, ${lng.toFixed(4)})`, suburb: 'Montevideo' };
  geocodeCache.set(cacheKey, fallback);
  return fallback;
}

/**
 * Assembles the official detour itinerary text in real time based on points marked.
 */
export async function buildDetourItineraryFromPath(
  points: [number, number][],
  direction: DetourDirection,
  blockedStreetName?: string
): Promise<{ text: string; streets: string[] }> {
  if (!points || points.length === 0) {
    return { text: '', streets: [] };
  }

  // Reverse geocode all unique consecutive points
  const detectedStreets: string[] = [];
  
  for (const pt of points) {
    const geo = await reverseGeocodeCoordinate(pt[0], pt[1]);
    const street = geo.street;
    // Don't add if identical to the last one (avoid "San José ➔ San José ➔ San José")
    if (street && detectedStreets[detectedStreets.length - 1] !== street) {
      detectedStreets.push(street);
    }
  }

  if (detectedStreets.length === 0) {
    return { text: '', streets: [] };
  }

  const routeSequence = detectedStreets.join(' ➔ ');
  const prefix =
    direction === 'hacia_centro'
      ? 'Hacia el Centro'
      : direction === 'hacia_afuera'
      ? 'Hacia Afuera / Periferia'
      : 'Ambos Sentidos';

  let text = '';
  if (detectedStreets.length === 1) {
    text = `${prefix}: desvío provisorio por ${detectedStreets[0]} a su ruta habitual.`;
  } else {
    text = `${prefix}: ruta habitual, desvío por ${routeSequence} a sus recorridos habituales.`;
  }

  if (blockedStreetName && !text.includes(blockedStreetName)) {
    text = `${prefix}: por motivo de corte en ${blockedStreetName}, desvío por ${routeSequence} a sus rutas habituales.`;
  }

  return {
    text,
    streets: detectedStreets,
  };
}

/**
 * Identifies the street or intersection of the blocked path (corte).
 */
export async function identifyBlockedStreets(
  points: [number, number][]
): Promise<{ description: string; streets: string[] }> {
  if (!points || points.length === 0) {
    return { description: '', streets: [] };
  }

  const streets: string[] = [];
  for (const pt of points) {
    const geo = await reverseGeocodeCoordinate(pt[0], pt[1]);
    if (geo.street && !streets.includes(geo.street)) {
      streets.push(geo.street);
    }
  }

  if (streets.length === 0) {
    return { description: '', streets: [] };
  }

  if (streets.length === 1) {
    return { description: `${streets[0]}`, streets };
  }

  if (streets.length === 2) {
    return { description: `${streets[0]} y ${streets[1]}`, streets };
  }

  return { description: `${streets[0]} entre ${streets[1]} y ${streets[streets.length - 1]}`, streets };
}
