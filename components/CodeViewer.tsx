import React, { useState, useMemo } from 'react';
import { Copy, Check, Terminal, Code2, Palette, Type, Zap, Layers } from 'lucide-react';
import { TokenBlock } from '../types';

interface CodeViewerProps {
  code: string;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'tokens'>('code');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract Design Tokens from the comment block at the end of the generated code
  const tokens: TokenBlock | null = useMemo(() => {
    try {
      // 1. Find the block marked for design tokens.
      const match = code.match(/DESIGN_TOKENS:([\s\S]*?)\*\//);
      
      if (!match || !match[1]) return null;

      let jsonString = match[1];

      // 2. Clean up the string to remove block comment formatting (asterisks)
      jsonString = jsonString
        .replace(/^\s*\*\s?/gm, '') 
        .trim();
      
      // 3. Find the valid JSON object bounds (from first { to last })
      const firstBrace = jsonString.indexOf('{');
      const lastBrace = jsonString.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1) return null;
      
      jsonString = jsonString.substring(firstBrace, lastBrace + 1);

      return JSON.parse(jsonString) as TokenBlock;
    } catch (e) {
      console.warn('Could not parse design tokens:', e);
    }
    return null;
  }, [code]);

  // Handle potentially nested color objects by flattening them for display
  const flattenedColors = useMemo(() => {
    if (!tokens?.color_palette) return [];
    const flattened: { name: string; value: string }[] = [];
    
    Object.entries(tokens.color_palette).forEach(([key, val]) => {
      if (typeof val === 'object' && val !== null) {
        Object.entries(val).forEach(([subKey, subVal]) => {
          flattened.push({ name: `${key}-${subKey}`, value: String(subVal) });
        });
      } else {
        flattened.push({ name: key, value: String(val) });
      }
    });
    return flattened;
  }, [tokens]);

  // Helper to render property values that might be objects
  const renderTokenValue = (value: any) => {
    if (typeof value === 'object' && value !== null) {
      return (
        <div className="flex flex-col items-end gap-1 my-1">
          {Object.entries(value).map(([k, v]) => (
            <div key={k} className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">{k}:</span>
              <span className="break-all text-right">{String(v)}</span>
            </div>
          ))}
        </div>
      );
    }
    return String(value);
  };

  // Simple syntax highlighting for React/TSX
  const highlightedCode = useMemo(() => {
    return code
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Highlight keywords
      .replace(/\b(import|export|const|return|function|interface|default|from)\b/g, '<span class="text-purple-400">$1</span>')
      // Highlight types
      .replace(/\b(React|FC|string|number|boolean|void)\b/g, '<span class="text-yellow-300">$1</span>')
      // Highlight JSX tags
      .replace(/(&lt;\/?)([A-Z][a-zA-Z0-9]*)/g, '$1<span class="text-blue-400">$2</span>')
      // Highlight strings
      .replace(/(['"`])(.*?)\1/g, '<span class="text-green-400">$1$2$1</span>');
  }, [code]);

  return (
    <div className="w-full h-full flex flex-col bg-dark-900 rounded-xl border border-dark-800 overflow-hidden shadow-2xl transition-all duration-300">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between px-4 py-2 bg-dark-950 border-b border-dark-800">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
          </div>
          
          <div className="h-5 w-[1px] bg-dark-800"></div>

          <div className="flex bg-dark-900 rounded-lg p-1 border border-dark-800">
            <button
              onClick={() => setActiveTab('code')}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                ${activeTab === 'code' 
                  ? 'bg-dark-800 text-brand-500 shadow-sm' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-dark-800/50'}
              `}
              aria-label="View Source Code"
            >
              <Code2 className="w-3.5 h-3.5" />
              Source
            </button>
            <button
              onClick={() => setActiveTab('tokens')}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                ${activeTab === 'tokens' 
                  ? 'bg-dark-800 text-brand-500 shadow-sm' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-dark-800/50'}
                ${!tokens ? 'opacity-70' : ''}
              `}
              title={!tokens ? "No tokens found in generated code" : "View Design System"}
              aria-label="View Design Tokens"
            >
              <Palette className="w-3.5 h-3.5" />
              Design System
            </button>
          </div>
        </div>
        
        <button
          onClick={handleCopy}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all
            ${copied 
              ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
              : 'bg-dark-800 text-gray-300 border border-transparent hover:bg-dark-700 hover:text-white'}
          `}
          aria-label="Copy Code to Clipboard"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative bg-[#0b0b12]">
        
        {/* Source Code View */}
        <div className={`absolute inset-0 overflow-auto p-4 scrollbar-thin scrollbar-thumb-dark-700 ${activeTab === 'code' ? 'z-10 opacity-100' : 'z-0 opacity-0 pointer-events-none'}`}>
          <pre className="font-mono text-sm leading-relaxed text-gray-300">
            <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
          </pre>
        </div>

        {/* Design Tokens View */}
        <div className={`absolute inset-0 overflow-auto p-6 scrollbar-thin scrollbar-thumb-dark-700 ${activeTab === 'tokens' ? 'z-10 opacity-100' : 'z-0 opacity-0 pointer-events-none'}`}>
          {tokens ? (
            <div className="space-y-8 max-w-3xl mx-auto">
              {/* Header */}
              <div className="border-b border-dark-800 pb-4">
                 <h3 className="text-xl font-bold text-white flex items-center gap-2">
                   <Layers className="w-5 h-5 text-brand-500" />
                   Extracted Design System
                 </h3>
                 <p className="text-sm text-gray-500 mt-1">
                   Variables and styles automatically reversed-engineered from the UI image.
                 </p>
              </div>

              {/* Colors */}
              <section>
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Palette className="w-4 h-4" /> Color Palette
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {flattenedColors.map(({ name, value }) => (
                    <div key={name} className="group bg-dark-900 rounded-lg p-3 border border-dark-800 hover:border-brand-500/50 transition-all">
                      <div 
                        className="h-16 rounded-md mb-3 shadow-inner border border-white/5 relative overflow-hidden"
                        style={{ backgroundColor: value }}
                      >
                         <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-white capitalize truncate" title={name.replace(/_/g, ' ')}>{name.replace(/_/g, ' ')}</span>
                        <span className="text-[10px] font-mono text-gray-500 uppercase truncate" title={value}>{value}</span>
                      </div>
                    </div>
                  ))}
                  {flattenedColors.length === 0 && <p className="text-gray-500 text-sm italic col-span-full">No colors found.</p>}
                </div>
              </section>

              {/* Typography */}
              <section>
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Type className="w-4 h-4" /> Typography
                </h4>
                <div className="grid gap-3">
                   {Object.entries(tokens.typography || {}).map(([name, value]) => (
                     <div key={name} className="flex items-center justify-between p-3 bg-dark-900 rounded-lg border border-dark-800 min-h-[50px]">
                        <span className="text-sm text-gray-300 capitalize font-medium">{name.replace(/_/g, ' ')}</span>
                        <div className="text-xs font-mono text-brand-400 bg-brand-500/10 px-2 py-1 rounded border border-brand-500/20 max-w-[60%] overflow-hidden">
                          {renderTokenValue(value)}
                        </div>
                     </div>
                   ))}
                   {Object.keys(tokens.typography || {}).length === 0 && <p className="text-gray-500 text-sm italic">No typography tokens found.</p>}
                </div>
              </section>

              {/* Animations */}
              <section>
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Animations
                </h4>
                <div className="grid gap-3">
                   {Object.entries(tokens.animation_constants || {}).map(([name, value]) => (
                     <div key={name} className="flex items-center justify-between p-3 bg-dark-900 rounded-lg border border-dark-800 group hover:bg-dark-800 transition-colors">
                        <span className="text-sm text-gray-300 capitalize font-medium">{name.replace(/_/g, ' ')}</span>
                        <div className="text-xs text-purple-400">
                          {renderTokenValue(value)}
                        </div>
                     </div>
                   ))}
                   {Object.keys(tokens.animation_constants || {}).length === 0 && <p className="text-gray-500 text-sm italic">No animation tokens found.</p>}
                </div>
              </section>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
               <Layers className="w-12 h-12 mb-4 opacity-20" />
               <p className="font-medium">No design tokens detected</p>
               <p className="text-sm mt-2 max-w-md text-center">
                 The AI might have skipped generating the token block. Try regenerating the code.
               </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-dark-950 border-t border-dark-800 flex items-center justify-between text-xs text-gray-500 font-mono">
        <div className="flex items-center gap-2">
            <Terminal className="w-3 h-3" />
            <span>{activeTab === 'code' ? 'TypeScript React' : 'JSON Design Tokens'}</span>
        </div>
        <div>
            {code.length} chars
        </div>
      </div>
    </div>
  );
};

export default CodeViewer;