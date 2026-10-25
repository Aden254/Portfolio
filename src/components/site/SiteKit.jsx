import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Github } from 'lucide-react';
import { TRACKS, useInView } from './tracks';

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

        .btn-solid { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; font-weight: 700; color: #050c1c; transition: filter 0.2s ease; }
        .btn-solid:hover { filter: brightness(1.12); }
        .btn-ghost { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; font-weight: 700; border: 2px solid rgba(148,163,184,0.4); color: var(--off-white); transition: border-color 0.2s ease; }
        .btn-ghost:hover { border-color: rgba(226,232,240,0.8); }
      `}</style>
    );
}

export const Glass = ({ children, style = {}, className = '' }) => (
    <div className={className} style={{
        background: 'rgba(6,14,32,0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '2px',
        ...style,
    }}>
        {children}
    </div>
);

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
            <footer className="sans" style={{ background: 'rgba(3,7,18,0.98)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '2rem 0' }}>
                <div className="max-w-7xl mx-auto px-6" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <p style={{ color: 'var(--blue-gray)', fontSize: '0.8rem' }}>© 2026 Daudi Aden</p>
                    <Link to="/" style={{ color: 'var(--blue-gray)', fontSize: '0.8rem' }}>← Back to start</Link>
                </div>
            </footer>
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

export function Chapter({ number, eyebrow, title, intro, accent, bg, bgPosition = 'center', children }) {
    const content = (
        <div className="photo-content max-w-7xl mx-auto px-6 py-24">
            <p className="sans" style={{ color: accent, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.9rem' }}>
                {number} — {eyebrow}
            </p>
            <h2 className="font-bold" style={{ fontSize: 'clamp(2rem,4vw,3.25rem)', color: 'white', lineHeight: 1.12, marginBottom: '1.25rem', maxWidth: '860px' }}>
                {title}
            </h2>
            <p style={{ fontSize: '1.15rem', lineHeight: 1.8, color: 'var(--gray-light)', maxWidth: '720px', paddingBottom: '3rem', marginBottom: '3.5rem', borderBottom: `1px solid ${accent}40` }}>
                {intro}
            </p>
            {children}
        </div>
    );

    return (
        <Reveal className={bg ? 'photo-section' : ''} style={bg ? undefined : { background: '#050c1c' }}>
            {bg && <PhotoBg src={bg} overlay="rgba(5,10,24,0.82)" position={bgPosition} />}
            {content}
        </Reveal>
    );
}

export function ProjectFeature({ project, accent, first }) {
    return (
        <div style={first ? { marginBottom: '4rem' } : { marginBottom: '4rem', paddingTop: '4rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="sans" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                <span style={{ padding: '0.35rem 0.9rem', fontSize: '0.75rem', fontWeight: 700, border: `1px solid ${accent}80`, color: accent, background: `${accent}1f` }}>
                    {project.type}
                </span>
                <span style={{ padding: '0.3rem 0.75rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--gold)', border: '1px solid rgba(245,158,11,0.35)', background: 'rgba(245,158,11,0.1)' }}>
                    {project.year}
                </span>
                {project.inProgress && (
                    <span style={{ padding: '0.3rem 0.75rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: '#fb923c', border: '1px solid rgba(251,146,60,0.4)', background: 'rgba(251,146,60,0.1)' }}>
                        IN PROGRESS
                    </span>
                )}
                {project.external && (
                    <span style={{ color: 'var(--emerald)', fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}>
                        <span className="live-dot" /> Live
                    </span>
                )}
            </div>

            <h3 className="font-bold" style={{ fontSize: 'clamp(1.6rem,3vw,2.5rem)', color: 'white', marginBottom: '1rem' }}>
                {project.title}
            </h3>
            <p style={{ fontSize: '1.1rem', lineHeight: 1.75, color: 'var(--gray-light)', maxWidth: '760px', marginBottom: '2rem' }}>
                {project.description}
            </p>

            {project.insights && (
                <Glass style={{ marginBottom: '2rem', padding: '2rem', borderLeft: `4px solid ${accent}` }}>
                    <h4 className="font-bold" style={{ fontSize: '1.1rem', color: 'var(--off-white)', marginBottom: '1.25rem' }}>
                        {project.insightsTitle || 'How it works'}
                    </h4>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyle: 'none' }}>
                        {project.insights.map((insight) => (
                            <li key={insight} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', color: 'var(--gray-light)', fontSize: '1rem', lineHeight: 1.65 }}>
                                <span style={{ color: accent, marginTop: '2px', flexShrink: 0 }}>→</span>
                                {insight}
                            </li>
                        ))}
                    </ul>
                </Glass>
            )}

            <div className="sans" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {project.tech.map((t) => (
                        <span key={t} style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem', fontWeight: 600, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--off-white)' }}>
                            {t}
                        </span>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
                    {project.demo && (
                        <Link to={project.demo} className="btn-solid" style={{ background: accent }}>
                            <ExternalLink size={16} /> Live Demo
                        </Link>
                    )}
                    {project.external && (
                        <a href={project.external} target="_blank" rel="noopener noreferrer" className="btn-solid" style={{ background: accent }}>
                            <ExternalLink size={16} /> View Live
                        </a>
                    )}
                    {project.github && (
                        <a href={project.github} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                            <Github size={16} /> GitHub
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

export function SkillGrid({ title, skills }) {
    const [ref, inView] = useInView();
    return (
        <section ref={ref} className={`section-fade ${inView ? 'visible' : ''}`}
            style={{ background: 'linear-gradient(180deg, #050c1c 0%, #131e2f 10%, #131e2f 90%, #050c1c 100%)' }}>
            <div className="max-w-7xl mx-auto px-6 py-24">
                <h2 className="font-bold" style={{ fontSize: 'clamp(2rem,4vw,3.25rem)', color: 'white', borderBottom: '2px solid rgba(148,163,184,0.2)', paddingBottom: '1.25rem', marginBottom: '3.5rem' }}>
                    {title}
                </h2>
                <div className="grid md:grid-cols-2" style={{ gap: '2rem' }}>
                    {skills.map(({ category, accent, items }) => (
                        <Glass key={category} style={{ padding: '2rem' }}>
                            <h3 className="font-bold" style={{ fontSize: '1.35rem', color: 'var(--off-white)', marginBottom: '0.5rem' }}>{category}</h3>
                            <div style={{ width: '32px', height: '3px', background: accent, borderRadius: '2px', marginBottom: '1.5rem' }} />
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
                        </Glass>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function InfoGrid({ items }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 sans" style={{ gap: '1.5rem', marginTop: '2.5rem' }}>
            {items.map(({ label, value, accent }) => (
                <div key={label} style={{ borderLeft: `3px solid ${accent}`, paddingLeft: '12px' }}>
                    <p style={{ fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--blue-gray)', marginBottom: '4px' }}>{label}</p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white' }}>{value}</p>
                </div>
            ))}
        </div>
    );
}

export function CrossTrack({ to, eyebrow, title, body }) {
    const t = TRACKS[to];
    const Icon = t.Icon;
    return (
        <Reveal style={{ background: '#050c1c', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="max-w-4xl mx-auto px-6 text-center" style={{ paddingTop: '7rem', paddingBottom: '7rem' }}>
                <p className="sans" style={{ color: 'rgba(100,116,139,0.85)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                    {eyebrow}
                </p>
                <h2 className="font-bold" style={{ fontSize: 'clamp(1.75rem,3.5vw,2.75rem)', color: 'white', lineHeight: 1.2, marginBottom: '1.25rem' }}>
                    {title}
                </h2>
                <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--gray-light)', maxWidth: '620px', margin: '0 auto 3rem' }}>
                    {body}
                </p>
                <Link to={t.path} className="glow-link"
                    style={{ '--c': t.color, '--g': t.glow, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <Icon size={52} strokeWidth={1.2} />
                    <span style={{ fontSize: 'clamp(1.35rem,2.5vw,1.85rem)', fontWeight: 700 }}>{t.label} →</span>
                </Link>
            </div>
        </Reveal>
    );
}

export function Contact({ accent, bg, headline, line }) {
    return (
        <Reveal className="photo-section">
            <PhotoBg src={bg} overlay="rgba(4,10,24,0.74)" position="center 30%" />
            <div className="photo-content max-w-7xl mx-auto px-6 py-24">
                <div className="flex flex-col lg:flex-row" style={{ gap: '4rem', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <p className="sans" style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: accent, marginBottom: '1rem' }}>
                            Geneva, NY
                        </p>
                        <h2 className="font-bold" style={{ fontSize: 'clamp(2.25rem,5vw,4rem)', color: 'white', lineHeight: 1.1, marginBottom: '1.5rem' }}>
                            {headline}
                        </h2>
                        <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--gray-light)', maxWidth: '420px' }}>
                            {line}
                        </p>
                    </div>
                    <Glass style={{ padding: '2.5rem', minWidth: 'min(300px, 100%)' }}>
                        <div className="sans" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                            {[
                                { label: 'Email',    href: 'mailto:daudiaden4@gmail.com',             text: 'daudiaden4@gmail.com' },
                                { label: 'GitHub',   href: 'https://github.com/Aden254',              text: 'github.com/Aden254' },
                                { label: 'LinkedIn', href: 'https://www.linkedin.com/in/daudi-aden/', text: 'linkedin.com/in/daudi-aden' },
                            ].map(({ label, href, text }) => (
                                <div key={label}>
                                    <p style={{ fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--blue-gray)', marginBottom: '4px' }}>{label}</p>
                                    <a href={href} target={href.startsWith('mailto') ? undefined : '_blank'} rel="noopener noreferrer"
                                        style={{ fontSize: '1rem', fontWeight: 700, color: accent, wordBreak: 'break-word' }}>
                                        {text}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </Glass>
                </div>
            </div>
        </Reveal>
    );
}
