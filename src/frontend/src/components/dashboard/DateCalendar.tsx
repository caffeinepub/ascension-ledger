import { useDeviceDate } from '../../hooks/useDeviceDate';
import { Calendar } from 'lucide-react';

export function DateCalendar() {
  const date = useDeviceDate();

  return (
    <div className="flex items-center gap-3 rounded-lg border border-accent/40 px-4 py-3" style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)' }}>
      <Calendar className="h-5 w-5 text-accent" />
      <div className="font-mono text-2xl font-semibold text-accent">
        {date || '00/00/00'}
      </div>
    </div>
  );
}
