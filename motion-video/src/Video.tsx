import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  random,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import '@fontsource/cairo/400.css';
import '@fontsource/cairo/600.css';
import '@fontsource/cairo/700.css';
import '@fontsource/cairo/800.css';
import '@fontsource/cairo/900.css';

/* ------------------------------------------------------------------ */
/* Design tokens                                                       */
/* ------------------------------------------------------------------ */
const C = {
  bg1: '#0c2233',
  bg2: '#050a12',
  cyan: '#45dcf2',
  crimson: '#ff2d6a',
  maroon: '#a3123f',
  gold: '#ffc145',
  navy: '#12306b',
  white: '#ffffff',
  dim: 'rgba(255,255,255,0.55)',
};
const FONT = "'Cairo', sans-serif";

/* Scene timeline (frames @30fps) */
const SCENES = {
  intro: [0, 90],
  question: [90, 120],
  skills: [210, 120],
  title: [330, 135],
  modules: [465, 135],
  cert: [600, 120],
  details: [720, 165],
  cta: [885, 120],
  outro: [1005, 135],
} as const;
export const TOTAL_FRAMES = 1140;

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1);

const useSpring = (delay = 0, config: Partial<{ damping: number; stiffness: number; mass: number }> = {}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 120, ...config } });
};

const fadeIn = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: ease });

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */
type IconProps = { size?: number; color?: string; stroke?: number };
const Svg: React.FC<IconProps & { children: React.ReactNode }> = ({ size = 48, color = C.white, stroke = 2, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const Icon = {
  briefcase: (p: IconProps) => (
    <Svg {...p}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
    </Svg>
  ),
  doc: (p: IconProps) => (
    <Svg {...p}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </Svg>
  ),
  chart: (p: IconProps) => (
    <Svg {...p}>
      <path d="M3 20h18M6 16l4-5 3 3 5-7" />
      <path d="M15 7h3v3" />
    </Svg>
  ),
  laptop: (p: IconProps) => (
    <Svg {...p}>
      <rect x="4" y="5" width="16" height="11" rx="1.5" />
      <path d="M2 19h20" />
    </Svg>
  ),
  user: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="10" cy="8" r="4" />
      <path d="M3 20c0-3.5 3-6 7-6 1.2 0 2.3.2 3.2.6" />
      <circle cx="17" cy="17" r="3" />
      <path d="M19.2 19.2 21.5 21.5" />
    </Svg>
  ),
  calendar: (p: IconProps) => (
    <Svg {...p}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" />
    </Svg>
  ),
  clock: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Svg>
  ),
  hourglass: (p: IconProps) => (
    <Svg {...p}>
      <path d="M6 3h12M6 21h12M7 3c0 5 10 5 10 9s-10 4-10 9M17 3c0 5-10 5-10 9s10 4 10 9" />
    </Svg>
  ),
  globe: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />
    </Svg>
  ),
  mail: (p: IconProps) => (
    <Svg {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </Svg>
  ),
  cloud: (p: IconProps) => (
    <Svg {...p}>
      <path d="M7 18a5 5 0 1 1 1-9.9A6 6 0 0 1 19.5 10 4 4 0 0 1 18 18z" />
      <path d="M10 13l2-2 2 2M12 11v5" />
    </Svg>
  ),
  wifi: (p: IconProps) => (
    <Svg {...p}>
      <path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01" />
    </Svg>
  ),
  send: (p: IconProps) => (
    <Svg {...p}>
      <path d="M21 3 10 14M21 3l-7 18-4-7-7-4z" />
    </Svg>
  ),
  pin: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </Svg>
  ),
  phone: (p: IconProps) => (
    <Svg {...p}>
      <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z" />
    </Svg>
  ),
  camera: (p: IconProps) => (
    <Svg {...p}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </Svg>
  ),
  check: (p: IconProps) => (
    <Svg {...p}>
      <path d="m5 12 5 5 9-10" />
    </Svg>
  ),
};

/* ------------------------------------------------------------------ */
/* Shared building blocks                                              */
/* ------------------------------------------------------------------ */
const glass: React.CSSProperties = {
  background: 'linear-gradient(160deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))',
  border: '1.5px solid rgba(255,255,255,0.16)',
  borderRadius: 30,
  boxShadow: '0 30px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
  backdropFilter: 'blur(14px)',
};

const AppTile: React.FC<{ letter: string; color: string; size?: number }> = ({ letter, color, size = 84 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.24,
      background: `linear-gradient(145deg, ${color}, ${color}aa)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: FONT,
      fontWeight: 800,
      fontSize: size * 0.52,
      color: C.white,
      boxShadow: `0 0 30px ${color}88, inset 0 2px 0 rgba(255,255,255,0.35)`,
    }}
  >
    {letter}
  </div>
);

const IconBubble: React.FC<{ children: React.ReactNode; size?: number; color?: string }> = ({ children, size = 96, color = C.cyan }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.18), rgba(10,30,45,0.9))',
      border: `2px solid ${color}88`,
      boxShadow: `0 0 26px ${color}66`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {children}
  </div>
);

/** Background: deep gradient + perspective grid floor + floating particles */
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const particles = new Array(40).fill(0).map((_, i) => {
    const x = random(`px${i}`) * 1080;
    const speed = 0.3 + random(`ps${i}`) * 0.8;
    const y = (random(`py${i}`) * 2100 - frame * speed) % 2100;
    const s = 2 + random(`pz${i}`) * 4;
    const col = random(`pc${i}`) > 0.7 ? C.crimson : C.cyan;
    const tw = 0.3 + 0.7 * Math.abs(Math.sin(frame / 20 + i));
    return { x, y: y < 0 ? y + 2100 : y, s, col, tw };
  });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 30%, ${C.bg1} 0%, #08141f 55%, ${C.bg2} 100%)` }}>
      {/* glowing blobs */}
      <div style={{ position: 'absolute', left: -200, top: 1300, width: 900, height: 700, borderRadius: '50%', background: `${C.maroon}`, opacity: 0.22, filter: 'blur(160px)' }} />
      <div style={{ position: 'absolute', right: -250, top: 200, width: 800, height: 800, borderRadius: '50%', background: '#0f6d86', opacity: 0.28, filter: 'blur(170px)' }} />
      {/* grid floor */}
      <div
        style={{
          position: 'absolute',
          left: -700,
          width: 2480,
          bottom: -200,
          height: 1000,
          transform: 'perspective(700px) rotateX(72deg)',
          transformOrigin: '50% 100%',
          backgroundImage: `linear-gradient(rgba(69,220,242,0.22) 2px, transparent 2px), linear-gradient(90deg, rgba(69,220,242,0.22) 2px, transparent 2px)`,
          backgroundSize: '90px 90px',
          backgroundPosition: `0 ${frame * 2}px`,
          maskImage: 'linear-gradient(to top, black 10%, transparent 85%)',
          WebkitMaskImage: 'linear-gradient(to top, black 10%, transparent 85%)',
          opacity: 0.6,
        }}
      />
      {/* dotted texture top corners */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1.5px, transparent 1.5px)',
          backgroundSize: '34px 34px',
          maskImage: 'radial-gradient(ellipse at 100% 0%, black 0%, transparent 45%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 100% 0%, black 0%, transparent 45%)',
        }}
      />
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.s,
            height: p.s,
            borderRadius: '50%',
            background: p.col,
            opacity: p.tw * 0.8,
            boxShadow: `0 0 ${p.s * 3}px ${p.col}`,
          }}
        />
      ))}
      {/* vignette */}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(0,0,0,0.6) 100%)' }} />
    </AbsoluteFill>
  );
};

/** Persistent top UI: handle pill (left) + institute mark (right) */
const Chrome: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [70, 90, TOTAL_FRAMES - 60, TOTAL_FRAMES - 40], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: o, pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: 40,
          top: 52,
          padding: '8px 22px',
          borderRadius: 40,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'rgba(255,255,255,0.85)',
          fontFamily: FONT,
          fontSize: 26,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: C.cyan, boxShadow: `0 0 10px ${C.cyan}` }} />
        @Alyaqin_institute
      </div>
      <div style={{ position: 'absolute', right: 48, top: 44, textAlign: 'right', direction: 'rtl', fontFamily: FONT }}>
        <div style={{ color: C.white, fontWeight: 800, fontSize: 32, lineHeight: 1.2 }}>معهد اليقين الدولي</div>
        <div style={{ color: C.cyan, fontWeight: 600, fontSize: 14, letterSpacing: 2, direction: 'ltr' }}>ALYAQIN INTERNATIONAL INSTITUTE</div>
      </div>
    </AbsoluteFill>
  );
};

/** Word-by-word animated caption (bottom third), like the reference */
type Word = { t: string; c?: string };
const w = (s: string, hi: Record<string, string> = {}): Word[] => s.split(' ').map((t) => ({ t, c: hi[t] }));

const Caption: React.FC<{ words: Word[]; start?: number; step?: number; top?: number; size?: number }> = ({
  words,
  start = 8,
  step = 4,
  top = 1390,
  size = 56,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 70,
        right: 70,
        direction: 'rtl',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0 16px',
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.45,
      }}
    >
      {words.map((wd, i) => {
        const s = start + i * step;
        const o = interpolate(frame, [s, s + 8], [0, 1], clamp);
        const y = interpolate(frame, [s, s + 10], [24, 0], { ...clamp, easing: ease });
        const b = interpolate(frame, [s, s + 8], [10, 0], clamp);
        // Active word flashes brighter, then settles
        const active = interpolate(frame, [s, s + 6, s + 18], [0, 1, 0.35], clamp);
        const color = wd.c ?? C.white;
        return (
          <span
            key={i}
            style={{
              opacity: o,
              transform: `translateY(${y}px)`,
              filter: `blur(${b}px)`,
              color,
              textShadow: wd.c ? `0 0 ${18 + active * 20}px ${wd.c}aa` : `0 0 ${active * 24}px rgba(255,255,255,0.6)`,
            }}
          >
            {wd.t}
          </span>
        );
      })}
    </div>
  );
};

/** Wraps each scene with a cinematic enter/exit (scale + blur + fade) */
const SceneWrap: React.FC<{ dur: number; children: React.ReactNode; noExit?: boolean }> = ({ dur, children, noExit }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 14], [0, 1], { ...clamp, easing: ease });
  const exit = noExit ? 0 : interpolate(frame, [dur - 10, dur], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const scale = 1.06 - 0.06 * enter - 0.05 * exit;
  return (
    <AbsoluteFill
      style={{
        opacity: enter * (1 - exit),
        transform: `scale(${scale})`,
        filter: `blur(${(1 - enter) * 16 + exit * 16}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Bright light-streak that sweeps across at scene cuts */
const CutFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, 12], [-400, 1480], clamp);
  const o = interpolate(frame, [0, 3, 12], [0, 0.9, 0], clamp);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: -200,
          left: x,
          width: 160,
          height: 2400,
          transform: 'rotate(18deg)',
          background: `linear-gradient(90deg, transparent, ${C.cyan}55, rgba(255,255,255,0.5), ${C.crimson}44, transparent)`,
          opacity: o,
          filter: 'blur(10px)',
        }}
      />
    </AbsoluteFill>
  );
};

/** Glowing logo emblem (abstract, not the official logo artwork) */
const Emblem: React.FC<{ size?: number }> = ({ size = 360 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <svg width={size} height={size} viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="emb" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={C.crimson} />
            <stop offset="1" stopColor={C.cyan} />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="92" stroke="url(#emb)" strokeWidth="2" fill="none" strokeDasharray="420 160" transform={`rotate(${frame * 2} 100 100)`} />
        <circle cx="100" cy="100" r="80" stroke={C.cyan} strokeOpacity="0.5" strokeWidth="1.5" fill="none" strokeDasharray="6 10" transform={`rotate(${-frame * 1.2} 100 100)`} />
        <circle cx="100" cy="100" r="68" fill="rgba(8,25,38,0.85)" stroke={C.crimson} strokeOpacity="0.6" strokeWidth="2" />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: size * 0.2,
          color: C.white,
          textShadow: `0 0 20px ${C.crimson}, 0 0 40px ${C.crimson}88`,
          paddingBottom: size * 0.03,
        }}
      >
        اليقين
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Scenes                                                              */
/* ------------------------------------------------------------------ */

/* 1 — Institute intro */
const SceneIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useSpring(4, { damping: 12 });
  const t1 = fadeIn(frame, 22);
  const t2 = fadeIn(frame, 34);
  const t3 = fadeIn(frame, 46);
  const shine = interpolate(frame, [30, 70], [-120, 220], clamp);
  return (
    <SceneWrap dur={SCENES.intro[1]}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', direction: 'rtl', fontFamily: FONT }}>
        <div style={{ transform: `scale(${s}) rotate(${(1 - s) * -40}deg)`, marginBottom: 40 }}>
          <Emblem />
        </div>
        <div
          style={{
            fontSize: 92,
            fontWeight: 900,
            color: C.white,
            opacity: t1,
            transform: `translateY(${(1 - t1) * 40}px)`,
            backgroundImage: `linear-gradient(100deg, #fff 0%, #fff ${shine - 20}%, ${C.cyan} ${shine}%, #fff ${shine + 20}%, #fff 100%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 22px rgba(69,220,242,0.45))',
          }}
        >
          معهد اليقين الدولي
        </div>
        <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 6, color: C.cyan, direction: 'ltr', opacity: t2, marginTop: 6 }}>
          ALYAQIN INTERNATIONAL INSTITUTE
        </div>
        <div
          style={{
            marginTop: 40,
            padding: '12px 36px',
            borderRadius: 50,
            border: `1.5px solid ${C.crimson}aa`,
            background: `${C.maroon}55`,
            color: C.white,
            fontSize: 34,
            fontWeight: 700,
            opacity: t3,
            transform: `scale(${0.8 + 0.2 * t3})`,
          }}
        >
          محافظة الظاهرة • ولاية عبري
        </div>
      </AbsoluteFill>
    </SceneWrap>
  );
};

/* 2 — Hook question with floating glass cards */
const SceneQuestion: React.FC = () => {
  const frame = useCurrentFrame();
  const cards = [
    { x: -270, y: -120, r: -14, icon: Icon.doc, d: 0 },
    { x: 250, y: -150, r: 12, icon: Icon.briefcase, d: 4 },
    { x: -240, y: 170, r: 10, icon: Icon.user, d: 8 },
    { x: 260, y: 160, r: -10, icon: Icon.mail, d: 12 },
  ];
  const q = useSpring(6, { damping: 9 });
  const pulse = 1 + 0.04 * Math.sin(frame / 6);
  const chart = interpolate(frame, [30, 75], [0, 1], { ...clamp, easing: ease });
  return (
    <SceneWrap dur={SCENES.question[1]}>
      {/* Big glowing question mark */}
      <div
        style={{
          position: 'absolute',
          top: 170,
          width: '100%',
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 260,
          lineHeight: 1,
          color: C.crimson,
          transform: `scale(${q * pulse})`,
          textShadow: `0 0 40px ${C.crimson}, 0 0 90px ${C.crimson}88`,
        }}
      >
        ؟
      </div>
      {/* floating cards */}
      <div style={{ position: 'absolute', left: 540, top: 820 }}>
        {cards.map((c, i) => {
          const sp = spring({ frame: frame - c.d, fps: 30, config: { damping: 15, stiffness: 90 } });
          const fx = c.x * 2.2 * (1 - sp) + c.x;
          const fy = c.y * 2.2 * (1 - sp) + c.y + Math.sin((frame + i * 20) / 18) * 10;
          const Ic = c.icon;
          return (
            <div
              key={i}
              style={{
                ...glass,
                position: 'absolute',
                width: 300,
                height: 200,
                left: fx - 150,
                top: fy - 100,
                transform: `rotate(${c.r + Math.sin((frame + i * 9) / 25) * 3}deg)`,
                opacity: sp,
                padding: 24,
              }}
            >
              <div style={{ display: 'flex', gap: 8 }}>
                {[C.crimson, C.gold, C.cyan].map((col) => (
                  <span key={col} style={{ width: 12, height: 12, borderRadius: 6, background: col, opacity: 0.8 }} />
                ))}
              </div>
              <div style={{ position: 'absolute', left: 30, bottom: 30 }}>
                <Ic size={60} color={i % 2 ? C.crimson : C.cyan} />
              </div>
              <div style={{ position: 'absolute', right: 26, top: 60, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
                {[130, 90, 110].map((wd, k) => (
                  <span key={k} style={{ width: wd, height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.25)' }} />
                ))}
              </div>
            </div>
          );
        })}
        {/* center growth chart card */}
        <div
          style={{
            ...glass,
            position: 'absolute',
            width: 380,
            height: 260,
            left: -190,
            top: -130,
            opacity: fadeIn(frame, 20),
            transform: `scale(${0.7 + 0.3 * fadeIn(frame, 20)})`,
            border: `2px solid ${C.cyan}66`,
            boxShadow: `0 0 50px ${C.cyan}44, 0 30px 60px rgba(0,0,0,0.5)`,
          }}
        >
          <svg width="380" height="260" viewBox="0 0 380 260">
            {[0, 1, 2, 3].map((k) => (
              <rect key={k} x={50 + k * 75} y={200 - (k + 1) * 35 * chart} width="40" height={(k + 1) * 35 * chart} rx="6" fill={k === 3 ? C.crimson : C.cyan} opacity={k === 3 ? 0.9 : 0.35} />
            ))}
            <path
              d="M40 200 L110 160 L180 170 L250 110 L330 50"
              stroke={C.cyan}
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="400"
              strokeDashoffset={400 * (1 - chart)}
              style={{ filter: `drop-shadow(0 0 8px ${C.cyan})` }}
            />
            <circle cx="330" cy="50" r={10 * chart} fill={C.white} />
          </svg>
        </div>
      </div>
      <Caption words={w('هل تريد زيادة فرصتك الوظيفية؟', { 'فرصتك': C.cyan, 'الوظيفية؟': C.crimson })} start={14} step={6} />
    </SceneWrap>
  );
};

/* 3 — Computer-skills orb with orbiting tools */
const SceneSkills: React.FC = () => {
  const frame = useCurrentFrame();
  const core = useSpring(0, { damping: 11 });
  const nodes = [
    { el: <AppTile letter="W" color="#2b6fe0" size={92} /> },
    { el: <AppTile letter="X" color="#1f9d55" size={92} /> },
    { el: <AppTile letter="P" color="#e2572b" size={92} /> },
    { el: <IconBubble><Icon.globe size={50} color={C.cyan} /></IconBubble> },
    { el: <IconBubble color={C.crimson}><Icon.mail size={48} color={C.crimson} /></IconBubble> },
    { el: <IconBubble><Icon.cloud size={50} color={C.cyan} /></IconBubble> },
  ];
  const R = 330;
  const cx = 540;
  const cy = 760;
  const rot = frame * 0.6;
  return (
    <SceneWrap dur={SCENES.skills[1]}>
      {/* orbit rings */}
      <svg width="1080" height="1500" style={{ position: 'absolute', left: 0, top: 0 }}>
        <circle cx={cx} cy={cy} r={R} stroke={C.cyan} strokeOpacity={0.25 * core} strokeWidth="2" fill="none" strokeDasharray="8 14" />
        <circle cx={cx} cy={cy} r={R + 60} stroke={C.crimson} strokeOpacity={0.18 * core} strokeWidth="1.5" fill="none" />
        {nodes.map((_, i) => {
          const a = ((i / nodes.length) * 360 + rot) * (Math.PI / 180);
          const p = fadeIn(frame, 12 + i * 5, 12);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={cx + Math.cos(a) * R * p}
              y2={cy + Math.sin(a) * R * p}
              stroke={i % 2 ? C.crimson : C.cyan}
              strokeOpacity="0.5"
              strokeWidth="2"
            />
          );
        })}
      </svg>
      {/* core */}
      <div
        style={{
          position: 'absolute',
          left: cx - 170,
          top: cy - 170,
          width: 340,
          height: 340,
          borderRadius: '50%',
          transform: `scale(${core})`,
          background: 'radial-gradient(circle at 40% 35%, #15506a, #071a26 70%)',
          border: `4px solid ${C.cyan}`,
          boxShadow: `0 0 60px ${C.cyan}aa, 0 0 140px ${C.cyan}55, inset 0 0 50px ${C.cyan}55`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT,
        }}
      >
        <Icon.laptop size={110} color={C.white} stroke={1.6} />
        <div style={{ color: C.white, fontWeight: 800, fontSize: 40, marginTop: 4 }}>الحاسب الآلي</div>
      </div>
      {nodes.map((n, i) => {
        const a = ((i / nodes.length) * 360 + rot) * (Math.PI / 180);
        const sp = spring({ frame: frame - (14 + i * 5), fps: 30, config: { damping: 10 } });
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: cx + Math.cos(a) * R - 48,
              top: cy + Math.sin(a) * R - 48,
              transform: `scale(${sp})`,
            }}
          >
            {n.el}
          </div>
        );
      })}
      <Caption
        words={w('اجعل مهارات الحاسب الآلي نقطة تميّزك.', { 'مهارات': C.cyan, 'تميّزك.': C.crimson })}
        start={20}
        step={5}
      />
    </SceneWrap>
  );
};

/* 4 — Program title reveal */
const SceneTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const pill = useSpring(4);
  const lines = ['أساسيات', 'الحاسب الآلي', 'الشاملة'];
  const border = interpolate(frame, [40, 80], [0, 1], { ...clamp, easing: ease });
  return (
    <SceneWrap dur={SCENES.title[1]}>
      <AbsoluteFill style={{ alignItems: 'center', fontFamily: FONT, direction: 'rtl' }}>
        <div
          style={{
            marginTop: 300,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            padding: '16px 44px',
            borderRadius: 60,
            background: `linear-gradient(90deg, ${C.navy}, #1a4aa0)`,
            border: `2px solid ${C.cyan}66`,
            boxShadow: `0 0 40px ${C.cyan}44`,
            transform: `scale(${pill})`,
            color: C.white,
            fontSize: 46,
            fontWeight: 800,
          }}
        >
          <Icon.laptop size={52} color={C.white} />
          <span style={{ width: 2, height: 44, background: 'rgba(255,255,255,0.4)' }} />
          برنامج تدريبي
        </div>
        <div style={{ position: 'relative', marginTop: 70, padding: '50px 70px', ...glass, borderRadius: 50, background: 'rgba(255,255,255,0.05)' }}>
          {/* drawn accent brackets (like the poster) */}
          <div style={{ position: 'absolute', top: -2, right: 40, height: 5, width: `${border * 55}%`, background: C.crimson, borderRadius: 3, boxShadow: `0 0 16px ${C.crimson}` }} />
          <div style={{ position: 'absolute', bottom: -2, left: 40, height: 5, width: `${border * 55}%`, background: C.crimson, borderRadius: 3, boxShadow: `0 0 16px ${C.crimson}` }} />
          {lines.map((l, i) => {
            const st = 14 + i * 9;
            const p = interpolate(frame, [st, st + 18], [0, 1], { ...clamp, easing: ease });
            return (
              <div key={l} style={{ overflow: 'hidden', textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: i === 1 ? 150 : 140,
                    fontWeight: 900,
                    lineHeight: 1.3,
                    transform: `translateY(${(1 - p) * 110}%)`,
                    color: i === 1 ? C.cyan : C.white,
                    textShadow: i === 1 ? `0 0 40px ${C.cyan}99` : '0 0 30px rgba(255,255,255,0.35)',
                  }}
                >
                  {l}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <Caption words={w('برنامج تدريبي عملي يؤسّسك من الصفر.', { 'عملي': C.cyan, 'الصفر.': C.crimson })} start={45} step={5} />
    </SceneWrap>
  );
};

/* 5 — Typing prompt + module cards grid */
const SceneModules: React.FC = () => {
  const frame = useCurrentFrame();
  const full = 'أبغى أطوّر مهاراتي في الحاسب الآلي';
  const chars = Math.floor(interpolate(frame, [8, 38], [0, full.length], clamp));
  const typed = full.slice(0, chars);
  const cursor = Math.floor(frame / 8) % 2 === 0 && chars < full.length;
  const line = interpolate(frame, [40, 52], [0, 1], clamp);
  const mods = [
    { tile: <AppTile letter="W" color="#2b6fe0" size={70} />, t: 'معالجة النصوص', vis: 'lines' },
    { tile: <AppTile letter="X" color="#1f9d55" size={70} />, t: 'الجداول والبيانات', vis: 'bars' },
    { tile: <AppTile letter="P" color="#e2572b" size={70} />, t: 'العروض التقديمية', vis: 'slide' },
    { tile: <IconBubble size={70}><Icon.globe size={40} color={C.cyan} /></IconBubble>, t: 'الإنترنت والبريد', vis: 'curve' },
  ];
  return (
    <SceneWrap dur={SCENES.modules[1]}>
      {/* chat input */}
      <div
        style={{
          ...glass,
          position: 'absolute',
          left: 60,
          right: 60,
          top: 300,
          height: 120,
          borderRadius: 70,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px 0 40px',
          direction: 'rtl',
          fontFamily: FONT,
          fontSize: 42,
          fontWeight: 700,
          color: C.white,
          opacity: fadeIn(frame, 0, 10),
        }}
      >
        <span>
          {typed}
          <span style={{ opacity: cursor ? 1 : 0, color: C.cyan }}>|</span>
        </span>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: C.crimson,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 30px ${C.crimson}`,
            transform: `scale(${1 + 0.15 * interpolate(frame, [38, 42, 48], [0, 1, 0], clamp)})`,
          }}
        >
          <Icon.send size={40} color={C.white} />
        </div>
      </div>
      {/* connector */}
      <div style={{ position: 'absolute', left: 539, top: 420, width: 3, height: 80 * line, background: C.cyan, boxShadow: `0 0 12px ${C.cyan}` }} />
      <div style={{ position: 'absolute', left: 120, right: 120, top: 500, height: 3, transform: `scaleX(${line})`, background: `${C.cyan}88` }} />
      {/* grid */}
      <div style={{ position: 'absolute', left: 60, right: 60, top: 530, display: 'flex', flexWrap: 'wrap', gap: 30, direction: 'rtl' }}>
        {mods.map((m, i) => {
          const sp = spring({ frame: frame - (48 + i * 6), fps: 30, config: { damping: 13 } });
          const draw = interpolate(frame, [60 + i * 6, 95 + i * 6], [0, 1], { ...clamp, easing: ease });
          return (
            <div
              key={i}
              style={{
                ...glass,
                width: 465,
                height: 370,
                padding: 30,
                transform: `translateY(${(1 - sp) * 80}px) scale(${0.85 + 0.15 * sp})`,
                opacity: Math.min(1, sp * 1.4),
                fontFamily: FONT,
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                {m.tile}
                <div style={{ color: C.white, fontWeight: 800, fontSize: 33, whiteSpace: 'nowrap' }}>{m.t}</div>
              </div>
              <div style={{ position: 'absolute', left: 30, right: 30, bottom: 30, height: 170, borderRadius: 20, background: 'rgba(0,0,0,0.25)', overflow: 'hidden' }}>
                {m.vis === 'lines' && (
                  <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-end' }}>
                    {[1, 0.8, 0.95, 0.6].map((v, k) => (
                      <span key={k} style={{ height: 14, width: `${v * 100 * draw}%`, borderRadius: 7, background: k === 0 ? C.cyan : 'rgba(255,255,255,0.3)' }} />
                    ))}
                  </div>
                )}
                {m.vis === 'bars' && (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: '100%', padding: '18px 26px', boxSizing: 'border-box' }}>
                    {[0.4, 0.7, 0.5, 0.9, 0.65].map((v, k) => (
                      <span key={k} style={{ flex: 1, height: `${v * 100 * draw}%`, borderRadius: 6, background: k === 3 ? C.crimson : C.cyan, opacity: k === 3 ? 1 : 0.6 }} />
                    ))}
                  </div>
                )}
                {m.vis === 'slide' && (
                  <div style={{ display: 'flex', gap: 14, padding: 20, height: '100%', boxSizing: 'border-box', direction: 'ltr' }}>
                    <div style={{ flex: 2, borderRadius: 12, border: `2px solid ${C.crimson}`, opacity: draw, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ width: `${60 * draw}%`, height: 14, borderRadius: 7, background: C.crimson }} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[0, 1, 2].map((k) => (
                        <span key={k} style={{ flex: 1, borderRadius: 8, background: 'rgba(255,255,255,0.18)', opacity: interpolate(draw, [k * 0.25, k * 0.25 + 0.3], [0, 1], clamp) }} />
                      ))}
                    </div>
                  </div>
                )}
                {m.vis === 'curve' && (
                  <svg width="100%" height="100%" viewBox="0 0 400 170">
                    <path d="M20 140 C 120 140, 140 30, 200 30 S 290 140, 380 140" stroke={C.cyan} strokeWidth="6" fill="none" strokeDasharray="480" strokeDashoffset={480 * (1 - draw)} />
                    <circle cx="200" cy="30" r={12 * draw} fill={C.crimson} />
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <Caption
        words={w('تدريب عملي على أهم البرامج المكتبية والإنترنت.', { 'البرامج': C.cyan, 'المكتبية': C.cyan, 'والإنترنت.': C.crimson })}
        start={56}
        step={4}
        size={50}
      />
    </SceneWrap>
  );
};

/* 6 — Accredited certificate badge */
const Badge: React.FC<{ size?: number }> = ({ size = 520 }) => {
  const frame = useCurrentFrame();
  const pts = new Array(48)
    .fill(0)
    .map((_, i) => {
      const a = (i / 48) * Math.PI * 2;
      const r = i % 2 ? 92 : 100;
      return `${100 + Math.cos(a) * r},${100 + Math.sin(a) * r}`;
    })
    .join(' ');
  const check = interpolate(frame, [22, 40], [0, 1], clamp);
  return (
    <svg width={size} height={size} viewBox="-10 -10 220 220">
      <defs>
        <radialGradient id="bg" cx="40%" cy="35%">
          <stop offset="0" stopColor="#2f6ee0" />
          <stop offset="1" stopColor="#0d2a66" />
        </radialGradient>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe08a" />
          <stop offset="0.5" stopColor={C.gold} />
          <stop offset="1" stopColor="#b9801a" />
        </linearGradient>
      </defs>
      <polygon points={pts} fill="url(#bg)" stroke="url(#gold)" strokeWidth="3" transform={`rotate(${frame * 0.4} 100 100)`} />
      <circle cx="100" cy="100" r="72" fill="none" stroke="url(#gold)" strokeWidth="4" />
      <circle cx="100" cy="100" r="64" fill="none" stroke="url(#gold)" strokeWidth="1" strokeDasharray="3 4" />
      <circle cx="100" cy="72" r="20" fill="url(#gold)" />
      <path d="M90 72 l7 7 l14 -15" stroke="#0d2a66" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="40" strokeDashoffset={40 * (1 - check)} />
      {[0, 1, 2, 3, 4].map((k) => (
        <text key={k} x={72 + k * 14} y="152" fontSize="12" fill={C.gold} opacity={interpolate(frame, [40 + k * 3, 46 + k * 3], [0, 1], clamp)}>
          ★
        </text>
      ))}
    </svg>
  );
};

const SceneCert: React.FC = () => {
  const frame = useCurrentFrame();
  const drop = spring({ frame, fps: 30, config: { damping: 9, stiffness: 110 } });
  const ribbon = interpolate(frame, [14, 30], [0, 1], { ...clamp, easing: ease });
  const shine = interpolate(frame, [36, 70], [-60, 160], clamp);
  const pill = useSpring(52);
  const rays = interpolate(frame, [10, 40], [0, 1], clamp);
  return (
    <SceneWrap dur={SCENES.cert[1]}>
      {/* light rays */}
      <div
        style={{
          position: 'absolute',
          left: 540 - 600,
          top: 590 - 600,
          width: 1200,
          height: 1200,
          opacity: 0.35 * rays,
          transform: `rotate(${frame * 0.5}deg)`,
          background: `repeating-conic-gradient(from 0deg, ${C.gold}55 0deg 6deg, transparent 6deg 22deg)`,
          maskImage: 'radial-gradient(circle, black 0%, transparent 60%)',
          WebkitMaskImage: 'radial-gradient(circle, black 0%, transparent 60%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 540 - 260,
          top: 330,
          transform: `translateY(${(1 - drop) * -500}px) scale(${0.6 + 0.4 * drop}) rotate(${(1 - drop) * 30}deg)`,
          filter: `drop-shadow(0 0 40px ${C.gold}66)`,
        }}
      >
        <Badge />
      </div>
      {/* ribbon */}
      <div
        style={{
          position: 'absolute',
          left: 110,
          right: 110,
          top: 840,
          padding: '20px 0',
          textAlign: 'center',
          direction: 'rtl',
          fontFamily: FONT,
          fontWeight: 900,
          color: C.white,
          fontSize: 56,
          lineHeight: 1.3,
          background: `linear-gradient(180deg, #d2215a, ${C.maroon})`,
          clipPath: `inset(0 ${(1 - ribbon) * 50}% 0 ${(1 - ribbon) * 50}%)`,
          boxShadow: `0 20px 40px rgba(0,0,0,0.5)`,
          border: `3px solid ${C.gold}`,
          borderRadius: 18,
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${shine}%`, width: 120, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)', transform: 'skewX(-20deg)' }} />
        شهادة معتمدة
        <br />
        من وزارة العمل
      </div>
      {/* target audience pill */}
      <div
        style={{
          ...glass,
          position: 'absolute',
          left: 220,
          right: 220,
          top: 1150,
          height: 120,
          borderRadius: 70,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 22,
          direction: 'rtl',
          fontFamily: FONT,
          fontSize: 48,
          fontWeight: 800,
          color: C.white,
          transform: `scale(${pill})`,
          border: `2px solid ${C.cyan}66`,
        }}
      >
        <Icon.user size={58} color={C.crimson} />
        للباحثين عن عمل
      </div>
      <Caption words={w('شهادة معتمدة من وزارة العمل للباحثين عن عمل.', { 'معتمدة': C.gold, 'وزارة': C.cyan, 'العمل': C.cyan })} start={30} step={5} size={52} />
    </SceneWrap>
  );
};

/* 7 — Course details + price counter */
const SceneDetails: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = [
    { icon: Icon.calendar, label: 'تاريخ البدء', value: '22/11/2026', col: C.crimson },
    { icon: Icon.clock, label: 'الوقت', value: '4:30 - 6:30 مساءً', col: C.cyan },
    { icon: Icon.hourglass, label: 'المدة', value: '3 أسابيع', col: C.gold },
  ];
  const priceIn = spring({ frame: frame - 62, fps: 30, config: { damping: 10, stiffness: 120 } });
  const count = Math.round(interpolate(frame, [66, 100], [0, 130], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const glow = interpolate(frame, [100, 106, 130], [0, 1, 0.4], clamp);
  return (
    <SceneWrap dur={SCENES.details[1]}>
      <div style={{ position: 'absolute', left: 70, right: 70, top: 260, display: 'flex', flexDirection: 'column', gap: 26, direction: 'rtl', fontFamily: FONT }}>
        {rows.map((r, i) => {
          const sp = spring({ frame: frame - (6 + i * 9), fps: 30, config: { damping: 15 } });
          const Ic = r.icon;
          return (
            <div
              key={i}
              style={{
                ...glass,
                height: 150,
                display: 'flex',
                alignItems: 'center',
                padding: '0 36px',
                gap: 30,
                transform: `translateX(${(1 - sp) * -700}px)`,
                opacity: sp,
                borderRight: `6px solid ${r.col}`,
              }}
            >
              <IconBubble size={96} color={r.col}>
                <Ic size={50} color={r.col} />
              </IconBubble>
              <div>
                <div style={{ color: C.dim, fontSize: 30, fontWeight: 600 }}>{r.label}</div>
                <div style={{ color: C.white, fontSize: 56, fontWeight: 900, lineHeight: 1.2 }}>{r.value}</div>
              </div>
            </div>
          );
        })}
      </div>
      {/* price */}
      <div
        style={{
          position: 'absolute',
          left: 170,
          right: 170,
          top: 830,
          height: 400,
          borderRadius: 50,
          background: `linear-gradient(150deg, #c81d52, ${C.maroon} 60%, #5a0a24)`,
          border: `3px dashed rgba(255,255,255,0.45)`,
          outline: `4px solid ${C.gold}`,
          outlineOffset: 10,
          boxShadow: `0 0 ${40 + glow * 80}px ${C.crimson}aa, 0 40px 80px rgba(0,0,0,0.5)`,
          transform: `scale(${priceIn}) rotate(${(1 - priceIn) * -8}deg)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT,
          direction: 'rtl',
        }}
      >
        <div style={{ color: C.white, fontWeight: 900, fontSize: 210, lineHeight: 1, textShadow: `0 0 ${20 + glow * 40}px rgba(255,255,255,0.6)`, transform: `scale(${1 + glow * 0.08})` }}>
          {count}
        </div>
        <div style={{ color: C.gold, fontWeight: 800, fontSize: 54, marginTop: 10 }}>ريال عماني فقط</div>
      </div>
      <Caption words={w('كل هذا بـ 130 ريالاً عمانياً فقط!', { '130': C.gold, 'فقط!': C.crimson })} start={70} step={5} />
    </SceneWrap>
  );
};

/* 8 — Call to action */
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const l1 = useSpring(4, { damping: 10 });
  const l2 = fadeIn(frame, 24, 16);
  const l3 = spring({ frame: frame - 48, fps: 30, config: { damping: 9 } });
  const under = interpolate(frame, [60, 85], [0, 1], { ...clamp, easing: ease });
  const lap = useSpring(0, { damping: 13 });
  return (
    <SceneWrap dur={SCENES.cta[1]}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', direction: 'rtl', fontFamily: FONT, textAlign: 'center', paddingBottom: 120 }}>
        <div style={{ ...glass, borderRadius: '50%', width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${lap})`, border: `2px solid ${C.gold}88`, boxShadow: `0 0 60px ${C.gold}55` }}>
          <Icon.laptop size={120} color={C.gold} stroke={1.6} />
        </div>
        <div style={{ marginTop: 60, fontSize: 110, fontWeight: 900, color: C.gold, transform: `scale(${l1})`, textShadow: `0 0 40px ${C.gold}88` }}>باحث عن عمل؟</div>
        <div style={{ marginTop: 30, fontSize: 64, fontWeight: 800, color: C.white, opacity: l2, transform: `translateY(${(1 - l2) * 30}px)` }}>
          لا تفوّت فرصة تطوير مهاراتك
        </div>
        <div style={{ marginTop: 40, position: 'relative', transform: `scale(${l3})` }}>
          <div style={{ fontSize: 96, fontWeight: 900, color: C.white, textShadow: `0 0 30px ${C.crimson}, 0 0 70px ${C.crimson}88` }}>
            فالمهارات <span style={{ color: C.cyan, textShadow: `0 0 30px ${C.cyan}` }}>تصنع الفرق</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, marginTop: 4, background: `linear-gradient(90deg, ${C.cyan}, ${C.crimson})`, width: `${under * 100}%`, boxShadow: `0 0 20px ${C.crimson}` }} />
        </div>
      </AbsoluteFill>
    </SceneWrap>
  );
};

/* 9 — Outro with contact info */
const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const dur = SCENES.outro[1];
  const em = useSpring(0, { damping: 12 });
  const rows = [
    { icon: Icon.pin, text: 'ولاية عبري / مركز المدينة', col: C.crimson },
    { icon: Icon.phone, text: '91960600', col: C.cyan },
    { icon: Icon.camera, text: 'Alyaqin_institute', col: C.gold },
  ];
  const fadeOut = interpolate(frame, [dur - 25, dur], [1, 0], clamp);
  const handle = fadeIn(frame, 60, 20);
  const flicker = frame > 60 && frame < 72 ? (frame % 3 === 0 ? 0.3 : 1) : 1;
  return (
    <SceneWrap dur={dur} noExit>
      <AbsoluteFill style={{ opacity: fadeOut, alignItems: 'center', fontFamily: FONT, direction: 'rtl' }}>
        <div style={{ marginTop: 230, transform: `scale(${em})` }}>
          <Emblem size={260} />
        </div>
        <div style={{ fontSize: 76, fontWeight: 900, color: C.white, marginTop: 20, opacity: fadeIn(frame, 10), textShadow: `0 0 30px ${C.cyan}66` }}>معهد اليقين الدولي</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: C.cyan, opacity: fadeIn(frame, 16) }}>سجّل الآن واستفسر عبر</div>
        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 22, width: 820 }}>
          {rows.map((r, i) => {
            const sp = spring({ frame: frame - (20 + i * 7), fps: 30, config: { damping: 14 } });
            const Ic = r.icon;
            return (
              <div
                key={i}
                style={{
                  ...glass,
                  height: 116,
                  borderRadius: 60,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 26,
                  padding: '0 30px',
                  transform: `translateY(${(1 - sp) * 60}px)`,
                  opacity: sp,
                }}
              >
                <IconBubble size={80} color={r.col}>
                  <Ic size={42} color={r.col} />
                </IconBubble>
                <span style={{ color: C.white, fontSize: 48, fontWeight: 800, direction: i === 0 ? 'rtl' : 'ltr' }}>{r.text}</span>
              </div>
            );
          })}
        </div>
        <div style={{ position: 'absolute', top: 1500, textAlign: 'center', opacity: handle * flicker }}>
          <div style={{ fontSize: 78, fontWeight: 900, color: '#bff6ff', direction: 'ltr', textShadow: `0 0 20px ${C.cyan}, 0 0 50px ${C.cyan}, 0 0 90px ${C.cyan}88` }}>
            @Alyaqin_institute
          </div>
          <div style={{ height: 6, margin: '10px auto 0', borderRadius: 3, width: `${handle * 70}%`, background: C.crimson, boxShadow: `0 0 20px ${C.crimson}` }} />
        </div>
      </AbsoluteFill>
    </SceneWrap>
  );
};

/* ------------------------------------------------------------------ */
/* Main composition                                                    */
/* ------------------------------------------------------------------ */
export const AlyaqinPromo: React.FC = () => {
  const list: [keyof typeof SCENES, React.FC][] = [
    ['intro', SceneIntro],
    ['question', SceneQuestion],
    ['skills', SceneSkills],
    ['title', SceneTitle],
    ['modules', SceneModules],
    ['cert', SceneCert],
    ['details', SceneDetails],
    ['cta', SceneCTA],
    ['outro', SceneOutro],
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg2 }}>
      <Background />
      {list.map(([k, Comp]) => (
        <Sequence key={k} from={SCENES[k][0]} durationInFrames={SCENES[k][1]}>
          <Comp />
        </Sequence>
      ))}
      {list.slice(1).map(([k]) => (
        <Sequence key={`f-${k}`} from={SCENES[k][0] - 2} durationInFrames={14}>
          <CutFlash />
        </Sequence>
      ))}
      <Chrome />
      <Audio src={staticFile('soundtrack.wav')} volume={0.9} />
    </AbsoluteFill>
  );
};
