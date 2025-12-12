import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, FileSearch } from 'lucide-react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleFile(file);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    onFileSelect(file);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div
        className={`
          relative group flex flex-col items-center justify-center w-full h-full min-h-[300px]
          border-2 border-dashed rounded-xl transition-all duration-300 ease-out
          ${isDragging 
            ? 'border-brand-500 bg-brand-500/10 scale-[0.99] shadow-inner' 
            : 'border-dark-800 bg-dark-900 hover:border-brand-500/50 hover:bg-dark-800'}
          ${isProcessing ? 'opacity-50 pointer-events-none grayscale' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleFileInput}
          accept="image/*"
          disabled={isProcessing}
          aria-label="Upload UI Image"
        />

        {preview ? (
          <div className="relative w-full h-full p-4 flex items-center justify-center overflow-hidden animate-fade-in">
             {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={preview} 
              alt="Uploaded UI Preview" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]" 
            />
            <div className="absolute inset-0 bg-dark-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-sm">
              <Upload className="w-8 h-8 mb-2 text-brand-500" />
              <span className="font-medium">Click or Drop to Replace</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-6">
            <div className={`
              p-5 rounded-full mb-6 transition-all duration-300
              ${isDragging ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'bg-dark-800 text-gray-400 group-hover:bg-dark-700 group-hover:text-brand-500 group-hover:scale-110'}
            `}>
              {isDragging ? <FileSearch className="w-10 h-10 animate-bounce" /> : <Upload className="w-10 h-10" />}
            </div>
            
            <p className="mb-3 text-xl text-gray-200 font-semibold tracking-tight">
              <span className="text-brand-500">Upload Image</span> to Analyze
            </p>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              Drag & drop any screenshot, mockup, or wireframe here to extract code.
            </p>
            
            <div className="mt-8 flex flex-wrap justify-center gap-3">
               <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-950 border border-dark-800 text-[10px] text-gray-400 font-mono uppercase tracking-wide">
                 <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> PNG
               </div>
               <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-950 border border-dark-800 text-[10px] text-gray-400 font-mono uppercase tracking-wide">
                 <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> JPG
               </div>
               <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-950 border border-dark-800 text-[10px] text-gray-400 font-mono uppercase tracking-wide">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> WEBP
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadZone;