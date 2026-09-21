import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle2, X, Info } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface ToastContextValue {
  showToast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl animate-slide-up
              border min-w-[280px] max-w-sm
              ${toast.type === 'success' ? 'bg-secondary-800 border-success/30' : ''}
              ${toast.type === 'info' ? 'bg-secondary-800 border-accent/30' : ''}
              ${toast.type === 'error' ? 'bg-secondary-800 border-error/30' : ''}
            `}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-success shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-accent shrink-0" />}
            {toast.type === 'error' && <X className="w-5 h-5 text-error shrink-0" />}
            <p className="text-sm font-medium text-white flex-1">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
