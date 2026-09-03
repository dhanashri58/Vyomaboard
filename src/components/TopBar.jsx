import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Eye, EyeOff, UserX, Menu, Users, MessageSquare, ChevronLeft, Shield, MicOff, Video, Mic, MoreVertical, GraduationCap, UserCheck, Link as LinkIcon, Settings } from 'lucide-react';
import { sendHostAction } from '../lib/hostControl';
import { isTeacherRole } from '../lib/classMeta';
import BoardSearch from './BoardSearch';
import '../index.css';

export default function TopBar({ editor, provider, roomName, roomInfo, localUserId, actingHost, onToggleSidebar, onToggleUnsorted, onOpenHostControls, onOpenRoster, onOpenAttendance, onOpenClassSettings }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(null);
  const [showRoomId, setShowRoomId] = useState(false);
  const [hoveredUserMenu, setHoveredUserMenu] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [showTeacherMenu, setShowTeacherMenu] = useState(false);
  
  const localClientId = provider?.awareness?.clientID;
  
  const act = (payload) => sendHostAction(provider, payload);

  const userRole = localStorage.getItem('userRole') || 'Casual';
  const isHost = actingHost === localUserId;
  const canUseTeacherTools = isTeacherRole(userRole) || (userRole === 'Casual' && isHost);

  const copyRoomLink = () => {
    const url = `${window.location.origin}/board/${roomName}`;
    navigator.clipboard.writeText(url)
      .then(() => alert('Room link copied to clipboard!'))
      .catch(() => alert(`Could not copy automatically. Link: ${url}`));
  };

  useEffect(() => {
    if (!provider || !provider.awareness) return;

    provider.awareness.setLocalStateField('authUserId', localUserId);

    const handleUpdate = () => {
      const states = provider.awareness.getStates();
      const activeUsers = [];
      
      states.forEach((state, clientId) => {
        if (state.presence) {
          const authUserId = state.authUserId;
          const role = (roomInfo?.roles && authUserId && roomInfo.roles[authUserId]) || (authUserId === roomInfo?.hostId ? 'admin' : 'member');
          activeUsers.push({
            clientId,
            authUserId,
            role,
            name: state.presence.userName || 'User',
            color: state.presence.color || '#FFDE59',
            basePoint: state.basePoint,
            isLocal: clientId === localClientId
          });
        }
      });
      
      states.forEach((state, clientId) => {
        if (state.kickAction && state.kickAction.targetId === localClientId) {
          if (state.authUserId === actingHost) {
            alert('You have been kicked by the host.');
            navigate('/');
          }
        }
      });
      
      activeUsers.sort((a, b) => {
        if (a.isLocal) return -1;
        if (b.isLocal) return 1;
        return 0;
      });
      
      setUsers(activeUsers);
    };

    provider.awareness.on('update', handleUpdate);
    handleUpdate();

    return () => provider.awareness.off('update', handleUpdate);
  }, [provider, localClientId, actingHost, navigate]);

  const goToBase = useCallback((basePoint) => {
    if (!editor || !basePoint) return;
    editor.setCamera({ x: basePoint.x, y: basePoint.y, z: 1 }, { animation: { duration: 500 } });
  }, [editor]);

  const handleRightClick = useCallback((e, user) => {
    e.preventDefault();
    setShowContextMenu({
      x: e.clientX,
      y: e.clientY,
      user
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.closest('.neo-context-menu')) return;
      setShowContextMenu(null);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    let history = [];
    try {
      history = JSON.parse(localStorage.getItem('roomHistory') || '[]');
    } catch(e) {}
    
    // Build breadcrumbs
    const crumbs = [];
    let currentId = roomName;
    while (currentId) {
      const room = history.find(r => r.id === currentId);
      if (room) {
        crumbs.unshift(room);
        currentId = room.parentId;
      } else {
        // If room isn't in history (e.g., hardcoded URL or global root), add it anyway
        crumbs.unshift({ id: currentId, name: currentId === 'test-room' ? 'Test Room' : currentId });
        break;
      }
    }
    setBreadcrumbs(crumbs);
  }, [roomName]);

  const renderAvatar = (user, index, isLast, extraCount) => (
    <div 
      key={user.clientId}
      onContextMenu={(e) => handleRightClick(e, user)}
      title={`${user.name} (Right-click to jump to base)`}
      style={{
        width: '32px', height: '32px',
        backgroundColor: user.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#000', fontWeight: '900', fontSize: '14px',
        border: '3px solid #000',
        marginLeft: index > 0 ? '-12px' : '0',
        cursor: 'context-menu',
        position: 'relative',
        zIndex: 10 - index,
        boxShadow: '2px 2px 0px #000',
        borderRadius: '4px' // neo-brutalist slight round
      }}
    >
      {user.name[0]?.toUpperCase()}
      {isLast && extraCount > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '-6px',
          right: '-6px',
          background: 'var(--surface-color)',
          border: '2px solid #000',
          fontSize: '10px',
          fontWeight: 'bold',
          padding: '1px 3px',
          zIndex: 11
        }}>
          +{extraCount}
        </div>
      )}
    </div>
  );

  return (
    <>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 12px',
        background: 'var(--sidebar-bg)',
        borderBottom: 'var(--border-width) solid var(--border-color)',
        zIndex: 1000, pointerEvents: 'all',
        boxShadow: 'var(--shadow-sm)'
      }}>
        
        {/* Left Side: Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={onToggleSidebar}
            className="neo-btn"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '48px', height: '48px', padding: 0,
              background: 'var(--accent-yellow)'
            }}
          >
            <Menu size={24} />
          </button>

          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to leave the board?")) {
                navigate('/dashboard');
              }
            }}
            className="neo-btn"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'var(--bg-color)', color: 'var(--text-main)', fontSize: '14px',
              padding: '4px 10px'
            }}
            title="Dashboard"
          >
            <Layout size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button 
              onClick={() => {
                if (roomInfo?.parentId) {
                  navigate(`/board/${roomInfo.parentId}`);
                }
              }}
              disabled={!roomInfo?.parentId}
              className="neo-btn"
              style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                width: '28px', height: '28px', padding: 0, 
                background: 'var(--bg-color)', color: 'var(--text-main)',
                opacity: roomInfo?.parentId ? 1 : 0.5,
                cursor: roomInfo?.parentId ? 'pointer' : 'not-allowed'
              }}
              title="Go Up"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
          {/* Host Controls Button */}
          {isHost && (
            <button
              onClick={onOpenHostControls}
              className="neo-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-pink)', fontSize: '12px', padding: '4px 10px', color: '#000' }}
              title="Host controls"
            >
              <Shield size={14} /> Host
            </button>
          )}

          {/* Teacher Tools Button */}
          {canUseTeacherTools && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowTeacherMenu(!showTeacherMenu)}
                className="neo-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-green)', fontSize: '12px', padding: '4px 10px', color: '#000' }}
                title="Teacher tools"
              >
                <GraduationCap size={14} /> Teach
              </button>
              {showTeacherMenu && (
                <div className="neo-window" style={{ position: 'absolute', top: '46px', left: 0, zIndex: 1001, minWidth: '220px' }} onClick={(e) => e.stopPropagation()}>
                  <div className="neo-window-header" style={{ background: 'var(--accent-green)' }}>
                    <span className="neo-badge" style={{ marginLeft: 'auto', background: 'var(--surface-color)', fontSize: '12px' }}>Teacher Tools</span>
                  </div>
                  <div className="neo-window-content" style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px', background: 'var(--surface-color)' }}>
                    <button className="neo-btn" style={{ textAlign: 'left', background: 'var(--accent-blue)', fontSize: '13px', padding: '8px' }} onClick={() => { setShowTeacherMenu(false); onOpenRoster && onOpenRoster(); }}>
                      <Users size={14} /> Class Roster
                    </button>
                    <button className="neo-btn" style={{ textAlign: 'left', background: 'var(--accent-green)', fontSize: '13px', padding: '8px' }} onClick={() => { setShowTeacherMenu(false); onOpenAttendance && onOpenAttendance(); }}>
                      <UserCheck size={14} /> Attendance
                    </button>
                    <button className="neo-btn" style={{ textAlign: 'left', background: 'var(--accent-purple)', fontSize: '13px', padding: '8px' }} onClick={() => { setShowTeacherMenu(false); onOpenClassSettings && onOpenClassSettings(); }}>
                      <Settings size={14} /> Class Settings
                    </button>
                    <button className="neo-btn" style={{ textAlign: 'left', background: 'var(--accent-yellow)', fontSize: '13px', padding: '8px' }} onClick={() => { setShowTeacherMenu(false); copyRoomLink(); }}>
                      <LinkIcon size={14} /> Copy Room Link
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Breadcrumbs Path Box */}
          <div className="neo-title-block" style={{ padding: '4px 12px', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '800', color: 'var(--text-main)', fontSize: '12px' }}>
              {breadcrumbs.length > 0 ? (
                breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={crumb.id}>
                    <span 
                      onClick={() => navigate(`/board/${crumb.id}`)}
                      style={{ cursor: 'pointer', textDecoration: idx === breadcrumbs.length - 1 ? 'none' : 'underline', padding: '0 2px' }}
                    >
                      {crumb.name}
                    </span>
                    {idx < breadcrumbs.length - 1 && <span>/</span>}
                  </React.Fragment>
                ))
              ) : (
                `Board`
              )}
            </div>
          </div>

          {/* Room Code Box */}
          <div className="neo-title-block" style={{ padding: '4px 12px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>
              Code: <span style={{ fontFamily: 'Fira Code, monospace', background: 'var(--bg-color)', padding: '2px 8px', border: '2px solid var(--border-color)', fontSize: '14px' }}>{showRoomId ? roomName : '••••••••'}</span>
            </span>
            <button 
              onClick={() => setShowRoomId(!showRoomId)}
              style={{
                background: 'transparent', color: 'var(--text-main)', border: 'none',
                cursor: 'pointer', display: 'flex', padding: '2px'
              }}
            >
              {showRoomId ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(roomName)
                  .then(() => alert('Room ID copied to clipboard!'))
                  .catch(() => alert(`Could not copy automatically. Room ID: ${roomName}`));
              }}
              style={{
                background: 'transparent', color: 'var(--text-main)', border: 'none',
                cursor: 'pointer', display: 'flex', padding: '2px'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
          </div>
        </div>

        {/* Right Side: Users and Base controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

          {/* Search Board */}
          <BoardSearch editor={editor} provider={provider} />

          {/* My Base Button */}
          {users.find(u => u.isLocal)?.basePoint && (
            <button
              onClick={() => goToBase(users.find(u => u.isLocal).basePoint)}
              className="neo-btn"
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'var(--accent-green)', fontSize: '14px', padding: '4px 10px'
              }}
              title="Return to your starting position"
            >
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Base</span>
            </button>
          )}

          {/* Avatars */}
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <div 
              style={{ display: 'flex', cursor: 'pointer', alignItems: 'center', transform: 'rotate(1deg)' }}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {users.slice(0, 5).map((user, index) => 
                renderAvatar(user, index, index === 4 || index === users.length - 1, users.length - 5)
              )}
            </div>
            
            {showDropdown && (
              <div className="neo-window" style={{
                position: 'absolute', top: '60px', right: 0,
                zIndex: 100, minWidth: '300px'
              }}>
                <div className="neo-window-header" style={{ background: 'var(--accent-pink)' }}>
                   <div className="neo-window-dot red"></div>
                   <div className="neo-window-dot yellow"></div>
                   <div className="neo-window-dot green"></div>
                   <span className="neo-badge" style={{ marginLeft: 'auto', background: 'var(--surface-color)', fontSize: '12px' }}>Users ({users.length})</span>
                </div>
                <div className="neo-window-content" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--surface-color)' }}>
                  
                  <button className="neo-btn" style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'var(--accent-blue)', fontSize: '14px'
                  }}>
                    <Users size={18} color="#000" /> Follow Me
                  </button>

                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {users.map(user => (
                      <div 
                        key={user.clientId}
                        onMouseEnter={() => setHoveredUserMenu(user.clientId)}
                        onMouseLeave={() => setHoveredUserMenu(null)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px',
                          border: '3px solid #000', background: 'var(--surface-color)', cursor: 'pointer', position: 'relative',
                          boxShadow: '2px 2px 0px #000'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '32px', height: '32px', border: '3px solid #000', backgroundColor: user.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: '900', fontSize: '14px' }}>
                            {user.name[0]?.toUpperCase()}
                          </div>
                          <span style={{ color: '#000', fontSize: '14px', fontWeight: '800' }}>
                            {user.name} {user.isLocal && <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '600' }}>(You)</span>}
                            {user.role === 'admin' && <span className="neo-badge" style={{ marginLeft: '8px', background: 'var(--accent-pink)', padding: '2px 6px', fontSize: '10px' }}>ADMIN</span>}
                            {user.role === 'co-admin' && <span className="neo-badge" style={{ marginLeft: '8px', background: 'var(--accent-blue)', padding: '2px 6px', fontSize: '10px' }}>CO-ADMIN</span>}
                          </span>
                        </div>
                        <MoreVertical size={18} color="#000" />
                        
                        {hoveredUserMenu === user.clientId && !user.isLocal && (
                          <div className="neo-window" style={{
                            position: 'absolute', top: 0, right: '100%', marginRight: '12px',
                            zIndex: 101, minWidth: '180px'
                          }}>
                            <div className="neo-window-content" style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--surface-color)' }}>
                              <button className="neo-btn" style={{ textAlign: 'left', background: 'var(--accent-yellow)', fontSize: '14px', padding: '8px' }} onClick={() => {
                                try {
                                  const camera = editor?.getCamera();
                                  if (!camera) return;
                                  editor.pan({ x: -(user.basePoint?.x - camera.x || 0), y: -(user.basePoint?.y - camera.y || 0) });
                                } catch (e) {}
                              }}>Go to Base</button>
                              <button className="neo-btn" style={{ textAlign: 'left', background: 'var(--surface-color)', fontSize: '14px', padding: '8px' }}>Profile</button>
                              <button className="neo-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left', background: 'var(--accent-green)', fontSize: '14px', padding: '8px' }} onClick={() => {
                                setShowDropdown(false);
                                window.dispatchEvent(new CustomEvent('open-dm', { detail: { targetId: user.authUserId, targetName: user.name } }));
                              }}>
                                <MessageSquare size={14} /> Send DM
                              </button>
                              
                              {isHost && (
                                <>
                                  <div style={{ height: '2px', background: '#000', margin: '4px 0' }}></div>
                                  {user.role !== 'admin' && user.role !== 'co-admin' && (
                                    <button className="neo-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left', background: 'var(--accent-blue)', fontSize: '14px', padding: '8px' }} onClick={() => {
                                      window.dispatchEvent(new CustomEvent('update-role', { detail: { targetId: user.authUserId, role: 'co-admin' } }));
                                    }}>
                                      <Shield size={14} /> Make Co-Admin
                                    </button>
                                  )}
                                  {user.role === 'co-admin' && (
                                    <button className="neo-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left', background: 'var(--accent-orange)', fontSize: '14px', padding: '8px' }} onClick={() => {
                                      window.dispatchEvent(new CustomEvent('update-role', { detail: { targetId: user.authUserId, role: 'member' } }));
                                    }}>
                                      <Shield size={14} /> Revoke Co-Admin
                                    </button>
                                  )}
                                  <button className="neo-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left', background: 'var(--accent-yellow)', fontSize: '14px', padding: '8px' }} onClick={() => act({ cmd: 'mute', target: user.clientId })}>
                                    <MicOff size={14} /> Mute Mic
                                  </button>
                                  <button className="neo-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left', background: 'var(--accent-blue)', fontSize: '14px', padding: '8px' }} onClick={() => act({ cmd: 'askCamera', target: user.clientId })}>
                                    <Video size={14} /> Ask Camera
                                  </button>
                                  <button className="neo-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left', background: 'var(--accent-purple)', fontSize: '14px', padding: '8px' }} onClick={() => act({ cmd: 'askMic', target: user.clientId })}>
                                    <Mic size={14} /> Ask Mic
                                  </button>
                                  <button className="neo-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left', background: 'var(--accent-pink)', fontSize: '14px', padding: '8px' }} onClick={() => {
                                    if (window.confirm(`Kick ${user.name}?`)) act({ cmd: 'kick', target: user.clientId });
                                  }}>
                                    <UserX size={14} /> Kick User
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="neo-window neo-context-menu"
          style={{
            position: 'fixed',
            top: showContextMenu.y,
            left: showContextMenu.x,
            zIndex: 1000,
            minWidth: '200px'
          }}
        >
          <div className="neo-window-content" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--surface-color)' }}>
            <button
              onClick={() => {
                try {
                  const camera = editor?.getCamera();
                  if (!camera) return;
                  const currentPoint = { x: camera.x, y: camera.y };
                  const dx = showContextMenu.user.basePoint.x - currentPoint.x;
                  const dy = showContextMenu.user.basePoint.y - currentPoint.y;
                  editor.pan({ x: -dx, y: -dy });
                } catch (err) {
                  console.error("Failed to pan to user", err);
                }
                setShowContextMenu(null);
              }}
              className="neo-btn" style={{ width: '100%', textAlign: 'left', background: 'var(--accent-green)', fontSize: '14px' }}
            >
              Go to their Base
            </button>
            
            {isHost && !showContextMenu.user.isLocal && (
              <>
                {showContextMenu.user.role !== 'co-admin' && showContextMenu.user.role !== 'admin' && (
                  <button
                    onClick={async () => {
                      if (!showContextMenu.user.authUserId) return alert("User is not fully connected");
                      window.dispatchEvent(new CustomEvent('update-role', { detail: { targetId: showContextMenu.user.authUserId, role: 'co-admin' } }));
                      setShowContextMenu(null);
                    }}
                    className="neo-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', textAlign: 'left', background: 'var(--accent-blue)', fontSize: '14px' }}
                  >
                    <Shield size={16} /> Make Co-Admin
                  </button>
                )}
                {showContextMenu.user.role === 'co-admin' && (
                  <button
                    onClick={async () => {
                      if (!showContextMenu.user.authUserId) return alert("User is not fully connected");
                      window.dispatchEvent(new CustomEvent('update-role', { detail: { targetId: showContextMenu.user.authUserId, role: 'member' } }));
                      setShowContextMenu(null);
                    }}
                    className="neo-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', textAlign: 'left', background: 'var(--accent-orange)', fontSize: '14px' }}
                  >
                    <Shield size={16} /> Revoke Co-Admin
                  </button>
                )}
                <button
                  onClick={() => {
                    if (window.confirm(`Kick ${showContextMenu.user.name}?`)) {
                      provider.awareness.setLocalStateField('kickAction', { 
                        targetId: showContextMenu.user.clientId, 
                        ts: Date.now() 
                      });
                    }
                    setShowContextMenu(null);
                  }}
                  className="neo-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', textAlign: 'left', background: 'var(--accent-pink)', fontSize: '14px' }}
                >
                  <UserX size={16} /> Kick User
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
