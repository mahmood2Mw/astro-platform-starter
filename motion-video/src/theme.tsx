import React from 'react';
import { Easing, interpolate, random, staticFile, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import '@fontsource/cairo/400.css';
import '@fontsource/cairo/600.css';
import '@fontsource/cairo/700.css';
import '@fontsource/cairo/800.css';
import '@fontsource/cairo/900.css';
import '@fontsource/lalezar/400.css';

/* ------------------------------------------------------------------ */
/* Tokens — promo palette taken from the poster (maroon / navy / gold) */
/* plus a tech cyan accent                                             */
/* ------------------------------------------------------------------ */
export const C = {
  bg0: '#040812',
  bg1: '#0b1a33',
  navy: '#12306b',
  navy2: '#1d4fa8',
  maroon: '#8e0f3a',
  crimson: '#e3245e',
  gold: '#f6c453',
  gold2: '#ffe39a',
  goldDeep: '#b8831f',
  cyan: '#41d6f0',
  white: '#ffffff',
  dim: 'rgba(255,255,255,0.6)',
};
export const GOLD_GRAD = `linear-gradient(180deg, ${C.gold2} 0%, ${C.gold} 45%, ${C.goldDeep} 100%)`;
export const FONT = "'Cairo', sans-serif";
export const AD = "'Lalezar', 'Cairo', sans-serif";

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const ease = Easing.bezier(0.22, 1, 0.36, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

export const fadeIn = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: ease });

export const useSpr = (delay = 0, cfg: Partial<{ damping: number; stiffness: number; mass: number }> = {}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 120, ...cfg } });
};

export const glass: React.CSSProperties = {
  background: 'linear-gradient(160deg, rgba(255,255,255,0.11), rgba(255,255,255,0.03))',
  border: '1.5px solid rgba(255,255,255,0.16)',
  borderRadius: 30,
  boxShadow: '0 30px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.18)',
  backdropFilter: 'blur(14px)',
};

/* Gold text helper */
export const goldText = (shine = -100): React.CSSProperties => ({
  backgroundImage: `linear-gradient(105deg, ${C.goldDeep} 0%, ${C.gold} ${shine - 25}%, #fff8e0 ${shine}%, ${C.gold} ${shine + 25}%, ${C.goldDeep} 120%)`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  padding: '0 0.18em',
  margin: '0 -0.18em',
});

/* ------------------------------------------------------------------ */
/* Institute logo — real calligraphic mark, rendered as glowing gold   */
/* ------------------------------------------------------------------ */
const LOGO_RATIO = 499 / 985;
export const GoldLogo: React.FC<{ height: number; reveal?: number; glow?: number }> = ({ height, reveal = 1, glow = 1 }) => {
  const frame = useCurrentFrame();
  const shine = ((frame * 2.2) % 260) - 80; // moving highlight
  const url = `url(${staticFile('logo-mask.png')})`;
  return (
    <div
      style={{
        width: height * LOGO_RATIO,
        height,
        filter: `drop-shadow(0 0 ${height * 0.04 * glow}px ${C.gold}) drop-shadow(0 0 ${height * 0.12 * glow}px ${C.gold}88)`,
      }}
    >
      <div
        style={{
          clipPath: `inset(${(1 - reveal) * 100}% 0 0 0)`,
          width: '100%',
          height: '100%',
          WebkitMaskImage: url,
          maskImage: url,
          WebkitMaskSize: '100% 100%',
          maskSize: '100% 100%',
          backgroundImage: `linear-gradient(160deg, ${C.goldDeep} 0%, ${C.gold} ${shine - 30}%, #fffbe8 ${shine}%, ${C.gold} ${shine + 30}%, ${C.goldDeep} 140%)`,
        }}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */
type IP = { size?: number; color?: string; stroke?: number };
const Svg: React.FC<IP & { children: React.ReactNode }> = ({ size = 48, color = C.white, stroke = 2, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
export const Icon = {
  briefcase: (p: IP) => (
    <Svg {...p}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
    </Svg>
  ),
  doc: (p: IP) => (
    <Svg {...p}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </Svg>
  ),
  laptop: (p: IP) => (
    <Svg {...p}>
      <rect x="4" y="5" width="16" height="11" rx="1.5" />
      <path d="M2 19h20" />
    </Svg>
  ),
  user: (p: IP) => (
    <Svg {...p}>
      <circle cx="10" cy="8" r="4" />
      <path d="M3 20c0-3.5 3-6 7-6 1.2 0 2.3.2 3.2.6" />
      <circle cx="17" cy="17" r="3" />
      <path d="M19.2 19.2 21.5 21.5" />
    </Svg>
  ),
  globe: (p: IP) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />
    </Svg>
  ),
  mail: (p: IP) => (
    <Svg {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </Svg>
  ),
  cloud: (p: IP) => (
    <Svg {...p}>
      <path d="M7 18a5 5 0 1 1 1-9.9A6 6 0 0 1 19.5 10 4 4 0 0 1 18 18z" />
      <path d="M10 13l2-2 2 2M12 11v5" />
    </Svg>
  ),
  wifi: (p: IP) => (
    <Svg {...p}>
      <path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01" />
    </Svg>
  ),
  pin: (p: IP) => (
    <Svg {...p}>
      <path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </Svg>
  ),
  phone: (p: IP) => (
    <Svg {...p}>
      <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z" />
    </Svg>
  ),
  camera: (p: IP) => (
    <Svg {...p}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </Svg>
  ),
  arrowUp: (p: IP) => (
    <Svg {...p}>
      <path d="M12 20V5M5 12l7-7 7 7" />
    </Svg>
  ),
  search: (p: IP) => (
    <Svg {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </Svg>
  ),
  team: (p: IP) => (
    <Svg {...p}>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 14.5c3 0 6 2 6 5.5" />
    </Svg>
  ),
};

export const AppTile: React.FC<{ letter: string; color: string; size?: number }> = ({ letter, color, size = 84 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.24,
      background: `linear-gradient(145deg, ${color}, ${color}99)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: size * 0.5,
      color: C.white,
      boxShadow: `0 0 ${size * 0.35}px ${color}99, inset 0 2px 0 rgba(255,255,255,0.4)`,
      border: '1.5px solid rgba(255,255,255,0.25)',
    }}
  >
    {letter}
  </div>
);

export const Bubble: React.FC<{ children: React.ReactNode; size?: number; color?: string }> = ({ children, size = 96, color = C.cyan }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.2), rgba(8,20,40,0.92))',
      border: `2px solid ${color}aa`,
      boxShadow: `0 0 ${size * 0.3}px ${color}66`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {children}
  </div>
);

/* ------------------------------------------------------------------ */
/* Ad headline: words rise out of a mask one by one (display font)     */
/* ------------------------------------------------------------------ */
export type Line = { text: string; size: number; color?: string; gold?: boolean; glow?: string };
export const Headline: React.FC<{ lines: Line[]; start?: number; step?: number; top: number; gap?: number }> = ({
  lines,
  start = 6,
  step = 3,
  top,
  gap = 0,
}) => {
  const frame = useCurrentFrame();
  let idx = 0;
  const shine = interpolate(frame, [start + 20, start + 55], [-60, 180], clamp);
  return (
    <div style={{ position: 'absolute', top, left: 50, right: 50, direction: 'rtl', textAlign: 'center' }}>
      {lines.map((ln, li) => (
        <div key={li} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: `0 ${ln.size * 0.22}px`, marginTop: li ? gap : 0 }}>
          {ln.text.split(' ').map((wd, wi) => {
            const s = start + idx++ * step;
            const p = interpolate(frame, [s, s + 12], [0, 1], { ...clamp, easing: ease });
            return (
              <span key={wi} style={{ display: 'inline-block', overflow: 'hidden', padding: `${ln.size * 0.12}px 6px ${ln.size * 0.05}px`, margin: `-${ln.size * 0.12}px -6px 0` }}>
                <span
                  style={{
                    display: 'inline-block',
                    fontFamily: AD,
                    fontSize: ln.size,
                    lineHeight: 1.25,
                    color: ln.color ?? C.white,
                    transform: `translateY(${(1 - p) * 105}%) rotate(${(1 - p) * 6}deg)`,
                    textShadow: ln.gold ? undefined : `0 0 24px ${ln.glow ?? 'rgba(0,0,0,0.6)'}`,
                    filter: ln.gold ? `drop-shadow(0 0 18px ${C.gold}88)` : undefined,
                    ...(ln.gold ? goldText(shine) : {}),
                  }}
                >
                  {wd}
                </span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Decorative tech pieces                                              */
/* ------------------------------------------------------------------ */
export const HudRing: React.FC<{ size: number; color?: string; speed?: number; dash?: string; width?: number; opacity?: number }> = ({
  size,
  color = C.cyan,
  speed = 1,
  dash = '30 14',
  width = 2,
  opacity = 0.6,
}) => {
  const frame = useCurrentFrame();
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute', left: -size / 2, top: -size / 2, opacity }}>
      <circle cx="50" cy="50" r={49 - width} fill="none" stroke={color} strokeWidth={width * (100 / size) * 4} strokeDasharray={dash} transform={`rotate(${frame * speed} 50 50)`} />
    </svg>
  );
};

/** Gold confetti / spark burst from a point */
export const Sparks: React.FC<{ at: number; count?: number; spread?: number; seed?: string }> = ({ at, count = 26, spread = 420, seed = 's' }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 50) return null;
  return (
    <>
      {new Array(count).fill(0).map((_, i) => {
        const a = random(`${seed}a${i}`) * Math.PI * 2;
        const d = (0.4 + random(`${seed}d${i}`) * 0.6) * spread * (1 - Math.exp(-t / 9));
        const g = t * t * 0.08;
        const o = interpolate(t, [0, 4, 50], [0, 1, 0], clamp);
        const col = random(`${seed}c${i}`) > 0.35 ? C.gold : random(`${seed}e${i}`) > 0.5 ? C.white : C.crimson;
        const sz = 6 + random(`${seed}s${i}`) * 8;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: Math.cos(a) * d - sz / 2,
              top: Math.sin(a) * d + g - sz / 2,
              width: sz,
              height: sz * (i % 3 === 0 ? 2.2 : 1),
              borderRadius: i % 3 === 0 ? 2 : '50%',
              background: col,
              opacity: o,
              transform: `rotate(${t * 12 + i * 40}deg)`,
              boxShadow: `0 0 10px ${col}`,
            }}
          />
        );
      })}
    </>
  );
};

/* Animated cursor arrow */
export const Cursor: React.FC<{ x: number; y: number; click?: number }> = ({ x, y, click = 0 }) => (
  <div style={{ position: 'absolute', left: x, top: y, zIndex: 10 }}>
    {click > 0 && (
      <div
        style={{
          position: 'absolute',
          left: -30 * click,
          top: -30 * click,
          width: 60 * click,
          height: 60 * click,
          borderRadius: '50%',
          border: `3px solid ${C.gold}`,
          opacity: 1 - click,
        }}
      />
    )}
    <svg width="38" height="46" viewBox="0 0 24 30">
      <path d="M2 2 L2 24 L8 18 L12 28 L16 26 L12 17 L20 17 Z" fill="#fff" stroke="#111" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  </div>
);
