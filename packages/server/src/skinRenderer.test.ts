import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PNG } from 'pngjs';
import { renderHead } from './skinRenderer';

type RGBA = [number, number, number, number];

function makeSkin(face: RGBA, hat: RGBA | null, hatUsesAlpha = true): Buffer {
  const png = new PNG({ width: 64, height: 64 }); // data starts all-zero (transparent)
  const set = (x: number, y: number, [r, g, b, a]: RGBA) => {
    const i = (y * 64 + x) * 4;
    png.data[i] = r;
    png.data[i + 1] = g;
    png.data[i + 2] = b;
    png.data[i + 3] = a;
  };
  for (let y = 8; y < 16; y++) for (let x = 8; x < 16; x++) set(x, y, face);
  if (hat) {
    for (let y = 8; y < 16; y++) for (let x = 40; x < 48; x++) set(x, y, hat);
    // A real overlay layer has some transparency; mark one corner so it isn't
    // treated as a fully-opaque legacy filler.
    if (hatUsesAlpha) set(40, 8, [hat[0], hat[1], hat[2], 0]);
  }
  return PNG.sync.write(png);
}

function centerPixel(buffer: Buffer): RGBA {
  const png = PNG.sync.read(buffer);
  const mid = Math.floor(png.height / 2);
  const i = (mid * png.width + mid) * 4;
  return [png.data[i], png.data[i + 1], png.data[i + 2], png.data[i + 3]];
}

test('renders an 8x8 head from the face region', () => {
  const out = PNG.sync.read(renderHead(makeSkin([255, 0, 0, 255], null), 8));
  assert.equal(out.width, 8);
  assert.equal(out.height, 8);
  assert.deepEqual(centerPixel(renderHead(makeSkin([255, 0, 0, 255], null), 8)), [255, 0, 0, 255]);
});

test('composites a hat that uses transparency over the face', () => {
  assert.deepEqual(centerPixel(renderHead(makeSkin([255, 0, 0, 255], [0, 0, 255, 255]), 8)), [0, 0, 255, 255]);
});

test('a transparent hat leaves the face visible', () => {
  assert.deepEqual(centerPixel(renderHead(makeSkin([10, 200, 30, 255], [0, 0, 0, 0]), 8)), [10, 200, 30, 255]);
});

test('a fully-opaque (legacy filler) hat is ignored so the face shows', () => {
  // e.g. Notch's legacy skin has an opaque overlay that must not paint the head solid.
  assert.deepEqual(centerPixel(renderHead(makeSkin([200, 150, 100, 255], [0, 0, 0, 255], false), 8)), [200, 150, 100, 255]);
});

test('upscales to the requested size', () => {
  const out = PNG.sync.read(renderHead(makeSkin([1, 2, 3, 255], null), 64));
  assert.equal(out.width, 64);
  assert.equal(out.height, 64);
});
