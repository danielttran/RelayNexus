import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

type MessageType = 'user' | 'assistant' | 'tool_call_pending' | 'tool_call_executing' | 'tool_result';

interface ChatMessage {
  id: string;
  type: MessageType;
  sender: 'OPERATOR' | 'NEXUS AI';
  timestamp: string;
  content?: string;
  command?: string;
  logs?: { text: string; isError: boolean }[];
}

interface CommandOutputEvent {
  text: string;
  is_error: boolean;
}

export default function MainArea() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      sender: 'NEXUS AI',
      timestamp: new Date().toLocaleTimeString(),
      content: 'SYSTEM INITIALIZED. Awaiting instructions.'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!('__TAURI_INTERNALS__' in window)) return;

    const unlisten = listen<CommandOutputEvent>('command-output', (event) => {
      setMessages((prev) => {
        const newMsgs = [...prev];
        const executingMsg = [...newMsgs].reverse().find(m => m.type === 'tool_call_executing');
        if (executingMsg) {
          executingMsg.logs = executingMsg.logs || [];
          executingMsg.logs.push({ text: event.payload.text, isError: event.payload.is_error });
        }
        return newMsgs;
      });
    });

    return () => {
      unlisten.then(f => f());
    };
  }, []);

  const handleSend = () => {
    if (!inputVal.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      sender: 'OPERATOR',
      timestamp: new Date().toLocaleTimeString(),
      content: inputVal
    };

    setMessages(prev => [...prev, newMsg]);
    setInputVal('');

    // Simulate LLM deciding to execute a command after a brief delay
    if (inputVal.toLowerCase().includes('run')) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'tool_call_pending',
          sender: 'NEXUS AI',
          timestamp: new Date().toLocaleTimeString(),
          command: 'echo "Executing..." && dir' // Simulated command
        }]);
      }, 1000);
    } else {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'assistant',
          sender: 'NEXUS AI',
          timestamp: new Date().toLocaleTimeString(),
          content: 'Command acknowledged. Processing request...'
        }]);
      }, 1000);
    }
  };

  const handleApprove = async (msgId: string, command: string) => {
    // Transition to executing state
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, type: 'tool_call_executing', logs: [] } : m));

    if (!('__TAURI_INTERNALS__' in window)) {
        setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === msgId ? { ...m, type: 'tool_result', content: 'BROWSER MOCK: Command executed (Tauri IPC unavailable).' } : m));
        }, 1500);
        return;
    }

    try {
      const result = await invoke<string>('execute_approved_command', { command });
      // Transition to result state
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, type: 'tool_result', content: result } : m));
    } catch (err) {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, type: 'tool_result', content: `Execution Error: ${err}` } : m));
    }
  };

  const handleReject = (msgId: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, type: 'tool_result', content: 'Execution rejected by OPERATOR.' } : m));
  };

  return (
    <section className="flex-1 flex flex-col bg-background-dark grid-bg relative">
      <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent pointer-events-none"></div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 relative z-10">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 max-w-3xl ${msg.type === 'user' ? 'ml-auto flex-row-reverse text-right' : ''}`}>

            <div className={`w-10 h-10 rounded flex items-center justify-center shrink-0 ${msg.sender === 'OPERATOR' ? 'bg-military-olive' : 'bg-military-yellow'}`}>
              <span className={`material-symbols-outlined ${msg.sender === 'OPERATOR' ? 'text-slate-100' : 'text-background-dark font-bold'}`}>
                {msg.sender === 'OPERATOR' ? 'person' : 'memory'}
              </span>
            </div>

            <div className="space-y-2 w-full max-w-2xl">
              <div className={`flex items-center gap-2 ${msg.type === 'user' ? 'justify-end' : ''}`}>
                {msg.type === 'user' ? (
                  <>
                    <span className="text-military-olive text-[10px] font-mono">{msg.timestamp}</span>
                    <span className="text-slate-100 font-mono text-xs font-black tracking-widest uppercase">{msg.sender}</span>
                  </>
                ) : (
                  <>
                    <span className="text-military-yellow font-mono text-xs font-black tracking-widest uppercase">{msg.sender}</span>
                    <span className="text-military-olive text-[10px] font-mono">{msg.timestamp}</span>
                  </>
                )}
              </div>

              {/* Renders Text Messages */}
              {(msg.type === 'user' || msg.type === 'assistant') && (
                <div className={`${msg.type === 'user' ? 'bg-primary/10 border-primary/40 inline-block' : 'bg-military-gray/80 border-military-olive/40'} p-4 border rounded-lg text-slate-200 font-mono text-sm leading-relaxed whitespace-pre-wrap`}>
                  {msg.content}
                </div>
              )}

              {/* Renders Pending Tool Call (Approval Card) */}
              {msg.type === 'tool_call_pending' && (
                <div className="border-2 border-military-red/40 rounded-lg overflow-hidden bg-black shadow-2xl shadow-military-red/10 w-full mt-2">
                  <div className="bg-military-red/10 px-4 py-2 border-b border-military-red/40 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-military-red font-mono text-xs font-black uppercase tracking-widest">
                      <span className="material-symbols-outlined text-sm">terminal</span> Security Gate // Execution Request
                    </div>
                  </div>
                  <div className="p-6 font-mono text-sm">
                    <div className="bg-military-olive/5 p-4 rounded border border-military-olive/20 mb-6">
                      <div className="text-[10px] text-military-olive uppercase font-bold mb-2">Command Payload:</div>
                      <div className="text-xs text-military-yellow break-all">{msg.command}</div>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => handleApprove(msg.id, msg.command!)} className="flex-1 bg-military-red hover:bg-red-700 text-white py-2 rounded font-bold uppercase text-xs">Approve Execution</button>
                      <button onClick={() => handleReject(msg.id)} className="flex-1 bg-transparent border border-military-olive text-military-olive hover:bg-military-olive/20 py-2 rounded font-bold uppercase text-xs">Reject</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Renders Executing Tool Call */}
              {msg.type === 'tool_call_executing' && (
                <div className="border border-military-yellow/40 rounded-lg overflow-hidden bg-black w-full mt-2">
                  <div className="bg-military-yellow/10 px-4 py-2 border-b border-military-yellow/40 flex items-center gap-2 text-military-yellow font-mono text-xs font-black uppercase tracking-widest">
                    <span className="material-symbols-outlined text-sm animate-spin">sync</span> Executing Payload
                  </div>
                  <div className="p-4 font-mono text-xs bg-black h-48 overflow-y-auto space-y-1">
                    {msg.logs?.map((log, i) => (
                      <div key={i} className={log.isError ? 'text-military-red' : 'text-slate-400'}>{log.text}</div>
                    ))}
                    <div className="text-military-yellow animate-pulse">_</div>
                  </div>
                </div>
              )}

              {/* Renders Tool Result */}
              {msg.type === 'tool_result' && (
                <div className="border border-military-olive/40 rounded-lg overflow-hidden bg-black/50 w-full mt-2">
                  <div className="bg-military-olive/10 px-4 py-2 flex items-center gap-2 text-military-olive font-mono text-xs font-black uppercase tracking-widest">
                    <span className="material-symbols-outlined text-sm">check_circle</span> Execution Completed
                  </div>
                  <div className="p-4 text-xs text-slate-300 font-mono border-t border-military-olive/20 whitespace-pre-wrap">
                    {msg.content}
                  </div>
                </div>
              )}

            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-military-gray/80 border-t border-military-olive/30 relative z-20">
        <div className="flex gap-4 items-center max-w-5xl mx-auto">
          <div className="flex-1 relative">
            <input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="w-full bg-black border border-military-olive/50 rounded p-4 text-military-yellow font-mono placeholder:text-military-olive focus:ring-1 focus:ring-military-yellow focus:border-military-yellow uppercase"
              placeholder="ENTER COMMAND..."
              type="text"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-3 text-military-olive">
              <button className="material-symbols-outlined hover:text-military-yellow transition-colors">mic</button>
              <button className="material-symbols-outlined hover:text-military-yellow transition-colors">attach_file</button>
            </div>
          </div>
          <button onClick={handleSend} className="bg-military-yellow text-background-dark p-4 rounded font-black uppercase font-mono tracking-widest flex items-center gap-2 hover:brightness-110 transition-all">
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </section>
  );
}
