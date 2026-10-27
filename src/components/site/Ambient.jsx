import React, { useCallback, useEffect, useRef, useState } from 'react';

const INDICATORS = ['pulse', 'bounce', 'scan', 'bars', 'orbit', 'breathe', 'ellipse', 'eight', 'ripple'];

const SOLO_SPAWN_MS = 1400;
const SOLO_HOLD_MS = 3400;
const FADE_MS = 600;
const MAX_SOLOS = 6;
const CURVE_SPAWN_MS = 7000;
const CURVE_LIFE_MS = 14000;
const CURVE_DRAW_MS = 7000;

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Curves: decorative, generated from their equations ── */

const PI = Math.PI;
const TAU = PI * 2;
const { sin, cos, exp, abs } = Math;
const sample = (n, from, to, fn) => Array.from({ length: n + 1 }, (_, i) => fn(from + ((to - from) * i) / n));
const polar = (n, tMax, r) => sample(n, 0, tMax, (t) => { const R = r(t); return [R * cos(t), R * sin(t)]; });

const CURVES = [
    {
        name: 'Farris wheel',
        eq: ['x = cos t + ½cos 7t + ⅓sin 17t', 'y = sin t + ½sin 7t + ⅓cos 17t'],
        make: () => sample(2400, 0, TAU, (t) => [cos(t) + cos(7 * t) / 2 + sin(17 * t) / 3, sin(t) + sin(7 * t) / 2 + cos(17 * t) / 3]),
    },
    {
        name: 'Hypotrochoid',
        eq: ['x = 6cos t + 9cos(6t/7)', 'y = 6sin t − 9sin(6t/7)'],
        make: () => sample(4000, 0, 7 * TAU, (t) => [6 * cos(t) + 9 * cos((6 * t) / 7), 6 * sin(t) - 9 * sin((6 * t) / 7)]),
    },
    {
        name: 'Epitrochoid',
        eq: ['x = 8cos t − 5cos(8t/3)', 'y = 8sin t − 5sin(8t/3)'],
        make: () => sample(2400, 0, 3 * TAU, (t) => [8 * cos(t) - 5 * cos((8 * t) / 3), 8 * sin(t) - 5 * sin((8 * t) / 3)]),
    },
    {
        name: 'Lissajous figure',
        eq: ['x = sin(9t + π/4)', 'y = sin 8t'],
        make: () => sample(3000, 0, TAU, (t) => [sin(9 * t + PI / 4), sin(8 * t)]),
    },
    {
        name: 'Rhodonea',
        eq: ['r = cos(7θ/9)'],
        make: () => polar(3000, 9 * PI, (t) => cos((7 * t) / 9)),
    },
    {
        name: 'Harmonograph',
        eq: ['x = e^(−t/160)[sin(2t + π/6) + sin 3.02t]', 'y = e^(−t/160)[sin 3t + sin(2.01t + π/2)]'],
        make: () => sample(9000, 0, 320, (t) => {
            const d = exp(-t / 160);
            return [d * (sin(2 * t + PI / 6) + sin(3.02 * t)), d * (sin(3 * t) + sin(2.01 * t + PI / 2))];
        }),
    },
    {
        name: 'Gielis superformula',
        eq: ['r = (|cos(23φ/20)|^0.8 + |sin(23φ/20)|^0.8)^(−2)'],
        make: () => polar(6000, 20 * PI, (t) => (abs(cos((23 * t) / 20)) ** 0.8 + abs(sin((23 * t) / 20)) ** 0.8) ** -2),
    },
    {
        name: 'Lorenz attractor',
        eq: ['dx/dt = 10(y − x)', 'dy/dt = x(28 − z) − y', 'dz/dt = xy − (8/3)z'],
        make: () => {
            let x = 0.1, y = 0, z = 0;
            const pts = [];
            const dt = 0.006;
            for (let i = 0; i < 9000; i++) {
                const dx = 10 * (y - x);
                const dy = x * (28 - z) - y;
                const dz = x * y - (8 / 3) * z;
                x += dx * dt; y += dy * dt; z += dz * dt;
                if (i > 100) pts.push([x, z]);
            }
            return pts;
        },
    },
    {
        name: 'Chrysanthemum curve',
        eq: ['r = 5(1 + sin(11θ/5)) − 4sin⁴(17θ/3)·sin⁸(2cos 3θ − 28θ)'],
        make: () => polar(9000, 21 * PI, (t) => 5 * (1 + sin((11 * t) / 5)) - 4 * sin((17 * t) / 3) ** 4 * sin(2 * cos(3 * t) - 28 * t) ** 8),
    },
    {
        name: 'Butterfly curve',
        eq: ['r = e^(sin θ) − 2cos 4θ + sin⁵((2θ − π)/24)'],
        make: () => polar(3000, 6 * TAU, (t) => exp(sin(t)) - 2 * cos(4 * t) + sin((2 * t - PI) / 24) ** 5),
    },
    {
        name: 'Maurer rose',
        eq: ['r = sin 5θ,  θ = k · 97°,  k = 0…360'],
        thin: true,
        make: () => sample(360, 0, 360, (k) => {
            const th = (k * 97 * PI) / 180;
            const r = sin(5 * th);
            return [r * cos(th), r * sin(th)];
        }),
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

/* ── Placement ── */

const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

function place(items, w, h) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    for (let tries = 0; tries < 16; tries++) {
        const x = 12 + Math.random() * Math.max(0, vw - w - 24);
        const y = vh * 0.05 + Math.random() * Math.max(0, vh * 0.9 - h);
        const rect = { x, y, w, h };
        if (items.every((it) => !overlaps(rect, it))) return rect;
    }
    return null;
}

/* ── Pieces ── */

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

function Solo({ item, onDone }) {
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        let timer = setTimeout(() => {
            setLeaving(true);
            timer = setTimeout(() => onDone(item.id), FADE_MS);
        }, SOLO_HOLD_MS);
        return () => clearTimeout(timer);
    }, [item.id, onDone]);

    return (
        <div className={`st-solo${leaving ? ' st-leaving' : ''}`} style={{ left: item.x, top: item.y }}>
            <Indicator variant={item.indicator} />
        </div>
    );
}

function Curve({ item, onDone }) {
    useEffect(() => {
        const t = setTimeout(() => onDone(item.id), CURVE_LIFE_MS);
        return () => clearTimeout(t);
    }, [item.id, onDone]);

    return (
        <div className="cv" style={{ left: item.x, top: item.y, width: item.w }}>
            <svg className="cv-svg" width={item.w} height={item.w} viewBox={`0 0 ${item.w} ${item.w}`}>
                <path d={item.d} className={item.thin ? 'thin' : undefined} style={{ '--len': item.len }} />
            </svg>
            <p className="cv-name">{item.name}</p>
            {item.eq.map((line) => <p key={line} className="cv-eq">{line}</p>)}
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
        const count = (kind) => live.current.filter((it) => it.kind === kind).length;

        const spawnSolo = () => {
            if (count('solo') >= MAX_SOLOS) return;
            const rect = place(live.current, 34, 26);
            if (rect) add({ kind: 'solo', ...rect, indicator: pick(INDICATORS) });
        };

        const spawnCurve = () => {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            if (count('curve') >= (vw >= 900 ? 2 : 1)) return;
            const w = Math.round(Math.min(220 + Math.random() * 120, vw - 48, vh * 0.55));
            const rect = place(live.current, w, w + 70);
            if (!rect) return;
            const def = pick(CURVES);
            add({ kind: 'curve', ...rect, name: def.name, eq: def.eq, thin: !!def.thin, ...toPath(def.make(), w) });
        };

        spawnSolo();
        const soloTimer = setInterval(spawnSolo, SOLO_SPAWN_MS);
        const firstCurve = setTimeout(spawnCurve, 800);
        const curveTimer = setInterval(spawnCurve, CURVE_SPAWN_MS);
        return () => {
            clearInterval(soloTimer);
            clearTimeout(firstCurve);
            clearInterval(curveTimer);
            live.current = [];
            setItems([]);
        };
    }, []);

    // Sits behind page content (z-index -1); sections are transparent so it shows through gaps.
    return (
        <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', overflow: 'hidden' }}>
            <style>{`
                .st-solo, .cv {
                    --pearl: radial-gradient(circle at 35% 30%, #ffffff 0%, #f1ede6 45%, #d8d2c8 100%);
                    --pearl-glow: 0 0 6px rgba(244,240,232,0.55);
                    position: absolute;
                }

                .st-solo { opacity: 0; animation: st-in 500ms ease-out forwards; }
                .st-solo .st-ind { transform: scale(1.3); }
                .st-solo.st-leaving { animation: st-out ${FADE_MS}ms ease-in forwards; }
                @keyframes st-in  { from { opacity: 0; } to { opacity: 0.6; } }
                @keyframes st-out { from { opacity: 0.6; } to { opacity: 0; } }

                /* indicators */
                .st-ind { position: relative; display: inline-flex; align-items: center; justify-content: center; gap: 3px; height: 14px; min-width: 22px; }
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
                @keyframes cv-life { 0% { opacity: 0; } 6% { opacity: 0.38; } 86% { opacity: 0.38; } 100% { opacity: 0; } }
                .cv-svg { display: block; overflow: visible; animation: cv-rot 120s linear infinite; }
                @keyframes cv-rot { to { transform: rotate(360deg); } }
                .cv path {
                    fill: none; stroke: rgba(242,238,230,0.95); stroke-width: 0.7;
                    stroke-linecap: round; stroke-linejoin: round;
                    stroke-dasharray: var(--len); stroke-dashoffset: var(--len);
                    animation: cv-draw ${CURVE_DRAW_MS}ms cubic-bezier(0.45, 0.05, 0.35, 1) 300ms forwards;
                }
                .cv path.thin { stroke-width: 0.25; }
                @keyframes cv-draw { to { stroke-dashoffset: 0; } }
                .cv-name {
                    margin-top: 14px; text-align: center;
                    font: 700 0.6rem ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
                    letter-spacing: 0.22em; text-transform: uppercase; color: rgba(240,236,228,0.75);
                }
                .cv-eq {
                    margin-top: 4px; text-align: center; line-height: 1.5;
                    font: italic 400 0.76rem 'Old Standard TT', Georgia, serif;
                    color: rgba(240,236,228,0.9); letter-spacing: 0.02em;
                }
            `}</style>
            {items.map((it) => (it.kind === 'curve'
                ? <Curve key={it.id} item={it} onDone={remove} />
                : <Solo key={it.id} item={it} onDone={remove} />))}
        </div>
    );
}
