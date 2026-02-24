import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

const getRiskColor = (score) => {
    if (score >= 80) return '#ff3366'; // Neon pink/red
    if (score >= 60) return '#ff9933'; // Neon orange
    if (score >= 40) return '#ffcc00'; // Neon yellow
    return '#00ffcc'; // Neon cyan
};

const getRiskLabel = (score) => {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Moderate';
    return 'Low';
};

const trendIcon = (trend) => {
    if (trend === 'increasing') return '↗';
    if (trend === 'decreasing') return '↘';
    return '→';
};

const trendColor = (trend) => {
    if (trend === 'increasing') return '#ff3366';
    if (trend === 'decreasing') return '#00ffcc';
    return '#8a8070';
};

function RiskIntelligence({ riskScores }) {
    const data = useMemo(() => {
        if (!riskScores || !Array.isArray(riskScores)) return [];
        return riskScores;
    }, [riskScores]);

    const top3 = data.slice(0, 3);

    if (data.length === 0) {
        return (
            <div style={{
                background: 'linear-gradient(145deg, rgba(20,20,25,0.6), rgba(10,10,15,0.8))',
                border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                borderRadius: 'var(--radius-lg)',
                padding: '3rem',
                textAlign: 'center',
            }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--mono)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                    Risk model not yet trained. Data loading…
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* Top 3 highlight cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {top3.map((d, i) => {
                    const color = getRiskColor(d.risk_score);
                    return (
                        <motion.div
                            key={d.district}
                            className="relative overflow-hidden group"
                            style={{
                                background: `linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9))`,
                                border: `1px solid rgba(255,255,255,0.05)`,
                                borderRadius: 'var(--radius-lg)',
                                padding: 'var(--space-lg)',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                                transition: 'all 0.3s ease',
                            }}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            whileHover={{ y: -5, boxShadow: `0 12px 40px ${color}30`, borderColor: `${color}50` }}
                        >
                            {/* Rank badge */}
                            <div
                                className="absolute top-4 right-4 flex items-center justify-center glow-badge"
                                style={{
                                    width: '32px', height: '32px',
                                    borderRadius: '50%',
                                    background: `${color}15`,
                                    border: `1px solid ${color}40`,
                                    color: color,
                                    fontFamily: 'var(--serif)',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    boxShadow: `0 0 15px ${color}30`,
                                }}
                            >
                                #{i + 1}
                            </div>

                            <p style={{
                                fontFamily: 'var(--mono)',
                                fontSize: '0.62rem',
                                letterSpacing: '0.15em',
                                textTransform: 'uppercase',
                                color: 'rgba(255,255,255,0.4)',
                                marginBottom: '0.25rem',
                            }}>
                                {getRiskLabel(d.risk_score)} Risk
                            </p>
                            <p style={{
                                fontFamily: 'var(--serif)',
                                fontSize: '1.6rem',
                                fontWeight: 900,
                                color: '#ffffff',
                                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                                marginBottom: '0.25rem',
                            }}>
                                District {d.district}
                            </p>
                            <div className="flex items-center gap-2 mb-4">
                                <span style={{
                                    fontFamily: 'var(--serif)',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    color: color,
                                    textShadow: `0 0 10px ${color}50`,
                                }}>
                                    {d.risk_score}/100
                                </span>
                                <span style={{
                                    color: trendColor(d.trend),
                                    fontSize: '0.8rem',
                                    fontFamily: 'var(--mono)',
                                }}>
                                    {trendIcon(d.trend)} {d.trend}
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="risk-bar-track" style={{ background: 'rgba(255,255,255,0.05)', overflow: 'visible', borderRadius: '4px' }}>
                                <motion.div
                                    className="risk-bar-fill"
                                    style={{ 
                                        background: `linear-gradient(90deg, ${color}40, ${color})`,
                                        boxShadow: `0 0 10px ${color}80, 0 0 20px ${color}40`,
                                        borderRadius: '4px'
                                    }}
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${d.risk_score}%` }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1.2, delay: 0.3 + i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                                />
                            </div>

                            <p style={{
                                fontFamily: 'var(--mono)',
                                fontSize: '0.65rem',
                                color: 'rgba(255,255,255,0.3)',
                                marginTop: '0.75rem',
                                letterSpacing: '0.05em',
                            }}>
                                Predicted: ~{Math.round(d.predicted_next_week)} crimes next week
                            </p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Full ranking table */}
            <div style={{
                background: 'linear-gradient(180deg, rgba(20,20,25,0.9), rgba(10,10,15,0.95))',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(10px)',
            }}>
                <div className="p-6 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="section-subtitle" style={{
                        marginBottom: '0.25rem',
                        color: '#ff3366',
                    }}>
                        <span style={{ display: 'inline-block', width: '24px', height: '1px', background: '#ff3366', marginRight: '0.75rem', boxShadow: '0 0 5px #ff3366' }} />
                        Full Rankings
                    </p>
                    <p style={{
                        fontFamily: 'var(--serif)',
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: '#ffffff',
                        textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                    }}>All District Risk Scores</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                        <thead>
                            <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                                {['Rank', 'District', 'Risk Score', 'Predicted', 'Trend', 'Progress'].map((h) => (
                                    <th
                                        key={h}
                                        style={{
                                            padding: '1rem 1.5rem',
                                            textAlign: 'left',
                                            fontFamily: 'var(--mono)',
                                            fontSize: '0.62rem',
                                            fontWeight: 600,
                                            letterSpacing: '0.15em',
                                            textTransform: 'uppercase',
                                            color: 'rgba(255,255,255,0.4)',
                                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        }}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((d, i) => {
                                const color = getRiskColor(d.risk_score);
                                return (
                                    <motion.tr
                                        key={d.district}
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.03 }}
                                        style={{
                                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                                            transition: 'background 0.3s',
                                        }}
                                        onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                        onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <td style={{
                                            padding: '1rem 1.5rem',
                                            fontFamily: 'var(--mono)',
                                            fontSize: '0.75rem',
                                            color: 'rgba(255,255,255,0.3)',
                                        }}>
                                            {i + 1}
                                        </td>
                                        <td style={{
                                            padding: '1rem 1.5rem',
                                            fontFamily: 'var(--serif)',
                                            fontSize: '0.95rem',
                                            fontWeight: 700,
                                            color: '#ffffff',
                                        }}>
                                            District {d.district}
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '999px',
                                                fontFamily: 'var(--mono)',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                background: `${color}15`,
                                                border: `1px solid ${color}40`,
                                                color: color,
                                                letterSpacing: '0.05em',
                                                boxShadow: `0 0 10px ${color}20`,
                                            }}>
                                                {d.risk_score}
                                            </span>
                                        </td>
                                        <td style={{
                                            padding: '1rem 1.5rem',
                                            fontFamily: 'var(--mono)',
                                            fontSize: '0.8rem',
                                            color: 'rgba(255,255,255,0.5)',
                                        }}>
                                            ~{Math.round(d.predicted_next_week)}
                                        </td>
                                        <td style={{
                                            padding: '1rem 1.5rem',
                                            fontFamily: 'var(--mono)',
                                            fontSize: '0.8rem',
                                        }}>
                                            <span style={{ 
                                                color: trendColor(d.trend),
                                                textShadow: `0 0 5px ${trendColor(d.trend)}50` 
                                            }}>
                                                {trendIcon(d.trend)} {d.trend}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', minWidth: '140px' }}>
                                            <div className="risk-bar-track" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', overflow: 'visible', borderRadius: '4px' }}>
                                                <motion.div
                                                    className="risk-bar-fill"
                                                    style={{ 
                                                        background: `linear-gradient(90deg, ${color}40, ${color})`, 
                                                        width: `${d.risk_score}%`,
                                                        boxShadow: `0 0 10px ${color}80`,
                                                        borderRadius: '4px'
                                                    }}
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${d.risk_score}%` }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.8, delay: i * 0.03 }}
                                                />
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default memo(RiskIntelligence);
