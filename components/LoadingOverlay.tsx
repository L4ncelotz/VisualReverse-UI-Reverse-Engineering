import React from 'react';
import { Cpu, Scan, Sparkles } from 'lucide-react';

const LoadingOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <div className="relative">
        {/* Pulsing rings */}
        <div className="absolute inset-0 rounded-full border-2 border-brand-500/30 animate-ping"></div>
        <div className="absolute inset-[-12px] rounded-full border border-purple-500/20 animate-pulse"></div>
        
        {/* Icon */}
        <div className="relative bg-dark-900 p-6 rounded-full border border-dark-700 shadow-2xl">
          <Scan className="w-10 h-10 text-brand-500 animate-pulse" />
        </div>
      </div>
      
      <div className="mt-8 space-y-2 text-center">
        <h3 className="text-xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500 animate-spin-slow" />
            Analyzing UI Patterns
        </h3>
        <div className="flex flex-col gap-1 text-sm text-gray-400 font-mono">
           <span className="animate-fade-in delay-75">Detecting components...</span>
           <span className="animate-fade-in delay-150">Extracting design tokens...</span>
           <span className="animate-fade-in delay-300">Generating Tailwind classes...</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;