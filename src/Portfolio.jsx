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
                className="border-b gradient-transition-bottom"
                style={{
                    backgroundColor: 'var(--navy-dark)',
                    borderColor: 'rgba(100, 116, 139, 0.2)',
                    '--next-color': 'var(--slate-dark)'
                }}
            >
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <h1 className="text-5xl md:text-6xl font-bold mb-3 text-white">
                        Data Analyst & Developer
                    </h1>
                    <p className="text-xl md:text-2xl" style={{ color: 'var(--blue-gray)' }}>
                        Transforming complex data into actionable insights through analysis and visualization
                    </p>
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
                                    <span style={{ color: 'rgba(148, 163, 184, 0.5)' }}>•</span>
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
                                <li>• Statistical Analysis</li>
                                <li>• Data Visualization</li>
                                <li>• Python (Pandas, NumPy)</li>
                                <li>• SQL & Database Querying</li>
                                <li>• Excel & Spreadsheet Modeling</li>
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
                                <li>• Tableau</li>
                                <li>• Power BI</li>
                                <li>• D3.js</li>
                                <li>• Matplotlib & Seaborn</li>
                                <li>• Information Design</li>
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
                                <li>• React & JavaScript</li>
                                <li>• Java & JavaFX</li>
                                <li>• Git & Version Control</li>
                                <li>• Canvas API</li>
                                <li>• Full-Stack Development</li>
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
                    <div className="max-w-3xl">
                        <p
                            className="text-xl md:text-2xl leading-relaxed mb-8"
                            style={{ color: 'var(--slate-medium)' }}
                        >
                            I'm a data analyst and developer who transforms complex datasets into clear,
                            actionable insights. My work bridges quantitative analysis with visual storytelling,
                            making data accessible and compelling.
                        </p>
                        <p
                            className="text-xl md:text-2xl leading-relaxed"
                            style={{ color: 'var(--slate-medium)' }}
                        >
                            With expertise spanning from statistical analysis to full-stack development,
                            I build tools and visualizations that help organizations make data-driven decisions.
                            Whether it's analyzing economic trends or building research software, I focus on
                            creating solutions that are both technically sound and user-centered.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Section - White */}
            <section
                ref={sectionRefs.contact}
                data-section="contact"
                className={`py-20 section-fade ${visibleSections.contact ? 'visible' : ''}`}
                style={{ backgroundColor: 'var(--white)' }}
            >
                <div className="max-w-7xl mx-auto px-6">
                    <h2
                        className="text-4xl md:text-5xl font-bold mb-16 pb-6"
                        style={{
                            color: 'var(--navy-dark)',
                            borderBottom: '2px solid rgba(51, 65, 85, 0.2)'
                        }}
                    >
                        Contact
                    </h2>
                    <div className="space-y-6 text-xl md:text-2xl">
                        <p>
                            <span
                                className="inline-block w-40"
                                style={{ color: 'var(--slate-medium)' }}
                            >
                                Email
                            </span>
                            <a
                                href="mailto:daudiaden4@gmail.com"
                                style={{ color: 'rgb(59, 130, 246)' }}
                            >
                                daudiaden4@gmail.com
                            </a>
                        </p>
                        <p>
                            <span
                                className="inline-block w-40"
                                style={{ color: 'var(--slate-medium)' }}
                            >
                                GitHub
                            </span>
                            <a
                                href="https://github.com/Aden254"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'rgb(59, 130, 246)' }}
                            >
                                Aden254
                            </a>
                        </p>
                        <p>
                            <span
                                className="inline-block w-40"
                                style={{ color: 'var(--slate-medium)' }}
                            >
                                LinkedIn
                            </span>
                            <a
                                href="https://www.linkedin.com/in/daudi-aden/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'rgb(59, 130, 246)' }}
                            >
                                Aden
                            </a>
                        </p>
                    </div>
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
                        © 2025 Your Name. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default Portfolio;