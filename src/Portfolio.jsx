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

    // Intersection Observer for fade-in animations
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setVisibleSections(prev => ({
                        ...prev,
                        [entry.target.dataset.section]: true
                    }));
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        Object.values(sectionRefs).forEach(ref => {
            if (ref.current) {
                observer.observe(ref.current);
            }
        });

        return () => observer.disconnect();
    }, []);

    const projects = [
        {
            id: 'healthhub-manager',
            type: 'Full-Stack Development',
            year: '2024',
            title: 'HealthHub Manager',
            description: 'Enterprise healthcare management system with JWT authentication, role-based access control, and automated patient allocation. Features intelligent workload balancing, database triggers for automation, and complete audit trail. Deployed with CI/CD pipeline.',
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
            title: "The Housing Crisis: A Data Story",
            type: "Data Visualization",
            description: "Comprehensive infographic analyzing American household spending patterns from 2013-2023, revealing how housing costs have made the 50/30/20 budgeting rule mathematically impossible for most families.",
            image: "/images/housing-crisis-infographic.png",
            tech: ["Data Analysis", "Visualization", "Storytelling"],
            insights: [
                "Housing costs rose to 32.4% of household budgets by 2023",
                "Analyzed 10 years of BLS Consumer Expenditure Survey data",
                "Created multi-layered visualizations showing geographic and income disparities",
                "Demonstrated structural economic burden through data storytelling"
            ],
            year: "2024",
            featured: true
        },
        {
            id: 2,
            title: "NeuroTrace Web",
            type: "Full-Stack Development",
            description: "Browser-based neural annotation tool with smart propagation and 15-color coding system for neuroscience research. Features automatic resize functionality for tracking 3D structures.",
            demo: "/neurotrace",
            github: "https://github.com/yourusername/neurotrace-web",
            tech: ["React", "Canvas API", "JavaScript"],
            year: "2025",
            featured: true
        },

        {
            id: 'neuroverse-3d',  // 
            type: 'Scientific Visualization',
            year: '2024',
            title: 'NeuroVerse 3D',
            description: 'Interactive 3D brain surface reconstruction from MRI slices. Features real-time mesh generation, horizontal slice stacking with nearest-neighbor connections, and multi-format export (JSON/CSV/OBJ). Built with React, Three.js, and WebGL.',
            tech: ['React', 'Three.js', 'WebGL', 'Canvas API', 'Medical Imaging', 'Data Visualization'],
            demo: '/mri-tracer',  //
            github: null,
            external: null
        },
        {
            id: 'seneca-lake',
            type: 'Environmental Science',
            year: '2024',
            title: 'Seneca Lake Monitoring',
            description: 'Real-time monitoring platform displaying live data from a remote buoy on Seneca Lake. Features water quality metrics (temperature, pH, dissolved oxygen) and meteorological data visualization. Built with R and Shiny for powerful statistical analysis and interactive dashboards.',
            tech: ['R', 'Shiny', 'shinyapps.io', 'Data Visualization', 'Real-Time Data'],
            demo: null,
            github: null,
            external: 'https://flihws.shinyapps.io/SenecaBuoy/'
        }
    ];

    const featuredProjects = projects.filter(p => p.featured);

    return (
        <div className="min-h-screen" style={{ fontFamily: "'Old Standard TT', serif" }}>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* Smooth scroll */
        html {
          scroll-behavior: smooth;
        }

        /* Color Variables */
        :root {
          --navy-dark: #0f172a;
          --slate-dark: #1e293b;
          --slate-medium: #334155;
          --slate-light: #475569;
          --blue-gray: #64748b;
          --gray-light: #94a3b8;
          --off-white: #e2e8f0;
          --white: #f8fafc;
        }

        /* Section Fade Animations */
        .section-fade {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }

        .section-fade.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Gradient Overlays for Smooth Transitions */
        .gradient-transition-bottom {
          position: relative;
        }

        .gradient-transition-bottom::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 100px;
          background: linear-gradient(to bottom, transparent, var(--next-color));
          pointer-events: none;
        }

        /* Image hover effect */
        .project-image {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .project-image:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(59, 130, 246, 0.3);
        }

        /* Link hover effects */
        a {
          transition: all 0.3s ease;
        }

        /* Smooth background transitions between sections */
        section {
          transition: background-color 1s ease;
        }
      `}</style>

            {/* Header - Deep Navy */}
            <header
                className="border-b gradient-transition-bottom relative overflow-hidden"
                style={{
                    backgroundColor: 'var(--navy-dark)',
                    borderColor: 'rgba(100, 116, 139, 0.2)',
                    '--next-color': 'var(--slate-dark)',
                }}
            >
                {/* Subtle background image layer — fades in from the right */}
                <div
                    className="absolute top-0 right-0 h-full w-1/3 bg-no-repeat bg-right bg-cover pointer-events-none"
                    style={{
                        backgroundImage: `url('/images/seneca-lake.jpg')`,
                        opacity: 0.85,
                        maskImage: 'linear-gradient(to left, rgba(0,0,0,0.8), rgba(0,0,0,0))',
                        WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.8), rgba(0,0,0,0))',
                    }}
                />

                {/* Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-start md:items-center gap-10">

                    {/* Text block */}
                    <div className="flex-1">
                        {/* Eyebrow label */}
                        <p className="text-sm font-semibold tracking-widest uppercase mb-4"
                            style={{ color: 'var(--blue-gray)' }}>
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

                        {/* Quick-link badges */}
                        <div className="flex flex-wrap gap-3 mt-8">
                            {['Data Analysis', 'Full-Stack Dev', 'Scientific Viz', 'Research'].map(tag => (
                                <span key={tag}
                                    className="px-3 py-1 text-xs font-semibold tracking-wide"
                                    style={{
                                        border: '1px solid rgba(148,163,184,0.3)',
                                        color: 'var(--gray-light)',
                                        backgroundColor: 'rgba(255,255,255,0.04)'
                                    }}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Profile photo — borderless, fades into navy */}
                    <div className="flex-shrink-0">
                        <img
                            src="/images/daud-profile.jpg"
                            alt="Daudi Aden"
                            style={{
                                width: '220px',
                                height: '260px',
                                objectFit: 'cover',
                                objectPosition: 'center top',
                                display: 'block',
                                maskImage: 'radial-gradient(ellipse 85% 90% at 50% 45%, black 40%, transparent 100%)',
                                WebkitMaskImage: 'radial-gradient(ellipse 85% 90% at 50% 45%, black 40%, transparent 100%)',
                            }}
                        />
                    </div>
                </div>
            </header>

            {/* Featured Work Section - Dark Blue-Gray */}
            <section
                ref={sectionRefs.featured}
                data-section="featured"
                className={`py-20 gradient-transition-bottom section-fade ${visibleSections.featured ? 'visible' : ''}`}
                style={{
                    backgroundColor: 'var(--slate-dark)',
                    '--next-color': 'var(--slate-medium)'
                }}
            >
                <div className="max-w-7xl mx-auto px-6">
                    <h2
                        className="text-4xl md:text-5xl font-bold mb-16 pb-6"
                        style={{
                            color: 'var(--white)',
                            borderBottom: '2px solid rgba(100, 116, 139, 0.3)'
                        }}
                    >
                        Featured Work
                    </h2>

                    {featuredProjects.map((project, index) => (
                        <div
                            key={project.id}
                            className={`mb-16 ${index > 0 ? 'pt-16' : ''}`}
                            style={index > 0 ? { borderTop: '1px solid rgba(100, 116, 139, 0.2)' } : {}}
                        >

                            {/* Project Header */}
                            <div className="mb-8">
                                <div className="flex items-center gap-4 mb-4">
                                    <span
                                        className="px-4 py-2 text-sm font-semibold"
                                        style={{
                                            border: '1px solid rgba(148, 163, 184, 0.3)',
                                            color: 'var(--gray-light)'
                                        }}
                                    >
                                        {project.type}
                                    </span>
                                    <span style={{ color: 'var(--blue-gray)' }}>{project.year}</span>
                                </div>
                                <h3
                                    className="text-3xl md:text-4xl font-bold mb-6"
                                    style={{ color: 'var(--white)' }}
                                >
                                    {project.title}
                                </h3>
                                <p
                                    className="text-lg md:text-xl leading-relaxed max-w-4xl"
                                    style={{ color: 'var(--gray-light)' }}
                                >
                                    {project.description}
                                </p>
                            </div>

                            {/* Infographic Display */}
                            {project.image && (
                                <div className="mb-8">
                                    <div
                                        className="project-image cursor-pointer overflow-hidden"
                                        style={{
                                            border: '3px solid rgba(59, 130, 246, 0.3)',
                                            backgroundColor: 'var(--white)'
                                        }}
                                        onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
                                    >
                                        <img
                                            src={project.image}
                                            alt={project.title}
                                            className="w-full h-auto"
                                            style={{
                                                maxHeight: selectedProject === project.id ? 'none' : '600px',
                                                objectFit: selectedProject === project.id ? 'contain' : 'cover'
                                            }}
                                        />
                                    </div>
                                    <p
                                        className="text-sm mt-3 text-center"
                                        style={{ color: 'var(--blue-gray)' }}
                                    >
                                        {selectedProject === project.id ? 'Click to collapse' : 'Click to view full size'}
                                    </p>
                                </div>
                            )}

                            {/* Key Insights */}
                            {project.insights && (
                                <div
                                    className="mb-8 p-8"
                                    style={{
                                        backgroundColor: 'rgba(30, 41, 59, 0.6)',
                                        border: '1px solid rgba(100, 116, 139, 0.3)'
                                    }}
                                >
                                    <h4
                                        className="text-xl md:text-2xl font-bold mb-6"
                                        style={{ color: 'var(--off-white)' }}
                                    >
                                        Key Insights & Methodology
                                    </h4>
                                    <ul className="space-y-3">
                                        {project.insights.map((insight, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-start gap-4 text-base md:text-lg"
                                                style={{ color: 'var(--gray-light)' }}
                                            >
                                                <span style={{ color: 'var(--white)', marginTop: '2px' }}>→</span>
                                                <span>{insight}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Tech Stack & Links */}
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex flex-wrap gap-3">
                                    {project.tech.map(tech => (
                                        <span
                                            key={tech}
                                            className="px-4 py-2 text-sm font-semibold"
                                            style={{
                                                backgroundColor: 'rgba(51, 65, 85, 0.6)',
                                                border: '1px solid rgba(100, 116, 139, 0.3)',
                                                color: 'var(--off-white)'
                                            }}
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex gap-4 ml-auto">
                                    {project.demo && (
                                        <Link
                                            to={project.demo}
                                            className="flex items-center gap-2 px-6 py-3 font-semibold"
                                            style={{
                                                backgroundColor: 'rgb(59, 130, 246)',
                                                color: 'white'
                                            }}
                                        >
                                            <ExternalLink size={18} />
                                            Live Demo
                                        </Link>
                                    )}
                                    {project.github && (
                                        <a
                                            href={project.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-6 py-3 font-semibold"
                                            style={{
                                                border: '2px solid rgba(148, 163, 184, 0.5)',
                                                color: 'var(--off-white)'
                                            }}
                                        >
                                            <Github size={18} />
                                            GitHub
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* All Projects Section - Medium Blue-Gray */}
            <section
                ref={sectionRefs.projects}
                data-section="projects"
                className={`py-20 gradient-transition-bottom section-fade ${visibleSections.projects ? 'visible' : ''}`}
                style={{
                    backgroundColor: 'var(--slate-medium)',
                    '--next-color': 'var(--slate-light)'
                }}
            >
                <div className="max-w-7xl mx-auto px-6">
                    <h2
                        className="text-4xl md:text-5xl font-bold mb-16 pb-6"
                        style={{
                            color: 'var(--white)',
                            borderBottom: '2px solid rgba(148, 163, 184, 0.3)'
                        }}
                    >
                        All Projects
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map(project => (
                            <div
                                key={project.id}
                                className="p-6 transition-all duration-300"
                                style={{
                                    border: '1px solid rgba(148, 163, 184, 0.3)',
                                    backgroundColor: 'rgba(30, 41, 59, 0.4)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <span
                                        className="text-xs uppercase tracking-wider"
                                        style={{ color: 'var(--blue-gray)' }}
                                    >
                                        {project.type}
                                    </span>
                                    <span style={{ color: 'rgba(148, 163, 184, 0.5)' }}>→</span>
                                    <span
                                        className="text-xs"
                                        style={{ color: 'var(--blue-gray)' }}
                                    >
                                        {project.year}
                                    </span>
                                </div>

                                <h3
                                    className="text-xl font-bold mb-4"
                                    style={{ color: 'var(--white)' }}
                                >
                                    {project.title}
                                </h3>

                                <p
                                    className="text-sm mb-5 leading-relaxed"
                                    style={{ color: 'var(--gray-light)' }}
                                >
                                    {project.description.slice(0, 150)}...
                                </p>

                                <div className="flex flex-wrap gap-2 mb-5">
                                    {project.tech.slice(0, 3).map(tech => (
                                        <span
                                            key={tech}
                                            className="px-3 py-1 text-xs"
                                            style={{
                                                backgroundColor: 'rgba(51, 65, 85, 0.6)',
                                                border: '1px solid rgba(100, 116, 139, 0.3)',
                                                color: 'var(--off-white)'
                                            }}
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex gap-4 text-sm">
                                    {project.demo && (
                                        <Link
                                            to={project.demo}
                                            style={{ color: 'rgb(59, 130, 246)' }}
                                        >
                                            View →
                                        </Link>
                                    )}
                                    {project.external && (
                                        <a
                                            href={project.external}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: 'rgb(59, 130, 246)' }}
                                        >
                                            View Live →
                                        </a>
                                    )}
                                    {project.github && (
                                        <a
                                            href={project.github}
                                            style={{ color: 'rgb(59, 130, 246)' }}
                                        >
                                            GitHub →
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Skills Section - Light Blue-Gray */}
            <section
                ref={sectionRefs.skills}
                data-section="skills"
                className={`py-20 gradient-transition-bottom section-fade ${visibleSections.skills ? 'visible' : ''}`}
                style={{
                    backgroundColor: 'var(--slate-light)',
                    '--next-color': 'var(--blue-gray)'
                }}
            >
                <div className="max-w-7xl mx-auto px-6">
                    <h2
                        className="text-4xl md:text-5xl font-bold mb-16 pb-6"
                        style={{
                            color: 'var(--white)',
                            borderBottom: '2px solid rgba(148, 163, 184, 0.4)'
                        }}
                    >
                        Skills & Expertise
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                        <div>
                            <h3
                                className="text-2xl font-bold mb-6"
                                style={{ color: 'var(--off-white)' }}
                            >
                                Data Analysis
                            </h3>
                            <ul className="space-y-3 text-lg" style={{ color: 'var(--gray-light)' }}>
                                <li>- Statistical Analysis</li>
                                <li>- Data Visualization</li>
                                <li>- Python (Pandas, NumPy)</li>
                                <li>- SQL & Database Querying</li>
                                <li>- Excel & Spreadsheet Modeling</li>
                            </ul>
                        </div>

                        <div>
                            <h3
                                className="text-2xl font-bold mb-6"
                                style={{ color: 'var(--off-white)' }}
                            >
                                Visualization Tools
                            </h3>
                            <ul className="space-y-3 text-lg" style={{ color: 'var(--gray-light)' }}>
                                <li>- Tableau</li>
                                <li>- Power BI</li>
                                <li>- D3.js</li>
                                <li>- Matplotlib & Seaborn</li>
                                <li>- Information Design</li>
                            </ul>
                        </div>

                        <div>
                            <h3
                                className="text-2xl font-bold mb-6"
                                style={{ color: 'var(--off-white)' }}
                            >
                                Development
                            </h3>
                            <ul className="space-y-3 text-lg" style={{ color: 'var(--gray-light)' }}>
                                <li>- React & JavaScript</li>
                                <li>- Java & JavaFX</li>
                                <li>- Git & Version Control</li>
                                <li>- Canvas API</li>
                                <li>- Full-Stack Development</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section - Off-White */}
            <section
                ref={sectionRefs.about}
                data-section="about"
                className={`py-20 gradient-transition-bottom section-fade ${visibleSections.about ? 'visible' : ''}`}
                style={{
                    backgroundColor: 'var(--off-white)',
                    '--next-color': 'var(--white)'
                }}
            >
                <div className="max-w-7xl mx-auto px-6">
                    <h2
                        className="text-4xl md:text-5xl font-bold mb-16 pb-6"
                        style={{
                            color: 'var(--navy-dark)',
                            borderBottom: '2px solid rgba(51, 65, 85, 0.2)'
                        }}
                    >
                        About
                    </h2>
                    {/* Two-column: text + action photos */}
                    <div className="flex flex-col lg:flex-row gap-16 items-start">

                        {/* Story text */}
                        <div className="flex-1">
                            <p className="text-xl md:text-2xl leading-relaxed mb-6"
                                style={{ color: 'var(--slate-medium)' }}>
                                I'm <strong>Daudi Aden</strong>  a data analyst, researcher and developer with a background
                                in environmental science and computer science. I got my start doing real field
                                research at the <strong>Finger Lakes Institute</strong>, collecting and analyzing
                                water quality data from Seneca Lake's remote monitoring buoy.
                            </p>
                            <p className="text-xl md:text-2xl leading-relaxed mb-6"
                                style={{ color: 'var(--slate-medium)' }}>
                                That field work taught me something lectures couldn't: data only matters when
                                it reaches the right people in the right form. That conviction drives everything
                                I build ~ from real-time R/Shiny dashboards for lake monitoring, to 3D brain
                                visualization tools for neuroscience research, to full-stack healthcare systems.
                            </p>
                            <p className="text-xl md:text-2xl leading-relaxed"
                                style={{ color: 'var(--slate-medium)' }}>
                                I'm currently seeking roles where I can apply both my analytical and engineering
                                skills to problems with real-world impact. I'm equally comfortable in a terminal,
                                a spreadsheet, or out on a research boat.
                            </p>

                            {/* Quick facts */}
                            <div className="mt-10 grid grid-cols-2 gap-6">
                                {[
                                    { label: 'Based in', value: 'Geneva, NY' },
                                    { label: 'Institution', value: 'Finger Lakes Institute' },
                                    { label: 'Focus', value: 'Data × Development' },
                                    { label: 'Open to', value: 'Full-time & Research roles' },
                                ].map(({ label, value }) => (
                                    <div key={label}>
                                        <p className="text-sm font-semibold tracking-widest uppercase mb-1"
                                            style={{ color: 'var(--blue-gray)' }}>
                                            {label}
                                        </p>
                                        <p className="text-lg font-semibold"
                                            style={{ color: 'var(--navy-dark)' }}>
                                            {value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action photos */}
                        <div className="flex-shrink-0 flex flex-col gap-4" style={{ width: '280px' }}>
                            <div style={{
                                overflow: 'hidden',
                                border: '2px solid rgba(51,65,85,0.2)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                            }}>
                                <img
                                    src="/images/daudi-research-1.jpg"
                                    alt="Daudi examining a sensor"
                                    style={{ width: '100%', height: '220px', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
                                />
                            </div>
                            <div style={{
                                overflow: 'hidden',
                                border: '2px solid rgba(51,65,85,0.2)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                            }}>
                                <img
                                    src="/images/daudi-research-2.jpg"
                                    alt="Daudi in the lab"
                                    style={{ width: '100%', height: '220px', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                                />
                            </div>
                            <p className="text-sm text-center" style={{ color: 'var(--slate-light)' }}>
                                Field &amp; lab work at the Finger Lakes Institute
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section — full-bleed lake background, text right */}
            <section
                ref={sectionRefs.contact}
                data-section="contact"
                className={`section-fade ${visibleSections.contact ? 'visible' : ''}`}
                style={{ backgroundColor: 'var(--white)', position: 'relative', overflow: 'hidden', minHeight: '520px' }}
            >
                {/* Lake photo: pinned left, 75% wide, fades right into white */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '75%',
                    height: '100%',
                    zIndex: 0,
                }}>
                    <img
                        src="/images/seneca-lake.jpg"
                        alt="Seneca Lake at sunrise"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center 30%',
                            display: 'block',
                            maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
                            WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
                        }}
                    />
                    {/* Extra white wash to keep white bg clean on right */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to right, transparent 30%, var(--white) 85%)'
                    }} />
                </div>

                {/* Caption bottom-left over the photo */}
                <p style={{
                    position: 'absolute',
                    bottom: '1.5rem',
                    left: '2rem',
                    zIndex: 2,
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                }}>
                    Seneca Lake — Geneva, NY
                </p>

                {/* Contact text: floats on the right quarter */}
                <div style={{
                    position: 'relative',
                    zIndex: 1,
                    marginLeft: 'auto',
                    width: '38%',
                    minWidth: '320px',
                    padding: '5rem 3rem 5rem 1rem',
                }}>
                    <h2
                        className="text-4xl md:text-5xl font-bold mb-12 pb-6"
                        style={{
                            color: 'var(--navy-dark)',
                            borderBottom: '2px solid rgba(51, 65, 85, 0.2)'
                        }}
                    >
                        Contact
                    </h2>

                    <div className="space-y-6 text-xl md:text-2xl">
                        <p>
                            <span className="block text-sm font-semibold tracking-widest uppercase mb-1"
                                style={{ color: 'var(--blue-gray)' }}>Email</span>
                            <a href="mailto:daudiaden4@gmail.com" style={{ color: 'rgb(59, 130, 246)' }}>
                                daudiaden4@gmail.com
                            </a>
                        </p>
                        <p>
                            <span className="block text-sm font-semibold tracking-widest uppercase mb-1"
                                style={{ color: 'var(--blue-gray)' }}>GitHub</span>
                            <a href="https://github.com/Aden254" target="_blank" rel="noopener noreferrer"
                                style={{ color: 'rgb(59, 130, 246)' }}>
                                Aden254
                            </a>
                        </p>
                        <p>
                            <span className="block text-sm font-semibold tracking-widest uppercase mb-1"
                                style={{ color: 'var(--blue-gray)' }}>LinkedIn</span>
                            <a href="https://www.linkedin.com/in/daudi-aden/" target="_blank" rel="noopener noreferrer"
                                style={{ color: 'rgb(59, 130, 246)' }}>
                                Aden
                            </a>
                        </p>
                    </div>

                    <p className="mt-10 text-base leading-relaxed"
                        style={{ color: 'var(--slate-light)', borderTop: '1px solid rgba(51,65,85,0.1)', paddingTop: '1.5rem' }}>
                        Based in Geneva, NY — open to remote, hybrid, or local opportunities.
                        Always happy to talk data, research, or interesting problems.
                    </p>
                </div>
            </section>

            {/* Footer - Cool Gray */}
            <footer
                className="py-10"
                style={{
                    backgroundColor: 'var(--blue-gray)',
                    borderTop: '1px solid rgba(148, 163, 184, 0.3)'
                }}
            >
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p style={{ color: 'var(--off-white)' }}>
                        © 2025 Daudi Aden. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default Portfolio;