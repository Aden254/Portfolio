import React from 'react';
import {
    TrackShell, Hero, Chapter, ProjectFeature, SkillGrid, InfoGrid, CrossTrack, Contact, Glass, Reveal,
} from './components/site/SiteKit';
import { TRACKS } from './components/site/tracks';

const ACCENT = TRACKS.tech.color;

const SECURITY = [
    {
        id: 'healthhub-manager', type: 'Healthcare Platform', year: '2024',
        title: 'HealthHub Manager',
        description: 'A healthcare management system for patients, staff, and assignments. It is built around one rule: every user sees exactly what their role allows, and every change leaves a trace.',
        tech: ['React', 'Node.js', 'Express', 'MySQL', 'JWT', 'Railway', 'Vercel'],
        demo: '/healthhub', github: 'https://github.com/Aden254/healthhub-backend',
        insights: [
            'JWT authentication, with the token checked against the server on every load and stale sessions rejected',
            'Role-based access control for doctor, nurse, and admin accounts',
            'MySQL stored procedures and triggers enforce business rules inside the database',
            'Automated patient-to-doctor assignment balanced by current workload',
            'Audit trail of record changes for compliance review',
            'Frontend on Vercel; API and MySQL database on Railway',
        ],
    },
];

const NETWORKING = [
    {
        id: 'consultlink', type: 'Real-Time Networking', year: '2026',
        title: 'ConsultLink Telehealth',
        description: 'A telehealth extension to HealthHub. A clinician creates a session, the patient receives an emailed join link, and both connect over peer-to-peer video in the browser, including across home and mobile networks.',
        tech: ['WebRTC', 'Socket.IO', 'STUN / TURN', 'Node.js', 'Express', 'Nodemailer', 'Railway'],
        demo: '/consultlink', github: 'https://github.com/Aden254/healthhub-backend',
        insights: [
            'WebRTC peer connections negotiated over a Socket.IO signaling server',
            'STUN for direct paths, with a TURN relay fallback so calls connect through symmetric NAT',
            'WebSocket transport with automatic HTTP long-polling fallback',
            'Transactional email over SMTP; session creation never blocks on mail delivery',
            'JWT-protected clinician dashboard; patients join through a single-session link',
        ],
    },
];

const INFRASTRUCTURE = [
    {
        id: 'maritime-dashboard', type: 'Spatial Data Infrastructure', year: '2026',
        title: 'Maritime Intelligence Dashboard',
        description: 'A vessel tracking platform backed by a spatial database. Real AIS data flows through a REST API into PostGIS and out to a live, GPU-rendered map.',
        tech: ['PostgreSQL', 'PostGIS', 'Supabase', 'Node.js', 'Express', 'MapLibre GL', 'Railway', 'Vercel'],
        external: 'https://maritime-frontend-lake.vercel.app', github: 'https://github.com/Aden254/maritime-frontend',
        insights: [
            'Spatial queries with PostGIS geography types and ST_Distance',
            'Real vessel data ingested and served through a REST API on Railway',
            'Supabase-hosted PostgreSQL with the PostGIS extension as the spatial store',
            'Diagnosed and fixed the full deployment path across Vercel, Railway, and Supabase',
        ],
    },
    {
        id: 'trip-planner', type: 'Cloud Application', year: '2026',
        title: 'Trip Planner',
        description: 'A collaborative travel planner where groups build shared itineraries on a live map. It is installable and keeps working offline.',
        tech: ['Next.js 15', 'Node.js', 'Express', 'Supabase', 'AWS S3', 'Sentry', 'PWA', 'Vercel'],
        external: 'https://travel-platform-silk.vercel.app',
        insights: [
            'Progressive Web App with a service worker for offline use',
            'Google Places requests proxied through Express with caching and rate limiting to stay inside API quota',
            'Supabase authentication and shared trip state',
            'Photo uploads to AWS S3 through presigned URLs, so files never pass through the API server',
            'Sentry error monitoring on both the frontend and the backend',
        ],
    },
];

const SKILLS = [
    { category: 'Systems & Networking', accent: ACCENT, items: [
        { name: 'Linux · Server & Systems Administration', level: 76 },
        { name: 'Networking Fundamentals (TCP/IP, DNS)', level: 72 },
        { name: 'Cloud Infrastructure (AWS · Railway · Vercel)', level: 78 },
        { name: 'CI/CD · Docker · Reproducible Pipelines', level: 75 },
        { name: 'Git & Version Control', level: 90 },
    ]},
    { category: 'Software & Data', accent: '#0ea5e9', items: [
        { name: 'React & JavaScript / Full-Stack', level: 88 },
        { name: 'Java / C / C# / Python', level: 80 },
        { name: 'SQL & Multi-Source Data Management', level: 82 },
        { name: 'Python (NumPy/Pandas/SciPy)', level: 88 },
    ]},
];

export default function TechTrack() {
    return (
        <TrackShell track="tech" title="Daudi Aden · Systems & Engineering">
            <Hero
                accent={ACCENT}
                bg="/images/daudi-working.jpg" bgPosition="center 35%"
                eyebrow="Systems & Engineering"
                headline="Building systems that stay up, stay secure, and connect people."
            >
                <p style={{ fontSize: '1.15rem', lineHeight: 1.8, color: 'var(--off-white)', maxWidth: '640px', marginBottom: '2rem' }}>
                    I design and deploy platforms end to end: databases, APIs, authentication, real-time networking, and cloud infrastructure. I built, deployed, and debugged every system on this page myself.
                </p>
                <a href="https://github.com/Aden254" target="_blank" rel="noopener noreferrer" className="glow-link sans"
                    style={{ '--c': ACCENT, '--g': TRACKS.tech.glow, '--rest': ACCENT, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                    View my GitHub →
                </a>
            </Hero>

            <Chapter number="01" eyebrow="Security" accent={ACCENT} bg="/images/bg4.jpeg" bgPosition="center 60%"
                title="Access control comes first"
                intro="Healthcare data leaves no room for error about who can see what. This platform was designed around authentication, roles, and accountability from the first table.">
                {SECURITY.map((p, i) => <ProjectFeature key={p.id} project={p} accent={ACCENT} first={i === 0} />)}
            </Chapter>

            <Chapter number="02" eyebrow="Networking" accent={ACCENT}
                title="Getting two browsers to talk"
                intro="Live video between a clinic and a patient's home network is a networking problem before it is a UI problem. I had to work through NAT traversal, signaling, and transport fallbacks to make calls connect reliably.">
                {NETWORKING.map((p, i) => <ProjectFeature key={p.id} project={p} accent={ACCENT} first={i === 0} />)}
            </Chapter>

            <Chapter number="03" eyebrow="Infrastructure" accent={ACCENT} bg="/images/bg3.jpeg" bgPosition="center 40%"
                title="Data and cloud infrastructure"
                intro="Spatial databases, object storage, caching, offline-first clients, and monitoring. These are the pieces that decide whether an app still works at 2 a.m.">
                {INFRASTRUCTURE.map((p, i) => <ProjectFeature key={p.id} project={p} accent={ACCENT} first={i === 0} />)}
            </Chapter>

            <SkillGrid title="Technical Skills" skills={SKILLS} />

            <Reveal style={{ background: '#050c1c' }}>
                <div className="max-w-7xl mx-auto px-6 py-24">
                    <h2 className="font-bold" style={{ fontSize: 'clamp(2rem,4vw,3.25rem)', color: 'white', borderBottom: `2px solid ${ACCENT}40`, paddingBottom: '1.25rem', marginBottom: '3.5rem' }}>
                        Where I'm headed
                    </h2>
                    <Glass style={{ padding: '2.5rem', maxWidth: '900px' }}>
                        <p style={{ fontSize: '1.1rem', lineHeight: 1.85, color: 'var(--off-white)', marginBottom: '1.5rem' }}>
                            Computer Science gave me the foundation, and research gave me the standards. At the Finger Lakes Institute I manage the data behind long-running monitoring programs, including the pipelines, the databases, and the published apps people rely on. That work made me care most about the unglamorous parts: uptime, access control, and systems that keep running when nobody is watching.
                        </p>
                        <p style={{ fontSize: '1.1rem', lineHeight: 1.85, color: 'var(--off-white)' }}>
                            I'm looking for a role in systems administration, network engineering, or IT infrastructure, where keeping systems reliable is the job itself.
                        </p>
                        <InfoGrid items={[
                            { label: 'Current role', value: 'Data Manager & Analyst', accent: ACCENT },
                            { label: 'Institution',  value: 'Finger Lakes Institute · HWS', accent: ACCENT },
                            { label: 'Degrees',      value: 'Computer Science · Psychology', accent: '#0ea5e9' },
                            { label: 'Seeking',      value: 'Systems Admin · Network Engineering · IT Infrastructure', accent: '#f59e0b' },
                        ]} />
                    </Glass>
                </div>
            </Reveal>

            <CrossTrack
                to="research"
                eyebrow="The other half of the work"
                title="These systems exist to answer questions."
                body="Lake monitoring, community outcomes, and neuroscience tools. The research these systems serve has its own story."
            />

            <Contact
                accent={ACCENT}
                bg="/images/bg2.jpeg"
                headline={<>Let's build something<br />reliable.</>}
                line="Open to systems administration, network engineering, and IT infrastructure roles: remote, hybrid, or in the Finger Lakes region."
            />
        </TrackShell>
    );
}
