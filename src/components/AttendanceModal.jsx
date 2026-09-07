import React, { useState, useEffect } from 'react';
import { X, UserCheck, Clock } from 'lucide-react';

const todayKey = () => new Date().toISOString().slice(0, 10);
const apiAuth = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` });

export default function AttendanceModal({ roomId, provider, onClose }) {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentUsers, setCurrentUsers] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const todayRes = await fetch(`/api/attendance/${roomId}/${todayKey()}`, { headers: apiAuth() });
      const todayData = await todayRes.json();
      setTodayAttendance(todayData.students || {});

      const histRes = await fetch(`/api/attendance/${roomId}`, { headers: apiAuth() });
      const histData = await histRes.json();
      setHistory(histData.history || []);
    } catch (e) {
      console.error('Failed to load attendance', e);
    }
  };

  useEffect(() => {
    load();
    if (provider?.awareness) {
      const updateUsers = () => {
        const states = provider.awareness.getStates();
        const list = [];
        states.forEach((state, clientId) => {
          if (state.presence) {
            list.push({ name: state.presence.userName || 'User', userId: state.authUserId || 'u-' + clientId, color: state.presence.color || '#FFDE59' });
          }
        });
        setCurrentUsers(list);
      };
      updateUsers();
      provider.awareness.on('update', updateUsers);
      return () => provider.awareness.off('update', updateUsers);
    }
  }, [roomId, provider]);

  const markAttendance = async () => {
    setSaving(true);
    const merged = { ...todayAttendance };
    currentUsers.forEach(u => {
      merged[u.userId] = { name: u.name, joinedAt: new Date().toISOString() };
    });
    try {
      await fetch(`/api/attendance/${roomId}/${todayKey()}`, {
        method: 'POST',
        headers: apiAuth(),
        body: JSON.stringify({ students: merged })
      });
      setTodayAttendance(merged);
      await load();
      alert(`Marked ${currentUsers.length} present student(s) for today.`);
    } catch (e) {
      alert('Failed to save attendance: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99998 }}>
      <div className="neo-window" onClick={e => e.stopPropagation()} style={{ width: '560px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div className="neo-window-header" style={{ background: 'var(--accent-green)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: '900', textTransform: 'uppercase' }}>Attendance</span>
          <button onClick={onClose} style={{ background: 'var(--surface-color)', border: '2px solid #000', cursor: 'pointer', padding: '2px' }}><X size={16} /></button>
        </div>
        <div className="neo-window-content" style={{ padding: '16px', background: 'var(--surface-color)', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '14px', fontWeight: '800' }}>Today ({todayKey()})</span>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#555' }}>
                {currentUsers.length} connected now · {Object.keys(todayAttendance || {}).length} marked present
              </div>
            </div>
            <button className="neo-btn" onClick={markAttendance} disabled={saving} style={{ background: 'var(--accent-yellow)', padding: '8px 14px' }}>
              <UserCheck size={16} /> {saving ? 'Saving...' : 'Mark Attendance'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '800' }}>Currently connected:</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {currentUsers.length === 0 && <span style={{ fontSize: '13px', fontWeight: '600', color: '#555' }}>No one connected.</span>}
            {currentUsers.map((u, i) => (
              <span key={i} className="neo-badge" style={{ background: u.color, fontSize: '12px' }}>{u.name}</span>
            ))}
          </div>

          <div style={{ fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>Attendance history</div>
          {history.length === 0 ? (
            <div className="neo-card" style={{ textAlign: 'center', padding: '20px', background: '#FAFAFA' }}>
              <span style={{ fontSize: '13px', fontWeight: '700' }}>No attendance records yet.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {history.map(h => (
                <div key={h.date} style={{ border: '2px solid #000', padding: '10px', background: 'var(--surface-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '800', fontSize: '13px' }}>
                    <span><Clock size={12} /> {h.date}</span>
                    <span className="neo-badge" style={{ background: 'var(--accent-blue)', fontSize: '11px' }}>{h.count} present</span>
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '12px', fontWeight: '600', color: '#555' }}>
                    {Object.values(h.students).map(s => s.name).join(', ') || '—'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
