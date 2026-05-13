const MAX_ATTEMPTS = 5;
const BASE_LOCKOUT_SECONDS = 60;
const MAX_LOCKOUT_SECONDS = 3600;

interface LockState {
  attempts: number;
  lockUntil: number | null;
  lockCount: number;
}

const store = new Map<string, LockState>();

function getLockoutSeconds(lockCount: number): number {
  const duration = BASE_LOCKOUT_SECONDS * Math.pow(2, lockCount - 1);
  return Math.min(duration, MAX_LOCKOUT_SECONDS);
}

function formatSeconds(seconds: number): string {
  if (seconds < 60) return `${seconds} segundo${seconds !== 1 ? "s" : ""}`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minuto${minutes !== 1 ? "s" : ""}`;
}

export function checkRateLimit(
  email: string
): { blocked: true; secondsRemaining: number; message: string } | { blocked: false; attemptsRemaining: number } {
  const state = store.get(email);

  if (state?.lockUntil) {
    const now = Date.now();
    if (now < state.lockUntil) {
      const secondsRemaining = Math.ceil((state.lockUntil - now) / 1000);
      return {
        blocked: true,
        secondsRemaining,
        message: `Cuenta bloqueada. Intenta de nuevo en ${formatSeconds(secondsRemaining)}.`,
      };
    }
    // Lock expired — reset attempts but preserve lockCount for progressive history
    state.attempts = 0;
    state.lockUntil = null;
  }

  const attempts = state?.attempts ?? 0;
  return { blocked: false, attemptsRemaining: MAX_ATTEMPTS - attempts };
}

export function recordFailedAttempt(
  email: string
): { locked: true; secondsRemaining: number; message: string } | { locked: false; attemptsRemaining: number } {
  const state = store.get(email) ?? { attempts: 0, lockUntil: null, lockCount: 0 };
  state.attempts++;

  if (state.attempts >= MAX_ATTEMPTS) {
    state.lockCount++;
    const seconds = getLockoutSeconds(state.lockCount);
    state.lockUntil = Date.now() + seconds * 1000;
    state.attempts = 0;
    store.set(email, state);
    return {
      locked: true,
      secondsRemaining: seconds,
      message: `Demasiados intentos fallidos. Cuenta bloqueada durante ${formatSeconds(seconds)}.`,
    };
  }

  store.set(email, state);
  const attemptsRemaining = MAX_ATTEMPTS - state.attempts;
  return { locked: false, attemptsRemaining };
}

export function resetAttempts(email: string): void {
  store.delete(email);
}

// Only for use in tests
export function _resetStore(): void {
  store.clear();
}

export { MAX_ATTEMPTS, BASE_LOCKOUT_SECONDS, MAX_LOCKOUT_SECONDS };
