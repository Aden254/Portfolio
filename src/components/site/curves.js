// Decorative curves for the ambient layer. Each is generated from the equation shown in its label.

const PI = Math.PI;
const TAU = PI * 2;
const { sin, cos, exp, abs } = Math;

const sample = (n, from, to, fn) => Array.from({ length: n + 1 }, (_, i) => fn(from + ((to - from) * i) / n));
const polar = (n, tMax, r) => sample(n, 0, tMax, (t) => { const R = r(t); return [R * cos(t), R * sin(t)]; });
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

// Fourth-order Runge–Kutta integration of a 3D system, projected to 2D.
function integrate(f, start, dt, steps, skip, project) {
    let s = start;
    const pts = [];
    for (let i = 0; i < steps; i++) {
        const k1 = f(s);
        const k2 = f(s.map((v, j) => v + (k1[j] * dt) / 2));
        const k3 = f(s.map((v, j) => v + (k2[j] * dt) / 2));
        const k4 = f(s.map((v, j) => v + k3[j] * dt));
        s = s.map((v, j) => v + (dt / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]));
        if (i >= skip) pts.push(project(s));
    }
    return pts;
}

// Several trajectories of one system; null entries lift the pen between them (and where project() clips).
function trajectories(f, starts, dt, steps, project) {
    const pts = [];
    starts.forEach((start, i) => {
        if (i) pts.push(null);
        for (const p of integrate(f, start, dt, steps, 0, project)) pts.push(p);
    });
    return pts;
}

const frac = (num, den) => (den === 1 ? `${num}t` : `${num}t/${den}`);

function hypotrochoid(R, r, d) {
    const k = R - r;
    const g = gcd(k, r);
    const f = frac(k / g, r / g);
    return {
        name: `Hypotrochoid · R = ${R}, r = ${r}, d = ${d}`,
        eq: [`x = ${k}cos t + ${d}cos(${f})`, `y = ${k}sin t − ${d}sin(${f})`],
        make: () => sample(9000, 0, (TAU * r) / gcd(R, r), (t) => [k * cos(t) + d * cos((k * t) / r), k * sin(t) - d * sin((k * t) / r)]),
    };
}

function epitrochoid(R, r, d) {
    const k = R + r;
    const g = gcd(k, r);
    const f = frac(k / g, r / g);
    return {
        name: `Epitrochoid · R = ${R}, r = ${r}, d = ${d}`,
        eq: [`x = ${k}cos t − ${d}cos(${f})`, `y = ${k}sin t − ${d}sin(${f})`],
        make: () => sample(9000, 0, (TAU * r) / gcd(R, r), (t) => [k * cos(t) - d * cos((k * t) / r), k * sin(t) - d * sin((k * t) / r)]),
    };
}

function torusKnot(p, q) {
    return {
        name: `(${p}, ${q}) torus knot`,
        eq: [`x = (2 + cos ${q}t)·cos ${p}t`, `y = (2 + cos ${q}t)·sin ${p}t`],
        make: () => sample(8000, 0, TAU, (t) => [(2 + cos(q * t)) * cos(p * t), (2 + cos(q * t)) * sin(p * t)]),
    };
}

const lorenz = ([x, y, z]) => [10 * (y - x), x * (28 - z) - y, x * y - (8 / 3) * z];
const LORENZ_EQ = ['dx/dt = 10(y − x)', 'dy/dt = x(28 − z) − y', 'dz/dt = xy − (8/3)z'];

export const CURVES = [
    /* ── originals ── */
    {
        name: 'Farris wheel',
        eq: ['x = cos t + ½cos 7t + ⅓sin 17t', 'y = sin t + ½sin 7t + ⅓cos 17t'],
        make: () => sample(6000, 0, TAU, (t) => [cos(t) + cos(7 * t) / 2 + sin(17 * t) / 3, sin(t) + sin(7 * t) / 2 + cos(17 * t) / 3]),
    },
    hypotrochoid(13, 7, 9),
    epitrochoid(5, 3, 5),
    {
        name: 'Lissajous figure',
        eq: ['x = sin(9t + π/4)', 'y = sin 8t'],
        make: () => sample(6000, 0, TAU, (t) => [sin(9 * t + PI / 4), sin(8 * t)]),
    },
    {
        name: 'Rhodonea',
        eq: ['r = cos(7θ/9)'],
        make: () => polar(7000, 9 * PI, (t) => cos((7 * t) / 9)),
    },
    {
        name: 'Harmonograph',
        eq: ['x = e^(−t/160)[sin(2t + π/6) + sin 3.02t]', 'y = e^(−t/160)[sin 3t + sin(2.01t + π/2)]'],
        make: () => sample(12000, 0, 320, (t) => {
            const d = exp(-t / 160);
            return [d * (sin(2 * t + PI / 6) + sin(3.02 * t)), d * (sin(3 * t) + sin(2.01 * t + PI / 2))];
        }),
    },
    {
        name: 'Gielis superformula',
        eq: ['r = (|cos(23φ/20)|^0.8 + |sin(23φ/20)|^0.8)^(−2)'],
        make: () => polar(9000, 20 * PI, (t) => (abs(cos((23 * t) / 20)) ** 0.8 + abs(sin((23 * t) / 20)) ** 0.8) ** -2),
    },
    {
        name: 'Lorenz attractor',
        eq: LORENZ_EQ,
        make: () => integrate(lorenz, [0.1, 0, 0], 0.005, 14000, 200, ([x, , z]) => [x, z]),
    },
    {
        name: 'Chrysanthemum curve',
        eq: ['r = 5(1 + sin(11θ/5)) − 4sin⁴(17θ/3)·sin⁸(2cos 3θ − 28θ)'],
        make: () => polar(14000, 21 * PI, (t) => 5 * (1 + sin((11 * t) / 5)) - 4 * sin((17 * t) / 3) ** 4 * sin(2 * cos(3 * t) - 28 * t) ** 8),
    },
    {
        name: 'Butterfly curve',
        eq: ['r = e^(sin θ) − 2cos 4θ + sin⁵((2θ − π)/24)'],
        make: () => polar(9000, 6 * TAU, (t) => exp(sin(t)) - 2 * cos(4 * t) + sin((2 * t - PI) / 24) ** 5),
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

    /* ── spirographs ── */
    hypotrochoid(9, 4, 6),
    hypotrochoid(13, 8, 5),
    hypotrochoid(17, 11, 9),
    epitrochoid(7, 3, 6),
    epitrochoid(11, 7, 9),
    epitrochoid(13, 5, 9),

    /* ── Farris wheels ── */
    {
        name: 'Farris wheel · 8-fold',
        eq: ['z(t) = e^(it) + ½e^(9it) + ⅓e^(−15it)'],
        make: () => sample(8000, 0, TAU, (t) => [cos(t) + cos(9 * t) / 2 + cos(15 * t) / 3, sin(t) + sin(9 * t) / 2 - sin(15 * t) / 3]),
    },
    {
        name: 'Farris wheel · 7-fold',
        eq: ['z(t) = e^(it) + ½e^(−6it) + ⅓e^(15it)'],
        make: () => sample(8000, 0, TAU, (t) => [cos(t) + cos(6 * t) / 2 + cos(15 * t) / 3, sin(t) - sin(6 * t) / 2 + sin(15 * t) / 3]),
    },
    {
        name: 'Farris wheel · 12-fold',
        eq: ['z(t) = e^(it) + 0.55e^(−11it) + 0.3e^(25it)'],
        make: () => sample(9000, 0, TAU, (t) => [cos(t) + 0.55 * cos(11 * t) + 0.3 * cos(25 * t), sin(t) - 0.55 * sin(11 * t) + 0.3 * sin(25 * t)]),
    },

    /* ── Lissajous ── */
    {
        name: 'Lissajous figure · 13:11',
        eq: ['x = sin 13t', 'y = sin(11t + π/2)'],
        make: () => sample(10000, 0, TAU, (t) => [sin(13 * t), sin(11 * t + PI / 2)]),
    },
    {
        name: 'Lissajous figure · 15:14',
        eq: ['x = sin(15t + π/5)', 'y = sin 14t'],
        make: () => sample(10000, 0, TAU, (t) => [sin(15 * t + PI / 5), sin(14 * t)]),
    },

    /* ── roses ── */
    { name: 'Rhodonea · k = 11/7', eq: ['r = cos(11θ/7)'], make: () => polar(9000, 7 * PI, (t) => cos((11 * t) / 7)) },
    { name: 'Rhodonea · k = 13/6', eq: ['r = sin(13θ/6)'], make: () => polar(10000, 12 * PI, (t) => sin((13 * t) / 6)) },
    { name: 'Rhodonea · k = 8/5', eq: ['r = cos(8θ/5)'], make: () => polar(9000, 10 * PI, (t) => cos((8 * t) / 5)) },

    /* ── Maurer ── */
    {
        name: 'Maurer rose · n = 2, d = 39°',
        eq: ['r = sin 2θ,  θ = k · 39°,  k = 0…360'],
        thin: true,
        make: () => sample(360, 0, 360, (k) => {
            const th = (k * 39 * PI) / 180;
            const r = sin(2 * th);
            return [r * cos(th), r * sin(th)];
        }),
    },

    /* ── harmonographs ── */
    {
        name: 'Harmonograph · 3:2',
        eq: ['x = e^(−t/200)[sin 3t + sin(2.005t + π/4)]', 'y = e^(−t/200)[sin(2t + π/3) + sin 3.01t]'],
        make: () => sample(12000, 0, 400, (t) => {
            const d = exp(-t / 200);
            return [d * (sin(3 * t) + sin(2.005 * t + PI / 4)), d * (sin(2 * t + PI / 3) + sin(3.01 * t))];
        }),
    },
    {
        name: 'Harmonograph · 5:4',
        eq: ['x = e^(−t/250)[sin(5t + π/2) + sin 4.01t]', 'y = e^(−t/250)[sin 4t + sin(5.02t + π/3)]'],
        make: () => sample(14000, 0, 450, (t) => {
            const d = exp(-t / 250);
            return [d * (sin(5 * t + PI / 2) + sin(4.01 * t)), d * (sin(4 * t) + sin(5.02 * t + PI / 3))];
        }),
    },

    /* ── strange attractors ── */
    {
        name: 'Lorenz attractor · x–y view',
        eq: LORENZ_EQ,
        make: () => integrate(lorenz, [0.1, 0, 0], 0.005, 14000, 200, ([x, y]) => [x, y]),
    },
    {
        name: 'Rössler attractor',
        eq: ['dx/dt = −y − z', 'dy/dt = x + 0.2y', 'dz/dt = 0.2 + z(x − 5.7)'],
        make: () => integrate(([x, y, z]) => [-y - z, x + 0.2 * y, 0.2 + z * (x - 5.7)], [1, 1, 1], 0.02, 14000, 500, ([x, y]) => [x, y]),
    },
    {
        name: 'Thomas attractor',
        eq: ['dx/dt = sin y − bx', 'dy/dt = sin z − by', 'dz/dt = sin x − bz,  b = 0.208'],
        make: () => {
            const b = 0.208186;
            return integrate(([x, y, z]) => [sin(y) - b * x, sin(z) - b * y, sin(x) - b * z], [0.1, 0, 0], 0.06, 14000, 300, ([x, y]) => [x, y]);
        },
    },
    {
        name: 'Halvorsen attractor',
        eq: ['dx/dt = −1.4x − 4y − 4z − y²', 'dy/dt = −1.4y − 4z − 4x − z²', 'dz/dt = −1.4z − 4x − 4y − x²'],
        make: () => {
            const a = 1.4;
            return integrate(
                ([x, y, z]) => [-a * x - 4 * y - 4 * z - y * y, -a * y - 4 * z - 4 * x - z * z, -a * z - 4 * x - 4 * y - x * x],
                [-1.48, -1.51, 2.04], 0.008, 14000, 300, ([x, y]) => [x, y],
            );
        },
    },
    {
        name: 'Duffing oscillator',
        eq: ['ẍ + 0.3ẋ − x + x³ = 0.5cos(1.2t)'],
        make: () => integrate(([x, v, t]) => [v, -0.3 * v + x - x ** 3 + 0.5 * cos(1.2 * t), 1], [0.1, 0, 0], 0.02, 14000, 300, ([x, v]) => [x, v]),
    },

    /* ── superformulas ── */
    {
        name: 'Gielis superformula · m = 16/3',
        eq: ['r = (|cos(4φ/3)| + |sin(4φ/3)|)^(−5/3)'],
        make: () => polar(9000, 6 * PI, (t) => (abs(cos((4 * t) / 3)) + abs(sin((4 * t) / 3))) ** (-5 / 3)),
    },
    {
        name: 'Gielis superformula · m = 11/2',
        eq: ['r = (|cos(11φ/8)|^0.6 + |sin(11φ/8)|^0.6)^(−2.5)'],
        make: () => polar(10000, 8 * PI, (t) => (abs(cos((11 * t) / 8)) ** 0.6 + abs(sin((11 * t) / 8)) ** 0.6) ** -2.5),
    },

    /* ── spiral ── */
    {
        name: 'Euler–Cornu spiral',
        eq: ['x(s) = ∫₀ˢ cos(u²) du', 'y(s) = ∫₀ˢ sin(u²) du'],
        make: () => {
            const n = 12000;
            const sMax = 7.5;
            const ds = (2 * sMax) / n;
            let x = 0, y = 0;
            const half = [];
            for (let i = 0; i <= n / 2; i++) {
                const s = i * ds;
                half.push([x, y]);
                x += cos(s * s) * ds;
                y += sin(s * s) * ds;
            }
            // The spiral is point-symmetric about the origin.
            return [...half.slice(1).reverse().map(([a, b]) => [-a, -b]), ...half];
        },
    },

    /* ── torus knots ── */
    torusKnot(3, 7),
    torusKnot(5, 8),
    torusKnot(2, 9),

    /* ── guilloché ── */
    { name: 'Guilloché rosette', eq: ['r = 3 + cos(31θ/3)'], make: () => polar(10000, 6 * PI, (t) => 3 + cos((31 * t) / 3)) },
    { name: 'Guilloché rosette · modulated', eq: ['r = 2 + sin(17θ/4)·cos 3θ'], make: () => polar(12000, 8 * PI, (t) => 2 + sin((17 * t) / 4) * cos(3 * t)) },

    /* ── more attractors ── */
    {
        name: 'Aizawa attractor',
        eq: ['dx/dt = (z − 0.7)x − 3.5y', 'dy/dt = 3.5x + (z − 0.7)y', 'dz/dt = 0.6 + 0.95z − z³/3 − (x² + y²)(1 + 0.25z) + 0.1zx³'],
        make: () => integrate(
            ([x, y, z]) => [(z - 0.7) * x - 3.5 * y, 3.5 * x + (z - 0.7) * y, 0.6 + 0.95 * z - z ** 3 / 3 - (x * x + y * y) * (1 + 0.25 * z) + 0.1 * z * x ** 3],
            [0.1, 0, 0], 0.01, 14000, 300, ([x, , z]) => [x, z],
        ),
    },
    {
        name: 'Dadras attractor',
        eq: ['dx/dt = y − 3x + 2.7yz', 'dy/dt = 1.7y − xz + z', 'dz/dt = 2xy − 9z'],
        make: () => integrate(([x, y, z]) => [y - 3 * x + 2.7 * y * z, 1.7 * y - x * z + z, 2 * x * y - 9 * z], [1, 1, 0], 0.005, 14000, 300, ([x, y]) => [x, y]),
    },
    {
        name: 'Chen attractor',
        eq: ['dx/dt = 35(y − x)', 'dy/dt = −7x − xz + 28y', 'dz/dt = xy − 3z'],
        make: () => integrate(([x, y, z]) => [35 * (y - x), -7 * x - x * z + 28 * y, x * y - 3 * z], [-10, 0, 37], 0.002, 14000, 500, ([x, , z]) => [x, z]),
    },

    /* ── phase portraits ── */
    {
        name: 'Van der Pol oscillator · phase portrait',
        eq: ['ẍ − 1.5(1 − x²)ẋ + x = 0'],
        make: () => trajectories(
            ([x, v]) => [v, 1.5 * (1 - x * x) * v - x],
            [[0.1, 0], [3.8, 0], [-3.8, 0], [0, 4.5], [0, -4.5], [-0.4, 0.3]], 0.01, 2200, ([x, v]) => [x, v],
        ),
    },
    {
        name: 'Nonlinear pendulum · phase portrait',
        eq: ['θ̈ + sin θ = 0'],
        make: () => trajectories(
            ([th, w]) => [w, -sin(th)],
            [[0.4, 0], [0.9, 0], [1.4, 0], [1.9, 0], [2.4, 0], [2.85, 0], [-PI, 2.15], [PI, -2.15], [-PI, 2.6], [PI, -2.6]],
            0.01, 1600,
            ([th, w]) => (abs(th) <= PI ? [th, w] : null),
        ),
    },

    /* ── physics & spirals ── */
    {
        name: 'Precessing orbit',
        eq: ['r = 1 / (1 + 0.6cos(0.9θ))'],
        make: () => polar(10000, 20 * PI, (t) => 1 / (1 + 0.6 * cos(0.9 * t))),
    },
    {
        name: "Fermat's spiral",
        eq: ['r² = θ'],
        make: () => sample(10000, -40 * PI, 40 * PI, (t) => {
            const r = Math.sign(t) * Math.sqrt(abs(t));
            return [r * cos(abs(t)), r * sin(abs(t))];
        }),
    },
    {
        name: 'Loxodrome · tilted sphere',
        eq: ['x = cos t·sech(t/10)', 'y = sin t·sech(t/10)', 'z = tanh(t/10)'],
        make: () => {
            const tilt = 1;
            return sample(10000, -60, 60, (t) => {
                const s = 1 / Math.cosh(t / 10);
                const x = cos(t) * s;
                const y = sin(t) * s;
                const z = Math.tanh(t / 10);
                return [x, y * cos(tilt) + z * sin(tilt)];
            });
        },
    },

    /* ── Fourier epicycles ── */
    {
        name: 'Fourier epicycles · 5-fold',
        eq: ['z(t) = e^(it) + ½e^(−4it) + ⅓e^(11it) + ¼e^(−19it)'],
        make: () => sample(9000, 0, TAU, (t) => [
            cos(t) + cos(4 * t) / 2 + cos(11 * t) / 3 + cos(19 * t) / 4,
            sin(t) - sin(4 * t) / 2 + sin(11 * t) / 3 - sin(19 * t) / 4,
        ]),
    },
];

export function toPath(pts, size) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of pts) {
        if (!p) continue;
        const [x, y] = p;
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
    let penDown = false;
    for (const p of pts) {
        if (!p) { penDown = false; continue; }
        const X = p[0] * s + ox;
        const Y = size - (p[1] * s + oy);
        d += `${penDown ? 'L' : 'M'}${X.toFixed(1)} ${Y.toFixed(1)}`;
        if (penDown) len += Math.hypot(X - px, Y - py);
        px = X; py = Y;
        penDown = true;
    }
    return { d, len: Math.ceil(len) };
}
