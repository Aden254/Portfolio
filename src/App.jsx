import { Routes, Route } from 'react-router-dom';
import Portfolio from './Portfolio';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import NeuroTraceWeb from './NeuroTraceWeb';
import MRITracer3D from './MRITracer3D';
import HealthHubManager from './components/HealthHubManager';
import Login from './components/Login';

// ConsultLink (telehealth)
import ConsultLinkDashboard from './components/ConsultLinkDashboard';
import JoinSession from './components/JoinSession';
import ConsultRoom from './components/ConsultRoom';

function App() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}

export default App;
