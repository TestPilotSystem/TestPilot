import { config } from "@/lib/config";

interface CachedToken {
  token: string;
  expiresAt: number;
}

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

const tokenCache = new Map<number, CachedToken>();

export async function getAiToken(
  userId: number,
  fullName: string,
  dni: string
): Promise<string> {
  const cached = tokenCache.get(userId);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.token;
  }

  const response = await fetch(`${config.ai.baseUrl}/custom-test/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name: fullName, dni }),
  });

  if (!response.ok) {
    throw new Error("Error al autenticar con el servicio de IA");
  }

  const data = await response.json();
  const token = data.token || data.access_token;

  if (!token) {
    throw new Error("El servicio de IA no devolvió un token válido");
  }

  tokenCache.set(userId, {
    token,
    expiresAt: Date.now() + TOKEN_TTL_MS,
  });

  return token;
}
