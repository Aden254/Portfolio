import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TRACKS, useInView } from './tracks';
import Ambient from './Ambient';

export function SiteStyles() {
    return (
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { background: #050c1c; }

        :root {
          --teal:    #0ea5e9;
          --gold:    #f59e0b;
          --emerald: #10b981;
          --violet:  #7c3aed;
          --gray-light: #94a3b8;
          --off-white:  #e2e8f0;
          --blue-gray:  #64748b;
          --navy-deep:  #050c1c;
        }

        .site-root { font-family: 'Old Standard TT', serif; background: #050c1c; min-height: 100vh; }
        .sans { font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; }

        .photo-section { position: relative; overflow: hidden; }
        .photo-content { position: relative; z-index: 2; }
        @media (max-width: 768px) {
          .photo-bg-inner { background-attachment: scroll !important; }
        }

        .section-fade {
          opacity: 0; transform: translateY(28px);
          transition: opacity 0.9s ease-out, transform 0.9s ease-out;
        }
        .section-fade.visible { opacity: 1; transform: translateY(0); }

        .skill-bar-track { height: 3px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; margin-top: 7px; }
        .skill-bar-fill { height: 100%; border-radius: 2px; transition: width 1.4s cubic-bezier(0.25,0.46,0.45,0.94); }

        .live-dot {
          display: inline-block; width: 7px; height: 7px;
          background: var(--emerald); border-radius: 50%;
          margin-right: 5px; animation: blink 2s infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        a { text-decoration: none; }
        @media (max-width: 640px) { .hide-sm { display: none; } }

        .glow-link {
          color: var(--rest, rgba(226,232,240,0.62));
          transition: color 0.3s ease, text-shadow 0.3s ease;
        }
        .glow-link svg { transition: filter 0.3s ease, transform 0.3s ease; }
        .glow-link:hover, .glow-link:focus-visible {
          color: var(--c);
          text-shadow: 0 0 18px var(--g), 0 0 44px var(--g);
        }
        .glow-link:hover svg, .glow-link:focus-visible svg { filter: drop-shadow(0 0 12px var(--g)); }
        .glow-link:focus-visible { outline: 1px solid var(--c); outline-offset: 8px; }

      `}</style>
    );
}

export const PhotoBg = ({ src, overlay = 'rgba(6,14,32,0.70)', position = 'center' }) => (
    <>
        <div className="photo-bg-inner" style={{
            position: 'absolute', inset: 0, zIndex: 0,
            backgroundImage: `url(${src})`,
            backgroundSize: 'cover',
            backgroundPosition: position,
            backgroundAttachment: 'fixed',
        }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: overlay }} />
    </>
);

export function Reveal({ className = '', style, children }) {
    const [ref, inView] = useInView();
    return (
        <section ref={ref} className={`section-fade ${inView ? 'visible' : ''} ${className}`} style={style}>
            {children}
        </section>
    );
}

function TrackHeader({ track }) {
    const self = TRACKS[track];
    const other = TRACKS[track === 'research' ? 'tech' : 'research'];
    const OtherIcon = other.Icon;

    return (
        <div className="sans" style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
            height: '60px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 clamp(1rem, 4vw, 2.5rem)',
            background: 'rgba(5,12,28,0.72)',
            backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
            <Link to="/" className="glow-link"
                style={{ '--c': '#fff', '--g': 'rgba(255,255,255,0.35)', '--rest': 'rgba(226,232,240,0.85)', display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                <span style={{ fontFamily: "'Old Standard TT', serif", fontWeight: 700, fontSize: '1.1rem' }}>Daudi Aden</span>
                <span className="hide-sm" style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: self.color }}>
                    {self.label}
                </span>
            </Link>

            <Link to={other.path} className="glow-link" aria-label={`Switch to ${other.label}`}
                style={{ '--c': other.color, '--g': other.glow, display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                <span className="hide-sm" style={{ color: 'rgba(100,116,139,0.8)' }}>Switch to</span>
                <OtherIcon size={18} strokeWidth={1.6} />
                <span>{other.short}</span>
            </Link>
        </div>
    );
}

export function TrackShell({ track, title, children }) {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        document.title = title;
    }, [title]);

    return (
        <div className="site-root">
            <SiteStyles />
            <TrackHeader track={track} />
            {children}
            <footer className="sans" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '2.5rem 1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                <TextLink to="/">← Back to start</TextLink>
                <p style={{ fontSize: '0.75rem', color: 'var(--blue-gray)' }}>© 2026 Daudi Aden · Geneva, NY</p>
            </footer>
            <Ambient />
        </div>
    );
}

export function Hero({ accent, bg, bgPosition, eyebrow, headline, children, photo }) {
    return (
        <header className="photo-section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
            <PhotoBg src={bg} overlay="rgba(4,10,24,0.66)" position={bgPosition} />
            <div className="photo-content max-w-7xl mx-auto px-6 w-full" style={{ paddingTop: '8rem', paddingBottom: '6rem' }}>
                <div className="flex flex-col md:flex-row items-start md:items-center" style={{ gap: '3rem' }}>
                    <div className="flex-1">
                        <p className="sans" style={{ color: accent, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                            {eyebrow}
                        </p>
                        <h1 className="font-bold text-white" style={{ fontSize: 'clamp(2.25rem, 5.5vw, 4.25rem)', lineHeight: 1.08, marginBottom: '1.75rem', maxWidth: '820px' }}>
                            {headline}
                        </h1>
                        {children}
                    </div>
                    {photo && (
                        <img src={photo} alt="Daudi Aden" style={{
                            width: '210px', height: '260px', objectFit: 'cover', objectPosition: 'center top', flexShrink: 0,
                            maskImage: 'radial-gradient(ellipse 85% 90% at 50% 45%, black 40%, transparent 100%)',
                            WebkitMaskImage: 'radial-gradient(ellipse 85% 90% at 50% 45%, black 40%, transparent 100%)',
                        }} />
                    )}
                </div>
            </div>
        </header>
    );
}

const EYEBROW = { fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.7)' };
const H2 = { fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 700, color: 'white', lineHeight: 1.15 };
const DIVIDER = '1px solid rgba(255,255,255,0.08)';
const SECTION_TOP = '1px solid rgba(255,255,255,0.05)';

export function TextLink({ to, href, accent = '#e2e8f0', children }) {
    const style = {
        '--c': accent, '--g': `${accent}66`, '--rest': 'rgba(148,163,184,0.9)',
        fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', whiteSpace: 'nowrap',
    };
    if (to) return <Link to={to} className="glow-link sans" style={style}>{children}</Link>;
    return (
        <a href={href} target={href.startsWith('mailto') ? undefined : '_blank'} rel="noopener noreferrer" className="glow-link sans" style={style}>
            {children}
        </a>
    );
}

export function Section({ eyebrow, title, intro, children }) {
    return (
        <Reveal style={{ borderTop: SECTION_TOP }}>
            <div className="max-w-5xl mx-auto px-6" style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
                <p className="sans" style={{ ...EYEBROW, marginBottom: '1rem' }}>{eyebrow}</p>
                <h2 style={{ ...H2, marginBottom: intro ? '1.25rem' : '3rem', maxWidth: '820px' }}>{title}</h2>
                {intro && (
                    <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--gray-light)', maxWidth: '720px', marginBottom: '3rem' }}>{intro}</p>
                )}
                {children}
            </div>
        </Reveal>
    );
}

export function Chapter({ number, eyebrow, title, intro, accent, children }) {
    return (
        <Section eyebrow={<><span style={{ color: accent }}>{number}</span> — {eyebrow}</>} title={title} intro={intro}>
            <ul style={{ listStyle: 'none', borderTop: DIVIDER }}>{children}</ul>
        </Section>
    );
}

export function ProjectRow({ year, children }) {
    return (
        <li className="grid md:grid-cols-[80px_1fr]" style={{ columnGap: '2rem', rowGap: '0.5rem', alignItems: 'baseline', padding: '2.75rem 0', borderBottom: DIVIDER }}>
            <p className="sans" style={{ ...EYEBROW, color: 'rgba(148,163,184,0.85)' }}>{year}</p>
            <div style={{ minWidth: 0 }}>{children}</div>
        </li>
    );
}

export function ProjectFeature({ project, accent }) {
    return (
        <ProjectRow year={project.year}>
            <p className="sans" style={{ ...EYEBROW, fontSize: '0.62rem', color: accent, marginBottom: '0.6rem' }}>{project.type}</p>
            <h3 className="font-bold" style={{ fontSize: 'clamp(1.35rem,2.6vw,1.85rem)', color: 'white', lineHeight: 1.25, marginBottom: '0.75rem' }}>
                {project.title}
                {project.inProgress && (
                    <span className="sans" style={{ marginLeft: '0.75rem', verticalAlign: 'middle', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', color: '#fb923c' }}>IN PROGRESS</span>
                )}
            </h3>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--gray-light)', maxWidth: '720px', marginBottom: project.insights ? '1.5rem' : '1rem' }}>
                {project.description}
            </p>

            {project.insights && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <p className="sans" style={{ ...EYEBROW, fontSize: '0.62rem', marginBottom: '0.85rem' }}>{project.insightsTitle || 'How it works'}</p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', listStyle: 'none', maxWidth: '720px' }}>
                        {project.insights.map((insight) => (
                            <li key={insight} style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start', color: 'var(--gray-light)', fontSize: '0.98rem', lineHeight: 1.65 }}>
                                <span style={{ color: accent, flexShrink: 0 }}>→</span>
                                {insight}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <p className="sans" style={{ fontSize: '0.72rem', letterSpacing: '0.06em', color: 'rgba(100,116,139,0.95)', marginBottom: '1.1rem' }}>
                {project.tech.join(' · ')}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.75rem' }}>
                {project.demo && <TextLink to={project.demo} accent={accent}>Live demo →</TextLink>}
                {project.external && <TextLink href={project.external} accent={accent}>View live →</TextLink>}
                {project.github && <TextLink href={project.github} accent={accent}>GitHub →</TextLink>}
            </div>
        </ProjectRow>
    );
}

export function SkillGrid({ title, skills }) {
    const [ref, inView] = useInView();
    return (
        <section ref={ref} className={`section-fade ${inView ? 'visible' : ''}`} style={{ borderTop: SECTION_TOP }}>
            <div className="max-w-5xl mx-auto px-6" style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
                <p className="sans" style={{ ...EYEBROW, marginBottom: '1rem' }}>Skills</p>
                <h2 style={{ ...H2, marginBottom: '3rem' }}>{title}</h2>
                <div className="grid md:grid-cols-2" style={{ gap: '3.5rem', borderTop: DIVIDER, paddingTop: '2.5rem' }}>
                    {skills.map(({ category, accent, items }) => (
                        <div key={category}>
                            <h3 className="font-bold" style={{ fontSize: '1.3rem', color: 'white', marginBottom: '0.5rem' }}>{category}</h3>
                            <div style={{ width: '32px', height: '2px', background: accent, marginBottom: '1.5rem' }} />
                            <ul className="sans" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', listStyle: 'none' }}>
                                {items.map(({ name, level }) => (
                                    <li key={name}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                                            <span style={{ color: 'var(--gray-light)', fontSize: '0.9rem' }}>{name}</span>
                                            <span style={{ color: accent, fontSize: '0.72rem', fontWeight: 700 }}>{level}%</span>
                                        </div>
                                        <div className="skill-bar-track">
                                            <div className="skill-bar-fill" style={{ width: inView ? `${level}%` : '0%', background: accent }} />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function InfoGrid({ items }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 sans" style={{ gap: '1.5rem', marginTop: '2.5rem', paddingTop: '2rem', borderTop: DIVIDER }}>
            {items.map(({ label, value, accent }) => (
                <div key={label} style={{ borderLeft: `2px solid ${accent}`, paddingLeft: '12px' }}>
                    <p style={{ ...EYEBROW, fontSize: '0.62rem', marginBottom: '4px' }}>{label}</p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white' }}>{value}</p>
                </div>
            ))}
        </div>
    );
}

export function Contact({ accent, bg, headline, line }) {
    return (
        <Reveal className="photo-section" style={bg ? undefined : { borderTop: SECTION_TOP }}>
            {bg && (
                <PhotoBg src={bg} position="center 40%"
                    overlay="linear-gradient(180deg, rgba(5,12,28,0.95) 0%, rgba(5,12,28,0.72) 50%, rgba(5,12,28,0.9) 100%)" />
            )}
            <div className="photo-content max-w-3xl mx-auto px-6 text-center" style={{ paddingTop: '7rem', paddingBottom: '7rem' }}>
                <p className="sans" style={{ ...EYEBROW, marginBottom: '1rem' }}>Contact</p>
                <h2 style={{ ...H2, fontSize: 'clamp(2rem,4.5vw,3.25rem)', marginBottom: '1.5rem' }}>{headline}</h2>
                <p style={{ fontSize: '1.1rem', lineHeight: 1.85, color: 'var(--off-white)', marginBottom: '3rem' }}>{line}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem' }}>
                    <TextLink href="mailto:aden@hws.edu" accent={accent}>aden@hws.edu</TextLink>
                    <TextLink href="https://github.com/Aden254" accent={accent}>GitHub</TextLink>
                    <TextLink href="https://www.linkedin.com/in/daudi-aden/" accent={accent}>LinkedIn</TextLink>
                </div>
            </div>
        </Reveal>
    );
}
