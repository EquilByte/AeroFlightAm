import "server-only";

const OPENSKY_TOKEN_URL = "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token";
const TOKEN_REFRESH_BUFFER_MS = 60_000;
const DEFAULT_TOKEN_LIFETIME_SECONDS = 1_800;

export type OpenSkyAccessMode = "authenticated" | "anonymous";

export interface OpenSkyRequestAccess {
  readonly mode: OpenSkyAccessMode;
  readonly headers: Headers;
}

interface OpenSkyCredentials {
  readonly clientId: string;
  readonly clientSecret: string;
}

interface CachedToken {
  readonly value: string;
  readonly clientId: string;
  readonly expiresAt: number;
}

let cachedToken: CachedToken | null = null;
let tokenRequest: Promise<CachedToken> | null = null;

export class OpenSkyAuthenticationError extends Error {
  constructor() {
    super("OpenSky authentication failed. Check the server OAuth credentials.");
    this.name = "OpenSkyAuthenticationError";
  }
}

function readCredentials(): OpenSkyCredentials | null {
  const clientId = process.env.OPENSKY_CLIENT_ID?.trim();
  const clientSecret = process.env.OPENSKY_CLIENT_SECRET?.trim();
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

export function getConfiguredOpenSkyAccessMode(): OpenSkyAccessMode {
  return readCredentials() ? "authenticated" : "anonymous";
}

async function requestToken(credentials: OpenSkyCredentials): Promise<CachedToken> {
  try {
    const response = await fetch(OPENSKY_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new OpenSkyAuthenticationError();

    const payload = (await response.json()) as Record<string, unknown>;
    const value = typeof payload.access_token === "string" ? payload.access_token.trim() : "";
    const rawExpiresIn = Number(payload.expires_in);
    const expiresInSeconds = Number.isFinite(rawExpiresIn) && rawExpiresIn > 0
      ? rawExpiresIn
      : DEFAULT_TOKEN_LIFETIME_SECONDS;
    if (!value) throw new OpenSkyAuthenticationError();

    return {
      value,
      clientId: credentials.clientId,
      expiresAt: Date.now() + expiresInSeconds * 1_000,
    };
  } catch {
    // Do not expose the token response, client ID, or client secret to callers.
    throw new OpenSkyAuthenticationError();
  }
}

async function getAccessToken(credentials: OpenSkyCredentials): Promise<string> {
  if (
    cachedToken
    && cachedToken.clientId === credentials.clientId
    && cachedToken.expiresAt - Date.now() > TOKEN_REFRESH_BUFFER_MS
  ) {
    return cachedToken.value;
  }

  const pending = tokenRequest ?? requestToken(credentials);
  if (!tokenRequest) tokenRequest = pending;
  try {
    const token = await pending;
    cachedToken = token;
    return token.value;
  } finally {
    if (tokenRequest === pending) tokenRequest = null;
  }
}

export async function getOpenSkyRequestAccess(): Promise<OpenSkyRequestAccess> {
  const credentials = readCredentials();
  const headers = new Headers({ Accept: "application/json" });
  if (!credentials) return { mode: "anonymous", headers };

  const token = await getAccessToken(credentials);
  headers.set("Authorization", `Bearer ${token}`);
  return { mode: "authenticated", headers };
}
