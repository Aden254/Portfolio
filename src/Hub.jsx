import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SiteStyles, Reveal, PhotoBg } from './components/site/SiteKit';
import Ambient from './components/site/Ambient';
import { TRACKS } from './components/site/tracks';

const { research: R, tech: T } = TRACKS;

const JOURNEY = [
    {
        when: 'Origin',
        title: 'A question about how brains adapt',
        body: 'I became interested early in how the brain adapts and recovers after injury. That question drew me to psychology, and the need to measure it carefully drew me to computing.',
    },
    {
        when: 'Undergraduate',
        title: 'Computer Science and Psychology, on purpose',
        body: 'At Hobart and William Smith Colleges I double-majored in Computer Science and Psychology, with a minor in Data Analytics. Psychology gave me the questions, and Computer Science gave me the means to answer them at scale. I graduated in May 2026.',
    },
    {
        when: '2024',
        title: 'Data from the field',
        body: 'As a student researcher at the Finger Lakes Institute, I built real-time pipelines and dashboards for a sensor buoy on Seneca Lake, and presented the work at the NY6 Undergraduate Research Conference and the Finger Lakes Research Symposium.',
    },
    {
        when: '2024 – 2025',
        title: 'Building the tools I needed',
        body: 'When existing tools didn\'t fit, I built my own: NeuroVerse 3D for reconstructing brains from MRI slices, NeuroTrace for annotating neural tissue, and NeuroAtlas for exploring gene expression across the brain. HealthHub, a healthcare platform with authentication and role-based access, was my first complete system.',
    },
    {
        when: '2026',
        title: 'Systems that hold up in the real world',
        body: 'Then came networking and infrastructure: ConsultLink, browser-to-browser video that connects across home and mobile networks; a spatial database behind live vessel tracking; and a cloud-deployed trip planner that keeps working offline.',
    },
    {
        when: 'Now',
        title: 'Data Manager & Analyst, Finger Lakes Institute',
        body: 'Today I manage the data behind long-running monitoring programs, including a water quality portal for Canandaigua Lake and Success for Geneva, a community dashboard tracking outcomes for children and families.',
    },
];

const SELECTED = [
    {
        year: '2026', inProgress: true,
        title: 'Canandaigua Lake Environmental Monitoring',
        body: 'A public water quality portal for 25+ sampling sites, built on proprietary monitoring data I manage.',
        tags: ['R', 'Shiny', 'Data Management'],
        href: 'https://flihws.shinyapps.io/CNtest261023/',
    },
    {
        year: '2026', inProgress: true,
        title: 'Success for Geneva',
        body: 'Ten community goals for children and families, read live from a database three local institutions update.',
        tags: ['R', 'Shiny', 'Live Database'],
        href: 'https://success4geneva.shinyapps.io/geneva-story/',
    },
    {
        year: '2025',
        title: 'NeuroAtlas',
        body: 'A gene expression explorer for 1,800+ brain structures, backed by a server that proxies the Allen Brain Atlas API.',
        tags: ['React', 'Three.js', 'Node.js'],
        to: '/neuroatlas',
    },
    {
        year: '2024',
        title: 'HealthHub Manager',
        body: 'A healthcare records platform with authentication, role-based access, and database-enforced rules.',
        tags: ['React', 'Node.js', 'MySQL'],
        to: '/healthhub',
    },
];

const eyebrow = { fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.7)' };

function Door({ t }) {
    return (
        <Link to={t.path} className="glow-link"
            style={{ '--c': t.color, '--g': t.glow, '--rest': 'rgba(226,232,240,0.78)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', width: '270px', textAlign: 'center' }}>
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
            <header className="photo-section" style={{ minHeight: '100vh', display: 'flex' }}>
                <PhotoBg src="/images/bg1.jpeg" position="center 52%"
                    overlay="linear-gradient(180deg, rgba(5,12,28,0.82) 0%, rgba(5,12,28,0.62) 45%, rgba(5,12,28,0.95) 100%)" />
                <div className="photo-content" style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '4rem 1.25rem 3.5rem',
                }}>
                <img src="/images/daud-profile.jpg" alt="Daudi Aden" style={{
                    width: 'clamp(120px, 18vw, 150px)', aspectRatio: '1', borderRadius: '50%',
                    objectFit: 'cover', objectPosition: 'center 20%',
                    border: '1px solid rgba(226,232,240,0.18)',
                    boxShadow: '0 0 0 6px rgba(226,232,240,0.04), 0 20px 50px rgba(0,0,0,0.45)',
                    marginBottom: '2rem',
                }} />
                <h1 className="font-bold text-white" style={{ fontSize: 'clamp(2.75rem, 8vw, 5.75rem)', lineHeight: 1, textAlign: 'center', marginBottom: '1.25rem' }}>
                    Daudi Aden
                </h1>
                <p className="sans" style={{ ...eyebrow, color: 'rgba(226,232,240,0.85)', textShadow: '0 1px 12px rgba(0,0,0,0.6)', fontSize: 'clamp(0.72rem, 1.8vw, 0.85rem)', textAlign: 'center', lineHeight: 1.9, marginBottom: '2rem' }}>
                    Computer Science &amp; Psychology · Data Manager &amp; Analyst
                </p>
                <p style={{ fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)', lineHeight: 1.8, color: 'var(--off-white)', maxWidth: '640px', textAlign: 'center' }}>
                    I collect, manage, and analyze research data, and I build the systems that keep it reliable and usable, from lake monitoring pipelines to neuroscience tools to secure healthcare platforms.
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
                </div>
            </header>

            {/* ── Journey ── */}
            <Reveal style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div id="journey" className="max-w-4xl mx-auto px-6" style={{ paddingTop: '7rem', paddingBottom: '6rem', scrollMarginTop: '1rem' }}>
                    <p className="sans" style={{ ...eyebrow, marginBottom: '1rem' }}>The journey so far</p>
                    <h2 className="font-bold" style={{ fontSize: 'clamp(2rem,4vw,3rem)', color: 'white', lineHeight: 1.15, marginBottom: '4rem' }}>
                        How I got here.
                    </h2>

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
                                    <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--gray-light)' }}>
                                        {step.body}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </Reveal>

            {/* ── Selected work ── */}
            <Reveal style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="max-w-4xl mx-auto px-6" style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
                    <p className="sans" style={{ ...eyebrow, marginBottom: '1rem' }}>Selected work</p>
                    <h2 className="font-bold" style={{ fontSize: 'clamp(2rem,4vw,3rem)', color: 'white', lineHeight: 1.15, marginBottom: '3rem' }}>
                        A few things I've built.
                    </h2>
                    <ul style={{ listStyle: 'none', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        {SELECTED.map((p) => {
                            const linkProps = { className: 'glow-link sans', style: { '--c': '#e2e8f0', '--g': 'rgba(226,232,240,0.35)', '--rest': 'rgba(148,163,184,0.9)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', whiteSpace: 'nowrap' } };
                            return (
                                <li key={p.title} className="grid md:grid-cols-[80px_1fr_auto]" style={{ columnGap: '2rem', rowGap: '0.5rem', alignItems: 'baseline', padding: '2rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                    <p className="sans" style={{ ...eyebrow, color: 'rgba(148,163,184,0.85)' }}>{p.year}</p>
                                    <div>
                                        <h3 className="font-bold" style={{ fontSize: 'clamp(1.2rem,2.2vw,1.45rem)', color: 'white', lineHeight: 1.3, marginBottom: '0.5rem' }}>
                                            {p.title}
                                            {p.inProgress && (
                                                <span className="sans" style={{ marginLeft: '0.75rem', verticalAlign: 'middle', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', color: '#fb923c' }}>IN PROGRESS</span>
                                            )}
                                        </h3>
                                        <p style={{ fontSize: '1rem', lineHeight: 1.75, color: 'var(--gray-light)', marginBottom: '0.75rem' }}>{p.body}</p>
                                        <p className="sans" style={{ fontSize: '0.72rem', letterSpacing: '0.06em', color: 'rgba(100,116,139,0.95)' }}>{p.tags.join(' · ')}</p>
                                    </div>
                                    {p.to
                                        ? <Link to={p.to} {...linkProps}>Open →</Link>
                                        : <a href={p.href} target="_blank" rel="noopener noreferrer" {...linkProps}>View live →</a>}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </Reveal>

            {/* ── What I do ── */}
            <Reveal className="photo-section">
                <PhotoBg src="/images/bg2.jpeg" position="center 55%"
                    overlay="linear-gradient(180deg, rgba(5,12,28,0.95) 0%, rgba(5,12,28,0.72) 50%, rgba(5,12,28,0.9) 100%)" />
                <div className="photo-content max-w-3xl mx-auto px-6 text-center" style={{ paddingTop: '7rem', paddingBottom: '7rem' }}>
                    <p className="sans" style={{ ...eyebrow, marginBottom: '1rem' }}>What I do</p>
                    <h2 className="font-bold" style={{ fontSize: 'clamp(1.9rem,3.8vw,2.75rem)', color: 'white', lineHeight: 1.2, marginBottom: '1.5rem' }}>
                        Data you can trust, on systems that stay up.
                    </h2>
                    <p style={{ fontSize: '1.1rem', lineHeight: 1.85, color: 'var(--off-white)', marginBottom: '3.5rem' }}>
                        Whether the question is how a lake changes over a decade or whether a video call gets through a home router, the job is the same: collect the data carefully, store it safely, and make it usable for the people who depend on it.
                    </p>
                    <div className="sans" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2.5rem', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                        {[R, T].map((t) => {
                            const Icon = t.Icon;
                            return (
                                <Link key={t.path} to={t.path} className="glow-link"
                                    style={{ '--c': t.color, '--g': t.glow, '--rest': 'rgba(226,232,240,0.7)', display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <Icon size={20} strokeWidth={1.4} /> {t.label} →
                                </Link>
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
                        { label: 'Email',    href: 'mailto:aden@hws.edu' },
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

            <Ambient />
        </div>
    );
}
