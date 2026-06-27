import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { PNG } from 'pngjs';
import { HeadService, isValidUuid } from './HeadService';

const UUID = '12c1b1a768f4452b89ca846f5927df5d';
const realFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = realFetch;
});

function skinBuffer(): Buffer {
  const png = new PNG({ width: 64, height: 64 });
  for (let y = 8; y < 16; y++) {
    for (let x = 8; x < 16; x++) {
      const i = (y * 64 + x) * 4;
      png.data[i] = 12;
      png.data[i + 1] = 34;
      png.data[i + 2] = 56;
      png.data[i + 3] = 255;
    }
  }
  return PNG.sync.write(png);
}

function texturesValue(url: string): string {
  return Buffer.from(JSON.stringify({ textures: { SKIN: { url } } }), 'utf-8').toString('base64');
}

function jsonResponse(obj: unknown): any {
  return { ok: true, status: 200, json: async () => obj, headers: { get: () => 'application/json' } };
}

function bufferResponse(buf: Buffer, contentType = 'image/png'): any {
  return {
    ok: true,
    status: 200,
    arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
    headers: { get: () => contentType },
  };
}

test('isValidUuid accepts dashed/undashed and rejects junk', () => {
  assert.equal(isValidUuid('12c1b1a7-68f4-452b-89ca-846f5927df5d'), true);
  assert.equal(isValidUuid(UUID), true);
  assert.equal(isValidUuid('../../etc/passwd'), false);
  assert.equal(isValidUuid('notauuid'), false);
});

test('renders a PNG head from the Mojang skin and caches it (no refetch)', async () => {
  let sessionCalls = 0;
  let skinCalls = 0;
  globalThis.fetch = (async (url: string) => {
    const u = String(url);
    if (u.includes('sessionserver.mojang.com')) {
      sessionCalls++;
      return jsonResponse({ properties: [{ name: 'textures', value: texturesValue('https://textures.minecraft.net/skinA') }] });
    }
    if (u.includes('textures.minecraft.net')) {
      skinCalls++;
      return bufferResponse(skinBuffer());
    }
    throw new Error(`unexpected fetch: ${u}`);
  }) as any;

  const svc = new HeadService();
  const head = await svc.getHead(UUID, 32);
  assert.ok(head);
  assert.equal(head!.contentType, 'image/png');
  assert.deepEqual([...head!.buffer.subarray(0, 4)], [0x89, 0x50, 0x4e, 0x47]); // PNG signature

  const again = await svc.getHead(UUID, 32);
  assert.ok(again);
  assert.equal(sessionCalls, 1);
  assert.equal(skinCalls, 1);
});

test('falls back to an external service when Mojang is unreachable', async () => {
  let mcHeadsCalls = 0;
  globalThis.fetch = (async (url: string) => {
    const u = String(url);
    if (u.includes('sessionserver.mojang.com')) throw new Error('network down');
    if (u.includes('mc-heads.net')) {
      mcHeadsCalls++;
      return bufferResponse(Buffer.from('FAKEHEAD'));
    }
    throw new Error(`unexpected fetch: ${u}`);
  }) as any;

  const svc = new HeadService();
  const head = await svc.getHead(UUID, 32);
  assert.ok(head);
  assert.equal(head!.buffer.toString(), 'FAKEHEAD');
  assert.equal(mcHeadsCalls, 1);
});

test('de-dupes concurrent requests for the same head', async () => {
  let sessionCalls = 0;
  globalThis.fetch = (async (url: string) => {
    const u = String(url);
    if (u.includes('sessionserver.mojang.com')) {
      sessionCalls++;
      return jsonResponse({ properties: [{ name: 'textures', value: texturesValue('https://textures.minecraft.net/skinB') }] });
    }
    if (u.includes('textures.minecraft.net')) return bufferResponse(skinBuffer());
    throw new Error(`unexpected fetch: ${u}`);
  }) as any;

  const svc = new HeadService();
  const [a, b] = await Promise.all([svc.getHead(UUID, 64), svc.getHead(UUID, 64)]);
  assert.ok(a && b);
  assert.equal(sessionCalls, 1);
});
