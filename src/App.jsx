import { Routes, Route, Link } from 'react-router-dom';
import Portfolio from './Portfolio';
import NeuroTraceWeb from './NeuroTraceWeb';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Portfolio />} />
      <Route path="/neurotrace" element={<NeuroTraceWeb />} />
    </Routes>
  );
}

export default App;