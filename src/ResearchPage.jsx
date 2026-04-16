import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// ─── ResearchPage ────────────────────────────────────────────────────────────
// Purpose: A faculty-facing research statement page linked in cold emails.
// Audience: Lab PIs, program coordinators, admissions committees.
// Design: Editorial, type-driven — matches the portfolio's Old Standard TT
//         aesthetic but feels like a research document, not a product page.
// ─────────────────────────────────────────────────────────────────────────────

const SECTIONS = [
    { id: 'origin',   label: 'Origin'     },
    { id: 'identity', label: 'Research'   },
    { id: 'methods',  label: 'Methods'    },
    { id: 'tools',    label: 'Tools'      },
    { id: 'arc',      label: 'Trajectory' },
];

function ResearchPage() {
    const [activeSection, setActiveSection] = useState('origin');
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 40);

            // Update active section based on scroll position
            const offsets = SECTIONS.map(s => {
                const el = document.getElementById(s.id);
                return el ? { id: s.id, top: el.getBoundingClientRect().top } : null;
            }).filter(Boolean);

            const current = offsets.filter(o => o.top <= 140).pop();
            if (current) setActiveSection(current.id);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div style={{
            fontFamily: "'Old Standard TT', serif",
            backgroundColor: '#0f172a',
            color: '#e2e8f0',
            minHeight: '100vh',
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&display=swap');

                :root {
                    --navy:      #0f172a;
                    --slate:     #1e293b;
                    --mid:       #334155;
                    --muted:     #64748b;
                    --ghost:     #94a3b8;
                    --offwhite:  #e2e8f0;
                    --white:     #f8fafc;
                    --accent:    #3b82f6;
                    --accent-dim: rgba(59,130,246,0.15);
                }

                html { scroll-behavior: smooth; }

                .nav-dot {
                    width: 6px; height: 6px;
                    border-radius: 50%;
                    background: var(--muted);
                    transition: background 0.3s, transform 0.3s;
                }
                .nav-dot.active {
                    background: var(--accent);
                    transform: scale(1.5);
                }

                .section-rule {
                    border: none;
                    border-top: 1px solid rgba(100,116,139,0.25);
                    margin: 0 0 3rem 0;
                }

                .label-tag {
                    display: inline-block;
                    font-size: 0.95rem;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                    color: var(--offwhite);
                    font-weight: 600;
                    border: 1px solid rgba(100,116,139,0.35);
                    padding: 0.25rem 0.75rem;
                    margin-bottom: 1.5rem;
                }

                .pull-quote {
                    border-left: 3px solid var(--accent);
                    padding: 0.5rem 0 0.5rem 1.75rem;
                    margin: 2.5rem 0;
                    font-style: italic;
                    font-size: 1.25rem;
                    line-height: 1.7;
                    color: var(--offwhite);
                }

                .tool-card {
                    border: 1px solid rgba(100,116,139,0.25);
                    padding: 1.5rem;
                    transition: border-color 0.25s, transform 0.25s;
                }
                .tool-card:hover {
                    border-color: rgba(59,130,246,0.5);
                    transform: translateY(-2px);
                }

                .method-pill {
                    display: inline-block;
                    background: rgba(51,65,85,0.6);
                    border: 1px solid rgba(100,116,139,0.3);
                    color: var(--offwhite);
                    font-size: 0.8rem;
                    padding: 0.3rem 0.9rem;
                    margin: 0.25rem;
                }

                .side-nav-link {
                    font-size: 0.72rem;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    color: var(--muted);
                    text-decoration: none;
                    transition: color 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                }
                .side-nav-link:hover,
                .side-nav-link.active { color: var(--offwhite); }

                .fade-in {
                    animation: fadeUp 0.7s ease-out both;
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(18px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                p { line-height: 1.85; }
            `}</style>

            {/* ── Top nav bar ── */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 50,
                backgroundColor: scrolled ? 'rgba(15,23,42,0.96)' : 'transparent',
                backdropFilter: scrolled ? 'blur(10px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(100,116,139,0.2)' : '1px solid transparent',
                transition: 'all 0.3s ease',
                padding: '1rem 2rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <Link to="/" style={{
                    color: 'var(--ghost)',
                    textDecoration: 'none',
                    fontSize: '0.78rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    transition: 'color 0.2s',
                }}
                    onMouseEnter={e => e.target.style.color = 'var(--offwhite)'}
                    onMouseLeave={e => e.target.style.color = 'var(--ghost)'}
                >
                    &larr;&nbsp; Portfolio
                </Link>

                <span style={{ color: 'var(--muted)', fontSize: '0.78rem', letterSpacing: '0.1em' }}>
                    Daudi A. Aden &nbsp;&middot;&nbsp; Research Statement
                </span>

                <a href="mailto:daudi.aden@hws.edu" style={{
                    color: 'var(--accent)',
                    textDecoration: 'none',
                    fontSize: '0.78rem',
                    letterSpacing: '0.08em',
                }}>
                    daudi.aden@hws.edu
                </a>
            </header>

            {/* ── Hero banner ── */}
            <div style={{
                position: 'relative',
                height: '220px',
                overflow: 'hidden',
            }}>
                <img src="/images/bg3.jpeg" alt=""
                    style={{ width:'100%', height:'100%',
                        objectFit:'cover', objectPosition:'center top',
                        opacity: 0.5,
                        filter: 'grayscale(20%) contrast(1.1)' }} />
                <div style={{
                    position:'absolute', inset:0,
                    background:
                        'linear-gradient(to bottom, rgba(15,23,42,0.3) 0%,' +
                        'rgba(15,23,42,1) 100%)',
                }} />
            </div>

            {/* ── Layout: Side nav + Main content ── */}
            <div style={{
                maxWidth: '1100px',
                margin: '0 auto',
                padding: '4rem 2rem',
                display: 'grid',
                gridTemplateColumns: '160px 1fr',
                gap: '4rem',
                alignItems: 'start',
            }}>

                {/* Side navigation — sticky, tracks active section */}
                <nav style={{
                    position: 'sticky',
                    top: '5rem',
                    paddingTop: '0.5rem',
                }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{
                            fontSize: '0.65rem',
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            color: 'var(--muted)',
                            marginBottom: '1.25rem',
                        }}>
                            Contents
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {SECTIONS.map(s => (
                                <a
                                    key={s.id}
                                    href={`#${s.id}`}
                                    className={`side-nav-link ${activeSection === s.id ? 'active' : ''}`}
                                >
                                    <span
                                        className={`nav-dot ${activeSection === s.id ? 'active' : ''}`}
                                        style={{ flexShrink: 0 }}
                                    />
                                    {s.label}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick facts panel */}
                    <div style={{
                        borderTop: '1px solid rgba(100,116,139,0.2)',
                        paddingTop: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.9rem',
                    }}>
                        {[
                            { label: 'Degree',   value: 'B.S. CS + B.A. Psych' },
                            { label: 'Minor',    value: 'Data Analytics'       },
                            { label: 'GPA',      value: '3.43'                 },
                            { label: 'Status',   value: 'F-1 · OPT Filed'      },
                            { label: 'GitHub',   value: 'Aden254'              },
                        ].map(({ label, value }) => (
                            <div key={label}>
                                <div style={{ fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.15rem' }}>
                                    {label}
                                </div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--ghost)' }}>
                                    {label === 'GitHub'
                                        ? <a href="https://github.com/Aden254" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>{value}</a>
                                        : value
                                    }
                                </div>
                            </div>
                        ))}
                    </div>
                </nav>

                {/* ── Main content ── */}
                <main>

                    {/* Page title block */}
                    <div className="fade-in" style={{ marginBottom: '4rem' }}>
                        <div className="label-tag">Research Statement</div>
                        <h1 style={{
                            fontSize: 'clamp(2rem, 4vw, 3rem)',
                            fontWeight: 700,
                            lineHeight: 1.15,
                            color: 'var(--white)',
                            marginBottom: '1rem',
                        }}>
                            Daudi A. Aden
                        </h1>
                        <p style={{
                            fontSize: '1.15rem',
                            color: 'var(--ghost)',
                            maxWidth: '540px',
                            lineHeight: 1.7,
                        }}>
                            Computational methods for studying how adversity, acute and chronic,
                            reshapes brain architecture and behavioral development across the lifespan.
                        </p>
                    </div>

                    {/* ─ SECTION 1: Origin ─ */}
                    <section id="origin" style={{ marginBottom: '5rem' }}>
                        <hr className="section-rule" />
                        <div className="label-tag">Origin</div>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--white)', marginBottom: '1.5rem' }}>
                            Why This Work
                        </h2>

                        <p style={{ color: 'var(--ghost)', marginBottom: '1.25rem' }}>
                            About 10 years ago, I watched my brother recover from a stroke. What I remember
                            most wasn't the hospital. It was the pegboard on the wall of the rehab gym:
                            pegs in holes, grip exercises, the slow, deliberate work of standing independently.
                            What I didn't have a name for yet was the process underneath: a brain being asked
                            to rebuild what it had lost, rerouting function through tissue that had never
                            carried it before.
                        </p>

                        <div className="pull-quote">
                            That image, of neural networks recompiling under duress, has never left me.
                            It crystallized a question I've spent the years since trying to learn how to answer.
                        </div>

                        <p style={{ color: 'var(--ghost)', marginBottom: '1.25rem' }}>
                            That question has broadened. Stroke is one kind of adversity, acute and visible.
                            But the brain reorganizes in response to chronic adversity too: early poverty,
                            disrupted caregiving, neighborhood stress. And often before anyone notices,
                            in the developmental windows where architecture is still being laid down. The
                            mechanisms are different, but the underlying question is the same: how does
                            the brain respond to threat, and what does that cost over time?
                        </p>

                        <p style={{ color: 'var(--ghost)' }}>
                            My double major in Computer Science and Psychology is not a hedge between two
                            career paths. It's a deliberate preparation for research that sits at the
                            intersection of neuroimaging methods and developmental science, because the
                            questions I want to ask require both.
                        </p>
                    </section>

                    {/* ─ SECTION 2: Research Identity ─ */}
                    <section id="identity" style={{ marginBottom: '5rem' }}>
                        <hr className="section-rule" />
                        <div className="label-tag">Research</div>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--white)', marginBottom: '1.5rem' }}>
                            Research Identity
                        </h2>

                        <p style={{ color: 'var(--ghost)', marginBottom: '2rem' }}>
                            My research interest is the neuroscience of adversity and neural reorganization
                            across the lifespan: how adverse events, both acute, like stroke, and chronic,
                            like early poverty or disrupted caregiving, reshape brain architecture and
                            behavioral trajectories, and what can be done about it.
                        </p>

                        {/* Three research threads */}
                        {[
                            {
                                label: 'Caregiving & Early Development',
                                body: 'How the parent–child bond sculpts brain architecture, and how disruptions in caregiving create biological pathways to psychopathology. The work of Bick, Sharp, and O\'Connor on sensitive caregiving and early stress exposures frames this thread.',
                            },
                            {
                                label: 'Chronic Adversity & Adolescent Neurodevelopment',
                                body: 'How chronic adversity, poverty, environmental stress, neighborhood disadvantage, shapes the developing adolescent brain and alters behavioral trajectories. Studies like Baby\'s First Years, ABCD, and Michigan SAND represent the empirical infrastructure of this question.',
                            },
                            {
                                label: 'Acute Neurological Adversity & Recovery',
                                body: 'How acute events like stroke force brain reorganization, what that reorganization looks like computationally, and what it means for rehabilitation. Vision recovery after cortical stroke (Tadin, Huxlin) and VR-based rehabilitation are the methodological entry point.',
                            },
                        ].map(({ label, body }) => (
                            <div key={label} style={{
                                borderLeft: '2px solid rgba(100,116,139,0.3)',
                                paddingLeft: '1.5rem',
                                marginBottom: '2rem',
                            }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--offwhite)', marginBottom: '0.6rem' }}>
                                    {label}
                                </h3>
                                <p style={{ fontSize: '0.95rem', color: 'var(--ghost)', lineHeight: 1.8 }}>
                                    {body}
                                </p>
                            </div>
                        ))}
                    </section>

                    {/* ─ SECTION 3: Methods ─ */}
                    <section id="methods" style={{ marginBottom: '5rem' }}>
                        <hr className="section-rule" />
                        <div className="label-tag">Methods</div>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--white)', marginBottom: '1.5rem' }}>
                            Methodological Background
                        </h2>

                        <p style={{ color: 'var(--ghost)', marginBottom: '2rem' }}>
                            My CS background means I approach neuroimaging data as a software and pipeline
                            problem as well as a scientific one. I've built data systems from scratch, written
                            real-time processing pipelines, and designed visualizations for multi-source
                            scientific data. My research contributions at the Finger Lakes Institute, real-time
                            environmental data pipelines, R/Shiny dashboards, time-series and multi-source data
                            management, reflect this dual orientation.
                        </p>

                        <div style={{ marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem' }}>
                                Methods &amp; Techniques
                            </h3>
                            <div>
                                {[
                                    'fMRI Pipeline Analysis', 'EEG / ERP Data Collection',
                                    'Longitudinal Modeling', 'Time-Series Analysis',
                                    'R / R-Shiny', 'Python (NumPy · Pandas · SciPy)',
                                    'SQL & Multi-Source Integration', 'Three.js / WebGL',
                                    'Canvas API', 'Statistical Analysis',
                                    'Git & Reproducible Research', 'Medical Image Processing',
                                ].map(m => (
                                    <span key={m} className="method-pill">{m}</span>
                                ))}
                            </div>
                        </div>

                        <p style={{ color: 'var(--ghost)', marginTop: '2rem', fontSize: '0.95rem' }}>
                            Presented work at the NY6 Undergraduate Research Conference and Finger Lakes
                            Research Symposium. Comfort moving between statistical modeling, front-end
                            engineering, and scientific visualization depending on what the data requires.
                        </p>
                    </section>

                    {/* ─ SECTION 4: Tools ─ */}
                    <section id="tools" style={{ marginBottom: '5rem' }}>
                        <hr className="section-rule" />
                        <div className="label-tag">Tools</div>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--white)', marginBottom: '0.75rem' }}>
                            Research Software Built
                        </h2>
                        <p style={{ color: 'var(--ghost)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                            These are not course projects. They're tools I built because I needed them:
                            to see the data differently, to understand the method from the inside.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                            {[
                                {
                                    title: 'NeuroVerse 3D',
                                    type: 'Scientific Visualization',
                                    body: '3D brain surface reconstruction from MRI slice inputs. Real-time mesh generation, horizontal slice stacking with nearest-neighbor connections, multi-format export (JSON / CSV / OBJ). Built with React, Three.js, and WebGL.',
                                    link: '/mri-tracer',
                                    linkLabel: 'Live Demo →',
                                    internal: true,
                                },
                                {
                                    title: 'NeuroTrace Web',
                                    type: 'Neural Annotation',
                                    body: 'Browser-based neural tissue annotation tool for EM data. Smart propagation, 15-color coding system for structure classification, automatic resize for tracking 3D structures through sequential slices.',
                                    link: '/neurotrace',
                                    linkLabel: 'Live Demo →',
                                    internal: true,
                                },
                                {
                                    title: 'Seneca Lake Monitoring',
                                    type: 'Environmental Science',
                                    body: 'Real-time monitoring platform for buoy data on Seneca Lake. Water quality metrics (temperature, pH, dissolved oxygen), meteorological visualization. Built with R and Shiny for the Finger Lakes Institute.',
                                    link: 'https://flihws.shinyapps.io/SenecaBuoy/',
                                    linkLabel: 'View Live →',
                                    internal: false,
                                },
                                {
                                    title: 'HealthHub Manager',
                                    type: 'Full-Stack Systems',
                                    body: 'Enterprise healthcare management system: JWT authentication, role-based access control, automated patient allocation with workload balancing, MySQL stored procedures, database triggers, full audit trail.',
                                    link: '/healthhub',
                                    linkLabel: 'View Demo →',
                                    internal: true,
                                },
                            ].map(({ title, type, body, link, linkLabel, internal }) => (
                                <div key={title} className="tool-card">
                                    <div style={{ fontSize: '0.65rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.6rem' }}>
                                        {type}
                                    </div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--offwhite)', marginBottom: '0.75rem' }}>
                                        {title}
                                    </h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--ghost)', lineHeight: 1.75, marginBottom: '1rem' }}>
                                        {body}
                                    </p>
                                    {internal
                                        ? <Link to={link} style={{ fontSize: '0.82rem', color: 'var(--accent)', textDecoration: 'none' }}>{linkLabel}</Link>
                                        : <a href={link} target="_blank" rel="noreferrer" style={{ fontSize: '0.82rem', color: 'var(--accent)', textDecoration: 'none' }}>{linkLabel}</a>
                                    }
                                </div>
                            ))}
                        </div>

                        <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                            Full source at&nbsp;
                            <a href="https://github.com/Aden254" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                                github.com/Aden254
                            </a>
                        </p>
                    </section>

                    {/* ─ SECTION 5: Trajectory ─ */}
                    <section id="arc" style={{ marginBottom: '5rem' }}>
                        <hr className="section-rule" />
                        <div className="label-tag">Trajectory</div>
                        <h2 style={{ fontSize:'1.6rem', fontWeight:700,
                            color:'var(--white)', marginBottom:'1.5rem' }}>
                            Where I'm Headed
                        </h2>
                        <p style={{ color:'var(--ghost)' }}>
                            Graduating from Hobart and William Smith Colleges
                            in May 2026 with a double major in Computer Science
                            and Psychology and a minor in Data Analytics.
                            Currently seeking a research assistantship as a step
                            toward graduate study and a long-term path in
                            research and academia.
                        </p>
                        <p style={{ color:'var(--ghost)', marginTop:'1.25rem',
                            fontSize:'0.95rem' }}>
                            F-1 international student. OPT application filed.
                            Authorized to work on-campus through graduation and
                            off-campus upon EAD card receipt.
                        </p>
                    </section>

                    {/* ─ Contact footer ─ */}
                    <div style={{
                        position: 'relative',
                        height: '90px',
                        overflow: 'hidden',
                        marginBottom: '2rem',
                        borderRadius: '2px',
                    }}>
                        <img src="/images/bg4.jpeg" alt=""
                            style={{ width:'100%', height:'100%',
                                objectFit:'cover', objectPosition:'center',
                                opacity: 0.25,
                                filter: 'grayscale(40%)' }} />
                    </div>
                    <div style={{
                        borderTop: '1px solid rgba(100,116,139,0.2)',
                        paddingTop: '2.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        flexWrap: 'wrap',
                        gap: '1rem',
                    }}>
                        <div>
                            <div style={{ fontSize: '0.65rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.75rem' }}>
                                Contact
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <a href="mailto:daudi.aden@hws.edu" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '0.95rem' }}>daudi.aden@hws.edu</a>
                                <span style={{ color: 'var(--ghost)', fontSize: '0.85rem' }}>(315) 878-9791</span>
                                <a href="https://github.com/Aden254" target="_blank" rel="noreferrer" style={{ color: 'var(--ghost)', textDecoration: 'none', fontSize: '0.85rem' }}>github.com/Aden254</a>
                                <a href="https://www.linkedin.com/in/daudi-aden/" target="_blank" rel="noreferrer" style={{ color: 'var(--ghost)', textDecoration: 'none', fontSize: '0.85rem' }}>linkedin.com/in/daudi-aden</a>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <Link to="/" style={{
                                display: 'inline-block',
                                border: '1px solid rgba(100,116,139,0.4)',
                                padding: '0.6rem 1.25rem',
                                color: 'var(--ghost)',
                                textDecoration: 'none',
                                fontSize: '0.8rem',
                                letterSpacing: '0.08em',
                                transition: 'color 0.2s, border-color 0.2s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.color = 'var(--white)'; e.currentTarget.style.borderColor = 'rgba(148,163,184,0.6)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'var(--ghost)'; e.currentTarget.style.borderColor = 'rgba(100,116,139,0.4)'; }}
                            >
                                &larr; Full Portfolio
                            </Link>
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
}

export default ResearchPage;
