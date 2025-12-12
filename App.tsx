import React, { useState } from 'react';
import { Upload, Code, Zap, Layout, Github } from 'lucide-react';
import UploadZone from './components/UploadZone';
import CodeViewer from './components/CodeViewer';
import LoadingOverlay from './components/LoadingOverlay';
import { AppStatus } from './types';
import { generateCodeFromImage } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setStatus(AppStatus.ANALYZING);
    setError(null);
    setGeneratedCode('');

    try {
      const code = await generateCodeFromImage(file);
      setGeneratedCode(code);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setStatus(AppStatus.ERROR);
      setError(err.message || "Failed to generate code. Please check your API key and try again.");
    }
  };

  const handleReset = () => {
    setStatus(AppStatus.IDLE);
    setGeneratedCode('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0b0b12] text-gray-200 font-sans selection:bg-brand-500/30 selection:text-brand-100 flex flex-col">
      {/* Navbar */}
      <nav className="h-16 border-b border-dark-800 bg-dark-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              Visual<span className="text-brand-500">Reverse</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-dark-800/50 border border-dark-700">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span>Powered by Gemini 2.5 Flash</span>
             </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 flex flex-col lg:flex-row gap-6 relative">
        
        {/* Left Column: Input */}
        <div className={`flex flex-col gap-4 transition-all duration-500 ease-in-out ${status === AppStatus.SUCCESS ? 'lg:w-1/3' : 'lg:w-full max-w-3xl mx-auto'}`}>
           <div className="bg-dark-900 border border-dark-800 rounded-xl p-1 shadow-xl h-full flex flex-col">
              <div className="p-4 border-b border-dark-800 flex justify-between items-center">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-brand-500" />
                  Input Source
                </h2>
                {status === AppStatus.SUCCESS && (
                  <button 
                    onClick={handleReset}
                    className="text-xs text-gray-500 hover:text-white transition-colors"
                  >
                    Start Over
                  </button>
                )}
              </div>
              <div className="flex-1 p-4 relative min-h-[400px]">
                 <UploadZone onFileSelect={handleFileSelect} isProcessing={status === AppStatus.ANALYZING} />
                 {status === AppStatus.ANALYZING && <LoadingOverlay />}
              </div>
           </div>
           
           {/* Error Display */}
           {status === AppStatus.ERROR && (
             <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm flex items-start gap-3">
               <div className="mt-0.5">⚠️</div>
               <div>
                 <p className="font-semibold">Generation Failed</p>
                 <p className="opacity-80">{error}</p>
                 <button onClick={handleReset} className="mt-2 text-xs underline hover:text-red-300">Try Again</button>
               </div>
             </div>
           )}
        </div>

        {/* Right Column: Output (Only visible on success) */}
        {status === AppStatus.SUCCESS && (
          <div className="lg:w-2/3 flex flex-col animate-fade-in-up">
            <div className="bg-dark-900 border border-dark-800 rounded-xl p-1 shadow-xl h-[80vh] flex flex-col">
               <div className="p-4 border-b border-dark-800">
                  <h2 className="font-semibold text-white flex items-center gap-2">
                    <Code className="w-4 h-4 text-brand-500" />
                    Generated Code
                  </h2>
               </div>
               <div className="flex-1 p-1 overflow-hidden">
                  <CodeViewer code={generatedCode} />
               </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-dark-800 py-6 bg-dark-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; 2024 Visual Reverse Engineer. Built for developers.
          </p>
          <div className="flex items-center gap-4 text-gray-500">
             <a href="#" className="hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;