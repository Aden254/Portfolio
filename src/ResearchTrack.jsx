import React from 'react';
import { Link } from 'react-router-dom';
import {
    TrackShell, Hero, Chapter, ProjectFeature, ProjectRow, SkillGrid, InfoGrid, Contact, Section, TextLink,
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

const INFOGRAPHIC = '/images/housing-crisis-infographic.png';

function DataStory() {
    return (
        <ProjectRow year="2024">
            <p className="sans" style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: ACCENT, marginBottom: '0.6rem' }}>
                Data Story
            </p>
            <h3 className="font-bold" style={{ fontSize: 'clamp(1.35rem,2.6vw,1.85rem)', color: 'white', lineHeight: 1.25, marginBottom: '0.75rem' }}>
                The Housing Crisis: A Data Story
            </h3>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--gray-light)', maxWidth: '720px', marginBottom: '1.5rem' }}>
                American household spending from 2013 to 2023. Housing has grown to 32.4% of the average budget, which makes the 50/30/20 rule unworkable for most families.
            </p>
            <a href={INFOGRAPHIC} target="_blank" rel="noopener noreferrer" title="Open full size"
                style={{ display: 'block', cursor: 'zoom-in', border: '1px solid rgba(255,255,255,0.08)', padding: '1rem', marginBottom: '1.25rem' }}>
                <img src={INFOGRAPHIC} alt="The Housing Crisis: A Data Story infographic" style={{ width: '100%', display: 'block' }} />
            </a>
            <p className="sans" style={{ fontSize: '0.72rem', letterSpacing: '0.06em', color: 'rgba(100,116,139,0.95)', marginBottom: '1.1rem' }}>
                BLS Consumer Expenditure Survey · Data Analysis · Data Storytelling
            </p>
            <TextLink href={INFOGRAPHIC} accent={ACCENT}>View full size →</TextLink>
        </ProjectRow>
    );
}

export default function ResearchTrack() {
    return (
        <TrackShell track="research" title="Daudi Aden · Research & Data">
            <Hero
                accent={ACCENT}
                bg="/images/seneca-lake.jpg" bgPosition="center 45%"
                eyebrow="Research & Data"
                headline="Measuring how living systems change, from a lake to a community to the brain."            >
                <p style={{ fontSize: '1.15rem', lineHeight: 1.8, color: 'var(--off-white)', maxWidth: '640px', marginBottom: '2rem' }}>
                    I'm a Data Manager &amp; Analyst at the Finger Lakes Institute with degrees in Computer Science and Psychology. I build the datasets, analyses, and visual tools that let researchers trust what they're measuring.
                </p>
                <Link to="/research" className="glow-link sans"
                    style={{ '--c': ACCENT, '--g': TRACKS.research.glow, '--rest': ACCENT, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                    Read my research statement →
                </Link>
            </Hero>

            <Chapter number="01" eyebrow="In the field" accent={ACCENT}
                title="Environmental data at the Finger Lakes Institute"
                intro="This is my day-to-day work: turning sensor readings and field samples into clean, documented datasets, then publishing them so watershed groups and the public can use them.">
                {FIELD.map((p) => <ProjectFeature key={p.id} project={p} accent={ACCENT} />)}
            </Chapter>

            <Chapter number="02" eyebrow="Communities" accent={ACCENT}
                title="Data about people, made readable for people"
                intro="Outcome data only matters if the people it describes can read it. These projects take administrative and survey data and turn it into something a community can act on.">
                {COMMUNITY.map((p) => <ProjectFeature key={p.id} project={p} accent={ACCENT} />)}
                <DataStory />
            </Chapter>

            <Chapter number="03" eyebrow="The brain" accent={ACCENT}
                title="Tools for neuroscience research"
                intro="This is where my psychology training and engineering meet: tools for exploring, annotating, and reconstructing brain data.">
                {BRAIN.map((p) => <ProjectFeature key={p.id} project={p} accent={ACCENT} />)}
            </Chapter>

            <SkillGrid title="Research Skills" skills={SKILLS} />

            <Section eyebrow="Where I'm headed" title="Bringing data discipline to the study of behavior.">
                <div style={{ maxWidth: '760px' }}>
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
                </div>
            </Section>

            <Contact
                accent={ACCENT}
                headline={<>Let's talk<br />research.</>}
                line="Open to Research Assistant roles in psychology and cognitive science. I'm always happy to talk methods, study design, or messy data."
            />
        </TrackShell>
    );
}
