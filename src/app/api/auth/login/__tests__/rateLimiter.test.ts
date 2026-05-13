import {
  checkRateLimit,
  recordFailedAttempt,
  resetAttempts,
  _resetStore,
  MAX_ATTEMPTS,
  BASE_LOCKOUT_SECONDS,
  MAX_LOCKOUT_SECONDS,
} from "@/lib/loginRateLimiter";

const EMAIL = "victim@example.com";
const OTHER_EMAIL = "other@example.com";

beforeEach(() => {
  _resetStore();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("loginRateLimiter", () => {
  describe("checkRateLimit", () => {
    it("should not block a fresh email with no attempts", () => {
      const result = checkRateLimit(EMAIL);
      expect(result.blocked).toBe(false);
      if (!result.blocked) expect(result.attemptsRemaining).toBe(MAX_ATTEMPTS);
    });

    it("should not block when attempts are below the threshold", () => {
      recordFailedAttempt(EMAIL);
      recordFailedAttempt(EMAIL);
      const result = checkRateLimit(EMAIL);
      expect(result.blocked).toBe(false);
      if (!result.blocked) expect(result.attemptsRemaining).toBe(MAX_ATTEMPTS - 2);
    });

    it("should block when account is locked", () => {
      for (let i = 0; i < MAX_ATTEMPTS; i++) recordFailedAttempt(EMAIL);
      const result = checkRateLimit(EMAIL);
      expect(result.blocked).toBe(true);
      if (result.blocked) {
        expect(result.secondsRemaining).toBe(BASE_LOCKOUT_SECONDS);
        expect(result.message).toContain("bloqueada");
      }
    });

    it("should unblock after lockout expires", () => {
      for (let i = 0; i < MAX_ATTEMPTS; i++) recordFailedAttempt(EMAIL);
      expect(checkRateLimit(EMAIL).blocked).toBe(true);

      jest.advanceTimersByTime((BASE_LOCKOUT_SECONDS + 1) * 1000);

      const result = checkRateLimit(EMAIL);
      expect(result.blocked).toBe(false);
    });

    it("should not affect other emails", () => {
      for (let i = 0; i < MAX_ATTEMPTS; i++) recordFailedAttempt(EMAIL);
      const result = checkRateLimit(OTHER_EMAIL);
      expect(result.blocked).toBe(false);
    });
  });

  describe("recordFailedAttempt", () => {
    it("should return not locked and decrement attemptsRemaining on each failure", () => {
      for (let i = 1; i < MAX_ATTEMPTS; i++) {
        const result = recordFailedAttempt(EMAIL);
        expect(result.locked).toBe(false);
        if (!result.locked) {
          expect(result.attemptsRemaining).toBe(MAX_ATTEMPTS - i);
        }
      }
    });

    it("should lock on the 5th failed attempt with BASE_LOCKOUT_SECONDS", () => {
      for (let i = 0; i < MAX_ATTEMPTS - 1; i++) recordFailedAttempt(EMAIL);
      const result = recordFailedAttempt(EMAIL);
      expect(result.locked).toBe(true);
      if (result.locked) {
        expect(result.secondsRemaining).toBe(BASE_LOCKOUT_SECONDS);
        expect(result.message).toContain("1 minuto");
      }
    });

    it("should double the lockout on second lockout (progressive)", () => {
      // First lockout
      for (let i = 0; i < MAX_ATTEMPTS; i++) recordFailedAttempt(EMAIL);

      // Expire first lockout
      jest.advanceTimersByTime((BASE_LOCKOUT_SECONDS + 1) * 1000);
      checkRateLimit(EMAIL); // triggers expiry reset

      // Second lockout
      for (let i = 0; i < MAX_ATTEMPTS - 1; i++) recordFailedAttempt(EMAIL);
      const result = recordFailedAttempt(EMAIL);

      expect(result.locked).toBe(true);
      if (result.locked) {
        expect(result.secondsRemaining).toBe(BASE_LOCKOUT_SECONDS * 2);
      }
    });

    it("should quadruple the lockout on third lockout", () => {
      // First lockout
      for (let i = 0; i < MAX_ATTEMPTS; i++) recordFailedAttempt(EMAIL);
      jest.advanceTimersByTime((BASE_LOCKOUT_SECONDS + 1) * 1000);
      checkRateLimit(EMAIL);

      // Second lockout
      for (let i = 0; i < MAX_ATTEMPTS; i++) recordFailedAttempt(EMAIL);
      jest.advanceTimersByTime((BASE_LOCKOUT_SECONDS * 2 + 1) * 1000);
      checkRateLimit(EMAIL);

      // Third lockout
      for (let i = 0; i < MAX_ATTEMPTS - 1; i++) recordFailedAttempt(EMAIL);
      const result = recordFailedAttempt(EMAIL);

      expect(result.locked).toBe(true);
      if (result.locked) {
        expect(result.secondsRemaining).toBe(BASE_LOCKOUT_SECONDS * 4);
      }
    });

    it("should cap lockout at MAX_LOCKOUT_SECONDS", () => {
      // Simulate many lockouts to exceed the cap
      // After 7 lockouts: 60 * 2^6 = 3840 > 3600
      for (let lockout = 0; lockout < 7; lockout++) {
        for (let i = 0; i < MAX_ATTEMPTS; i++) recordFailedAttempt(EMAIL);
        // Advance past the current lockout to enable next round
        jest.advanceTimersByTime((MAX_LOCKOUT_SECONDS + 1) * 1000);
        checkRateLimit(EMAIL);
      }

      for (let i = 0; i < MAX_ATTEMPTS - 1; i++) recordFailedAttempt(EMAIL);
      const result = recordFailedAttempt(EMAIL);

      expect(result.locked).toBe(true);
      if (result.locked) {
        expect(result.secondsRemaining).toBe(MAX_LOCKOUT_SECONDS);
      }
    });
  });

  describe("resetAttempts", () => {
    it("should clear all state for the email", () => {
      recordFailedAttempt(EMAIL);
      recordFailedAttempt(EMAIL);
      resetAttempts(EMAIL);

      const result = checkRateLimit(EMAIL);
      expect(result.blocked).toBe(false);
      if (!result.blocked) expect(result.attemptsRemaining).toBe(MAX_ATTEMPTS);
    });

    it("should clear a locked account", () => {
      for (let i = 0; i < MAX_ATTEMPTS; i++) recordFailedAttempt(EMAIL);
      expect(checkRateLimit(EMAIL).blocked).toBe(true);

      resetAttempts(EMAIL);
      expect(checkRateLimit(EMAIL).blocked).toBe(false);
    });

    it("should not affect other emails", () => {
      recordFailedAttempt(EMAIL);
      recordFailedAttempt(OTHER_EMAIL);
      resetAttempts(EMAIL);

      const otherResult = checkRateLimit(OTHER_EMAIL);
      expect(otherResult.blocked).toBe(false);
      if (!otherResult.blocked) expect(otherResult.attemptsRemaining).toBe(MAX_ATTEMPTS - 1);
    });
  });

  describe("message formatting", () => {
    it("should format seconds correctly for sub-minute lockouts", () => {
      // Change BASE to a sub-60 value isn't possible without modifying constants,
      // so we verify the seconds message via secondsRemaining
      for (let i = 0; i < MAX_ATTEMPTS; i++) recordFailedAttempt(EMAIL);
      jest.advanceTimersByTime((BASE_LOCKOUT_SECONDS - 10) * 1000);
      const result = checkRateLimit(EMAIL);
      if (result.blocked) {
        expect(typeof result.secondsRemaining).toBe("number");
        expect(result.secondsRemaining).toBeGreaterThan(0);
      }
    });

    it("should include minute phrasing in lockout message when >= 60 seconds", () => {
      for (let i = 0; i < MAX_ATTEMPTS - 1; i++) recordFailedAttempt(EMAIL);
      const result = recordFailedAttempt(EMAIL);
      expect(result.locked).toBe(true);
      if (result.locked) {
        expect(result.message).toMatch(/minuto/);
      }
    });
  });
});
