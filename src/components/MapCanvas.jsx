// src/components/MapCanvas.jsx  (tambahan prop: results)
import React, { useEffect, useMemo, useRef } from 'react';
import { Paper } from '@mui/material';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';

export default function MapCanvas({
  geojsonOverlays,
  recommendations,
  bbox,
  onBBoxChange,
  results = []       // <-- NEW
}) {
  const overlaysArr = Array.isArray(geojsonOverlays) ? geojsonOverlays : (geojsonOverlays ? [geojsonOverlays] : []);
  const recsArr     = Array.isArray(recommendations) ? recommendations : (recommendations ? [recommendations] : []);

  const allCollections = useMemo(() => {
    const recGeo = recsArr.filter(r => r?.location).map(r => r.location);
    return [...overlaysArr.map(o => o?.geojson).filter(Boolean), ...recGeo];
  }, [overlaysArr, recsArr]);

  return (
    <Paper sx={{ p: 0, overflow: 'hidden' }}>
      <div style={{ height: 'calc(100vh - 160px)', minHeight: 460 }}>
        <MapContainer
          center={[35.6895, 139.6917]} // Tokyo
          zoom={12}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {overlaysArr.map((ov, idx) => (
            ov?.geojson ? (
              <GeoJSON
                key={`ov-${idx}`}
                data={ov.geojson}
                style={{
                  color: '#6b7280', weight: 1, fillOpacity: 0.6,
                  fillColor:
                    ov.kind === 'residential' ? '#f7e0a3' :
                    ov.kind === 'commercial'  ? '#cde2f7' :
                    ov.kind === 'industrial'  ? '#d9d9d9' :
                    ov.kind === 'park'        ? '#bfe3c0' : '#eaeaea'
                }}
                pointToLayer={(_, latlng) => L.circleMarker(latlng, { radius: 5, color: '#6b7280', weight: 1 })}
              />
            ) : null
          ))}

          <AutoFit collections={allCollections} />
          <DrawBBox bbox={bbox} onBBoxChange={onBBoxChange} />

          {/* NEW: layer untuk hasil MCP */}
          <ResultsLayer results={results} />
        </MapContainer>
      </div>
    </Paper>
  );
}

function AutoFit({ collections }) {
  const map = useMap();
  useEffect(() => {
    const valid = collections.filter(Boolean);
    if (!valid.length) return;
    const group = L.featureGroup(valid.map(fc => L.geoJSON(fc)));
    if (group.getLayers().length) map.fitBounds(group.getBounds(), { padding: [40, 40] });
  }, [collections, map]);
  return null;
}

function DrawBBox({ bbox, onBBoxChange }) {
  const map = useMap();
  const fgRef = useRef(L.featureGroup());
  const drawControlRef = useRef(null);

  useEffect(() => {
    const fg = fgRef.current;
    map.addLayer(fg);

    const drawControl = new L.Control.Draw({
      draw: {
        rectangle: { shapeOptions: { color: '#1f2a44', weight: 1, dashArray: '4 4' } },
        polygon: false, polyline: false, marker: false, circle: false, circlemarker: false
      },
      edit: { featureGroup: fg, remove: true }
    });
    drawControlRef.current = drawControl;
    map.addControl(drawControl);

    const onCreated = (e) => {
      if (e.layerType !== 'rectangle') return;
      fg.clearLayers();
      fg.addLayer(e.layer);
      onBBoxChange?.(e.layer.getBounds());
    };
    const onEdited = (e) => {
      const layers = e.layers.getLayers();
      if (layers.length) onBBoxChange?.(layers[0].getBounds());
    };
    const onDeleted = () => onBBoxChange?.(null);

    map.on(L.Draw.Event.CREATED, onCreated);
    map.on(L.Draw.Event.EDITED, onEdited);
    map.on(L.Draw.Event.DELETED, onDeleted);

    return () => {
      map.off(L.Draw.Event.CREATED, onCreated);
      map.off(L.Draw.Event.EDITED, onEdited);
      map.off(L.Draw.Event.DELETED, onDeleted);
      if (drawControlRef.current) map.removeControl(drawControlRef.current);
      map.removeLayer(fg);
    };
  }, [map, onBBoxChange]);

  useEffect(() => {
    const fg = fgRef.current;
    fg.clearLayers();
    if (!bbox) return;
    const bounds = L.latLngBounds([bbox.south, bbox.west], [bbox.north, bbox.east]);
    const rect = L.rectangle(bounds, { color: '#1f2a44', weight: 1, dashArray: '4 4' });
    fg.addLayer(rect);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [bbox, map]);

  return null;
}

// === NEW: tampilkan marker hasil MCP + auto fit ===
function ResultsLayer({ results = [] }) {
  const map = useMap();
  const groupRef = useRef(L.layerGroup());

  useEffect(() => {
    const group = groupRef.current;
    if (!map.hasLayer(group)) map.addLayer(group);
    group.clearLayers();

    const pts = [];
    (Array.isArray(results) ? results : []).forEach((r) => {
      const lat = Number(r?.lat), lon = Number(r?.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
      pts.push([lat, lon]);
      const marker = L.circleMarker([lat, lon], { radius: 6, weight: 2 });
      marker.bindPopup(
        `<strong>${(r.title || '').replace(/</g,'&lt;')}</strong><br/>Year: ${r.year ?? '-'}<br/>${lat.toFixed(5)}, ${lon.toFixed(5)}`
      );
      group.addLayer(marker);
    });

    if (pts.length) {
      const bounds = L.latLngBounds(pts);
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
    }

    return () => { if (map.hasLayer(group)) map.removeLayer(group); };
  }, [results, map]);

  return null;
}
