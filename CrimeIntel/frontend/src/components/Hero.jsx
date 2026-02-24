import { motion } from 'framer-motion';

export default function Hero() {
    return (
        <section style={{
            minHeight: '100vh',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            position: 'relative',
            overflow: 'hidden',
        }} className="hero-grid">
            {/* Left — Content */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '7rem 3rem 5rem',
                position: 'relative',
                zIndex: 2,
            }}>
                <motion.p
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{
                        fontFamily: 'var(--mono)',
                        fontSize: '0.68rem',
                        letterSpacing: '0.2em',
                        color: 'var(--rust)',
                        textTransform: 'uppercase',
                        marginBottom: '2rem',
                    }}
                >
                    Vol. 01 — Live Intelligence Platform
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.4 }}
                    style={{
                        fontFamily: 'var(--serif)',
                        fontSize: 'clamp(3.5rem, 6.5vw, 7rem)',
                        fontWeight: 900,
                        lineHeight: 0.92,
                        color: 'var(--ink)',
                        marginBottom: '2rem',
                    }}
                >
                    Chicago<br />
                    <em style={{ fontStyle: 'italic', color: 'var(--rust)' }}>Crime</em><br />
                    Intelligence
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.6 }}
                    style={{
                        fontFamily: 'var(--sans)',
                        fontSize: '0.95rem',
                        fontWeight: 400,
                        lineHeight: 1.7,
                        color: 'var(--mist)',
                        maxWidth: '360px',
                        marginBottom: '3rem',
                    }}
                >
                    Predictive analytics and real-time intelligence powered by machine learning. Monitor, analyze, and anticipate crime patterns.
                </motion.p>

                <motion.a
                    href="#dashboard"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.8 }}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '1rem',
                        fontFamily: 'var(--mono)',
                        fontSize: '0.75rem',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        color: 'var(--ink)',
                        textDecoration: 'none',
                        borderBottom: '1px solid var(--ink)',
                        paddingBottom: '0.4rem',
                        width: 'fit-content',
                        transition: 'color 0.3s, border-color 0.3s',
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.color = 'var(--rust)'; e.currentTarget.style.borderColor = 'var(--rust)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.color = 'var(--ink)'; e.currentTarget.style.borderColor = 'var(--ink)'; }}
                >
                    Explore Dashboard
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </motion.a>
            </div>

            {/* Right — Visual */}
            <motion.div
                className="hero-right-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.3 }}
                style={{ position: 'relative', overflow: 'hidden' }}
            >
                {/* Dark gradient background */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(135deg, #2a1f14 0%, #1a0f08 50%, #3d2810 100%)',
                }} />

                {/* Grid cells */}
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gridTemplateRows: '1fr 1fr',
                    gap: '2px',
                }}>
                    <div style={{ background: 'linear-gradient(160deg, rgba(201,74,42,0.13), rgba(201,162,39,0.13))' }} />
                    <div style={{ background: 'linear-gradient(200deg, rgba(138,128,112,0.13), rgba(42,31,20,0.25))', gridRow: 'span 2' }} />
                    <div style={{ background: 'linear-gradient(180deg, rgba(26,15,8,0.25), rgba(201,74,42,0.07))' }} />
                </div>

                {/* Rotating circles */}
                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                    <div style={{
                        position: 'absolute', width: '500px', height: '500px', top: '-100px', right: '-100px',
                        borderRadius: '50%', border: '1px solid rgba(201,74,42,0.15)',
                        animation: 'rotateCircle 30s linear infinite',
                    }} />
                    <div style={{
                        position: 'absolute', width: '300px', height: '300px', bottom: '10%', right: '20%',
                        borderRadius: '50%', border: '1px solid rgba(201,74,42,0.12)',
                        animation: 'rotateCircle 20s linear infinite reverse',
                    }} />
                    <div style={{
                        position: 'absolute', width: '150px', height: '150px', top: '30%', right: '30%',
                        borderRadius: '50%', border: '1px solid rgba(201,162,39,0.2)',
                        animation: 'rotateCircle 15s linear infinite',
                    }} />
                </div>

                {/* Large decorative number */}
                <div style={{
                    position: 'absolute', bottom: '3rem', right: '3rem',
                    fontFamily: 'var(--serif)', fontSize: '12rem', fontWeight: 900,
                    color: 'rgba(201,74,42,0.08)', lineHeight: 1,
                    pointerEvents: 'none', userSelect: 'none',
                }}>01</div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 1.2 }}
                style={{
                    position: 'absolute', bottom: '2.5rem', left: '3rem',
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    fontFamily: 'var(--mono)', fontSize: '0.65rem',
                    letterSpacing: '0.15em', color: 'var(--mist)',
                    textTransform: 'uppercase', zIndex: 3,
                }}
            >
                <div style={{
                    width: '40px', height: '1px', background: 'var(--mist)',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{
                        position: 'absolute', top: 0, left: '-100%',
                        width: '100%', height: '100%',
                        background: 'var(--rust)',
                        animation: 'slideRight 2s ease-in-out infinite 1.5s',
                    }} />
                </div>
                Scroll to explore
            </motion.div>
        </section>
    );
}
