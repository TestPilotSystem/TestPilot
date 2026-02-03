function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name] ?? defaultValue;
  if (!value) {
    // During build time, return placeholder to avoid build failure
    if (process.env.NEXT_PHASE === "phase-production-build") {
      return `PLACEHOLDER_${name}`;
    }
    throw new Error(`Variable de entorno requerida: ${name}`);
  }
  return value;
}

export const config = {
  jwt: {
    secret: getEnvVar("JWT_SECRET"),
  },
  ai: {
    baseUrl: getEnvVar("AI_API_BASE_URL"),
  },
  isProduction: process.env.NODE_ENV === "production",
} as const;
