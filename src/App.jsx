import { Routes, Route, Link } from 'react-router-dom';
import Portfolio from './Portfolio';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import NeuroTraceWeb from './NeuroTraceWeb';
import MRITracer3D from './MRITracer3D';
import HealthHubManager from './components/HealthHubManager';
import Login from './components/Login';

function App() {
  return (
    <AuthProvider>

      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/neurotrace" element={<NeuroTraceWeb />} />
        <Route path="/login" element={<Login />} />
        <Route path="/healthhub" element={<ProtectedRoute><HealthHubManager /></ProtectedRoute>} />
        <Route path="/mri-tracer" element={<MRITracer3D />} />

      </Routes>

    </AuthProvider>
  );
}

export default App;