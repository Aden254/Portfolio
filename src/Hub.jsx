import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SiteStyles, Reveal } from './components/site/SiteKit';
import { TRACKS } from './components/site/tracks';

const { research: R, tech: T } = TRACKS;

const JOURNEY = [
    {
        when: 'Origin',
        title: 'A question that started at home',
        body: 'About ten years ago I watched my brother recover from a stroke: the pegboards, the grip exercises, a brain slowly rerouting what it had lost. I didn\'t have the words for it then, but it left me with a question I still work on: how does a brain rebuild under pressure?',
        paths: [R],
    },
    {
        when: 'Undergraduate',
        title: 'Computer Science and Psychology, on purpose',
        body: 'At Hobart and William Smith Colleges I double-majored in Computer Science and Psychology, with a minor in Data Analytics. Psychology gave me the questions, and Computer Science gave me the means to answer them at scale. I graduated in May 2026.',
        paths: [R, T],
    },
    {
        when: '2024',
        title: 'Data from the field',
        body: 'As a student researcher at the Finger Lakes Institute, I built real-time pipelines and dashboards for a sensor buoy on Seneca Lake, and presented the work at the NY6 Undergraduate Research Conference and the Finger Lakes Research Symposium.',
        paths: [R],
    },
    {
        when: '2024 – 2025',
        title: 'Building the tools I needed',
        body: 'When existing tools didn\'t fit, I built my own: NeuroVerse 3D for reconstructing brains from MRI slices, NeuroTrace for annotating neural tissue, and NeuroAtlas for exploring gene expression across the brain. HealthHub, a healthcare platform with authentication and role-based access, was my first complete system.',
        paths: [R, T],
    },
    {
        when: '2026',
        title: 'Systems that hold up in the real world',
        body: 'Next came networking and infrastructure: ConsultLink, browser-to-browser video that connects across home and mobile networks; a spatial database behind live vessel tracking; and a cloud-deployed trip planner that keeps working offline.',
        paths: [T],
    },
    {
        when: 'Now',
        title: 'Data Manager & Analyst, Finger Lakes Institute',
        body: 'Today I manage the data behind long-running monitoring programs, including a water quality portal for Canandaigua Lake and Success for Geneva, a community dashboard tracking outcomes for children and families.',
        paths: [R, T],
    },
];

const DIRECTIONS = [
    { t: R, body: 'Research Assistant roles in psychology and cognitive science, as a step toward graduate study in how adversity reshapes the developing brain.' },
    { t: T, body: 'Systems administration, network engineering, and IT infrastructure roles, where keeping systems reliable is the job itself.' },
];

const eyebrow = { fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.7)' };

function Door({ t }) {
    const Icon = t.Icon;
    return (
        <Link to={t.path} className="glow-link"
            style={{ '--c': t.color, '--g': t.glow, '--rest': 'rgba(226,232,240,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', width: '270px', textAlign: 'center' }}>
            <Icon size={72} strokeWidth={1} />
            <span style={{ fontSize: 'clamp(1.3rem, 2.6vw, 1.7rem)', fontWeight: 700, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                {t.label}
            </span>
            <span className="sans" style={{ fontSize: '0.72rem', letterSpacing: '0.04em', color: 'rgba(100,116,139,0.85)', textShadow: 'none' }}>
                {t.blurb}
            </span>
        </Link>
    );
}

export default function Hub() {
    useEffect(() => { document.title = 'Daudi Aden'; }, []);

    return (
        <div className="site-root" style={{ background: '#050c1c' }}>
            <SiteStyles />

            {/* ── Opening ── */}
            <header style={{
                minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '5rem 1.25rem 4rem',
                background: 'radial-gradient(ellipse 70% 55% at 50% 38%, #0b1730 0%, #050c1c 70%)',
            }}>
                <h1 className="font-bold text-white" style={{ fontSize: 'clamp(2.75rem, 8vw, 5.75rem)', lineHeight: 1, textAlign: 'center', marginBottom: '1.25rem' }}>
                    Daudi Aden
                </h1>
                <p className="sans" style={{ ...eyebrow, fontSize: 'clamp(0.72rem, 1.8vw, 0.85rem)', textAlign: 'center', lineHeight: 1.9, marginBottom: '2rem' }}>
                    Computer Science &amp; Psychology · Data Manager &amp; Analyst
                </p>
                <p style={{ fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)', lineHeight: 1.8, color: 'var(--off-white)', maxWidth: '640px', textAlign: 'center' }}>
                    I study how brains and behavior change, and I build the systems that make that kind of research possible. My work runs in two directions from one starting point.
                </p>

                <nav aria-label="Choose a portfolio" style={{
                    display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
                    gap: 'clamp(3rem, 10vw, 8rem)', margin: 'clamp(3.5rem, 8vh, 5rem) 0',
                }}>
                    <Door t={R} />
                    <Door t={T} />
                </nav>

                <a href="#journey" className="glow-link sans"
                    style={{ '--c': '#e2e8f0', '--g': 'rgba(226,232,240,0.3)', '--rest': 'rgba(100,116,139,0.8)', ...eyebrow, color: undefined, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
                    The journey so far
                    <span aria-hidden="true" style={{ width: '1px', height: '32px', background: 'linear-gradient(to bottom, rgba(148,163,184,0.6), transparent)' }} />
                </a>
            </header>

            {/* ── Journey ── */}
            <Reveal style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div id="journey" className="max-w-4xl mx-auto px-6" style={{ paddingTop: '7rem', paddingBottom: '6rem', scrollMarginTop: '1rem' }}>
                    <p className="sans" style={{ ...eyebrow, marginBottom: '1rem' }}>The journey so far</p>
                    <h2 className="font-bold" style={{ fontSize: 'clamp(2rem,4vw,3rem)', color: 'white', lineHeight: 1.15, marginBottom: '1.25rem' }}>
                        One question, two kinds of work.
                    </h2>
                    <div className="sans" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '4rem', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                        {[R, T].map((t) => (
                            <span key={t.path} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: t.color }}>
                                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: t.color }} /> {t.label}
                            </span>
                        ))}
                    </div>

                    <ol style={{ listStyle: 'none' }}>
                        {JOURNEY.map((step, i) => (
                            <li key={step.title} className="grid md:grid-cols-[150px_1fr]" style={{ columnGap: '2.5rem' }}>
                                <p className="sans md:text-right" style={{ ...eyebrow, color: 'rgba(148,163,184,0.85)', paddingTop: '0.45rem', marginBottom: '0.5rem' }}>
                                    {step.when}
                                </p>
                                <div style={{
                                    position: 'relative',
                                    borderLeft: '1px solid rgba(148,163,184,0.18)',
                                    paddingLeft: '2rem',
                                    paddingBottom: i === JOURNEY.length - 1 ? 0 : '3.25rem',
                                }}>
                                    <span aria-hidden="true" style={{
                                        position: 'absolute', left: '-5px', top: '0.7rem',
                                        width: '9px', height: '9px', borderRadius: '50%',
                                        background: '#050c1c', border: '1px solid rgba(226,232,240,0.7)',
                                    }} />
                                    <h3 className="font-bold" style={{ fontSize: 'clamp(1.25rem,2.4vw,1.6rem)', color: 'white', lineHeight: 1.3, marginBottom: '0.75rem' }}>
                                        {step.title}
                                    </h3>
                                    <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--gray-light)', marginBottom: '0.9rem' }}>
                                        {step.body}
                                    </p>
                                    <div className="sans" style={{ display: 'flex', gap: '1rem', fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                                        {step.paths.map((t) => (
                                            <span key={t.path} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: t.color }}>
                                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: t.color }} /> {t.short}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </Reveal>

            {/* ── Where it leads ── */}
            <Reveal style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(180deg, #050c1c 0%, #0b1730 100%)' }}>
                <div className="max-w-5xl mx-auto px-6" style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
                    <p className="sans" style={{ ...eyebrow, marginBottom: '1rem', textAlign: 'center' }}>Where it leads</p>
                    <h2 className="font-bold" style={{ fontSize: 'clamp(1.9rem,3.8vw,2.75rem)', color: 'white', lineHeight: 1.2, textAlign: 'center', marginBottom: '4rem' }}>
                        From here, the work goes two ways.
                    </h2>
                    <div className="grid md:grid-cols-2" style={{ gap: '4rem' }}>
                        {DIRECTIONS.map(({ t, body }) => {
                            const Icon = t.Icon;
                            return (
                                <div key={t.path} style={{ textAlign: 'center' }}>
                                    <Icon size={40} strokeWidth={1.2} color={t.color} style={{ display: 'block', margin: '0 auto 1.25rem' }} />
                                    <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--off-white)', maxWidth: '400px', margin: '0 auto 1.75rem' }}>
                                        {body}
                                    </p>
                                    <Link to={t.path} className="glow-link sans"
                                        style={{ '--c': t.color, '--g': t.glow, '--rest': t.color, fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                                        Enter {t.label} →
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Reveal>

            {/* ── Links ── */}
            <footer className="sans" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '2.5rem 1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.75rem', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                    {[
                        { label: 'Research Statement', to: '/research' },
                        { label: 'GitHub',   href: 'https://github.com/Aden254' },
                        { label: 'LinkedIn', href: 'https://www.linkedin.com/in/daudi-aden/' },
                        { label: 'Email',    href: 'mailto:daudiaden4@gmail.com' },
                    ].map(({ label, to, href }) => {
                        const style = { '--c': '#e2e8f0', '--g': 'rgba(226,232,240,0.3)', '--rest': 'rgba(100,116,139,0.8)' };
                        return to
                            ? <Link key={label} to={to} className="glow-link" style={style}>{label}</Link>
                            : <a key={label} href={href} className="glow-link" style={style}
                                target={href.startsWith('mailto') ? undefined : '_blank'} rel="noopener noreferrer">{label}</a>;
                    })}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--blue-gray)' }}>© 2026 Daudi Aden · Geneva, NY</p>
            </footer>
        </div>
    );
}
