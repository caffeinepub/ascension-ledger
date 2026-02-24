import { useState, useEffect } from 'react';

export function useDeviceDate() {
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = String(now.getFullYear()).slice(-2);
      setDate(`${day}/${month}/${year}`);
    };

    updateDate();

    // Calculate milliseconds until next midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    // Update at midnight
    const timeout = setTimeout(() => {
      updateDate();
      // Set up daily interval after first midnight update
      const dailyInterval = setInterval(updateDate, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyInterval);
    }, msUntilMidnight);

    return () => clearTimeout(timeout);
  }, []);

  return date;
}
