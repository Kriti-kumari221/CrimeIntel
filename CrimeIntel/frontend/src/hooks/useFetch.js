import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for data fetching with loading/error states.
 */
export function useFetch(fetchFn, deps = []) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetchFn()
            .then((result) => {
                if (!cancelled) {
                    setData(result);
                    setError(null);
                }
            })
            .catch((err) => {
                if (!cancelled) setError(err.message);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, deps);

    return { data, loading, error };
}

/**
 * Debounced value hook — 300ms default.
 */
export function useDebounce(value, delay = 300) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}
