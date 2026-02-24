import { memo, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
    AreaChart, Area, CartesianGrid,
} from 'recharts';

/* LUMIS warm palette */
const COLORS = ['#c94a2a', '#c9a227', '#2a6b5a', '#8a8070', '#d4612c', '#5a7a54', '#a0522d', '#8b6914'];

const chartContainerStyle = {
    background: 'var(--white)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-lg)',
};

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: 'var(--white)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            boxShadow: '0 8px 24px rgba(13,13,13,0.12)',
            fontFamily: 'var(--sans)',
        }}>
            <p style={{ fontFamily: 'var(--mono)', color: 'var(--mist)', fontSize: '11px', marginBottom: 4, letterSpacing: '0.05em' }}>{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{
                    fontFamily: 'var(--serif)', color: p.color || 'var(--ink)',
                    fontSize: '16px', fontWeight: 700,
                }}>
                    {p.value?.toLocaleString()}
                </p>
            ))}
        </div>
    );
};

const AXIS_STYLE = { fill: '#8a8070', fontSize: 10, fontFamily: 'DM Mono, monospace' };

/* ── Crime by Type (Bar) ─────────────────────────────────────────── */
function CrimeByTypeChart({ data }) {
    const chartData = useMemo(() => {
        if (!data) return [];
        return data.slice(0, 10).map((d) => ({
            ...d,
            name: d.type?.replace(/\s+/g, '\n').substring(0, 15) || 'Unknown',
        }));
    }, [data]);

    return (
        <div style={chartContainerStyle}>
            <p className="section-subtitle" style={{ marginBottom: '0.25rem' }}>Distribution</p>
            <p style={{ fontFamily: 'var(--serif)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '1.5rem' }}>Crime by Type</p>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} barSize={22}>
                    <XAxis dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                    <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {chartData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

/* ── District Distribution (Pie) ─────────────────────────────────── */
function DistrictPieChart({ data }) {
    const chartData = useMemo(() => {
        if (!data) return [];
        return data.slice(0, 8).map((d) => ({
            name: `D${d.district}`,
            value: d.count,
        }));
    }, [data]);

    return (
        <div style={chartContainerStyle}>
            <p className="section-subtitle" style={{ marginBottom: '0.25rem' }}>Breakdown</p>
            <p style={{ fontFamily: 'var(--serif)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '1.5rem' }}>District Distribution</p>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={110}
                        paddingAngle={3} dataKey="value" stroke="none">
                        {chartData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
                {chartData.map((d, i) => (
                    <span key={d.name} className="flex items-center gap-1.5" style={{
                        fontFamily: 'var(--mono)', fontSize: '0.65rem', letterSpacing: '0.08em',
                        color: 'var(--mist)', textTransform: 'uppercase',
                    }}>
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: COLORS[i % COLORS.length] }} />
                        {d.name}
                    </span>
                ))}
            </div>
        </div>
    );
}

/* ── Trend (Area) ────────────────────────────────────────────────── */
function TrendChart({ data }) {
    const chartData = useMemo(() => {
        if (!data) return [];
        return data.slice(-60).map((d) => ({
            date: d.date?.slice(5) || '',
            count: d.count,
        }));
    }, [data]);

    return (
        <div style={chartContainerStyle}>
            <p className="section-subtitle" style={{ marginBottom: '0.25rem' }}>Over Time</p>
            <p style={{ fontFamily: 'var(--serif)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '1.5rem' }}>Crime Trend</p>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#c94a2a" stopOpacity={0.25} />
                            <stop offset="100%" stopColor="#c94a2a" stopOpacity={0.02} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(13,13,13,0.06)" />
                    <XAxis dataKey="date" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                    <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="count" stroke="#c94a2a" strokeWidth={2} fill="url(#trendGrad)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

/* ── Risk Comparison (Bar) ───────────────────────────────────────── */
function RiskComparisonChart({ data }) {
    const chartData = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];
        return data.slice(0, 12).map((d) => ({
            name: `D${d.district}`,
            score: d.risk_score,
        }));
    }, [data]);

    const getBarColor = (score) => {
        if (score >= 75) return '#c94a2a';
        if (score >= 50) return '#c9a227';
        return '#2a6b5a';
    };

    return (
        <div style={chartContainerStyle}>
            <p className="section-subtitle" style={{ marginBottom: '0.25rem' }}>ML Predictions</p>
            <p style={{ fontFamily: 'var(--serif)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '1.5rem' }}>Risk Score by District</p>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} barSize={20}>
                    <XAxis dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, i) => (
                            <Cell key={i} fill={getBarColor(entry.score)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export default { CrimeByTypeChart, DistrictPieChart, TrendChart, RiskComparisonChart };
export { CrimeByTypeChart, DistrictPieChart, TrendChart, RiskComparisonChart };
