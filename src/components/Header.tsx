export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-2 bg-military-gray border-b-2 border-military-olive/50 font-mono">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="p-1 bg-military-yellow text-background-dark rounded-sm">
            <span className="material-symbols-outlined text-2xl font-bold">shield_with_heart</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter stencil-text leading-none text-military-yellow">RELAY NEXUS</h1>
            <span className="text-[10px] text-military-olive font-bold leading-none uppercase">Tactical AI Interface v2.04-STABLE</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4 text-xs font-bold text-slate-400">
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-military-yellow animate-pulse"></span> SECURE LINK ACTIVE</div>
          <div className="border-l border-military-olive/30 pl-4 uppercase tracking-widest">Sector 7 // Command Console</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center bg-black/40 px-3 py-1 rounded border border-military-olive/30">
          <span className="material-symbols-outlined text-sm text-military-yellow mr-2">search</span>
          <input className="bg-transparent border-none text-xs focus:ring-0 text-military-yellow placeholder:text-military-olive w-48 uppercase" placeholder="QUERY DATABASE..." type="text" />
        </div>
        <div className="flex gap-1">
          <button className="p-2 hover:bg-military-olive/20 text-slate-400"><span className="material-symbols-outlined">notifications</span></button>
          <button className="p-2 hover:bg-military-olive/20 text-slate-400"><span className="material-symbols-outlined">settings</span></button>
          <button className="ml-2 px-4 py-1 bg-military-red text-white text-xs font-black rounded hover:bg-red-700 uppercase">Emergency Stop</button>
        </div>
      </div>
    </header>
  );
}
