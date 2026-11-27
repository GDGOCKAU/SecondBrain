// Front-end only admin gate. There is no server yet, so the password lives here in the code:
// it keeps people out of the host screens, but anyone who reads the site's JavaScript can find it.
// Change it here (or set VITE_ADMIN_PASSWORD) and replace this file's check when a backend exists.
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "GDG-KAU-2026";
const KEY = "sb_admin_ok";

export const isAdmin = () => {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

// Returns true (and remembers it until the tab closes) when the password is right.
export function unlockAdmin(password) {
  if (password.trim() !== ADMIN_PASSWORD) return false;
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    // storage blocked: the gate just asks again next time
  }
  return true;
}
