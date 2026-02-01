function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name] ?? defaultValue;
  if (!value) {
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
