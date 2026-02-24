import { motion } from 'framer-motion';

export default function Loader() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem',
            gap: '1.5rem',
        }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: 'var(--rust)',
                        }}
                        animate={{
                            y: [0, -12, 0],
                            opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: 'easeInOut',
                        }}
                    />
                ))}
            </div>
            <p style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.68rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--mist)',
            }}>
                Loading data
            </p>
        </div>
    );
}
