import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import CommandPalette from '../components/CommandPalette';
import AiPanel from '../components/AiPanel';

export default function AppLayout() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen(true); }
      if (e.key === 'Escape') setPaletteOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="fixed inset-0 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onOpenPalette={() => setPaletteOpen(true)} onToggleAi={() => setAiOpen(a => !a)} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="fade-in"><Outlet /></div>
        </main>
      </div>
      {aiOpen && <AiPanel open={aiOpen} onClose={() => setAiOpen(false)} />}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
