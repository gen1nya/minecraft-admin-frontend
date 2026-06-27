import { PNG } from 'pngjs';

// Minecraft skin layout: the front of the head is an 8x8 face with an 8x8 hat
// overlay. These coordinates hold for both modern 64x64 and legacy 64x32 skins.
const HEAD = 8;
const FACE = { x: 8, y: 8 };
const HAT = { x: 40, y: 8 };

function pixel(png: PNG, x: number, y: number): [number, number, number, number] {
  const i = (y * png.width + x) * 4;
  return [png.data[i], png.data[i + 1], png.data[i + 2], png.data[i + 3]];
}

// True only when the hat overlay uses transparency. Legacy (64x32) skins fill the
// unused overlay with a fully-opaque colour; compositing it would, e.g., paint
// Notch's head solid black. A real hat layer always has some transparent pixels.
function hasUsableHat(skin: PNG): boolean {
  if (skin.width < HAT.x + HEAD || skin.height < HAT.y + HEAD) return false;
  for (let y = 0; y < HEAD; y++) {
    for (let x = 0; x < HEAD; x++) {
      if (pixel(skin, HAT.x + x, HAT.y + y)[3] !== 255) return true;
    }
  }
  return false;
}

// Composite the 8x8 head (face + hat overlay, source-over) into a flat RGBA array.
function buildHead(skin: PNG): number[] {
  const hasFace = skin.width >= FACE.x + HEAD && skin.height >= FACE.y + HEAD;
  if (!hasFace) {
    throw new Error(`Skin too small: ${skin.width}x${skin.height}`);
  }
  const hasHat = hasUsableHat(skin);

  const out: number[] = new Array(HEAD * HEAD * 4);
  for (let y = 0; y < HEAD; y++) {
    for (let x = 0; x < HEAD; x++) {
      const [br, bg, bb, ba] = pixel(skin, FACE.x + x, FACE.y + y);
      const o = (y * HEAD + x) * 4;

      if (hasHat) {
        const [hr, hg, hb, ha] = pixel(skin, HAT.x + x, HAT.y + y);
        const sa = ha / 255;
        out[o] = Math.round(hr * sa + br * (1 - sa));
        out[o + 1] = Math.round(hg * sa + bg * (1 - sa));
        out[o + 2] = Math.round(hb * sa + bb * (1 - sa));
        out[o + 3] = Math.max(ba, ha);
      } else {
        out[o] = br;
        out[o + 1] = bg;
        out[o + 2] = bb;
        out[o + 3] = ba;
      }
    }
  }
  return out;
}

// Nearest-neighbour upscale of the 8x8 head to `size`x`size`, encoded as PNG.
export function renderHead(skinBuffer: Buffer, size: number): Buffer {
  const skin = PNG.sync.read(skinBuffer);
  const head = buildHead(skin);

  const out = new PNG({ width: size, height: size });
  for (let ty = 0; ty < size; ty++) {
    const sy = Math.floor((ty * HEAD) / size);
    for (let tx = 0; tx < size; tx++) {
      const sx = Math.floor((tx * HEAD) / size);
      const s = (sy * HEAD + sx) * 4;
      const d = (ty * size + tx) * 4;
      out.data[d] = head[s];
      out.data[d + 1] = head[s + 1];
      out.data[d + 2] = head[s + 2];
      out.data[d + 3] = head[s + 3];
    }
  }
  return PNG.sync.write(out);
}
