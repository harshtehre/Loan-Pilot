import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

type ToastType = 'default' | 'success' | 'error';
interface Toast { id: number; msg: string; type: ToastType; }
interface ToastCtx { toast: (msg: string, type?: ToastType) => void; }
const Ctx = createContext<ToastCtx>({ toast: () => {} });

const COLORS: Record<ToastType, string> = { success: '#10B981', error: '#EF4444', default: 'var(--color-indigo-500)' };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((msg: string, type: ToastType = 'default') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  }, []);
  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed top-5 right-5 z-[999] flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className="toast fade-in card flex gap-3 items-start p-3 shadow-2xl min-w-[280px]">
            <div style={{ width: 6, borderRadius: 3, background: COLORS[t.type], alignSelf: 'stretch' }} />
            <div className="text-sm">{t.msg}</div>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
export const useToast = () => useContext(Ctx).toast;
