import React, { useCallback, useEffect, useRef, useState } from 'react';

const ACTIONS = [
    'sampling buoy data', 'cleaning records', 'flagging outliers', 'joining partner tables',
    'computing weekly medians', 'rendering boxplots', 'publishing dashboard', 'checking Secchi depth',
    'querying PostGIS', 'relaying through TURN', 'negotiating WebRTC offer', 'verifying JWT',
    'running migrations', 'warming cache', 'uploading to S3', 'tracing neural tissue',
    'stacking MRI slices', 'fetching gene expression', 'annotating slice 42', 'validating schema',
    'writing audit log', 'syncing offline changes', 'deploying to Railway', 'reconciling site names',
    'normalizing timestamps', 'reading sensor feed', 'indexing structures', 'checking access roles',
];

const TYPE_MS = 34;
const HOLD_MS = 1800;
const FADE_MS = 600;
const SPAWN_MS = 2300;
const MAX_LINES = 4;
const LINE_H = 36;

const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function makePhrase() {
    const pool = [...ACTIONS];
    const picks = [];
    const n = 3 + Math.floor(Math.random() * 3);
    while (picks.length < n) picks.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    const text = picks.join(', ');
    return `${text[0].toUpperCase()}${text.slice(1)}…`;
}

// Prefer the side gutters beside the content column; fall back to anywhere on narrow screens.
function pickSpot(live) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gutter = (vw - Math.min(vw - 48, 1024)) / 2;

    const inGutter = gutter >= 140;

    for (let tries = 0; tries < 12; tries++) {
        let x, width;
        if (inGutter) {
            width = Math.min(300, gutter - 28);
            const offset = 14 + Math.random() * Math.max(0, gutter - 28 - width);
            x = Math.random() < 0.5 ? offset : vw - gutter + offset;
        } else {
            width = Math.min(320, vw - 32);
            x = 16 + Math.random() * Math.max(0, vw - width - 32);
        }
        const y = vh * 0.08 + Math.random() * vh * 0.84;
        const clear = live.every((l) => x + width < l.x || l.x + l.width < x || Math.abs(l.y - y) > LINE_H);
        if (clear) return { x, y, width, peak: inGutter ? 0.55 : 0.32 };
    }
    return null;
}

function StatusLine({ line, onDone }) {
    const [shown, setShown] = useState(0);
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        // ~6.4px per character at this font size; stop once the visible width is filled.
        const limit = Math.min(line.text.length, Math.ceil(line.width / 6.4));
        let i = 0;
        let timer;
        const step = () => {
            i += 1;
            setShown(i);
            if (i < limit) {
                timer = setTimeout(step, TYPE_MS);
            } else {
                timer = setTimeout(() => {
                    setLeaving(true);
                    timer = setTimeout(() => onDone(line.id), FADE_MS);
                }, HOLD_MS);
            }
        };
        timer = setTimeout(step, 350);
        return () => clearTimeout(timer);
    }, [line, onDone]);

    return (
        <div className={`st-line${leaving ? ' st-leaving' : ''}`} style={{ left: line.x, top: line.y, maxWidth: line.width, '--peak': line.peak }}>
            <span className="st-dots"><i /><i /><i /></span>
            <span className="st-text">{line.text.slice(0, shown)}</span>
        </div>
    );
}

export default function Ambient() {
    const [lines, setLines] = useState([]);
    const live = useRef([]);
    const nextId = useRef(0);

    const remove = useCallback((id) => {
        live.current = live.current.filter((l) => l.id !== id);
        setLines(live.current);
    }, []);

    useEffect(() => {
        if (prefersReducedMotion()) return;
        const spawn = () => {
            if (live.current.length >= MAX_LINES) return;
            const spot = pickSpot(live.current);
            if (!spot) return;
            live.current = [...live.current, { id: nextId.current++, text: makePhrase(), ...spot }];
            setLines(live.current);
        };
        spawn();
        const interval = setInterval(spawn, SPAWN_MS);
        return () => {
            clearInterval(interval);
            live.current = [];
            setLines([]);
        };
    }, []);

    return (
        <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
            <style>{`
                .st-line {
                    position: absolute; display: flex; align-items: center; gap: 0.7rem;
                    font: 400 0.82rem ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
                    letter-spacing: 0.01em; color: rgba(148,163,184,0.85);
                    opacity: 0; animation: st-in 500ms ease-out forwards;
                }
                .st-line.st-leaving { animation: st-out ${FADE_MS}ms ease-in forwards; }
                @keyframes st-in  { from { opacity: 0; transform: translateY(4px); } to { opacity: var(--peak); transform: none; } }
                @keyframes st-out { from { opacity: var(--peak); } to { opacity: 0; } }

                .st-dots { display: inline-flex; gap: 3px; flex-shrink: 0; }
                .st-dots i {
                    width: 5px; height: 5px; border-radius: 50%;
                    background: rgb(240,150,112);
                    animation: st-pulse 1.2s ease-in-out infinite;
                }
                .st-dots i:nth-child(2) { animation-delay: 0.15s; }
                .st-dots i:nth-child(3) { animation-delay: 0.3s; }
                @keyframes st-pulse {
                    0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); }
                    40%           { opacity: 1;    transform: scale(1); }
                }

                .st-text {
                    white-space: nowrap; overflow: hidden; min-width: 0;
                    -webkit-mask-image: linear-gradient(to right, black 82%, transparent);
                    mask-image: linear-gradient(to right, black 82%, transparent);
                }
            `}</style>
            {lines.map((line) => <StatusLine key={line.id} line={line} onDone={remove} />)}
        </div>
    );
}
