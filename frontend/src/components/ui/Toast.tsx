'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactNode,
} from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
  duration?: number;
}

export interface ShowToastInput {
  title: string;
  message?: string;
  type?: ToastType;
  duration?: number;
}

export interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (input: ShowToastInput) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const toastStyleMap: Record<
  ToastType,
  {
    container: string;
    iconColor: string;
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  success: {
    container: 'bg-white border-emerald-200 text-slate-900',
    iconColor: 'text-emerald-600',
    Icon: CheckCircle2,
  },
  error: {
    container: 'bg-white border-rose-200 text-slate-900',
    iconColor: 'text-rose-600',
    Icon: AlertCircle,
  },
  warning: {
    container: 'bg-white border-amber-200 text-slate-900',
    iconColor: 'text-amber-600',
    Icon: AlertTriangle,
  },
  info: {
    container: 'bg-white border-indigo-200 text-slate-900',
    iconColor: 'text-indigo-600',
    Icon: Info,
  },
};

export function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const style = toastStyleMap[toast.type] || toastStyleMap.info;
  const Icon = style.Icon;

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'pointer-events-auto w-full max-w-sm rounded-xl border p-4 shadow-md flex items-start gap-3 transition-all',
        style.container,
      ].join(' ')}
    >
      <Icon className={['w-5 h-5 shrink-0 mt-0.5', style.iconColor].join(' ')} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
        {toast.message && (
          <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
            {toast.message}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="text-slate-400 hover:text-slate-600 rounded p-0.5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, message, type = 'info', duration = 4000 }: ShowToastInput) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newToast: ToastItem = { id, title, message, type, duration };
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      <div
        aria-label="Notifications"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toasts: [],
      showToast: () => {},
      dismissToast: () => {},
    };
  }
  return context;
}

export default Toast;
