import { memo, useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createIcon = (color) =>
    L.divIcon({
        className: 'custom-marker',
        html: `<div style="
      width: 10px; height: 10px;
      background: ${color};
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.9);
      box-shadow: 0 0 6px ${color}60;
    "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
    });

const typeColors = {
    THEFT: '#c94a2a',
    BATTERY: '#d4612c',
    ASSAULT: '#c9a227',
    'CRIMINAL DAMAGE': '#8a8070',
    'MOTOR VEHICLE THEFT': '#2a6b5a',
    BURGLARY: '#a0522d',
    NARCOTICS: '#5a7a54',
    ROBBERY: '#8b6914',
    HOMICIDE: '#8b0000',
};

function FitBounds({ points }) {
    const map = useMap();
    useEffect(() => {
        if (points && points.length > 0) {
            const bounds = points.slice(0, 200).map((p) => [p.lat, p.lng]);
            if (bounds.length > 0) {
                map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
            }
        }
    }, [points, map]);
    return null;
}

function CrimeMap({ heatmapData, riskScores }) {
    const [showHeatmap, setShowHeatmap] = useState(false);
    const chicagoCenter = [41.8781, -87.6298];

    const markers = useMemo(() => {
        if (!heatmapData) return [];
        return heatmapData
            .filter((p) => p.lat && p.lng)
            .slice(0, 500)
            .map((p, i) => ({
                ...p,
                id: i,
                color: typeColors[p.type] || '#c94a2a',
            }));
    }, [heatmapData]);

    return (
        <div className="glass-card overflow-hidden">
            <div className="p-6 pb-0 flex items-center justify-between">
                <div>
                    <p className="section-subtitle" style={{ marginBottom: '0.25rem' }}>Geographic</p>
                    <p style={{
                        fontFamily: 'var(--serif)', fontSize: '1.25rem', fontWeight: 700,
                        color: 'var(--ink)',
                    }}>Interactive Map</p>
                </div>
                <button
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    style={{
                        fontFamily: 'var(--mono)',
                        fontSize: '0.72rem',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        padding: '0.5rem 1.2rem',
                        borderRadius: '999px',
                        cursor: 'pointer',
                        background: showHeatmap ? 'rgba(201,74,42,0.1)' : 'var(--cream)',
                        border: `1px solid ${showHeatmap ? 'rgba(201,74,42,0.3)' : 'var(--border-subtle)'}`,
                        color: showHeatmap ? 'var(--rust)' : 'var(--mist)',
                        transition: 'all 0.25s',
                    }}
                >
                    {showHeatmap ? '● Heatmap ON' : '○ Heatmap OFF'}
                </button>
            </div>

            <div className="p-4" style={{ height: '500px' }}>
                <MapContainer
                    center={chicagoCenter}
                    zoom={11}
                    style={{ height: '100%', width: '100%', borderRadius: 'var(--radius-md)' }}
                    scrollWheelZoom={true}
                    zoomControl={false}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
                    />
                    <FitBounds points={markers} />

                    {markers.map((m) => (
                        <Marker key={m.id} position={[m.lat, m.lng]} icon={createIcon(m.color)}>
                            <Popup>
                                <div style={{ fontFamily: 'var(--sans)', fontSize: '12px' }}>
                                    <strong style={{ color: m.color, fontFamily: 'var(--serif)' }}>{m.type}</strong>
                                    <br />
                                    <span style={{ color: 'var(--mist)', fontFamily: 'var(--mono)', fontSize: '10px' }}>
                                        {m.lat.toFixed(4)}, {m.lng.toFixed(4)}
                                    </span>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* Legend */}
            <div className="px-6 pb-5 flex flex-wrap gap-3">
                {Object.entries(typeColors).slice(0, 6).map(([type, color]) => (
                    <span key={type} className="flex items-center gap-1.5" style={{
                        fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: '0.08em',
                        color: 'var(--mist)', textTransform: 'uppercase',
                    }}>
                        <span className="w-2 h-2 rounded-full inline-block" style={{ background: color }} />
                        {type}
                    </span>
                ))}
            </div>
        </div>
    );
}

export default memo(CrimeMap);
