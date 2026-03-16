import { Routes, Route } from 'react-router-dom';

import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import { lazy, Suspense } from 'react';

const Portfolio     = lazy(() => import('./Portfolio'));
const NeuroTraceWeb = lazy(() => import('./NeuroTraceWeb'));
const MRITracer3D   = lazy(() => import('./MRITracer3D'));
const HealthHubManager = lazy(() => import('./components/HealthHubManager'));
const Login         = lazy(() => import('./components/Login'));


// ConsultLink (telehealth)
import ConsultLinkDashboard from './components/ConsultLinkDashboard';
import JoinSession from './components/JoinSession';
import ConsultRoom from './components/ConsultRoom';

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#0f172a',
          color: '#e2e8f0',
          fontSize: '1.2rem'
        }}>
          Loading...
        </div>
      }>
      <Routes>
        {/* Portfolio & Existing Routes */}
        <Route path="/" element={<Portfolio />} />
        <Route path="/neurotrace" element={<NeuroTraceWeb />} />
        <Route path="/login" element={<Login />} />
        <Route path="/healthhub" element={<ProtectedRoute><HealthHubManager /></ProtectedRoute>} />
        <Route path="/mri-tracer" element={<MRITracer3D />} />

        {/* ConsultLink Routes */}
        <Route path="/consultlink" element={<ProtectedRoute><ConsultLinkDashboard /></ProtectedRoute>} />
        <Route path="/join/:sessionId" element={<JoinSession />} />
        <Route path="/consult-room/:sessionId" element={<ConsultRoom />} />
      </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
