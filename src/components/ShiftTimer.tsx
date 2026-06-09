import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle, Play, Square, Timer } from 'lucide-react';

interface ShiftTimerProps {
  token: string;
  province?: string;
  onShiftStart?: () => void;
  onShiftEnd?: () => void;
  onBlock?: () => void;
}

const API_URL = 'https://boufet-backend-production-e170.up.railway.app';

export const ShiftTimer: React.FC<ShiftTimerProps> = ({
  token,
  province = 'BC',
  onShiftStart,
  onShiftEnd,
  onBlock
}) => {
  const [shiftState, setShiftState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const heartbeatRef = useRef<any>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/api/driver/shift-status?province=${province}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setShiftState(data);
        if (data.status === 'max_reached' || data.status === 'forced_break') onBlock?.();
      } else setError(data.error || 'Failed');
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  };

  const startShift = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/driver/shift-start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ province })
      });
      if (res.ok) {
        setShiftState((prev: any) => prev ? { ...prev, status: 'active', canStart: true, message: 'Shift started' } : null);
        onShiftStart?.();
        startHeartbeat();
      }
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  };

  const endShift = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/driver/shift-end`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        stopHeartbeat();
        setShiftState((prev: any) => prev ? { ...prev, status: 'ended', canStart: true, message: 'Shift ended' } : null);
        onShiftEnd?.();
      }
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  };

  const startHeartbeat = () => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    heartbeatRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/driver/shift-heartbeat`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ province })
        });
        const data = await res.json();
        if (res.ok) {
          setShiftState((prev: any) => prev ? { ...prev, ...data } : null);
          if (!data.canContinue) { stopHeartbeat(); onBlock?.(); }
        }
      } catch { }
    }, 120000);
  };

  const stopHeartbeat = () => {
    if (heartbeatRef.current) { clearInterval(heartbeatRef.current); heartbeatRef.current = null; }
  };

  useEffect(() => { fetchStatus(); return () => stopHeartbeat(); }, []);
  useEffect(() => { if (shiftState?.status === 'active' && !heartbeatRef.current) startHeartbeat(); }, [shiftState?.status]);

  const formatTime = (m: number) => `${Math.floor(m / 60)}h ${m % 60}m`;

  const timerColor = !shiftState ? 'text-gray-400' :
    shiftState.status === 'forced_break' || shiftState.status === 'max_reached' ? 'text-red-500' :
    shiftState.breakNeeded ? 'text-yellow-400' : shiftState.status === 'active' ? 'text-teal-400' : 'text-gray-400';

  const bgColor = !shiftState ? 'bg-gray-900' :
    shiftState.status === 'forced_break' || shiftState.status === 'max_reached' ? 'bg-red-900/20 border-red-700' :
    shiftState.breakNeeded ? 'bg-yellow-900/20 border-yellow-700' :
    shiftState.status === 'active' ? 'bg-teal-900/20 border-teal-700' : 'bg-gray-900 border-gray-700';

  if (loading && !shiftState) return (
    <div className="flex items-center p-4 bg-gray-900 rounded-lg">
      <Clock className="w-5 h-5 text-teal-400 animate-spin mr-2" />
      <span className="text-gray-400 text-sm">Loading shift...</span>
    </div>
  );

  return (
    <div className={`rounded-lg border p-4 mb-3 ${bgColor}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Timer className={`w-5 h-5 ${timerColor}`} />
          <span className="text-white font-semibold text-sm">Shift Timer</span>
          <span className="text-xs text-gray-500">({province})</span>
        </div>
        {shiftState?.breakNeeded && <AlertTriangle className="w-5 h-5 text-yellow-400 animate-pulse" />}
      </div>
      {shiftState && (
        <div className="mb-3">
          <div className={`text-2xl font-bold ${timerColor}`}>
            {shiftState.status === 'forced_break' ? formatTime(shiftState.minutesUntilReset || 0) : formatTime(shiftState.timeRemaining || 720)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {shiftState.status === 'forced_break' ? 'until you can dash again' : shiftState.status === 'active' ? 'remaining today' : 'available today'}
          </div>
          {shiftState.activeMinutes > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              Active: {formatTime(shiftState.activeMinutes)}{shiftState.breakNeeded && ' - Break recommended!'}
            </div>
          )}
        </div>
      )}
      {shiftState?.message && <div className={`text-xs mb-3 ${shiftState.status === 'forced_break' ? 'text-red-400' : shiftState.breakNeeded ? 'text-yellow-400' : 'text-gray-400'}`}>{shiftState.message}</div>}
      {error && <div className="text-xs text-red-400 mb-3">{error}</div>}
      <div className="flex gap-2">
        {(shiftState?.status === 'ready' || shiftState?.status === 'ended' || !shiftState) && (
          <button onClick={startShift} disabled={loading || !shiftState?.canStart}
            className="flex items-center gap-1 px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-gray-700 text-white rounded-lg text-sm font-medium">
            <Play className="w-4 h-4" />{loading ? '...' : 'Start'}
          </button>
        )}
        {shiftState?.status === 'active' && (
          <button onClick={endShift} disabled={loading}
            className="flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium">
            <Square className="w-4 h-4" />End
          </button>
        )}
        {(shiftState?.status === 'forced_break' || shiftState?.status === 'max_reached') && (
          <div className="flex items-center gap-1 px-4 py-2 bg-red-900/50 text-red-400 rounded-lg text-sm">
            <AlertTriangle className="w-4 h-4" />Daily limit
          </div>
        )}
      </div>
      {province === 'BC' && shiftState?.limits?.minWage && (
        <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500">
          BC: ${shiftState.limits.minWage}/hr min engaged time + ${shiftState.limits.kmRate || 0.35}/km
        </div>
      )}
    </div>
  );
};

export default ShiftTimer;
