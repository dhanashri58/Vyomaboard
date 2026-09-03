// Classroom identity + host/teacher access helpers.
//
// One board = one class session. The class identity is:
//   year + branch + courseCode + (theory -> division | lab/tut -> batch)
// This helper computes that key and the "acting host" for a room.

import { YEARS, DOMAINS, DIVISIONS } from './examProfile';

export { YEARS, DOMAINS, DIVISIONS };

export const CLASS_TYPES = [
  { id: 'theory', label: 'Theory' },
  { id: 'lab', label: 'Lab' },
  { id: 'tut', label: 'Tutorial' },
];

export const TEACHER_ROLES = ['Teacher', 'Interviewer', 'Manager'];

export function isTeacherRole(role) {
  return TEACHER_ROLES.includes(role);
}

export function isLabLike(cm) {
  return cm && (cm.type === 'lab' || cm.type === 'tut');
}

// Uniquely identify one class session within the app.
export function classKey(cm) {
  if (!cm) return '';
  const base = [cm.year, cm.branch, cm.courseCode || cm.subject].filter(Boolean).join('|');
  if (!base) return '';
  return isLabLike(cm) ? `${base}|${cm.batch || ''}` : `${base}|${cm.division || ''}`;
}

// Human-readable label for badges / headers.
export function classMetaLabel(cm) {
  if (!cm) return 'Unconfigured class';
  const parts = [cm.year, cm.branch, cm.subject || cm.courseCode, cm.type];
  const group = isLabLike(cm) ? cm.batch : cm.division;
  return [parts.filter(Boolean).join(' · '), group].filter(Boolean).join(' · ');
}

// Priority list of people allowed to manage this room.
export function teachersOf(room) {
  const list = [];
  const push = (id) => { if (id && !list.includes(id)) list.push(id); };
  if (room) {
    push(room.hostId);
    (room.classMeta?.assignedTeachers || []).forEach(push);
    push(room.createdBy);
  }
  return list;
}

export function isAssignedTeacher(room, userId) {
  return teachersOf(room).includes(userId);
}

// Which user currently "holds the host hat" for a room, given who is present.
// Priority: hostId -> assignedTeachers -> createdBy -> first present user.
// Recomputed on every awareness update, so the hat reverts automatically.
export function actingHostId(room, presentUserIds = []) {
  if (!room) return null;
  const present = presentUserIds.filter(Boolean);
  for (const id of teachersOf(room)) {
    if (present.includes(id)) return id;
  }
  return present[0] || null;
}

// Is a room "teacher-created"? (drives the stricter delete rules)
export function isTeacherCreatedRoom(room) {
  if (!room) return false;
  if (isTeacherRole(room.createdByRole)) return true;
  if (room.classMeta && Object.keys(room.classMeta).length > 0) return true;
  return false;
}