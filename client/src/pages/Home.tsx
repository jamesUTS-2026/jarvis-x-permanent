import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/voice");
    }
  }, [isAuthenticated, setLocation]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#00f3ff] font-mono flex items-center justify-center relative overflow-hidden">
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

      <div className="relative z-10 text-center max-w-2xl px-6">
        <h1 className="text-6xl font-bold mb-4 tracking-widest" style={{ textShadow: '0 0 20px #00f3ff' }}>
          JARVIS X
        </h1>
        <p className="text-xl mb-2 text-[#ff00ff]">EVOLVED NEURAL INTERFACE</p>
        <p className="text-sm text-[rgba(0,243,255,0.7)] mb-12 tracking-wide">
          Real-time voice assistant with self-improving neural memory
        </p>

        <div className="space-y-4">
          <p className="text-sm text-[rgba(0,243,255,0.6)]">
            Connect to the neural network and begin your conversation with an AI that learns and evolves.
          </p>
          <a
            href={getLoginUrl()}
            className="inline-block px-8 py-3 border-2 border-[#00f3ff] text-[#00f3ff] font-mono text-sm uppercase tracking-widest transition-all hover:bg-[#00f3ff] hover:text-[#050505] hover:shadow-[0_0_20px_#00f3ff]"
          >
            Initialize Connection
          </a>
        </div>
      </div>
    </div>
  );
}
