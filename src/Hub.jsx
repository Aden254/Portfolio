import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SiteStyles } from './components/site/SiteKit';
import { TRACKS } from './components/site/tracks';

export default function Hub() {
    useEffect(() => { document.title = 'Daudi Aden'; }, []);

    return (
        <div className="site-root" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '4rem 1.25rem',
            background: 'radial-gradient(ellipse 70% 55% at 50% 40%, #0b1730 0%, #050c1c 70%)',
        }}>
            <SiteStyles />

            <h1 className="font-bold text-white" style={{ fontSize: 'clamp(2.75rem, 8vw, 5.75rem)', lineHeight: 1, letterSpacing: '-0.01em', textAlign: 'center', marginBottom: '1.25rem' }}>
                Daudi Aden
            </h1>
            <p className="sans" style={{ fontSize: 'clamp(0.78rem, 2vw, 0.92rem)', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.7)', textAlign: 'center', lineHeight: 1.9 }}>
                Computer Science &amp; Psychology
                <br />
                Data Manager &amp; Analyst · Finger Lakes Institute
            </p>

            <nav aria-label="Choose a portfolio" style={{
                display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
                gap: 'clamp(3rem, 12vw, 9rem)',
                margin: 'clamp(4rem, 10vh, 6.5rem) 0',
            }}>
                {[TRACKS.research, TRACKS.tech].map((t) => {
                    const Icon = t.Icon;
                    return (
                        <Link key={t.path} to={t.path} className="glow-link"
                            style={{ '--c': t.color, '--g': t.glow, '--rest': 'rgba(226,232,240,0.55)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.4rem', width: '270px', textAlign: 'center' }}>
                            <Icon size={76} strokeWidth={1} />
                            <span style={{ fontSize: 'clamp(1.3rem, 2.6vw, 1.7rem)', fontWeight: 700, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                                {t.label}
                            </span>
                            <span className="sans" style={{ fontSize: '0.72rem', letterSpacing: '0.04em', color: 'rgba(100,116,139,0.8)', textShadow: 'none', lineHeight: 1.6 }}>
                                {t.blurb}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            <div className="sans" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.75rem', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                {[
                    { label: 'Research Statement', to: '/research' },
                    { label: 'GitHub',   href: 'https://github.com/Aden254' },
                    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/daudi-aden/' },
                    { label: 'Email',    href: 'mailto:daudiaden4@gmail.com' },
                ].map(({ label, to, href }) => {
                    const style = { '--c': '#e2e8f0', '--g': 'rgba(226,232,240,0.3)', '--rest': 'rgba(100,116,139,0.75)' };
                    return to
                        ? <Link key={label} to={to} className="glow-link" style={style}>{label}</Link>
                        : <a key={label} href={href} className="glow-link" style={style}
                            target={href.startsWith('mailto') ? undefined : '_blank'} rel="noopener noreferrer">{label}</a>;
                })}
            </div>
        </div>
    );
}
