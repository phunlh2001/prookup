/**
 * Minimal Lottie (Bodymovin) JSON builder. Prookup's animations are generated
 * in code: tiny, on-brand, licence-free, and easy to tweak.
 */
type Vec = number[]
type Prop = { a: 0; k: unknown } | { a: 1; k: unknown[] }
export type Keyframe = { t: number; s: Vec }
export type RGB = [number, number, number]

const ease = { i: { x: [0.45], y: [1] }, o: { x: [0.55], y: [0] } }

export const st = (k: unknown): Prop => ({ a: 0, k })
export const kf = (frames: Keyframe[]): Prop => ({
  a: 1,
  k: frames.map((f, i) => (i < frames.length - 1 ? { t: f.t, s: f.s, ...ease } : { t: f.t, s: f.s })),
})
const val = (v: Vec | number | Keyframe[]) =>
  Array.isArray(v) && typeof v[0] === 'object' ? kf(v as Keyframe[]) : st(v)

export const hex = (h: string): RGB => {
  const n = Number.parseInt(h.replace('#', ''), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

// ---------- shapes ----------
export const ellipse = (w: number, h = w, p: Vec = [0, 0]) => ({ ty: 'el', p: st(p), s: st([w, h]), d: 1 })
export const rect = (w: number, h: number, r = 0, p: Vec = [0, 0]) => ({
  ty: 'rc',
  p: st(p),
  s: st([w, h]),
  r: st(r),
  d: 1,
})
export const path = (v: Vec[], closed = false) => ({
  ty: 'sh',
  d: 1,
  ks: st({ i: v.map(() => [0, 0]), o: v.map(() => [0, 0]), v, c: closed }),
})
export const fill = (c: RGB, opacity = 100) => ({ ty: 'fl', c: st([...c, 1]), o: st(opacity), r: 1 })
export const stroke = (c: RGB, w: number) => ({
  ty: 'st',
  c: st([...c, 1]),
  o: st(100),
  w: st(w),
  lc: 2,
  lj: 2,
  ml: 4,
})
export const trim = (s: number | Keyframe[], e: number | Keyframe[], o: number | Keyframe[] = 0) => ({
  ty: 'tm',
  s: val(s),
  e: val(e),
  o: val(o),
  m: 1,
})

export interface TransformInit {
  p?: Vec | Keyframe[]
  a?: Vec
  s?: Vec | Keyframe[]
  r?: number | Keyframe[]
  o?: number | Keyframe[]
}

export const group = (items: object[], t: TransformInit = {}) => ({
  ty: 'gr',
  it: [
    ...items,
    {
      ty: 'tr',
      p: val(t.p ?? [0, 0]),
      a: st(t.a ?? [0, 0]),
      s: val(t.s ?? [100, 100]),
      r: val(t.r ?? 0),
      o: val(t.o ?? 100),
      sk: st(0),
      sa: st(0),
    },
  ],
})

// ---------- layers & composition ----------
let layerIndex = 0

export function layer(nm: string, shapes: object[], t: TransformInit = {}, op = 600) {
  const pad3 = (v: Vec | Keyframe[]) =>
    Array.isArray(v) && typeof v[0] === 'object'
      ? kf((v as Keyframe[]).map((f) => ({ t: f.t, s: [...f.s, 0].slice(0, 3) })))
      : st([...(v as Vec), 0].slice(0, 3))
  const scale = t.s ?? [100, 100]
  return {
    ddd: 0,
    ind: ++layerIndex,
    ty: 4,
    nm,
    sr: 1,
    ks: {
      o: val(t.o ?? 100),
      r: val(t.r ?? 0),
      p: pad3(t.p ?? [0, 0]),
      a: st([...(t.a ?? [0, 0]), 0]),
      s:
        Array.isArray(scale) && typeof scale[0] === 'object'
          ? kf((scale as Keyframe[]).map((f) => ({ t: f.t, s: [...f.s, 100] })))
          : st([...(scale as Vec), 100]),
    },
    ao: 0,
    shapes,
    ip: 0,
    op,
    st: 0,
    bm: 0,
  }
}

export function composition(nm: string, size: number, frames: number, layers: object[]) {
  return {
    v: '5.7.4',
    fr: 30,
    ip: 0,
    op: frames,
    w: size,
    h: size,
    nm,
    ddd: 0,
    assets: [],
    layers,
  }
}
