import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function FilterPanel({ districts, crimeTypes, filters, onFilterChange }) {
    const [isOpen, setIsOpen] = useState(true);

    const handleChange = (key, value) => {
        onFilterChange({ ...filters, [key]: value });
    };

    return (
        <div className="glass-card p-6">
            <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div>
                    <p className="section-subtitle" style={{ marginBottom: '0.25rem' }}>Filters</p>
                    <p style={{
                        fontFamily: 'var(--serif)',
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: 'var(--ink)',
                    }}>Refine Data</p>
                </div>
                <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    style={{
                        fontSize: '0.9rem',
                        color: 'var(--mist)',
                        fontFamily: 'var(--mono)',
                    }}
                >
                    ▼
                </motion.span>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontFamily: 'var(--mono)',
                                    fontSize: '0.65rem',
                                    letterSpacing: '0.12em',
                                    color: 'var(--mist)',
                                    textTransform: 'uppercase',
                                    marginBottom: '0.5rem',
                                }}>
                                    Crime Type
                                </label>
                                <select
                                    className="filter-select"
                                    value={filters.type || ''}
                                    onChange={(e) => handleChange('type', e.target.value)}
                                >
                                    <option value="">All Types</option>
                                    {(crimeTypes || []).map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontFamily: 'var(--mono)',
                                    fontSize: '0.65rem',
                                    letterSpacing: '0.12em',
                                    color: 'var(--mist)',
                                    textTransform: 'uppercase',
                                    marginBottom: '0.5rem',
                                }}>
                                    District
                                </label>
                                <select
                                    className="filter-select"
                                    value={filters.district || ''}
                                    onChange={(e) => handleChange('district', e.target.value)}
                                >
                                    <option value="">All Districts</option>
                                    {(districts || []).map((d) => (
                                        <option key={d} value={d}>District {d}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontFamily: 'var(--mono)',
                                    fontSize: '0.65rem',
                                    letterSpacing: '0.12em',
                                    color: 'var(--mist)',
                                    textTransform: 'uppercase',
                                    marginBottom: '0.5rem',
                                }}>
                                    Start Date
                                </label>
                                <DatePicker
                                    selected={filters.start_date ? new Date(filters.start_date) : null}
                                    onChange={(date) =>
                                        handleChange('start_date', date ? date.toISOString().slice(0, 10) : '')
                                    }
                                    className="filter-input"
                                    placeholderText="Select start date"
                                    dateFormat="yyyy-MM-dd"
                                    isClearable
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontFamily: 'var(--mono)',
                                    fontSize: '0.65rem',
                                    letterSpacing: '0.12em',
                                    color: 'var(--mist)',
                                    textTransform: 'uppercase',
                                    marginBottom: '0.5rem',
                                }}>
                                    End Date
                                </label>
                                <DatePicker
                                    selected={filters.end_date ? new Date(filters.end_date) : null}
                                    onChange={(date) =>
                                        handleChange('end_date', date ? date.toISOString().slice(0, 10) : '')
                                    }
                                    className="filter-input"
                                    placeholderText="Select end date"
                                    dateFormat="yyyy-MM-dd"
                                    isClearable
                                />
                            </div>
                        </div>

                        {(filters.type || filters.district || filters.start_date || filters.end_date) && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-4 flex items-center gap-2"
                            >
                                <span style={{
                                    fontFamily: 'var(--mono)',
                                    fontSize: '0.65rem',
                                    color: 'var(--rust)',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                }}>
                                    Filters active
                                </span>
                                <button
                                    onClick={() => onFilterChange({ type: '', district: '', start_date: '', end_date: '' })}
                                    style={{
                                        fontFamily: 'var(--mono)',
                                        fontSize: '0.65rem',
                                        letterSpacing: '0.1em',
                                        padding: '0.3rem 0.8rem',
                                        borderRadius: '999px',
                                        cursor: 'pointer',
                                        background: 'rgba(201,74,42,0.08)',
                                        color: 'var(--rust)',
                                        border: '1px solid rgba(201,74,42,0.2)',
                                        textTransform: 'uppercase',
                                        transition: 'all 0.25s',
                                    }}
                                >
                                    Clear All
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default memo(FilterPanel);
