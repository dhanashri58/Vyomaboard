// Per-school authentication configuration.
// Local-first: no Firestore. School config is not used in local mode.
// All sign-in goes through the local backend SQLite database.

export const DEFAULT_METHOD_ORDER = ['account'];

export function resolveSchoolId() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('school');
  if (fromQuery && fromQuery.trim()) return fromQuery.trim().toLowerCase();
  const host = window.location.hostname || '';
  const parts = host.split('.');
  if (parts.length >= 3 && parts[0] && parts[0] !== 'www') return parts[0].toLowerCase();
  return (localStorage.getItem('schoolId') || '').toLowerCase();
}

export function saveSchoolId(id) {
  if (id) localStorage.setItem('schoolId', id);
}

// Local-first: no Firestore school config. Returns null always.
export async function getSchoolConfig(schoolId) {
  return null;
}

// Local-first: no Firestore school listing.
export async function listSchools() {
  return [];
}

// Only local account sign-in is supported.
export function globalAuthMethods() {
  return ['account'];
}

export function methodLabel(method) {
  switch (method) {
    case 'account': return 'Local Account (Email / Username)';
    case 'sso': return 'School SSO (SAML / OIDC)';
    case 'google': return 'Continue with Google Workspace';
    case 'microsoft': return 'Continue with Microsoft / Entra';
    case 'email': return 'Email & Password';
    case 'no-account': return 'Name + Roll No (no account)';
    default: return method;
  }
}

export function methodHint(method) {
  switch (method) {
    case 'account': return 'Sign in with your local account email and password stored in the backend database.';
    case 'no-account': return 'No sign-in needed — used by schools without per-student accounts.';
    case 'sso': return 'Authenticates with your school identity provider.';
    case 'microsoft': return 'Authenticates with your Microsoft school account.';
    case 'google': return 'Authenticates with your school Google account.';
    case 'email': return 'Use your school email and password account.';
    default: return '';
  }
}