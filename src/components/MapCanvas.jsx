// 3) Ganti seluruh src/components/MapCanvas.jsx dengan versi ini (tanpa react-leaflet-draw)
import React, { useEffect, useMemo, useRef } from 'react';
import { Paper } from '@mui/material';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';

/**
 * Props:
 * - geojsonOverlays: Array<{ kind: string, geojson: FeatureCollection }>
 * - recommendations: Array<{ id: string, type: string, location?: Feature|FeatureCollection }>
 * - bbox: { south:number, west:number, north:number, east:number } | null
 * - onBBoxChange: (bounds: L.LatLngBounds | null) => void
 */
export default function MapCanvas({ geojsonOverlays = [], recommendations = [], bbox, onBBoxChange }) {
  const allCollections = useMemo(() => {
    const recGeo = recommendations.filter(r => r.location).map(r => r.location);
    return [...geojsonOverlays.map(o => o.geojson), ...recGeo];
  }, [geojsonOverlays, recommendations]);

  return (
    <Paper sx={{ height: 'calc(100vh - 140px)', minHeight: 460, overflow: 'hidden' }}>
      <MapContainer
        center={[-6.1754, 106.8272]} // Jakarta default [lat,lng]
        zoom={12}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Overlays */}
        {geojsonOverlays.map((ov, idx) => (
          <GeoJSON
            key={`ov-${idx}`}
            data={ov.geojson}
            style={{
              color: '#6b7280',
              weight: 1,
              fillOpacity: 0.6,
              fillColor:
                ov.kind === 'residential' ? '#f7e0a3' :
                ov.kind === 'commercial'  ? '#cde2f7' :
                ov.kind === 'industrial'  ? '#d9d9d9' :
                ov.kind === 'park'        ? '#bfe3c0' : '#eaeaea'
            }}
            pointToLayer={(_, latlng) => L.circleMarker(latlng, { radius: 5, color: '#6b7280', weight: 1 })}
          />
        ))}

        {/* Auto fit to data */}
        <AutoFit collections={allCollections} />

        {/* Draw rectangle control (Leaflet.Draw original) */}
        <DrawBBox bbox={bbox} onBBoxChange={onBBoxChange} />
      </MapContainer>
    </Paper>
  );
}

/** Fit bounds helper */
function AutoFit({ collections }) {
  const map = useMap();
  useEffect(() => {
    if (!collections.length) return;
    const group = L.featureGroup(
      collections.filter(Boolean).map(fc => L.geoJSON(fc))
    );
    if (group.getLayers().length) {
      map.fitBounds(group.getBounds(), { padding: [40, 40] });
    }
  }, [collections, map]);
  return null;
}

/** Adds Leaflet.Draw controls without a React wrapper */
function DrawBBox({ bbox, onBBoxChange }) {
  const map = useMap();
  const fgRef = useRef(L.featureGroup());     // container untuk rectangle yang digambar
  const drawControlRef = useRef(null);

  // mount: pasang featureGroup & control + event handlers
  useEffect(() => {
    const fg = fgRef.current;
    map.addLayer(fg);

    // hanya rectangle; edit/remove aktif untuk fg
    const drawControl = new L.Control.Draw({
      draw: {
        rectangle: { shapeOptions: { color: '#1f2a44', weight: 1, dashArray: '4 4' } },
        polygon: false, polyline: false, marker: false, circle: false, circlemarker: false
      },
      edit: { featureGroup: fg, remove: true }
    });
    drawControlRef.current = drawControl;
    map.addControl(drawControl);

    // handlers
    const onCreated = (e) => {
      if (e.layerType !== 'rectangle') return;
      fg.clearLayers();            // hanya 1 rectangle
      fg.addLayer(e.layer);
      if (onBBoxChange && e.layer.getBounds) onBBoxChange(e.layer.getBounds());
    };
    const onEdited = (e) => {
      const layers = e.layers.getLayers();
      if (layers.length && onBBoxChange) onBBoxChange(layers[0].getBounds());
    };
    const onDeleted = () => { if (onBBoxChange) onBBoxChange(null); };

    map.on(L.Draw.Event.CREATED, onCreated);
    map.on(L.Draw.Event.EDITED, onEdited);
    map.on(L.Draw.Event.DELETED, onDeleted);

    // cleanup on unmount
    return () => {
      map.off(L.Draw.Event.CREATED, onCreated);
      map.off(L.Draw.Event.EDITED, onEdited);
      map.off(L.Draw.Event.DELETED, onDeleted);
      if (drawControlRef.current) map.removeControl(drawControlRef.current);
      map.removeLayer(fg);
    };
  }, [map, onBBoxChange]);

  // sync: kalau prop bbox berubah dari luar, gambarkan ulang rectangle-nya
  useEffect(() => {
    const fg = fgRef.current;
    fg.clearLayers();
    if (!bbox) return;
    const bounds = L.latLngBounds([bbox.south, bbox.west], [bbox.north, bbox.east]); // [SW],[NE]
    const rect = L.rectangle(bounds, { color: '#1f2a44', weight: 1, dashArray: '4 4' });
    fg.addLayer(rect);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [bbox, map]);

  return null;
}
