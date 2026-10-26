import React, { useEffect, useRef, useState } from 'react';

const WORDS = [
    'Measuring', 'Sampling', 'Mulling', 'Querying', 'Calibrating', 'Modeling',
    'Tracing', 'Indexing', 'Validating', 'Routing', 'Plotting', 'Annotating',
    'Hypothesizing', 'Observing', 'Reconciling', 'Compiling', 'Mapping', 'Pondering',
    'Correlating', 'Normalizing', 'Synthesizing', 'Iterating', 'Wondering', 'Deploying',
];
const GLYPHS = ['·', '✢', '✳', '✶', '✻', '✽', '✻', '✶', '✳', '✢'];
const WORD_LIFE_MS = 6500;
const SPAWN_EVERY_MS = 1500;
const MAX_WORDS = 7;

const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Constellation() {
    const ref = useRef(null);

    useEffect(() => {
        const canvas = ref.current;
        const ctx = canvas.getContext('2d');
        const reduce = prefersReducedMotion();
        const LINK = 140;
        let w = 0, h = 0, raf = 0;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = window.innerWidth;
            h = window.innerHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();

        const count = Math.round(Math.min(70, Math.max(24, (w * h) / 22000)));
        const nodes = Array.from({ length: count }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.18,
            vy: (Math.random() - 0.5) * 0.18,
        }));

        const draw = () => {
            ctx.clearRect(0, 0, w, h);
            for (const n of nodes) {
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < 0 || n.x > w) n.vx *= -1;
                if (n.y < 0 || n.y > h) n.vy *= -1;
            }
            ctx.lineWidth = 0.6;
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < LINK * LINK) {
                        ctx.strokeStyle = `rgba(148,197,255,${(1 - Math.sqrt(d2) / LINK) * 0.16})`;
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            }
            ctx.fillStyle = 'rgba(203,213,225,0.4)';
            for (const n of nodes) {
                ctx.beginPath();
                ctx.arc(n.x, n.y, 1.1, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        const loop = () => { draw(); raf = requestAnimationFrame(loop); };
        const onResize = () => { resize(); if (reduce) draw(); };

        if (reduce) draw(); else loop();
        window.addEventListener('resize', onResize);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', onResize);
        };
    }, []);

    return <canvas ref={ref} aria-hidden="true" style={{ position: 'absolute', inset: 0 }} />;
}

function ThinkingWords() {
    const [items, setItems] = useState([]);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        if (prefersReducedMotion()) return;
        let nextId = 0;
        const timers = new Set();
        const live = [];

        // Keep words in the side gutters when they're wide enough, and never on top of each other.
        const pickSpot = () => {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const gutter = (vw - 760) / 2;
            for (let tries = 0; tries < 10; tries++) {
                const x = gutter >= 170
                    ? (Math.random() < 0.5
                        ? 16 + Math.random() * (gutter - 160)
                        : vw - gutter + 12 + Math.random() * (gutter - 160))
                    : 12 + Math.random() * (vw - 160);
                const y = vh * 0.06 + Math.random() * vh * 0.86;
                if (live.every((p) => Math.abs(p.x - x) > 160 || Math.abs(p.y - y) > 44)) return { x, y };
            }
            return null;
        };

        const spawn = () => {
            if (live.length >= MAX_WORDS) return;
            const spot = pickSpot();
            if (!spot) return;
            const item = { id: nextId++, word: WORDS[Math.floor(Math.random() * WORDS.length)], ...spot };
            live.push(item);
            setItems([...live]);
            const t = setTimeout(() => {
                live.splice(live.indexOf(item), 1);
                setItems([...live]);
                timers.delete(t);
            }, WORD_LIFE_MS);
            timers.add(t);
        };

        spawn();
        const spawner = setInterval(spawn, SPAWN_EVERY_MS);
        const glyphs = setInterval(() => setTick((n) => n + 1), 150);
        return () => {
            clearInterval(spawner);
            clearInterval(glyphs);
            timers.forEach(clearTimeout);
        };
    }, []);

    return items.map(({ id, word, x, y }) => (
        <span key={id} className="amb-word" style={{ left: `${x}px`, top: `${y}px` }}>
            <span className="amb-glyph">{GLYPHS[(tick + id) % GLYPHS.length]}</span>
            <span className="amb-shimmer">{word}…</span>
        </span>
    ));
}

const MIST = [
    { left: '-15%', top: '-10%', tint: '148,163,184', dur: 70, delay: 0 },
    { left: '55%',  top: '15%',  tint: '125,170,230', dur: 85, delay: -20 },
    { left: '10%',  top: '55%',  tint: '160,150,190', dur: 95, delay: -45 },
    { left: '60%',  top: '70%',  tint: '200,170,140', dur: 80, delay: -10 },
];

export default function Ambient() {
    return (
        <div aria-hidden="true" style={{
            position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden',
            mixBlendMode: 'screen',
        }}>
            <style>{`
                .amb-mist {
                    position: absolute; width: 65vmax; height: 65vmax; border-radius: 50%;
                    animation: amb-drift ease-in-out infinite alternate;
                }
                @keyframes amb-drift {
                    0%   { transform: translate(0, 0) scale(1); }
                    50%  { transform: translate(9vw, -7vh) scale(1.12); }
                    100% { transform: translate(-7vw, 6vh) scale(0.94); }
                }
                .amb-word {
                    position: absolute; display: flex; align-items: center; gap: 0.45em;
                    font: italic 500 0.88rem ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
                    letter-spacing: 0.02em; white-space: nowrap;
                    opacity: 0; animation: amb-life ${WORD_LIFE_MS}ms ease-in-out forwards;
                }
                @keyframes amb-life {
                    0%   { opacity: 0;    transform: translateY(6px); }
                    18%  { opacity: 0.55; }
                    78%  { opacity: 0.55; }
                    100% { opacity: 0;    transform: translateY(-6px); }
                }
                .amb-glyph { color: rgba(253,186,140,0.95); font-style: normal; width: 0.9em; text-align: center; }
                .amb-shimmer {
                    background: linear-gradient(90deg, rgba(148,163,184,0.5) 0%, rgba(248,250,252,1) 50%, rgba(148,163,184,0.5) 100%);
                    background-size: 200% 100%;
                    -webkit-background-clip: text; background-clip: text; color: transparent;
                    animation: amb-shimmer 2.4s linear infinite;
                }
                @keyframes amb-shimmer { from { background-position: 150% 0; } to { background-position: -50% 0; } }
                @media (prefers-reduced-motion: reduce) { .amb-mist { animation: none; } }
            `}</style>

            {MIST.map((m) => (
                <div key={m.left + m.top} className="amb-mist" style={{
                    left: m.left, top: m.top,
                    background: `radial-gradient(circle, rgba(${m.tint},0.13) 0%, rgba(${m.tint},0.05) 35%, transparent 65%)`,
                    animationDuration: `${m.dur}s`, animationDelay: `${m.delay}s`,
                }} />
            ))}
            <Constellation />
            <ThinkingWords />
        </div>
    );
}
