import React, { useMemo } from 'react';
import { Paper } from '@mui/material';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';

/**
 * Props:
 *  - geojsonOverlays: Array<{ kind: 'residential'|'commercial'|'industrial'|'park'|'public', geojson: FeatureCollection }>
 *  - recommendations: Array<{ id, type: 'school'|'park'|string, reason?: string, location?: Feature|FeatureCollection }>
 */
export default function MapCanvas({ geojsonOverlays = [], recommendations = [] }) {
  // style per-kategori
  const styleByKind = (kind) => ({
    color: '#6b7280',
    weight: 1,
    fillOpacity: 0.6,
    fillColor:
      kind === 'residential' ? '#f7e0a3' :
      kind === 'commercial'  ? '#cde2f7' :
      kind === 'industrial'  ? '#d9d9d9' :
      kind === 'park'        ? '#bfe3c0' : '#eaeaea'
  });

  // gabungan semua geometry utk fitBounds
  const allCollections = useMemo(() => {
    const recGeo = recommendations
      .filter(r => r.location)
      .map(r => r.location);
    return [
      ...geojsonOverlays.map(o => o.geojson),
      ...recGeo
    ];
  }, [geojsonOverlays, recommendations]);

  return (
    <Paper sx={{ height: 'calc(100vh - 140px)', minHeight: 460, overflow: 'hidden' }}>
      <MapContainer
        center={[-6.1754, 106.8272]} // Jakarta default [lat, lng]
        zoom={12}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          // OpenStreetMap tile bebas token
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Overlays per kind */}
        {geojsonOverlays.map((ov, idx) => (
          <GeoJSON
            key={`ov-${idx}`}
            data={ov.geojson}
            style={styleByKind(ov.kind)}
            pointToLayer={(feature, latlng) =>
              // jika overlay berisi Point, tampilkan circle kecil
              L.circleMarker(latlng, { radius: 5, color: '#6b7280', weight: 1 })
            }
          />
        ))}

        {/* Titik rekomendasi (jika ada lokasi) */}
        {recommendations.filter(r => r.location).map((r) => (
          <GeoJSON
            key={`rec-${r.id}`}
            data={r.location}
            pointToLayer={(_, latlng) =>
              L.circleMarker(latlng, {
                radius: 6,
                color: r.type === 'school' ? '#1f2a44' : '#4d7c0f',
                fillColor: r.type === 'school' ? '#1f2a44' : '#4d7c0f',
                fillOpacity: 0.9,
                weight: 1
              }).bindTooltip(`${r.type}`)
            }
          />
        ))}

        <AutoFit collections={allCollections} />
      </MapContainer>
    </Paper>
  );
}

/** Komponen kecil untuk fit bounds ke semua GeoJSON yang ada */
function AutoFit({ collections }) {
  const map = useMap();
  React.useEffect(() => {
    if (!collections.length) return;
    const group = L.featureGroup(
      collections
        .filter(Boolean)
        .map((fc) => L.geoJSON(fc))
    );
    if (group.getLayers().length) {
      map.fitBounds(group.getBounds(), { padding: [40, 40] });
    }
  }, [collections, map]);
  return null;
}
