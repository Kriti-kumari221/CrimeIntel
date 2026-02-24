import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] },
    }),
};

function StatCard({ label, value, subtitle, icon, color, index }) {
    return (
        <motion.div
            className="stat-card"
            custom={index}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={cardVariants}
        >
            <div className="flex items-start justify-between" style={{ marginBottom: '0.75rem' }}>
                <span
                    className="text-2xl flex items-center justify-center"
                    style={{
                        width: '42px', height: '42px',
                        borderRadius: 'var(--radius-md)',
                        background: `${color}12`,
                        color: color,
                    }}
                >
                    {icon}
                </span>
            </div>
            <p style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.65rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--mist)',
                marginBottom: '0.25rem',
            }}>
                {label}
            </p>
            <p style={{
                fontFamily: 'var(--serif)',
                fontSize: '2rem',
                fontWeight: 900,
                color: 'var(--ink)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
            }}>
                {value}
            </p>
            {subtitle && (
                <p style={{
                    fontFamily: 'var(--sans)',
                    fontSize: '0.78rem',
                    color: 'var(--mist)',
                    marginTop: '0.25rem',
                }}>
                    {subtitle}
                </p>
            )}
        </motion.div>
    );
}

function StatsCards({ crimes, peakHours }) {
    const stats = useMemo(() => {
        if (!crimes || crimes.length === 0) {
            return { total: 0, mostCommon: '—', mostDistrict: '—', peakHour: '—' };
        }

        const today = new Date().toISOString().slice(0, 10);
        const todayCount = crimes.filter((c) => c.date?.startsWith(today)).length;

        const typeCounts = {};
        crimes.forEach((c) => {
            const t = c.primary_type || 'UNKNOWN';
            typeCounts[t] = (typeCounts[t] || 0) + 1;
        });
        const mostCommon = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

        const distCounts = {};
        crimes.forEach((c) => {
            const d = c.district;
            if (d) distCounts[d] = (distCounts[d] || 0) + 1;
        });
        const mostDistrict = Object.entries(distCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

        let peakHour = '—';
        if (peakHours && peakHours.length > 0) {
            const h = peakHours[0].hour;
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            peakHour = `${h12}:00 ${ampm}`;
        }

        return { total: todayCount || crimes.length, mostCommon, mostDistrict: `District ${mostDistrict}`, peakHour };
    }, [crimes, peakHours]);

    const cards = [
        { label: 'Total Crimes', value: stats.total.toLocaleString(), subtitle: 'In dataset', icon: '📊', color: '#c94a2a' },
        { label: 'Most Common', value: stats.mostCommon, subtitle: 'Crime type', icon: '🔍', color: '#c9a227' },
        { label: 'Most Affected', value: stats.mostDistrict, subtitle: 'By volume', icon: '📍', color: '#2a6b5a' },
        { label: 'Peak Hour', value: stats.peakHour, subtitle: 'Highest activity', icon: '🕐', color: '#8a8070' },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {cards.map((card, i) => (
                <StatCard key={card.label} {...card} index={i} />
            ))}
        </div>
    );
}

export default memo(StatsCards);
