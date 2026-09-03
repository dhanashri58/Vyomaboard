// Persistent local room history so shared-room links survive across sessions.
export function loadRoomHistory() {
  try { return JSON.parse(localStorage.getItem('roomHistory') || '[]'); } catch { return []; }
}

export function saveRoomHistory(list) {
  localStorage.setItem('roomHistory', JSON.stringify(list));
}

// Add a room the user visited / created. kind: 'board' | 'exam'.
export function addRoomToHistory(id, name, parentId = null, kind = 'board') {
  const list = loadRoomHistory();
  if (!list.find(r => r.id === id)) {
    list.unshift({ id, name, parentId, kind });
    saveRoomHistory(list);
  }
  return list;
}