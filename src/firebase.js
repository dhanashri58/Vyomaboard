// Local-first stub — Firebase SDK is NOT used.
// All data is stored in the local SQLite backend (backend/database.sqlite).
// These exports exist so existing import statements don't break.

export const auth = {
  currentUser: null,
  onAuthStateChanged: () => () => {}
};

export const db = null;
export const storage = null;
