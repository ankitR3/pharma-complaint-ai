import React from 'react';
import LeftFormbar from './Components/layout/LeftFormbar';
import RightAISection from './Components/layout/RightAISection';

function App() {
  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-slate-100 overflow-hidden font-['Inter',sans-serif]">
      {/* Left Form Bar */}
      <LeftFormbar />

      {/* Right AI Copilot Bar */}
      <RightAISection />
    </div>
  );
}

export default App;
