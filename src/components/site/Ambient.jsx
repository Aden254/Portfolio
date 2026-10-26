import React, { useEffect, useRef } from 'react';

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

const MIST = [
    { left: '-15%', top: '-10%', tint: '148,163,184', dur: 42, delay: 0 },
    { left: '55%',  top: '15%',  tint: '125,170,230', dur: 50, delay: -14 },
    { left: '10%',  top: '55%',  tint: '160,150,190', dur: 58, delay: -30 },
    { left: '60%',  top: '70%',  tint: '200,170,140', dur: 46, delay: -8 },
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
                @media (prefers-reduced-motion: reduce) { .amb-mist { animation: none; } }
            `}</style>

            {MIST.map((m) => (
                <div key={m.left + m.top} className="amb-mist" style={{
                    left: m.left, top: m.top,
                    background: `radial-gradient(circle, rgba(${m.tint},0.26) 0%, rgba(${m.tint},0.1) 35%, transparent 65%)`,
                    animationDuration: `${m.dur}s`, animationDelay: `${m.delay}s`,
                }} />
            ))}
            <Constellation />
        </div>
    );
}
