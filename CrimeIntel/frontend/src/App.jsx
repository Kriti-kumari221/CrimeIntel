import { useState, useEffect, useCallback, useMemo, useRef, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import './index.css';

import Hero from './components/Hero';
import StatsCards from './components/StatsCards';
import FilterPanel from './components/FilterPanel';
import Loader from './components/Loader';
import { CrimeByTypeChart, DistrictPieChart, TrendChart, RiskComparisonChart } from './components/Charts';
import RiskIntelligence from './components/RiskIntelligence';

import {
  fetchCrimes, filterCrimes, fetchHeatmapData, fetchMeta,
  fetchStatsByType, fetchStatsByDistrict, fetchTrend,
  fetchPeakHours, fetchRiskScores,
} from './services/api';
import { useDebounce } from './hooks/useFetch';

const CrimeMap = lazy(() => import('./components/CrimeMap'));

/* ── Custom Cursor Component ─────────────────────────────────────── */
function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + 'px';
        dotRef.current.style.top = e.clientY + 'px';
      }
    };
    const animate = () => {
      ringPos.current.x += (mouse.current.x - ringPos.current.x) * 0.12;
      ringPos.current.y += (mouse.current.y - ringPos.current.y) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.left = ringPos.current.x + 'px';
        ringRef.current.style.top = ringPos.current.y + 'px';
      }
      requestAnimationFrame(animate);
    };
    document.addEventListener('mousemove', onMove);
    const raf = requestAnimationFrame(animate);
    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}

/* ── Ticker Component ────────────────────────────────────────────── */
function Ticker() {
  const items = [
    'Crime Analytics', 'ML Predictions', 'Heatmap Intelligence',
    'District Profiling', 'Risk Scoring', 'Trend Analysis',
    'Real-Time Data', 'Peak Hour Detection',
  ];
  const doubled = [...items, ...items];
  return (
    <div className="ticker">
      <div className="ticker-track">
        {doubled.map((text, i) => (
          <span key={i} className="ticker-item">
            <span className="ticker-dot" />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Section Wrapper ─────────────────────────────────────────────── */
const sectionStyle = {
  padding: '6rem 3rem',
  maxWidth: '1400px',
  margin: '0 auto',
};

function Section({ id, title, subtitle, children, dark }) {
  return (
    <motion.section
      id={id}
      style={{
        ...sectionStyle,
        ...(dark ? {
          background: 'var(--ink)',
          color: 'var(--paper)',
          maxWidth: '100%',
          padding: '6rem 3rem',
        } : {}),
      }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div style={{ maxWidth: dark ? '1400px' : '100%', margin: dark ? '0 auto' : undefined }}>
        {title && (
          <div style={{ marginBottom: '2.5rem' }}>
            {subtitle && <p className="section-subtitle" style={{ marginBottom: '0.5rem' }}>{subtitle}</p>}
            <p className="section-title" style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
              fontWeight: 700,
              lineHeight: 1.15,
              color: dark ? 'var(--paper)' : 'var(--ink)',
            }}>
              {title}
            </p>
          </div>
        )}
        {children}
      </div>
    </motion.section>
  );
}

export default function App() {
  // ── State ────────────────────────────────────────────────────────
  const [crimes, setCrimes] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [meta, setMeta] = useState({ districts: [], crime_types: [] });
  const [statsByType, setStatsByType] = useState([]);
  const [statsByDistrict, setStatsByDistrict] = useState([]);
  const [trend, setTrend] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [riskScores, setRiskScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    type: '', district: '', start_date: '', end_date: '',
  });

  const debouncedFilters = useDebounce(filters, 300);

  // ── Initial load ────────────────────────────────────────────────
  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [
          crimesData, heatmap, metaData,
          byType, byDistrict, trendData,
          peakData, riskData,
        ] = await Promise.allSettled([
          fetchCrimes(500),
          fetchHeatmapData(2000),
          fetchMeta(),
          fetchStatsByType(),
          fetchStatsByDistrict(),
          fetchTrend('day'),
          fetchPeakHours(),
          fetchRiskScores(),
        ]);

        if (crimesData.status === 'fulfilled') setCrimes(crimesData.value);
        if (heatmap.status === 'fulfilled') setHeatmapData(heatmap.value);
        if (metaData.status === 'fulfilled') setMeta(metaData.value);
        if (byType.status === 'fulfilled') setStatsByType(byType.value);
        if (byDistrict.status === 'fulfilled') setStatsByDistrict(byDistrict.value);
        if (trendData.status === 'fulfilled') setTrend(trendData.value);
        if (peakData.status === 'fulfilled') setPeakHours(peakData.value);
        if (riskData.status === 'fulfilled') {
          const scores = Array.isArray(riskData.value) ? riskData.value : riskData.value?.scores || [];
          setRiskScores(scores);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  // ── Filtered crimes ─────────────────────────────────────────────
  useEffect(() => {
    const hasFilter = debouncedFilters.type || debouncedFilters.district ||
      debouncedFilters.start_date || debouncedFilters.end_date;
    if (!hasFilter) return;

    filterCrimes(debouncedFilters)
      .then(setCrimes)
      .catch(() => { });
  }, [debouncedFilters]);

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <CustomCursor />

      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between"
        style={{
          padding: '1.4rem 3rem',
          background: 'rgba(245,240,232,0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-subtle)',
          mixBlendMode: 'normal',
        }}
      >
        <a href="#" className="no-underline" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: 'var(--sans)',
            fontWeight: 800,
            fontSize: '1.1rem',
            letterSpacing: '0.25em',
            color: 'var(--ink)',
            textTransform: 'uppercase',
          }}>
            Crime<span style={{ color: 'var(--rust)' }}>Intel</span>
          </span>
        </a>

        <div className="hidden md:flex items-center" style={{ gap: '2.5rem' }}>
          {[
            { href: '#dashboard', label: 'Dashboard' },
            { href: '#map', label: 'Map' },
            { href: '#analytics', label: 'Analytics' },
            { href: '#risk', label: 'Risk' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.72rem',
                fontWeight: 400,
                letterSpacing: '0.12em',
                color: 'var(--mist)',
                textDecoration: 'none',
                textTransform: 'uppercase',
                transition: 'color 0.25s',
              }}
              onMouseOver={(e) => (e.target.style.color = 'var(--ink)')}
              onMouseOut={(e) => (e.target.style.color = 'var(--mist)')}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            padding: '0.4rem 1rem',
            borderRadius: '999px',
            textTransform: 'uppercase',
            background: error ? 'rgba(201,74,42,0.08)' : 'rgba(42,107,90,0.08)',
            color: error ? 'var(--rust)' : '#2a6b5a',
            border: `1px solid ${error ? 'rgba(201,74,42,0.2)' : 'rgba(42,107,90,0.2)'}`,
          }}
        >
          {loading ? '◌ Loading' : error ? '✕ Offline' : '● Live'}
        </div>
      </nav>

      <div style={{ height: '64px' }} />

      {/* ── Hero ───────────────────────────────────────────────── */}
      <Hero />

      {/* ── Ticker ─────────────────────────────────────────────── */}
      <Ticker />

      {/* ── Dashboard ──────────────────────────────────────────── */}
      <Section id="dashboard" title="Overview" subtitle="Dashboard">
        {loading ? <Loader /> : <StatsCards crimes={crimes} peakHours={peakHours} />}
      </Section>

      {/* ── Filters ────────────────────────────────────────────── */}
      <Section>
        <FilterPanel
          districts={meta.districts}
          crimeTypes={meta.crime_types}
          filters={filters}
          onFilterChange={setFilters}
        />
      </Section>

      {/* ── Map ────────────────────────────────────────────────── */}
      <Section id="map" title="Geographic Intelligence" subtitle="Crime Map">
        <Suspense fallback={<Loader />}>
          <CrimeMap heatmapData={heatmapData} riskScores={riskScores} />
        </Suspense>
      </Section>

      {/* ── Charts ─────────────────────────────────────────────── */}
      <Section id="analytics" title="Data-Driven Insights" subtitle="Analytics">
        {loading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CrimeByTypeChart data={statsByType} />
            <DistrictPieChart data={statsByDistrict} />
            <TrendChart data={trend} />
            <RiskComparisonChart data={riskScores} />
          </div>
        )}
      </Section>

      {/* ── Risk Intelligence (dark section) ───────────────────── */}
      <Section id="risk" title="ML-Powered Risk Intelligence" subtitle="Predictions" dark>
        {loading ? <Loader /> : <RiskIntelligence riskScores={riskScores} />}
      </Section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer style={{
        background: 'var(--ink)',
        color: 'var(--paper)',
        padding: '5rem 3rem 2rem',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: '4rem',
            paddingBottom: '4rem',
            borderBottom: '1px solid rgba(245,240,232,0.1)',
            marginBottom: '2rem',
          }}>
            <div>
              <div style={{
                fontFamily: 'var(--sans)',
                fontSize: '2rem',
                fontWeight: 800,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: '1.2rem',
              }}>
                Crime<span style={{ color: 'var(--rust)' }}>Intel</span>
              </div>
              <p style={{
                fontSize: '0.88rem',
                lineHeight: 1.7,
                color: 'rgba(245,240,232,0.5)',
                maxWidth: '280px',
              }}>
                Real-time crime analytics and predictive intelligence for Chicago, powered by machine learning and open data.
              </p>
            </div>
            <div>
              <p style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.65rem',
                letterSpacing: '0.2em',
                color: 'var(--mist)',
                textTransform: 'uppercase',
                marginBottom: '1.5rem',
              }}>Platform</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {['Dashboard', 'Crime Map', 'Analytics', 'Risk Scores'].map(l => (
                  <a key={l} href="#" style={{
                    fontSize: '0.9rem', color: 'rgba(245,240,232,0.6)',
                    textDecoration: 'none', transition: 'color 0.25s',
                  }}
                    onMouseOver={e => e.target.style.color = 'var(--paper)'}
                    onMouseOut={e => e.target.style.color = 'rgba(245,240,232,0.6)'}
                  >{l}</a>
                ))}
              </div>
            </div>
            <div>
              <p style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.65rem',
                letterSpacing: '0.2em',
                color: 'var(--mist)',
                textTransform: 'uppercase',
                marginBottom: '1.5rem',
              }}>Technology</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {['FastAPI', 'React', 'scikit-learn', 'Leaflet'].map(l => (
                  <span key={l} style={{ fontSize: '0.9rem', color: 'rgba(245,240,232,0.6)' }}>{l}</span>
                ))}
              </div>
            </div>
            <div>
              <p style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.65rem',
                letterSpacing: '0.2em',
                color: 'var(--mist)',
                textTransform: 'uppercase',
                marginBottom: '1.5rem',
              }}>Data</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {['Chicago Open Data', 'Socrata API', 'Real-Time Feed'].map(l => (
                  <span key={l} style={{ fontSize: '0.9rem', color: 'rgba(245,240,232,0.6)' }}>{l}</span>
                ))}
              </div>
            </div>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '2rem',
          }}>
            <p style={{
              fontFamily: 'var(--mono)',
              fontSize: '0.65rem',
              letterSpacing: '0.1em',
              color: 'rgba(245,240,232,0.3)',
            }}>
              © 2026 Crime Intel Platform. Powered by Chicago Open Data.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {['GitHub', 'API Docs', 'About'].map(l => (
                <a key={l} href="#" style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '0.65rem',
                  letterSpacing: '0.1em',
                  color: 'rgba(245,240,232,0.4)',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  transition: 'color 0.3s',
                }}
                  onMouseOver={e => e.target.style.color = 'var(--rust)'}
                  onMouseOut={e => e.target.style.color = 'rgba(245,240,232,0.4)'}
                >{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
