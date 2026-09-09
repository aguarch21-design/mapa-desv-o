import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { DetourData, DetourStop, StopType } from '../types';
import { MONTEVIDEO_CENTER, MONTEVIDEO_PRESETS } from '../data/montevideo';
import { 
  Ban, 
  CornerDownRight, 
  MapPin, 
  Undo2, 
  Trash2, 
  Compass, 
  Navigation,
  Crosshair,
  CheckCircle2,
  PencilLine,
  Sparkles,
  Layers
} from 'lucide-react';
import { 
  reverseGeocodeCoordinate, 
  buildDetourItineraryFromPath, 
  identifyBlockedStreets 
} from '../utils/streetGeocoder';

interface MapEditorProps {
  detour: DetourData;
  onChange: (updated: Partial<DetourData>) => void;
  mapRefProp?: (el: HTMLElement | null) => void;
}

type DrawMode = 'view' | 'blocked' | 'detour' | 'stop_suprimida' | 'stop_provisoria';
type TileProvider = 'esri_street' | 'osm' | 'satellite';

const TILE_PROVIDERS: Record<TileProvider, { name: string; url: string; attribution: string; maxZoom: number }> = {
  esri_street: {
    name: 'Callejero Nítido (ESRI)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, DeLorme, NAVTEQ, TomTom, OpenStreetMap',
    maxZoom: 19,
  },
  osm: {
    name: 'OpenStreetMap Estándar',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  satellite: {
    name: 'Satélite / Imagen Aérea',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    maxZoom: 19,
  },
};

export function MapEditor({ detour, onChange, mapRefProp }: MapEditorProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  
  // Layer groups to keep references clean
  const blockedLayerRef = useRef<L.LayerGroup | null>(null);
  const detourLayerRef = useRef<L.LayerGroup | null>(null);
  const stopsLayerRef = useRef<L.LayerGroup | null>(null);

  const [drawMode, setDrawMode] = useState<DrawMode>('view');
  const [selectedPreset, setSelectedPreset] = useState<string>('Centro');
  const [lastActionNotice, setLastActionNotice] = useState<string | null>(null);
  const [activeTile, setActiveTile] = useState<TileProvider>('esri_street');
  const [autoWriteItinerary, setAutoWriteItinerary] = useState<boolean>(true);
  const [detectedStreets, setDetectedStreets] = useState<string[]>([]);
  const [isResolvingStreet, setIsResolvingStreet] = useState<boolean>(false);

  // Initialize Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (leafletMapRef.current) return;

    // Safety cleanup for React StrictMode re-mount
    const container = mapContainerRef.current as HTMLDivElement & { _leaflet_id?: number | null };
    if (container._leaflet_id) {
      delete container._leaflet_id;
    }

    try {
      const map = L.map(container, {
        center: [MONTEVIDEO_CENTER.lat, MONTEVIDEO_CENTER.lng],
        zoom: MONTEVIDEO_CENTER.zoom,
        zoomControl: false,
      });

      // Default to ESRI World Street Map (crisp, zero watermarks, no API keys)
      const provider = TILE_PROVIDERS.esri_street;
      const tileLayer = L.tileLayer(provider.url, {
        attribution: provider.attribution,
        maxZoom: provider.maxZoom,
        crossOrigin: true,
      }).addTo(map);

      currentTileLayerRef.current = tileLayer;

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const blockedGroup = L.layerGroup().addTo(map);
      const detourGroup = L.layerGroup().addTo(map);
      const stopsGroup = L.layerGroup().addTo(map);

      blockedLayerRef.current = blockedGroup;
      detourLayerRef.current = detourGroup;
      stopsLayerRef.current = stopsGroup;
      leafletMapRef.current = map;

      if (mapRefProp) {
        mapRefProp(container);
      }
    } catch (err) {
      console.warn('Leaflet map initialization warning:', err);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Switch base tile provider cleanly
  const switchTileProvider = (providerKey: TileProvider) => {
    const map = leafletMapRef.current;
    if (!map) return;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    const provider = TILE_PROVIDERS[providerKey];
    const newLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: provider.maxZoom,
      crossOrigin: true,
    }).addTo(map);

    currentTileLayerRef.current = newLayer;
    setActiveTile(providerKey);
    showNotice(`Mapa cambiado a: ${provider.name}`);
  };

  // Handle map clicks based on active mode with live detour drafting
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    const onMapClick = async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const roundedLat = Number(lat.toFixed(6));
      const roundedLng = Number(lng.toFixed(6));

      if (drawMode === 'blocked') {
        const nextBlocked: [number, number][] = [...detour.blockedPath, [roundedLat, roundedLng]];
        setIsResolvingStreet(true);

        identifyBlockedStreets(nextBlocked)
          .then((cutInfo) => {
            setIsResolvingStreet(false);
            if (cutInfo.description && autoWriteItinerary) {
              onChangeRef.current({
                blockedPath: nextBlocked,
                affectedStreets: cutInfo.description,
              });
              showNotice(`Corte detectado: ${cutInfo.description}`);
            } else {
              onChangeRef.current({ blockedPath: nextBlocked });
              showNotice(`Punto de corte agregado (${nextBlocked.length} puntos)`);
            }
          })
          .catch(() => {
            setIsResolvingStreet(false);
            onChangeRef.current({ blockedPath: nextBlocked });
          });
      } else if (drawMode === 'detour') {
        const nextDetour: [number, number][] = [...detour.detourPath, [roundedLat, roundedLng]];
        setIsResolvingStreet(true);

        buildDetourItineraryFromPath(nextDetour, detour.direction, detour.affectedStreets)
          .then((itinerary) => {
            setIsResolvingStreet(false);
            if (itinerary.streets.length > 0) {
              setDetectedStreets(itinerary.streets);
            }
            if (itinerary.text && autoWriteItinerary) {
              onChangeRef.current({
                detourPath: nextDetour,
                detourDescription: itinerary.text,
              });
              const lastStreet = itinerary.streets[itinerary.streets.length - 1];
              showNotice(`✍️ Desvío redactado: paso por ${lastStreet || 'calle'}`);
            } else {
              onChangeRef.current({ detourPath: nextDetour });
              showNotice(`Punto de desvío agregado (${nextDetour.length} puntos)`);
            }
          })
          .catch(() => {
            setIsResolvingStreet(false);
            onChangeRef.current({ detourPath: nextDetour });
          });
      } else if (drawMode === 'stop_suprimida' || drawMode === 'stop_provisoria') {
        const type: StopType = drawMode === 'stop_suprimida' ? 'suprimida' : 'provisoria';
        setIsResolvingStreet(true);

        reverseGeocodeCoordinate(roundedLat, roundedLng)
          .then((geo) => {
            setIsResolvingStreet(false);
            const autoName = geo.street
              ? `${type === 'suprimida' ? 'Parada Suprimida' : 'Parada Provisoria'}: ${geo.street}`
              : `${type === 'suprimida' ? 'Parada Suprimida' : 'Parada Provisoria'} #${detour.stops.length + 1}`;

            const newStop: DetourStop = {
              id: `stop-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              name: autoName,
              lat: roundedLat,
              lng: roundedLng,
              type,
              order: detour.stops.length + 1,
            };

            onChangeRef.current({ stops: [...detour.stops, newStop] });
            showNotice(`Nueva parada agregada: ${autoName}`);
          })
          .catch(() => {
            setIsResolvingStreet(false);
            const fallbackStop: DetourStop = {
              id: `stop-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              name: `${type === 'suprimida' ? 'Parada Suprimida' : 'Parada Provisoria'} #${detour.stops.length + 1}`,
              lat: roundedLat,
              lng: roundedLng,
              type,
              order: detour.stops.length + 1,
            };
            onChangeRef.current({ stops: [...detour.stops, fallbackStop] });
          });
      }
    };

    map.on('click', onMapClick);
    return () => {
      map.off('click', onMapClick);
    };
  }, [drawMode, detour.blockedPath, detour.detourPath, detour.stops, detour.direction, detour.affectedStreets, autoWriteItinerary]);

  // Update vectors and markers whenever detour data changes
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    // 1. Redraw blocked path
    if (blockedLayerRef.current) {
      blockedLayerRef.current.clearLayers();

      if (detour.blockedPath.length > 1) {
        // Red dashed polyline
        const poly = L.polyline(detour.blockedPath, {
          color: '#ef4444',
          weight: 6,
          dashArray: '8, 8',
          opacity: 0.9,
          lineCap: 'round',
        });
        poly.bindTooltip('Tramo cortado por obra / evento', { sticky: true });
        blockedLayerRef.current.addLayer(poly);
      }

      // Markers for blocked points
      detour.blockedPath.forEach((pt, i) => {
        const icon = L.divIcon({
          className: 'custom-blocked-marker',
          html: `
            <div class="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs border-2 border-white shadow-md transform -translate-x-3 -translate-y-3 cursor-pointer">
              ✕
            </div>
          `,
          iconSize: [24, 24],
        });
        const marker = L.marker(pt, { icon });
        marker.bindTooltip(`Corte punto ${i + 1} (${pt[0]}, ${pt[1]})`);
        blockedLayerRef.current?.addLayer(marker);
      });
    }

    // 2. Redraw detour path
    if (detourLayerRef.current) {
      detourLayerRef.current.clearLayers();

      if (detour.detourPath.length > 1) {
        // Detour polyline (solid emerald/blue)
        const poly = L.polyline(detour.detourPath, {
          color: '#059669',
          weight: 6,
          opacity: 0.95,
          lineJoin: 'round',
        });
        poly.bindTooltip('Ruta provisoria de desvío', { sticky: true });
        detourLayerRef.current.addLayer(poly);
      }

      // Waypoints for detour
      detour.detourPath.forEach((pt, i) => {
        const isStart = i === 0;
        const isEnd = i === detour.detourPath.length - 1;
        const label = isStart ? 'Inicio' : isEnd ? 'Fin' : `${i + 1}`;
        
        const icon = L.divIcon({
          className: 'custom-detour-marker',
          html: `
            <div class="px-2 py-0.5 rounded-full ${isStart ? 'bg-blue-600' : isEnd ? 'bg-amber-600' : 'bg-emerald-600'} text-white font-bold text-[11px] border-2 border-white shadow-md flex items-center justify-center -translate-x-1/2 -translate-y-1/2 whitespace-nowrap cursor-pointer">
              ${label}
            </div>
          `,
          iconSize: [30, 20],
        });
        const marker = L.marker(pt, { icon });
        marker.bindTooltip(`Desvío punto ${i + 1}`);
        detourLayerRef.current?.addLayer(marker);
      });
    }

    // 3. Redraw Stops
    if (stopsLayerRef.current) {
      stopsLayerRef.current.clearLayers();

      detour.stops.forEach((stop) => {
        const isSuprimida = stop.type === 'suprimida';
        const icon = L.divIcon({
          className: 'custom-stop-marker',
          html: isSuprimida
            ? `
              <div class="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white shadow-lg border-2 border-white -translate-x-4 -translate-y-4">
                <span class="text-xs font-black">🚫</span>
              </div>
            `
            : `
              <div class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white shadow-lg border-2 border-white -translate-x-4 -translate-y-4">
                <span class="text-xs font-black">🚏</span>
              </div>
            `,
          iconSize: [32, 32],
        });

        const marker = L.marker([stop.lat, stop.lng], { icon });
        
        const popupContent = document.createElement('div');
        popupContent.className = 'p-2 min-w-[180px] font-sans text-xs';
        popupContent.innerHTML = `
          <div class="font-bold text-sm ${isSuprimida ? 'text-red-600' : 'text-blue-700'} mb-1">
            ${isSuprimida ? 'Parada Suprimida' : 'Parada Provisoria'}
          </div>
          <div class="font-medium text-slate-800 mb-2">${stop.name}</div>
          <button id="del-stop-${stop.id}" class="w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2 py-1 rounded text-xs transition">
            Eliminar parada
          </button>
        `;

        marker.bindPopup(popupContent);
        marker.on('popupopen', () => {
          const btn = document.getElementById(`del-stop-${stop.id}`);
          if (btn) {
            btn.onclick = () => {
              onChangeRef.current({
                stops: detour.stops.filter((s) => s.id !== stop.id),
              });
              map.closePopup();
            };
          }
        });

        stopsLayerRef.current?.addLayer(marker);
      });
    }
  }, [detour.blockedPath, detour.detourPath, detour.stops]);

  const showNotice = (msg: string) => {
    setLastActionNotice(msg);
    setTimeout(() => {
      setLastActionNotice(null);
    }, 3000);
  };

  const jumpToLocation = (preset: typeof MONTEVIDEO_PRESETS[0]) => {
    setSelectedPreset(preset.name);
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([preset.lat, preset.lng], preset.zoom || 16, {
        duration: 1.2,
      });
      showNotice(`Ubicado en: ${preset.name}`);
    }
  };

  const handleUndo = async () => {
    if (drawMode === 'blocked' && detour.blockedPath.length > 0) {
      const nextBlocked = detour.blockedPath.slice(0, -1);
      if (autoWriteItinerary && nextBlocked.length > 0) {
        try {
          const cutInfo = await identifyBlockedStreets(nextBlocked);
          onChangeRef.current({ blockedPath: nextBlocked, affectedStreets: cutInfo.description });
        } catch {
          onChangeRef.current({ blockedPath: nextBlocked });
        }
      } else {
        onChangeRef.current({ blockedPath: nextBlocked });
      }
      showNotice('Último punto de corte eliminado');
    } else if (drawMode === 'detour' && detour.detourPath.length > 0) {
      const nextDetour = detour.detourPath.slice(0, -1);
      if (autoWriteItinerary && nextDetour.length > 0) {
        try {
          const itin = await buildDetourItineraryFromPath(nextDetour, detour.direction, detour.affectedStreets);
          onChangeRef.current({ detourPath: nextDetour, detourDescription: itin.text });
          setDetectedStreets(itin.streets);
        } catch {
          onChangeRef.current({ detourPath: nextDetour });
        }
      } else {
        onChangeRef.current({ detourPath: nextDetour });
      }
      showNotice('Último punto de desvío eliminado');
    } else if ((drawMode === 'stop_suprimida' || drawMode === 'stop_provisoria') && detour.stops.length > 0) {
      onChangeRef.current({ stops: detour.stops.slice(0, -1) });
      showNotice('Última parada eliminada');
    }
  };

  const handleClearCurrent = () => {
    if (drawMode === 'blocked') {
      onChangeRef.current({ blockedPath: [] });
      showNotice('Trazo de corte limpiado');
    } else if (drawMode === 'detour') {
      onChangeRef.current({ detourPath: [] });
      setDetectedStreets([]);
      showNotice('Ruta de desvío limpiada');
    } else if (drawMode === 'stop_suprimida' || drawMode === 'stop_provisoria') {
      onChangeRef.current({ stops: [] });
      showNotice('Paradas limpiadas');
    }
  };

  return (
    <div className="relative w-full h-[540px] lg:h-[620px] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 flex flex-col">
      {/* Top Map Control Bar */}
      <div className="bg-white/95 backdrop-blur-md px-3 py-2 border-b border-slate-200 z-[1000] flex flex-wrap items-center justify-between gap-2">
        {/* Drawing Tools Palette */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1 hidden sm:inline">
            Modo:
          </span>

          <button
            type="button"
            onClick={() => setDrawMode('view')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              drawMode === 'view'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Navegar
          </button>

          <button
            type="button"
            onClick={() => setDrawMode('blocked')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              drawMode === 'blocked'
                ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-400 ring-offset-1'
                : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
            }`}
            title="Haz clic en el mapa para marcar las calles cortadas"
          >
            <Ban className="w-3.5 h-3.5" />
            Tramo Cortado
            {detour.blockedPath.length > 0 && (
              <span className="ml-1 bg-white/20 text-white px-1.5 py-0.2 rounded-full text-[10px]">
                {detour.blockedPath.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setDrawMode('detour')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              drawMode === 'detour'
                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400 ring-offset-1'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
            title="Haz clic en las calles para trazar la ruta de desvío que tomarán los buses"
          >
            <CornerDownRight className="w-3.5 h-3.5" />
            Ruta Desvío
            {detour.detourPath.length > 0 && (
              <span className="ml-1 bg-white/20 text-white px-1.5 py-0.2 rounded-full text-[10px]">
                {detour.detourPath.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setDrawMode('stop_suprimida')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              drawMode === 'stop_suprimida'
                ? 'bg-rose-700 text-white shadow-sm ring-2 ring-rose-400 ring-offset-1'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
            }`}
            title="Haz clic en el mapa para marcar paradas suprimidas"
          >
            <MapPin className="w-3.5 h-3.5" />
            Parada Suprimida
          </button>

          <button
            type="button"
            onClick={() => setDrawMode('stop_provisoria')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              drawMode === 'stop_provisoria'
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400 ring-offset-1'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'
            }`}
            title="Haz clic en el mapa para colocar paradas provisorias de abordaje"
          >
            <Navigation className="w-3.5 h-3.5" />
            Parada Provisoria
          </button>
        </div>

        {/* Undo, Layers and Presets */}
        <div className="flex items-center gap-2">
          {drawMode !== 'view' && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleUndo}
                className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 text-xs flex items-center gap-1"
                title="Deshacer último punto"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Deshacer</span>
              </button>
              <button
                type="button"
                onClick={handleClearCurrent}
                className="p-1.5 rounded-md text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 text-xs flex items-center gap-1"
                title="Limpiar capa activa"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Borrar</span>
              </button>
            </div>
          )}

          {/* Clean Map Layer Selector (No API Keys / No Watermarks) */}
          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
            <Layers className="w-3.5 h-3.5 text-slate-500 mx-1 hidden sm:inline" />
            <button
              type="button"
              onClick={() => switchTileProvider('esri_street')}
              className={`px-1.5 py-0.5 rounded transition ${
                activeTile === 'esri_street' ? 'bg-white shadow-xs text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Callejero oficial ESRI nítido sin marcas de agua"
            >
              Callejero
            </button>
            <button
              type="button"
              onClick={() => switchTileProvider('osm')}
              className={`px-1.5 py-0.5 rounded transition ${
                activeTile === 'osm' ? 'bg-white shadow-xs text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="OpenStreetMap estándar"
            >
              OSM
            </button>
            <button
              type="button"
              onClick={() => switchTileProvider('satellite')}
              className={`px-1.5 py-0.5 rounded transition ${
                activeTile === 'satellite' ? 'bg-white shadow-xs text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Fotografía aérea satelital"
            >
              Satélite
            </button>
          </div>

          {/* Quick Montevideo Zones */}
          <div className="flex items-center gap-1 text-xs">
            <Crosshair className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            <select
              value={selectedPreset}
              onChange={(e) => {
                const found = MONTEVIDEO_PRESETS.find((p) => p.name === e.target.value);
                if (found) jumpToLocation(found);
              }}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="" disabled>Ir a zona de Montevideo...</option>
              {MONTEVIDEO_PRESETS.map((preset) => (
                <option key={preset.name} value={preset.name}>
                  {preset.zone}: {preset.name.split('/')[0]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Real-time Detour Writing Bar */}
      <div className="bg-emerald-50/90 border-b border-emerald-200 px-3 py-1.5 z-[1000] flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto text-xs min-w-0 flex-1">
          <div className="flex items-center gap-1.5 font-bold text-emerald-900 shrink-0">
            <PencilLine className={`w-3.5 h-3.5 text-emerald-600 ${isResolvingStreet ? 'animate-spin text-blue-600' : ''}`} />
            <span>Redacción en Vivo:</span>
          </div>
          {detour.detourDescription ? (
            <div className="text-slate-800 font-medium truncate text-[11px]" title={detour.detourDescription}>
              "{detour.detourDescription}"
            </div>
          ) : (
            <span className="text-slate-500 italic text-[11px]">
              Toca sobre las calles con "Ruta Desvío" para escribir el recorrido paso a paso...
            </span>
          )}
        </div>

        {/* Auto-write toggle control */}
        <button
          type="button"
          onClick={() => {
            const next = !autoWriteItinerary;
            setAutoWriteItinerary(next);
            showNotice(next ? '✍️ Redacción automática reactivada' : 'Pausada redacción automática');
          }}
          className={`px-2 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1 transition shrink-0 cursor-pointer ${
            autoWriteItinerary
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
          title="Activar o pausar la redacción automática del texto en el formulario"
        >
          <Sparkles className="w-3 h-3" />
          <span>{autoWriteItinerary ? 'Auto-Escribiendo: SÍ' : 'Auto-Escribiendo: En Pausa'}</span>
        </button>
      </div>

      {/* Interactive Helper Banner based on active mode */}
      {drawMode !== 'view' && (
        <div className="bg-amber-50 border-b border-amber-200 px-3 py-1.5 text-xs text-amber-900 flex items-center justify-between z-[1000]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>
              {drawMode === 'blocked' && 'Haz clic en el mapa para trazar el tramo cortado (calle cerrada al tránsito).'}
              {drawMode === 'detour' && 'Haz clic punto por punto a lo largo de las calles que tomará el desvío de buses.'}
              {drawMode === 'stop_suprimida' && 'Haz clic sobre las paradas de bus habituales que quedan fuera de servicio.'}
              {drawMode === 'stop_provisoria' && 'Haz clic para posicionar paradas provisorias habilitadas para pasajeros.'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDrawMode('view')}
            className="text-amber-800 font-semibold underline text-xs cursor-pointer ml-2 hover:text-amber-950"
          >
            Listo / Finalizar trazado
          </button>
        </div>
      )}

      {/* The Leaflet Container */}
      <div
        ref={mapContainerRef}
        id="montevideo-map"
        className="w-full flex-1 relative z-0 cursor-crosshair"
      />

      {/* Action Toast / Feedback overlay */}
      {lastActionNotice && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900/90 text-white px-3 py-1.5 rounded-full text-xs shadow-lg flex items-center gap-2 backdrop-blur-sm animate-fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{lastActionNotice}</span>
        </div>
      )}

      {/* Floating Legend / Summary Pill (bottom left) */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-200 shadow-md text-xs flex flex-col gap-1 pointer-events-auto">
        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          Montevideo • STM
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-600">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-1 bg-red-600 inline-block rounded"></span>
            Corte: {detour.blockedPath.length} pts
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-1 bg-emerald-600 inline-block rounded"></span>
            Desvío: {detour.detourPath.length} pts
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-blue-600 rounded-full inline-block"></span>
            Paradas: {detour.stops.length}
          </span>
        </div>
      </div>
    </div>
  );
}
