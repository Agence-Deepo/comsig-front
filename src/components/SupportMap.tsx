// Carte des supports (Leaflet + tuiles OpenStreetMap). Marqueurs vectoriels : aucune image externe requise.
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { statusOf } from '../lib/labels';

const COLOR: Record<string, string> = { disponible: '#1baf7a', pre_reserve: '#2a78d6', reserve: '#2a78d6', occupe: '#6250d6', en_maintenance: '#eda100', indisponible: '#e34948', retire: '#8a8f99' };

export function SupportMap({ rows, height }: { rows: any[]; height?: 'sm' }) {
  const pts = rows.filter((s) => s.latitude && s.longitude);
  const center: [number, number] = pts.length ? [pts.reduce((a, s) => a + s.latitude, 0) / pts.length, pts.reduce((a, s) => a + s.longitude, 0) / pts.length] : [5.33, -4.01];
  return (
    <div className={`map ${height ?? ''}`} role="region" aria-label="Carte des supports publicitaires">
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer attribution='&copy; contributeurs OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {pts.map((s) => {
          const best = s.faces?.some((f: any) => f.state === 'disponible') ? 'disponible' : s.faces?.[0]?.state ?? s.status;
          return (
            <CircleMarker key={s.id} center={[s.latitude, s.longitude]} radius={8} pathOptions={{ color: '#fff', weight: 2, fillColor: COLOR[best] ?? '#8a8f99', fillOpacity: 0.95 }}>
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <strong>{s.code}</strong><br />{s.name}<br />
                  {(s.faces ?? []).map((f: any) => <div key={f.id}>Face {f.code} : {statusOf('face', f.state)[0]}</div>)}
                  <Link to={`/supports/${s.id}`}>Ouvrir la fiche</Link>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export function MapLegend() {
  return (
    <div className="chart-legend" style={{ margin: 0 }}>
      {['disponible', 'reserve', 'occupe', 'en_maintenance', 'indisponible'].map((k) => (
        <span key={k}><i className="swatch" style={{ background: COLOR[k], borderRadius: '50%' }} />{statusOf('face', k)[0]}</span>
      ))}
    </div>
  );
}
