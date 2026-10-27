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

const INDICATORS = ['pulse', 'bounce', 'scan', 'bars', 'orbit', 'breathe'];
const REVEALS = ['type', 'decode', 'words'];
const SCRAMBLE = '·:/_-=+*<>01░▒';

const TYPE_MS = 34;
const WORD_MS = 240;
const DECODE_TAIL = 6;
const HOLD_MS = 1800;
const FADE_MS = 600;
const SPAWN_MS = 2300;
const MAX_LINES = 4;
const LINE_H = 36;
const CHAR_PX = 6.4;

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

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

// Prefer the side gutters beside the content column; fall back to anywhere (fainter) on narrow screens.
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
        if (clear) return { x, y, width, peak: inGutter ? 0.6 : 0.34 };
    }
    return null;
}

function Indicator({ variant }) {
    if (variant === 'bars') {
        return <span className="st-ind v-bars"><i className="st-bar" /><i className="st-bar" /><i className="st-bar" /></span>;
    }
    if (variant === 'orbit') {
        return <span className="st-ind"><span className="v-orbit"><i className="st-dot" /><i className="st-dot" /><i className="st-dot" /></span></span>;
    }
    if (variant === 'breathe') {
        return <span className="st-ind v-breathe"><i className="st-dot" /></span>;
    }
    return <span className={`st-ind v-${variant}`}><i className="st-dot" /><i className="st-dot" /><i className="st-dot" /></span>;
}

function revealPlan(line) {
    const limit = Math.min(line.text.length, Math.ceil(line.width / CHAR_PX));
    if (line.reveal === 'words') {
        const words = [];
        let used = 0;
        for (const w of line.text.split(' ')) {
            if (used > limit) break;
            words.push(w);
            used += w.length + 1;
        }
        return { limit, words, total: words.length, every: WORD_MS };
    }
    if (line.reveal === 'decode') return { limit, total: limit + DECODE_TAIL, every: TYPE_MS };
    return { limit, total: limit, every: TYPE_MS };
}

function renderText(line, plan, step) {
    if (line.reveal === 'words') {
        return plan.words.slice(0, step).map((w, i) => <span key={i} className="st-word">{w} </span>);
    }
    if (line.reveal === 'decode') {
        const visible = Math.min(step, plan.limit);
        const resolved = Math.max(0, step - DECODE_TAIL);
        let noise = '';
        for (let i = resolved; i < visible; i++) noise += line.text[i] === ' ' ? ' ' : pick(SCRAMBLE);
        return <>{line.text.slice(0, resolved)}<span className="st-noise">{noise}</span></>;
    }
    return line.text.slice(0, step);
}

function StatusLine({ line, onDone }) {
    const [step, setStep] = useState(0);
    const [leaving, setLeaving] = useState(false);
    const [plan] = useState(() => revealPlan(line));

    useEffect(() => {
        let i = 0;
        let timer;
        const advance = () => {
            i += 1;
            setStep(i);
            if (i < plan.total) {
                timer = setTimeout(advance, plan.every);
            } else {
                timer = setTimeout(() => {
                    setLeaving(true);
                    timer = setTimeout(() => onDone(line.id), FADE_MS);
                }, HOLD_MS);
            }
        };
        timer = setTimeout(advance, 350);
        return () => clearTimeout(timer);
    }, [line.id, plan, onDone]);

    return (
        <div className={`st-line${leaving ? ' st-leaving' : ''}`} style={{ left: line.x, top: line.y, maxWidth: line.width, '--peak': line.peak }}>
            <Indicator variant={line.indicator} />
            <span className="st-text">{renderText(line, plan, step)}</span>
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
            live.current = [...live.current, {
                id: nextId.current++,
                text: makePhrase(),
                indicator: pick(INDICATORS),
                reveal: pick(REVEALS),
                ...spot,
            }];
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
                    --pearl: radial-gradient(circle at 35% 30%, #ffffff 0%, #f1ede6 45%, #d8d2c8 100%);
                    --pearl-glow: 0 0 6px rgba(244,240,232,0.55);
                    position: absolute; display: flex; align-items: center; gap: 0.7rem;
                    font: 400 0.82rem ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
                    letter-spacing: 0.01em; color: rgba(240,236,228,0.88);
                    opacity: 0; animation: st-in 500ms ease-out forwards;
                }
                .st-line.st-leaving { animation: st-out ${FADE_MS}ms ease-in forwards; }
                @keyframes st-in  { from { opacity: 0; transform: translateY(4px); } to { opacity: var(--peak); transform: none; } }
                @keyframes st-out { from { opacity: var(--peak); } to { opacity: 0; } }

                .st-text {
                    white-space: nowrap; overflow: hidden; min-width: 0;
                    -webkit-mask-image: linear-gradient(to right, black 82%, transparent);
                    mask-image: linear-gradient(to right, black 82%, transparent);
                }
                .st-noise { opacity: 0.5; }
                .st-word { opacity: 0; animation: st-word-in 320ms ease-out forwards; }
                @keyframes st-word-in { from { opacity: 0; filter: blur(2px); } to { opacity: 1; filter: none; } }

                .st-ind { display: inline-flex; align-items: center; justify-content: center; gap: 3px; flex-shrink: 0; height: 14px; min-width: 21px; }
                .st-dot { display: block; width: 5px; height: 5px; border-radius: 50%; background: var(--pearl); box-shadow: var(--pearl-glow); }
                .st-bar { display: block; width: 2px; height: 11px; border-radius: 1px; background: var(--pearl); box-shadow: var(--pearl-glow); }

                .v-pulse .st-dot { animation: st-pulse 1.2s ease-in-out infinite; }
                @keyframes st-pulse { 0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }

                .v-bounce .st-dot { animation: st-bounce 1s ease-in-out infinite; }
                @keyframes st-bounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.5; } 30% { transform: translateY(-4px); opacity: 1; } }

                .v-scan .st-dot { animation: st-scan 0.9s ease-in-out infinite alternate; }
                @keyframes st-scan { from { opacity: 0.18; } to { opacity: 1; } }

                .v-bars .st-bar { animation: st-bars 0.9s ease-in-out infinite; transform-origin: center; }
                @keyframes st-bars { 0%, 100% { transform: scaleY(0.35); } 50% { transform: scaleY(1); } }

                .v-pulse .st-dot:nth-child(2), .v-bounce .st-dot:nth-child(2), .v-bars .st-bar:nth-child(2) { animation-delay: 0.15s; }
                .v-pulse .st-dot:nth-child(3), .v-bounce .st-dot:nth-child(3), .v-bars .st-bar:nth-child(3) { animation-delay: 0.3s; }
                .v-scan .st-dot:nth-child(2) { animation-delay: 0.3s; }
                .v-scan .st-dot:nth-child(3) { animation-delay: 0.6s; }

                .v-orbit { position: relative; display: block; width: 13px; height: 13px; animation: st-spin 1.4s linear infinite; }
                .v-orbit .st-dot { position: absolute; width: 3.5px; height: 3.5px; }
                .v-orbit .st-dot:nth-child(1) { top: 0; left: 4.75px; }
                .v-orbit .st-dot:nth-child(2) { bottom: 0.5px; left: 0.5px; opacity: 0.7; }
                .v-orbit .st-dot:nth-child(3) { bottom: 0.5px; right: 0.5px; opacity: 0.4; }
                @keyframes st-spin { to { transform: rotate(360deg); } }

                .v-breathe .st-dot { width: 6px; height: 6px; animation: st-breathe 1.8s ease-in-out infinite; }
                @keyframes st-breathe {
                    0%, 100% { transform: scale(0.6); opacity: 0.45; box-shadow: 0 0 0 rgba(244,240,232,0); }
                    50%      { transform: scale(1.15); opacity: 1; box-shadow: 0 0 9px rgba(244,240,232,0.7); }
                }
            `}</style>
            {lines.map((line) => <StatusLine key={line.id} line={line} onDone={remove} />)}
        </div>
    );
}
