import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface JarvisLayoutProps {
  children: React.ReactNode;
}

export const JarvisLayout: React.FC<JarvisLayoutProps> = ({ children }) => {
  const [scanlineOpacity, setScanlineOpacity] = useState(0.6);

  useEffect(() => {
    const interval = setInterval(() => {
      setScanlineOpacity(prev => prev === 0.6 ? 0.4 : 0.6);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-[#00f3ff] font-mono overflow-hidden relative">
      {/* Grid Background */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 243, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 243, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Scanline Effect */}
      <div 
        className="fixed inset-0 pointer-events-none z-50 transition-opacity duration-3000"
        style={{
          background: `
            linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.15) 50%),
            linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))
          `,
          backgroundSize: '100% 3px, 2px 100%',
          opacity: scanlineOpacity,
        }}
      />

      {children}
    </div>
  );
};

interface HeaderProps {
  isListening: boolean;
  apiLinked: boolean;
  memoryCount: number;
  isLearning: boolean;
}

export const JarvisHeader: React.FC<HeaderProps> = ({
  isListening,
  apiLinked,
  memoryCount,
  isLearning,
}) => {
  return (
    <header className="relative z-10 border-b border-[#00f3ff] bg-[rgba(10,10,10,0.9)] px-6 py-4 flex justify-between items-center shadow-[0_0_15px_rgba(0,243,255,0.4)]">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold tracking-widest text-[#00f3ff] glitch" style={{ textShadow: '0 0 10px #00f3ff' }}>
          JARVIS X
        </h1>
        <p className="text-xs tracking-widest text-[#ff00ff]">EVOLVED NEURAL CORE v2.0</p>
      </div>

      <div className="grid grid-cols-4 gap-4 text-xs">
        <StatusItem 
          label="VOICE" 
          active={true}
        />
        <StatusItem 
          label="LINK" 
          active={apiLinked}
        />
        <StatusItem 
          label="MEMORY" 
          active={memoryCount > 0}
        />
        <StatusItem 
          label="LEARN" 
          active={isLearning}
        />
      </div>
    </header>
  );
};

interface StatusItemProps {
  label: string;
  active: boolean;
}

const StatusItem: React.FC<StatusItemProps> = ({ label, active }) => (
  <div className="flex items-center gap-2 px-2 py-1 border border-[rgba(0,243,255,0.2)]">
    <div 
      className={cn(
        "w-1.5 h-1.5 rounded-full",
        active 
          ? "bg-[#00f3ff] shadow-[0_0_8px_#00f3ff]" 
          : "bg-[#333]"
      )}
    />
    <span className="text-[0.65rem] uppercase tracking-widest">{label}</span>
  </div>
);

interface PanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Panel: React.FC<PanelProps> = ({ title, children, className }) => (
  <div className={cn(
    "bg-[rgba(10,10,10,0.9)] border border-[rgba(0,243,255,0.2)] flex flex-col relative overflow-hidden",
    className
  )}>
    {/* Corner decoration */}
    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00f3ff]" />
    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#ff00ff]" />

    {/* Header */}
    <div className="px-3 py-2 bg-[rgba(0,243,255,0.05)] border-b border-[rgba(0,243,255,0.2)] flex justify-between items-center">
      <h2 className="text-xs font-bold uppercase tracking-widest text-[#f3ff00]">{title}</h2>
    </div>

    {/* Content */}
    <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-[#00f3ff] scrollbar-track-transparent">
      {children}
    </div>
  </div>
);

interface ControlsProps {
  onSend: (message: string) => void;
  onMicClick: () => void;
  isListening: boolean;
  isLoading: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  onSend,
  onMicClick,
  isListening,
  isLoading,
}) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative z-10 border-t border-[#00f3ff] bg-[rgba(10,10,10,0.9)] px-6 py-4 flex gap-4 items-center">
      <button
        onClick={onMicClick}
        disabled={isLoading}
        className={cn(
          "w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl font-bold transition-all",
          isListening
            ? "border-[#ff00ff] text-[#ff00ff] shadow-[0_0_15px_#ff00ff] animate-pulse"
            : "border-[#00f3ff] text-[#00f3ff] hover:shadow-[0_0_15px_#00f3ff]"
        )}
      >
        🎤
      </button>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Execute command..."
        className="flex-1 bg-[rgba(0,0,0,0.6)] border border-[rgba(0,243,255,0.3)] text-[#00f3ff] px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#00f3ff] focus:shadow-[0_0_10px_rgba(0,243,255,0.2)]"
      />

      <button
        onClick={handleSend}
        disabled={isLoading || !input.trim()}
        className="px-6 py-2 border border-[#00f3ff] text-[#00f3ff] font-mono text-xs uppercase tracking-widest transition-all hover:bg-[#00f3ff] hover:text-[#050505] hover:shadow-[0_0_15px_#00f3ff] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Send
      </button>
    </div>
  );
};

export default JarvisLayout;
