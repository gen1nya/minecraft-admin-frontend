import { renderHead } from './skinRenderer';

interface ProfileEntry {
  skinUrl: string | null;
  slim: boolean;
  fetchedAt: number;
}

interface HeadEntry {
  buffer: Buffer;
  contentType: string;
  expiresAt: number;
}

const PROFILE_TTL = 6 * 60 * 60 * 1000; // skins rarely change
const HEAD_TTL = 6 * 60 * 60 * 1000; // authoritative renders
const FALLBACK_TTL = 5 * 60 * 1000; // short, so we recover to authoritative once Mojang is back
const FETCH_TIMEOUT_MS = 5000;
const MAX_HEAD_CACHE = 1000;

const UUID_RE = /^[0-9a-fA-F]{8}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{12}$/;

export function isValidUuid(uuid: string): boolean {
  return UUID_RE.test(uuid);
}

function normalizeUuid(uuid: string): string {
  return uuid.replace(/-/g, '').toLowerCase();
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchBuffer(url: string): Promise<Buffer | null> {
  const res = await fetchWithTimeout(url);
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}

/**
 * Resolves player heads with an authoritative-first strategy:
 *  1. Ask Mojang's session server whether the player actually has a custom skin.
 *     If so, fetch the skin from textures.minecraft.net and render the head
 *     ourselves — this is the only way to be sure we never serve a wrong
 *     default Steve/Alex for a skinned player (the bug with mc-heads.net, which
 *     returns a 200 + default head whenever its upstream fetch flakes).
 *  2. Fall back to external render services (redundancy) when Mojang is
 *     unreachable, caching those only briefly.
 *  3. Serve a stale cached head if everything fails.
 *
 * Results are cached and concurrent requests for the same head are de-duped.
 * The cached skin resolution is reusable for future full-body ("doll") renders.
 */
export class HeadService {
  private profileCache = new Map<string, ProfileEntry>();
  private headCache = new Map<string, HeadEntry>();
  private inflight = new Map<string, Promise<HeadEntry | null>>();

  async getHead(uuidRaw: string, size: number): Promise<HeadEntry | null> {
    const uuid = normalizeUuid(uuidRaw);
    const key = `${uuid}:${size}`;

    const cached = this.headCache.get(key);
    if (cached && Date.now() < cached.expiresAt) return cached;

    const existing = this.inflight.get(key);
    if (existing) return existing;

    const promise = this.computeHead(uuid, size, cached).finally(() => this.inflight.delete(key));
    this.inflight.set(key, promise);
    return promise;
  }

  private async computeHead(uuid: string, size: number, stale?: HeadEntry): Promise<HeadEntry | null> {
    const key = `${uuid}:${size}`;

    // 1. Authoritative: render from Mojang's skin if the player has one.
    try {
      const profile = await this.resolveProfile(uuid);
      if (profile?.skinUrl) {
        const skin = await fetchBuffer(profile.skinUrl);
        if (skin) {
          const buffer = renderHead(skin, size);
          return this.store(key, { buffer, contentType: 'image/png', expiresAt: Date.now() + HEAD_TTL });
        }
      }
    } catch {
      // Mojang unreachable / rate-limited — fall through to external services.
    }

    // 2. External render services (also the correct source for default skins).
    const external = await this.fetchExternalHead(uuid, size);
    if (external) {
      return this.store(key, { ...external, expiresAt: Date.now() + FALLBACK_TTL });
    }

    // 3. Last resort: whatever we last had, even if expired.
    return stale ?? null;
  }

  private async resolveProfile(uuid: string): Promise<ProfileEntry> {
    const cached = this.profileCache.get(uuid);
    if (cached && Date.now() - cached.fetchedAt < PROFILE_TTL) return cached;

    const res = await fetchWithTimeout(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`);

    // Unknown player → legitimately no custom skin. Cache the negative result.
    if (res.status === 204 || res.status === 404) {
      return this.cacheProfile(uuid, { skinUrl: null, slim: false, fetchedAt: Date.now() });
    }
    // Transient failure (e.g. 429/5xx) → throw so the caller uses the fallback; don't poison the cache.
    if (!res.ok) {
      throw new Error(`session server returned ${res.status}`);
    }

    const data = (await res.json()) as { properties?: Array<{ name: string; value: string }> };
    const texturesProp = data.properties?.find((p) => p.name === 'textures');
    if (!texturesProp) {
      return this.cacheProfile(uuid, { skinUrl: null, slim: false, fetchedAt: Date.now() });
    }

    const decoded = JSON.parse(Buffer.from(texturesProp.value, 'base64').toString('utf-8')) as {
      textures?: { SKIN?: { url?: string; metadata?: { model?: string } } };
    };
    const skin = decoded.textures?.SKIN;

    return this.cacheProfile(uuid, {
      skinUrl: skin?.url ?? null,
      slim: skin?.metadata?.model === 'slim',
      fetchedAt: Date.now(),
    });
  }

  private async fetchExternalHead(uuid: string, size: number): Promise<{ buffer: Buffer; contentType: string } | null> {
    const providers = [
      `https://mc-heads.net/avatar/${uuid}/${size}`,
      `https://crafatar.com/avatars/${uuid}?size=${size}&overlay`,
      `https://minotar.net/helm/${uuid}/${size}.png`,
    ];

    for (const url of providers) {
      try {
        const res = await fetchWithTimeout(url);
        if (res.ok) {
          const buffer = Buffer.from(await res.arrayBuffer());
          if (buffer.length > 0) {
            return { buffer, contentType: res.headers.get('content-type') || 'image/png' };
          }
        }
      } catch {
        // Try the next provider.
      }
    }
    return null;
  }

  private cacheProfile(uuid: string, entry: ProfileEntry): ProfileEntry {
    this.profileCache.set(uuid, entry);
    return entry;
  }

  private store(key: string, entry: HeadEntry): HeadEntry {
    this.headCache.set(key, entry);
    if (this.headCache.size > MAX_HEAD_CACHE) {
      // Map keeps insertion order — drop the oldest entry.
      const oldest = this.headCache.keys().next().value;
      if (oldest !== undefined) this.headCache.delete(oldest);
    }
    return entry;
  }
}

export const headService = new HeadService();
