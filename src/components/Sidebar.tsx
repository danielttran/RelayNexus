import { useState, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';

interface TicketContext {
  id: string;
  title: string;
  description?: string;
  status: string;
  assignee?: string;
}

export default function Sidebar() {
  const [activeTicket, setActiveTicket] = useState<TicketContext | null>(null);

  useEffect(() => {
    const unlisten = listen<TicketContext>('ticket-loaded', (event) => {
      setActiveTicket(event.payload);
    });
    return () => {
      unlisten.then(f => f());
    };
  }, []);

  return (
    <aside className="w-72 bg-military-gray/50 border-r border-military-olive/30 flex flex-col font-mono text-xs">
      {/* Section: ACTIVE CONTEXT (replaces TASKS) */}
      <div className="p-4 border-b border-military-olive/20 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-military-yellow font-bold uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">target</span> Context Panel
          </h2>
          <span className="bg-military-olive/20 text-military-olive px-1.5 py-0.5 rounded text-[10px]">Active</span>
        </div>

        {activeTicket ? (
          <div className="space-y-4">
            <div className="p-3 bg-military-olive/10 border-l-2 border-military-yellow flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <span className="text-slate-100 font-bold break-words">{activeTicket.title}</span>
              </div>
              <div className="flex flex-col gap-1 mt-2 border-t border-military-olive/20 pt-2">
                 <span className="text-military-olive text-[10px]">ID: #{activeTicket.id}</span>
                 <span className="text-military-olive text-[10px]">STATUS: {activeTicket.status.toUpperCase()}</span>
                 <span className="text-military-olive text-[10px]">ASSIGNEE: {activeTicket.assignee?.toUpperCase() || 'UNASSIGNED'}</span>
              </div>
            </div>
            
            <div className="p-3 bg-black/20 border border-military-olive/20 rounded">
              <h3 className="text-[10px] text-slate-400 mb-1 uppercase tracking-widest">Description</h3>
              <p className="text-slate-300 text-[10px] whitespace-pre-wrap">{activeTicket.description || 'No description provided.'}</p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-black/40 border border-military-olive/20 rounded text-center text-slate-500 italic mt-8">
             <span className="material-symbols-outlined text-4xl text-military-olive/50 mb-2 block">space_dashboard</span>
             No active context.<br/>Query Nexus AI for target data.
          </div>
        )}
      </div>

      {/* Section: HISTORY */}
      <div className="p-4 border-t border-military-olive/20">
        <h2 className="text-slate-400 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">history</span> Session Logs
        </h2>
        <div className="space-y-1">
          <div className="flex items-center gap-2 py-1 text-slate-500 hover:text-slate-300 cursor-pointer">
            <span className="text-[10px] font-bold">14:20</span>
            <span className="truncate">LLM Orchestrator Init</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
