import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/voice");
    }
  }, [isAuthenticated, setLocation]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-transparent to-purple-500" />
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" className="text-cyan-500" />
        </svg>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-4 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">J</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
            JARVIS X
          </h1>
        </div>
        <a
          href={getLoginUrl()}
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors"
        >
          Sign In
        </a>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Main heading */}
          <div className="space-y-4">
            <h2 className="text-6xl md:text-7xl font-black leading-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-600 bg-clip-text text-transparent">
                Meet JARVIS X
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 font-light">
              The Next Generation AI Assistant with Real-Time Voice Communication
            </p>
          </div>

          {/* Description */}
          <div className="space-y-4 text-gray-400 text-lg max-w-2xl mx-auto">
            <p>
              Experience the future of AI interaction. JARVIS X combines cutting-edge speech recognition, advanced language models, and real-time voice synthesis to create a seamless conversational experience inspired by Iron Man's legendary AI assistant.
            </p>
            <p>
              Speak naturally. Get intelligent responses. No typing required. Just pure conversation.
            </p>
          </div>

          {/* CTA Button */}
          <div className="pt-8">
            <a
              href={getLoginUrl()}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className="relative inline-block px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105"
            >
              <span className="relative z-10">
                Launch Voice Interface
              </span>
              {isHovering && (
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg opacity-50 blur-lg -z-10" />
              )}
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-16 border-t border-cyan-500/20">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-cyan-400">Real-Time</div>
              <div className="text-sm text-gray-500">Voice Communication</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-cyan-400">GPT-4</div>
              <div className="text-sm text-gray-500">Powered Intelligence</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-cyan-400">Always</div>
              <div className="text-sm text-gray-500">Learning & Adapting</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-6 border-t border-cyan-500/20">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
            Powerful Capabilities
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-lg border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎤</span>
              </div>
              <h4 className="text-xl font-bold mb-2">Real-Time Voice</h4>
              <p className="text-gray-400">
                Speak naturally and get instant responses. No delays, no typing—pure conversation.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-lg border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h4 className="text-xl font-bold mb-2">Neural Memory</h4>
              <p className="text-gray-400">
                JARVIS learns about you over time, personalizing responses based on your preferences.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-lg border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔧</span>
              </div>
              <h4 className="text-xl font-bold mb-2">Smart Tools</h4>
              <p className="text-gray-400">
                Web search, weather updates, and more. JARVIS can execute tasks while you talk.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-lg border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="text-xl font-bold mb-2">Lightning Fast</h4>
              <p className="text-gray-400">
                Sub-500ms latency ensures responsive, natural conversation flow.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-lg border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔐</span>
              </div>
              <h4 className="text-xl font-bold mb-2">Secure & Private</h4>
              <p className="text-gray-400">
                Your conversations are encrypted and never shared with third parties.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-lg border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h4 className="text-xl font-bold mb-2">Always Evolving</h4>
              <p className="text-gray-400">
                Continuous improvements and new capabilities added regularly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-6 border-t border-cyan-500/20">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h3 className="text-4xl font-bold">Ready to Experience JARVIS X?</h3>
          <p className="text-xl text-gray-400">
            Join the future of AI interaction. Start your conversation now.
          </p>
          <a
            href={getLoginUrl()}
            className="inline-block px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105"
          >
            Sign In to Get Started
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-cyan-500/20 py-8 px-6 text-center text-gray-500 text-sm">
        <p>
          JARVIS X © 2026. Powered by LiveKit, OpenAI, and cutting-edge AI technology.
        </p>
      </footer>
    </div>
  );
}
