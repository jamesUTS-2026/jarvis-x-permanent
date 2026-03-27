import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { JarvisLayout, JarvisHeader, Panel, Controls } from '@/components/JarvisLayout';
import { Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thoughtProcess?: string;
  timestamp: Date;
}

interface MemoryItem {
  id: number;
  fact: string;
  importance: number;
  createdAt: Date;
}

export default function VoiceAssistant() {
  const { user, isAuthenticated } = useAuth();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [memory, setMemory] = useState<MemoryItem[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [diagnostics, setDiagnostics] = useState<string[]>([
    '> BOOTING KERNEL...',
    '> LOADING MEMORY MODULE...',
    '> ATTACHING REASONING LOOP...',
    '> READY.',
  ]);
  const [dataStream, setDataStream] = useState<string[]>([]);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // tRPC mutations and queries
  const processMessageMutation = trpc.voice.processMessage.useMutation();
  const getMemoryQuery = trpc.voice.getMemory.useQuery(undefined, { enabled: isAuthenticated });
  const getChatHistoryQuery = trpc.voice.getChatHistory.useQuery(undefined, { enabled: isAuthenticated });
  const getPreferencesQuery = trpc.voice.getPreferences.useQuery(undefined, { enabled: isAuthenticated });

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        addDiagnostic('LISTENING...');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleUserMessage(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        addDiagnostic(`ERROR: ${event.error.toUpperCase()}`);
      };
    }

    // Initialize voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => 
        v.name.includes('Google US English Male') || 
        v.name.includes('Microsoft David') ||
        v.lang.includes('en-US')
      );
      voiceRef.current = preferred || voices[0];
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  // Load initial data
  useEffect(() => {
    if (getMemoryQuery.data) {
      setMemory(getMemoryQuery.data);
    }
  }, [getMemoryQuery.data]);

  useEffect(() => {
    if (getChatHistoryQuery.data) {
      const formattedMessages = getChatHistoryQuery.data.map(msg => ({
        id: msg.id.toString(),
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        thoughtProcess: msg.thoughtProcess || undefined,
        timestamp: new Date(msg.createdAt),
      }));
      setMessages(formattedMessages);
    }
  }, [getChatHistoryQuery.data]);

  // Data stream animation
  useEffect(() => {
    const interval = setInterval(() => {
      const hex = Math.random().toString(16).substring(2, 10).toUpperCase();
      const line = `SYS_LOG::${hex}::${Date.now()}`;
      setDataStream(prev => [line, ...prev.slice(0, 19)]);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const addDiagnostic = (msg: string) => {
    setDiagnostics(prev => [`> ${msg}`, ...prev.slice(0, 9)]);
  };

  const speak = (text: string) => {
    if (!voiceRef.current) return;

    setIsSpeaking(true);
    const cleanText = text.replace(/[*_#`]/g, '');
    const chunks = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];

    let currentChunk = 0;
    const speakNext = () => {
      if (currentChunk >= chunks.length) {
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[currentChunk]);
      utterance.voice = voiceRef.current;
      utterance.pitch = (getPreferencesQuery.data?.voicePitch || 90) / 100;
      utterance.rate = (getPreferencesQuery.data?.voiceRate || 100) / 100;

      utterance.onend = () => {
        currentChunk++;
        setTimeout(speakNext, 200);
      };

      window.speechSynthesis.speak(utterance);
    };

    setTimeout(speakNext, 400);
  };

  const handleUserMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Add user message to UI
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    setIsLoading(true);
    addDiagnostic('PROCESSING...');

    try {
      const result = await processMessageMutation.mutateAsync({
        userMessage: text,
      });

      // Add assistant message
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        thoughtProcess: result.thoughtProcess,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Update memory if learned
      if (result.learned) {
        addDiagnostic(`LEARNED: ${result.learned}`);
        getMemoryQuery.refetch();
      }

      // Speak response
      speak(result.response);
      addDiagnostic('RESPONSE COMPLETE.');
    } catch (error) {
      addDiagnostic('ERROR: API_FAILURE');
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Neural link disrupted. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  const handleSend = (text: string) => {
    handleUserMessage(text);
  };

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isAuthenticated) {
    return (
      <JarvisLayout>
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">JARVIS X</h1>
            <p className="text-lg mb-8">Please log in to access the neural interface</p>
            <Loader2 className="animate-spin mx-auto" />
          </div>
        </div>
      </JarvisLayout>
    );
  }

  return (
    <JarvisLayout>
      <JarvisHeader 
        isListening={isListening}
        apiLinked={true}
        memoryCount={memory.length}
        isLearning={isLoading}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 h-[calc(100vh-120px)]">
        {/* Memory Panel */}
        <Panel title="Neural Memory" className="md:col-span-1">
          <div className="space-y-2">
            <div className="text-xs text-[#00f3ff] mb-3">
              {memory.length} UNITS STORED
            </div>
            {memory.length === 0 ? (
              <div className="text-xs text-[rgba(0,243,255,0.5)]">
                No memories yet. Share something about yourself to begin learning.
              </div>
            ) : (
              memory.map(item => (
                <div key={item.id} className="text-xs p-2 bg-[rgba(0,243,255,0.05)] border-l-2 border-[#ff00ff]">
                  <span className="text-[#ff00ff] font-bold">[FACT]</span> {item.fact}
                </div>
              ))
            )}
          </div>
        </Panel>

        {/* Chat Panel */}
        <Panel title="Communication Interface" className="md:col-span-1">
          <div ref={chatContainerRef} className="space-y-3 h-full overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-xs text-[rgba(0,243,255,0.5)]">
                System online. Jarvis X at your service. How shall we proceed?
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
                  {msg.thoughtProcess && (
                    <div className="text-xs text-[rgba(0,243,255,0.5)] italic mb-1">
                      {msg.thoughtProcess}
                    </div>
                  )}
                  <div
                    className={`inline-block max-w-xs p-2 text-xs ${
                      msg.role === 'user'
                        ? 'bg-[rgba(255,0,255,0.1)] border-r-2 border-[#ff00ff] text-white'
                        : 'bg-[rgba(0,243,255,0.1)] border-l-2 border-[#00f3ff] text-[#00f3ff]'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="text-xs text-[#00f3ff] animate-pulse">
                Thinking...
              </div>
            )}
          </div>
        </Panel>

        {/* Diagnostics Panel */}
        <Panel title="System Diagnostics" className="md:col-span-1">
          <div className="space-y-1">
            {diagnostics.map((diag, i) => (
              <div key={i} className="text-xs text-[rgba(0,243,255,0.6)] font-mono">
                {diag}
              </div>
            ))}
            <div className="mt-4 pt-4 border-t border-[rgba(0,243,255,0.2)]">
              <div className="text-xs font-bold text-[#f3ff00] mb-2">LIVE STREAM</div>
              {dataStream.map((line, i) => (
                <div key={i} className="text-xs text-[rgba(255,0,255,0.4)] font-mono">
                  {line}
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      <Controls
        onSend={handleSend}
        onMicClick={handleMicClick}
        isListening={isListening}
        isLoading={isLoading}
      />
    </JarvisLayout>
  );
}
