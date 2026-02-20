import { useRealTimeClock } from '../../hooks/useRealTimeClock';
import { Clock } from 'lucide-react';

export function RealTimeClock() {
  const time = useRealTimeClock();

  return (
    <div className="flex items-center gap-3 rounded-lg border border-primary/40 px-4 py-3" style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)' }}>
      <Clock className="h-5 w-5 text-primary" />
      <div className="font-mono text-2xl font-semibold text-primary">
        {time || '00:00:00'}
      </div>
    </div>
  );
}
