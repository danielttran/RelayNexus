import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface AppSettings {
  provider_id: string;
  redmine_url: string;
  redmine_api_key: string;
}

export default function Settings() {
  const [providerId, setProviderId] = useState('easy-redmine');
  const [apiKey, setApiKey] = useState('');
  const [configPath, setConfigPath] = useState('');
  const [saveStatus, setSaveStatus] = useState<string>('Ready to Commit');

  useEffect(() => {
    // Check if running inside Tauri
    if (!('__TAURI_INTERNALS__' in window)) {
      setConfigPath('BROWSER MOCK // TAURI UNAVAILABLE');
      return;
    }

    // Load config path
    invoke<string>('get_config_path_str').then(setConfigPath).catch(console.error);

    // Load existing settings
    invoke<AppSettings>('load_settings').then(settings => {
      setProviderId(settings.provider_id || 'easy-redmine');
      setApiKey(settings.redmine_api_key || '');
    }).catch(console.error);
  }, []);

  const handleSave = async () => {
    if (!('__TAURI_INTERNALS__' in window)) {
      setSaveStatus('Error: run `npm run tauri dev`');
      return;
    }

    setSaveStatus('Saving...');
    try {
      await invoke('save_settings', {
        providerId: providerId,
        redmineUrl: 'https://redmine.example.com', // Placeholder if not used in UI specifically, could be added later
        redmineApiKey: apiKey
      });
      setSaveStatus('Saved!');
      setTimeout(() => setSaveStatus('Ready to Commit'), 2000);
    } catch (e: any) {
      console.error(e);
      setSaveStatus(`Error: ${e}`);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#0d1218] flex flex-col h-full font-display">
      {/* Decorative scanline overlay */}
      <div className="absolute inset-0 scanline opacity-10 z-[50] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto space-y-10 w-full z-10 flex-1 relative">
        {/* Section: Ticket Provider */}
        <section className="rugged-border bg-panel-dark/40 p-8">
          <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
            <span className="material-symbols-outlined text-slate-600 text-3xl">hub</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Provider Dropdown */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-accent-yellow uppercase tracking-widest">Provider_ID</label>
              <div className="relative group">
                <select
                  value={providerId}
                  onChange={(e) => setProviderId(e.target.value)}
                  className="appearance-none w-full bg-black border border-slate-700 text-slate-200 font-mono text-sm py-4 px-4 pr-10 focus:ring-1 focus:ring-accent-yellow focus:border-accent-yellow transition-all rounded-none cursor-pointer"
                >
                  <option value="easy-redmine">Easy Redmine</option>
                  <option value="jira">Jira Software</option>
                  <option value="github">GitHub Issues</option>
                  <option value="linear">Linear</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-accent-yellow">
                  <span className="material-symbols-outlined">expand_more</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-600 font-mono">Select upstream tactical database provider.</p>
            </div>

            {/* Access Token Input */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-accent-yellow uppercase tracking-widest">Secure_Access_Token</label>
              <div className="relative group">
                <input
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-black border border-slate-700 text-slate-200 font-mono text-sm py-4 px-4 focus:ring-1 focus:ring-accent-yellow focus:border-accent-yellow transition-all rounded-none placeholder:text-slate-800"
                  placeholder="••••••••••••••••"
                  type="password"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                  <span className="material-symbols-outlined text-slate-700 text-lg">lock</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-600 font-mono">Token must have administrative READ/WRITE permissions.</p>
            </div>
          </div>

          {/* Save Button Section */}
          <div className="mt-10 flex flex-col items-end gap-4 border-t border-slate-800 pt-6">
            <button onClick={handleSave} className="group relative px-8 py-4 bg-accent-yellow text-black font-black uppercase text-sm tracking-tighter hover:bg-yellow-500 transition-all flex items-center gap-3">
              <span className="material-symbols-outlined font-bold">encrypted</span>
              Save to Encrypted Storage
              <div className="absolute -right-1 -bottom-1 size-3 bg-black border-l border-t border-accent-yellow rotate-45 translate-x-1.5 translate-y-1.5"></div>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-slate-500 uppercase">Verification status:</span>
              <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${saveStatus === 'Error' ? 'text-red-500' : 'text-green-500'}`}>{saveStatus}</span>
            </div>
          </div>
        </section>

        {/* Tactical Overlays / Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-panel-dark/20 border-l-2 border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-slate-500 text-sm">storage</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Local Cache</span>
            </div>
            <div className="text-lg font-mono text-slate-300">12.4 MB</div>
          </div>
          <div className="p-4 bg-panel-dark/20 border-l-2 border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-slate-500 text-sm">schedule</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sync Frequency</span>
            </div>
            <div className="text-lg font-mono text-slate-300">60 SEC</div>
          </div>
          <div className="p-4 bg-panel-dark/20 border-l-2 border-accent-red/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-accent-red text-sm">security</span>
              <span className="text-[10px] font-bold text-accent-red uppercase tracking-widest">Encryption</span>
            </div>
            <div className="text-lg font-mono text-slate-300">AES-256-GCM</div>
          </div>
        </div>
      </div>

      {/* Sub-Footer contained to settings pane to emulate config.json location bar */}
      <footer className="h-10 border-t border-slate-800 flex items-center justify-between px-6 z-10 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary animate-pulse"></span>
            <span className="text-[9px] font-mono text-slate-500 uppercase">Config Path:</span>
            <span className="text-[9px] font-mono text-slate-300">{configPath || '%appdata%\\RelayNexus\\config.json'}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 divide-x divide-slate-800">
          <div className="flex items-center gap-2 px-4">
            <span className="text-[9px] font-mono text-slate-500 uppercase">System:</span>
            <span className="text-[9px] font-mono text-slate-300 uppercase">V2.4.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
