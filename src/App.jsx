import { Routes, Route, Link } from 'react-router-dom';
import Portfolio from './Portfolio';
import NeuroTraceWeb from './NeuroTraceWeb';
import MRITracer3D from './MRITracer3D';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Portfolio />} />
      <Route path="/neurotrace" element={<NeuroTraceWeb />} />
      <Route path="/mri-tracer" element={<MRITracer3D />} />
    </Routes>
  );
}

export default App;