import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import {
    TrackShell, Hero, Chapter, ProjectFeature, SkillGrid, InfoGrid, CrossTrack, Contact, Glass, Reveal, PhotoBg,
} from './components/site/SiteKit';
import { TRACKS } from './components/site/tracks';

const ACCENT = TRACKS.research.color;

const FIELD = [
    {
        id: 'canandaigua-lake', type: 'Environmental Monitoring', year: '2026', inProgress: true,
        title: 'Canandaigua Lake Environmental Monitoring',
        description: 'A water quality portal for the Canandaigua Lake Watershed Association. It brings Secchi depth, nutrient, harmful algal bloom, stream, and temperature records from 25+ sampling sites into one place, so researchers and residents can compare sites and seasons.',
        tech: ['R', 'Shiny', 'shinyapps.io', 'Longitudinal Data'],
        external: 'https://flihws.shinyapps.io/CNtest261023/',
        insightsTitle: 'Methods',
        insights: [
            'Five data modules: Secchi depth, nutrients, HABs, streams, and temperature',
            'Site-by-site comparison across 25+ named sampling locations',
            'Weekly boxplots and per-year trend lines to separate seasonal pattern from year-to-year change',
            'Reliability filter: weeks with fewer than 10 measurements are excluded from summaries',
            'Proprietary data, published through a public-facing portal',
        ],
    },
    {
        id: 'seneca-lake', type: 'Environmental Monitoring', year: '2024',
        title: 'Seneca Lake Buoy Monitoring',
        description: 'Live readings from a remote sensor buoy on Seneca Lake: water temperature, pH, dissolved oxygen, and weather, turned into continuously updating time-series views.',
        tech: ['R', 'Shiny', 'Real-Time Sensor Data', 'Time Series'],
        external: 'https://flihws.shinyapps.io/SenecaBuoy/',
    },
];

const COMMUNITY = [
    {
        id: 'success-for-geneva', type: 'Community Outcomes', year: '2026', inProgress: true,
        title: 'Success for Geneva',
        description: "A data story tracking ten shared community goals for Geneva's children and families. It reads live from the database partners update, so it never goes stale.",
        tech: ['R', 'Shiny', 'Live Database', 'Community Research'],
        external: 'https://success4geneva.shinyapps.io/geneva-story/',
        insightsTitle: 'Methods',
        insights: [
            'Three data partners: Geneva City School District, Geneva Police Department, NY State Department of Health',
            'Ten goals across education, safety, and health, each with its own indicator view',
            'Live connection to the partner database, with no manual rebuilds',
            'One-click PDF report covering all ten goals',
        ],
    },
];

const BRAIN = [
    {
        id: 'neuroatlas', type: 'Neuroscience Tool', year: '2025',
        title: 'NeuroAtlas',
        description: 'An Allen Brain Atlas explorer. Search a gene and see where it is expressed across 1,800+ brain structures, switching between human microarray data and mouse in-situ hybridization imaging.',
        tech: ['React', 'Three.js', 'Allen Brain Atlas API', 'Node.js'],
        demo: '/neuroatlas',
        insightsTitle: 'Methods',
        insights: [
            'Live proxy to the Allen Brain Atlas API, so every value is real published data',
            'Two modalities: human microarray expression and mouse ISH section imagery',
            '1,327 mouse and 1,839 human structures from the Allen ontology',
            "Featured genes linked to memory (BDNF), glia (GFAP), and Alzheimer's risk (APOE)",
        ],
    },
    {
        id: 'neurotrace', type: 'Neuroscience Tool', year: '2025',
        title: 'NeuroTrace Web',
        description: 'A browser-based tool for annotating neural structures slice by slice. Annotations carry forward between slices and resize automatically, which makes tracking 3D structures much faster.',
        tech: ['React', 'Canvas API', 'JavaScript'],
        demo: '/neurotrace', github: 'https://github.com/Aden254/neurotrace-web',
    },
    {
        id: 'neuroverse-3d', type: 'Neuroscience Tool', year: '2024',
        title: 'NeuroVerse 3D',
        description: 'Reconstructs a 3D brain surface from traced MRI slices, building the mesh in real time and exporting it as JSON, CSV, or OBJ for further analysis.',
        tech: ['React', 'Three.js', 'WebGL', 'Medical Imaging'],
        demo: '/mri-tracer',
    },
];

const SKILLS = [
    { category: 'Research & Behavioral Data', accent: ACCENT, items: [
        { name: 'fMRI/EEG Pipeline Analysis', level: 90 },
        { name: 'Experimental Design & Statistics', level: 85 },
        { name: 'Time-Series & Longitudinal Modeling', level: 85 },
        { name: 'Python (NumPy/Pandas/SciPy)', level: 88 },
        { name: 'R · Statistical Computing & Shiny', level: 83 },
        { name: 'SQL & Multi-Source Data Management', level: 82 },
    ]},
    { category: 'Scientific Visualization', accent: '#f59e0b', items: [
        { name: 'Interactive Research Dashboards', level: 80 },
        { name: 'D3.js & Data Storytelling', level: 78 },
        { name: 'Three.js/WebGL (3D Brain Rendering)', level: 82 },
        { name: 'Canvas API (Neural Annotation)', level: 85 },
        { name: 'Medical Image Processing', level: 72 },
    ]},
];

function DataStory() {
    return (
        <div style={{ paddingTop: '4rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
                <div>
                    <p className="sans" style={{ color: 'var(--gold)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                        Data Story · 2024
                    </p>
                    <h3 className="font-bold" style={{ fontSize: 'clamp(1.6rem,3vw,2.5rem)', color: 'white', marginBottom: '0.9rem' }}>
                        The Housing Crisis: A Data Story
                    </h3>
                    <p style={{ fontSize: '1.1rem', color: 'var(--gray-light)', maxWidth: '680px', lineHeight: 1.75 }}>
                        American household spending from 2013 to 2023. Housing has grown to 32.4% of the average budget, which makes the 50/30/20 rule unworkable for most families.
                    </p>
                </div>
                <a href="/images/housing-crisis-infographic.png" target="_blank" rel="noopener noreferrer" className="btn-solid sans" style={{ background: 'var(--gold)', fontSize: '0.9rem' }}>
                    <ExternalLink size={15} /> View Full Size
                </a>
            </div>
            <a href="/images/housing-crisis-infographic.png" target="_blank" rel="noopener noreferrer" title="Open full size"
                style={{ display: 'flex', justifyContent: 'center', cursor: 'zoom-in', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem' }}>
                <img src="/images/housing-crisis-infographic.png" alt="The Housing Crisis: A Data Story infographic" style={{ maxWidth: '100%', width: '960px', display: 'block' }} />
            </a>
            <div className="sans" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                {['BLS Consumer Expenditure Survey', 'Data Analysis', 'Data Storytelling'].map((t) => (
                    <span key={t} style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem', fontWeight: 600, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--off-white)' }}>{t}</span>
                ))}
            </div>
        </div>
    );
}

export default function ResearchTrack() {
    return (
        <TrackShell track="research" title="Daudi Aden · Research & Data">
            <Hero
                accent={ACCENT}
                bg="/images/seneca-lake.jpg" bgPosition="center 45%"
                eyebrow="Research & Data"
                headline="Measuring how living systems change, from a lake to a community to the brain."
                photo="/images/daud-profile.jpg"
            >
                <p style={{ fontSize: '1.15rem', lineHeight: 1.8, color: 'var(--off-white)', maxWidth: '640px', marginBottom: '2rem' }}>
                    I'm a Data Manager &amp; Analyst at the Finger Lakes Institute with degrees in Computer Science and Psychology. I build the datasets, analyses, and visual tools that let researchers trust what they're measuring.
                </p>
                <Link to="/research" className="glow-link sans"
                    style={{ '--c': ACCENT, '--g': TRACKS.research.glow, '--rest': ACCENT, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                    Read my research statement →
                </Link>
            </Hero>

            <Chapter number="01" eyebrow="In the field" accent={ACCENT} bg="/images/bg1.jpeg" bgPosition="center 30%"
                title="Environmental data at the Finger Lakes Institute"
                intro="This is my day-to-day work: turning sensor readings and field samples into clean, documented datasets, then publishing them so watershed groups and the public can use them.">
                {FIELD.map((p, i) => <ProjectFeature key={p.id} project={p} accent={ACCENT} first={i === 0} />)}
            </Chapter>

            <Chapter number="02" eyebrow="Communities" accent={ACCENT} bg="/images/bg3.jpeg" bgPosition="center 40%"
                title="Data about people, made readable for people"
                intro="Outcome data only matters if the people it describes can read it. These projects take administrative and survey data and turn it into something a community can act on.">
                {COMMUNITY.map((p, i) => <ProjectFeature key={p.id} project={p} accent={ACCENT} first={i === 0} />)}
                <DataStory />
            </Chapter>

            <Chapter number="03" eyebrow="The brain" accent={ACCENT} bg="/images/bg5.jpeg" bgPosition="center right"
                title="Tools for neuroscience research"
                intro="This is where my psychology training and engineering meet: tools for exploring, annotating, and reconstructing brain data.">
                {BRAIN.map((p, i) => <ProjectFeature key={p.id} project={p} accent={ACCENT} first={i === 0} />)}
            </Chapter>

            <SkillGrid title="Research Skills" skills={SKILLS} />

            <Reveal className="photo-section">
                <PhotoBg src="/images/bg2.jpeg" overlay="rgba(4,10,24,0.8)" position="center 65%" />
                <div className="photo-content max-w-7xl mx-auto px-6 py-24">
                    <h2 className="font-bold" style={{ fontSize: 'clamp(2rem,4vw,3.25rem)', color: 'white', borderBottom: `2px solid ${ACCENT}40`, paddingBottom: '1.25rem', marginBottom: '3.5rem' }}>
                        Where I'm headed
                    </h2>
                    <div className="flex flex-col lg:flex-row" style={{ gap: '3rem', alignItems: 'flex-start' }}>
                        <Glass style={{ flex: 1, padding: '2.5rem' }}>
                            <p style={{ fontSize: '1.1rem', lineHeight: 1.85, color: 'var(--off-white)', marginBottom: '1.5rem' }}>
                                I chose Computer Science and Psychology together on purpose. The questions I care about need both: you can't interpret behavior well without understanding how it was measured, and you can't build good measurement without understanding the behavior.
                            </p>
                            <p style={{ fontSize: '1.1rem', lineHeight: 1.85, color: 'var(--off-white)' }}>
                                Managing research data at the Finger Lakes Institute has taught me what working research data looks like: incomplete, longitudinal, collected by many hands. I'm looking for a Research Assistant role in psychology or cognitive science, where I can bring that data discipline to studies of human behavior.
                            </p>
                            <InfoGrid items={[
                                { label: 'Current role', value: 'Data Manager & Analyst', accent: ACCENT },
                                { label: 'Institution',  value: 'Finger Lakes Institute · HWS', accent: ACCENT },
                                { label: 'Degrees',      value: 'Computer Science · Psychology', accent: '#7c3aed' },
                                { label: 'Seeking',      value: 'Research Assistant, Psychology / Cognitive Science', accent: '#f59e0b' },
                            ]} />
                        </Glass>
                        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1rem', width: 'min(250px, 100%)' }}>
                            {[
                                { src: '/images/daudi-research-1.jpg', alt: 'Daudi at the buoy sensor' },
                                { src: '/images/daudi-research-2.jpg', alt: 'Daudi in the lab' },
                            ].map(({ src, alt }) => (
                                <div key={alt} style={{ overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', borderTop: `3px solid ${ACCENT}` }}>
                                    <img src={src} alt={alt} style={{ width: '100%', height: '200px', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
                                </div>
                            ))}
                            <p className="sans" style={{ fontSize: '0.75rem', textAlign: 'center', color: 'var(--blue-gray)' }}>
                                Field &amp; lab work at the Finger Lakes Institute
                            </p>
                        </div>
                    </div>
                </div>
            </Reveal>

            <CrossTrack
                to="tech"
                eyebrow="The other half of the work"
                title="Every dataset here runs on systems I built."
                body="Databases, authentication, real-time video, and cloud deployments. The engineering side has its own story."
            />

            <Contact
                accent={ACCENT}
                bg="/images/bg1.jpeg"
                headline={<>Let's talk<br />research.</>}
                line="Open to Research Assistant roles in psychology and cognitive science. I'm always happy to talk methods, study design, or messy data."
            />
        </TrackShell>
    );
}
