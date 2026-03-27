import { useRef, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { JarvisLayout, JarvisHeader, Panel, Controls } from '@/components/JarvisLayout';
import { Loader2 } from 'lucide-react';
import { speak, stopSpeech, isSpeaking, pauseSpeech, resumeSpeech, type TTSConfig } from '@/lib/openaiTTS';

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
  const [isSpeakingState, setIsSpeakingState] = useState(false);
  const [diagnostics, setDiagnostics] = useState<string[]>([
    '> BOOTING KERNEL...',
    '> LOADING MEMORY MODULE...',
    '> ATTACHING REASONING LOOP...',
    '> INITIALIZING VOICE ENGINE (OpenAI TTS)...',
    '> READY.',
  ]);
  const [dataStream, setDataStream] = useState<string[]>([]);

  const recognitionRef = useRef<any>(null);
  const ttsConfigRef = useRef<TTSConfig>({
    voice: 'onyx',  // Deep male voice - Iron Man JARVIS style
    speed: 1.0,
  });

  // tRPC mutations and queries
  const processMessageMutation = trpc.voice.processMessage.useMutation();
  const getMemoryQuery = trpc.voice.getMemory.useQuery(undefined, { enabled: isAuthenticated });
  const getChatHistoryQuery = trpc.voice.getChatHistory.useQuery(undefined, { enabled: isAuthenticated });
  const getPreferencesQuery = trpc.voice.getPreferences.useQuery(undefined, { enabled: isAuthenticated });
  const getModelsQuery = trpc.models.listAvailable.useQuery(undefined, { enabled: isAuthenticated });
  const getTracesQuery = trpc.performance.getTraces.useQuery({ limit: 50 }, { enabled: isAuthenticated });

  // Initialize OpenAI TTS and Speech Recognition
  useEffect(() => {
    // Initialize OpenAI TTS (no browser voice loading needed)
    addDiagnostic('VOICE ENGINE READY');
    console.log('[JARVIS] OpenAI TTS initialized - voice: onyx (deep male)');

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
        timestamp: new Date(msg.createdAt),
      }));
      setMessages(formattedMessages);
    }
  }, [getChatHistoryQuery.data]);

  const addDiagnostic = useCallback((message: string) => {
    setDiagnostics(prev => [...prev.slice(-9), message]);
    setDataStream(prev => [...prev.slice(-19), `[${new Date().toISOString()}] ${message}`]);
  }, []);

  const handleUserMessage = useCallback(async (userInput: string) => {
    if (!userInput.trim() || !isAuthenticated) return;

    const userMessage: Message = {
      id: Math.random().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    addDiagnostic(`USER: ${userInput.substring(0, 50)}...`);

    try {
      const response = await processMessageMutation.mutateAsync({
        userMessage: userInput,
      });

      const assistantMessage: Message = {
        id: Math.random().toString(),
        role: 'assistant',
        content: response.response,
        thoughtProcess: response.thoughtProcess,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      addDiagnostic('RESPONSE GENERATED');

      // Speak the response using OpenAI TTS
      setIsSpeakingState(true);
      addDiagnostic('SPEAKING...');
      
      await speak(response.response, ttsConfigRef.current, (progress) => {
        if (progress === 100) {
          addDiagnostic('SPEECH COMPLETE');
        }
      });
      
      setIsSpeakingState(false);
    } catch (error) {
      console.error('Error processing message:', error);
      addDiagnostic('ERROR: PROCESSING FAILED');
      setIsLoading(false);
    }

    setIsLoading(false);
  }, [isAuthenticated, processMessageMutation, addDiagnostic]);

  const handleVoiceInput = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  }, [isListening]);

  const handleStopSpeech = useCallback(() => {
    stopSpeech();
    setIsSpeakingState(false);
    addDiagnostic('SPEECH STOPPED');
  }, [addDiagnostic]);

  const handleTextInput = useCallback((text: string) => {
    handleUserMessage(text);
  }, [handleUserMessage]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <JarvisLayout>
      <JarvisHeader 
        isListening={isListening}
        apiLinked={isAuthenticated}
        memoryCount={memory.length}
        isLearning={isLoading}
      />
      
      <div className="grid grid-cols-3 gap-4 h-full p-4">
        {/* Neural Memory Panel */}
        <Panel title="NEURAL MEMORY">
          <div className="space-y-2 text-sm">
            <div className="text-cyan-400">
              {memory.length} UNITS STORED
            </div>
            {memory.length === 0 ? (
              <div className="text-gray-500 text-xs">
                No memories yet. Share something about yourself to begin learning.
              </div>
            ) : (
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {memory.map(item => (
                  <div key={item.id} className="text-cyan-300 text-xs border-l border-cyan-500 pl-2">
                    {item.fact}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Panel>

        {/* Communication Interface */}
        <Panel title="COMMUNICATION INTERFACE">
          <div 
            ref={chatContainerRef}
            className="space-y-3 max-h-96 overflow-y-auto mb-4"
          >
            {messages.length === 0 ? (
              <div className="text-cyan-400 text-sm">
                I am here, ready to assist. Please let me know how I can help.
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`text-sm ${msg.role === 'user' ? 'text-purple-400' : 'text-cyan-400'}`}>
                  <div className="font-bold">{msg.role === 'user' ? 'YOU' : 'JARVIS X'}:</div>
                  <div className="ml-2">{msg.content}</div>
                  {msg.thoughtProcess && (
                    <div className="text-gray-500 text-xs ml-2 mt-1">
                      [Thought: {msg.thoughtProcess}]
                    </div>
                  )}
                </div>
              ))
            )}
            {isLoading && <Loader2 className="animate-spin text-cyan-400" />}
          </div>

          <Controls
            isListening={isListening}
            isLoading={isLoading}
            onMicClick={handleVoiceInput}
            onSend={handleTextInput}
          />
        </Panel>

        {/* System Diagnostics */}
        <Panel title="SYSTEM DIAGNOSTICS">
          <div className="space-y-1 text-xs font-mono max-h-96 overflow-y-auto">
            {diagnostics.map((diag, i) => (
              <div key={i} className="text-yellow-400">
                {diag}
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-cyan-500">
            <div className="text-cyan-400 text-xs font-bold mb-2">LIVE STREAM</div>
            <div className="space-y-1 text-purple-400 text-xs max-h-32 overflow-y-auto">
              {dataStream.map((data, i) => (
                <div key={i}>{data}</div>
              ))}
            </div>
          </div>
        </Panel>
      </div>
    </JarvisLayout>
  );
}
