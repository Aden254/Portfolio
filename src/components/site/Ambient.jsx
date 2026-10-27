import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CURVES, toPath } from './curves';

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
    // Parameters after " · " keep their case (r ≠ R), so only the title is set in small caps.
    const [title, params] = item.name.split(' · ');

    useEffect(() => {
        const t = setTimeout(() => onDone(item.id), CURVE_LIFE_MS);
        return () => clearTimeout(t);
    }, [item.id, onDone]);

    return (
        <div className="cv" style={{ left: item.x, top: item.y, width: item.w }}>
            <svg className="cv-svg" width={item.w} height={item.w} viewBox={`0 0 ${item.w} ${item.w}`}>
                <path d={item.d} className={item.thin ? 'thin' : undefined} style={{ '--len': item.len }} />
            </svg>
            <p className="cv-name">{title}{params && <span className="cv-param"> · {params}</span>}</p>
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
                .cv-param {
                    text-transform: none; letter-spacing: 0.03em; font: italic 400 0.72rem 'Old Standard TT', Georgia, serif;
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
