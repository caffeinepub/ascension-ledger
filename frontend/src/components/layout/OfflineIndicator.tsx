import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

/**
 * Fixed-position banner that appears at the top of the viewport when the
 * user loses network connectivity. Matches the CRYONEX sci-fi theme.
 */
export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium"
      style={{
        background: 'rgba(10, 10, 15, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 100, 50, 0.5)',
        boxShadow: '0 0 20px rgba(255, 100, 50, 0.2)',
        color: 'rgba(255, 160, 100, 1)',
      }}
      role="status"
      aria-live="polite"
    >
      <WifiOff className="h-4 w-4 shrink-0" style={{ color: 'rgba(255, 120, 60, 1)' }} />
      <span>
        <span className="font-bold tracking-wider" style={{ color: 'rgba(255, 140, 80, 1)' }}>
          OFFLINE
        </span>
        {' '}— viewing cached data. Reconnect to sync progress.
      </span>
    </div>
  );
}
