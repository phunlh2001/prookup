import { composition, ellipse, fill, group, hex, layer, path, rect, stroke, trim, type Keyframe } from './builder'

const PRIMARY = hex('#4f55e3')
const SOFT = hex('#eef0fe')
const WHITE = hex('#ffffff')
const SLATE = hex('#cbd2df')
const SLATE_SOFT = hex('#f1f3f8')
const GREEN = hex('#2fb37a')

/** Front-facing parcel with tape, centred on its own origin. */
function parcel(body = SOFT, line = PRIMARY) {
  return [
    group([path([[-32, -8], [32, -8]]), stroke(line, 4)]),
    group([path([[0, -26], [0, -8]]), stroke(line, 4)]),
    group([rect(64, 52, 7), fill(body), stroke(line, 4)]),
  ]
}

/** Magnifying glass, lens centred on origin. */
function magnifier(line = PRIMARY) {
  return [
    group([path([[15, 15], [29, 29]]), stroke(line, 8)]),
    group([ellipse(36), fill(WHITE, 80), stroke(line, 6)]),
  ]
}

const loop = (frames: number, values: number[][]): Keyframe[] =>
  values.map((s, i) => ({ t: Math.round((frames / (values.length - 1)) * i), s }))

/**
 * Brand mark: a parcel on the primary tile with a magnifier that sweeps
 * across it, then rests (so the motion stays calm in the sidebar).
 */
export const logoAnimation = (() => {
  const F = 150
  const LIGHT = hex('#a7f3c9')
  const hold = (frames: [number, number[]][]): Keyframe[] => frames.map(([t, s]) => ({ t, s }))
  return composition('prookup-logo', 64, F, [
    layer(
      'magnifier',
      [
        group([path([[7, 7], [14, 14]]), stroke(LIGHT, 5)]),
        group([ellipse(19), fill(PRIMARY), stroke(WHITE, 4)]),
      ],
      {
        p: hold([
          [0, [38, 36]],
          [30, [24, 30]],
          [60, [40, 26]],
          [85, [38, 36]],
          [F, [38, 36]],
        ]),
        r: hold([
          [0, [0]],
          [30, [-10]],
          [60, [8]],
          [85, [0]],
          [F, [0]],
        ]),
      },
      F,
    ),
    layer(
      'parcel',
      [
        group([path([[-11, -5], [0, 1], [11, -5]]), stroke(WHITE, 3)]),
        group([path([[0, 1], [0, 13]]), stroke(WHITE, 3)]),
        group([
          path([[-11, -5], [0, -11], [11, -5], [11, 7], [0, 13], [-11, 7]], true),
          fill(WHITE, 18),
          stroke(WHITE, 3),
        ]),
      ],
      { p: [26, 28] },
      F,
    ),
    layer('tile', [group([rect(64, 64, 18), fill(PRIMARY)])], { p: [32, 32] }, F),
  ])
})()

/** Loading: a magnifier scanning a parcel while sparks pop. */
export const searchingAnimation = (() => {
  const F = 96
  const spark = (x: number, y: number, delay: number) =>
    layer(
      'spark',
      [group([ellipse(7), fill(GREEN)])],
      {
        p: [x, y],
        s: [
          { t: delay, s: [0, 0] },
          { t: delay + 12, s: [100, 100] },
          { t: delay + 24, s: [0, 0] },
        ],
      },
      F,
    )
  return composition('prookup-searching', 200, F, [
    layer(
      'magnifier',
      magnifier(),
      {
        p: loop(F, [[78, 92], [128, 96], [104, 126], [78, 92]]),
        r: loop(F, [[-6], [8], [0], [-6]]).map((k) => ({ t: k.t, s: k.s })),
      },
      F,
    ),
    spark(64, 64, 6),
    spark(140, 58, 36),
    spark(152, 128, 66),
    layer('parcel', parcel(), { p: [100, 116] }, F),
  ])
})()

/** Empty results: a grey parcel and a magnifier gently searching. */
export const emptyAnimation = (() => {
  const F = 120
  return composition('prookup-empty', 200, F, [
    layer(
      'magnifier',
      magnifier(PRIMARY),
      {
        p: loop(F, [[120, 82], [128, 74], [120, 82]]),
        r: loop(F, [[-10], [10], [-10]]),
      },
      F,
    ),
    layer('parcel', parcel(SLATE_SOFT, SLATE), { p: [88, 124] }, F),
    layer('shadow', [group([ellipse(90, 10), fill(SLATE_SOFT)])], { p: [92, 158] }, F),
  ])
})()

/** Background sync: rotating arc around a pulsing core. */
export const syncAnimation = (() => {
  const F = 48
  return composition('prookup-sync', 100, F, [
    layer(
      'arc',
      [group([ellipse(58), stroke(PRIMARY, 7), trim(0, 70)])],
      { p: [50, 50], r: [{ t: 0, s: [0] }, { t: F, s: [360] }] },
      F,
    ),
    layer(
      'core',
      [group([ellipse(16), fill(GREEN)])],
      { p: [50, 50], s: loop(F, [[80, 80], [115, 115], [80, 80]]) },
      F,
    ),
  ])
})()

/** Product discovery: parcel with a rising trend line drawing itself. */
export const discoveryAnimation = (() => {
  const F = 120
  const linePts = [[-56, 22], [-30, 4], [-10, 12], [18, -16], [52, -36]]
  return composition('prookup-discovery', 200, F, [
    layer(
      'trend',
      [
        group([
          path(linePts),
          stroke(GREEN, 6),
          trim(0, [
            { t: 0, s: [0] },
            { t: 50, s: [100] },
            { t: 100, s: [100] },
            { t: 118, s: [0] },
          ]),
        ]),
      ],
      { p: [104, 70] },
      F,
    ),
    layer(
      'tip',
      [group([ellipse(12), fill(GREEN)])],
      {
        p: [156, 34],
        s: [
          { t: 46, s: [0, 0] },
          { t: 56, s: [120, 120] },
          { t: 64, s: [100, 100] },
          { t: 100, s: [100, 100] },
          { t: 112, s: [0, 0] },
        ],
      },
      F,
    ),
    layer('magnifier', magnifier(), { p: [136, 128], r: loop(F, [[0], [-8], [0]]) }, F),
    layer('parcel', parcel(), { p: [84, 136], s: loop(F, [[100, 100], [103, 103], [100, 100]]) }, F),
  ])
})()
