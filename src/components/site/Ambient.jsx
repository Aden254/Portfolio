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

const INDICATORS = ['pulse', 'bounce', 'scan', 'bars', 'orbit', 'breathe', 'ellipse', 'eight', 'ripple'];
const REVEALS = ['type', 'decode', 'words'];
const SCRAMBLE = '·:/_-=+*<>01░▒';

const TYPE_MS = 34;
const WORD_MS = 240;
const DECODE_TAIL = 6;
const HOLD_MS = 1800;
const FADE_MS = 600;
const LINE_SPAWN_MS = 2300;
const CURVE_SPAWN_MS = 6000;
const CURVE_LIFE_MS = 10500;
const MAX_LINES = 4;
const LINE_H = 36;
const CHAR_PX = 6.4;

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Curves: decorative, generated from their equations ── */

const TAU = Math.PI * 2;
const sample = (n, tMax, fn) => Array.from({ length: n + 1 }, (_, i) => fn((tMax * i) / n));
const polar = (n, tMax, r) => sample(n, tMax, (t) => [r(t) * Math.cos(t), r(t) * Math.sin(t)]);

const CURVES = [
    { label: 'r = cos(5θ/3)', make: () => polar(900, 3 * TAU, (t) => Math.cos((5 * t) / 3)) },
    { label: 'r = sin(4θ)', make: () => polar(900, TAU, (t) => Math.sin(4 * t)) },
    { label: 'x = sin 3t,  y = sin 2t', make: () => sample(700, TAU, (t) => [Math.sin(3 * t + Math.PI / 2), Math.sin(2 * t)]) },
    { label: 'r = 1 − cos θ', make: () => polar(500, TAU, (t) => 1 - Math.cos(t)) },
    { label: 'r² = cos 2θ', make: () => sample(600, TAU, (t) => { const d = 1 + Math.sin(t) ** 2; return [Math.cos(t) / d, (Math.sin(t) * Math.cos(t)) / d]; }) },
    { label: 'x = 2cos t + 5cos(2t/3)', make: () => sample(1200, 3 * TAU, (t) => [2 * Math.cos(t) + 5 * Math.cos((2 * t) / 3), 2 * Math.sin(t) - 5 * Math.sin((2 * t) / 3)]) },
    { label: 'x = 4cos t − cos 4t', make: () => sample(700, TAU, (t) => [4 * Math.cos(t) - Math.cos(4 * t), 4 * Math.sin(t) - Math.sin(4 * t)]) },
    {
        label: 'Maurer rose · n = 5, d = 97°',
        thin: true,
        make: () => sample(360, 360, (k) => {
            const th = (k * 97 * Math.PI) / 180;
            const r = Math.sin(5 * th);
            return [r * Math.cos(th), r * Math.sin(th)];
        }),
    },
    {
        label: 'r = e^sin θ − 2cos 4θ + sin⁵((2θ − π)/24)',
        make: () => polar(1800, 6 * TAU, (t) => Math.exp(Math.sin(t)) - 2 * Math.cos(4 * t) + Math.sin((2 * t - Math.PI) / 24) ** 5),
    },
];

function toPath(pts, size) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const [x, y] of pts) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    // Fit the bounding-box diagonal so the curve stays inside its circle while it rotates.
    const s = (size - 8) / Math.hypot(maxX - minX, maxY - minY);
    const ox = (size - (maxX - minX) * s) / 2 - minX * s;
    const oy = (size - (maxY - minY) * s) / 2 - minY * s;
    let d = '';
    let len = 0;
    let px = 0, py = 0;
    pts.forEach(([x, y], i) => {
        const X = x * s + ox;
        const Y = size - (y * s + oy);
        d += `${i ? 'L' : 'M'}${X.toFixed(1)} ${Y.toFixed(1)}`;
        if (i) len += Math.hypot(X - px, Y - py);
        px = X; py = Y;
    });
    return { d, len: Math.ceil(len) };
}

/* ── Placement: side gutters when there's room, anywhere (fainter) otherwise ── */

function viewport() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return { vw, vh, gutter: (vw - Math.min(vw - 48, 1024)) / 2 };
}

const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

function place(items, w, h, inGutter, { vw, vh, gutter }) {
    for (let tries = 0; tries < 14; tries++) {
        const x = inGutter
            ? (() => {
                const offset = 14 + Math.random() * Math.max(0, gutter - 28 - w);
                return Math.random() < 0.5 ? offset : vw - gutter + offset;
            })()
            : 16 + Math.random() * Math.max(0, vw - w - 32);
        const y = vh * 0.06 + Math.random() * Math.max(0, vh * 0.88 - h);
        const rect = { x, y, w, h };
        if (items.every((it) => !overlaps(rect, it))) return rect;
    }
    return null;
}

/* ── Status lines ── */

function makePhrase() {
    const pool = [...ACTIONS];
    const picks = [];
    const n = 3 + Math.floor(Math.random() * 3);
    while (picks.length < n) picks.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    const text = picks.join(', ');
    return `${text[0].toUpperCase()}${text.slice(1)}…`;
}

function Indicator({ variant }) {
    const dots = (n) => Array.from({ length: n }, (_, i) => <i key={i} className="st-dot" />);
    switch (variant) {
        case 'bars':
            return <span className="st-ind v-bars"><i className="st-bar" /><i className="st-bar" /><i className="st-bar" /></span>;
        case 'orbit':
            return <span className="st-ind"><span className="v-orbit">{dots(3)}</span></span>;
        case 'breathe':
            return <span className="st-ind v-breathe">{dots(1)}</span>;
        case 'ripple':
            return <span className="st-ind v-ripple"><i className="st-dot" /><i className="st-ring" /></span>;
        case 'ellipse':
        case 'eight':
            return (
                <span className="st-ind">
                    <span className={`v-${variant}`}>
                        <span className="ex"><i className="st-dot ey" /></span>
                        <span className="ex ex2"><i className="st-dot ey ey2" /></span>
                    </span>
                </span>
            );
        default:
            return <span className={`st-ind v-${variant}`}>{dots(3)}</span>;
    }
}

function revealPlan(line) {
    const limit = Math.min(line.text.length, Math.ceil(line.w / CHAR_PX));
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
        <div className={`st-line${leaving ? ' st-leaving' : ''}`} style={{ left: line.x, top: line.y, maxWidth: line.w, '--peak': line.peak }}>
            <Indicator variant={line.indicator} />
            <span className="st-text">{renderText(line, plan, step)}</span>
        </div>
    );
}

function Curve({ item, onDone }) {
    useEffect(() => {
        const t = setTimeout(() => onDone(item.id), CURVE_LIFE_MS);
        return () => clearTimeout(t);
    }, [item.id, onDone]);

    return (
        <div className="cv" style={{ left: item.x, top: item.y, width: item.w, '--peak': item.peak }}>
            <svg className="cv-svg" width={item.w} height={item.w} viewBox={`0 0 ${item.w} ${item.w}`}>
                <path d={item.d} className={item.thin ? 'thin' : undefined} style={{ '--len': item.len }} />
            </svg>
            <p className="cv-eq">{item.label}</p>
        </div>
    );
}

export default function Ambient() {
    const [items, setItems] = useState([]);
    const live = useRef([]);
    const nextId = useRef(0);

    const remove = useCallback((id) => {
        live.current = live.current.filter((it) => it.id !== id);
        setItems(live.current);
    }, []);

    useEffect(() => {
        if (prefersReducedMotion()) return;

        const add = (item) => {
            live.current = [...live.current, { id: nextId.current++, ...item }];
            setItems(live.current);
        };

        const spawnLine = () => {
            if (live.current.filter((it) => it.kind === 'line').length >= MAX_LINES) return;
            const vp = viewport();
            const inGutter = vp.gutter >= 140;
            const w = inGutter ? Math.min(300, vp.gutter - 28) : Math.min(320, vp.vw - 32);
            const rect = place(live.current, w, LINE_H, inGutter, vp);
            if (!rect) return;
            add({ kind: 'line', ...rect, peak: inGutter ? 0.6 : 0.34, text: makePhrase(), indicator: pick(INDICATORS), reveal: pick(REVEALS) });
        };

        const spawnCurve = () => {
            const vp = viewport();
            const inGutter = vp.gutter >= 110;
            const maxCurves = inGutter ? 2 : 1;
            if (live.current.filter((it) => it.kind === 'curve').length >= maxCurves) return;
            const w = inGutter ? Math.min(180, vp.gutter - 36) : 150;
            const rect = place(live.current, w, w + 40, inGutter, vp);
            if (!rect) return;
            const def = pick(CURVES);
            add({ kind: 'curve', ...rect, peak: inGutter ? 0.42 : 0.12, label: def.label, thin: !!def.thin, ...toPath(def.make(), w) });
        };

        spawnLine();
        const lineTimer = setInterval(spawnLine, LINE_SPAWN_MS);
        const firstCurve = setTimeout(spawnCurve, 1500);
        const curveTimer = setInterval(spawnCurve, CURVE_SPAWN_MS);
        return () => {
            clearInterval(lineTimer);
            clearTimeout(firstCurve);
            clearInterval(curveTimer);
            live.current = [];
            setItems([]);
        };
    }, []);

    return (
        <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
            <style>{`
                .st-line, .cv {
                    --pearl: radial-gradient(circle at 35% 30%, #ffffff 0%, #f1ede6 45%, #d8d2c8 100%);
                    --pearl-glow: 0 0 6px rgba(244,240,232,0.55);
                    position: absolute;
                }

                /* status lines */
                .st-line {
                    display: flex; align-items: center; gap: 0.7rem;
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

                /* indicators */
                .st-ind { position: relative; display: inline-flex; align-items: center; justify-content: center; gap: 3px; flex-shrink: 0; height: 14px; min-width: 22px; }
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

                .v-ripple .st-ring {
                    position: absolute; left: 50%; top: 50%; width: 13px; height: 13px; margin: -6.5px 0 0 -6.5px;
                    border-radius: 50%; border: 1px solid rgba(244,240,232,0.85);
                    animation: st-ripple 1.6s ease-out infinite;
                }
                @keyframes st-ripple { from { transform: scale(0.3); opacity: 0.9; } to { transform: scale(1.5); opacity: 0; } }

                /* Ellipse and figure-eight: X and Y oscillate separately; phase offsets trace the curve. */
                .v-ellipse, .v-eight { position: relative; display: block; width: 22px; height: 14px; }
                .v-ellipse .ex, .v-eight .ex { position: absolute; left: 8.5px; top: 4.5px; }
                .v-ellipse .ex { animation: st-ex 0.8s ease-in-out infinite alternate; }
                .v-ellipse .ey { animation: st-ey-depth 0.8s ease-in-out infinite alternate; animation-delay: -0.4s; }
                .v-ellipse .ex2 { animation-delay: -0.8s; }
                .v-ellipse .ey2 { animation-delay: -1.2s; }
                @keyframes st-ex { from { transform: translateX(-8px); } to { transform: translateX(8px); } }
                @keyframes st-ey-depth {
                    from { transform: translateY(-3px) scale(0.6); opacity: 0.4; }
                    to   { transform: translateY(3px) scale(1.15); opacity: 1; }
                }

                .v-eight .ex { animation: st-ex 0.8s ease-in-out infinite alternate; }
                .v-eight .ey { width: 4px; height: 4px; animation: st-ey 0.4s ease-in-out infinite alternate; animation-delay: -0.2s; }
                .v-eight .ex2 { animation-delay: -0.8s; }
                .v-eight .ey2 { animation-delay: -1s; }
                @keyframes st-ey { from { transform: translateY(-3.5px); } to { transform: translateY(3.5px); } }

                /* equation curves */
                .cv { opacity: 0; animation: cv-life ${CURVE_LIFE_MS}ms ease-in-out forwards; }
                @keyframes cv-life { 0% { opacity: 0; } 8% { opacity: var(--peak); } 85% { opacity: var(--peak); } 100% { opacity: 0; } }
                .cv-svg { display: block; overflow: visible; animation: cv-rot 90s linear infinite; }
                @keyframes cv-rot { to { transform: rotate(360deg); } }
                .cv path {
                    fill: none; stroke: rgba(242,238,230,0.95); stroke-width: 0.8;
                    stroke-linecap: round; stroke-linejoin: round;
                    stroke-dasharray: var(--len); stroke-dashoffset: var(--len);
                    animation: cv-draw 5600ms cubic-bezier(0.45, 0.05, 0.35, 1) 300ms forwards;
                    filter: drop-shadow(0 0 3px rgba(244,240,232,0.35));
                }
                .cv path.thin { stroke-width: 0.3; }
                @keyframes cv-draw { to { stroke-dashoffset: 0; } }
                .cv-eq {
                    margin-top: 10px; text-align: center; line-height: 1.45;
                    font: italic 400 0.74rem 'Old Standard TT', Georgia, serif;
                    color: rgba(240,236,228,0.85); letter-spacing: 0.02em;
                }
            `}</style>
            {items.map((it) => (it.kind === 'curve'
                ? <Curve key={it.id} item={it} onDone={remove} />
                : <StatusLine key={it.id} line={it} onDone={remove} />))}
        </div>
    );
}
