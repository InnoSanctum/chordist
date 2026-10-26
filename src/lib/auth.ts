// Simple Authentication Guard for Admin Access
const AUTH_KEY = 'chordist_admin_token';
const ADMIN_USER = 'admin';
const ADMIN_PASS = '0GkoNl0i3FYXd36G';

export function checkCredentials(user: string, pass: string): boolean {
  return user.trim() === ADMIN_USER && pass.trim() === ADMIN_PASS;
}

export function setAuthenticated(isAuth: boolean) {
  if (typeof window === 'undefined') return;
  if (isAuth) {
    localStorage.setItem(AUTH_KEY, 'auth_' + Date.now());
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem(AUTH_KEY));
}

