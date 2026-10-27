import { CURVES } from './curves';

// Three pens that never lift: each draws a curve, rests, sweeps to a new spot, and draws the next.
// Driven imperatively with requestAnimationFrame so the glowing tip can follow the stroke exactly.

const NS = 'http://www.w3.org/2000/svg';
const DRAW_MS = 10000;
const HOLD_MS = 2000;
const FADE_MS = 3500;
const LABEL_OPACITY = '0.8';

export const PENS = [
    { color: '#f2eee6', glow: 'rgba(242,238,230,0.75)', opacity: 0.32 },
    { color: '#34d399', glow: 'rgba(52,211,153,0.7)', opacity: 0.38 },
    { color: '#c2566b', glow: 'rgba(194,86,107,0.75)', opacity: 0.47 },
];

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function svgEl(tag, attrs) {
    const node = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    return node;
}

// Polyline geometry in viewport pixels, with cumulative lengths for locating the pen tip.
function build(points) {
    const xs = [];
    const ys = [];
    const cum = [];
    let d = '';
    let len = 0;
    let penDown = false;
    for (const p of points) {
        if (!p) { penDown = false; continue; }
        const [x, y] = p;
        if (penDown) len += Math.hypot(x - xs[xs.length - 1], y - ys[ys.length - 1]);
        d += `${penDown ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
        xs.push(x); ys.push(y); cum.push(len);
        penDown = true;
    }
    return { d, xs, ys, cum, len: Math.max(1, len) };
}

function fitCurve(pts, size, ox, oy) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of pts) {
        if (!p) continue;
        if (p[0] < minX) minX = p[0]; if (p[0] > maxX) maxX = p[0];
        if (p[1] < minY) minY = p[1]; if (p[1] > maxY) maxY = p[1];
    }
    const s = (size - 8) / Math.max(maxX - minX, maxY - minY);
    const cx = ox + (size - (maxX - minX) * s) / 2 - minX * s;
    const cy = oy + size - ((size - (maxY - minY) * s) / 2 - minY * s);
    return build(pts.map((p) => (p ? [cx + p[0] * s, cy - p[1] * s] : null)));
}

function connector([ax, ay], [bx, by]) {
    const dx = bx - ax;
    const dy = by - ay;
    const dist = Math.hypot(dx, dy) || 1;
    const nx = -dy / dist;
    const ny = dx / dist;
    const bend1 = (Math.random() - 0.5) * 0.8 * dist;
    const bend2 = (Math.random() - 0.5) * 0.8 * dist;
    const c1 = [ax + dx * 0.25 + nx * bend1, ay + dy * 0.25 + ny * bend1];
    const c2 = [ax + dx * 0.75 + nx * bend2, ay + dy * 0.75 + ny * bend2];
    const pts = [];
    for (let i = 0; i <= 120; i++) {
        const t = i / 120;
        const u = 1 - t;
        pts.push([
            u * u * u * ax + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * bx,
            u * u * u * ay + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * by,
        ]);
    }
    return build(pts);
}

function tipAt(g, dist) {
    let lo = 0;
    let hi = g.cum.length - 1;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (g.cum[mid] < dist) lo = mid + 1; else hi = mid;
    }
    return [g.xs[lo], g.ys[lo]];
}

const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

function place(size, taken) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const h = size + 80;
    let best = null;
    for (let tries = 0; tries < 20; tries++) {
        const rect = {
            x: 16 + Math.random() * Math.max(0, vw - size - 32),
            y: vh * 0.05 + Math.random() * Math.max(0, vh * 0.92 - h),
            w: size, h,
        };
        if (taken.every((r) => !overlaps(rect, r))) return rect;
        best = rect;
    }
    return best;
}

function makeLabel(def, rect, pen) {
    const box = document.createElement('div');
    box.className = 'pen-label';
    Object.assign(box.style, { left: `${rect.x}px`, top: `${rect.y + rect.w + 12}px`, width: `${rect.w}px` });
    const [title, params] = def.name.split(' · ');
    const name = document.createElement('p');
    name.className = 'cv-name';
    name.style.color = pen.color;
    name.textContent = title;
    if (params) {
        const span = document.createElement('span');
        span.className = 'cv-param';
        span.textContent = ` · ${params}`;
        name.appendChild(span);
    }
    box.appendChild(name);
    for (const line of def.eq) {
        const p = document.createElement('p');
        p.className = 'cv-eq';
        p.textContent = line;
        box.appendChild(p);
    }
    return box;
}

export function startPens(host, { animate }) {
    const svg = svgEl('svg', { width: '100%', height: '100%' });
    Object.assign(svg.style, { position: 'absolute', inset: '0', overflow: 'visible' });
    const strokes = svgEl('g', {});
    const tips = svgEl('g', {});
    svg.append(strokes, tips);
    const labels = document.createElement('div');
    host.append(svg, labels);

    const pens = PENS.map((style) => ({ style, phase: 'idle', cur: null, next: null, link: null, t0: 0, dur: 0, tip: null }));
    const timers = new Set();

    const takenBy = (except) => pens.flatMap((p) => (p === except ? [] : [p.cur?.rect, p.next?.rect].filter(Boolean)));

    function newCurve(pen) {
        const onScreen = new Set(pens.flatMap((p) => [p.cur?.def, p.next?.def]));
        const def = pick(CURVES.filter((c) => !onScreen.has(c)));
        const size = Math.round(Math.min(220 + Math.random() * 120, window.innerWidth - 48, window.innerHeight * 0.55));
        const rect = place(size, takenBy(pen));
        const g = fitCurve(def.make(), size, rect.x, rect.y);
        const path = svgEl('path', {
            d: g.d, fill: 'none', stroke: pen.style.color,
            'stroke-width': def.thin ? 0.25 : 0.75, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
            'stroke-dasharray': g.len, 'stroke-dashoffset': animate ? g.len : 0, opacity: pen.style.opacity,
        });
        path.style.transition = `opacity ${FADE_MS}ms ease`;
        strokes.appendChild(path);
        const label = makeLabel(def, rect, pen.style);
        if (!animate) label.style.opacity = LABEL_OPACITY;
        labels.appendChild(label);
        return { def, rect, g, path, label };
    }

    function newLink(pen, from, to) {
        const g = connector(from, to);
        const path = svgEl('path', {
            d: g.d, fill: 'none', stroke: pen.style.color, 'stroke-width': 0.75, 'stroke-linecap': 'round',
            'stroke-dasharray': g.len, 'stroke-dashoffset': g.len, opacity: pen.style.opacity,
        });
        path.style.transition = `opacity ${FADE_MS}ms ease`;
        strokes.appendChild(path);
        return { g, path };
    }

    function retire(...nodes) {
        for (const n of nodes) {
            if (!n) continue;
            n.style.opacity = '0';
            const t = setTimeout(() => { n.remove(); timers.delete(t); }, FADE_MS + 100);
            timers.add(t);
        }
    }

    if (!animate) {
        pens.forEach((pen) => { pen.cur = newCurve(pen); });
        return () => { timers.forEach(clearTimeout); svg.remove(); labels.remove(); };
    }

    pens.forEach((pen, i) => {
        pen.tip = svgEl('circle', { r: 2.4, fill: pen.style.color, opacity: 0 });
        pen.tip.style.filter = `drop-shadow(0 0 4px ${pen.style.glow})`;
        pen.tip.style.transition = 'opacity 400ms ease';
        tips.appendChild(pen.tip);
        pen.startAt = performance.now() + i * 2200;
    });

    const moveTip = (pen, [x, y]) => {
        pen.tip.setAttribute('cx', x.toFixed(1));
        pen.tip.setAttribute('cy', y.toFixed(1));
    };

    let raf = 0;
    const frame = (now) => {
        for (const pen of pens) {
            if (pen.phase === 'idle') {
                if (now < pen.startAt) continue;
                pen.cur = newCurve(pen);
                pen.phase = 'draw';
                pen.t0 = now;
                pen.tip.setAttribute('opacity', 1);
            }

            if (pen.phase === 'draw') {
                const p = Math.min(1, (now - pen.t0) / DRAW_MS);
                const dist = ease(p) * pen.cur.g.len;
                pen.cur.path.setAttribute('stroke-dashoffset', (pen.cur.g.len - dist).toFixed(1));
                moveTip(pen, tipAt(pen.cur.g, dist));
                if (p >= 1) {
                    pen.cur.label.style.opacity = LABEL_OPACITY;
                    pen.phase = 'hold';
                    pen.t0 = now;
                }
            } else if (pen.phase === 'hold') {
                if (now - pen.t0 >= HOLD_MS) {
                    pen.next = newCurve(pen);
                    const end = [pen.cur.g.xs.at(-1), pen.cur.g.ys.at(-1)];
                    const start = [pen.next.g.xs[0], pen.next.g.ys[0]];
                    pen.link = newLink(pen, end, start);
                    pen.dur = Math.min(2600, Math.max(1200, pen.link.g.len * 2.2));
                    pen.phase = 'link';
                    pen.t0 = now;
                }
            } else if (pen.phase === 'link') {
                const p = Math.min(1, (now - pen.t0) / pen.dur);
                const dist = ease(p) * pen.link.g.len;
                pen.link.path.setAttribute('stroke-dashoffset', (pen.link.g.len - dist).toFixed(1));
                moveTip(pen, tipAt(pen.link.g, dist));
                if (p >= 1) {
                    retire(pen.cur.path, pen.cur.label, pen.link.path);
                    pen.cur = pen.next;
                    pen.next = null;
                    pen.link = null;
                    pen.phase = 'draw';
                    pen.t0 = now;
                }
            }
        }
        raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
        cancelAnimationFrame(raf);
        timers.forEach(clearTimeout);
        svg.remove();
        labels.remove();
    };
}
