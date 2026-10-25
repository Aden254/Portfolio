import { useEffect, useRef, useState } from 'react';
import { Brain, Server } from 'lucide-react';

export const TRACKS = {
    research: {
        path: '/work/research',
        label: 'Research & Data',
        short: 'Research',
        color: '#0ea5e9',
        glow: 'rgba(14,165,233,0.55)',
        Icon: Brain,
        blurb: 'Psychology · Environment · Neuroscience',
    },
    tech: {
        path: '/work/tech',
        label: 'Systems & Engineering',
        short: 'Tech',
        color: '#10b981',
        glow: 'rgba(16,185,129,0.55)',
        Icon: Server,
        blurb: 'Systems · Networking · Full-stack platforms',
    },
};

export function useInView(threshold = 0.08) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setInView(true);
                obs.disconnect();
            }
        }, { threshold, rootMargin: '0px 0px -80px 0px' });
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);

    return [ref, inView];
}
