import React from 'react';
import { MarketNotification } from '../hooks/useStockMarket';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

interface NotificationToastProps {
  notifications: MarketNotification[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notifications,
  onDismiss,
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((notif) => {
        const isSuccess = notif.type === 'success';
        const isWarning = notif.type === 'warning';
        const isError = notif.type === 'error';

        const borderStyle = isSuccess
          ? 'border-emerald-500/40 bg-slate-900/95 text-emerald-100 shadow-emerald-950/30'
          : isWarning
          ? 'border-amber-500/40 bg-slate-900/95 text-amber-100 shadow-amber-950/30'
          : isError
          ? 'border-rose-500/40 bg-slate-900/95 text-rose-100 shadow-rose-950/30'
          : 'border-sky-500/40 bg-slate-900/95 text-sky-100 shadow-sky-950/30';

        const IconComponent = isSuccess
          ? CheckCircle2
          : isWarning
          ? AlertTriangle
          : isError
          ? XCircle
          : Info;

        const iconColor = isSuccess
          ? 'text-emerald-400'
          : isWarning
          ? 'text-amber-400'
          : isError
          ? 'text-rose-400'
          : 'text-sky-400';

        return (
          <div
            key={notif.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-md shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2 ${borderStyle}`}
          >
            <IconComponent className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-100 leading-tight">
                {notif.title}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {notif.message}
              </p>
            </div>
            <button
              onClick={() => onDismiss(notif.id)}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1"
              aria-label="Tutup notifikasi"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
