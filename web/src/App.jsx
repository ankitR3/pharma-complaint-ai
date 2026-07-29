import React from 'react';
import LeftFormbar from './Components/layout/LeftFormbar';
import RightAIBar from './Components/layout/RightAIBar';

function App() {
  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-slate-100 overflow-hidden font-['Inter',sans-serif]">
      {/* Left Form Bar */}
      <LeftFormbar />

      {/* Right AI Copilot Bar */}
      <RightAIBar />
    </div>
  );
}

export default App;
