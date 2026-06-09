import React, { useState, useEffect } from 'react';
import { Timer, AlertTriangle, Navigation, MapPin } from 'lucide-react';

interface PickupTimerProps {
  acceptedAt: string | Date;
  restaurantAddress: string;
  estimatedDriveMinutes?: number;
  onLateWarning?: () => void;
  onTooLate?: () => void;
}

const PickupTimer: React.FC<PickupTimerProps> = ({
  acceptedAt,
  restaurantAddress,
  estimatedDriveMinutes = 12,
  onLateWarning,
  onTooLate
}) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [status, setStatus] = useState<'on-time' | 'warning' | 'late' | 'very-late'>('on-time');
  const allowedMinutes = estimatedDriveMinutes * 2;

  useEffect(() => {
    const accepted = new Date(acceptedAt).getTime();
    const deadline = accepted + (allowedMinutes * 60000);
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((deadline - now) / 1000));
      setTimeLeft(remaining);
      const remainingMinutes = remaining / 60;
      if (remainingMinutes <= 0) {
        setStatus('very-late');
        onTooLate?.();
        clearInterval(interval);
      } else if (remainingMinutes <= 3) setStatus('late');
      else if (remainingMinutes <= 5) {
        setStatus('warning');
        onLateWarning?.();
      } else setStatus('on-time');
    }, 1000);
    return () => clearInterval(interval);
  }, [acceptedAt, allowedMinutes, onLateWarning, onTooLate]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getColors = () => {
    switch (status) {
      case 'on-time': return { bg: 'bg-teal-900/20', border: 'border-teal-700', text: 'text-teal-400', icon: 'text-teal-400' };
      case 'warning': return { bg: 'bg-yellow-900/20', border: 'border-yellow-700', text: 'text-yellow-400', icon: 'text-yellow-400' };
      case 'late': return { bg: 'bg-orange-900/20', border: 'border-orange-700', text: 'text-orange-400', icon: 'text-orange-400' };
      case 'very-late': return { bg: 'bg-red-900/20', border: 'border-red-700', text: 'text-red-500', icon: 'text-red-500' };
    }
  };

  const colors = getColors();

  const getMessage = () => {
    switch (status) {
      case 'on-time': return `Arrive in ${Math.ceil(timeLeft / 60)} min to stay on time`;
      case 'warning': return 'Hurry! 5 min warning';
      case 'late': return 'At risk of being late!';
      case 'very-late': return 'Late - contact support if needed';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${colors.bg} ${colors.border}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Timer className={`w-5 h-5 ${colors.icon}`} />
          <span className={`font-bold text-lg ${colors.text}`}>{formatTime(timeLeft)}</span>
        </div>
        {status !== 'on-time' && <AlertTriangle className={`w-5 h-5 ${colors.icon} animate-pulse`} />}
      </div>
      <div className="flex items-start gap-2 mb-2">
        <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs text-gray-400">Pickup at</p>
          <p className="text-sm text-white">{restaurantAddress}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <Navigation className="w-4 h-4 text-gray-500" />
        <p className="text-xs text-gray-400">{estimatedDriveMinutes} min drive, {allowedMinutes} min to arrive</p>
      </div>
      <p className={`text-xs ${colors.text}`}>{getMessage()}</p>
      <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ${
          status === 'on-time' ? 'bg-teal-500' : status === 'warning' ? 'bg-yellow-500' : status === 'late' ? 'bg-orange-500' : 'bg-red-500'
        }`} style={{ width: `${Math.min(100, (timeLeft / (allowedMinutes * 60)) * 100)}%` }} />
      </div>
    </div>
  );
};

export default PickupTimer;
