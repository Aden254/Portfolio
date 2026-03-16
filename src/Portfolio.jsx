import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Github } from 'lucide-react';

function Portfolio() {
    const [selectedProject, setSelectedProject] = useState(null);
    const [visibleSections, setVisibleSections] = useState({});

    const sectionRefs = {
        hero: useRef(null),
        featured: useRef(null),
        projects: useRef(null),
        skills: useRef(null),
        about: useRef(null),
        contact: useRef(null)
    };

    useEffect(() => {
        const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -100px 0px' };
        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setVisibleSections(prev => ({ ...prev, [entry.target.dataset.section]: true }));
                }
            });
        };
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        Object.values(sectionRefs).forEach(ref => { if (ref.current) observer.observe(ref.current); });
        return () => observer.disconnect();
    }, []);

    // Color map — each project type gets its own accent
    const typeColors = {
        'Full-Stack Development': { bg: 'rgba(14,165,233,0.12)', border: 'rgba(14,165,233,0.4)', text: '#38bdf8' },
        'Data Visualization':     { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.4)', text: '#fbbf24' },
        'Scientific Visualization':{ bg: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.4)', text: '#a78bfa' },
        'Environmental Science':  { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.4)', text: '#34d399' },
        'GIS & Data Engineering': { bg: 'rgba(14,165,233,0.12)', border: 'rgba(14,165,233,0.5)', text: '#0ea5e9' },
    };

    const getTypeStyle = (type) => typeColors[type] || { bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.4)', text: '#94a3b8' };

    const projects = [
        {
            id: 'maritime-dashboard',
            type: 'GIS & Data Engineering',
            year: '2026',
            title: 'Maritime Intelligence Dashboard',
            description: 'Full-stack geospatial vessel tracking platform powered by PostGIS and real AIS data. Features live map rendering with MapLibre GL, spatial queries across a PostgreSQL/PostGIS database, and a REST API deployed on Railway.',
            tech: ['React', 'MapLibre GL', 'PostGIS', 'Node.js', 'Express', 'Supabase', 'Railway', 'Vercel'],
            demo: null,
            github: 'https://github.com/Aden254/maritime-frontend',
            external: 'https://maritime-frontend-lake.vercel.app',
            featured: true,
            insights: [
                'Spatial queries using PostGIS ST_Distance and geography types',
                'Real vessel data ingested and served via REST API on Railway',
                'MapLibre GL for WebGL-accelerated map rendering in the browser',
                'Supabase PostgreSQL with PostGIS extension as spatial data store',
                'Diagnosed and resolved full deployment pipeline across Vercel + Railway + Supabase'
            ]
        },
        {
            id: 'healthhub-manager',
            type: 'Full-Stack Development',
            year: '2024',
            title: 'HealthHub Manager',
            description: 'Enterprise healthcare management system with JWT authentication, role-based access control, and automated patient allocation. Features intelligent workload balancing, database triggers for automation, and complete audit trail.',
            tech: ['React', 'Node.js', 'Express', 'MySQL', 'JWT', 'Railway', 'Vercel'],
            demo: '/healthhub',
            github: 'https://github.com/Aden254/healthhub-backend',
            external: null,
            featured: true,
            insights: [
                'Automated patient-to-doctor assignment with workload balancing',
                'Role-based access control (Doctor/Nurse/Admin)',
                'MySQL stored procedures with OUT parameters',
                'Database triggers for real-time metric updates',
                'Complete audit trail for compliance tracking'
            ]
        },
        {
            id: 1,
            title: 'The Housing Crisis: A Data Story',
            type: 'Data Visualization',
            description: 'Comprehensive infographic analyzing American household spending patterns from 2013–2023, revealing how housing costs have made the 50/30/20 budgeting rule mathematically impossible for most families.',
            image: '/images/housing-crisis-infographic.png',
            tech: ['Data Analysis', 'Visualization', 'Storytelling'],
            insights: [
                'Housing costs rose to 32.4% of household budgets by 2023',
                'Analyzed 10 years of BLS Consumer Expenditure Survey data',
                'Created multi-layered visualizations showing geographic and income disparities',
                'Demonstrated structural economic burden through data storytelling'
            ],
            year: '2024',
            featured: true
        },
        {
            id: 2,
            title: 'NeuroTrace Web',
            type: 'Full-Stack Development',
            description: 'Browser-based neural annotation tool with smart propagation and 15-color coding system for neuroscience research. Features automatic resize functionality for tracking 3D structures.',
            demo: '/neurotrace',
            github: 'https://github.com/yourusername/neurotrace-web',
            tech: ['React', 'Canvas API', 'JavaScript'],
            year: '2025',
            featured: true
        },
        {
            id: 'neuroverse-3d',
            type: 'Scientific Visualization',
            year: '2024',
            title: 'NeuroVerse 3D',
            description: 'Interactive 3D brain surface reconstruction from MRI slices. Features real-time mesh generation, horizontal slice stacking with nearest-neighbor connections, and multi-format export (JSON/CSV/OBJ).',
            tech: ['React', 'Three.js', 'WebGL', 'Canvas API', 'Medical Imaging'],
            demo: '/mri-tracer',
            github: null,
            external: null
        },
        {
            id: 'seneca-lake',
            type: 'Environmental Science',
            year: '2024',
            title: 'Seneca Lake Monitoring',
            description: 'Real-time monitoring platform displaying live data from a remote buoy on Seneca Lake. Features water quality metrics (temperature, pH, dissolved oxygen) and meteorological data visualization.',
            tech: ['R', 'Shiny', 'shinyapps.io', 'Data Visualization', 'Real-Time Data'],
            demo: null,
            github: null,
            external: 'https://flihws.shinyapps.io/SenecaBuoy/'
        }
    ];

    const featuredProjects = projects.filter(p => p.featured);

    const skills = [
        {
            category: 'Data Analysis',
            accent: '#0ea5e9',
            items: [
                { name: 'Statistical Analysis', level: 90 },
                { name: 'Python (Pandas, NumPy)', level: 85 },
                { name: 'SQL & Database Querying', level: 88 },
                { name: 'GIS & Spatial Analysis (PostGIS)', level: 75 },
                { name: 'Excel & Spreadsheet Modeling', level: 92 },
            ]
        },
        {
            category: 'Visualization Tools',
            accent: '#f59e0b',
            items: [
                { name: 'Data Visualization (D3, Recharts)', level: 82 },
                { name: 'Tableau & Power BI', level: 78 },
                { name: 'Matplotlib & Seaborn', level: 85 },
                { name: 'MapLibre GL / Deck.gl', level: 72 },
                { name: 'Information Design', level: 80 },
            ]
        },
        {
            category: 'Development',
            accent: '#10b981',
            items: [
                { name: 'React & JavaScript', level: 88 },
                { name: 'Node.js & Express', level: 80 },
                { name: 'Git & Version Control', level: 90 },
                { name: 'Full-Stack Deployment', level: 78 },
                { name: 'Canvas API & WebGL', level: 70 },
            ]
        }
    ];

    return (
        <div className="min-h-screen" style={{ fontFamily: "'Old Standard TT', serif" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }

        :root {
          --navy-dark:    #0f172a;
          --slate-dark:   #1e293b;
          --slate-medium: #334155;
          --slate-light:  #475569;
          --blue-gray:    #64748b;
          --gray-light:   #94a3b8;
          --off-white:    #e2e8f0;
          --white:        #f8fafc;

          /* Accent layer — the new additions */
          --teal:    #0ea5e9;
          --gold:    #f59e0b;
          --emerald: #10b981;
          --violet:  #7c3aed;
        }

        .section-fade {
          opacity: 0; transform: translateY(30px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        .section-fade.visible { opacity: 1; transform: translateY(0); }

        .gradient-transition-bottom { position: relative; }
        .gradient-transition-bottom::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0;
          height: 100px;
          background: linear-gradient(to bottom, transparent, var(--next-color));
          pointer-events: none;
        }

        .project-image { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .project-image:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(14,165,233,0.25); }

        a { transition: all 0.3s ease; }
        section { transition: background-color 1s ease; }

        .skill-bar-track {
          height: 4px; background: rgba(255,255,255,0.1);
          border-radius: 2px; overflow: hidden; margin-top: 6px;
        }
        .skill-bar-fill {
          height: 100%; border-radius: 2px;
          transition: width 1.2s ease-out;
        }

        .live-dot {
          display: inline-block; width: 7px; height: 7px;
          background: var(--emerald); border-radius: 50%;
          margin-right: 6px;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .teal-link { color: var(--teal) !important; }
        .teal-link:hover { color: #38bdf8 !important; }

        .card-hover {
          transition: border-color 0.3s ease, transform 0.3s ease;
        }
        .card-hover:hover {
          border-color: rgba(14,165,233,0.5) !important;
          transform: translateY(-4px);
        }
      `}</style>

            {/* ── HEADER ── */}
            <header
                className="border-b gradient-transition-bottom relative overflow-hidden"
                style={{
                    backgroundColor: 'var(--navy-dark)',
                    borderColor: 'rgba(100,116,139,0.2)',
                    '--next-color': 'var(--slate-dark)',
                }}
            >
                <div
                    className="absolute top-0 right-0 h-full w-1/3 bg-no-repeat bg-right bg-cover pointer-events-none"
                    style={{
                        backgroundImage: `url('/images/seneca-lake.jpg')`,
                        opacity: 0.85,
                        maskImage: 'linear-gradient(to left, rgba(0,0,0,0.8), rgba(0,0,0,0))',
                        WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.8), rgba(0,0,0,0))',
                    }}
                />

                <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-start md:items-center gap-10">
                    <div className="flex-1">
                        <p className="text-sm font-semibold tracking-widest uppercase mb-4"
                            style={{ color: 'var(--teal)' }}>
                            Portfolio
                        </p>
                        <h1 className="text-5xl md:text-6xl font-bold mb-3 text-white">
                            Daudi Aden
                        </h1>
                        <p className="text-2xl md:text-3xl font-normal mb-5"
                            style={{ color: 'var(--gray-light)' }}>
                            Data Analyst, Researcher & Developer
                        </p>
                        <p className="text-lg md:text-xl leading-relaxed max-w-xl"
                            style={{ color: 'var(--blue-gray)' }}>
                            Transforming complex data into actionable insights — from Finger Lakes water quality
                            monitoring to full-stack healthcare systems and 3D brain visualization.
                        </p>
                        <div className="flex flex-wrap gap-3 mt-8">
                            {[
                                { label: 'Data Analysis',   color: 'var(--teal)' },
                                { label: 'Full-Stack Dev',  color: 'var(--emerald)' },
                                { label: 'Scientific Viz',  color: 'var(--violet)' },
                                { label: 'GIS & Research',  color: 'var(--gold)' },
                            ].map(({ label, color }) => (
                                <span key={label}
                                    className="px-3 py-1 text-xs font-semibold tracking-wide"
                                    style={{
                                        border: `1px solid ${color}`,
                                        color: color,
                                        backgroundColor: 'rgba(255,255,255,0.04)'
                                    }}>
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex-shrink-0">
                        <img
                            src="/images/daud-profile.jpg"
                            alt="Daudi Aden"
                            style={{
                                width: '220px', height: '260px',
                                objectFit: 'cover', objectPosition: 'center top',
                                display: 'block',
                                maskImage: 'radial-gradient(ellipse 85% 90% at 50% 45%, black 40%, transparent 100%)',
                                WebkitMaskImage: 'radial-gradient(ellipse 85% 90% at 50% 45%, black 40%, transparent 100%)',
                            }}
                        />
                    </div>
                </div>
            </header>

            {/* ── FEATURED WORK ── */}
            <section
                ref={sectionRefs.featured}
                data-section="featured"
                className={`py-20 gradient-transition-bottom section-fade ${visibleSections.featured ? 'visible' : ''}`}
                style={{ backgroundColor: 'var(--slate-dark)', '--next-color': 'var(--slate-medium)' }}
            >
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl md:text-5xl font-bold mb-16 pb-6"
                        style={{ color: 'var(--white)', borderBottom: '2px solid rgba(100,116,139,0.3)' }}>
                        Featured Work
                    </h2>

                    {featuredProjects.map((project, index) => {
                        const typeStyle = getTypeStyle(project.type);
                        return (
                            <div key={project.id}
                                className={`mb-16 ${index > 0 ? 'pt-16' : ''}`}
                                style={index > 0 ? { borderTop: '1px solid rgba(100,116,139,0.2)' } : {}}>

                                <div className="mb-8">
                                    <div className="flex items-center gap-4 mb-4">
                                        {/* Color-coded type badge */}
                                        <span className="px-4 py-2 text-sm font-semibold"
                                            style={{
                                                border: `1px solid ${typeStyle.border}`,
                                                color: typeStyle.text,
                                                backgroundColor: typeStyle.bg
                                            }}>
                                            {project.type}
                                        </span>
                                        {/* Gold year badge */}
                                        <span className="px-3 py-1 text-xs font-bold tracking-widest"
                                            style={{
                                                color: 'var(--gold)',
                                                border: '1px solid rgba(245,158,11,0.3)',
                                                backgroundColor: 'rgba(245,158,11,0.08)'
                                            }}>
                                            {project.year}
                                        </span>
                                        {/* Live dot for external projects */}
                                        {project.external && (
                                            <span style={{ color: 'var(--emerald)', fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}>
                                                <span className="live-dot" />
                                                Live
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-3xl md:text-4xl font-bold mb-6"
                                        style={{ color: 'var(--white)' }}>
                                        {project.title}
                                    </h3>
                                    <p className="text-lg md:text-xl leading-relaxed max-w-4xl"
                                        style={{ color: 'var(--gray-light)' }}>
                                        {project.description}
                                    </p>
                                </div>

                                {project.image && (
                                    <div className="mb-8">
                                        <div className="project-image cursor-pointer overflow-hidden"
                                            style={{ border: `3px solid ${typeStyle.border}`, backgroundColor: 'var(--white)' }}
                                            onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}>
                                            <img src={project.image} alt={project.title} className="w-full h-auto"
                                                style={{
                                                    maxHeight: selectedProject === project.id ? 'none' : '600px',
                                                    objectFit: selectedProject === project.id ? 'contain' : 'cover'
                                                }} />
                                        </div>
                                        <p className="text-sm mt-3 text-center" style={{ color: 'var(--blue-gray)' }}>
                                            {selectedProject === project.id ? 'Click to collapse' : 'Click to view full size'}
                                        </p>
                                    </div>
                                )}

                                {project.insights && (
                                    <div className="mb-8 p-8"
                                        style={{
                                            backgroundColor: 'rgba(30,41,59,0.6)',
                                            border: `1px solid ${typeStyle.border}`,
                                            borderLeft: `4px solid ${typeStyle.text}`
                                        }}>
                                        <h4 className="text-xl md:text-2xl font-bold mb-6"
                                            style={{ color: 'var(--off-white)' }}>
                                            Key Insights & Methodology
                                        </h4>
                                        <ul className="space-y-3">
                                            {project.insights.map((insight, idx) => (
                                                <li key={idx} className="flex items-start gap-4 text-base md:text-lg"
                                                    style={{ color: 'var(--gray-light)' }}>
                                                    <span style={{ color: typeStyle.text, marginTop: '2px', flexShrink: 0 }}>→</span>
                                                    <span>{insight}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex flex-wrap gap-3">
                                        {project.tech.map(tech => (
                                            <span key={tech} className="px-4 py-2 text-sm font-semibold"
                                                style={{
                                                    backgroundColor: 'rgba(51,65,85,0.6)',
                                                    border: '1px solid rgba(100,116,139,0.3)',
                                                    color: 'var(--off-white)'
                                                }}>
                                                {tech}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex gap-4 ml-auto">
                                        {project.demo && (
                                            <Link to={project.demo}
                                                className="flex items-center gap-2 px-6 py-3 font-semibold"
                                                style={{ backgroundColor: 'var(--teal)', color: 'white' }}>
                                                <ExternalLink size={18} /> Live Demo
                                            </Link>
                                        )}
                                        {project.external && (
                                            <a href={project.external} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-6 py-3 font-semibold"
                                                style={{ backgroundColor: 'var(--teal)', color: 'white' }}>
                                                <ExternalLink size={18} /> View Live
                                            </a>
                                        )}
                                        {project.github && (
                                            <a href={project.github} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-6 py-3 font-semibold"
                                                style={{ border: '2px solid rgba(148,163,184,0.5)', color: 'var(--off-white)' }}>
                                                <Github size={18} /> GitHub
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── ALL PROJECTS ── */}
            <section
                ref={sectionRefs.projects}
                data-section="projects"
                className={`py-20 gradient-transition-bottom section-fade ${visibleSections.projects ? 'visible' : ''}`}
                style={{ backgroundColor: 'var(--slate-medium)', '--next-color': 'var(--slate-light)' }}
            >
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl md:text-5xl font-bold mb-16 pb-6"
                        style={{ color: 'var(--white)', borderBottom: '2px solid rgba(148,163,184,0.3)' }}>
                        All Projects
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map(project => {
                            const typeStyle = getTypeStyle(project.type);
                            return (
                                <div key={project.id}
                                    className="p-6 card-hover"
                                    style={{
                                        border: '1px solid rgba(148,163,184,0.3)',
                                        backgroundColor: 'rgba(30,41,59,0.4)',
                                        borderTop: `3px solid ${typeStyle.text}`
                                    }}>

                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-xs uppercase tracking-wider font-semibold"
                                            style={{ color: typeStyle.text }}>
                                            {project.type}
                                        </span>
                                        <span style={{ color: 'rgba(148,163,184,0.4)' }}>·</span>
                                        <span className="text-xs" style={{ color: 'var(--gold)' }}>
                                            {project.year}
                                        </span>
                                        {project.external && (
                                            <>
                                                <span style={{ color: 'rgba(148,163,184,0.4)' }}>·</span>
                                                <span style={{ color: 'var(--emerald)', fontSize: '0.7rem', display: 'flex', alignItems: 'center' }}>
                                                    <span className="live-dot" style={{ width: '5px', height: '5px' }} />
                                                    Live
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--white)' }}>
                                        {project.title}
                                    </h3>

                                    <p className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--gray-light)' }}>
                                        {project.description.slice(0, 150)}...
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-5">
                                        {project.tech.slice(0, 3).map(tech => (
                                            <span key={tech} className="px-3 py-1 text-xs"
                                                style={{
                                                    backgroundColor: 'rgba(51,65,85,0.6)',
                                                    border: '1px solid rgba(100,116,139,0.3)',
                                                    color: 'var(--off-white)'
                                                }}>
                                                {tech}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex gap-4 text-sm">
                                        {project.demo && (
                                            <Link to={project.demo} className="teal-link">View →</Link>
                                        )}
                                        {project.external && (
                                            <a href={project.external} target="_blank" rel="noopener noreferrer"
                                                className="teal-link">
                                                View Live →
                                            </a>
                                        )}
                                        {project.github && (
                                            <a href={project.github} target="_blank" rel="noopener noreferrer"
                                                className="teal-link">
                                                GitHub →
                                            </a>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── SKILLS ── */}
            <section
                ref={sectionRefs.skills}
                data-section="skills"
                className={`py-20 gradient-transition-bottom section-fade ${visibleSections.skills ? 'visible' : ''}`}
                style={{ backgroundColor: 'var(--slate-light)', '--next-color': 'var(--blue-gray)' }}
            >
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl md:text-5xl font-bold mb-16 pb-6"
                        style={{ color: 'var(--white)', borderBottom: '2px solid rgba(148,163,184,0.4)' }}>
                        Skills & Expertise
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {skills.map(({ category, accent, items }) => (
                            <div key={category}>
                                <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--off-white)' }}>
                                    {category}
                                </h3>
                                {/* Colored underline per category */}
                                <div style={{ width: '40px', height: '3px', backgroundColor: accent, marginBottom: '1.5rem' }} />
                                <ul className="space-y-4">
                                    {items.map(({ name, level }) => (
                                        <li key={name}>
                                            <div className="flex justify-between items-center">
                                                <span className="text-base" style={{ color: 'var(--gray-light)' }}>{name}</span>
                                                <span className="text-xs font-bold" style={{ color: accent }}>{level}%</span>
                                            </div>
                                            <div className="skill-bar-track">
                                                <div className="skill-bar-fill"
                                                    style={{
                                                        width: visibleSections.skills ? `${level}%` : '0%',
                                                        backgroundColor: accent
                                                    }} />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── ABOUT ── */}
            <section
                ref={sectionRefs.about}
                data-section="about"
                className={`py-20 gradient-transition-bottom section-fade ${visibleSections.about ? 'visible' : ''}`}
                style={{ backgroundColor: 'var(--off-white)', '--next-color': 'var(--white)' }}
            >
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl md:text-5xl font-bold mb-16 pb-6"
                        style={{ color: 'var(--navy-dark)', borderBottom: '2px solid rgba(51,65,85,0.2)' }}>
                        About
                    </h2>

                    <div className="flex flex-col lg:flex-row gap-16 items-start">
                        <div className="flex-1">
                            <p className="text-xl md:text-2xl leading-relaxed mb-6"
                                style={{ color: 'var(--slate-medium)' }}>
                                I'm <strong>Daudi Aden</strong> — a data analyst, researcher and developer with a background
                                in environmental science and computer science. I got my start doing real field
                                research at the <strong>Finger Lakes Institute</strong>, collecting and analyzing
                                water quality data from Seneca Lake's remote monitoring buoy.
                            </p>
                            <p className="text-xl md:text-2xl leading-relaxed mb-6"
                                style={{ color: 'var(--slate-medium)' }}>
                                That field work taught me something lectures couldn't: data only matters when
                                it reaches the right people in the right form. That conviction drives everything
                                I build — from real-time R/Shiny dashboards for lake monitoring, to 3D brain
                                visualization tools for neuroscience research, to full-stack healthcare systems.
                            </p>
                            <p className="text-xl md:text-2xl leading-relaxed"
                                style={{ color: 'var(--slate-medium)' }}>
                                I'm currently seeking roles where I can apply both analytical and engineering
                                skills to problems with real-world impact. Equally comfortable in a terminal,
                                a spreadsheet, or out on a research boat.
                            </p>

                            <div className="mt-10 grid grid-cols-2 gap-6">
                                {[
                                    { label: 'Based in',    value: 'Geneva, NY',                  accent: 'var(--teal)' },
                                    { label: 'Institution', value: 'Finger Lakes Institute',       accent: 'var(--emerald)' },
                                    { label: 'Focus',       value: 'Data × Development',           accent: 'var(--gold)' },
                                    { label: 'Open to',     value: 'Full-time & Research roles',   accent: 'var(--violet)' },
                                ].map(({ label, value, accent }) => (
                                    <div key={label} style={{ borderLeft: `3px solid ${accent}`, paddingLeft: '12px' }}>
                                        <p className="text-sm font-semibold tracking-widest uppercase mb-1"
                                            style={{ color: 'var(--blue-gray)' }}>
                                            {label}
                                        </p>
                                        <p className="text-lg font-semibold" style={{ color: 'var(--navy-dark)' }}>
                                            {value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex-shrink-0 flex flex-col gap-4" style={{ width: '280px' }}>
                            <div style={{
                                overflow: 'hidden',
                                border: '2px solid rgba(51,65,85,0.2)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                borderTop: '3px solid var(--teal)'
                            }}>
                                <img src="/images/daudi-research-1.jpg" alt="Daudi examining a sensor"
                                    style={{ width: '100%', height: '220px', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
                            </div>
                            <div style={{
                                overflow: 'hidden',
                                border: '2px solid rgba(51,65,85,0.2)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                borderTop: '3px solid var(--emerald)'
                            }}>
                                <img src="/images/daudi-research-2.jpg" alt="Daudi in the lab"
                                    style={{ width: '100%', height: '220px', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
                            </div>
                            <p className="text-sm text-center" style={{ color: 'var(--slate-light)' }}>
                                Field & lab work at the Finger Lakes Institute
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CONTACT ── */}
            <section
                ref={sectionRefs.contact}
                data-section="contact"
                className={`section-fade ${visibleSections.contact ? 'visible' : ''}`}
                style={{ backgroundColor: 'var(--white)', position: 'relative', overflow: 'hidden', minHeight: '520px' }}
            >
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '75%', height: '100%', zIndex: 0
                }}>
                    <img src="/images/seneca-lake.jpg" alt="Seneca Lake at sunrise"
                        style={{
                            width: '100%', height: '100%', objectFit: 'cover',
                            objectPosition: 'center 30%', display: 'block',
                            maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
                            WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
                        }} />
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to right, transparent 30%, var(--white) 85%)'
                    }} />
                </div>

                <p style={{
                    position: 'absolute', bottom: '1.5rem', left: '2rem', zIndex: 2,
                    color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem',
                    letterSpacing: '0.08em', textTransform: 'uppercase'
                }}>
                    Seneca Lake — Geneva, NY
                </p>

                <div style={{
                    position: 'relative', zIndex: 1, marginLeft: 'auto',
                    width: '38%', minWidth: '320px', padding: '5rem 3rem 5rem 1rem'
                }}>
                    <h2 className="text-4xl md:text-5xl font-bold mb-12 pb-6"
                        style={{ color: 'var(--navy-dark)', borderBottom: '2px solid rgba(51,65,85,0.2)' }}>
                        Contact
                    </h2>

                    <div className="space-y-6 text-xl md:text-2xl">
                        {[
                            { label: 'Email',    href: 'mailto:daudiaden4@gmail.com', text: 'daudiaden4@gmail.com', accent: 'var(--teal)' },
                            { label: 'GitHub',   href: 'https://github.com/Aden254',  text: 'Aden254',             accent: 'var(--emerald)' },
                            { label: 'LinkedIn', href: 'https://www.linkedin.com/in/daudi-aden/', text: 'daudi-aden', accent: 'var(--violet)' },
                        ].map(({ label, href, text, accent }) => (
                            <p key={label}>
                                <span className="block text-sm font-semibold tracking-widest uppercase mb-1"
                                    style={{ color: 'var(--blue-gray)' }}>
                                    {label}
                                </span>
                                <a href={href} target={href.startsWith('mailto') ? undefined : '_blank'}
                                    rel="noopener noreferrer" style={{ color: accent }}>
                                    {text}
                                </a>
                            </p>
                        ))}
                    </div>

                    <p className="mt-10 text-base leading-relaxed"
                        style={{
                            color: 'var(--slate-light)',
                            borderTop: '1px solid rgba(51,65,85,0.1)',
                            paddingTop: '1.5rem'
                        }}>
                        Based in Geneva, NY — open to remote, hybrid, or local opportunities.
                        Always happy to talk data, research, or interesting problems.
                    </p>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="py-10"
                style={{ backgroundColor: 'var(--navy-dark)', borderTop: '1px solid rgba(14,165,233,0.2)' }}>
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p style={{ color: 'var(--blue-gray)' }}>
                        © 2025 Daudi Aden · Built with React & deployed on Vercel
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default Portfolio;