import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Github } from 'lucide-react';

// ─────────────────────────────────────────────
// PHOTO SETUP — place these in  public/images/
//  bg1.jpg → IMG_1016  (Seneca Lake + chairs, dawn)
//  bg2.jpg → IMG_1017  (fiery sunset)
//  bg3.jpg → IMG_1181  (gothic building, daytime)
//  bg4.jpg → IMG_1239  (gothic at night, stained glass)
//  bg5.jpg → IMG_1244  (autumn gothic, warm light)
// ─────────────────────────────────────────────

function Portfolio() {
    const [selectedProject, setSelectedProject] = useState(null);
    const [visibleSections, setVisibleSections] = useState({});

    const sectionRefs = {
        hero: useRef(null), featured: useRef(null), projects: useRef(null),
        skills: useRef(null), about: useRef(null), contact: useRef(null)
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => entries.forEach(e => {
                if (e.isIntersecting)
                    setVisibleSections(prev => ({ ...prev, [e.target.dataset.section]: true }));
            }),
            { threshold: 0.08, rootMargin: '0px 0px -80px 0px' }
        );
        Object.values(sectionRefs).forEach(r => { if (r.current) observer.observe(r.current); });
        return () => observer.disconnect();
    }, []);

    const typeColors = {
        'Full-Stack Development':    { bg: 'rgba(14,165,233,0.18)',  border: 'rgba(14,165,233,0.5)',  text: '#38bdf8' },
        'Data Visualization':        { bg: 'rgba(245,158,11,0.18)',  border: 'rgba(245,158,11,0.5)',  text: '#fbbf24' },
        'Scientific Visualization':  { bg: 'rgba(124,58,237,0.18)', border: 'rgba(124,58,237,0.5)',  text: '#a78bfa' },
        'Environmental Science':     { bg: 'rgba(16,185,129,0.18)', border: 'rgba(16,185,129,0.5)',  text: '#34d399' },
        'GIS & Data Engineering':    { bg: 'rgba(14,165,233,0.18)', border: 'rgba(14,165,233,0.55)', text: '#0ea5e9' },
    };
    const ts = (type) => typeColors[type] || { bg: 'rgba(100,116,139,0.18)', border: 'rgba(100,116,139,0.5)', text: '#94a3b8' };

    const projects = [
        {
            id: 'maritime-dashboard', type: 'GIS & Data Engineering', year: '2026',
            title: 'Maritime Intelligence Dashboard',
            description: 'Full-stack geospatial vessel tracking platform powered by PostGIS and real AIS data. Features live map rendering with MapLibre GL, spatial queries across a PostgreSQL/PostGIS database, and a REST API deployed on Railway.',
            tech: ['React', 'MapLibre GL', 'PostGIS', 'Node.js', 'Express', 'Supabase', 'Railway', 'Vercel'],
            demo: null, github: 'https://github.com/Aden254/maritime-frontend',
            external: 'https://maritime-frontend-lake.vercel.app', featured: true,
            insights: [
                'Spatial queries using PostGIS ST_Distance and geography types',
                'Real vessel data ingested and served via REST API on Railway',
                'MapLibre GL for WebGL-accelerated map rendering in the browser',
                'Supabase PostgreSQL with PostGIS extension as spatial data store',
                'Diagnosed and resolved full deployment pipeline across Vercel + Railway + Supabase'
            ]
        },
        {
            id: 'healthhub-manager', type: 'Full-Stack Development', year: '2024',
            title: 'HealthHub Manager',
            description: 'Enterprise healthcare management system with JWT authentication, role-based access control, and automated patient allocation. Features intelligent workload balancing, database triggers, and complete audit trail.',
            tech: ['React', 'Node.js', 'Express', 'MySQL', 'JWT', 'Railway', 'Vercel'],
            demo: '/healthhub', github: 'https://github.com/Aden254/healthhub-backend',
            external: null, featured: true,
            insights: [
                'Automated patient-to-doctor assignment with workload balancing',
                'Role-based access control (Doctor/Nurse/Admin)',
                'MySQL stored procedures with OUT parameters',
                'Database triggers for real-time metric updates',
                'Complete audit trail for compliance tracking'
            ]
        },
        {
            id: 1, title: 'The Housing Crisis: A Data Story',
            type: 'Data Visualization', year: '2024',
            description: 'Comprehensive infographic analyzing American household spending patterns from 2013–2023, revealing how housing costs have made the 50/30/20 budgeting rule mathematically impossible for most families.',
            image: '/images/housing-crisis-infographic.png',
            tech: ['Data Analysis', 'Visualization', 'Storytelling'], featured: true,
            insights: [
                'Housing costs rose to 32.4% of household budgets by 2023',
                'Analyzed 10 years of BLS Consumer Expenditure Survey data',
                'Created multi-layered visualizations showing geographic and income disparities',
                'Demonstrated structural economic burden through data storytelling'
            ]
        },
        {
            id: 2, title: 'NeuroTrace Web', type: 'Full-Stack Development', year: '2025',
            description: 'Browser-based neural annotation tool with smart propagation and 15-color coding system for neuroscience research. Features automatic resize for tracking 3D structures.',
            demo: '/neurotrace', github: 'https://github.com/yourusername/neurotrace-web',
            tech: ['React', 'Canvas API', 'JavaScript'], featured: true
        },
        {
            id: 'neuroverse-3d', type: 'Scientific Visualization', year: '2024',
            title: 'NeuroVerse 3D',
            description: 'Interactive 3D brain surface reconstruction from MRI slices. Real-time mesh generation, slice stacking with nearest-neighbor connections, and multi-format export (JSON/CSV/OBJ).',
            tech: ['React', 'Three.js', 'WebGL', 'Canvas API', 'Medical Imaging'],
            demo: '/mri-tracer', github: null, external: null
        },
        {
            id: 'seneca-lake', type: 'Environmental Science', year: '2024',
            title: 'Seneca Lake Monitoring',
            description: 'Real-time monitoring platform displaying live data from a remote buoy on Seneca Lake. Water quality metrics (temperature, pH, dissolved oxygen) and meteorological data visualization.',
            tech: ['R', 'Shiny', 'shinyapps.io', 'Data Visualization', 'Real-Time Data'],
            demo: null, github: null, external: 'https://flihws.shinyapps.io/SenecaBuoy/'
        }
    ];
    const featuredProjects = projects.filter(p => p.featured);

    const skills = [
        { category: 'Data Analysis', accent: '#0ea5e9', items: [
            { name: 'Statistical Analysis', level: 90 },
            { name: 'Python (Pandas, NumPy)', level: 85 },
            { name: 'SQL & Database Querying', level: 88 },
            { name: 'GIS & Spatial Analysis (PostGIS)', level: 75 },
            { name: 'Excel & Spreadsheet Modeling', level: 92 },
        ]},
        { category: 'Visualization Tools', accent: '#f59e0b', items: [
            { name: 'Data Visualization (D3, Recharts)', level: 82 },
            { name: 'Tableau & Power BI', level: 78 },
            { name: 'Matplotlib & Seaborn', level: 85 },
            { name: 'MapLibre GL / Deck.gl', level: 72 },
            { name: 'Information Design', level: 80 },
        ]},
        { category: 'Development', accent: '#10b981', items: [
            { name: 'React & JavaScript', level: 88 },
            { name: 'Node.js & Express', level: 80 },
            { name: 'Git & Version Control', level: 90 },
            { name: 'Full-Stack Deployment', level: 78 },
            { name: 'Canvas API & WebGL', level: 70 },
        ]}
    ];

    // ── Photo background layer + dark overlay
    const PhotoBg = ({ src, overlay = 'rgba(6,14,32,0.70)', position = 'center' }) => (
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

    // ── Frosted glass panel for content readability
    const Glass = ({ children, style = {}, className = '' }) => (
        <div className={className} style={{
            background: 'rgba(6,14,32,0.65)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '2px',
            ...style
        }}>
            {children}
        </div>
    );

    return (
        <div className="min-h-screen" style={{ fontFamily: "'Old Standard TT', serif" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }

        :root {
          --teal:    #0ea5e9;
          --gold:    #f59e0b;
          --emerald: #10b981;
          --violet:  #7c3aed;
          --gray-light: #94a3b8;
          --off-white:  #e2e8f0;
          --blue-gray:  #64748b;
        }

        .photo-section { position: relative; overflow: hidden; }
        .photo-content { position: relative; z-index: 2; }

        /* iOS: fixed bg doesn't work well — fall back to scroll */
        @media (max-width: 768px) {
          .photo-bg-inner { background-attachment: scroll !important; }
        }

        .section-fade {
          opacity: 0; transform: translateY(28px);
          transition: opacity 0.9s ease-out, transform 0.9s ease-out;
        }
        .section-fade.visible { opacity: 1; transform: translateY(0); }

        .skill-bar-track {
          height: 3px; background: rgba(255,255,255,0.1);
          border-radius: 2px; overflow: hidden; margin-top: 7px;
        }
        .skill-bar-fill {
          height: 100%; border-radius: 2px;
          transition: width 1.4s cubic-bezier(0.25,0.46,0.45,0.94);
        }

        .live-dot {
          display: inline-block; width: 7px; height: 7px;
          background: var(--emerald); border-radius: 50%;
          margin-right: 5px; animation: blink 2s infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        a { transition: color 0.25s ease; }
        .teal-link { color: var(--teal) !important; }
        .teal-link:hover { color: #7dd3fc !important; }

        .glass-card {
          transition: border-color 0.3s ease, transform 0.3s ease;
        }
        .glass-card:hover {
          border-color: rgba(14,165,233,0.45) !important;
          transform: translateY(-5px);
        }
      `}</style>

            {/* ══ HERO  →  bg1.jpg (lake + chairs, dawn) ══ */}
            <header
                ref={sectionRefs.hero}
                data-section="hero"
                className="photo-section"
                style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}
            >
                <PhotoBg src="/images/bg1.jpg" overlay="rgba(4,10,24,0.62)" position="center 45%" />

                <div className="photo-content max-w-7xl mx-auto px-6 py-24 w-full">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-12">
                        <div className="flex-1">
                            <p style={{ color: 'var(--teal)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                                Portfolio
                            </p>
                            <h1 className="text-white font-bold" style={{ fontSize: 'clamp(3rem,7vw,5.5rem)', lineHeight: 1.05, marginBottom: '1rem', textShadow: '0 2px 24px rgba(0,0,0,0.6)' }}>
                                Daudi Aden
                            </h1>
                            <p style={{ fontSize: 'clamp(1.2rem,2.5vw,1.75rem)', color: 'var(--gray-light)', marginBottom: '1.5rem' }}>
                                Data Analyst, Researcher &amp; Developer
                            </p>

                            <Glass style={{ padding: '1.25rem 1.5rem', maxWidth: '560px', marginBottom: '2rem' }}>
                                <p style={{ color: 'var(--off-white)', fontSize: '1.05rem', lineHeight: 1.75 }}>
                                    Transforming complex data into actionable insights — from Finger Lakes water quality
                                    monitoring to full-stack healthcare systems and 3D brain visualization.
                                </p>
                            </Glass>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                {[
                                    { label: 'Data Analysis',  color: 'var(--teal)' },
                                    { label: 'Full-Stack Dev', color: 'var(--emerald)' },
                                    { label: 'Scientific Viz', color: 'var(--violet)' },
                                    { label: 'GIS & Research', color: 'var(--gold)' },
                                ].map(({ label, color }) => (
                                    <span key={label} style={{
                                        padding: '0.4rem 1rem', fontSize: '0.7rem', fontWeight: 700,
                                        letterSpacing: '0.12em', textTransform: 'uppercase',
                                        border: `1px solid ${color}`, color, background: 'rgba(0,0,0,0.35)'
                                    }}>
                                        {label}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div style={{ flexShrink: 0 }}>
                            <img
                                src="/images/daud-profile.jpg"
                                alt="Daudi Aden"
                                style={{
                                    width: '210px', height: '260px', objectFit: 'cover',
                                    objectPosition: 'center top', display: 'block',
                                    maskImage: 'radial-gradient(ellipse 85% 90% at 50% 45%, black 40%, transparent 100%)',
                                    WebkitMaskImage: 'radial-gradient(ellipse 85% 90% at 50% 45%, black 40%, transparent 100%)',
                                    filter: 'drop-shadow(0 0 28px rgba(14,165,233,0.3))'
                                }}
                            />
                        </div>
                    </div>

                    {/* Scroll indicator */}
                    <div style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
                        <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>scroll</p>
                        <div style={{ width: '1px', height: '36px', background: 'linear-gradient(to bottom, rgba(14,165,233,0.7), transparent)', margin: '0 auto' }} />
                    </div>
                </div>
            </header>

            {/* ══ FEATURED WORK  →  bg2.jpg (fiery sunset) ══ */}
            <section
                ref={sectionRefs.featured}
                data-section="featured"
                className={`photo-section section-fade ${visibleSections.featured ? 'visible' : ''}`}
            >
                <PhotoBg src="/images/bg2.jpg" overlay="rgba(6,10,24,0.76)" position="center 65%" />

                <div className="photo-content max-w-7xl mx-auto px-6 py-24">
                    <h2 className="font-bold" style={{ fontSize: 'clamp(2rem,4vw,3.25rem)', color: 'white', borderBottom: '2px solid rgba(14,165,233,0.3)', paddingBottom: '1.25rem', marginBottom: '4rem' }}>
                        Featured Work
                    </h2>

                    {featuredProjects.map((project, index) => {
                        const style = ts(project.type);
                        return (
                            <div key={project.id}
                                style={{ marginBottom: '4rem', ...(index > 0 ? { paddingTop: '4rem', borderTop: '1px solid rgba(255,255,255,0.07)' } : {}) }}>

                                <div style={{ marginBottom: '2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                                        <span style={{ padding: '0.4rem 1rem', fontSize: '0.82rem', fontWeight: 700, border: `1px solid ${style.border}`, color: style.text, background: style.bg }}>
                                            {project.type}
                                        </span>
                                        <span style={{ padding: '0.3rem 0.75rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--gold)', border: '1px solid rgba(245,158,11,0.35)', background: 'rgba(245,158,11,0.1)' }}>
                                            {project.year}
                                        </span>
                                        {project.external && (
                                            <span style={{ color: 'var(--emerald)', fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}>
                                                <span className="live-dot" /> Live
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold" style={{ fontSize: 'clamp(1.75rem,3vw,2.75rem)', color: 'white', marginBottom: '1rem' }}>
                                        {project.title}
                                    </h3>
                                    <p style={{ fontSize: '1.1rem', lineHeight: 1.75, color: 'var(--gray-light)', maxWidth: '760px' }}>
                                        {project.description}
                                    </p>
                                </div>

                                {project.image && (
                                    <div style={{ marginBottom: '2rem' }}>
                                        <div style={{ border: `2px solid ${style.border}`, overflow: 'hidden', cursor: 'pointer' }}
                                            onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}>
                                            <img src={project.image} alt={project.title} style={{
                                                width: '100%', height: 'auto',
                                                maxHeight: selectedProject === project.id ? 'none' : '600px',
                                                objectFit: selectedProject === project.id ? 'contain' : 'cover',
                                                display: 'block'
                                            }} />
                                        </div>
                                        <p style={{ fontSize: '0.8rem', textAlign: 'center', marginTop: '0.75rem', color: 'var(--blue-gray)' }}>
                                            {selectedProject === project.id ? 'Click to collapse' : 'Click to view full size'}
                                        </p>
                                    </div>
                                )}

                                {project.insights && (
                                    <Glass style={{ marginBottom: '2rem', padding: '2rem', borderLeft: `4px solid ${style.text}` }}>
                                        <h4 className="font-bold" style={{ fontSize: '1.15rem', color: 'var(--off-white)', marginBottom: '1.25rem' }}>
                                            Key Insights &amp; Methodology
                                        </h4>
                                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {project.insights.map((insight, idx) => (
                                                <li key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', color: 'var(--gray-light)', fontSize: '1rem', lineHeight: 1.65 }}>
                                                    <span style={{ color: style.text, marginTop: '3px', flexShrink: 0 }}>→</span>
                                                    {insight}
                                                </li>
                                            ))}
                                        </ul>
                                    </Glass>
                                )}

                                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                                        {project.tech.map(t => (
                                            <span key={t} style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', fontWeight: 600, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--off-white)' }}>
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
                                        {project.demo && (
                                            <Link to={project.demo} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', fontWeight: 700, background: 'var(--teal)', color: 'white' }}>
                                                <ExternalLink size={16} /> Live Demo
                                            </Link>
                                        )}
                                        {project.external && (
                                            <a href={project.external} target="_blank" rel="noopener noreferrer"
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', fontWeight: 700, background: 'var(--teal)', color: 'white' }}>
                                                <ExternalLink size={16} /> View Live
                                            </a>
                                        )}
                                        {project.github && (
                                            <a href={project.github} target="_blank" rel="noopener noreferrer"
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', fontWeight: 700, border: '2px solid rgba(148,163,184,0.4)', color: 'var(--off-white)' }}>
                                                <Github size={16} /> GitHub
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ══ ALL PROJECTS  →  bg3.jpg (gothic building, daytime) ══ */}
            <section
                ref={sectionRefs.projects}
                data-section="projects"
                className={`photo-section section-fade ${visibleSections.projects ? 'visible' : ''}`}
            >
                <PhotoBg src="/images/bg3.jpg" overlay="rgba(4,10,26,0.80)" position="center top" />

                <div className="photo-content max-w-7xl mx-auto px-6 py-24">
                    <h2 className="font-bold" style={{ fontSize: 'clamp(2rem,4vw,3.25rem)', color: 'white', borderBottom: '2px solid rgba(148,163,184,0.2)', paddingBottom: '1.25rem', marginBottom: '4rem' }}>
                        All Projects
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3" style={{ gap: '1.5rem' }}>
                        {projects.map(project => {
                            const style = ts(project.type);
                            return (
                                <Glass key={project.id} className="glass-card"
                                    style={{ padding: '1.5rem', borderTop: `3px solid ${style.text}`, cursor: 'default' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: style.text }}>
                                            {project.type}
                                        </span>
                                        <span style={{ color: 'rgba(148,163,184,0.3)' }}>·</span>
                                        <span style={{ fontSize: '0.72rem', color: 'var(--gold)' }}>{project.year}</span>
                                        {project.external && (
                                            <>
                                                <span style={{ color: 'rgba(148,163,184,0.3)' }}>·</span>
                                                <span style={{ color: 'var(--emerald)', fontSize: '0.7rem', display: 'flex', alignItems: 'center' }}>
                                                    <span className="live-dot" style={{ width: '5px', height: '5px' }} /> Live
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <h3 className="font-bold" style={{ fontSize: '1.15rem', color: 'white', marginBottom: '0.75rem' }}>
                                        {project.title}
                                    </h3>
                                    <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--gray-light)', marginBottom: '1.25rem' }}>
                                        {project.description.slice(0, 150)}...
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                                        {project.tech.slice(0, 3).map(t => (
                                            <span key={t} style={{ padding: '0.25rem 0.75rem', fontSize: '0.72rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--off-white)' }}>
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
                                        {project.demo && <Link to={project.demo} className="teal-link">View →</Link>}
                                        {project.external && <a href={project.external} target="_blank" rel="noopener noreferrer" className="teal-link">View Live →</a>}
                                        {project.github && <a href={project.github} target="_blank" rel="noopener noreferrer" className="teal-link">GitHub →</a>}
                                    </div>
                                </Glass>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ══ SKILLS  →  bg4.jpg (gothic at night, stained glass) ══ */}
            <section
                ref={sectionRefs.skills}
                data-section="skills"
                className={`photo-section section-fade ${visibleSections.skills ? 'visible' : ''}`}
            >
                <PhotoBg src="/images/bg4.jpg" overlay="rgba(3,7,18,0.82)" position="center" />

                <div className="photo-content max-w-7xl mx-auto px-6 py-24">
                    <h2 className="font-bold" style={{ fontSize: 'clamp(2rem,4vw,3.25rem)', color: 'white', borderBottom: '2px solid rgba(148,163,184,0.2)', paddingBottom: '1.25rem', marginBottom: '4rem' }}>
                        Skills &amp; Expertise
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3" style={{ gap: '2rem' }}>
                        {skills.map(({ category, accent, items }) => (
                            <Glass key={category} style={{ padding: '2rem' }}>
                                <h3 className="font-bold" style={{ fontSize: '1.4rem', color: 'var(--off-white)', marginBottom: '0.5rem' }}>
                                    {category}
                                </h3>
                                <div style={{ width: '32px', height: '3px', background: accent, borderRadius: '2px', marginBottom: '1.5rem' }} />
                                <ul style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                                    {items.map(({ name, level }) => (
                                        <li key={name}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ color: 'var(--gray-light)', fontSize: '0.9rem' }}>{name}</span>
                                                <span style={{ color: accent, fontSize: '0.72rem', fontWeight: 700 }}>{level}%</span>
                                            </div>
                                            <div className="skill-bar-track">
                                                <div className="skill-bar-fill"
                                                    style={{ width: visibleSections.skills ? `${level}%` : '0%', background: accent }} />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </Glass>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ ABOUT  →  bg5.jpg (autumn gothic, warm light) ══ */}
            <section
                ref={sectionRefs.about}
                data-section="about"
                className={`photo-section section-fade ${visibleSections.about ? 'visible' : ''}`}
            >
                <PhotoBg src="/images/bg5.jpg" overlay="rgba(4,10,24,0.78)" position="center right" />

                <div className="photo-content max-w-7xl mx-auto px-6 py-24">
                    <h2 className="font-bold" style={{ fontSize: 'clamp(2rem,4vw,3.25rem)', color: 'white', borderBottom: '2px solid rgba(14,165,233,0.25)', paddingBottom: '1.25rem', marginBottom: '4rem' }}>
                        About
                    </h2>
                    <div className="flex flex-col lg:flex-row" style={{ gap: '3rem', alignItems: 'flex-start' }}>
                        <Glass style={{ flex: 1, padding: '2.5rem' }}>
                            <p style={{ fontSize: '1.1rem', lineHeight: 1.85, color: 'var(--off-white)', marginBottom: '1.5rem' }}>
                                I'm <strong style={{ color: 'white' }}>Daudi Aden</strong> — a data analyst, researcher and developer with a background in environmental science and computer science. I got my start doing real field research at the{' '}
                                <strong style={{ color: 'var(--teal)' }}>Finger Lakes Institute</strong>, collecting and analyzing water quality data from Seneca Lake's remote monitoring buoy.
                            </p>
                            <p style={{ fontSize: '1.1rem', lineHeight: 1.85, color: 'var(--off-white)', marginBottom: '1.5rem' }}>
                                That field work taught me something lectures couldn't: data only matters when it reaches the right people in the right form. That conviction drives everything I build — from real-time R/Shiny dashboards for lake monitoring, to 3D brain visualization tools, to full-stack healthcare systems.
                            </p>
                            <p style={{ fontSize: '1.1rem', lineHeight: 1.85, color: 'var(--off-white)' }}>
                                I'm currently seeking roles where I can apply both analytical and engineering skills to problems with real-world impact. Equally comfortable in a terminal, a spreadsheet, or out on a research boat.
                            </p>

                            <div className="grid grid-cols-2" style={{ gap: '1.5rem', marginTop: '2.5rem' }}>
                                {[
                                    { label: 'Based in',    value: 'Geneva, NY',              accent: 'var(--teal)' },
                                    { label: 'Institution', value: 'Finger Lakes Institute',   accent: 'var(--emerald)' },
                                    { label: 'Focus',       value: 'Data × Development',       accent: 'var(--gold)' },
                                    { label: 'Open to',     value: 'Full-time & Research',     accent: 'var(--violet)' },
                                ].map(({ label, value, accent }) => (
                                    <div key={label} style={{ borderLeft: `3px solid ${accent}`, paddingLeft: '12px' }}>
                                        <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--blue-gray)', marginBottom: '4px' }}>{label}</p>
                                        <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white' }}>{value}</p>
                                    </div>
                                ))}
                            </div>
                        </Glass>

                        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1rem', width: '250px' }}>
                            {[
                                { src: '/images/daudi-research-1.jpg', alt: 'Daudi at the buoy sensor', accent: 'var(--teal)' },
                                { src: '/images/daudi-research-2.jpg', alt: 'Daudi in the lab', accent: 'var(--emerald)' },
                            ].map(({ src, alt, accent }) => (
                                <div key={alt} style={{ overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', borderTop: `3px solid ${accent}` }}>
                                    <img src={src} alt={alt} style={{ width: '100%', height: '200px', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
                                </div>
                            ))}
                            <p style={{ fontSize: '0.75rem', textAlign: 'center', color: 'var(--blue-gray)' }}>
                                Field &amp; lab work at the Finger Lakes Institute
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ CONTACT  →  bg1.jpg (lake, full bleed) ══ */}
            <section
                ref={sectionRefs.contact}
                data-section="contact"
                className={`photo-section section-fade ${visibleSections.contact ? 'visible' : ''}`}
                style={{ minHeight: '480px' }}
            >
                <PhotoBg src="/images/bg1.jpg" overlay="rgba(4,10,24,0.72)" position="center 30%" />

                <div className="photo-content max-w-7xl mx-auto px-6 py-24">
                    <div className="flex flex-col lg:flex-row" style={{ gap: '4rem', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', marginBottom: '1rem' }}>
                                Geneva, NY — Seneca Lake
                            </p>
                            <h2 className="font-bold" style={{ fontSize: 'clamp(2.5rem,6vw,4.5rem)', color: 'white', lineHeight: 1.1, marginBottom: '1.5rem' }}>
                                Let's work<br />together.
                            </h2>
                            <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--gray-light)', maxWidth: '380px' }}>
                                Open to remote, hybrid, or local opportunities. Always happy to talk data, research, or interesting problems.
                            </p>
                        </div>

                        <Glass style={{ padding: '2.5rem', minWidth: '300px' }}>
                            <h3 className="font-bold" style={{ fontSize: '1.5rem', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem', marginBottom: '2rem' }}>
                                Contact
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                                {[
                                    { label: 'Email',    href: 'mailto:daudiaden4@gmail.com', text: 'daudiaden4@gmail.com', accent: 'var(--teal)' },
                                    { label: 'GitHub',   href: 'https://github.com/Aden254',  text: 'github.com/Aden254',   accent: 'var(--emerald)' },
                                    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/daudi-aden/', text: 'linkedin.com/in/daudi-aden', accent: 'var(--violet)' },
                                ].map(({ label, href, text, accent }) => (
                                    <div key={label}>
                                        <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--blue-gray)', marginBottom: '4px' }}>{label}</p>
                                        <a href={href}
                                            target={href.startsWith('mailto') ? undefined : '_blank'}
                                            rel="noopener noreferrer"
                                            style={{ fontSize: '1rem', fontWeight: 700, color: accent }}>
                                            {text}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </Glass>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer style={{ background: 'rgba(3,7,18,0.98)', borderTop: '1px solid rgba(14,165,233,0.15)', padding: '2rem 0' }}>
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p style={{ color: 'var(--blue-gray)', fontSize: '0.85rem' }}>
                        © 2025 Daudi Aden · Built with React & deployed on Vercel
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default Portfolio;